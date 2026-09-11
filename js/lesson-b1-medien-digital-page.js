/**
 * Page script for lessons/b1-medien-digital.html — B1 Unit 17 (topic unit).
 * The "topic" picker walks core media-discourse ideas (news, misinformation,
 * algorithms, privacy, screen time); the "habit" picker answers "how do
 * you use media?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-17-medien-digital";

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

const MD_IDS = [
  "md-massenmedien", "md-berichterstattung", "md-nachrichten", "md-quelle",
  "md-falschmeldung", "md-medienkompetenz", "md-digitalisierung",
  "md-datenschutz", "md-medienkonsum", "md-bildschirmzeit",
  "md-abhaengigkeit", "md-streamingdienst", "md-meinungsbildung",
  "md-privatsphaere", "md-werbung", "md-plattform", "md-algorithmus",
  "md-filterblase", "md-urheberrecht", "md-glaubwuerdig", "md-suechtig",
  "md-streamen", "md-beeinflussen", "md-veroeffentlichen",
  "md-recherchieren", "md-manipulieren", "md-sich-informieren",
  "md-ueberpruefen",
];

const TOPICS = [
  { key: "nachrichten", moment: "Talking about how you get your news", line: "Ich informiere mich vor allem online, aber ich versuche, meine Quellen immer zu überprüfen.", note: "\"sich informieren über\" + Akk is the standard verb for finding out about something — pairs well with \"die Quelle überprüfen\"." },
  { key: "fake-news", moment: "Talking about misinformation", line: "Falschmeldungen verbreiten sich in sozialen Netzwerken oft schneller als die Richtigstellung.", note: "\"die Falschmeldung\" is the standard German term — \"Fake News\" (the English loan) is also common in speech." },
  { key: "algorithmus", moment: "Talking about how platforms work", line: "Der Algorithmus zeigt uns vor allem Inhalte, die unsere Meinung bestätigen — das nennt man eine Filterblase.", note: "a common B1/B2 discussion point: does personalization narrow what we see?" },
  { key: "datenschutz", moment: "Talking about privacy", line: "Viele Menschen machen sich Sorgen um den Datenschutz und ihre Privatsphäre im Internet.", note: "\"der Datenschutz\" (data protection, the legal concept) vs. \"die Privatsphäre\" (privacy, the personal concept) — both come up constantly in this topic." },
  { key: "bildschirmzeit", moment: "Talking about screen time", line: "Viele Jugendliche sind nach eigener Einschätzung süchtig nach ihrem Handy.", note: "\"süchtig nach\" + Dat — the fixed preposition to know for talking about addiction and dependency." },
];

const HABITS = [
  { key: "nachrichten", label: "Nachrichten", response: "Ich lese die Nachrichten meistens online und höre morgens noch kurz Radio." },
  { key: "soziale-medien", label: "Soziale Medien", response: "Ich nutze soziale Medien, aber ich versuche, meine Bildschirmzeit zu begrenzen." },
  { key: "streaming", label: "Streaming", response: "Ich habe einen Streamingdienst abonniert und schaue kaum noch klassisches Fernsehen." },
  { key: "quellenkritik", label: "Quellenkritik", response: "Bevor ich etwas teile, überprüfe ich die Quelle und vergleiche sie mit anderen Berichten." },
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

function initHabitPicker() {
  initPicker({
    buttonsId: "habit-picker-buttons",
    resultId: "habit-picker-result",
    options: HABITS,
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
  initHabitPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die Digitalisierung verändert, wie wir Nachrichten konsumieren, arbeiten und miteinander kommunizieren.", "Digitization is changing how we consume news, work, and communicate with each other."));
  discoverList.appendChild(sentenceCard("Nicht jede Quelle im Internet ist glaubwürdig — Medienkompetenz wird deshalb immer wichtiger.", "Not every source on the internet is credible — media literacy is therefore becoming ever more important."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ein Algorithmus entscheidet, welche Beiträge wir in unserem Feed sehen — Kritiker sprechen von einer Filterblase.", "An algorithm decides which posts we see in our feed — critics call this a filter bubble."));
  applyList.appendChild(sentenceCard("Ohne strengen Datenschutz könnten Unternehmen unsere persönlichen Daten frei weitergeben.", "Without strict data protection, companies could freely pass on our personal data."));
  applyList.appendChild(sentenceCard("Viele Zeitungen kämpfen ums Überleben, seit ein Großteil der Berichterstattung online stattfindet.", "Many newspapers are fighting for survival now that most reporting happens online."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-medien-digital.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MD_IDS.map(byId).filter(Boolean), document.getElementById("grid-md"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-md").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-medien-digital-quiz.json");

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
