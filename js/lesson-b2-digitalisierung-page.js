/**
 * Page script for lessons/b2-digitalisierung.html — B2 Unit 15
 * (deepens B1 Unit 17's media/digital basics). The "threat" picker
 * walks five digital-security concepts; the "debate" picker gives
 * example sentences from the platform-regulation debate.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-15-digitalisierung";

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

const DIG_IDS = [
  "dig-ki", "dig-ki-vs-algorithmus", "dig-cybersicherheit", "dig-cyberkriminalitaet",
  "dig-hackerangriff", "dig-hacken", "dig-datenleck", "dig-verschluesselung",
  "dig-verschluesseln", "dig-deepfake", "dig-cybermobbing", "dig-digitale-kluft",
  "dig-reizueberflutung", "dig-hassrede", "dig-regulierung", "dig-netzneutralitaet",
  "dig-bot", "dig-chatbot", "dig-automatisierung", "dig-automatisieren",
  "dig-zensur", "dig-datenskandal", "dig-meinungsfreiheit-digital", "dig-big-tech",
  "dig-moderieren", "dig-ueberwachung", "dig-plattformverantwortung",
  "dig-digitalisierung-vertiefung",
];

const THREATS = [
  { key: "hackerangriff", label: "der Hackerangriff", line: "Die Firma wurde Opfer eines schweren Hackerangriffs.", note: "one specific cyberattack incident — the general phenomenon is die Cyberkriminalität." },
  { key: "datenleck", label: "das Datenleck", line: "Das Datenleck betraf Millionen von Nutzerkonten.", note: "personal data escaping a system, often through a Hackerangriff." },
  { key: "deepfake", label: "der Deepfake", line: "Ein Deepfake-Video des Politikers verbreitete sich rasant.", note: "an AI-manipulated video or recording — connects to B1's die Falschmeldung." },
  { key: "cybermobbing", label: "das Cybermobbing", line: "Cybermobbing betrifft vor allem Jugendliche auf sozialen Netzwerken.", note: "an English-rooted loanword, fully naturalised in German." },
  { key: "ueberwachung", label: "die Überwachung", line: "Kritiker warnen vor zu weitreichender staatlicher Überwachung.", note: "the act of monitoring — what B1's der Datenschutz laws exist to limit." },
];

const DEBATE = [
  { key: "hassrede", label: "Hassrede im Netz", response: "Plattformen stehen unter Druck, Hassrede schneller zu löschen." },
  { key: "zensur", label: "Vorwurf der Zensur", response: "Manche Nutzer werfen den Plattformen Zensur vor, wenn Inhalte gelöscht werden." },
  { key: "regulierung", label: "Politische Forderung", response: "Die EU fordert strengere Regulierung großer Plattformen." },
  { key: "verantwortung", label: "Wer ist verantwortlich?", response: "Die Verantwortung der Plattformen für verbreitete Falschmeldungen wird stark diskutiert." },
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

function initThreatPicker() {
  initPicker({
    buttonsId: "threat-picker-buttons",
    resultId: "threat-picker-result",
    options: THREATS,
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

function initDebatePicker() {
  initPicker({
    buttonsId: "debate-picker-buttons",
    resultId: "debate-picker-result",
    options: DEBATE,
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

  initThreatPicker();
  initDebatePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Künstliche Intelligenz verändert viele Branchen grundlegend.", "Artificial intelligence is fundamentally changing many industries."));
  discoverList.appendChild(sentenceCard("Unternehmen investieren zunehmend in Cybersicherheit.", "Companies are increasingly investing in cybersecurity."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Automatisierung verändert den Arbeitsmarkt grundlegend.", "Automation is fundamentally changing the labour market."));
  applyList.appendChild(sentenceCard("Die Big-Tech-Konzerne stehen zunehmend unter politischem Druck.", "Big Tech corporations are under increasing political pressure."));
  applyList.appendChild(sentenceCard("Die digitale Kluft zwischen Stadt und Land bleibt ein Problem.", "The digital divide between city and countryside remains a problem."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-digitalisierung.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(DIG_IDS.map(byId).filter(Boolean), document.getElementById("grid-dig"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-dig").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-digitalisierung-quiz.json");

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
