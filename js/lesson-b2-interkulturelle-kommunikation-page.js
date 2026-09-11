/**
 * Page script for lessons/b2-interkulturelle-kommunikation.html — B2
 * Unit 24, the last of the 14 planned B2 topic units. The "style"
 * picker walks five communication-style contrasts; the "moment"
 * picker gives example sentences for everyday intercultural
 * situations.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-24-interkulturelle-kommunikation";

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

const IKM_IDS = [
  "ikm-kulturschock", "ikm-stereotyp", "ikm-klischee", "ikm-kommunikationsstil",
  "ikm-direkte-kommunikation", "ikm-indirekte-kommunikation", "ikm-hochkontextkultur", "ikm-niedrigkontextkultur",
  "ikm-fettnaepfchen", "ikm-small-talk", "ikm-begruessungsritual", "ikm-koerpersprache",
  "ikm-blickkontakt", "ikm-hoeflichkeitsform", "ikm-perspektivwechsel", "ikm-empathie",
  "ikm-fremdverstehen", "ikm-kulturdimension", "ikm-kulturvergleich", "ikm-anpassung",
  "ikm-vorurteilsfrei", "ikm-verhandlungskultur", "ikm-monochron", "ikm-polychron",
  "ikm-gastfreundschaft", "ikm-tabuthema", "ikm-codewechsel", "ikm-review",
];

const STYLES = [
  { key: "direkt", label: "Direkt vs. indirekt", line: "Direkte Kommunikation wird in manchen Kulturen als unhöflich empfunden.", note: "saying it plainly versus relying on context and tone." },
  { key: "kontext", label: "Hoch- vs. Niedrigkontext", line: "In einer Hochkontextkultur sagt oft der Kontext mehr als die Worte selbst.", note: "how much meaning rides on shared context rather than explicit words." },
  { key: "zeit", label: "Monochron vs. polychron", line: "Ein monochrones Zeitverständnis legt großen Wert auf Pünktlichkeit und feste Termine.", note: "one thing at a time on a fixed schedule, versus flexible, overlapping time." },
  { key: "koerper", label: "Körpersprache", line: "Ein Nicken bedeutet nicht in jeder Kultur dasselbe.", note: "gestures that seem universal often aren't." },
  { key: "hoeflichkeit", label: "Höflichkeitsform", line: "Die richtige Höflichkeitsform zu wählen, ist für Deutschlernende oft eine Herausforderung.", note: "German's own famous example — Sie or du." },
];

const MOMENTS = [
  { key: "fettnaepfchen", label: "Ein Fauxpas", response: "Bei seiner ersten Geschäftsreise trat er gleich mehrmals ins Fettnäpfchen." },
  { key: "smalltalk", label: "Vor dem Meeting", response: "In manchen Ländern gehört ausführlicher Small Talk einfach dazu." },
  { key: "tabu", label: "Ein heikles Thema", response: "Über das Gehalt zu sprechen, gilt in Deutschland fast als Tabuthema." },
  { key: "gastfreundschaft", label: "Zu Gast eingeladen", response: "Die Gastfreundschaft der Familie beeindruckte sie sehr." },
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

function initStylePicker() {
  initPicker({
    buttonsId: "style-picker-buttons",
    resultId: "style-picker-result",
    options: STYLES,
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

function initMomentPicker() {
  initPicker({
    buttonsId: "moment-picker-buttons",
    resultId: "moment-picker-result",
    options: MOMENTS,
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

  initStylePicker();
  initMomentPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Nach dem Umzug erlebte sie einen echten Kulturschock.", "After the move, she experienced real culture shock."));
  discoverList.appendChild(sentenceCard("Empathie ist eine Grundvoraussetzung für gelungene interkulturelle Kommunikation.", "Empathy is a basic requirement for successful intercultural communication."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Fremdverstehen bedeutet mehr als bloße Toleranz gegenüber anderen Kulturen.", "Understanding the unfamiliar means more than mere tolerance of other cultures."));
  applyList.appendChild(sentenceCard("Individualismus und Kollektivismus gelten als zentrale Kulturdimensionen.", "Individualism and collectivism are considered central cultural dimensions."));
  applyList.appendChild(sentenceCard("Viele Mehrsprachige beherrschen den Codewechsel ganz selbstverständlich.", "Many multilingual people switch codes quite naturally."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-interkulturelle-kommunikation.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(IKM_IDS.map(byId).filter(Boolean), document.getElementById("grid-ikm"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ikm").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-interkulturelle-kommunikation-quiz.json");

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
