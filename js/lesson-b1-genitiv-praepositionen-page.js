/**
 * Page script for lessons/b1-genitiv-praepositionen.html — B1 Unit 7.
 * The "gp" picker shows each Genitive preposition in a sentence with a
 * register note; the "amt" picker decodes an official line into plain
 * German. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-7-genitiv-praepositionen";

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

const GP_IDS = [
  "gp-genitiv-praep", "gp-wegen", "gp-aufgrund", "gp-infolge", "gp-trotz",
  "gp-waehrend", "gp-statt", "gp-innerhalb", "gp-ausserhalb", "gp-oberhalb",
  "gp-diesseits", "gp-laut", "gp-anlaesslich", "gp-angesichts", "gp-hinsichtlich",
  "gp-mithilfe", "gp-anhand", "gp-mittels", "gp-zwecks", "gp-seitens",
  "gp-ungeachtet", "gp-abzueglich", "gp-dativ-umgangssprache", "gp-bewusst",
  "gp-verdaechtig", "gp-genitivattribut", "gp-amtsdeutsch",
];

const PREPS = [
  { key: "aufgrund", label: "aufgrund (reason, formal)", line: "Aufgrund des schlechten Wetters wurde das Sommerfest abgesagt.", note: "written 'because of' — news, notices, official letters. Everyday speech says 'wegen'." },
  { key: "infolge", label: "infolge (consequence)", line: "Infolge des Unfalls kam es zu einem langen Stau.", note: "stronger than 'aufgrund': it names a direct result. Formal." },
  { key: "trotz", label: "trotz (concession)", line: "Trotz der hohen Preise war der Markt gut besucht.", note: "'in spite of'. Genitive in writing (trotz der Preise); Dative in speech (trotz den Preisen)." },
  { key: "waehrend", label: "während (time span)", line: "Während der Fahrt ist das Rauchen nicht gestattet.", note: "temporal 'during'. Not to be confused with the connector 'während' = 'whereas' (Unit 3)." },
  { key: "innerhalb", label: "innerhalb / außerhalb (span)", line: "Bitte reichen Sie den Antrag innerhalb der Frist ein — außerhalb der Öffnungszeiten geht es nur online.", note: "time or space. With a bare plural, innerhalb switches to 'von' + Dative: 'innerhalb von zwei Wochen'." },
  { key: "laut", label: "laut (source)", line: "Laut Auskunft der Bahn fährt der Zug pünktlich.", note: "'according to'. Genitive or Dative both fine; a bare noun takes no ending ('laut Gesetz')." },
  { key: "bezueglich", label: "hinsichtlich / bezüglich (topic)", line: "Bezüglich Ihrer Anfrage vom 5. März teilen wir Ihnen Folgendes mit.", note: "'regarding' — the standard formal-letter opener. Less formal: 'in Bezug auf' + Akkusativ." },
  { key: "mithilfe", label: "mithilfe / anhand / mittels (means)", line: "Anhand der Rechnung konnten wir den Fehler schnell finden.", note: "mithilfe = with help of; anhand = using as a reference; mittels = by means of (technical)." },
  { key: "angesichts", label: "angesichts (in view of)", line: "Angesichts der steigenden Kosten sollten wir den Vertrag prüfen.", note: "opens a sentence with a striking fact that justifies a reaction. Good in an opinion essay." },
  { key: "seitens", label: "seitens (on the part of)", line: "Seitens der Behörde gab es dazu bisher keine Stellungnahme.", note: "names who an action or non-action comes from, formally. Also 'vonseiten'." },
];

const NOTICES = [
  { key: "abgesagt", label: "\"Aufgrund technischer Störungen entfällt der Zug.\"", response: "Plain: \"Der Zug fällt aus, weil es eine technische Störung gibt.\" — 'entfallen' = 'ausfallen', 'aufgrund + Gen' = 'weil'." },
  { key: "frist", label: "\"Widerspruch ist innerhalb eines Monats einzulegen.\"", response: "Plain: \"Sie können innerhalb von einem Monat Widerspruch einlegen.\" — note 'ist … einzulegen' (sein + zu, Unit 2) = 'muss/kann eingelegt werden'." },
  { key: "unterlagen", label: "\"Bezüglich fehlender Unterlagen werden Sie gesondert informiert.\"", response: "Plain: \"Wenn Unterlagen fehlen, bekommen Sie dazu eine extra Nachricht.\"" },
  { key: "zutritt", label: "\"Außerhalb der Sprechzeiten ist der Zutritt nur mit Termin möglich.\"", response: "Plain: \"Wenn keine Sprechstunde ist, kommen Sie nur mit einem Termin rein.\"" },
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

function prepRenderer(option, el) {
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

function noticeRenderer(option, el) {
  el.innerHTML = "";
  const word = document.createElement("span");
  word.className = "picker-result-word";
  word.style.fontSize = "var(--text-md)";
  word.textContent = option.response;
  el.appendChild(word);
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initPicker({
    buttonsId: "gp-picker-buttons",
    resultId: "gp-picker-result",
    options: PREPS,
    renderResult: prepRenderer,
  });
  initPicker({
    buttonsId: "amt-picker-buttons",
    resultId: "amt-picker-result",
    options: NOTICES,
    renderResult: noticeRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Wegen dem Stau bin ich zu spät — sorry!", "Because of the traffic jam I'm late — sorry! (spoken: Dative)"));
  discoverList.appendChild(sentenceCard("Aufgrund eines Verkehrsunfalls kommt es auf der A3 zu Verzögerungen.", "Due to a traffic accident there are delays on the A3. (written: Genitive)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Trotz der langen Wartezeit wurde ich am Ende freundlich beraten.", "Despite the long wait I was given friendly advice in the end."));
  applyList.appendChild(sentenceCard("Innerhalb von zwei Wochen müssen die Unterlagen beim Amt sein.", "The documents have to be at the office within two weeks."));
  applyList.appendChild(sentenceCard("Angesichts der hohen Miete überlege ich, in eine WG zu ziehen.", "Given the high rent, I'm thinking about moving into a shared flat."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-genitiv-praepositionen.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(GP_IDS.map(byId).filter(Boolean), document.getElementById("grid-gp"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-gp").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-genitiv-praepositionen-quiz.json");

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
