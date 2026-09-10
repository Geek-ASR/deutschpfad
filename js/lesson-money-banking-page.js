/**
 * Page script for lessons/a2-money-banking.html — A2 Unit 30 (Phase 2
 * topic unit, 28 words). The picker walks bank / shop moments (like
 * the housing ad-decoder); the apply picker gives money sentences.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-30-money-banking";

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

const MB_IDS = [
  "mb-girokonto", "mb-filiale", "mb-geldautomat", "mb-ec-karte", "mb-kreditkarte",
  "mb-pin", "mb-ueberweisung", "mb-dauerauftrag", "mb-lastschrift", "mb-kontoauszug",
  "mb-kontostand", "mb-zinsen", "mb-kredit", "mb-schulden", "mb-bargeld", "mb-schein",
  "mb-muenze", "mb-kassenbon", "mb-ueberweisen", "mb-abheben", "mb-einzahlen",
  "mb-ausgeben", "mb-sparen", "mb-sich-lohnen", "mb-leihen", "mb-zurueckzahlen",
  "mb-umtauschen", "mb-reklamieren",
];

const BANK_MOMENTS = [
  { key: "eroeffnen", moment: "Opening an account", line: "Ich möchte ein Girokonto eröffnen. Was brauche ich dafür? — Ihren Ausweis, die Meldebescheinigung und eine Unterschrift.", note: "as a new resident you also often need the Anmeldung (Unit 15). Watch for the Kontoführungsgebühr." },
  { key: "automat", moment: "At the cash machine", line: "Ich hebe am Geldautomaten 100 Euro ab, gebe die PIN ein und stecke die Karte wieder ein.", note: "\"abheben\" is separable: hebt … ab. Free at your own bank's machines." },
  { key: "zahlen", moment: "Paying — cash or card?", line: "Bar oder mit Karte? — Mit Karte, bitte. Geht das kontaktlos? — Ja, einfach dranhalten.", note: "Germans still use a lot of Bargeld; small shops may be \"nur Bargeld\"." },
  { key: "dauerauftrag", moment: "Setting up a monthly payment", line: "Die Miete überweise ich jeden Monat per Dauerauftrag — den richte ich einmal ein.", note: "Dauerauftrag = YOU push a fixed amount. überweisen AUF + Akk; no ge- (überwiesen)." },
  { key: "lastschrift", moment: "A direct debit", line: "Der Strom wird per Lastschrift von meinem Konto abgebucht.", note: "Lastschrift = the company PULLS the money, with your SEPA-Mandat." },
  { key: "kontostand", moment: "Checking the balance", line: "Ich schaue kurz auf den Kontostand. Den Kontoauszug hole ich mir einmal im Monat.", note: "\"im Minus / im Plus sein\"; the Kontoauszug lists every Buchung." },
  { key: "umtauschen", moment: "Returning a purchase", line: "Ich möchte diese Jacke umtauschen, sie ist zu klein. Hier ist der Kassenbon. — Gegen welche Größe?", note: "umtauschen GEGEN + Akk; keep the Kassenbon and the tags on." },
  { key: "reklamieren", moment: "Complaining about a fault", line: "Der Föhn ist nach zwei Tagen kaputtgegangen. Ich möchte ihn reklamieren — hier ist die Rechnung.", note: "reklamieren = for something broken/faulty, using the Garantie. \"die Reklamation\"." },
];

const CASH_OPTIONS = [
  { key: "sparen", label: "I'm trying to save each month", response: "Ich versuche, jeden Monat etwas Geld zu sparen." },
  { key: "lohnen", label: "It's not worth it", response: "Für die paar Euro lohnt sich der Aufwand nicht." },
  { key: "leihen", label: "Can you lend me 10?", response: "Kannst du mir zehn Euro leihen? Ich zahle es dir morgen zurück." },
  { key: "ausgeben", label: "I spend too much on eating out", response: "Ich gebe zu viel Geld fürs Essengehen aus." },
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

function initBankPicker() {
  initPicker({
    buttonsId: "bank-picker-buttons",
    resultId: "bank-picker-result",
    options: BANK_MOMENTS,
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

function initCashPicker() {
  initPicker({
    buttonsId: "cash-picker-buttons",
    resultId: "cash-picker-result",
    options: CASH_OPTIONS,
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

  initBankPicker();
  initCashPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("01.03.  DAUERAUFTRAG  Miete Musterstr. 4   −850,00 €", "01 Mar  STANDING ORDER  Rent, 4 Musterstr.   −€850.00"));
  discoverList.appendChild(sentenceCard("03.03.  LASTSCHRIFT  Stadtwerke Strom   −74,00 €       Kontostand: +1.213,50 €", "03 Mar  DIRECT DEBIT  City utilities, electricity   −€74.00       Balance: +€1,213.50"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Am Anfang war das mit dem Konto kompliziert, aber jetzt läuft alles automatisch.", "At first the account thing was complicated, but now everything runs automatically."));
  applyList.appendChild(sentenceCard("Ich habe mir für den Umzug Geld von meinen Eltern geliehen und zahle es in Raten zurück.", "I borrowed money from my parents for the move and I'm paying it back in instalments."));
  applyList.appendChild(sentenceCard("Die Schuhe drücken — ich tausche sie morgen gegen eine Nummer größer um.", "The shoes pinch — I'll swap them tomorrow for a size bigger."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-money-banking.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MB_IDS.map(byId).filter(Boolean), document.getElementById("grid-money"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-money").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-money-banking-quiz.json");

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
