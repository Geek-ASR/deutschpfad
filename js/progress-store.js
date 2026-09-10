/**
 * Local progress storage. Everything here lives in the browser's
 * localStorage, under one namespaced key — nothing is ever sent to a
 * server, because there is no server. See docs/local-storage.md for the
 * schema and docs/roadmap.md Phase 3 for what this is (and isn't) meant
 * to do.
 *
 * Design choices worth knowing before editing this file:
 *  - One JSON blob under one key, not many keys — makes export/import
 *    trivial (the whole thing IS the exported file) and avoids partial-
 *    write inconsistency between related fields.
 *  - A five-box, date-based spaced-review scheduler (Leitner-style),
 *    intervals 1/3/7/14/30 days, mapped to four learner-facing stages:
 *    new (box 0), learning (boxes 1–2), review (box 3), mastered (box 4).
 *  - Review items are only created from *scored* quiz results, not
 *    practice/retrieve — practice stays low-stakes and doesn't feed the
 *    scheduler, so what gets scheduled is predictable: "what you were
 *    actually assessed on."
 *  - A review item stores a full question snapshot (type, prompt,
 *    choices/acceptedAnswers/etc.) so a later review session can hand it
 *    straight back to js/quiz-engine.js without re-fetching lesson data.
 */

const STORAGE_KEY = "deutschpfad:progress:v1";
const SCHEMA_VERSION = 1;
const INTERVAL_DAYS = [1, 3, 7, 14, 30];
const STAGE_BY_BOX = ["new", "learning", "learning", "review", "mastered"];
const MAX_QUIZ_HISTORY = 50;

function todayStr(date = new Date()) {
  // Local calendar date, not UTC — a streak should follow the learner's
  // own day, not a server's.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return todayStr(date);
}

function defaultProgress() {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    settings: {},
    streak: { current: 0, longest: 0, lastActiveDate: null },
    lessons: {},
    stories: {},
    scenarios: {},
    listening: {},
    vocabPractice: {},
    exams: {},
    savedWords: {},
    review: {},
    quizHistory: [],
  };
}

function isPlausibleProgress(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.schemaVersion === "number" &&
    typeof obj.lessons === "object" &&
    typeof obj.review === "object" &&
    Array.isArray(obj.quizHistory)
  );
}

