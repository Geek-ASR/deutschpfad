/**
 * Page script for lessons/c1-nominalstil.html — C1 Unit 3.
 * The "type" picker walks five stacked-attribute patterns; the
 * "compress" picker turns a pair of plain sentences into one dense
 * Nominalstil noun phrase. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-3-nominalstil";

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

const NS_IDS = [
  "ns-intro", "ns-genitivkette", "ns-kombination", "ns-im-rahmen",
  "ns-im-zuge", "ns-in-anbetracht", "ns-zugunsten", "ns-zulasten",
  "ns-unbeschadet", "ns-verschachtelung", "ns-dekomprimierung",
  "ns-komprimierung", "ns-verordnung", "ns-quote", "ns-kommune",
  "ns-massnahmenpaket", "ns-vergabe", "ns-umsetzung", "ns-anhoerung",
  "ns-novelle", "ns-regelungsbedarf", "ns-inkrafttreten",
  "ns-zustaendigkeitsbereich", "ns-ministerium", "ns-gremium",
  "ns-auflage", "ns-vorgabe", "ns-tragweite",
];

const USES = [
  { key: "genitivkette", label: "Genitivkette", line: "die Rechte der Kinder der Angestellten", note: "A genitive attribute containing another genitive attribute — two links is normal in formal writing." },
  { key: "kombination", label: "Genitiv + Präposition kombiniert", line: "die Erhöhung der Recyclingquote im Rahmen der neuen Verordnung", note: "One genitive attribute plus one prepositional attribute on the same head noun — usually easier to read than a long genitive chain." },
  { key: "im-zuge", label: "im Zuge (ongoing process)", line: "Im Zuge der Digitalisierung wurden viele Verfahren vereinfacht.", note: "im Zuge emphasises an ongoing process or development, unlike im Rahmen's fixed plan or set of rules." },
  { key: "zugunsten", label: "zugunsten / zulasten (who benefits)", line: "Die Regelung wurde zugunsten der Mieter geändert.", note: "zugunsten states who benefits; its opposite zulasten states who bears the cost." },
  { key: "verschachtelung", label: "Verschachtelt mit Unit 1", line: "die vom Ministerium im Rahmen der Reform beschlossene Erhöhung der Recyclingquote der Kommunen", note: "An extended attribute (Unit 1) and a stacked nominal phrase (this unit) combined — genuinely dense official German." },
];

const REDUCE = [
  {
    key: "recyclingquote",
    label: "Das Ministerium hat im Rahmen der Reform beschlossen, die Recyclingquote zu erhöhen.",
    response: "die vom Ministerium im Rahmen der Reform beschlossene Erhöhung der Recyclingquote",
  },
  {
    key: "foerdermittel",
    label: "Ein Gremium vergibt die Fördermittel. Es folgt dabei festen Kriterien.",
    response: "die nach festen Kriterien erfolgende Vergabe der Fördermittel durch ein Gremium",
  },
  {
    key: "gesetz",
    label: "Das Gesetz tritt im Januar in Kraft. Die Novelle wurde im Bundestag verabschiedet.",
    response: "das Inkrafttreten der im Bundestag verabschiedeten Novelle im Januar",
  },
  {
    key: "kommunen",
    label: "Die Kommunen tragen die Kosten. Das geschieht im Zuge der Umsetzung der Verordnung.",
    response: "die im Zuge der Umsetzung der Verordnung von den Kommunen getragenen Kosten",
  },
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
  discoverList.appendChild(sentenceCard("Die Erhöhung der Recyclingquote im Rahmen der neuen Verordnung betrifft alle Kommunen.", "The increase in the recycling quota under the new regulation affects all municipalities."));
  discoverList.appendChild(sentenceCard("Die Rechte der Kinder der Angestellten wurden im neuen Tarifvertrag gestärkt.", "The rights of the employees' children were strengthened in the new collective agreement."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Im Zuge der Digitalisierung wurden viele Verfahren vereinfacht.", "In the course of digitalisation, many procedures were simplified."));
  applyList.appendChild(sentenceCard("Die Kürzungen gehen vor allem zulasten der Ärmsten.", "The cuts are mainly at the expense of the poorest."));
  applyList.appendChild(sentenceCard("Die vom Ministerium im Rahmen der Reform beschlossene Erhöhung der Recyclingquote der Kommunen tritt im Januar in Kraft.", "The increase in municipalities' recycling quota, decided by the ministry as part of the reform, takes effect in January."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-nominalstil.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(NS_IDS.map(byId).filter(Boolean), document.getElementById("grid-ns"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ns").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-nominalstil-quiz.json");

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
