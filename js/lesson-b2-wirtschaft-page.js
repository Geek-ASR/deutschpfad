/**
 * Page script for lessons/b2-wirtschaft.html — B2 Unit 14. The
 * "indicator" picker walks five economic indicators; the "headline"
 * picker gives example sentences in a business-news register.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-14-wirtschaft";

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

const WG_IDS = [
  "wg-wirtschaft", "wg-globalisierung", "wg-inflation", "wg-export",
  "wg-import", "wg-lieferkette", "wg-konjunktur", "wg-arbeitsmarkt",
  "wg-wettbewerb", "wg-handel", "wg-zoll", "wg-strafzoelle",
  "wg-rezession", "wg-wachstum", "wg-multinational", "wg-konzern",
  "wg-aktie", "wg-boerse", "wg-marktwirtschaft", "wg-nachfrage",
  "wg-angebot", "wg-binnenmarkt", "wg-freihandel", "wg-auslagern",
  "wg-wohlstand", "wg-kaufkraft", "wg-waehrung", "wg-wechselkurs",
];

const INDICATORS = [
  { key: "wachstum", label: "das Wachstum", line: "Das Wachstum blieb hinter den Erwartungen zurück.", note: "the headline number in almost every economic news report." },
  { key: "inflation", label: "die Inflation", line: "Die Inflation drückt die Kaufkraft der Verbraucher.", note: "rising prices eating into what your income can actually buy." },
  { key: "rezession", label: "die Rezession", line: "Ökonomen warnen vor einer möglichen Rezession.", note: "the opposite of growth — a period of economic decline." },
  { key: "arbeitsmarkt", label: "der Arbeitsmarkt", line: "Der Arbeitsmarkt hat sich trotz der Krise stabil gezeigt.", note: "how easy or hard it is to find work — pairs with B2 Unit 11's Fachkräftemangel." },
  { key: "wechselkurs", label: "der Wechselkurs", line: "Der Wechselkurs zwischen Euro und Dollar schwankt ständig.", note: "how much one currency is worth against another." },
];

const HEADLINES = [
  { key: "zoll", label: "Handelsstreit", response: "Die USA verhängten Strafzölle auf Stahl und Aluminium." },
  { key: "boerse", label: "Börsennachrichten", response: "Die Aktie des Unternehmens fiel nach der Ankündigung um zehn Prozent." },
  { key: "konzern", label: "Firmenmeldung", response: "Der Konzern kündigte einen umfassenden Stellenabbau an." },
  { key: "auslagern", label: "Globalisierung im Alltag", response: "Viele Firmen haben ihre Produktion ins Ausland ausgelagert." },
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

function initIndicatorPicker() {
  initPicker({
    buttonsId: "indicator-picker-buttons",
    resultId: "indicator-picker-result",
    options: INDICATORS,
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

function initHeadlinePicker() {
  initPicker({
    buttonsId: "headline-picker-buttons",
    resultId: "headline-picker-result",
    options: HEADLINES,
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

  initIndicatorPicker();
  initHeadlinePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die deutsche Wirtschaft wächst langsamer als erwartet.", "The German economy is growing more slowly than expected."));
  discoverList.appendChild(sentenceCard("Die Globalisierung hat den Welthandel stark verändert.", "Globalisation has greatly changed world trade."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die soziale Marktwirtschaft verbindet freien Wettbewerb mit sozialer Absicherung.", "The social market economy combines free competition with social security."));
  applyList.appendChild(sentenceCard("Der EU-Binnenmarkt ermöglicht den freien Warenverkehr.", "The EU single market allows the free movement of goods."));
  applyList.appendChild(sentenceCard("Der Wohlstand vieler Länder hat sich in den letzten Jahrzehnten stark erhöht.", "Prosperity in many countries has risen sharply over recent decades."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-wirtschaft.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(WG_IDS.map(byId).filter(Boolean), document.getElementById("grid-wg"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-wg").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-wirtschaft-quiz.json");

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
