/**
 * Page script for lessons/b1-kultur-freizeit.html — B1 Unit 24 (topic unit).
 * The "topic" picker walks core culture/leisure situations (events,
 * cultural offerings, tradition, relaxation, identity); the "habit"
 * picker answers "how do you spend your leisure time?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-24-kultur-freizeit";

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

const KUL_IDS = [
  "kul-kulturangebot", "kul-veranstaltung", "kul-ausstellung",
  "kul-auffuehrung", "kul-eintritt", "kul-tradition", "kul-brauch",
  "kul-kulturerbe", "kul-freizeitgestaltung", "kul-festival",
  "kul-erholung", "kul-musse", "kul-abwechslung", "kul-heimat",
  "kul-hochkultur", "kul-popkultur", "kul-kulturell", "kul-vielfaeltig",
  "kul-traditionell", "kul-entspannend", "kul-anspruchsvoll",
  "kul-teilnehmen", "kul-besichtigen", "kul-sich-entspannen",
  "kul-pflegen", "kul-stattfinden", "kul-veranstalten",
  "kul-sich-auskennen",
];

const TOPICS = [
  { key: "veranstaltung", moment: "Talking about going to an event", line: "Am Wochenende findet ein Festival in der Innenstadt statt, an dem wir teilnehmen wollen.", note: "\"stattfinden\" is separable, and the event itself is usually the subject: das Festival findet statt." },
  { key: "kultur", moment: "Talking about culture in a city", line: "Das Kulturangebot der Stadt reicht von klassischen Ausstellungen bis zu anspruchsvollen Theateraufführungen.", note: "das Kulturangebot = everything a place offers culturally — museums, theater, concerts, festivals." },
  { key: "tradition", moment: "Talking about traditions", line: "Jede Region hat ihre eigenen Bräuche und Traditionen, die bis heute gepflegt werden.", note: "\"pflegen\" here means to maintain or keep alive a tradition, not to care for a person." },
  { key: "erholung", moment: "Talking about relaxing", line: "Nach einer stressigen Woche entspanne ich mich am liebsten bei einem Spaziergang in der Natur.", note: "die Erholung and die Muße both describe rest — Muße is more literary, used for unhurried free time." },
  { key: "heimat", moment: "Talking about identity and belonging", line: "Für viele Menschen bedeutet Heimat nicht nur ein Ort, sondern ein Gefühl von Zugehörigkeit.", note: "die Heimat is a culturally loaded word — more emotional than \"home country\" and hard to translate exactly." },
];

const HABITS = [
  { key: "kultur", label: "Kulturell", response: "Ich besuche gern Ausstellungen und gehe manchmal zu einer Theateraufführung." },
  { key: "erholung", label: "Erholung", response: "Zur Erholung lese ich viel oder gehe einfach spazieren, ohne einen genauen Plan zu haben." },
  { key: "veranstaltungen", label: "Veranstaltungen", response: "Ich nehme gern an lokalen Festivals und Veranstaltungen teil, um Leute kennenzulernen." },
  { key: "tradition", label: "Traditionen", response: "Ich pflege gern Traditionen aus meiner Heimat, auch wenn ich weit weg lebe." },
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

function initTopicPicker() {
  initPicker({
    buttonsId: "topic-picker-buttons",
    resultId: "topic-picker-result",
    options: TOPICS,
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

function initHabitPicker() {
  initPicker({
    buttonsId: "habit-picker-buttons",
    resultId: "habit-picker-result",
    options: HABITS,
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

  initTopicPicker();
  initHabitPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das Kulturangebot der Stadt reicht von klassischen Ausstellungen bis zu modernen Festivals.", "The city's cultural offerings range from classical exhibitions to modern festivals."));
  discoverList.appendChild(sentenceCard("Wie man seine Freizeit gestaltet, sagt oft viel über die eigenen Interessen aus.", "How you spend your free time often says a lot about your interests."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Am Wochenende findet ein Festival in der Innenstadt statt, an dem wir teilnehmen wollen.", "This weekend there's a festival taking place downtown that we want to take part in."));
  applyList.appendChild(sentenceCard("Jede Region hat ihre eigenen Bräuche, die bis heute gepflegt werden.", "Every region has its own customs, which are still maintained today."));
  applyList.appendChild(sentenceCard("Ich kenne mich mit der lokalen Kunstszene inzwischen ziemlich gut aus.", "By now I know my way around the local art scene pretty well."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-kultur-freizeit.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(KUL_IDS.map(byId).filter(Boolean), document.getElementById("grid-kul"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-kul").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-kultur-freizeit-quiz.json");

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
