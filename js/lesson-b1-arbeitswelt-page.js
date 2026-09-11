/**
 * Page script for lessons/b1-arbeitswelt.html — B1 Unit 12 (Phase 2
 * topic unit). The picker walks workplace moments beyond the basics of
 * applying (A2 Unit 11); the apply picker gives personal work
 * sentences. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-12-arbeitswelt";

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

const ARB_IDS = [
  "arb-stellenanzeige", "arb-anforderungsprofil", "arb-vollzeit", "arb-teilzeit",
  "arb-befristet", "arb-unbefristet", "arb-homeoffice", "arb-gleitzeit",
  "arb-ueberstunden", "arb-kuendigungsfrist", "arb-arbeitszeugnis", "arb-referenz",
  "arb-weiterbildung", "arb-aufstieg", "arb-befoerdern", "arb-gehaltsverhandlung",
  "arb-mitarbeitergespraech", "arb-feedback", "arb-teamfaehig", "arb-belastbar",
  "arb-eigenverantwortlich", "arb-anstellung", "arb-taetigkeit", "arb-zustaendig",
  "arb-verantwortlich", "arb-fristlos", "arb-abmahnung", "arb-work-life-balance",
];

const WORK_MOMENTS = [
  { key: "anzeige", moment: "Reading a job ad", line: "Gesucht: teamfähige, belastbare Mitarbeiterin für eine unbefristete Vollzeitstelle. Homeoffice nach Absprache möglich.", note: "\"nach Absprache\" = by arrangement — common wording for flexible perks." },
  { key: "gleitzeit", moment: "Asking about flexible hours", line: "Haben wir Gleitzeit, oder muss ich um neun Uhr da sein? — Wir haben Gleitzeit, Kernzeit ist von zehn bis fünfzehn Uhr.", note: "\"die Kernzeit\" = core hours everyone must be present for, even with Gleitzeit." },
  { key: "mag", moment: "In a Mitarbeitergespräch", line: "Wie schätzen Sie Ihre eigene Leistung ein? — Ich bin eigenverantwortlich und belastbar, aber ich möchte mehr Feedback zu meinen Projekten.", note: "a standard self-assessment question — answer with a strength and something you'd like more of." },
  { key: "gehalt", moment: "Negotiating salary", line: "Aufgrund meiner Berufserfahrung würde ich gern über eine Gehaltserhöhung sprechen. — Das können wir gern besprechen.", note: "\"aufgrund\" (Unit 7) makes the reason sound well-justified, not just a wish." },
  { key: "kuendigung", moment: "Handing in your notice", line: "Ich möchte hiermit zum Ende des Monats kündigen. Können Sie mir bitte ein Arbeitszeugnis ausstellen?", note: "always ask for the Arbeitszeugnis explicitly when you resign — it's your right, but it helps to ask." },
  { key: "aufstieg", moment: "Talking about promotion", line: "Gibt es in dieser Abteilung Aufstiegschancen? — Ja, nach zwei Jahren kann man sich auf eine Teamleiterstelle bewerben.", note: "\"sich auf eine Stelle bewerben\" — even internal promotions usually go through an application." },
];

const MY_WORK = [
  { key: "typ", label: "My contract type", response: "Ich habe eine unbefristete Vollzeitstelle mit Gleitzeit." },
  { key: "starke", label: "My strengths", response: "Ich bin teamfähig und arbeite gern eigenverantwortlich." },
  { key: "ziel", label: "My next career step", response: "Mein Ziel ist es, in den nächsten zwei Jahren aufzusteigen — dafür mache ich gerade eine Weiterbildung." },
  { key: "balance", label: "What matters most to me", response: "Mir ist eine gute Work-Life-Balance wichtiger als ein hohes Gehalt." },
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

function initWorkPicker() {
  initPicker({
    buttonsId: "work-picker-buttons",
    resultId: "work-picker-result",
    options: WORK_MOMENTS,
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

function initMyWorkPicker() {
  initPicker({
    buttonsId: "mywork-picker-buttons",
    resultId: "mywork-picker-result",
    options: MY_WORK,
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

  initWorkPicker();
  initMyWorkPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Wir suchen eine teamfähige und belastbare Person.", "We're looking for a team-oriented, resilient person."));
  discoverList.appendChild(sentenceCard("Mein Vertrag ist unbefristet, mit einer Kündigungsfrist von drei Monaten.", "My contract is permanent, with a three-month notice period."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Nach der Probezeit wurde mein Vertrag unbefristet.", "After the probation period my contract became permanent."));
  applyList.appendChild(sentenceCard("Ich habe um ein Feedback-Gespräch mit meiner Chefin gebeten.", "I asked for a feedback meeting with my manager."));
  applyList.appendChild(sentenceCard("Für dieses Projekt bin ich allein verantwortlich.", "I'm solely responsible for this project."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-arbeitswelt.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(ARB_IDS.map(byId).filter(Boolean), document.getElementById("grid-arb"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-arb").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-arbeitswelt-quiz.json");

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
