/**
 * Page script for lessons/c1-eingebettete-fragen.html — C1 Unit 5.
 * The "type" picker walks five embedded-question/reporting-verb
 * patterns; the "stance" picker shows how a claim reads under a
 * different reporting verb. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-5-eingebettete-fragen";

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

const EF_IDS = [
  "ef-intro", "ef-ob", "ef-w", "ef-subjekt", "ef-die-frage", "ef-verben",
  "ef-modus", "ef-abhaengen", "ef-offen-ungewiss", "ef-einraeumen",
  "ef-bestreiten", "ef-zugeben", "ef-andeuten", "ef-unterstellen",
  "ef-klarstellen", "ef-anzweifeln", "ef-suggerieren", "ef-konstatieren",
  "ef-hervorheben", "ef-zugestaendnis", "ef-unterstellung", "ef-andeutung",
  "ef-klarstellung", "ef-zweifel", "ef-verdacht", "ef-beteuerung",
  "ef-mutmassung", "ef-geruecht",
];

const USES = [
  { key: "ob", label: "eingebettete Ja/Nein-Frage", line: "Ich weiß nicht, ob er die Prüfung bestanden hat.", note: "The object of wissen is a whole yes/no question, introduced by ob with the verb at the end." },
  { key: "w", label: "eingebettete W-Frage", line: "Mir ist nicht klar, warum er das getan hat.", note: "The question word stays put; the finite verb moves to the end of the clause." },
  { key: "subjekt", label: "Frage als Satzsubjekt", line: "Ob das Projekt finanzierbar ist, bleibt fraglich.", note: "The whole ob-clause is the grammatical subject of \"bleibt fraglich\" — new territory beyond B1's reported-question use." },
  { key: "modus", label: "Indikativ statt Konjunktiv I", line: "Ob sie kommt, weiß ich nicht.", note: "States the speaker's own uncertainty, not a report of someone's words — so it stays indicative, unlike B1's indirekte Rede." },
  { key: "unterstellen", label: "unterstellen (loaded reporting)", line: "Man unterstellt ihm, aus Eigeninteresse gehandelt zu haben.", note: "Attributes an unstated, often unflattering motive — noticeably more loaded than the neutral andeuten." },
];

const REDUCE = [
  { key: "concede", label: "Someone accepted a point, reluctantly", response: "Der Minister räumte ein, dass Fehler gemacht wurden." },
  { key: "deny", label: "Someone rejects an accusation outright", response: "Der Angeklagte bestreitet die Vorwürfe." },
  { key: "hint", label: "Someone implies something without stating it", response: "Er deutete an, dass es bald Veränderungen geben könnte." },
  { key: "state", label: "A neutral fact, formally stated", response: "Der Bericht konstatiert einen deutlichen Rückgang der Zahlen." },
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

function initUsePicker() {
  initPicker({
    buttonsId: "use-picker-buttons",
    resultId: "use-picker-result",
    options: USES,
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

function initReducePicker() {
  initPicker({
    buttonsId: "reduce-picker-buttons",
    resultId: "reduce-picker-result",
    options: REDUCE,
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

  initUsePicker();
  initReducePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Niemand weiß genau, wie die Sache ausgeht.", "Nobody knows exactly how the matter will turn out."));
  discoverList.appendChild(sentenceCard("Die Frage, ob das Projekt finanzierbar ist, bleibt offen.", "The question of whether the project is financially viable remains open."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Es hängt davon ab, ob die Finanzierung gesichert ist.", "It depends on whether the funding is secured."));
  applyList.appendChild(sentenceCard("Die Werbung suggeriert, das Produkt sei gesund.", "The advertising suggests the product is healthy."));
  applyList.appendChild(sentenceCard("Über die Gründe gibt es nur Mutmaßungen.", "There is only speculation about the reasons."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-eingebettete-fragen.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(EF_IDS.map(byId).filter(Boolean), document.getElementById("grid-ef"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ef").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-eingebettete-fragen-quiz.json");

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
