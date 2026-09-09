/**
 * Page script for lessons/a1-calendar.html. Lesson-specific glue, same
 * role as js/lesson-colors-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (days of the week, seasons).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-6-calendar";

const STEP_LABELS = {
  discover: "Discover",
  understand: "Understand",
  pattern: "Pattern",
  practice: "Practice",
  retrieve: "Retrieve",
  apply: "Apply",
  quiz: "Quiz",
  review: "Review",
  "encounter-again": "Again",
};

const MONTH_IDS = [
  "month-januar",
  "month-februar",
  "month-maerz",
  "month-april",
  "month-mai",
  "month-juni",
  "month-juli",
  "month-august",
  "month-september",
  "month-oktober",
  "month-november",
  "month-dezember",
];

const CALENDAR_IDS_MORE = [
  "cal-heute",
  "cal-morgen",
  "cal-uebermorgen",
  "cal-vorgestern",
  "cal-woche",
  "cal-monat",
  "cal-wochentag",
  "cal-datum",
  "cal-kalender",
  "cal-feiertag",
  "cal-naechste-woche",
  "cal-letzte-woche",
  "cal-jeden-tag",
  "cal-taeglich",
  "cal-woechentlich",
  "cal-monatlich",
  "cal-geburtstag",
  "cal-weihnachten",
  "cal-silvester",
];

const DAY_OPTIONS = [
  { key: "montag", label: "Montag", german: "Montag", meaning: "Monday" },
  { key: "dienstag", label: "Dienstag", german: "Dienstag", meaning: "Tuesday" },
  { key: "mittwoch", label: "Mittwoch", german: "Mittwoch", meaning: "Wednesday" },
  { key: "donnerstag", label: "Donnerstag", german: "Donnerstag", meaning: "Thursday" },
  { key: "freitag", label: "Freitag", german: "Freitag", meaning: "Friday" },
  { key: "samstag", label: "Samstag", german: "Samstag", meaning: "Saturday" },
  { key: "sonntag", label: "Sonntag", german: "Sonntag", meaning: "Sunday" },
];

const SEASON_OPTIONS = [
  { key: "fruehling", label: "Frühling", german: "Frühling", meaning: "spring" },
  { key: "sommer", label: "Sommer", german: "Sommer", meaning: "summer" },
  { key: "herbst", label: "Herbst", german: "Herbst", meaning: "fall" },
  { key: "winter", label: "Winter", german: "Winter", meaning: "winter" },
];

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function sentenceCard(de, en) {
  const li = document.createElement("li");
  li.className = "card";

  const deP = document.createElement("p");
  deP.lang = "de";
  deP.style.fontWeight = "600";
  deP.style.display = "flex";
  deP.style.alignItems = "center";
  deP.style.gap = "0.5rem";
  const deText = document.createElement("span");
  deText.textContent = de;
  deP.appendChild(deText);
  const speakBtn = createSpeakButton(de, "Listen to sentence");
  if (speakBtn) deP.appendChild(speakBtn);

  const enP = document.createElement("p");
  enP.textContent = en;

  li.appendChild(deP);
  li.appendChild(enP);
  return li;
}

function initDayPicker() {
  initPicker({
    buttonsId: "day-picker-buttons",
    resultId: "day-picker-result",
    options: DAY_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = `am ${option.german}`;
      el.appendChild(word);
      const speakBtn = createSpeakButton(`am ${option.german}`, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = `"on ${option.meaning}" — der ${option.german}`;
      el.appendChild(meta);
    },
  });
}

function initSeasonPicker() {
  initPicker({
    buttonsId: "season-picker-buttons",
    resultId: "season-picker-result",
    options: SEASON_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = `im ${option.german}`;
      el.appendChild(word);
      const speakBtn = createSpeakButton(`im ${option.german}`, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = `"in ${option.meaning}" — der ${option.german}`;
      el.appendChild(meta);
    },
  });
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initDayPicker();
  initSeasonPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Der Deutschkurs ist am Montag.", "German class is on Monday."));
  discoverList.appendChild(sentenceCard("Mein Geburtstag ist im Juni.", "My birthday is in June."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Am Freitag habe ich frei.", "On Friday I'm free."));
  applyList.appendChild(sentenceCard("Im Winter schneit es oft.", "It often snows in winter."));
  applyList.appendChild(sentenceCard("Das Semester beginnt im September.", "The semester begins in September."));

  try {
    const vocab = await loadJSON("../data/vocabulary/calendar.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MONTH_IDS.map(byId).filter(Boolean), document.getElementById("grid-months"));
    renderVocabGrid(CALENDAR_IDS_MORE.map(byId).filter(Boolean), document.getElementById("grid-calendar-more"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-months").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-calendar-quiz.json");

    runQuiz({
      container: document.getElementById("practice-mount"),
      questions: quizData.practice,
      mode: "practice",
    });

    runQuiz({
      container: document.getElementById("retrieve-mount"),
      questions: quizData.retrieve,
      mode: "practice",
    });

    runQuiz({
      container: document.getElementById("quiz-mount"),
      questions: quizData.quiz,
      mode: "quiz",
      onFinish: (result) => {
        recordQuizResult(LESSON_ID, result);
        const after = document.getElementById("quiz-after");
        after.innerHTML = "";
        const p = document.createElement("p");
        p.className = "status-note";
        p.innerHTML =
          result.correct === result.total
            ? `All correct — saved to your <a href="../dashboard.html">local dashboard</a>. Hit "Try again" any time for another round (it won't overwrite your best score).`
            : `Saved to your <a href="../dashboard.html">local dashboard</a> — missed items are now scheduled for spaced review.`;
        after.appendChild(p);
      },
    });
  } catch (err) {
    console.error(err);
    ["practice-mount", "retrieve-mount", "quiz-mount"].forEach((id) => {
      document.getElementById(id).innerHTML =
        '<p class="quiz-empty">Couldn\'t load quiz data. If you opened this file directly, run it from a local server instead (see the README).</p>';
    });
  }
}

document.addEventListener("DOMContentLoaded", main);
