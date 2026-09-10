/**
 * Page script for lessons/a2-housing.html — A2 Unit 23 (first Phase 2
 * topic unit). Vocabulary-forward: 28 words. The picker decodes terms
 * from a typical German rental ad; the apply picker gives viewing
 * phrases. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-23-housing";

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

const HOUSING_IDS = [
  "hs-miete", "hs-nebenkosten", "hs-warmmiete", "hs-kaltmiete", "hs-kaution",
  "hs-vermieter", "hs-mieter", "hs-mietvertrag", "hs-wg", "hs-wohnungssuche",
  "hs-inserat", "hs-besichtigung", "hs-umzug", "hs-einziehen", "hs-ausziehen",
  "hs-mieten", "hs-vermieten", "hs-besichtigen", "hs-renovieren", "hs-moebliert",
  "hs-quadratmeter", "hs-grundriss", "hs-ausstattung", "hs-heizung", "hs-balkon",
  "hs-keller", "hs-hausmeister", "hs-hausordnung",
];

const AD_TERMS = [
  { key: "km-wm", term: "KM / WM", means: "Kaltmiete (rent for the flat) vs. Warmmiete (KM + Nebenkosten — what you transfer).", sentence: "KM 650 €, NK 170 €, WM 820 €." },
  { key: "nk", term: "NK", means: "Nebenkosten — heating, water, rubbish, caretaker; usually a monthly advance payment.", sentence: "Die NK von 170 € sind eine Vorauszahlung." },
  { key: "zkb", term: "2 ZKB", means: "2 Zimmer, Küche, Bad — the standard way to state the size (living/bedrooms only; kitchen and bath are extra).", sentence: "2 ZKB, 58 m², 3. OG ohne Aufzug." },
  { key: "ebk", term: "EBK", means: "Einbauküche — the fitted kitchen stays in the flat and is included.", sentence: "Helle Wohnung mit EBK und Balkon." },
  { key: "kaution", term: "Kaution", means: "Deposit, usually 2–3 Kaltmieten; returned when you move out if there's no damage.", sentence: "Kaution: 3 Kaltmieten (1.950 €)." },
  { key: "provfrei", term: "provisionsfrei", means: "No estate agent's commission to pay — you deal directly with the landlord.", sentence: "Provisionsfrei, direkt vom Eigentümer." },
  { key: "altneu", term: "Altbau / Neubau", means: "Altbau: pre-~1950, high ceilings, more charm, worse insulation. Neubau: modern and well insulated.", sentence: "Schöner Altbau mit Stuck, 3,20 m Deckenhöhe." },
  { key: "erstbezug", term: "Erstbezug", means: "You'd be the first person to live in it — the flat is new or has just been fully renovated.", sentence: "Erstbezug nach Sanierung, frei ab sofort." },
];

const VIEW_OPTIONS = [
  { key: "haustiere", label: "Are pets allowed?", response: "Sind Haustiere in der Wohnung erlaubt?" },
  { key: "einzug", label: "When could I move in?", response: "Ab wann könnte ich einziehen?" },
  { key: "nk", label: "How high are the utility costs?", response: "Wie hoch sind die Nebenkosten im Monat?" },
  { key: "bewerben", label: "I'd like to apply for the flat", response: "Ich würde mich sehr gern um die Wohnung bewerben." },
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

function initAdPicker() {
  initPicker({
    buttonsId: "ad-picker-buttons",
    resultId: "ad-picker-result",
    options: AD_TERMS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.term;
      el.appendChild(heading);

      const means = document.createElement("p");
      means.style.width = "100%";
      means.style.margin = "0";
      means.style.fontSize = "var(--text-md)";
      means.textContent = option.means;
      el.appendChild(means);

      const sample = document.createElement("p");
      sample.className = "picker-result-meta";
      sample.lang = "de";
      sample.style.width = "100%";
      sample.style.marginTop = "var(--space-2)";
      sample.textContent = `In an ad: "${option.sentence}"`;
      el.appendChild(sample);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initViewPicker() {
  initPicker({
    buttonsId: "view-picker-buttons",
    resultId: "view-picker-result",
    options: VIEW_OPTIONS,
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

  initAdPicker();
  initViewPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("2 ZKB, 58 m², KM 650 € + NK 170 €, Kaution 3 MM, provisionsfrei.", "2 rooms/kitchen/bath, 58 m², base rent €650 + bills €170, deposit 3 months, no agent fee."));
  discoverList.appendChild(sentenceCard("Also: 820 Euro warm im Monat, plus einmalig 1.950 Euro Kaution.", "So: €820 a month all-in, plus a one-off €1,950 deposit."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich suche seit zwei Monaten eine Wohnung und war schon auf zehn Besichtigungen.", "I've been looking for a flat for two months and been to ten viewings already."));
  applyList.appendChild(sentenceCard("Die Wohnung ist frisch renoviert, teilmöbliert und hat einen kleinen Balkon.", "The flat is freshly renovated, partly furnished and has a small balcony."));
  applyList.appendChild(sentenceCard("Wenn ich den Zuschlag bekomme, ziehe ich zum ersten August ein.", "If I get the flat, I'll move in on the first of August."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-housing.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(HOUSING_IDS.map(byId).filter(Boolean), document.getElementById("grid-housing"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-housing").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-housing-quiz.json");

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
