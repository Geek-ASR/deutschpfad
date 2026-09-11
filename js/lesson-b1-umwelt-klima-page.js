/**
 * Page script for lessons/b1-umwelt-klima.html — B1 Unit 16 (topic unit).
 * The "topic" picker walks core climate-policy ideas (energy, transport,
 * consumption, weather, biodiversity); the "action" picker answers
 * "what do you do for the climate?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-16-umwelt-klima";

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

const KL_IDS = [
  "kl-erderwaermung", "kl-treibhausgase", "kl-co2-ausstoss", "kl-klimaziel",
  "kl-klimaneutral", "kl-energiewende", "kl-erneuerbare-energie",
  "kl-brennstoff", "kl-kohleausstieg", "kl-windkraft", "kl-solarenergie",
  "kl-elektroauto", "kl-fussabdruck", "kl-umsteigen", "kl-verzichten",
  "kl-reduzieren", "kl-verursachen", "kl-sich-engagieren",
  "kl-umweltbewusst", "kl-duerre", "kl-ueberschwemmung", "kl-extremwetter",
  "kl-meeresspiegel", "kl-aussterben", "kl-bedroht", "kl-artenvielfalt",
  "kl-emissionshandel", "kl-massnahme",
];

const TOPICS = [
  { key: "energiewende", moment: "Talking about Germany's energy transition", line: "Deutschland will bis 2045 klimaneutral sein und steigt deshalb schrittweise aus der Kohle aus.", note: "the Energiewende is the shift from fossile Brennstoffe and nuclear power to renewables like Windkraft and Solarenergie." },
  { key: "verkehr", moment: "Talking about transport", line: "Immer mehr Menschen steigen vom Auto aufs Fahrrad oder auf öffentliche Verkehrsmittel um.", note: "\"umsteigen auf\" + Akk is the key verb for switching to a greener option — cars, trains, diets, all of it." },
  { key: "konsum", moment: "Talking about consumption", line: "Wer nachhaltiger leben will, verzichtet oft auf Plastikverpackungen und kauft weniger, aber bewusster ein.", note: "\"verzichten auf\" + Akk = to forgo something — a very common structure in this topic." },
  { key: "wetter", moment: "Talking about extreme weather", line: "Dürren im Sommer und Überschwemmungen im Winter werden durch den Klimawandel immer häufiger.", note: "these events are the concrete, visible consequences of der Klimawandel — good vocabulary for describing cause and effect." },
  { key: "arten", moment: "Talking about biodiversity", line: "Der Verlust von Lebensräumen bedroht die Artenvielfalt weltweit — viele Arten sterben aus, bevor sie überhaupt entdeckt wurden.", note: "\"aussterben\" is a separable sein-verb: \"die Art stirbt aus\" → \"ist ausgestorben\"." },
];

const ACTIONS = [
  { key: "energie", label: "Energie sparen", response: "Ich nutze Ökostrom, drehe die Heizung runter und ziehe den Stecker, wenn ich Geräte nicht brauche." },
  { key: "mobilitaet", label: "Mobilität", response: "Ich bin aufs Fahrrad umgestiegen und fliege nur noch, wenn es wirklich nötig ist." },
  { key: "konsum", label: "Konsum", response: "Ich kaufe weniger, oft gebraucht, und versuche, Plastik zu vermeiden." },
  { key: "engagement", label: "Sich engagieren", response: "Ich engagiere mich in einer Umweltgruppe und gehe manchmal zu Klimademonstrationen." },
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
  discoverList.appendChild(sentenceCard("Die Erderwärmung ist eine der größten Herausforderungen unserer Zeit.", "Global warming is one of the greatest challenges of our time."));
  discoverList.appendChild(sentenceCard("Deutschland hat sich ehrgeizige Klimaziele gesetzt, aber der Weg dorthin ist schwierig.", "Germany has set itself ambitious climate targets, but the path there is difficult."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Um den CO2-Ausstoß zu senken, setzt die Regierung auf erneuerbare Energien wie Windkraft und Solarenergie.", "To reduce CO2 emissions, the government is relying on renewable energy like wind and solar power."));
  applyList.appendChild(sentenceCard("Viele Städte fördern den Umstieg aufs Fahrrad, um den Verkehr klimafreundlicher zu machen.", "Many cities are promoting the switch to bicycles to make traffic more climate-friendly."));
  applyList.appendChild(sentenceCard("Wissenschaftler warnen, dass der steigende Meeresspiegel ganze Küstenregionen bedroht.", "Scientists warn that the rising sea level threatens entire coastal regions."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-umwelt-klima.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(KL_IDS.map(byId).filter(Boolean), document.getElementById("grid-kl"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-kl").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-umwelt-klima-quiz.json");

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
