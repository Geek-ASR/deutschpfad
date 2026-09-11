/**
 * Page script for lessons/b1-gesundheitssystem.html — B1 Unit 14
 * (topic unit). The "visit" picker walks healthcare-system moments;
 * the "system" picker explains a piece of how the system is
 * organised. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-14-gesundheitssystem";

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

const GES_IDS = [
  "ges-gesetzliche-kv", "ges-private-kv", "ges-krankenkasse",
  "ges-versicherungspflicht", "ges-hausarzt", "ges-facharzt",
  "ges-ueberweisung", "ges-termin-vereinbaren", "ges-versichertenkarte",
  "ges-zuzahlung", "ges-rezeptgebuehr", "ges-vorsorgeuntersuchung",
  "ges-impfung", "ges-notaufnahme", "ges-notdienst", "ges-notruf",
  "ges-krankenhaus", "ges-stationaer-ambulant", "ges-pflegeversicherung",
  "ges-reha", "ges-psychotherapie", "ges-chronisch", "ges-diagnose",
  "ges-attest", "ges-warten-auf-termin", "ges-selbstbeteiligung",
  "ges-gesundheitsamt",
];

const VISITS = [
  { key: "anmelden", moment: "Registering with a health insurer", line: "Ich bin neu in Deutschland und muss mich bei einer Krankenkasse anmelden. — Kein Problem, welche Kasse hätten Sie gern?", note: "you usually pick a Krankenkasse yourself — there's no automatic assignment." },
  { key: "hausarzt", moment: "First visit to a GP", line: "Guten Tag, ich bin neu hier und suche einen Hausarzt. Nehmen Sie noch neue Patienten auf?", note: "some practices have a Patientenstopp — it's normal to ask a few before finding one." },
  { key: "ueberweisung", moment: "Getting a referral", line: "Ihre Beschwerden sollte sich ein Facharzt ansehen. Ich stelle Ihnen eine Überweisung aus.", note: "keep the Überweisung — you'll usually need to hand it in at the specialist's practice." },
  { key: "notdienst", moment: "Something urgent at night", line: "Es ist Samstagabend und ich habe starke Schmerzen, aber es ist kein Notfall. — Rufen Sie den ärztlichen Notdienst unter 116117 an.", note: "116117 is free, nationwide, and exactly for this in-between situation." },
  { key: "reha", moment: "After a hospital stay", line: "Nach der Operation empfehle ich eine Reha, damit Sie sich vollständig erholen.", note: "die Krankenkasse usually has to approve it first, but it's a standard next step after major surgery." },
];

const SYSTEM = [
  { key: "gkvpkv", label: "GKV vs. PKV", response: "In der gesetzlichen Krankenversicherung richtet sich der Beitrag nach dem Einkommen; in der privaten nach Alter und Gesundheitszustand." },
  { key: "zuzahlung", label: "Zuzahlungen", response: "Für Medikamente und manche Behandlungen zahlt man eine kleine Zuzahlung — der Arztbesuch selbst kostet meistens nichts." },
  { key: "vorsorge", label: "Vorsorgeuntersuchungen", response: "Regelmäßige Vorsorgeuntersuchungen sind kostenlos und sollen Krankheiten frühzeitig erkennen." },
  { key: "pflege", label: "Pflegeversicherung", response: "Die Pflegeversicherung springt ein, wenn jemand im Alter oder nach einer Krankheit dauerhaft Hilfe im Alltag braucht." },
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

function initVisitPicker() {
  initPicker({
    buttonsId: "visit-picker-buttons",
    resultId: "visit-picker-result",
    options: VISITS,
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

function initSystemPicker() {
  initPicker({
    buttonsId: "system-picker-buttons",
    resultId: "system-picker-result",
    options: SYSTEM,
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

  initVisitPicker();
  initSystemPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("In Deutschland gilt die Versicherungspflicht für alle.", "In Germany, health insurance is mandatory for everyone."));
  discoverList.appendChild(sentenceCard("Bei einem dringenden, aber nicht lebensbedrohlichen Problem: 116117.", "For something urgent but not life-threatening: 116117."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich habe meine Krankenkasse gewechselt, weil die Beiträge zu hoch waren.", "I switched my health insurance provider because the contributions were too high."));
  applyList.appendChild(sentenceCard("Ohne Überweisung nimmt mich der Facharzt erst in drei Monaten.", "Without a referral the specialist can only see me in three months."));
  applyList.appendChild(sentenceCard("Die Psychotherapie wird von der Krankenkasse übernommen.", "The psychotherapy is covered by the health insurance."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-gesundheitssystem.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(GES_IDS.map(byId).filter(Boolean), document.getElementById("grid-ges"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ges").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-gesundheitssystem-quiz.json");

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
