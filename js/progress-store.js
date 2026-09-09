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

export function markLessonVisited(lessonId) {
  const progress = getProgress();
  const lesson = progress.lessons[lessonId] || {
    completed: false,
    firstVisited: new Date().toISOString(),
    quizAttempts: 0,
    quizBest: null,
  };
  lesson.lastVisited = new Date().toISOString();
  progress.lessons[lessonId] = lesson;
  return saveProgress(progress);
}

function upsertReviewItem(progress, itemKey, { lessonId, question, correct }) {
  const existing = progress.review[itemKey];
  const box = existing ? (correct ? Math.min(existing.box + 1, INTERVAL_DAYS.length - 1) : 0) : 0;
  const today = todayStr();
  progress.review[itemKey] = {
    lessonId,
    question,
    box,
    stage: STAGE_BY_BOX[box],
    nextReviewDate: addDays(today, INTERVAL_DAYS[box]),
    lastSeen: today,
    timesSeen: (existing?.timesSeen || 0) + 1,
    timesCorrect: (existing?.timesCorrect || 0) + (correct ? 1 : 0),
  };
}

/**
 * Record the result of a lesson's scored quiz: updates completion,
 * quiz history, the streak, and — because scored responses carry full
 * question snapshots (see js/quiz-engine.js) — schedules each answered
 * item for spaced review.
 *
 * @param {string} lessonId
 * @param {{correct:number, total:number, mode:string, responses?:object[]}} result
 */
export function recordQuizResult(lessonId, result) {
  const progress = getProgress();
  const lesson = progress.lessons[lessonId] || {
    completed: false,
    firstVisited: new Date().toISOString(),
    quizAttempts: 0,
    quizBest: null,
  };

  lesson.lastVisited = new Date().toISOString();

  if (result.mode === "quiz") {
    lesson.completed = true;
    lesson.quizAttempts += 1;
    if (!lesson.quizBest || result.correct / result.total > lesson.quizBest.correct / lesson.quizBest.total) {
      lesson.quizBest = { correct: result.correct, total: result.total };
    }

    progress.quizHistory.push({
      lessonId,
      date: new Date().toISOString(),
      correct: result.correct,
      total: result.total,
    });
    if (progress.quizHistory.length > MAX_QUIZ_HISTORY) {
      progress.quizHistory = progress.quizHistory.slice(-MAX_QUIZ_HISTORY);
    }

    recordActivity(progress);

    if (Array.isArray(result.responses)) {
      result.responses.forEach((r) => {
        if (!r.id) return;
        upsertReviewItem(progress, `${lessonId}:${r.id}`, {
          lessonId,
          question: r.question,
          correct: r.correct,
        });
      });
    }
  }

  progress.lessons[lessonId] = lesson;
  return saveProgress(progress);
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
      lessonId: existing.lessonId,
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
    streak: progress.streak,
    quizCount,
    quizAverage,
    reviewCounts,
    reviewTotal: reviewItems.length,
    dueToday: getDueReviewItems(9999).length,
    hasAnyActivity: lessonsCompleted > 0 || quizCount > 0 || reviewItems.length > 0,
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
