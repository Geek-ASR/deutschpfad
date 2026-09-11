/**
 * Page script for lessons/b1-behoerden.html — B1 Unit 25 (topic unit,
 * final of the planned B1 topic list). The "topic" picker walks core
 * authority-dealing situations (permits, rejections, proof, jurisdiction,
 * power of attorney); the "action" picker answers "what would you do?"
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-25-behoerden";

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

const BEH_IDS = [
  "beh-behoerde", "beh-auslaenderbehoerde", "beh-aufenthaltstitel",
  "beh-aufenthaltserlaubnis", "beh-bescheid", "beh-widerspruch",
  "beh-widerspruchsfrist", "beh-ablehnung", "beh-genehmigung",
  "beh-bescheinigung", "beh-nachweis", "beh-vollmacht",
  "beh-zustaendigkeit", "beh-akte", "beh-frist", "beh-antragsteller",
  "beh-einspruch", "beh-verlaengerung", "beh-zustaendig",
  "beh-fristgerecht", "beh-rechtskraeftig", "beh-einlegen",
  "beh-ablehnen", "beh-genehmigen", "beh-verlaengern",
  "beh-nachweisen", "beh-einreichen", "beh-sich-wenden",
];

const TOPICS = [
  { key: "aufenthaltstitel", moment: "Renewing your residence permit", line: "Ich muss meinen Aufenthaltstitel rechtzeitig bei der Ausländerbehörde verlängern lassen.", note: "\"verlängern lassen\" — always start the renewal process well before the Frist runs out." },
  { key: "ablehnung", moment: "Getting a rejection", line: "Der Bescheid war eine Ablehnung, aber ich kann innerhalb der Widerspruchsfrist Widerspruch einlegen.", note: "a Bescheid isn't always positive — but a Widerspruch gives you a formal way to challenge it." },
  { key: "nachweis", moment: "Providing proof", line: "Für den Antrag muss ich einen Nachweis über mein Einkommen erbringen.", note: "\"einen Nachweis erbringen\" = to provide proof — a very common bureaucratic phrase." },
  { key: "zustaendigkeit", moment: "Finding the right office", line: "Für diese Frage ist nicht diese Behörde zuständig — Sie müssen sich an das Bürgeramt wenden.", note: "\"sich an jemanden wenden\" + Akk = to turn to, contact — the standard verb for approaching an authority." },
  { key: "vollmacht", moment: "Letting someone act for you", line: "Mit einer Vollmacht kann eine andere Person die Akte in meinem Namen einreichen.", note: "a Vollmacht is useful if you can't attend an Amt appointment yourself." },
];

const ACTIONS = [
  { key: "lesen", label: "Einen Bescheid lesen", response: "Ich lese den Bescheid genau und achte besonders auf die Frist." },
  { key: "widerspruch", label: "Einen Widerspruch einlegen", response: "Wenn ich mit einer Entscheidung nicht einverstanden bin, lege ich fristgerecht schriftlich Widerspruch ein." },
  { key: "unterlagen", label: "Unterlagen einreichen", response: "Ich reiche alle nötigen Nachweise und Bescheinigungen möglichst frühzeitig ein." },
  { key: "hilfe", label: "Bei Unsicherheit", response: "Wenn ich unsicher bin, wende ich mich direkt an die zuständige Behörde." },
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

function initTopicPicker() {
  initPicker({
    buttonsId: "topic-picker-buttons",
    resultId: "topic-picker-result",
    options: TOPICS,
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

function initActionPicker() {
  initPicker({
    buttonsId: "action-picker-buttons",
    resultId: "action-picker-result",
    options: ACTIONS,
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

  initTopicPicker();
  initActionPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ein Bescheid kann eine Genehmigung oder eine Ablehnung sein — in beiden Fällen steht eine Frist darin.", "An official notice can be an approval or a rejection — either way, it states a deadline."));
  discoverList.appendChild(sentenceCard("Wer eine Entscheidung für falsch hält, kann innerhalb der Frist Widerspruch einlegen.", "Anyone who thinks a decision is wrong can file an objection within the deadline."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich muss meinen Aufenthaltstitel rechtzeitig verlängern lassen, sonst drohen Probleme.", "I have to get my residence permit extended in time, otherwise problems threaten."));
  applyList.appendChild(sentenceCard("Für den Antrag musste ich einen Nachweis über meine Sprachkenntnisse erbringen.", "For the application I had to provide proof of my language skills."));
  applyList.appendChild(sentenceCard("Da diese Behörde nicht zuständig war, musste ich mich an eine andere wenden.", "Since this authority wasn't responsible, I had to turn to a different one."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-behoerden.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(BEH_IDS.map(byId).filter(Boolean), document.getElementById("grid-beh"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-beh").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-behoerden-quiz.json");

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
