/**
 * Page script for lessons/a2-travel-holidays.html — A2 Unit 7, same
 * shape as the other A2 grammar-unit glue. The picker shows each
 * travel verb in the present and then in the Perfekt, with the
 * auxiliary (sein / haben) named and the participle chipped (shared
 * .word-breakdown-part). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-7-travel-holidays";

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

const TRAVEL_IDS = [
  "th-reise", "th-urlaub", "th-reiseziel", "th-verreisen", "th-abfliegen",
  "th-ankommen", "th-aufenthalt", "th-flug", "th-rueckflug", "th-gepaeck",
  "th-koffer", "th-bordkarte", "th-reisepass", "th-zoll", "th-grenze",
  "th-unterkunft", "th-buchen", "th-doppelzimmer", "th-einzelzimmer",
  "th-uebernachten", "th-jugendherberge", "th-pension", "th-halbpension",
  "th-mietwagen", "th-strand", "th-kueste", "th-packen", "th-sehenswuerdigkeit",
  "th-postkarte", "th-souvenir", "th-erholen",
];

// aux = Perfekt auxiliary; partizip = the participle to chip in `perfekt`.
const TRAVEL_VERBS = [
  { key: "fahren", label: "fahren", verb: "fahren", meaning: "to go / drive", aux: "sein", present: "Ich fahre nach Italien.", perfekt: "Ich bin nach Italien gefahren.", partizip: "gefahren", note: "movement → sein" },
  { key: "fliegen", label: "fliegen", verb: "fliegen", meaning: "to fly", aux: "sein", present: "Wir fliegen nach Spanien.", perfekt: "Wir sind nach Spanien geflogen.", partizip: "geflogen", note: "movement → sein" },
  { key: "verreisen", label: "verreisen", verb: "verreisen", meaning: "to go away (on a trip)", aux: "sein", present: "Im Sommer verreisen wir oft.", perfekt: "Im Sommer sind wir oft verreist.", partizip: "verreist", note: "movement → sein; no ge- (ends in -reisen)" },
  { key: "abfliegen", label: "abfliegen", verb: "abfliegen", meaning: "to take off / depart", aux: "sein", present: "Das Flugzeug fliegt um zehn Uhr ab.", perfekt: "Das Flugzeug ist um zehn Uhr abgeflogen.", partizip: "abgeflogen", note: "separable — ge- between prefix and stem" },
  { key: "ankommen", label: "ankommen", verb: "ankommen", meaning: "to arrive", aux: "sein", present: "Wir kommen am Abend an.", perfekt: "Wir sind am Abend angekommen.", partizip: "angekommen", note: "separable — ge- between prefix and stem" },
  { key: "buchen", label: "buchen", verb: "buchen", meaning: "to book", aux: "haben", present: "Ich buche ein Hotel.", perfekt: "Ich habe ein Hotel gebucht.", partizip: "gebucht", note: "not movement → haben" },
  { key: "packen", label: "packen", verb: "packen", meaning: "to pack", aux: "haben", present: "Ich packe meinen Koffer.", perfekt: "Ich habe meinen Koffer gepackt.", partizip: "gepackt", note: "not movement → haben" },
  { key: "erholen", label: "sich erholen", verb: "sich erholen", meaning: "to relax / recover", aux: "haben", present: "Ich erhole mich am Strand.", perfekt: "Ich habe mich am Strand erholt.", partizip: "erholt", note: "reflexive → always haben" },
];

const DEST_OPTIONS = [
  { key: "italien", label: "To Italy, by car", response: "Letztes Jahr bin ich mit dem Auto nach Italien gefahren." },
  { key: "spanien", label: "To Spain, by plane", response: "Ich bin nach Spanien geflogen." },
  { key: "nordsee", label: "To the North Sea", response: "Wir sind an die Nordsee gefahren." },
  { key: "zuhause", label: "Nowhere — stayed home", response: "Ich bin zu Hause geblieben." },
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

function metaRow(label, word) {
  const row = document.createElement("p");
  row.className = "picker-result-meta";
  row.style.width = "100%";
  row.style.margin = "0";
  row.innerHTML = `${label}: <strong style="color: var(--color-ink)">${word}</strong>`;
  return row;
}

function tenseLine(label, sentence, chipWord, tone) {
  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.style.marginTop = "var(--space-2)";

  const tag = document.createElement("span");
  tag.className = "picker-result-meta";
  tag.style.margin = "0";
  tag.style.fontWeight = "700";
  if (tone) tag.style.color = tone === "sein" ? "var(--color-primary)" : "var(--color-accent)";
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

function initTripPicker() {
  initPicker({
    buttonsId: "trip-picker-buttons",
    resultId: "trip-picker-result",
    options: TRAVEL_VERBS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = `${option.verb} — "${option.meaning}"`;
      el.appendChild(heading);

      el.appendChild(metaRow("Perfekt auxiliary", option.aux));
      el.appendChild(tenseLine("Present", option.present, null, null));
      el.appendChild(tenseLine(`Perfekt (${option.aux})`, option.perfekt, option.partizip, option.aux));

      const note = document.createElement("p");
      note.className = "picker-result-meta";
      note.style.width = "100%";
      note.style.marginTop = "var(--space-2)";
      note.textContent = option.note;
      el.appendChild(note);
    },
  });
}

function initDestPicker() {
  initPicker({
    buttonsId: "dest-picker-buttons",
    resultId: "dest-picker-result",
    options: DEST_OPTIONS,
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

  initTripPicker();
  initDestPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Im Juli bin ich nach Portugal geflogen.", "In July I flew to Portugal."));
  discoverList.appendChild(sentenceCard("Wir sind eine Woche geblieben und haben viel gesehen.", "We stayed a week and saw a lot."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Wir sind mit dem Zug gefahren und einmal in München umgestiegen.", "We went by train and changed once in Munich."));
  applyList.appendChild(sentenceCard("Ich habe die Unterkunft online gebucht, aber den Reisepass fast vergessen.", "I booked the accommodation online but nearly forgot my passport."));
  applyList.appendChild(sentenceCard("Am Meer habe ich mich endlich erholt.", "By the sea I finally relaxed."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-travel-holidays.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(TRAVEL_IDS.map(byId).filter(Boolean), document.getElementById("grid-travel"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-travel").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-travel-holidays-quiz.json");

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
