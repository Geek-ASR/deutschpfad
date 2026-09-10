/**
 * Page script for dashboard.html. Reads/writes js/progress-store.js and
 * renders it — no logic here decides what "mastered" means or how
 * streaks work, that all lives in the store so it's testable on its own.
 */

import {
  getStats,
  getProgress,
  getDueReviewItems,
  recordReviewSessionResult,
  exportProgressJSON,
  importProgressFromObject,
  resetProgress,
} from "./progress-store.js";
import { runQuiz } from "./quiz-engine.js";

// Hardcoded until a second and third lesson exist to justify deriving
// this from /data instead (see docs/lesson-engine.md's note on
// genericity). Update this list as new lessons ship. The original
// twelve topic units are done; four grammar units (questions/negation,
// pronouns/cases, modal verbs, Perfekt) are being added on top as part
// of the A1 exam-readiness expansion — see docs/roadmap.md.
const TOTAL_PLANNED_A1_UNITS = 16;
const CONTENT_TITLES = {
  "a1-unit-1-greetings": "A1 · Greetings",
  "a1-unit-2-introductions": "A1 · Introducing Yourself",
  "a1-unit-3-numbers": "A1 · Numbers",
  "a1-unit-4-family": "A1 · Family",
  "a1-unit-5-colors": "A1 · Colors",
  "a1-unit-6-calendar": "A1 · Days/Months/Seasons",
  "a1-unit-7-time": "A1 · Time",
  "a1-unit-8-food": "A1 · Food",
  "a1-unit-9-drinks": "A1 · Drinks",
  "a1-unit-10-home": "A1 · Home",
  "a1-unit-11-animals": "A1 · Animals",
  "a1-unit-12-daily-life": "A1 · Daily Life",
  "a1-unit-13-questions-negation": "A1 · Questions & Negation",
  "a1-unit-14-pronouns-cases": "A1 · Pronouns & Cases",
  "a1-unit-15-modal-verbs": "A1 · Modal Verbs",
  "a1-unit-16-perfekt": "A1 · Perfekt (Past Tense)",
  "a2-unit-1-praeteritum": "A2 · Präteritum (Simple Past)",
  "a2-unit-2-comparatives": "A2 · Comparatives & Superlatives",
  "a2-unit-3-two-way-prepositions": "A2 · Two-Way Prepositions",
  "a2-unit-4-subordinate-clauses": "A2 · Subordinate Clauses",
  "a2-unit-5-reflexive-verbs": "A2 · Reflexive Verbs",
  "a2-unit-6-dative-prepositions": "A2 · Dative-only Prepositions",
  "a2-unit-7-travel-holidays": "A2 · Travel & Holidays",
  "a2-unit-8-city-life": "A2 · City Life & Getting Around",
  "a2-unit-9-health-body": "A2 · Health & the Body",
  "a1-der-erste-tag": "Story · Der erste Tag",
  bahnhof: "Scenario · Am Bahnhof",
  "listening-practice-1": "Listening Practice 1",
  "vocabulary-bank": "Vocabulary Bank",
  "a1-mock-exam-1": "A1 Mock Exam 1",
  "a1-mock-exam-2": "A1 Mock Exam 2",
};
const contentTitle = (id) => CONTENT_TITLES[id] || id;

function levelLabel(lessonsCompleted) {
  if (lessonsCompleted <= 0) return "Not started yet";
  if (lessonsCompleted <= 4) return "Beginning A1";
  if (lessonsCompleted <= 9) return "Building A1";
  if (lessonsCompleted <= 15) return "Finishing A1";
  return "A1 complete — ready for A2";
}

function statTile(value, unit, label) {
  const div = document.createElement("div");
  div.className = "stat-tile";
  const valueEl = document.createElement("p");
  valueEl.className = "stat-value";
  valueEl.textContent = value;
  if (unit) {
    const unitEl = document.createElement("span");
    unitEl.className = "stat-unit";
    unitEl.textContent = unit;
    valueEl.appendChild(unitEl);
  }
  const labelEl = document.createElement("p");
  labelEl.className = "stat-label";
  labelEl.textContent = label;
  div.appendChild(valueEl);
  div.appendChild(labelEl);
  return div;
}

// The KPI row is meant to stay a *handful* of headline numbers, not grow
// a new tile every time a content type is added — so per-type counts
// (lessons/stories/scenarios/listening) live in the compact breakdown
// line below instead, and the row itself shows one combined "activities
// completed" total.
function renderKPIs(stats) {
  const mount = document.getElementById("kpi-mount");
  mount.innerHTML = "";
  const activitiesCompleted =
    stats.lessonsCompleted + stats.storiesRead + stats.scenariosCompleted + stats.listeningSetsCompleted + stats.examsCompleted;
  mount.appendChild(
    statTile(stats.streak.current, stats.streak.current === 1 ? "day" : "days", "Current streak")
  );
  mount.appendChild(
    statTile(stats.quizAverage === null ? "—" : stats.quizAverage, stats.quizAverage === null ? "" : "%", "Quiz average")
  );
  mount.appendChild(statTile(stats.reviewTotal, null, "Words in review"));
  mount.appendChild(statTile(activitiesCompleted, null, "Activities completed"));
}

