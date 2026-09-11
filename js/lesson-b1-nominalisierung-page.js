/**
 * Page script for lessons/b1-nominalisierung.html — B1 Unit 10.
 * The "suffix" picker shows a verb/adjective → noun transformation for
 * each pattern; the "compress" picker shows a clause next to its
 * bei/nach/vor/durch/mit + noun equivalent. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-10-nominalisierung";

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

const NOM_IDS = [
  "nom-ung", "nom-ung-beispiel", "nom-heit-keit", "nom-heit-beispiel",
  "nom-infinitiv-nomen", "nom-infinitiv-beispiel", "nom-schaft", "nom-tum",
  "nom-nis", "nom-e-stamm", "nom-er-agent", "nom-bei", "nom-nach", "nom-vor",
  "nom-durch", "nom-mit", "nom-trotz-wegen", "nom-bei-nichtzahlung",
  "nom-verbalisierung", "nom-verbalisierung-beispiel", "nom-artikel-verb",
  "nom-anstieg", "nom-rueckgang", "nom-durchfuehrung", "nom-veroeffentlichung",
  "nom-einfuehrung", "nom-pruefung", "nom-verwendung",
];

const SUFFIXES = [
  { key: "ung", label: "-ung (aus Verben)", line: "entscheiden → die Entscheidung, kündigen → die Kündigung, bewerben → die Bewerbung", note: "the most productive pattern for turning a verb into a noun. Always feminine." },
  { key: "heitkeit", label: "-heit / -keit / -igkeit (aus Adjektiven)", line: "möglich → die Möglichkeit, schwierig → die Schwierigkeit, frei → die Freiheit", note: "turns an adjective into a noun. Always feminine." },
  { key: "infinitiv", label: "substantivierter Infinitiv", line: "rauchen → das Rauchen, lesen → das Lesen, Auto fahren → das Autofahren", note: "any infinitive, capitalised, becomes a neuter noun with no plural." },
  { key: "schafttum", label: "-schaft / -tum / -nis", line: "Mitglied → die Mitgliedschaft, wachsen → das Wachstum, ergeben → das Ergebnis", note: "smaller but common patterns — collective/state (-schaft, -tum) and result/experience (-nis)." },
  { key: "estamm", label: "-e (Verbstamm, oft unregelmäßig)", line: "helfen → die Hilfe, suchen → die Suche, fragen → die Frage, bitten → die Bitte", note: "a smaller irregular group — learn these as vocabulary rather than a rule." },
  { key: "eragent", label: "-er / -erin (die handelnde Person)", line: "verkaufen → der Verkäufer, vermieten → der Vermieter, arbeiten geben → der Arbeitgeber", note: "the agent-noun pattern from A1/A2 professions — also a kind of nominalisation." },
];

const COMPRESSIONS = [
  { key: "bei", label: "bei ≈ wenn", line: "Satz: Wenn man ankommt, muss man sich anmelden.  →  kompakt: Bei der Ankunft muss man sich anmelden.", note: "bei + Nominalisierung replaces a wenn/sobald-clause." },
  { key: "nach", label: "nach ≈ nachdem", line: "Satz: Nachdem er sich beworben hatte, wartete er zwei Wochen.  →  kompakt: Nach seiner Bewerbung wartete er zwei Wochen.", note: "nach + Nominalisierung replaces a nachdem-clause (Unit 5)." },
  { key: "vor", label: "vor ≈ bevor", line: "Satz: Bevor ich abreise, prüfe ich die Papiere.  →  kompakt: Vor der Abreise prüfe ich die Papiere.", note: "vor + Nominalisierung replaces a bevor-clause." },
  { key: "durch", label: "durch ≈ weil (Mittel/Ursache)", line: "Satz: Weil die Preise gestiegen sind, sparen viele.  →  kompakt: Durch den Preisanstieg sparen viele.", note: "durch + Nominalisierung names the means or cause, like \"dadurch, dass …\"." },
  { key: "mit", label: "mit ≈ als/nachdem (Begleitumstand)", line: "Satz: Als das neue System eingeführt wurde, änderte sich vieles.  →  kompakt: Mit der Einführung des neuen Systems änderte sich vieles.", note: "mit + Nominalisierung marks an accompanying change." },
  { key: "wegen", label: "wegen ≈ weil (Grund, Unit 7)", line: "Satz: Weil die Kosten steigen, gibt es Kürzungen.  →  kompakt: Wegen der steigenden Kosten gibt es Kürzungen.", note: "the Genitiv preposition from Unit 7 is nominalisation applied to a reason clause." },
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

function pickerRenderer(option, el) {
  el.innerHTML = "";

  const heading = document.createElement("span");
  heading.className = "picker-result-word";
  heading.lang = "de";
  heading.textContent = option.label;
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
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initPicker({
    buttonsId: "suffix-picker-buttons",
    resultId: "suffix-picker-result",
    options: SUFFIXES,
    renderResult: pickerRenderer,
  });
  initPicker({
    buttonsId: "compress-picker-buttons",
    resultId: "compress-picker-result",
    options: COMPRESSIONS,
    renderResult: pickerRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Wenn die Miete nicht gezahlt wird, kann der Vertrag gekündigt werden.", "If the rent isn't paid, the contract can be terminated."));
  discoverList.appendChild(sentenceCard("Bei Nichtzahlung der Miete kann der Vertrag gekündigt werden.", "In case of non-payment of rent, the contract can be terminated."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Nach Prüfung der Unterlagen erhalten Sie eine Rückmeldung.", "After checking the documents, you'll receive a reply."));
  applyList.appendChild(sentenceCard("Vor der Unterschrift sollten Sie den Vertrag genau lesen.", "Before signing, you should read the contract carefully."));
  applyList.appendChild(sentenceCard("Wegen des Personalmangels kam es zu Verzögerungen.", "Because of the staff shortage there were delays."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-nominalisierung.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(NOM_IDS.map(byId).filter(Boolean), document.getElementById("grid-nom"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-nom").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-nominalisierung-quiz.json");

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
