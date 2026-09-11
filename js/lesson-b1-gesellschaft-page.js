/**
 * Page script for lessons/b1-gesellschaft.html — B1 Unit 21 (topic unit).
 * The "topic" picker walks core civic-engagement situations (volunteering,
 * donating, club structure, diversity/cohesion, local help); the "action"
 * picker answers "how would you get involved?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-21-gesellschaft";

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

const SOZ_IDS = [
  "soz-ehrenamt", "soz-verein", "soz-spende", "soz-zusammenhalt",
  "soz-gesellschaft", "soz-vielfalt", "soz-toleranz", "soz-solidaritaet",
  "soz-gemeinschaft", "soz-integration", "soz-initiative",
  "soz-zivilgesellschaft", "soz-freiwillige", "soz-mitgliedsbeitrag",
  "soz-vorstand", "soz-mitgliederversammlung", "soz-nachbarschaftshilfe",
  "soz-obdachlosigkeit", "soz-ehrenamtlich", "soz-freiwillig",
  "soz-gesellschaftlich", "soz-sich-einsetzen", "soz-spenden",
  "soz-sich-beteiligen", "soz-foerdern", "soz-mitwirken", "soz-waehlen",
  "soz-gruenden",
];

const TOPICS = [
  { key: "ehrenamt", moment: "Talking about volunteering", line: "Viele Menschen engagieren sich ehrenamtlich in einem Verein, ohne dafür bezahlt zu werden.", note: "ehrenamtlich = unpaid, voluntary — the word covers everything from a sports club board to disaster relief." },
  { key: "spenden", moment: "Talking about donating", line: "Statt Geld zu spenden, kann man sich auch aktiv an einem Projekt beteiligen.", note: "\"sich beteiligen an\" + Dat — to take part in something, as an alternative to just giving money." },
  { key: "verein", moment: "Talking about a club", line: "Der Verein wird von einem ehrenamtlichen Vorstand geleitet, der einmal im Jahr von der Mitgliederversammlung gewählt wird.", note: "a German Verein (club, association) is a very common form of organised society — sports, culture, charity, almost everything." },
  { key: "vielfalt", moment: "Talking about diversity and cohesion", line: "Eine vielfältige Gesellschaft braucht Toleranz und Zusammenhalt, um gut zu funktionieren.", note: "Vielfalt, Toleranz, and Zusammenhalt are the three words that come up constantly in this kind of discussion." },
  { key: "nachbarschaft", moment: "Talking about helping locally", line: "Nachbarschaftshilfe ist oft der einfachste Weg, sich gesellschaftlich zu engagieren.", note: "small-scale local help — shopping for an elderly neighbor, tutoring — is a common example of low-effort Ehrenamt." },
];

const ACTIONS = [
  { key: "verein", label: "In einem Verein", response: "Ich würde einem Sportverein beitreten und mich später vielleicht sogar im Vorstand engagieren." },
  { key: "spenden", label: "Durch Spenden", response: "Ich spende regelmäßig einen kleinen Betrag an eine Organisation, der ich vertraue." },
  { key: "nachbarschaft", label: "In der Nachbarschaft", response: "Ich würde mich für Nachbarschaftshilfe einsetzen, zum Beispiel älteren Menschen beim Einkaufen helfen." },
  { key: "initiative", label: "Mit einer eigenen Initiative", response: "Ich würde gern eine eigene Initiative gründen, um mich für ein Thema einzusetzen, das mir wichtig ist." },
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
  discoverList.appendChild(sentenceCard("In Deutschland engagieren sich Millionen Menschen ehrenamtlich in Vereinen und Initiativen.", "In Germany, millions of people volunteer in clubs and initiatives."));
  discoverList.appendChild(sentenceCard("Eine starke Zivilgesellschaft lebt vom Engagement ihrer Bürger.", "A strong civil society depends on the engagement of its citizens."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Verein wird von einem ehrenamtlichen Vorstand geleitet, der jedes Jahr neu gewählt wird.", "The club is run by a volunteer board that is newly elected each year."));
  applyList.appendChild(sentenceCard("Viele Städte fördern Projekte, die den gesellschaftlichen Zusammenhalt stärken.", "Many cities promote projects that strengthen social cohesion."));
  applyList.appendChild(sentenceCard("Statt nur zu spenden, möchte ich mich aktiv an einer Initiative beteiligen.", "Instead of just donating, I want to actively participate in an initiative."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-gesellschaft.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(SOZ_IDS.map(byId).filter(Boolean), document.getElementById("grid-soz"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-soz").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-gesellschaft-quiz.json");

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
