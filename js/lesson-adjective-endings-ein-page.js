/**
 * Page script for lessons/a2-adjective-endings-ein.html — A2 Unit 14,
 * same shape as Unit 12's page. The picker puts a noun phrase in a
 * sentence in a specific case; the adjective ending is chipped and
 * the reason (a fill-in -er/-es, or a weak -e/-en like Unit 12) is
 * named. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-14-adjective-endings-ein";

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

const MIX_IDS = [
  "me-kein",
  "me-modern",
  "me-bequem",
  "me-praktisch",
  "me-guenstig",
  "me-hell",
  "me-dunkel",
  "me-ruhig",
  "me-laut",
  "me-sauber",
  "me-schmutzig",
  "me-kaputt",
  "me-gemuetlich",
];

// chip = the exact adjective+ending token to highlight in `sentence`.
const PHRASES = [
  { key: "nom-m", label: "ein + adj + Mann — Nominativ, m", sentence: "Da drüben steht ein alter Mann.", chip: "alter", ending: "-er", kind: "fill-in", why: "nominative masculine — ein has no ending, so the adjective shows -er" },
  { key: "akk-m", label: "einen + adj + Mann — Akkusativ, m", sentence: "Ich habe einen netten Mann kennengelernt.", chip: "netten", ending: "-en", kind: "weak", why: "masculine accusative — einen already marks it, so weak -en (like Unit 12)" },
  { key: "nom-f", label: "eine + adj + Frau — Nom/Akk, f", sentence: "Das ist eine nette Frau.", chip: "nette", ending: "-e", kind: "weak", why: "feminine nom/acc — eine marks it, weak -e" },
  { key: "dat-f", label: "einer + adj + Familie — Dativ, f", sentence: "Ich wohne bei einer netten Familie.", chip: "netten", ending: "-en", kind: "weak", why: "every dative → weak -en" },
  { key: "nom-n", label: "ein + adj + Kind — Nom/Akk, n", sentence: "Sie haben ein kleines Kind.", chip: "kleines", ending: "-es", kind: "fill-in", why: "neuter nom/acc — ein has no ending, so the adjective shows -es" },
  { key: "dat-n", label: "einem + adj + Kind — Dativ, n", sentence: "Ich helfe einem kleinen Kind über die Straße.", chip: "kleinen", ending: "-en", kind: "weak", why: "every dative → weak -en" },
  { key: "pl", label: "meine + adj + Schuhe — plural", sentence: "Meine neuen Schuhe sind schon kaputt.", chip: "neuen", ending: "-en", kind: "weak", why: "plural after a possessive → always -en" },
  { key: "kein-m", label: "keinen + adj + Grund — Akk, m", sentence: "Ich habe keinen guten Grund abzusagen.", chip: "guten", ending: "-en", kind: "weak", why: "kein declines like ein — masculine accusative → weak -en" },
];

const DESC_OPTIONS = [
  { key: "job", label: "He got a new job (m, akk)", response: "Er hat einen neuen Job in Berlin gefunden." },
  { key: "wohnung", label: "I have a small flat (f, akk)", response: "Ich habe eine kleine, aber gemütliche Wohnung." },
  { key: "geschenk", label: "That's a lovely present (n, nom)", response: "Das ist ein wirklich schönes Geschenk, danke!" },
  { key: "schuhe", label: "My old shoes are broken (pl)", response: "Meine alten Schuhe sind leider kaputt." },
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
  const chip = `<span class="word-breakdown-part" data-type="ending" style="display:inline-block">${word}</span>`;
  return sentence.replace(rx, chip);
}

function initMixPicker() {
  initPicker({
    buttonsId: "mix-picker-buttons",
    resultId: "mix-picker-result",
    options: PHRASES,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.label;
      el.appendChild(heading);

      const s = document.createElement("p");
      s.lang = "de";
      s.style.fontSize = "var(--text-md)";
      s.style.lineHeight = "2.2";
      s.style.width = "100%";
      s.innerHTML = chipInto(option.sentence, option.chip);
      el.appendChild(s);

      const tag = option.kind === "fill-in"
        ? `<strong style="color: var(--color-accent)">${option.ending} — a fill-in</strong>`
        : `<strong style="color: var(--color-primary)">${option.ending} — weak, like Unit 12</strong>`;
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.style.width = "100%";
      meta.style.margin = "0";
      meta.innerHTML = `${tag} — ${option.why}`;
      el.appendChild(meta);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initDescPicker() {
  initPicker({
    buttonsId: "desc-picker-buttons",
    resultId: "desc-picker-result",
    options: DESC_OPTIONS,
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

  initMixPicker();
  initDescPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("der alte Mann — Unit 12", "the old man (after der → ending -e)"));
  discoverList.appendChild(sentenceCard("ein alter Mann", "an old man (after ein → ending -er, because ein has none)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Wir suchen eine helle, ruhige Wohnung mit einem günstigen Preis.", "We're looking for a bright, quiet flat at a good price."));
  applyList.appendChild(sentenceCard("Mein neuer Kollege ist nett, aber wir haben einen ziemlich lauten Nachbarn.", "My new colleague is nice, but we have a pretty noisy neighbour."));
  applyList.appendChild(sentenceCard("Das ist kein großes Problem — ich habe noch ein sauberes Hemd.", "That's not a big problem — I still have a clean shirt."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-adjective-endings-ein.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MIX_IDS.map(byId).filter(Boolean), document.getElementById("grid-mixed"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-mixed").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-adjective-endings-ein-quiz.json");

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
