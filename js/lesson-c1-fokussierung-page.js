/**
 * Page script for lessons/c1-fokussierung.html — C1 Unit 7.
 * The "type" picker walks five focus/emphasis patterns; the
 * "cleft" picker turns a plain statement into a cleft sentence.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-7-fokussierung";

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

const FK_IDS = [
  "fk-intro", "fk-es-ist-der", "fk-es-sind-die", "fk-was-betrifft",
  "fk-was-angeht", "fk-was-ist", "fk-wortstellung", "fk-lesestrategie",
  "fk-keineswegs", "fk-geschweige-denn", "fk-erst-recht",
  "fk-schlechterdings", "fk-ausgerechnet", "fk-allenfalls",
  "fk-schwerpunkt", "fk-hauptaugenmerk", "fk-nebensache",
  "fk-randbemerkung", "fk-gewichtung", "fk-vorrangig", "fk-nebensaechlich",
  "fk-prioritaet", "fk-vordergruendig", "fk-relevanz", "fk-irrelevant",
  "fk-belanglos", "fk-keinesfalls", "fk-durchaus",
];

const USES = [
  { key: "es-ist-der", label: "Es ist/war X, der …", line: "Es war die Finanzkrise, die den Ausschlag gab.", note: "es is a pure placeholder; the real content is in the relative clause that follows." },
  { key: "was-betrifft", label: "was X betrifft", line: "Was die Kosten betrifft, so sind sie überschaubar.", note: "Fronts a topic before commenting on it — often resumed with \"so\"." },
  { key: "was-ist", label: "Was mich [Verb], ist …", line: "Was mich überrascht, ist die Geschwindigkeit der Entwicklung.", note: "A was-cleft — reuses B1's free relative clause in a new, emphatic role." },
  { key: "geschweige-denn", label: "geschweige denn", line: "Er kann nicht einmal kochen, geschweige denn backen.", note: "Adds an even more extreme case after a negative statement." },
  { key: "ausgerechnet", label: "ausgerechnet", line: "Ausgerechnet er sollte die Rede halten.", note: "Marks what follows as a surprising or ironic focal point." },
];

const REDUCE = [
  { key: "finanzkrise", label: "Die Finanzkrise gab den Ausschlag.", response: "Es war die Finanzkrise, die den Ausschlag gab." },
  { key: "waehler", label: "Vor allem die jungen Wähler haben den Unterschied gemacht.", response: "Es sind vor allem die jungen Wähler, die den Unterschied gemacht haben." },
  { key: "verbraucher", label: "Die Verbraucher erzwangen den Wandel.", response: "Es waren die Verbraucher, die den Wandel erzwangen." },
  { key: "qualitaet", label: "Nicht der Preis zählt, sondern die Qualität.", response: "Nicht der Preis, sondern die Qualität ist es, die zählt." },
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

function initUsePicker() {
  initPicker({
    buttonsId: "use-picker-buttons",
    resultId: "use-picker-result",
    options: USES,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
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
    },
  });
}

function initReducePicker() {
  initPicker({
    buttonsId: "reduce-picker-buttons",
    resultId: "reduce-picker-result",
    options: REDUCE,
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

  initUsePicker();
  initReducePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die Finanzkrise gab den Ausschlag.", "The financial crisis tipped the balance."));
  discoverList.appendChild(sentenceCard("Es war die Finanzkrise, die den Ausschlag gab.", "It was the financial crisis that tipped the balance."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Was die Sicherheit angeht, gibt es noch offene Fragen.", "As for safety, there are still open questions."));
  applyList.appendChild(sentenceCard("Das ist schlechterdings unmöglich.", "That is simply impossible."));
  applyList.appendChild(sentenceCard("Vordergründig geht es um Sparmaßnahmen, tatsächlich aber um Machtpolitik.", "On the surface it's about austerity measures, but it's actually about power politics."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-fokussierung.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FK_IDS.map(byId).filter(Boolean), document.getElementById("grid-fk"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-fk").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-fokussierung-quiz.json");

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