function renderActivityBreakdown(stats) {
  const mount = document.getElementById("breakdown-mount");
  const parts = [
    [stats.lessonsCompleted, "lesson"],
    [stats.storiesRead, "story", "stories"],
    [stats.scenariosCompleted, "scenario"],
    [stats.listeningSetsCompleted, "listening set"],
    [stats.examsCompleted, "mock exam"],
    [stats.savedWordsCount, "saved word"],
  ].map(([count, singular, plural]) => `${count} ${count === 1 ? singular : plural || singular + "s"}`);
  mount.textContent = parts.join(" · ");
}

function renderMeter(stats) {
  const mount = document.getElementById("meter-mount");
  const done = Math.min(stats.a1UnitsCompleted, TOTAL_PLANNED_A1_UNITS);
  const pct = Math.min(100, Math.round((done / TOTAL_PLANNED_A1_UNITS) * 100));
  mount.innerHTML = `
    <div class="meter-track"><div class="meter-fill" style="width:${pct}%"></div></div>
    <p class="meter-label">${levelLabel(stats.a1UnitsCompleted)} — ${done} of ${TOTAL_PLANNED_A1_UNITS} planned A1 units complete</p>
  `;
}

const STAGE_LABELS = { new: "New", learning: "Learning", review: "Review", mastered: "Mastered" };

function renderReviewChips(stats) {
  const mount = document.getElementById("review-chips-mount");
  mount.innerHTML = "";
  ["new", "learning", "review", "mastered"].forEach((stage) => {
    const chip = document.createElement("div");
    chip.className = "review-chip";
    chip.dataset.stage = stage;
    chip.innerHTML = `<p class="review-chip-count">${stats.reviewCounts[stage] || 0}</p><p class="review-chip-label">${STAGE_LABELS[stage]}</p>`;
    mount.appendChild(chip);
  });
}

function renderHistory(stats, progressHistory) {
  const mount = document.getElementById("history-mount");
  mount.innerHTML = "";
  if (progressHistory.length === 0) {
    mount.innerHTML = '<li style="border:none; color: var(--color-ink-soft)">No quizzes taken yet.</li>';
    return;
  }
  progressHistory
    .slice()
    .reverse()
    .slice(0, 10)
    .forEach((entry) => {
      const li = document.createElement("li");
      const date = new Date(entry.date);
      const dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      li.innerHTML = `<span>${contentTitle(entry.contentId)}</span><span><span class="history-score">${entry.correct}/${entry.total}</span> <span class="history-date">${dateLabel}</span></span>`;
      mount.appendChild(li);
    });
}

function renderReviewAction() {
  const due = getDueReviewItems();
  const mount = document.getElementById("review-action-mount");
  mount.innerHTML = "";

  const p = document.createElement("p");
  p.style.color = "var(--color-ink-soft)";
  p.style.marginBottom = "var(--space-3)";

  if (due.length === 0) {
    p.textContent = "Nothing due for review today. Check back after your next quiz or in a few days.";
    mount.appendChild(p);
    return;
  }

  p.textContent = `${due.length} item${due.length === 1 ? "" : "s"} due for review today.`;
  mount.appendChild(p);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-primary btn-sm";
  btn.textContent = "Review now";
  btn.addEventListener("click", () => startReviewSession(due));
  mount.appendChild(btn);
}

function startReviewSession(dueItems) {
  const sessionMount = document.getElementById("review-session-mount");
  const questions = dueItems.map((item) => ({ ...item.question, id: item.itemKey }));

  runQuiz({
    container: sessionMount,
    questions,
    mode: "practice",
    onFinish: (result) => {
      recordReviewSessionResult(result.responses.map((r) => ({ id: r.id, correct: r.correct })));
      renderStats();
      renderReviewAction();
    },
  });
}

function renderStats() {
  const stats = getStats();
  const empty = document.getElementById("dashboard-empty");
  const content = document.getElementById("dashboard-content");

  empty.hidden = stats.hasAnyActivity;
  content.hidden = !stats.hasAnyActivity;
  if (!stats.hasAnyActivity) return;

  renderKPIs(stats);
  renderActivityBreakdown(stats);
  renderMeter(stats);
  renderReviewChips(stats);
  renderHistory(stats, getProgress().quizHistory);
}

function wireDataControls() {
  const statusEl = document.getElementById("data-status");
  const setStatus = (text, kind) => {
    statusEl.textContent = text;
    statusEl.className = `data-status ${kind ? "is-" + kind : ""}`;
  };

  document.getElementById("export-btn").addEventListener("click", () => {
    const json = exportProgressJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `deutschpfad-progress-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("Progress exported.", "success");
  });

  const importInput = document.getElementById("import-input");
  document.getElementById("import-btn").addEventListener("click", () => importInput.click());

  importInput.addEventListener("change", () => {
    const file = importInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (!confirm("This replaces your current progress on this device with the imported file. Continue?")) {
          importInput.value = "";
          return;
        }
        const result = importProgressFromObject(obj);
        if (result.ok) {
          setStatus("Progress imported.", "success");
          renderStats();
          renderReviewAction();
        } else {
          setStatus(result.error, "error");
        }
      } catch {
        setStatus("That file isn't valid JSON.", "error");
      }
      importInput.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("This permanently erases all local progress on this device. This can't be undone. Continue?")) {
      return;
    }
    resetProgress();
    setStatus("Progress reset.", "success");
    renderStats();
    renderReviewAction();
    document.getElementById("review-session-mount").innerHTML = "";
  });
}

function main() {
  renderStats();
  renderReviewAction();
  wireDataControls();
}

document.addEventListener("DOMContentLoaded", main);
