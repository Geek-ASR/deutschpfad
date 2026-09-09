/**
 * Page script for lessons/a1-time.html. Lesson-specific glue, same role
 * as js/lesson-calendar-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (clock times, study time-of-day).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-7-time";

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

const TIME_IDS = [
  "time-uhr",
  "time-stunde",
  "time-minute",
  "time-viertel",
  "time-halb",
  "time-nach",
  "time-vor",
  "time-mittag",
  "time-mitternacht",
  "time-punkt",
];

// hour/minute are 24-hour; everyday/formal are how a German speaker
// would actually say that time in each style.
const TIME_OPTIONS = [
  { key: "9:00", label: "9:00", hour: 9, minute: 0, everyday: "neun Uhr", formal: "neun Uhr" },
  { key: "9:10", label: "9:10", hour: 9, minute: 10, everyday: "zehn nach neun", formal: "neun Uhr zehn" },
  { key: "9:15", label: "9:15", hour: 9, minute: 15, everyday: "Viertel nach neun", formal: "neun Uhr fünfzehn" },
  { key: "9:30", label: "9:30", hour: 9, minute: 30, everyday: "halb zehn", formal: "neun Uhr dreißig" },
  { key: "9:45", label: "9:45", hour: 9, minute: 45, everyday: "Viertel vor zehn", formal: "neun Uhr fünfundvierzig" },
  { key: "9:50", label: "9:50", hour: 9, minute: 50, everyday: "zehn vor zehn", formal: "neun Uhr fünfzig" },
  { key: "12:00", label: "12:00", hour: 12, minute: 0, everyday: "zwölf Uhr / Mittag", formal: "zwölf Uhr" },
  { key: "0:00", label: "0:00", hour: 0, minute: 0, everyday: "Mitternacht", formal: "null Uhr" },
];

const STUDY_OPTIONS = [
  { key: "morgens", label: "Morning", response: "Ich lerne morgens Deutsch." },
  { key: "nachmittags", label: "Afternoon", response: "Ich lerne nachmittags Deutsch." },
  { key: "abends", label: "Evening", response: "Ich lerne abends Deutsch." },
  { key: "nachts", label: "Late at night", response: "Ich lerne nachts Deutsch." },
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

function makeClockFace(hour, minute) {
  const face = document.createElement("span");
  face.className = "clock-face";
  face.setAttribute("aria-hidden", "true");

  ["12", "3", "6", "9"].forEach((n) => {
    const tick = document.createElement("span");
    tick.className = `clock-tick clock-tick--${n}`;
    face.appendChild(tick);
  });

  const hourDeg = ((hour % 12) + minute / 60) * 30;
  const minuteDeg = minute * 6;

  const hourHand = document.createElement("span");
  hourHand.className = "clock-hand clock-hand--hour";
  hourHand.style.transform = `rotate(${hourDeg}deg)`;
  face.appendChild(hourHand);

  const minuteHand = document.createElement("span");
  minuteHand.className = "clock-hand clock-hand--minute";
  minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
  face.appendChild(minuteHand);

  const center = document.createElement("span");
  center.className = "clock-center";
  face.appendChild(center);

  return face;
}

function initTimePicker() {
  initPicker({
    buttonsId: "time-picker-buttons",
    resultId: "time-picker-result",
    options: TIME_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      el.appendChild(makeClockFace(option.hour, option.minute));

      const textWrap = document.createElement("div");
      textWrap.style.display = "flex";
      textWrap.style.flexDirection = "column";
      textWrap.style.gap = "var(--space-1)";

      const everyday = document.createElement("span");
      everyday.className = "picker-result-word";
      everyday.lang = "de";
      everyday.textContent = option.everyday;
      textWrap.appendChild(everyday);

      const formal = document.createElement("p");
      formal.className = "picker-result-meta";
      formal.style.marginTop = "0";
      formal.innerHTML = `Formal: <span lang="de">${option.formal}</span>`;
      textWrap.appendChild(formal);

      el.appendChild(textWrap);

      const speakBtn = createSpeakButton(option.everyday, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initStudyPicker() {
  initPicker({
    buttonsId: "study-picker-buttons",
    resultId: "study-picker-result",
    options: STUDY_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.style.fontSize = "var(--text-md)";
      word.textContent = option.response;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.response, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initTimePicker();
  initStudyPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Wie spät ist es? – Es ist halb zehn.", "What time is it? – It's 9:30."));
  discoverList.appendChild(sentenceCard("Wir treffen uns um neun Uhr.", "We're meeting at nine o'clock."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Zug fährt um Viertel nach acht.", "The train leaves at a quarter past eight."));
  applyList.appendChild(sentenceCard("Die Vorlesung beginnt Punkt zehn Uhr.", "The lecture starts at ten o'clock sharp."));
  applyList.appendChild(sentenceCard("Ich habe um halb drei einen Termin.", "I have an appointment at 2:30."));

  try {
    const vocab = await loadJSON("../data/vocabulary/time.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(TIME_IDS.map(byId).filter(Boolean), document.getElementById("grid-time"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-time").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-time-quiz.json");

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
