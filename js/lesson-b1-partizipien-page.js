/**
 * Page script for lessons/b1-partizipien.html — B1 Unit 9.
 * The "unpack" picker shows an extended participle next to its
 * relative-clause equivalent; the "feel" picker contrasts a
 * cause-adjective with its experiencer-adjective twin. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-9-partizipien";

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

const PZ_IDS = [
  "pz-partizip-1-bildung", "pz-partizip-1-beispiel", "pz-partizip-2-adjektiv",
  "pz-aktiv-passiv", "pz-deklination", "pz-erweitertes-partizip",
  "pz-erw-partizip-beispiel", "pz-erw-partizip-passiv", "pz-umformung-relativ",
  "pz-zu-partizip-1", "pz-zu-partizip-1-beispiel", "pz-substantiviertes-partizip",
  "pz-angestellte", "pz-vorsitzende", "pz-gefuehle-partizip2", "pz-gefuehle-partizip1",
  "pz-begeistert", "pz-spannend", "pz-ueberraschend-vs-ueberrascht", "pz-vorhanden",
  "pz-entsprechend", "pz-betreffend", "pz-folgend", "pz-bekannt", "pz-verwendet",
  "pz-nominalstil", "pz-attribut",
];

const UNPACKS = [
  { key: "zug", label: "der schnell fahrende Zug", line: "kompakt: der schnell fahrende Zug  →  Relativsatz: der Zug, der schnell fährt", note: "Partizip I, active. Everything describing HOW it drives sits before the participle." },
  { key: "software", label: "die von der Firma entwickelte Software", line: "kompakt: die von der Firma entwickelte Software  →  Relativsatz: die Software, die von der Firma entwickelt wurde", note: "Partizip II, passive sense — the classic shape in news and product text." },
  { key: "aufgabe", label: "die zu lösende Aufgabe", line: "kompakt: die zu lösende Aufgabe  →  Relativsatz: die Aufgabe, die gelöst werden muss", note: "zu + Partizip I — a duty or possibility, not just a description." },
  { key: "bahnhof", label: "der 1985 gebaute Bahnhof", line: "kompakt: der 1985 gebaute Bahnhof  →  Relativsatz: der Bahnhof, der 1985 gebaut wurde", note: "Partizip II, passive, with a date — very common for buildings and products." },
  { key: "zahlen", label: "die letzte Woche veröffentlichten Zahlen", line: "kompakt: die letzte Woche veröffentlichten Zahlen  →  Relativsatz: die Zahlen, die letzte Woche veröffentlicht wurden", note: "same pattern, plural — watch the adjective ending change to -en." },
  { key: "brief", label: "der auf dem Tisch liegende Brief", line: "kompakt: der auf dem Tisch liegende Brief  →  Relativsatz: der Brief, der auf dem Tisch liegt", note: "Partizip I with a location phrase (\"auf dem Tisch\") packed in front of it." },
];

const FEELINGS = [
  { key: "spannend", label: "spannend / gespannt", line: "Der Film war spannend, deshalb war ich die ganze Zeit gespannt, wie es weitergeht.", note: "spannend = the film (cause) is exciting. gespannt = I (the person) am in suspense." },
  { key: "interessant", label: "interessant / interessiert", line: "Der Vortrag war wirklich interessant — alle waren sichtlich interessiert.", note: "interessant describes the talk; interessiert describes the audience's state." },
  { key: "langweilig", label: "langweilig / gelangweilt", line: "Das Meeting war langweilig, und am Ende waren alle sichtbar gelangweilt.", note: "langweilig = the meeting (cause) is boring. gelangweilt = the people are bored." },
  { key: "ueberraschend", label: "überraschend / überrascht", line: "Die Absage kam überraschend — wir waren alle ziemlich überrascht.", note: "überraschend describes the event; überrascht describes the reaction to it." },
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

function unpackRenderer(option, el) {
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

  const speakBtn = createSpeakButton(option.label, "Listen");
  if (speakBtn) el.appendChild(speakBtn);
}

function feelRenderer(option, el) {
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
    buttonsId: "unpack-picker-buttons",
    resultId: "unpack-picker-result",
    options: UNPACKS,
    renderResult: unpackRenderer,
  });
  initPicker({
    buttonsId: "feel-picker-buttons",
    resultId: "feel-picker-result",
    options: FEELINGS,
    renderResult: feelRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die vom Amt geprüften Unterlagen werden Ihnen zurückgeschickt.", "The documents checked by the office will be sent back to you. (compact)"));
  discoverList.appendChild(sentenceCard("Die Unterlagen, die vom Amt geprüft wurden, werden Ihnen zurückgeschickt.", "The documents that were checked by the office will be sent back to you. (spelled out)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der gerade ankommende Zug hat zehn Minuten Verspätung.", "The train just arriving is ten minutes late."));
  applyList.appendChild(sentenceCard("Die bis Montag einzureichenden Unterlagen liegen schon bereit.", "The documents to be submitted by Monday are already prepared."));
  applyList.appendChild(sentenceCard("Die Reisenden werden gebeten, ihre Plätze rechtzeitig einzunehmen.", "Travellers are asked to take their seats in good time."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-partizipien.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PZ_IDS.map(byId).filter(Boolean), document.getElementById("grid-pz"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-pz").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-partizipien-quiz.json");

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
