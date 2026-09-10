/**
 * Page script for lessons/a2-genitiv.html — A2 Unit 10, same shape as
 * the other A2 grammar-unit glue. The picker shows each noun phrase
 * in the Genitiv with the article chipped (shared .word-breakdown-part),
 * the -s/-es ending rule, and the spoken "von + Dativ" alternative.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-10-genitiv";

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

const GEN_IDS = [
  "gn-wegen",
  "gn-waehrend",
  "gn-trotz",
  "gn-anstatt",
  "gn-wessen",
  "gn-grund",
  "gn-stau",
  "gn-verspaetung",
  "gn-ende",
  "gn-anfang",
  "gn-haelfte",
  "gn-trotzdem",
  "gn-deswegen",
];

// article = the Genitiv article to chip in `genitiv`.
const GEN_PHRASES = [
  { key: "film", label: "the end of the film", genitiv: "das Ende des Films", article: "des", ending: "der Film → des Film-s (longer m/n noun → -s)", von: "das Ende von dem Film" },
  { key: "mann", label: "the man's car", genitiv: "das Auto des Mannes", article: "des", ending: "der Mann → des Mann-es (one syllable → -es)", von: "das Auto von dem Mann" },
  { key: "kind", label: "the child's room", genitiv: "das Zimmer des Kindes", article: "des", ending: "das Kind → des Kind-es (one syllable → -es)", von: "das Zimmer von dem Kind" },
  { key: "auto", label: "the colour of the car", genitiv: "die Farbe des Autos", article: "des", ending: "das Auto → des Auto-s (ends in a vowel → just -s)", von: "die Farbe von dem Auto" },
  { key: "frau", label: "the woman's bag", genitiv: "die Tasche der Frau", article: "der", ending: "die Frau → der Frau (feminine → der, no ending)", von: "die Tasche von der Frau" },
  { key: "kinder", label: "the children's toys", genitiv: "die Spielsachen der Kinder", article: "der", ending: "die Kinder → der Kinder (plural → der, no ending)", von: "die Spielsachen von den Kindern" },
  { key: "schwester", label: "my sister's friend", genitiv: "der Freund meiner Schwester", article: "meiner", ending: "feminine ein-word → meiner, no ending on the noun", von: "der Freund von meiner Schwester" },
  { key: "bruder", label: "my brother's phone", genitiv: "das Handy meines Bruders", article: "meines", ending: "masculine ein-word → meines, plus -s on the noun", von: "das Handy von meinem Bruder" },
];

const LATE_OPTIONS = [
  { key: "stau", label: "There was a traffic jam", response: "Wegen eines Staus auf der Autobahn bin ich eine Stunde zu spät." },
  { key: "wetter", label: "The weather stopped the train", response: "Wegen des schlechten Wetters ist mein Zug ausgefallen." },
  { key: "termin", label: "I had a doctor's appointment", response: "Wegen eines Termins beim Arzt konnte ich nicht früher kommen." },
  { key: "trotz", label: "I left early and still missed the bus", response: "Trotz des frühen Starts habe ich den Bus verpasst." },
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
  if (chipWord) {
    const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${chipWord}</span>`;
    p.innerHTML = sentence.replace(new RegExp("\\b" + chipWord + "\\b"), chip);
  } else {
    p.textContent = sentence;
  }
  wrap.appendChild(p);

  const speakBtn = createSpeakButton(sentence, "Listen");
  if (speakBtn) wrap.appendChild(speakBtn);
  return wrap;
}

function metaRow(label, text) {
  const row = document.createElement("p");
  row.className = "picker-result-meta";
  row.style.width = "100%";
  row.style.margin = "var(--space-2) 0 0";
  row.innerHTML = `${label}: <strong style="color: var(--color-ink)">${text}</strong>`;
  return row;
}

function initGenPicker() {
  initPicker({
    buttonsId: "gen-picker-buttons",
    resultId: "gen-picker-result",
    options: GEN_PHRASES,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.label;
      el.appendChild(heading);

      el.appendChild(line("Genitiv (written)", option.genitiv, option.article, "a"));
      el.appendChild(metaRow("ending rule", option.ending));
      el.appendChild(line("spoken — von + Dativ", option.von, null, "b"));
    },
  });
}

function initLatePicker() {
  initPicker({
    buttonsId: "late-picker-buttons",
    resultId: "late-picker-result",
    options: LATE_OPTIONS,
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

  initGenPicker();
  initLatePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das ist das Fahrrad meiner Schwester.", "That's my sister's bike."));
  discoverList.appendChild(sentenceCard("Wegen des Regens ist das Spiel ausgefallen.", "Because of the rain the game was called off."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Während der Prüfung darf man das Handy nicht benutzen.", "During the exam you may not use your phone."));
  applyList.appendChild(sentenceCard("Trotz des schlechten Wetters war der Ausflug schön.", "Despite the bad weather the trip was nice."));
  applyList.appendChild(sentenceCard("Am Ende des Monats ist mein Konto immer leer.", "At the end of the month my account is always empty."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-genitiv.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(GEN_IDS.map(byId).filter(Boolean), document.getElementById("grid-genitiv"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-genitiv").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-genitiv-quiz.json");

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
