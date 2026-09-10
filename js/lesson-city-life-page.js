/**
 * Page script for lessons/a2-city-life.html — A2 Unit 8, same shape
 * as the other A2 grammar-unit glue. The picker shows each direction
 * as a formal Sie-imperative and an informal du-imperative, with the
 * command verb chipped (shared .word-breakdown-part) and a note on
 * the form (stem change / separable / -t stem). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-8-city-life";

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

const CITY_IDS = [
  "cl-kreuzung",
  "cl-ampel",
  "cl-ecke",
  "cl-abbiegen",
  "cl-fussgaengerzone",
  "cl-rathaus",
  "cl-stadtplan",
  "cl-stock",
  "cl-etage",
  "cl-aufzug",
  "cl-treppe",
  "cl-bruecke",
  "cl-entlang",
];

// sieVerb / duVerb = the command verb to chip in each sentence.
const DIRECTIONS = [
  { key: "geradeaus", label: "go straight", sie: "Gehen Sie geradeaus.", sieVerb: "Gehen", du: "Geh geradeaus.", duVerb: "Geh", note: "regular verb — du drops the -st and the pronoun" },
  { key: "abbiegen", label: "turn left", sie: "Biegen Sie an der Ampel links ab.", sieVerb: "Biegen", du: "Bieg an der Ampel links ab.", duVerb: "Bieg", note: "separable — ab goes to the end" },
  { key: "nehmen", label: "take a street", sie: "Nehmen Sie die erste Straße rechts.", sieVerb: "Nehmen", du: "Nimm die erste Straße rechts.", duVerb: "Nimm", note: "stem change e → i: du form is Nimm, not Nehm" },
  { key: "fahren", label: "drive on", sie: "Fahren Sie geradeaus weiter.", sieVerb: "Fahren", du: "Fahr geradeaus weiter.", duVerb: "Fahr", note: "a → ä verb — but the du imperative DROPS the umlaut: Fahr" },
  { key: "warten", label: "wait", sie: "Warten Sie an der Ampel.", sieVerb: "Warten", du: "Warte an der Ampel.", duVerb: "Warte", note: "stem ends in -t → keep the -e: Warte" },
  { key: "aussteigen", label: "get off", sie: "Steigen Sie an der Kreuzung aus.", sieVerb: "Steigen", du: "Steig an der Kreuzung aus.", duVerb: "Steig", note: "separable — aus goes to the end" },
  { key: "bruecke", label: "cross the bridge", sie: "Gehen Sie über die Brücke.", sieVerb: "Gehen", du: "Geh über die Brücke.", duVerb: "Geh", note: "über + Akkusativ (die Brücke) — movement, Unit 3 rule" },
  { key: "entschuldigen", label: "ask politely", sie: "Entschuldigen Sie, können Sie mir sagen, wo der Bahnhof ist?", sieVerb: "Entschuldigen", du: "Entschuldige, kannst du mir sagen, wo der Bahnhof ist?", duVerb: "Entschuldige", note: "indirect question — ist goes to the very end" },
];

const WAY_OPTIONS = [
  { key: "links", label: "Straight, then left at the lights", response: "Gehen Sie geradeaus und biegen Sie an der Ampel links ab. Der Bahnhof ist dann auf der rechten Seite." },
  { key: "zweite", label: "Second street on the right", response: "Nehmen Sie die zweite Straße rechts, dann sehen Sie den Bahnhof schon." },
  { key: "ubahn", label: "Better to take the U-Bahn", response: "Zu Fuß ist es weit. Nehmen Sie die U-Bahn, Linie 2, bis zum Hauptbahnhof." },
  { key: "keineahnung", label: "Sorry, I'm not from here", response: "Tut mir leid, ich bin auch nicht von hier. Fragen Sie am besten im Geschäft dort." },
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

function imperativeLine(label, sentence, verbWord, tone) {
  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.style.marginTop = "var(--space-2)";

  const tag = document.createElement("span");
  tag.className = "picker-result-meta";
  tag.style.margin = "0";
  tag.style.fontWeight = "700";
  tag.style.color = tone === "sie" ? "var(--color-primary)" : "var(--color-accent)";
  tag.textContent = label;
  wrap.appendChild(tag);

  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${verbWord}</span>`;
  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.lineHeight = "2.2";
  p.style.margin = "0";
  p.innerHTML = sentence.replace(new RegExp("\\b" + verbWord + "\\b"), chip);
  wrap.appendChild(p);

  const speakBtn = createSpeakButton(sentence, "Listen");
  if (speakBtn) wrap.appendChild(speakBtn);
  return wrap;
}

function initDirPicker() {
  initPicker({
    buttonsId: "dir-picker-buttons",
    resultId: "dir-picker-result",
    options: DIRECTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.label;
      el.appendChild(heading);

      el.appendChild(imperativeLine("formal — Sie", option.sie, option.sieVerb, "sie"));
      el.appendChild(imperativeLine("informal — du", option.du, option.duVerb, "du"));

      const note = document.createElement("p");
      note.className = "picker-result-meta";
      note.style.width = "100%";
      note.style.marginTop = "var(--space-2)";
      note.textContent = option.note;
      el.appendChild(note);
    },
  });
}

function initWayPicker() {
  initPicker({
    buttonsId: "way-picker-buttons",
    resultId: "way-picker-result",
    options: WAY_OPTIONS,
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

  initDirPicker();
  initWayPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Entschuldigung, wie komme ich zum Rathaus?", "Excuse me, how do I get to the town hall?"));
  discoverList.appendChild(sentenceCard("Gehen Sie geradeaus und biegen Sie an der Kreuzung rechts ab.", "Go straight ahead and turn right at the intersection."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Nehmen Sie den Aufzug in den dritten Stock, das Büro ist links.", "Take the lift to the third floor, the office is on the left."));
  applyList.appendChild(sentenceCard("Geh die Straße entlang bis zur Ampel, dann siehst du die Post.", "Go along the street to the traffic light, then you'll see the post office."));
  applyList.appendChild(sentenceCard("Können Sie mir sagen, wo hier eine Apotheke ist?", "Can you tell me where there's a pharmacy near here?"));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-city-life.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(CITY_IDS.map(byId).filter(Boolean), document.getElementById("grid-city"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-city").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-city-life-quiz.json");

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
