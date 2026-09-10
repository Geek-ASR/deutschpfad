/**
 * Page script for lessons/a2-passive-amt.html — A2 Unit 15, same
 * shape as the other A2 grammar-unit glue. The picker shows each
 * action three ways — active with "man", present passive, modal +
 * passive — with the past participle chipped (Unicode-aware). No new
 * CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-15-passive-amt";

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

const PASSIVE_IDS = [
  "pa-amt",
  "pa-antrag",
  "pa-beantragen",
  "pa-formular",
  "pa-ausfuellen",
  "pa-pruefen",
  "pa-bearbeiten",
  "pa-unterschrift",
  "pa-unterschreiben",
  "pa-anmeldung",
  "pa-bescheid",
  "pa-gebuehr",
  "pa-sachbearbeiter",
];

// chip = the past participle to highlight in the passive lines.
const ACTIONS = [
  { key: "ausfuellen", label: "fill in the form", chip: "ausgefüllt", man: "Man füllt das Formular am Schalter aus.", passiv: "Das Formular wird am Schalter ausgefüllt.", modal: "Das Formular muss vollständig ausgefüllt werden." },
  { key: "pruefen", label: "check the application", chip: "geprüft", man: "Man prüft den Antrag in der Behörde.", passiv: "Der Antrag wird zurzeit geprüft.", modal: "Jeder Antrag muss einzeln geprüft werden." },
  { key: "bearbeiten", label: "process the application", chip: "bearbeitet", man: "Man bearbeitet den Antrag in zwei bis drei Wochen.", passiv: "Der Antrag wird in zwei bis drei Wochen bearbeitet.", modal: "Der Antrag kann auch online bearbeitet werden." },
  { key: "unterschreiben", label: "sign the application", chip: "unterschrieben", man: "Man unterschreibt den Antrag unten links.", passiv: "Der Antrag wird unten links unterschrieben.", modal: "Der Antrag muss persönlich unterschrieben werden." },
  { key: "beantragen", label: "apply for the passport", chip: "beantragt", man: "Man beantragt den Pass beim Bürgeramt.", passiv: "Der Pass wird beim Bürgeramt beantragt.", modal: "Der neue Pass kann online beantragt werden." },
  { key: "schicken", label: "send the decision", chip: "geschickt", man: "Man schickt den Bescheid per Post.", passiv: "Der Bescheid wird per Post geschickt.", modal: "Der Bescheid soll bis Freitag geschickt werden." },
  { key: "anmelden", label: "register your address", chip: "angemeldet", man: "Man meldet den Wohnsitz beim Bürgeramt an.", passiv: "Der Wohnsitz wird beim Bürgeramt angemeldet.", modal: "Der Wohnsitz muss innerhalb von 14 Tagen angemeldet werden." },
  { key: "bezahlen", label: "pay the fee", chip: "bezahlt", man: "Man bezahlt die Gebühr an der Kasse.", passiv: "Die Gebühr wird an der Kasse bezahlt.", modal: "Die Gebühr muss vor Ort bezahlt werden." },
];

const AMT_OPTIONS = [
  { key: "formular", label: "\"What do I do with the form?\"", response: "Das Formular wird hier ausgefüllt und unten unterschrieben." },
  { key: "dauer", label: "\"How long does it take?\"", response: "Ihr Antrag wird in etwa drei Wochen bearbeitet." },
  { key: "gebuehr", label: "\"Do I have to pay?\"", response: "Ja, eine Gebühr von 30 Euro muss vor Ort bezahlt werden." },
  { key: "bescheid", label: "\"When will I hear back?\"", response: "Der Bescheid wird Ihnen dann per Post geschickt." },
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

function initPvPicker() {
  initPicker({
    buttonsId: "pv-picker-buttons",
    resultId: "pv-picker-result",
    options: ACTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.label;
      el.appendChild(heading);

      el.appendChild(line("active — man", option.man, null, "a"));
      el.appendChild(line("present passive", option.passiv, option.chip, "b"));
      el.appendChild(line("modal + passive", option.modal, option.chip, "b"));
    },
  });
}

function initAmtPicker() {
  initPicker({
    buttonsId: "amt-picker-buttons",
    resultId: "amt-picker-result",
    options: AMT_OPTIONS,
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

  initPvPicker();
  initAmtPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das Formular wird am Schalter ausgefüllt.", "The form is filled in at the counter."));
  discoverList.appendChild(sentenceCard("Anträge werden nur mit Termin bearbeitet.", "Applications are only processed with an appointment."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ihr Antrag ist eingegangen und wird jetzt geprüft.", "Your application has arrived and is now being checked."));
  applyList.appendChild(sentenceCard("Der Termin kann online oder telefonisch gebucht werden.", "The appointment can be booked online or by phone."));
  applyList.appendChild(sentenceCard("Man kann auch sagen: \"Der Wohnsitz muss man innerhalb von 14 Tagen anmelden.\"", "You can also say it in the active with \"man\"."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-passive-amt.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PASSIVE_IDS.map(byId).filter(Boolean), document.getElementById("grid-passive"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-passive").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-passive-amt-quiz.json");

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
