/**
 * Page script for lessons/b2-karriere.html — B2 Unit 11 (first B2 topic
 * unit). The "path" picker walks five career-path terms; the
 * "situation" picker answers "what would this look like?" for a
 * given professional scenario.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-11-karriere";

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

const KAR_IDS = [
  "kar-bewerbungsunterlagen", "kar-werdegang", "kar-quereinstieg",
  "kar-karriereleiter", "kar-fachkraft", "kar-vorgesetzte",
  "kar-fuehrungskraft", "kar-betriebsrat", "kar-hierarchie",
  "kar-fachkraeftemangel", "kar-lebenslanges-lernen", "kar-netzwerken",
  "kar-mentor", "kar-selbststaendig-machen", "kar-freiberufler",
  "kar-gewerbe-anmelden", "kar-durchsetzungsvermoegen", "kar-verhandlungsgeschick",
  "kar-eigeninitiative", "kar-interkulturelle-kompetenz", "kar-qualifikation",
  "kar-einarbeitung", "kar-onboarding", "kar-weiterentwickeln",
  "kar-berufung", "kar-ruhestand", "kar-umschulung", "kar-berufsbegleitend",
];

const PATHS = [
  { key: "quereinstieg", label: "der Quereinstieg", line: "Ein Quereinstieg in die IT-Branche ist heute leichter als früher.", note: "entering a field without the usual training path — common in teaching and IT." },
  { key: "umschulung", label: "die Umschulung", line: "Nach der Umschulung arbeitet er jetzt als Elektriker.", note: "a formal, often state-supported retraining program — more structured than a Quereinstieg." },
  { key: "aufstieg", label: "die Karriereleiter", line: "Sie ist die Karriereleiter schnell hinaufgeklettert.", note: "the traditional path upward within one field or company." },
  { key: "selbststaendig", label: "sich selbstständig machen", line: "Nach zehn Jahren im Angestelltenverhältnis hat er sich selbstständig gemacht.", note: "leaving employment behind to work for yourself, as a Freiberufler or with a registered Gewerbe." },
  { key: "ruhestand", label: "der Ruhestand", line: "Nächstes Jahr geht sie in den Ruhestand.", note: "where every career path eventually leads." },
];

const SITUATIONS = [
  { key: "vorgesetzte", label: "Konflikt mit dem Vorgesetzten", response: "Sprechen Sie im Konfliktfall zuerst mit Ihrem direkten Vorgesetzten." },
  { key: "betriebsrat", label: "Unklare Kündigung", response: "Der Betriebsrat muss bei Kündigungen angehört werden." },
  { key: "einarbeitung", label: "Erster Tag im neuen Job", response: "Die Einarbeitung dauert bei uns etwa drei Monate." },
  { key: "gewerbe", label: "Eigenes Business starten", response: "Bevor sie loslegen konnte, musste sie ein Gewerbe anmelden." },
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

function initPathPicker() {
  initPicker({
    buttonsId: "path-picker-buttons",
    resultId: "path-picker-result",
    options: PATHS,
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

function initSituationPicker() {
  initPicker({
    buttonsId: "situation-picker-buttons",
    resultId: "situation-picker-result",
    options: SITUATIONS,
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

  initPathPicker();
  initSituationPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Erzählen Sie kurz von Ihrem beruflichen Werdegang.", "Tell me briefly about your career path."));
  discoverList.appendChild(sentenceCard("Der Fachkräftemangel betrifft besonders das Handwerk und die Pflege.", "The skills shortage particularly affects the trades and care work."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Wir erwarten Eigeninitiative und Teamfähigkeit.", "We expect initiative and the ability to work in a team."));
  applyList.appendChild(sentenceCard("Ich möchte mich in dieser Rolle fachlich weiterentwickeln.", "I'd like to develop further professionally in this role."));
  applyList.appendChild(sentenceCard("Sie macht einen berufsbegleitenden Master in Wirtschaftsinformatik.", "She's doing a part-time master's in business informatics alongside her job."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-karriere.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(KAR_IDS.map(byId).filter(Boolean), document.getElementById("grid-kar"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-kar").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-karriere-quiz.json");

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
