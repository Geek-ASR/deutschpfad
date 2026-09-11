/**
 * Page script for lessons/b2-konjunktiv1-modalverben.html — B2 Unit 9.
 * The "form" picker walks the six modal verbs' Konjunktiv I forms; the
 * "report" picker gives example sentences for the reported-speech
 * register vocabulary (zufolge, vermeintlich, dementieren, ...).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-9-konjunktiv1-modalverben";

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

const KIM_IDS = [
  "kim-koennen-form", "kim-muessen-form", "kim-duerfen-form",
  "kim-wollen-form", "kim-sollen-form", "kim-moegen-form",
  "kim-koennen-beispiel", "kim-muessen-beispiel", "kim-duerfen-beispiel",
  "kim-wollen-beispiel", "kim-sollen-beispiel", "kim-ersatzform-plural",
  "kim-ersatzform-beispiel", "kim-doppelinfinitiv", "kim-doppelinfinitiv-beispiel",
  "kim-doppelinfinitiv-stellung", "kim-werde-modal-infinitiv", "kim-werde-modal-beispiel",
  "kim-futur2-bericht", "kim-futur2-beispiel", "kim-bericht-vs-vermutung",
  "kim-zufolge", "kim-zufolge-beispiel", "kim-vermeintlich",
  "kim-dementieren", "kim-bestaetigen", "kim-spekulieren", "kim-register-review",
];

const FORMS = [
  { key: "koennen", label: "können → er könne", line: "Er sagte, er könne heute nicht kommen.", note: "reports an original claim about ability or possibility." },
  { key: "muessen", label: "müssen → er müsse", line: "Sie erklärte, sie müsse den Termin verschieben.", note: "reports an original claim about necessity." },
  { key: "duerfen", label: "dürfen → er dürfe", line: "Der Anwalt sagte, sein Mandant dürfe keine Aussage machen.", note: "reports permission, or — negated — a prohibition." },
  { key: "wollen", label: "wollen → er wolle", line: "Er behauptete, er wolle die ganze Wahrheit sagen.", note: "reports a stated intention, without the speaker vouching for it." },
  { key: "sollen", label: "sollen → er solle", line: "Sie sagte, sie solle sich um ihre kranke Mutter kümmern.", note: "reports an original claim that used sollen — not a command from the speaker (that's B1 Unit 11's job)." },
  { key: "moegen", label: "mögen → er möge", line: "Er sagte, er möge klassische Musik nicht besonders.", note: "reports an original statement about liking something — unrelated to möchte." },
];

const REPORT_WORDS = [
  { key: "zufolge", label: "zufolge — according to", response: "Berichten zufolge steigen die Preise weiter." },
  { key: "vermeintlich", label: "vermeintlich — supposed, later doubted", response: "Der vermeintliche Experte hatte gar keine Ausbildung." },
  { key: "dementieren", label: "dementieren — to deny a claim", response: "Der Konzern dementierte die Gerüchte über eine Übernahme." },
  { key: "bestaetigen", label: "bestätigen — to confirm a claim", response: "Die Polizei bestätigte, dass es einen Verdächtigen gebe." },
  { key: "spekulieren", label: "spekulieren — to speculate", response: "Medien spekulierten, der Minister werde bald zurücktreten." },
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

function initFormPicker() {
  initPicker({
    buttonsId: "form-picker-buttons",
    resultId: "form-picker-result",
    options: FORMS,
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

function initReportPicker() {
  initPicker({
    buttonsId: "report-picker-buttons",
    resultId: "report-picker-result",
    options: REPORT_WORDS,
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

  initFormPicker();
  initReportPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Er sagte, er könne heute nicht kommen.", "He said he couldn't come today."));
  discoverList.appendChild(sentenceCard("Sie sagte, sie habe nicht kommen können.", "She said she hadn't been able to come."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Er meinte, man werde das Gesetz bald ändern müssen.", "He said the law would soon have to be changed."));
  applyList.appendChild(sentenceCard("Sie sagte, sie werde die Prüfung bis dahin bestanden haben.", "She said she would have passed the exam by then."));
  applyList.appendChild(sentenceCard("Umfragen zufolge sinkt das Vertrauen in die Regierung.", "According to surveys, trust in the government is falling."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-konjunktiv1-modalverben.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(KIM_IDS.map(byId).filter(Boolean), document.getElementById("grid-kim"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-kim").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-konjunktiv1-modalverben-quiz.json");

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
