/**
 * Page script for lessons/b2-kunst-gesellschaft.html — B2 Unit 21
 * (deepens B1 Unit 24's culture-as-leisure vocabulary into culture
 * as a social force). The "tension" picker walks five recurring
 * tensions in cultural debate; the "debate" picker gives example
 * sentences for current controversies.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-21-kunst-gesellschaft";

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

const KUG_IDS = [
  "kug-kunstfreiheit", "kug-kulturfoerderung", "kug-subvention", "kug-subventionieren",
  "kug-gesellschaftskritisch", "kug-kulturhauptstadt", "kug-denkmalschutz", "kug-kulturkritik",
  "kug-avantgarde", "kug-kulturindustrie", "kug-kulturelle-aneignung", "kug-identitaetspolitik",
  "kug-kulturbetrieb", "kug-maezenatentum", "kug-provokant", "kug-kontrovers",
  "kug-zensur-kunst", "kug-kuenstlerische-freiheit", "kug-oeffentlicher-diskurs", "kug-kulturgut",
  "kug-restitution", "kug-kolonialismus", "kug-repraesentation", "kug-kunstmarkt",
  "kug-kulturelle-teilhabe", "kug-elitaer", "kug-spiegel-der-gesellschaft", "kug-review",
];

const TENSIONS = [
  { key: "freiheit-zensur", label: "Kunstfreiheit vs. Zensur", line: "Der Fall löste eine Debatte über Zensur in der Kunst aus.", note: "a Grundrecht (B2 Unit 20) on one side, calls for removal on the other." },
  { key: "markt-kritik", label: "Kunstmarkt vs. Kulturkritik", line: "Der Kunstmarkt erzielt für manche Werke Rekordpreise.", note: "commercial value versus critical or social value — not always the same thing." },
  { key: "elitaer-teilhabe", label: "Elitär vs. kulturelle Teilhabe", line: "Kulturelle Teilhabe darf nicht vom Einkommen abhängen.", note: "who actually gets to take part in cultural life." },
  { key: "aneignung", label: "Kulturelle Aneignung", line: "Der Vorwurf der kulturellen Aneignung sorgte für eine hitzige Debatte.", note: "using another culture's elements without permission or context." },
  { key: "restitution", label: "Restitution und Kolonialismus", line: "Die Restitution kolonialer Kulturgüter wird zunehmend gefordert.", note: "who owns a Kulturgut, and how it got where it is." },
];

const DEBATES = [
  { key: "foerderung", label: "Kulturförderung kürzen?", response: "Die Kulturförderung wurde im neuen Haushalt gekürzt." },
  { key: "identitaet", label: "Identitätspolitik", response: "Über den Begriff Identitätspolitik wird kontrovers diskutiert." },
  { key: "repraesentation", label: "Mehr Repräsentation?", response: "Viele fordern mehr Repräsentation marginalisierter Gruppen im Film." },
  { key: "industrie", label: "Kunst als Ware?", response: "Kritiker sprechen von einer Kulturindustrie, die Kunst zur Ware macht." },
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

function initTensionPicker() {
  initPicker({
    buttonsId: "tension-picker-buttons",
    resultId: "tension-picker-result",
    options: TENSIONS,
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
    options: DEBATES,
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

  initTensionPicker();
  initDebatePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die Kunstfreiheit ist im deutschen Grundgesetz eigens geschützt.", "Freedom of art is specifically protected in the German Basic Law."));
  discoverList.appendChild(sentenceCard("Ihr neuer Roman gilt als scharf gesellschaftskritisch.", "Her new novel is considered sharply socially critical."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Man sagt oft, Kunst sei ein Spiegel der Gesellschaft.", "It's often said that art is a mirror of society."));
  applyList.appendChild(sentenceCard("Die Oper wird von manchen als elitär wahrgenommen.", "The opera is perceived by some as elitist."));
  applyList.appendChild(sentenceCard("Ohne staatliche Subventionen könnten viele Theater nicht überleben.", "Without state subsidies, many theatres couldn't survive."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-kunst-gesellschaft.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(KUG_IDS.map(byId).filter(Boolean), document.getElementById("grid-kug"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-kug").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-kunst-gesellschaft-quiz.json");

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
