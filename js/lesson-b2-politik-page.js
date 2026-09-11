/**
 * Page script for lessons/b2-politik.html — B2 Unit 13. The "system"
 * picker walks five pieces of how Germany's political system works;
 * the "headline" picker gives example sentences in a news-style
 * register.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-13-politik";

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

const POL_IDS = [
  "pol-wahl", "pol-wahlkreis", "pol-partei", "pol-koalition",
  "pol-opposition", "pol-regierung", "pol-parlament", "pol-bundestag",
  "pol-gesetz", "pol-gesetzgebung", "pol-abstimmung", "pol-abstimmen",
  "pol-mehrheit", "pol-demokratie", "pol-grundgesetz", "pol-gewaltenteilung",
  "pol-rechtsstaat", "pol-meinungsfreiheit", "pol-waehler", "pol-wahlbeteiligung",
  "pol-bundeskanzler", "pol-abgeordnete", "pol-fraktion", "pol-kandidieren",
  "pol-protest", "pol-demonstrieren", "pol-populismus", "pol-extremismus",
];

const SYSTEM = [
  { key: "wahl", label: "1. die Wahl", line: "Die nächste Wahl findet im September statt.", note: "citizens vote for a party (and often a local candidate) in their Wahlkreis." },
  { key: "koalition", label: "2. die Koalition", line: "Nach der Wahl mussten drei Parteien eine Koalition bilden.", note: "in Germany's multi-party system, one party alone rarely has a majority." },
  { key: "bundeskanzler", label: "3. der Bundeskanzler", line: "Der Bundeskanzler wird vom Bundestag gewählt.", note: "not directly elected by voters — the Bundestag elects the head of government." },
  { key: "gesetz", label: "4. das Gesetz", line: "Der Bundestag stimmt heute über das neue Gesetz ab.", note: "Abgeordnete debate and vote on bills before they become law." },
  { key: "gewaltenteilung", label: "5. die Gewaltenteilung", line: "Die Gewaltenteilung schützt vor Machtmissbrauch.", note: "the Gesetzgebung, Regierung, and courts stay separate by design." },
];

const HEADLINES = [
  { key: "opposition", label: "Reaktion der Opposition", response: "Die Opposition kritisierte den Gesetzentwurf scharf." },
  { key: "wahlbeteiligung", label: "Wahlergebnis", response: "Die Wahlbeteiligung lag bei über 70 Prozent." },
  { key: "protest", label: "Protestbewegung", response: "Tausende demonstrierten gegen die Reform." },
  { key: "populismus", label: "Politische Debatte", response: "Kritiker werfen der Partei Populismus vor." },
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

function initSystemPicker() {
  initPicker({
    buttonsId: "system-picker-buttons",
    resultId: "system-picker-result",
    options: SYSTEM,
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

function initHeadlinePicker() {
  initPicker({
    buttonsId: "headline-picker-buttons",
    resultId: "headline-picker-result",
    options: HEADLINES,
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

  initSystemPicker();
  initHeadlinePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die Regierung stellte ihr neues Klimapaket vor.", "The government presented its new climate package."));
  discoverList.appendChild(sentenceCard("Keine Partei erreichte die absolute Mehrheit.", "No party reached an absolute majority."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Meinungsfreiheit findet ihre Grenzen im Gesetz.", "Freedom of speech finds its limits in the law."));
  applyList.appendChild(sentenceCard("Ein funktionierender Rechtsstaat schützt die Bürger vor Willkür.", "A functioning rule-of-law state protects citizens from arbitrary power."));
  applyList.appendChild(sentenceCard("Sie kandidiert zum ersten Mal für den Bundestag.", "She's running for the Bundestag for the first time."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-politik.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(POL_IDS.map(byId).filter(Boolean), document.getElementById("grid-pol"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-pol").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-politik-quiz.json");

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
