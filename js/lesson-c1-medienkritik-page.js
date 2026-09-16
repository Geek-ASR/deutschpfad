/**
 * Page script for lessons/c1-medienkritik.html — C1 Unit 13 (topic
 * unit). The "type" picker walks five key terms; the "spot it"
 * picker matches a newsroom scenario to the term naming it.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-13-medienkritik";

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

const MK_IDS = [
  "mk-intro", "mk-pressefreiheit", "mk-vierte-gewalt", "mk-redaktion",
  "mk-chefredakteur", "mk-rundfunk", "mk-oeffentlich-rechtlich",
  "mk-recherche", "mk-investigativjournalismus", "mk-leitartikel",
  "mk-schlagzeile", "mk-pressemitteilung", "mk-informant", "mk-framing",
  "mk-agenda-setting", "mk-skandalisierung", "mk-reisserisch",
  "mk-boulevardjournalismus", "mk-qualitaetsjournalismus",
  "mk-objektivitaetsgebot", "mk-pressekodex", "mk-klickkoeder",
  "mk-paywall", "mk-medienlandschaft", "mk-enthuellungsjournalismus",
  "mk-exklusivbericht", "mk-reichweite", "mk-desinformation",
];

const USES = [
  { key: "vierte-gewalt", label: "vierte Gewalt", line: "Die Presse wird oft als vierte Gewalt neben Legislative, Exekutive und Judikative bezeichnet.", note: "Positions journalism as a check on power, not just a business." },
  { key: "framing", label: "Framing", line: "Framing beeinflusst, wie ein Thema wahrgenommen wird, ohne dass Fakten verändert werden.", note: "Shapes how an audience understands a topic, without changing the facts themselves." },
  { key: "agenda-setting", label: "Agenda-Setting", line: "Durch Agenda-Setting bestimmen Medien mit, worüber die Öffentlichkeit überhaupt nachdenkt.", note: "The media's power to determine what topics the public thinks about at all." },
  { key: "boulevard", label: "Boulevard- vs. Qualitätsjournalismus", line: "Der Boulevardjournalismus setzt stärker auf Emotionen als auf Fakten.", note: "Opposite ends of the spectrum: emotional and sensational vs. careful and verified." },
  { key: "desinformation", label: "Desinformation", line: "Desinformation wird gezielt eingesetzt, um Meinungen zu manipulieren.", note: "Deliberately spread false information — distinct from an honest Falschmeldung." },
];

const REDUCE = [
  { key: "recherche", label: "A journalist spends weeks digging up hidden wrongdoing.", response: "Investigativjournalismus" },
  { key: "titel", label: "A headline promises a huge revelation that the article doesn't deliver.", response: "reißerische Schlagzeile / Klickköder" },
  { key: "skandal", label: "One isolated incident gets blown up out of proportion.", response: "Skandalisierung" },
  { key: "meinung", label: "The newspaper openly states its own position on an issue.", response: "Leitartikel" },
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
  discoverList.appendChild(sentenceCard("Eine gründliche Recherche ist die Grundlage jedes seriösen Artikels.", "Thorough research is the foundation of any serious article."));
  discoverList.appendChild(sentenceCard("Eine reißerische Schlagzeile soll vor allem Klicks bringen.", "A sensationalist headline is meant above all to generate clicks."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Das Objektivitätsgebot verlangt, mehrere Perspektiven fair darzustellen.", "The objectivity requirement demands presenting multiple perspectives fairly."));
  applyList.appendChild(sentenceCard("Der Enthüllungsjournalismus brachte den Skandal erst ans Licht.", "Exposé journalism was what first brought the scandal to light."));
  applyList.appendChild(sentenceCard("Die deutsche Medienlandschaft ist vielfältig, aber zunehmend konzentriert.", "The German media landscape is diverse, but increasingly concentrated."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-medienkritik.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MK_IDS.map(byId).filter(Boolean), document.getElementById("grid-mk"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-mk").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-medienkritik-quiz.json");

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
