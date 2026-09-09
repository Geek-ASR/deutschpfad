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
// genericity). Update this list as new lessons ship.
const TOTAL_PLANNED_A1_UNITS = 12;
const LESSON_TITLES = { "a1-unit-3-numbers": "A1 · Numbers" };
const lessonTitle = (id) => LESSON_TITLES[id] || id;

function levelLabel(lessonsCompleted) {
  if (lessonsCompleted <= 0) return "Not started yet";
  if (lessonsCompleted <= 3) return "Beginning A1";
  if (lessonsCompleted <= 8) return "Building A1";
  if (lessonsCompleted <= 11) return "Finishing A1";
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

function renderKPIs(stats) {
  const mount = document.getElementById("kpi-mount");
  mount.innerHTML = "";
  mount.appendChild(statTile(stats.lessonsCompleted, null, "Lessons completed"));
  mount.appendChild(
    statTile(stats.streak.current, stats.streak.current === 1 ? "day" : "days", "Current streak")
  );
  mount.appendChild(
    statTile(stats.quizAverage === null ? "—" : stats.quizAverage, stats.quizAverage === null ? "" : "%", "Quiz average")
  );
  mount.appendChild(statTile(stats.reviewTotal, null, "Words in review"));
}

function renderMeter(stats) {
  const mount = document.getElementById("meter-mount");
  const pct = Math.min(100, Math.round((stats.lessonsCompleted / TOTAL_PLANNED_A1_UNITS) * 100));
  mount.innerHTML = `
    <div class="meter-track"><div class="meter-fill" style="width:${pct}%"></div></div>
    <p class="meter-label">${levelLabel(stats.lessonsCompleted)} — ${stats.lessonsCompleted} of ${TOTAL_PLANNED_A1_UNITS} planned A1 units complete</p>
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
      li.innerHTML = `<span>${lessonTitle(entry.lessonId)}</span><span><span class="history-score">${entry.correct}/${entry.total}</span> <span class="history-date">${dateLabel}</span></span>`;
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
