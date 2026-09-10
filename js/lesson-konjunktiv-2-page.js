/**
 * Page script for lessons/a2-konjunktiv-2.html — A2 Unit 13, same
 * shape as the other A2 grammar-unit glue. The picker shows each
 * verb's plain present form and its Konjunktiv II, with the
 * Konjunktiv form chipped (Unicode-aware, since wäre/müsste/bräuchte
 * start with an umlaut) and a polite/wishful example. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-13-konjunktiv-2";

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

const K2_IDS = [
  "k2-wuerde",
  "k2-waere",
  "k2-haette",
  "k2-koennte",
  "k2-duerfte",
  "k2-muesste",
  "k2-braeuchte",
  "k2-haette-gern",
  "k2-wuerde-gern",
  "k2-an-deiner-stelle",
  "k2-wunsch",
  "k2-bitte",
  "k2-hoeflich",
];

// chip = the Konjunktiv II word/token to highlight in `k2`.
const K2_VERBS = [
  { key: "wuerde", label: "werden → würde", present: "Ich mache das später.", k2: "Ich würde das gern für dich machen.", chip: "würde", use: "würde + infinitive — the general form" },
  { key: "waere", label: "sein → wäre", present: "Ich bin leider nicht da.", k2: "Ich wäre jetzt gern zu Hause.", chip: "wäre", use: "wish — use the short form, not \"würde sein\"" },
  { key: "haette", label: "haben → hätte", present: "Ich habe eine Frage.", k2: "Ich hätte eine Frage.", chip: "hätte", use: "softer than \"Ich habe\"" },
  { key: "koennte", label: "können → könnte", present: "Kannst du mir helfen?", k2: "Könntest du mir kurz helfen?", chip: "Könntest", use: "polite request" },
  { key: "duerfte", label: "dürfen → dürfte", present: "Darf ich Sie etwas fragen?", k2: "Dürfte ich Sie etwas fragen?", chip: "Dürfte", use: "very polite request" },
  { key: "muesste", label: "müssen → müsste", present: "Ich muss noch einkaufen.", k2: "Ich müsste eigentlich noch einkaufen.", chip: "müsste", use: "softened obligation" },
  { key: "moechte", label: "mögen → möchte", present: "Ich mag Kaffee.", k2: "Ich möchte bitte einen Kaffee.", chip: "möchte", use: "\"would like\" — you've used this since A1" },
  { key: "braeuchte", label: "brauchen → bräuchte", present: "Ich brauche mehr Zeit.", k2: "Ich bräuchte noch etwas mehr Zeit.", chip: "bräuchte", use: "softened need" },
];

const POLITE_OPTIONS = [
  { key: "zeit", label: "Ask a stranger the time", response: "Entschuldigung, könnten Sie mir sagen, wie spät es ist?" },
  { key: "hilfe", label: "Ask a colleague for a hand", response: "Hättest du kurz Zeit, mir mit etwas zu helfen?" },
  { key: "cafe", label: "Order in a café", response: "Ich hätte gern einen Kaffee und ein Stück Kuchen, bitte." },
  { key: "wunsch", label: "Say what you wish", response: "Ich würde gern mal ein Jahr im Ausland leben." },
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

function chipInto(sentence, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp("(?<![\\p{L}\\p{N}_])" + escaped + "(?![\\p{L}\\p{N}_])", "u");
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${word}</span>`;
  return sentence.replace(rx, chip);
}

function line(label, sentence, chipWord, tone) {
  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.style.marginTop = "var(--space-2)";

  const tag = document.createElement("span");
  tag.className = "picker-result-meta";
  tag.style.margin = "0";
  tag.style.fontWeight = "700";
  if (tone) tag.style.color = tone === "a" ? "var(--color-primary)" : "var(--color-accent)";
  tag.textContent = label;
  wrap.appendChild(tag);

  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.lineHeight = "2.2";
  p.style.margin = "0";
  p.innerHTML = chipWord ? chipInto(sentence, chipWord) : sentence;
  wrap.appendChild(p);

  const speakBtn = createSpeakButton(sentence, "Listen");
  if (speakBtn) wrap.appendChild(speakBtn);
  return wrap;
}

function initK2Picker() {
  initPicker({
    buttonsId: "k2-picker-buttons",
    resultId: "k2-picker-result",
    options: K2_VERBS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.label;
      el.appendChild(heading);

      el.appendChild(line("plain present", option.present, null, "a"));
      el.appendChild(line("Konjunktiv II", option.k2, option.chip, "b"));

      const use = document.createElement("p");
      use.className = "picker-result-meta";
      use.style.width = "100%";
      use.style.marginTop = "var(--space-2)";
      use.textContent = option.use;
      el.appendChild(use);
    },
  });
}

function initPolitePicker() {
  initPicker({
    buttonsId: "polite-picker-buttons",
    resultId: "polite-picker-result",
    options: POLITE_OPTIONS,
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

  initK2Picker();
  initPolitePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Gib mir das Salz.", "Pass me the salt. (blunt — an imperative)"));
  discoverList.appendChild(sentenceCard("Könntest du mir bitte das Salz geben?", "Could you pass me the salt, please? (Konjunktiv II)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich hätte eine Bitte: Könnten Sie das Fenster zumachen?", "I have a favour to ask: could you close the window?"));
  applyList.appendChild(sentenceCard("An deiner Stelle würde ich noch eine Nacht darüber schlafen.", "If I were you I'd sleep on it another night."));
  applyList.appendChild(sentenceCard("Das wäre wirklich nett von Ihnen — vielen Dank.", "That would be really kind of you — many thanks."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-konjunktiv-2.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(K2_IDS.map(byId).filter(Boolean), document.getElementById("grid-konjunktiv"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-konjunktiv").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-konjunktiv-2-quiz.json");

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
