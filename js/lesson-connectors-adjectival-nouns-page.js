/**
 * Page script for lessons/a2-connectors-adjectival-nouns.html — A2
 * Unit 22, same shape as the other A2 grammar-unit glue. The picker
 * shows a joined sentence with BOTH halves of a two-part connector
 * chipped (an array of chip strings), plus a note. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-22-connectors-adjectival-nouns";

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

const CN_IDS = [
  "cj-entweder-oder",
  "cj-weder-noch",
  "cj-sowohl",
  "cj-nicht-nur",
  "cj-zwar-aber",
  "cj-je-desto",
  "cj-deutsche",
  "cj-angestellte",
  "cj-verwandte",
  "cj-bekannte",
  "cj-erwachsene",
  "cj-jugendliche",
  "cj-reisende",
];

// chips = the two (or more) spans to highlight in `sentence`.
const CONNECTORS = [
  { key: "entweder", label: "entweder … oder — either … or", sentence: "Wir fahren entweder mit dem Zug oder mit dem Auto.", chips: ["entweder", "oder"], note: "a fixed pair — choose one of two options" },
  { key: "weder", label: "weder … noch — neither … nor", sentence: "Ich trinke weder Kaffee noch Tee.", chips: ["weder", "noch"], note: "\"noch\" already negates — do NOT add \"nicht\" or \"kein\"" },
  { key: "sowohl", label: "sowohl … als auch — both … and", sentence: "Sie spricht sowohl Deutsch als auch Französisch.", chips: ["sowohl", "als auch"], note: "joins two things that are both true" },
  { key: "nichtnur", label: "nicht nur …, sondern auch — not only …, but also", sentence: "Er ist nicht nur nett, sondern auch sehr hilfsbereit.", chips: ["nicht nur", "sondern auch"], note: "comma before \"sondern\"; \"sondern\" contradicts the negative (Unit 4)" },
  { key: "zwar", label: "zwar …, aber — admittedly … but", sentence: "Die Wohnung ist zwar klein, aber sehr gemütlich.", chips: ["zwar", "aber"], note: "concede a point with \"zwar\", then counter it with \"aber\"" },
  { key: "jedesto", label: "je …, desto … — the more …, the more …", sentence: "Je mehr ich übe, desto besser werde ich.", chips: ["Je mehr", "desto besser"], note: "\"je\" + comparative → verb to the end; \"desto\" + comparative → verb second" },
  { key: "deutsche", label: "adjectival noun — der Deutsche", sentence: "Er ist Deutscher, sie ist Österreicherin.", chips: ["Deutscher"], note: "an adjective as a noun — capitalised, still declined (ein Deutscher, die Deutschen, mit einem Deutschen)" },
  { key: "etwas", label: "after etwas / nichts / viel", sentence: "Ich habe dir etwas Schönes mitgebracht.", chips: ["etwas Schönes"], note: "after etwas/nichts/viel/wenig → neuter -es (Unit 16); after \"alles\" → -e (alles Gute)" },
];

const SELF_OPTIONS = [
  { key: "sprachen", label: "I speak both English and German", response: "Ich spreche sowohl Englisch als auch Deutsch." },
  { key: "zeitgeld", label: "I have neither time nor money right now", response: "Ich habe im Moment weder Zeit noch Geld." },
  { key: "wochenende", label: "Either this weekend or next", response: "Ich komme entweder dieses oder nächstes Wochenende." },
  { key: "studium", label: "Not only studying — also working on the side", response: "Ich bin nicht nur Studentin, sondern arbeite auch nebenbei." },
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

function chipAll(sentence, words) {
  let out = sentence;
  for (const w of words) {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp("(?<![\\p{L}\\p{N}_])" + escaped + "(?![\\p{L}\\p{N}_])", "u");
    const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${w}</span>`;
    out = out.replace(rx, chip);
  }
  return out;
}

function initCnPicker() {
  initPicker({
    buttonsId: "cn-picker-buttons",
    resultId: "cn-picker-result",
    options: CONNECTORS,
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
      s.innerHTML = chipAll(option.sentence, option.chips);
      el.appendChild(s);

      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.style.width = "100%";
      meta.style.margin = "0";
      meta.textContent = option.note;
      el.appendChild(meta);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initSelfPicker() {
  initPicker({
    buttonsId: "self-picker-buttons",
    resultId: "self-picker-result",
    options: SELF_OPTIONS,
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

  initCnPicker();
  initSelfPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich trinke Kaffee. Ich trinke Tee.", "I drink coffee. I drink tea."));
  discoverList.appendChild(sentenceCard("Ich trinke sowohl Kaffee als auch Tee.", "I drink both coffee and tea."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Kurs ist zwar anstrengend, aber ich lerne sehr viel.", "The course is exhausting, admittedly, but I'm learning a lot."));
  applyList.appendChild(sentenceCard("Je länger ich hier bin, desto wohler fühle ich mich.", "The longer I'm here, the more at home I feel."));
  applyList.appendChild(sentenceCard("Ein Bekannter von mir, ein Angestellter der Stadt, hat mir geholfen.", "An acquaintance of mine, a city employee, helped me."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-connectors-adjectival-nouns.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(CN_IDS.map(byId).filter(Boolean), document.getElementById("grid-connectors"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-connectors").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-connectors-adjectival-nouns-quiz.json");

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
