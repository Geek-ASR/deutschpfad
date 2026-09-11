/**
 * Page script for lessons/b2-bildungspolitik.html — B2 Unit 17
 * (pivoted from "comparing education systems" to a policy/debate
 * angle, since B1 Unit 8 already covers the German system's
 * structure and qualification-recognition process). The "compare"
 * picker walks five contrasting pairs; the "issue" picker gives
 * example sentences for common policy debates.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-17-bildungspolitik";

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

const BIP_IDS = [
  "bip-bildungssystem", "bip-bildungspolitik", "bip-bildungsgerechtigkeit",
  "bip-chancengleichheit", "bip-bildungsungleichheit", "bip-pisa-studie",
  "bip-vergleichsstudie", "bip-ganztagsschule", "bip-halbtagsschule",
  "bip-notendruck", "bip-frontalunterricht", "bip-handlungsorientiert",
  "bip-privatschule", "bip-oeffentliche-schule", "bip-bildungsausgaben",
  "bip-schulpflicht", "bip-sitzenbleiben", "bip-nachhilfe",
  "bip-klassengroesse", "bip-eliteuniversitaet", "bip-bildungsstand",
  "bip-lehrplan", "bip-bildungsabschluss", "bip-fruehkindliche-bildung",
  "bip-lehrermangel", "bip-digitalisierung-schule", "bip-bildungsniveau",
  "bip-vergleich-review",
];

const COMPARE = [
  { key: "ganztag", label: "Ganztagsschule vs. Halbtagsschule", line: "Immer mehr Schulen werden zu Ganztagsschulen umgebaut.", note: "the traditional Halbtagsschule model is gradually giving way to all-day schooling." },
  { key: "unterricht", label: "Frontalunterricht vs. handlungsorientiert", line: "Kritiker sehen im Frontalunterricht ein veraltetes Modell.", note: "lecture-style teaching versus learning by doing — a recurring pedagogical debate." },
  { key: "schule", label: "Privatschule vs. öffentliche Schule", line: "Die Zahl der Privatschulen ist in den letzten Jahren gestiegen.", note: "most German students attend a public school, but private schools are growing." },
  { key: "eliteuni", label: "Eliteuniversität — a German contrast", line: "Anders als in den USA gibt es in Deutschland kein ausgeprägtes System von Eliteuniversitäten.", note: "German universities are seen as roughly equal in standing, unlike some other systems." },
  { key: "pisa", label: "Die PISA-Studie", line: "Die letzte PISA-Studie sorgte für heftige Diskussionen.", note: "the international comparison that regularly reshapes this whole debate." },
];

const ISSUES = [
  { key: "gerechtigkeit", label: "Chancengleichheit", response: "Kritiker fordern mehr Bildungsgerechtigkeit im deutschen System." },
  { key: "notendruck", label: "Druck auf Schüler", response: "Viele Schüler klagen über zu hohen Notendruck." },
  { key: "lehrermangel", label: "Lehrermangel", response: "Der Lehrermangel zwingt manche Schulen zu größeren Klassen." },
  { key: "digitalisierung", label: "Digitalisierung der Schulen", response: "Bei der Digitalisierung der Schulen liegt Deutschland international eher zurück." },
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

function initComparePicker() {
  initPicker({
    buttonsId: "compare-picker-buttons",
    resultId: "compare-picker-result",
    options: COMPARE,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.label;
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

function initIssuePicker() {
  initPicker({
    buttonsId: "issue-picker-buttons",
    resultId: "issue-picker-result",
    options: ISSUES,
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

  initComparePicker();
  initIssuePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das deutsche Bildungssystem unterscheidet sich stark von anderen Ländern.", "The German education system differs greatly from other countries."));
  discoverList.appendChild(sentenceCard("Die Bildungspolitik ist in Deutschland Sache der einzelnen Bundesländer.", "Education policy is the responsibility of the individual federal states in Germany."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Investitionen in frühkindliche Bildung gelten als besonders wirksam.", "Investment in early childhood education is seen as especially effective."));
  applyList.appendChild(sentenceCard("Der Bildungsstand der Bevölkerung ist stark gestiegen.", "The population's level of education has risen sharply."));
  applyList.appendChild(sentenceCard("Der höchste Bildungsabschluss variiert stark je nach Land.", "The highest level of educational qualification varies greatly by country."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-bildungspolitik.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(BIP_IDS.map(byId).filter(Boolean), document.getElementById("grid-bip"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-bip").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-bildungspolitik-quiz.json");

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
