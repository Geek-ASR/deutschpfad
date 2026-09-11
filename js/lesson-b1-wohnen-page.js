/**
 * Page script for lessons/b1-wohnen.html — B1 Unit 15 (topic unit).
 * The "dispute" picker walks housing situations beyond move-in day
 * (A2 Unit 23); the "rights" picker explains a piece of German
 * tenant protection. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-15-wohnen";

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

const NK_IDS = [
  "nk-nebenkostenabrechnung", "nk-betriebskosten", "nk-vorauszahlung",
  "nk-nachzahlung", "nk-guthaben", "nk-abrechnungszeitraum",
  "nk-widerspruch-einlegen", "nk-mangel", "nk-maengelanzeige",
  "nk-mietminderung", "nk-mieterhoehung", "nk-mietspiegel", "nk-ortsueblich",
  "nk-kuendigen-wohnung", "nk-eigenbedarf", "nk-schoenheitsreparaturen",
  "nk-renovierungspflicht", "nk-uebergabeprotokoll", "nk-mieterverein",
  "nk-mieterschutz", "nk-untermiete", "nk-hausverwaltung", "nk-eigentuemer",
  "nk-eigentumswohnung", "nk-wohngeld", "nk-genossenschaftswohnung",
  "nk-frist-setzen", "nk-schriftlich",
];

const DISPUTES = [
  { key: "abrechnung", moment: "The Nebenkostenabrechnung arrives", line: "Laut Abrechnung habe ich ein Guthaben von sechzig Euro — die wurden mir letzte Woche überwiesen.", note: "check the Abrechnungszeitraum and the individual items — mistakes happen more often than you'd think." },
  { key: "mangel", moment: "Finding a defect", line: "Die Heizung im Wohnzimmer wird nicht warm. Ich melde das schriftlich und setze eine Frist von zwei Wochen.", note: "always in writing, always with a Frist — it protects you if the landlord is slow to act." },
  { key: "erhoehung", moment: "A rent-increase letter arrives", line: "Der Vermieter kündigt eine Mieterhöhung an und verweist auf den Mietspiegel.", note: "check the increase against the Mietspiegel yourself, or ask a Mieterverein — it's not automatically valid." },
  { key: "kuendigung", moment: "Giving notice", line: "Hiermit kündige ich meine Wohnung fristgerecht zum 31. März.", note: "\"fristgerecht\" = within the proper notice period. Keep a copy and proof of sending." },
  { key: "auszug", moment: "Moving out", line: "Beim Auszug haben wir gemeinsam das Übergabeprotokoll unterschrieben.", note: "insist on this every time — it's your main protection against a disputed Kaution deduction." },
];

const RIGHTS = [
  { key: "minderung", label: "Mietminderung", response: "Bei einem erheblichen Mangel darf man die Miete mindern, bis er behoben ist — man sollte den Vermieter aber vorher informieren." },
  { key: "verein", label: "Der Mieterverein", response: "Für einen kleinen Jahresbeitrag prüft der Mieterverein Verträge, Abrechnungen und Kündigungen." },
  { key: "eigenbedarf", label: "Kündigung durch den Vermieter", response: "Ein Vermieter kann nicht ohne Grund kündigen — Eigenbedarf ist der häufigste zulässige Grund." },
  { key: "reparaturen", label: "Schönheitsreparaturen", response: "Ob man beim Auszug renovieren muss, hängt vom genauen Wortlaut des Mietvertrags ab — viele Klauseln sind unwirksam." },
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

function initDisputePicker() {
  initPicker({
    buttonsId: "dispute-picker-buttons",
    resultId: "dispute-picker-result",
    options: DISPUTES,
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

function initRightsPicker() {
  initPicker({
    buttonsId: "rights-picker-buttons",
    resultId: "rights-picker-result",
    options: RIGHTS,
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

  initDisputePicker();
  initRightsPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Laut Nebenkostenabrechnung erhalten Sie ein Guthaben von 45,20 Euro.", "According to the utility statement, you're due a credit of €45.20."));
  discoverList.appendChild(sentenceCard("Leider müssen wir Ihnen eine Nachzahlung von 180 Euro in Rechnung stellen.", "Unfortunately we have to bill you for a €180 additional payment."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Wegen des Schimmels im Bad habe ich eine Mietminderung von zehn Prozent geltend gemacht.", "Because of the mould in the bathroom I claimed a ten percent rent reduction."));
  applyList.appendChild(sentenceCard("Die Mieterhöhung liegt über der ortsüblichen Vergleichsmiete — ich widerspreche schriftlich.", "The rent increase is above the locally customary rate — I'm objecting in writing."));
  applyList.appendChild(sentenceCard("Der Mieterverein hat bestätigt, dass die Klausel zu den Schönheitsreparaturen unwirksam ist.", "The tenants' association confirmed that the cosmetic-repairs clause is invalid."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-wohnen.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(NK_IDS.map(byId).filter(Boolean), document.getElementById("grid-nk"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-nk").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-wohnen-quiz.json");

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
