/**
 * Page script for lessons/a2-eating-out.html — A2 Unit 29 (Phase 2
 * topic unit, 28 words). The picker walks through the moments of a
 * meal (like the housing ad-decoder); the apply picker gives ordering
 * lines. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-29-eating-out";

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

const EO_IDS = [
  "eo-lokal", "eo-kneipe", "eo-speisekarte", "eo-vorspeise", "eo-hauptgericht",
  "eo-nachtisch", "eo-beilage", "eo-tagesgericht", "eo-bedienung", "eo-rechnung",
  "eo-trinkgeld", "eo-reservierung", "eo-portion", "eo-bestellung", "eo-serviette",
  "eo-besteck", "eo-empfehlung", "eo-bestellen", "eo-empfehlen", "eo-reservieren",
  "eo-sich-beschweren", "eo-bezahlen", "eo-schmecken", "eo-servieren",
  "eo-probieren", "eo-vegetarisch", "eo-versalzen", "eo-durch",
];

const MEAL_MOMENTS = [
  { key: "reservieren", moment: "Reserving a table", line: "Guten Tag, ich möchte für Freitag um 20 Uhr einen Tisch für vier Personen reservieren.", note: "\"auf den Namen …\" if they ask; \"reservieren\" has no ge- in the participle." },
  { key: "bestellen", moment: "Ordering", line: "Ich hätte gern die Tomatensuppe als Vorspeise und das Schnitzel mit Pommes.", note: "\"Ich hätte gern …\" is the polite Konjunktiv II from Unit 13. Order: Vorspeise → Hauptgericht → Nachtisch." },
  { key: "empfehlen", moment: "Asking for a recommendation", line: "Was können Sie empfehlen? — Das Tagesgericht ist heute sehr gut.", note: "empfehlen + Dativ (person) + Akkusativ (thing); \"Was ist Ihre Empfehlung?\"" },
  { key: "beschweren", moment: "Something's wrong", line: "Entschuldigung, die Suppe ist leider kalt und etwas versalzen. Könnten Sie die zurücknehmen?", note: "polite: sich beschweren ÜBER + Akk; useful adjectives: versalzen, zäh, fad, lauwarm." },
  { key: "schmecken", moment: "Saying it's good", line: "Es schmeckt uns ausgezeichnet, vielen Dank!", note: "schmecken + Dativ (person), like gefallen: \"Schmeckt's?\" — \"Ja, sehr gut.\"" },
  { key: "zahlen", moment: "Asking for the bill", line: "Wir würden gern zahlen. — Zusammen oder getrennt? — Zusammen, bitte.", note: "\"Die Rechnung, bitte.\" / \"Wir möchten zahlen.\" \"getrennt\" = pay separately." },
  { key: "trinkgeld", moment: "Paying and tipping", line: "Das macht 23,50. — Machen Sie 26, bitte. / Stimmt so.", note: "Round up ~5–10%; say the total you want to pay, or \"Stimmt so\" = keep the change." },
  { key: "diaet", moment: "Dietary needs", line: "Ich esse vegetarisch — welche Hauptgerichte sind ohne Fleisch? Und ich bin allergisch gegen Nüsse.", note: "\"vegetarisch / vegan\"; \"allergisch gegen\" + Akk; \"Ist da … drin?\"" },
];

const ORDER_OPTIONS = [
  { key: "menue", label: "Starter and main", response: "Als Vorspeise nehme ich den Salat, als Hauptgericht die Pasta." },
  { key: "cafe", label: "Just a coffee and cake", response: "Für mich nur einen Cappuccino und ein Stück Käsekuchen, bitte." },
  { key: "vegi", label: "Ask what's vegetarian", response: "Welche Gerichte auf der Karte sind vegetarisch?" },
  { key: "zahlen", label: "Pay, keep the change", response: "Das macht 23,50? Machen Sie 26, stimmt so." },
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

function initDinePicker() {
  initPicker({
    buttonsId: "dine-picker-buttons",
    resultId: "dine-picker-result",
    options: MEAL_MOMENTS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.moment;
      el.appendChild(heading);

      const line = document.createElement("p");
      line.lang = "de";
      line.style.width = "100%";
      line.style.margin = "0";
      line.style.fontSize = "var(--text-md)";
      line.style.lineHeight = "1.9";
      line.textContent = option.line;
      el.appendChild(line);

      const note = document.createElement("p");
      note.className = "picker-result-meta";
      note.style.width = "100%";
      note.style.marginTop = "var(--space-2)";
      note.textContent = option.note;
      el.appendChild(note);

      const speakBtn = createSpeakButton(option.line, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initOrderPicker() {
  initPicker({
    buttonsId: "order-picker-buttons",
    resultId: "order-picker-result",
    options: ORDER_OPTIONS,
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

  initDinePicker();
  initOrderPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Haben Sie schon gewählt, oder brauchen Sie noch einen Moment?", "Have you chosen yet, or do you need another minute?"));
  discoverList.appendChild(sentenceCard("Ich hätte gern das Tagesgericht und einen kleinen Salat als Beilage.", "I'd like the dish of the day and a small salad on the side."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Kellnerin hat uns den Fisch empfohlen, und er hat allen sehr geschmeckt.", "The waitress recommended us the fish, and everyone really liked it."));
  applyList.appendChild(sentenceCard("Auf der Rechnung war ein Bier zu viel — wir haben uns höflich beschwert.", "There was one beer too many on the bill — we complained politely."));
  applyList.appendChild(sentenceCard("Zusammen macht das 41,80. — Machen Sie 45, bitte, der Rest ist für Sie.", "Together that's 41.80. — Make it 45, please, the rest is for you."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-eating-out.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(EO_IDS.map(byId).filter(Boolean), document.getElementById("grid-eatingout"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-eatingout").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-eating-out-quiz.json");

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
