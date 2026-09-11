/**
 * Page script for lessons/b2-wortbildung.html — B2 Unit 5 (last of the
 * items deferred from B1's backbone). The "use" picker walks the five
 * verb prefixes' meanings; the "build" picker gives example sentences
 * using the negating and adjective-forming affixes. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-5-wortbildung";

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

const WF_IDS = [
  "wf-ent-prefix", "wf-er-prefix", "wf-zer-prefix", "wf-ver-prefix",
  "wf-be-prefix", "wf-komposita-hinweis", "wf-entdecken", "wf-entstehen",
  "wf-entfernen", "wf-erreichen", "wf-erfinden", "wf-erfahren",
  "wf-zerbrechen", "wf-zerstoeren", "wf-verschwinden", "wf-verlieren",
  "wf-sich-verletzen", "wf-beantworten", "wf-besteigen", "wf-missverstehen",
  "wf-unmoeglich", "wf-unbekannt", "wf-freundlich", "wf-hoffnungsvoll",
  "wf-erfolgreich", "wf-arbeitslos", "wf-mutig", "wf-politisch",
];

const USES = [
  { key: "ent", label: "ent- = beginning or removal", line: "Der Impfstoff wurde erst nach jahrelanger Forschung entdeckt.", note: "ent- often signals something starting to exist (entstehen) or being taken away (entfernen)." },
  { key: "er", label: "er- = an achieved result", line: "Nach langem Training hat sie endlich ihr Ziel erreicht.", note: "er- marks successfully reaching an endpoint — erreichen, erfinden, erfahren all share this sense of achievement." },
  { key: "zer", label: "zer- = breaking apart", line: "Die Vase ist mir aus der Hand gefallen und zerbrochen.", note: "zer- always signals destruction or something falling apart — a very consistent, easy-to-spot meaning." },
  { key: "ver", label: "ver- = a change of state, often negative", line: "Der Schlüssel ist spurlos verschwunden.", note: "ver- covers a huge range of verbs, but very often marks a change for the worse: verlieren, verletzen, verschwinden." },
  { key: "be", label: "be- = makes a verb transitive", line: "Können Sie bitte meine Frage beantworten?", note: "be- often turns a verb+preposition (antworten auf) into a plain transitive verb (beantworten) with a direct object." },
];

const BUILD = [
  { key: "negation", label: "Say something is impossible/unknown", response: "Das ist völlig unmöglich — diese Person ist mir komplett unbekannt." },
  { key: "erfolg", label: "Describe someone successful", response: "Sie ist eine erfolgreiche und mutige Unternehmerin." },
  { key: "missverstaendnis", label: "Explain a misunderstanding", response: "Ich glaube, du hast mich missverstanden — so habe ich das nicht gemeint." },
  { key: "zerstoerung", label: "Describe something destroyed", response: "Der Sturm hat das alte Gebäude vollständig zerstört." },
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

function initBuildPicker() {
  initPicker({
    buttonsId: "build-picker-buttons",
    resultId: "build-picker-result",
    options: BUILD,
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
  initBuildPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich glaube, du hast mich missverstanden.", "I think you misunderstood me."));
  discoverList.appendChild(sentenceCard("Sie ist eine erfolgreiche und mutige Unternehmerin.", "She's a successful and courageous entrepreneur."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Konflikt ist aus einem einfachen Missverständnis entstanden.", "The conflict arose from a simple misunderstanding."));
  applyList.appendChild(sentenceCard("Sie hat schon mehrere Achttausender bestiegen.", "She has already climbed several eight-thousanders."));
  applyList.appendChild(sentenceCard("Nach der Insolvenz waren Hunderte Menschen arbeitslos.", "After the bankruptcy, hundreds of people were unemployed."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-wortbildung.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(WF_IDS.map(byId).filter(Boolean), document.getElementById("grid-wf"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-wf").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-wortbildung-quiz.json");

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
