/**
 * Page script for lessons/c1-erweiterte-attribute.html — C1 Unit 1.
 * The "type" picker walks five extended-attribute variants; the
 * "compress" picker turns a given relative clause into an extended
 * attribute. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-1-erweiterte-attribute";

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

const EA_IDS = [
  "ea-erweitertes-attribut", "ea-partizip1-erweitert", "ea-partizip1-beispiel",
  "ea-partizip2-agens", "ea-partizip2-beispiel", "ea-mehrfache-erweiterung",
  "ea-mehrfache-beispiel", "ea-adjektivattribut", "ea-adjektiv-beispiel",
  "ea-vergleich-beispiel", "ea-genitiv-im-attribut", "ea-genitiv-beispiel",
  "ea-relativsatz-zu-attribut", "ea-attribut-zu-relativsatz", "ea-wortstellung",
  "ea-verschachtelung", "ea-lesestrategie", "ea-partizip-vs-adjektiv",
  "ea-gesetzentwurf", "ea-verabschieden", "ea-beschluss", "ea-brisant",
  "ea-weitreichend", "ea-chemikalie", "ea-schaedlich", "ea-steigen",
  "ea-bewusstsein", "ea-ehrgeiz",
];

const USES = [
  { key: "partizip1", label: "Partizip I, extended (simultaneous)", line: "der schnell vorbeifahrende Zug", note: "Partizip I extended by an adverb — still a compressed relative clause describing an ongoing action, just like B1's simple version, but with a modifier added." },
  { key: "partizip2-agens", label: "Partizip II with an agent", line: "der von der Regierung verabschiedete Gesetzentwurf", note: "The von-phrase names who performed the action — the passive agent, moved into the attribute exactly as it would sit in a Vorgangspassiv sentence." },
  { key: "mehrfach", label: "Stacking more than one modifier", line: "der vom Parlament nach langer Debatte verabschiedete Gesetzentwurf", note: "Two modifiers — the agent and a time phrase — both sit in front of the same participle. A hallmark of dense journalistic style." },
  { key: "adjektiv", label: "Extended adjective attribute — genuinely new", line: "die für die Umwelt äußerst schädliche Chemikalie", note: "schädlich is a plain adjective, not a participle. Its complement (für die Umwelt) and its degree word (äußerst) still move in front of it. B1 never covered this variant." },
  { key: "genitiv", label: "A genitive complement inside the attribute", line: "der sich seines Talents durchaus bewusste Künstler", note: "bewusst takes a genitive complement — seines Talents. That genitive phrase, plus the reflexive sich, moves into the attribute along with it." },
];

const REDUCE = [
  { key: "politiker", label: "der Politiker, der von vielen Bürgern kritisiert wird", response: "der von vielen Bürgern kritisierte Politiker" },
  { key: "studie", label: "die Studie, die vor kurzem veröffentlicht wurde", response: "die vor kurzem veröffentlichte Studie" },
  { key: "vorschlag", label: "der Vorschlag, der in der Fachwelt äußerst umstritten ist", response: "der in der Fachwelt äußerst umstrittene Vorschlag" },
  { key: "kuenstler", label: "der Künstler, der sich seines Erfolgs bewusst ist", response: "der sich seines Erfolgs bewusste Künstler" },
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
  discoverList.appendChild(sentenceCard("Der von der Regierung verabschiedete Gesetzentwurf tritt im Januar in Kraft.", "The bill passed by the government takes effect in January."));
  discoverList.appendChild(sentenceCard("Die für die Umwelt äußerst schädliche Chemikalie wurde inzwischen verboten.", "The chemical extremely harmful to the environment has since been banned."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der vom Parlament nach langer Debatte verabschiedete Gesetzentwurf war umstritten.", "The bill passed by parliament after a long debate was controversial."));
  applyList.appendChild(sentenceCard("Die im Vergleich zum Vorjahr deutlich gestiegenen Kosten belasten viele Haushalte.", "The costs that have risen significantly compared to the previous year are burdening many households."));
  applyList.appendChild(sentenceCard("Der sich seines Talents durchaus bewusste Künstler lehnte den Auftrag dennoch ab.", "The artist, who was quite aware of his talent, nevertheless turned down the commission."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-erweiterte-attribute.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(EA_IDS.map(byId).filter(Boolean), document.getElementById("grid-ea"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ea").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-erweiterte-attribute-quiz.json");

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
