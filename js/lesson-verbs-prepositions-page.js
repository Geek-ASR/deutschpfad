/**
 * Page script for lessons/a2-verbs-prepositions.html — A2 Unit 20,
 * same shape as the other A2 grammar-unit glue. The picker shows a
 * verb+preposition with a real noun, then as a da- compound, then as
 * a wo- question — the compounds chipped (Unicode-aware). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-20-verbs-prepositions";

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

const VP_IDS = [
  "vp-warten-auf",
  "vp-sich-freuen-auf",
  "vp-sich-freuen-ueber",
  "vp-denken-an",
  "vp-sich-interessieren-fuer",
  "vp-sich-aergern-ueber",
  "vp-angst-haben-vor",
  "vp-teilnehmen-an",
  "vp-sich-kuemmern-um",
  "vp-gehoeren-zu",
  "vp-bitten-um",
  "vp-traeumen-von",
  "vp-sich-gewoehnen-an",
  "vp-sich-erinnern-an",
  "vp-achten-auf",
  "vp-sprechen-ueber",
  "vp-sich-unterhalten-ueber",
  "vp-sich-entscheiden-fuer",
  "vp-sich-verlieben-in",
  "vp-sich-treffen-mit",
  "vp-telefonieren-mit",
  "vp-fragen-nach",
  "vp-suchen-nach",
  "vp-sich-bedanken-fuer",
  "vp-sich-beschweren-ueber",
  "vp-aufhoeren-mit",
  "vp-anfangen-mit",
  "vp-sich-sorgen-um",
];

// daChip / woChip are the compounds highlighted in `da` / `wo`.
const VP_VERBS = [
  { key: "warten", label: "warten auf (+ Akk) — to wait for", noun: "Ich warte auf den Bus.", da: "Ich warte schon lange darauf.", daChip: "darauf", wo: "Worauf wartest du?", woChip: "Worauf", note: "auf starts with a vowel → da·r·auf, wo·r·auf" },
  { key: "freuen-auf", label: "sich freuen auf (+ Akk) — to look forward to", noun: "Ich freue mich auf den Urlaub.", da: "Ich freue mich riesig darauf.", daChip: "darauf", wo: "Worauf freust du dich?", woChip: "Worauf", note: "future events → auf; past events → über" },
  { key: "denken-an", label: "denken an (+ Akk) — to think of", noun: "Ich denke oft an die Prüfung.", da: "Ich denke ständig daran.", daChip: "daran", wo: "Woran denkst du gerade?", woChip: "Woran", note: "an + vowel → da·r·an, wo·r·an" },
  { key: "interessieren", label: "sich interessieren für (+ Akk) — interested in", noun: "Ich interessiere mich für Musik.", da: "Ich interessiere mich sehr dafür.", daChip: "dafür", wo: "Wofür interessierst du dich?", woChip: "Wofür", note: "für starts with a consonant → dafür / wofür (no -r-)" },
  { key: "aergern", label: "sich ärgern über (+ Akk) — annoyed about", noun: "Ich ärgere mich über den Lärm.", da: "Ich ärgere mich jeden Tag darüber.", daChip: "darüber", wo: "Worüber ärgerst du dich?", woChip: "Worüber", note: "über + vowel → da·r·über, wo·r·über" },
  { key: "angst", label: "Angst haben vor (+ Dat) — afraid of", noun: "Ich habe Angst vor Spinnen.", da: "Ich habe echt Angst davor.", daChip: "davor", wo: "Wovor hast du Angst?", woChip: "Wovor", note: "vor + consonant → davor / wovor" },
  { key: "teilnehmen", label: "teilnehmen an (+ Dat) — take part in", noun: "Ich nehme an einem Kurs teil.", da: "Ich nehme regelmäßig daran teil.", daChip: "daran", wo: "Woran nimmst du teil?", woChip: "Woran", note: "separable verb; an + Dativ here" },
  { key: "kuemmern", label: "sich kümmern um (+ Akk) — take care of", noun: "Ich kümmere mich um die Kinder.", da: "Keine Sorge, ich kümmere mich darum.", daChip: "darum", wo: "Worum kümmerst du dich?", woChip: "Worum", note: "um + vowel → da·r·um, wo·r·um" },
];

const Q_OPTIONS = [
  { key: "freust", label: "Worauf freust du dich?", response: "Ich freue mich auf das lange Wochenende." },
  { key: "angst", label: "Wovor hast du Angst?", response: "Ich habe ein bisschen Angst vor der B1-Prüfung." },
  { key: "denkst", label: "Woran denkst du oft?", response: "Ich denke oft an meine Familie zu Hause." },
  { key: "interesse", label: "Wofür interessierst du dich?", response: "Ich interessiere mich sehr für Fotografie." },
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

function initVpPicker() {
  initPicker({
    buttonsId: "vp-picker-buttons",
    resultId: "vp-picker-result",
    options: VP_VERBS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.label;
      el.appendChild(heading);

      el.appendChild(line("with a noun", option.noun, null, "a"));
      el.appendChild(line("da- compound (a thing)", option.da, option.daChip, "b"));
      el.appendChild(line("wo- question", option.wo, option.woChip, "b"));

      const note = document.createElement("p");
      note.className = "picker-result-meta";
      note.style.width = "100%";
      note.style.marginTop = "var(--space-2)";
      note.textContent = option.note;
      el.appendChild(note);
    },
  });
}

function initQPicker() {
  initPicker({
    buttonsId: "q-picker-buttons",
    resultId: "q-picker-result",
    options: Q_OPTIONS,
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

  initVpPicker();
  initQPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich warte auf den Bus.", "I'm waiting for the bus."));
  discoverList.appendChild(sentenceCard("Ich warte darauf. — Worauf wartest du?", "I'm waiting for it. — What are you waiting for?"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich freue mich darauf, endlich Deutsch fließend zu sprechen.", "I'm looking forward to finally speaking German fluently."));
  applyList.appendChild(sentenceCard("An das kalte Wetter habe ich mich immer noch nicht gewöhnt.", "I still haven't got used to the cold weather."));
  applyList.appendChild(sentenceCard("Auf wen wartest du? — Auf meinen Kollegen, er kommt gleich.", "Who are you waiting for? — For my colleague, he's coming soon."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-verbs-prepositions.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(VP_IDS.map(byId).filter(Boolean), document.getElementById("grid-verbprep"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-verbprep").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-verbs-prepositions-quiz.json");

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