function storageAvailable() {
  try {
    const testKey = "deutschpfad:storage-test";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** Read current progress, repairing/defaulting on any corruption. */
export function getProgress() {
  if (!storageAvailable()) return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    if (!isPlausibleProgress(parsed)) return defaultProgress();
    // Fill in any fields an older/partial blob might be missing rather
    // than discarding real data over one absent key.
    return { ...defaultProgress(), ...parsed };
  } catch {
    return defaultProgress();
  }
}

function saveProgress(progress) {
  progress.updatedAt = new Date().toISOString();
  if (storageAvailable()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
  return progress;
}

function recordActivity(progress, dateStr = todayStr()) {
  const s = progress.streak;
  if (s.lastActiveDate === dateStr) {
    // already counted today
  } else if (s.lastActiveDate === addDays(dateStr, -1)) {
    s.current += 1;
  } else {
    s.current = 1;
  }
  s.longest = Math.max(s.longest, s.current);
  s.lastActiveDate = dateStr;
}

// Lessons, stories, and scenarios all track the same shape — completion,
// visit timestamps, quiz attempts/best score — just in separate buckets,
// so "lessons completed" (the estimated-level meter) never gets
// inflated by finishing a story or a scenario. `markVisited` and
// `recordActivityResult` are the shared implementation; the exported
// `mark*Visited`/`record*Result` functions per content type are thin,
// clearly-named wrappers over them, kept as the public API so a lesson
// page never has to know or care that "bucket" is a string.
function emptyActivityRecord() {
  return {
    completed: false,
    firstVisited: new Date().toISOString(),
    quizAttempts: 0,
    quizBest: null,
  };
}

function markVisited(bucket, id) {
  const progress = getProgress();
  const record = progress[bucket][id] || emptyActivityRecord();
  record.lastVisited = new Date().toISOString();
  progress[bucket][id] = record;
  return saveProgress(progress);
}

export const markLessonVisited = (lessonId) => markVisited("lessons", lessonId);
export const markStoryVisited = (storyId) => markVisited("stories", storyId);
export const markScenarioVisited = (scenarioId) => markVisited("scenarios", scenarioId);
export const markListeningVisited = (setId) => markVisited("listening", setId);

// `sourceId` is deliberately generic (not `lessonId`): a review item can
// come from a lesson quiz or a story's comprehension quiz — spaced
// review of vocabulary doesn't care which taught it.
function upsertReviewItem(progress, itemKey, { sourceId, question, correct }) {
  const existing = progress.review[itemKey];
  const box = existing ? (correct ? Math.min(existing.box + 1, INTERVAL_DAYS.length - 1) : 0) : 0;
  const today = todayStr();
  progress.review[itemKey] = {
    sourceId,
    question,
    box,
    stage: STAGE_BY_BOX[box],
    nextReviewDate: addDays(today, INTERVAL_DAYS[box]),
    lastSeen: today,
    timesSeen: (existing?.timesSeen || 0) + 1,
    timesCorrect: (existing?.timesCorrect || 0) + (correct ? 1 : 0),
  };
}

function pushQuizHistory(progress, entry) {
  progress.quizHistory.push(entry);
  if (progress.quizHistory.length > MAX_QUIZ_HISTORY) {
    progress.quizHistory = progress.quizHistory.slice(-MAX_QUIZ_HISTORY);
  }
}

function scheduleReviewFromResponses(progress, sourceId, responses) {
  if (!Array.isArray(responses)) return;
  responses.forEach((r) => {
    if (!r.id) return;
    upsertReviewItem(progress, `${sourceId}:${r.id}`, {
      sourceId,
      question: r.question,
      correct: r.correct,
    });
  });
}

/**
 * Record the result of a scored quiz for any content type (lesson,
 * story, scenario, …): updates completion and best score in the given
 * bucket, appends to the shared `quizHistory` activity log, ticks the
 * streak, and — because scored responses carry full question snapshots
 * (see js/quiz-engine.js) — schedules each answered item for spaced
 * review. A no-op for `mode !== "quiz"` (practice/retrieve results
 * aren't meant to be persisted — see the module docstring).
 *
 * @param {string} bucket "lessons" | "stories" | "scenarios" | "listening" | "vocabPractice"
 * @param {string} id
 * @param {{correct:number, total:number, mode:string, responses?:object[]}} result
 */
function recordActivityResult(bucket, id, result) {
  const progress = getProgress();
  const record = progress[bucket][id] || emptyActivityRecord();
  record.lastVisited = new Date().toISOString();

  if (result.mode === "quiz") {
    record.completed = true;
    record.quizAttempts += 1;
    if (!record.quizBest || result.correct / result.total > record.quizBest.correct / record.quizBest.total) {
      record.quizBest = { correct: result.correct, total: result.total };
    }

    pushQuizHistory(progress, {
      contentId: id,
      type: bucket,
      date: new Date().toISOString(),
      correct: result.correct,
      total: result.total,
    });

    recordActivity(progress);
    scheduleReviewFromResponses(progress, id, result.responses);
  }

  progress[bucket][id] = record;
  return saveProgress(progress);
}

export const recordQuizResult = (lessonId, result) => recordActivityResult("lessons", lessonId, result);
export const recordStoryQuizResult = (storyId, result) => recordActivityResult("stories", storyId, result);
export const recordScenarioResult = (scenarioId, result) => recordActivityResult("scenarios", scenarioId, result);
export const recordListeningResult = (setId, result) => recordActivityResult("listening", setId, result);

// The vocabulary bank generates quizzes dynamically (any filtered subset
// of words, not one fixed lesson), so unlike the four wrappers above it
// has no per-content id worth tracking — every session is folded into
// the same "vocabulary-bank" bucket entry. It still ticks the streak,
// appends to quizHistory, and (this is the actual point) schedules
// missed/answered words into the same `review` map lesson quizzes use,
// so a word tested here shows up in the dashboard's due-for-review queue
// alongside anything tested in a lesson. Deliberately NOT folded into
// the "lessons" bucket — that would inflate `lessonsCompleted`, which
// drives the A1-progress meter, with sessions that aren't lessons.
export const recordVocabPracticeResult = (result) => recordActivityResult("vocabPractice", "vocabulary-bank", result);

// Unlike vocabPractice (one open-ended session bucket), a mock exam is
// fixed content with a stable id — same shape as a lesson, just kept
// in its own bucket so a completed exam doesn't count toward
// `lessonsCompleted` (and therefore the A1-progress meter, which is
// specifically "planned A1 *lesson* units complete", not "any activity").
export const recordMockExamResult = (examId, result) => recordActivityResult("exams", examId, result);

/**
 * Save a word for later reference (the reader's Save button) — a plain
 * personal glossary, separate from the spaced-review schedule.
 * @param {string} key stable id, e.g. `${storyId}:${word}`
 * @param {object} entry the glossary entry being saved (german, english, …)
 */
export function saveWord(key, entry) {
  const progress = getProgress();
  progress.savedWords[key] = { ...entry, savedAt: new Date().toISOString() };
  return saveProgress(progress);
}

export function unsaveWord(key) {
  const progress = getProgress();
  delete progress.savedWords[key];
  return saveProgress(progress);
}

export function isWordSaved(key) {
  return Boolean(getProgress().savedWords[key]);
}

export function getSavedWords() {
  return Object.entries(getProgress().savedWords).map(([key, entry]) => ({ key, ...entry }));
}

/** Review items due today or earlier, soonest-due first. */
export function getDueReviewItems(limit = 20) {
  const progress = getProgress();
  const today = todayStr();
  return Object.entries(progress.review)
    .filter(([, item]) => item.nextReviewDate <= today)
    .sort((a, b) => a[1].nextReviewDate.localeCompare(b[1].nextReviewDate))
    .slice(0, limit)
    .map(([itemKey, item]) => ({ itemKey, ...item }));
}

/**
 * Apply the results of a standalone review session (from the dashboard's
 * "Review now") back onto the schedule.
 * @param {{id:string, correct:boolean}[]} responses — id is the itemKey
 */
export function recordReviewSessionResult(responses) {
  const progress = getProgress();
  responses.forEach((r) => {
    const existing = progress.review[r.id];
    if (!existing) return;
    upsertReviewItem(progress, r.id, {
      sourceId: existing.sourceId,
      question: existing.question,
      correct: r.correct,
    });
  });
  recordActivity(progress);
  return saveProgress(progress);
}

/** Aggregate stats for the dashboard — all computed, nothing fabricated. */
export function getStats() {
  const progress = getProgress();
  const reviewItems = Object.values(progress.review);
  const reviewCounts = { new: 0, learning: 0, review: 0, mastered: 0 };
  reviewItems.forEach((item) => {
    reviewCounts[item.stage] = (reviewCounts[item.stage] || 0) + 1;
  });

  const lessonsCompleted = Object.values(progress.lessons).filter((l) => l.completed).length;
  const storiesRead = Object.values(progress.stories).filter((s) => s.completed).length;
  const scenariosCompleted = Object.values(progress.scenarios).filter((s) => s.completed).length;
  const listeningSetsCompleted = Object.values(progress.listening).filter((l) => l.completed).length;
  const examsCompleted = Object.values(progress.exams).filter((e) => e.completed).length;
  const savedWordsCount = Object.keys(progress.savedWords).length;
  const quizCount = progress.quizHistory.length;
  const quizAverage = quizCount
    ? Math.round(
        (100 *
          progress.quizHistory.reduce((sum, q) => sum + q.correct / q.total, 0)) /
          quizCount
      )
    : null;

  return {
    lessonsCompleted,
    storiesRead,
    scenariosCompleted,
    listeningSetsCompleted,
    examsCompleted,
    savedWordsCount,
    streak: progress.streak,
    quizCount,
    quizAverage,
    reviewCounts,
    reviewTotal: reviewItems.length,
    dueToday: getDueReviewItems(9999).length,
    hasAnyActivity:
      lessonsCompleted > 0 ||
      storiesRead > 0 ||
      scenariosCompleted > 0 ||
      listeningSetsCompleted > 0 ||
      examsCompleted > 0 ||
      quizCount > 0 ||
      reviewItems.length > 0 ||
      savedWordsCount > 0,
  };
}

export function exportProgressJSON() {
  return JSON.stringify(getProgress(), null, 2);
}

/**
 * @param {object} obj a parsed JSON object, as produced by exportProgressJSON
 * @returns {{ok: true} | {ok: false, error: string}}
 */
export function importProgressFromObject(obj) {
  if (!isPlausibleProgress(obj)) {
    return { ok: false, error: "That file doesn't look like a Deutschpfad progress export." };
  }
  saveProgress({ ...defaultProgress(), ...obj });
  return { ok: true };
}

export function resetProgress() {
  return saveProgress(defaultProgress());
}
