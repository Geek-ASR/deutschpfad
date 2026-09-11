/**
 * Page script for lessons/b2-futur.html — B2 Unit 1.
 * The "use" picker walks the jobs Futur I/II actually do (promise,
 * distant-future prediction, present-tense guess, past-tense guess,
 * deadline); the "predict" picker gives personal example sentences.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-1-futur";

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

const FUT_IDS = [
  "fut-vorhersage", "fut-vermutung", "fut-versprechen", "fut-wohl",
  "fut-wahrscheinlich", "fut-vermutlich", "fut-sicherlich", "fut-bestimmt",
  "fut-tatsaechlich", "fut-versprechen-verb", "fut-vermuten",
  "fut-voraussagen", "fut-eintreffen", "fut-ankuendigen",
  "fut-werden-infinitiv", "fut-werde-machen", "fut-wird-machen",
  "fut-wird-partizip-haben", "fut-wird-partizip-sein",
  "fut-wird-wohl-machen", "fut-vermutung-vergangenheit", "fut-frist",
  "fut-duerfte", "fut-praesens-zukunft", "fut-versprechen-beispiel",
  "fut-regen-beispiel", "fut-zehn-jahre-beispiel", "fut-pruefung-beispiel",
];

const USES = [
  { key: "versprechen", label: "Making a promise", line: "Ich werde dir bei deinem Umzug helfen, das verspreche ich dir.", note: "Futur I for a firm promise or intention — stronger than just using the present tense." },
  { key: "vorhersage", label: "Making a prediction", line: "In zehn Jahren werden die meisten Autos wahrscheinlich elektrisch fahren.", note: "predictions about the more distant future often use Futur I rather than the present tense." },
  { key: "vermutung-gegenwart", label: "Guessing about right now", line: "Er geht nicht ans Telefon — er wird wohl noch in der Besprechung sein.", note: "Futur I + wohl/wahrscheinlich is actually about NOW, not the future — a common trap for learners." },
  { key: "vermutung-vergangenheit", label: "Guessing about the past", line: "Sie ist noch nicht da — sie wird wohl den Bus verpasst haben.", note: "Futur II (werden + Partizip II + haben/sein) expresses an assumption about something already finished." },
  { key: "frist", label: "Something done by a deadline", line: "Bis Freitag werde ich den Bericht fertiggestellt haben.", note: "Futur II can also mean 'will have done X by deadline Y' — genuinely about the future, not a guess." },
];

const PREDICTIONS = [
  { key: "zukunft", label: "In 10 years", response: "In zehn Jahren werde ich wahrscheinlich noch in Deutschland leben und arbeiten." },
  { key: "technologie", label: "Technology", response: "Künstliche Intelligenz wird unseren Alltag in den nächsten Jahren stark verändern." },
  { key: "vermutung", label: "A guess about someone", response: "Sie antwortet nicht — sie wird wohl noch beschäftigt sein." },
  { key: "versprechen", label: "A promise to someone", response: "Ich werde dir spätestens am Montag Bescheid geben, das verspreche ich." },
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

function initPredictPicker() {
  initPicker({
    buttonsId: "predict-picker-buttons",
    resultId: "predict-picker-result",
    options: PREDICTIONS,
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
  initPredictPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("In zehn Jahren werden die meisten Autos wahrscheinlich elektrisch fahren.", "In ten years, most cars will probably run on electricity."));
  discoverList.appendChild(sentenceCard("Er wird jetzt wohl noch in der Besprechung sein.", "He's probably still in the meeting right now."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Bis Freitag werde ich den Bericht fertiggestellt haben.", "By Friday I will have finished the report."));
  applyList.appendChild(sentenceCard("Sie wird den Bus wohl verpasst haben, deshalb ist sie noch nicht da.", "She's probably missed the bus, which is why she's not here yet."));
  applyList.appendChild(sentenceCard("Das dürfte stimmen — das wäre auch meine Vermutung gewesen.", "That's probably right — that would have been my guess too."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-futur.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FUT_IDS.map(byId).filter(Boolean), document.getElementById("grid-fut"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-fut").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-futur-quiz.json");

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
