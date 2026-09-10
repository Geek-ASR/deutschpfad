/**
 * Page script for lessons/a2-environment.html — A2 Unit 27 (Phase 2
 * topic unit, 28 words). The picker sorts waste into the right German
 * bin (like the housing ad-decoder); the apply picker gives eco
 * sentences. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-27-environment";

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

const UW_IDS = [
  "uw-umwelt", "uw-umweltschutz", "uw-klimawandel", "uw-klima",
  "uw-umweltverschmutzung", "uw-muelltrennung", "uw-abfall", "uw-muelltonne",
  "uw-restmuell", "uw-biomuell", "uw-altglas", "uw-altpapier", "uw-verpackung",
  "uw-pfand", "uw-pfandautomat", "uw-plastiktuete", "uw-mehrwegflasche",
  "uw-nachhaltigkeit", "uw-trennen", "uw-wegwerfen", "uw-recyceln", "uw-sparen",
  "uw-vermeiden", "uw-schuetzen", "uw-verbrauchen", "uw-umweltfreundlich",
  "uw-nachhaltig", "uw-bio",
];

const BIN_TYPES = [
  { key: "bio", term: "Gemüsereste, Kaffeesatz, Eierschalen", bin: "Biomüll — die braune Tonne", note: "food and garden waste; it's composted. No plastic bags, even \"biologisch abbaubar\" ones." },
  { key: "papier", term: "Zeitungen, Kartons, Papiertüten", bin: "Altpapier — die blaue Tonne", note: "paper and cardboard. Flatten boxes; no greasy pizza boxes, no coated paper." },
  { key: "glas", term: "Weinflaschen, Marmeladengläser", bin: "Altglas — der Glascontainer", note: "sorted by colour: Weißglas / Grünglas / Braunglas. Lids off. NOT deposit bottles." },
  { key: "gelb", term: "Joghurtbecher, Plastikfolie, Konservendosen", bin: "Gelber Sack / gelbe Tonne", note: "plastic and metal Verpackungen. Rinsed, not washed; keep components separate where you can." },
  { key: "pfand", term: "Pfandflaschen (PET, Bier), Dosen mit Pfand", bin: "Pfandautomat im Supermarkt", note: "not a bin at all — you put them in the machine and get a voucher (Bon) for your deposit back." },
  { key: "rest", term: "kaputtes Geschirr, Windeln, Zigaretten, Staubsaugerbeutel", bin: "Restmüll — die graue / schwarze Tonne", note: "everything that can't be sorted anywhere else." },
  { key: "sonder", term: "alte Batterien, Energiesparlampen, Farbe, Medikamente", bin: "Sondermüll — Sammelstelle / Schadstoffmobil", note: "hazardous waste — never in the household bins. Shops take back batteries and bulbs." },
  { key: "sperr", term: "alte Möbel, ein kaputter Kühlschrank, Matratzen", bin: "Sperrmüll / Recyclinghof", note: "book a Sperrmüll collection with the city, or drive it to the Recyclinghof yourself." },
];

const ECO_OPTIONS = [
  { key: "trennen", label: "I always separate my rubbish", response: "Ich trenne meinen Müll immer sorgfältig." },
  { key: "plastik", label: "I try to avoid plastic", response: "Ich versuche, Plastik so gut wie möglich zu vermeiden." },
  { key: "rad", label: "I cycle instead of driving", response: "Statt mit dem Auto zu fahren, nehme ich das Fahrrad." },
  { key: "bio", label: "I buy organic and regional", response: "Ich kaufe möglichst bio und aus der Region." },
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

function initBinPicker() {
  initPicker({
    buttonsId: "bin-picker-buttons",
    resultId: "bin-picker-result",
    options: BIN_TYPES,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.term;
      el.appendChild(heading);

      const bin = document.createElement("p");
      bin.lang = "de";
      bin.style.width = "100%";
      bin.style.margin = "0";
      bin.style.fontSize = "var(--text-md)";
      bin.innerHTML = `→ <strong>${option.bin}</strong>`;
      el.appendChild(bin);

      const note = document.createElement("p");
      note.className = "picker-result-meta";
      note.style.width = "100%";
      note.style.marginTop = "var(--space-2)";
      note.textContent = option.note;
      el.appendChild(note);

      const speakBtn = createSpeakButton(option.bin, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initEcoPicker() {
  initPicker({
    buttonsId: "eco-picker-buttons",
    resultId: "eco-picker-result",
    options: ECO_OPTIONS,
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

  initBinPicker();
  initEcoPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("An alle: Kaffeesatz kommt in den Biomüll, NICHT in den Restmüll! Danke.", "To everyone: coffee grounds go in the food-waste bin, NOT the general waste! Thanks."));
  discoverList.appendChild(sentenceCard("Die Pfandflaschen bitte nicht ins Altglas — die bringen wir zum Automaten.", "Please don't put the deposit bottles in the bottle bank — we take those to the machine."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Am Anfang war die Mülltrennung kompliziert, aber jetzt mache ich das automatisch.", "At first sorting the rubbish was complicated, but now I do it automatically."));
  applyList.appendChild(sentenceCard("Um Strom zu sparen, ziehe ich abends alle Stecker.", "To save electricity, I unplug everything in the evening."));
  applyList.appendChild(sentenceCard("Mit dem Zug zu reisen ist zwar langsamer, aber viel umweltfreundlicher.", "Travelling by train is slower, admittedly, but much more environmentally friendly."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-environment.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(UW_IDS.map(byId).filter(Boolean), document.getElementById("grid-environment"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-environment").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-environment-quiz.json");

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
