/**
 * Page script for lessons/b1-mobilitaet.html — B1 Unit 18 (topic unit).
 * The "topic" picker walks core mobility situations (commuting, delays,
 * cancellations, passenger rights, alternatives to a car); the "habit"
 * picker answers "how do you get around?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-18-mobilitaet";

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

const MOB_IDS = [
  "mob-oepnv", "mob-nahverkehr", "mob-fernverkehr", "mob-verbindung",
  "mob-anschluss", "mob-verspaetung", "mob-fahrplan", "mob-stau",
  "mob-baustelle", "mob-fuehrerschein", "mob-buchung", "mob-stornierung",
  "mob-carsharing", "mob-mitfahrgelegenheit", "mob-fahrgastrechte",
  "mob-entschaedigung", "mob-ersatzverkehr", "mob-deutschlandticket",
  "mob-pendeln", "mob-buchen", "mob-stornieren", "mob-umbuchen",
  "mob-ausfallen", "mob-sich-verspaeten", "mob-erreichen",
  "mob-klimafreundlich", "mob-zuverlaessig", "mob-ueberfuellt",
];

const TOPICS = [
  { key: "pendeln", moment: "Talking about your commute", line: "Ich pendle jeden Tag mit der Bahn zur Arbeit — mit dem Deutschlandticket ist das inzwischen günstig.", note: "\"pendeln\" = to commute; das Deutschlandticket covers nearly all Nahverkehr nationwide for a flat monthly price." },
  { key: "verspaetung", moment: "Dealing with a delay", line: "Der Zug hat zwanzig Minuten Verspätung, deshalb verpasse ich meinen Anschluss.", note: "\"den Anschluss verpassen\" = to miss your connection — one of the most common travel complaints in Germany." },
  { key: "ausfall", moment: "A train is cancelled", line: "Wegen einer Baustelle fällt unser Zug aus — es gibt einen Ersatzverkehr mit dem Bus.", note: "\"ausfallen\" is separable and conjugates with sein: der Zug ist ausgefallen." },
  { key: "fahrgastrechte", moment: "Claiming your rights", line: "Bei über einer Stunde Verspätung habe ich laut Fahrgastrechte Anspruch auf eine Entschädigung.", note: "these are legally guaranteed rights (Fahrgastrechte) — worth knowing if you travel by train often." },
  { key: "mobilitaet", moment: "Talking about getting around without a car", line: "Für kurze Strecken nehme ich das Fahrrad, für weitere Strecken nutze ich Carsharing oder eine Mitfahrgelegenheit.", note: "these newer forms of Mobilität are common talking points alongside climate-friendly transport (Unit 16)." },
];

const HABITS = [
  { key: "alltag", label: "Im Alltag", response: "Im Alltag pendle ich mit dem ÖPNV — das ist zuverlässiger als im Stau zu stehen." },
  { key: "fernreisen", label: "Fernreisen", response: "Für weite Strecken buche ich meistens einen Zug im Fernverkehr, manchmal auch einen Flug." },
  { key: "probleme", label: "Bei Problemen", response: "Wenn ein Zug ausfällt, informiere ich mich sofort über den Ersatzverkehr und meine Fahrgastrechte." },
  { key: "alternativen", label: "Alternativen", response: "Für spontane Fahrten nutze ich Carsharing oder eine Mitfahrgelegenheit, statt ein eigenes Auto zu haben." },
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

function initTopicPicker() {
  initPicker({
    buttonsId: "topic-picker-buttons",
    resultId: "topic-picker-result",
    options: TOPICS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.moment;
      el.appendChild(heading);

      const line = document.createElement("p");
      line.lang = "de";
      line.style.width = "100%";
      line.style.margin = "0";
      line.style.fontSize = "var(--text-md)";
      line.style.lineHeight = "1.9";
      line.textContent = option.line;
      el.appendChild(line);

      const note = document.createElement("p");
      note.className = "picker-result-meta";
      note.style.width = "100%";
      note.style.marginTop = "var(--space-2)";
      note.textContent = option.note;
      el.appendChild(note);

      const speakBtn = createSpeakButton(option.line, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initHabitPicker() {
  initPicker({
    buttonsId: "habit-picker-buttons",
    resultId: "habit-picker-result",
    options: HABITS,
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

  initTopicPicker();
  initHabitPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Der ICE nach Hamburg hat voraussichtlich zwanzig Minuten Verspätung.", "The ICE to Hamburg is expected to be twenty minutes late."));
  discoverList.appendChild(sentenceCard("Wegen einer Baustelle fällt der Anschlusszug leider aus. Es gibt einen Ersatzverkehr mit dem Bus.", "Unfortunately the connecting train is cancelled due to construction. There's replacement bus service."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Mit dem Deutschlandticket ist Pendeln im Nahverkehr inzwischen deutlich günstiger geworden.", "Commuting on local transport has become much cheaper with the Deutschlandticket."));
  applyList.appendChild(sentenceCard("Bei über einer Stunde Verspätung habe ich laut Fahrgastrechte Anspruch auf eine Entschädigung.", "With over an hour's delay, I'm entitled to compensation under passenger rights."));
  applyList.appendChild(sentenceCard("Statt ein eigenes Auto zu kaufen, nutze ich für spontane Fahrten Carsharing.", "Instead of buying my own car, I use car sharing for spontaneous trips."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-mobilitaet.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MOB_IDS.map(byId).filter(Boolean), document.getElementById("grid-mob"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-mob").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-mobilitaet-quiz.json");

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
