/**
 * Page script for lessons/b2-justiz.html — B2 Unit 20. The "stage"
 * picker walks five stages of a court case; the "role" picker gives
 * example sentences for who's who in a courtroom.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-20-justiz";

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

const JUS_IDS = [
  "jus-gericht", "jus-richter", "jus-klage", "jus-prozess",
  "jus-verfahren", "jus-anklage", "jus-urteil", "jus-berufung",
  "jus-revision", "jus-unschuldsvermutung", "jus-strafrecht", "jus-zivilrecht",
  "jus-anwalt", "jus-staatsanwaltschaft", "jus-bundesverfassungsgericht", "jus-verurteilen",
  "jus-freisprechen", "jus-beweislast", "jus-angeklagte", "jus-klaeger",
  "jus-verjaehrung", "jus-zeuge", "jus-aussage", "jus-grundrecht",
  "jus-klage-einreichen", "jus-rechtsanspruch", "jus-instanz", "jus-review",
];

const STAGES = [
  { key: "anklage", label: "1. die Anklage", line: "Die Staatsanwaltschaft erhob Anklage wegen Betrugs.", note: "the prosecutor's office formally brings charges." },
  { key: "prozess", label: "2. der Prozess", line: "Der Prozess dauerte mehrere Wochen.", note: "the trial itself, with Zeugen giving Aussagen." },
  { key: "urteil", label: "3. das Urteil", line: "Das Urteil überraschte viele Beobachter.", note: "the court's decision — either verurteilen or freisprechen." },
  { key: "berufung", label: "4. die Berufung", line: "Der Anwalt kündigte an, gegen das Urteil Berufung einzulegen.", note: "a step up to the next Instanz, contesting the verdict itself." },
  { key: "revision", label: "5. die Revision", line: "Nach der Berufung legte er noch Revision ein.", note: "one step further — reviewing whether the law itself was applied correctly." },
];

const ROLES = [
  { key: "richter", label: "Der Richter", response: "Die Richterin verkündete das Urteil am Nachmittag." },
  { key: "anwalt", label: "Der Anwalt", response: "Ihr Anwalt riet ihr, gegen den Bescheid vorzugehen." },
  { key: "zeuge", label: "Der Zeuge", response: "Ein wichtiger Zeuge sagte vor Gericht aus." },
  { key: "klaeger", label: "Der Kläger", response: "Der Kläger fordert Schadensersatz in Höhe von 10.000 Euro." },
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

function initStagePicker() {
  initPicker({
    buttonsId: "stage-picker-buttons",
    resultId: "stage-picker-result",
    options: STAGES,
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

function initRolePicker() {
  initPicker({
    buttonsId: "role-picker-buttons",
    resultId: "role-picker-result",
    options: ROLES,
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

  initStagePicker();
  initRolePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Der Fall wird vor dem Landgericht verhandelt.", "The case is being heard at the regional court."));
  discoverList.appendChild(sentenceCard("Die Unschuldsvermutung gilt, bis ein Urteil rechtskräftig ist.", "The presumption of innocence applies until a verdict is legally final."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Das Bundesverfassungsgericht erklärte das Gesetz für verfassungswidrig.", "The Federal Constitutional Court declared the law unconstitutional."));
  applyList.appendChild(sentenceCard("Eltern haben einen Rechtsanspruch auf einen Kitaplatz.", "Parents have a legal entitlement to a childcare place."));
  applyList.appendChild(sentenceCard("Gegen den Bescheid: Widerspruch. Gegen das Urteil: Berufung.", "Against the official notice: an objection. Against the verdict: an appeal."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-justiz.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(JUS_IDS.map(byId).filter(Boolean), document.getElementById("grid-jus"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-jus").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-justiz-quiz.json");

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
