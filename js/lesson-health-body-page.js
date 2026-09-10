/**
 * Page script for lessons/a2-health-body.html — A2 Unit 9, same shape
 * as the other A2 grammar-unit glue. The picker shows each symptom
 * two ways — "weh tun" with the dative pronoun chipped, and the
 * "-schmerzen" noun — plus one line of "sollte" advice. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-9-health-body";

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

const HEALTH_IDS = [
  "hb-erkaelten",
  "hb-husten",
  "hb-schnupfen",
  "hb-grippe",
  "hb-tablette",
  "hb-rezept",
  "hb-praxis",
  "hb-krankenversicherung",
  "hb-schulter",
  "hb-knie",
  "hb-verletzen",
  "hb-gesundheit",
  "hb-krankmeldung",
];

// wehTun uses the dative pronoun "mir" (chipped). verb = tut / tun
// depending on whether the body part is singular or plural.
const SYMPTOMS = [
  { key: "kopf", label: "head", wehTun: "Mir tut der Kopf weh.", verb: "tut", schmerzen: "Ich habe Kopfschmerzen.", advice: "Du solltest dich hinlegen und das Licht ausmachen." },
  { key: "hals", label: "throat", wehTun: "Mir tut der Hals weh.", verb: "tut", schmerzen: "Ich habe Halsschmerzen.", advice: "Du solltest Tee mit Honig trinken." },
  { key: "bauch", label: "stomach", wehTun: "Mir tut der Bauch weh.", verb: "tut", schmerzen: "Ich habe Bauchschmerzen.", advice: "Du solltest nichts Fettiges essen." },
  { key: "zahn", label: "tooth", wehTun: "Mir tut der Zahn weh.", verb: "tut", schmerzen: "Ich habe Zahnschmerzen.", advice: "Du solltest so schnell wie möglich zum Zahnarzt gehen." },
  { key: "ruecken", label: "back", wehTun: "Mir tut der Rücken weh.", verb: "tut", schmerzen: "Ich habe Rückenschmerzen.", advice: "Du solltest dich mehr bewegen und weniger sitzen." },
  { key: "fuesse", label: "feet (plural)", wehTun: "Mir tun die Füße weh.", verb: "tun", schmerzen: "Ich habe Schmerzen in den Füßen.", advice: "Du solltest bequemere Schuhe tragen." },
  { key: "ohren", label: "ears (plural)", wehTun: "Mir tun die Ohren weh.", verb: "tun", schmerzen: "Ich habe Ohrenschmerzen.", advice: "Du solltest zum Arzt gehen, das kann eine Entzündung sein." },
  { key: "erkaeltung", label: "a cold", wehTun: "Mir tut alles weh und ich habe Fieber.", verb: "tut", schmerzen: "Ich habe eine Erkältung.", advice: "Du solltest im Bett bleiben und viel schlafen." },
];

const DOC_OPTIONS = [
  { key: "hals", label: "Sore throat and a fever", response: "Ich habe seit gestern Halsschmerzen und Fieber. Ich glaube, es ist eine Grippe." },
  { key: "kopf", label: "Headache for two days", response: "Ich habe seit zwei Tagen starke Kopfschmerzen, auch mit Tabletten." },
  { key: "knie", label: "Hurt my knee playing football", response: "Ich habe mir beim Fußball das Knie verletzt, jetzt tut es beim Gehen weh." },
  { key: "krankmeldung", label: "Just need a sick note", response: "Mir geht es etwas besser, aber ich brauche noch eine Krankmeldung für meinen Arbeitgeber." },
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

function line(label, sentence, chipWord, tone) {
  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.style.marginTop = "var(--space-2)";

  const tag = document.createElement("span");
  tag.className = "picker-result-meta";
  tag.style.margin = "0";
  tag.style.fontWeight = "700";
  if (tone) tag.style.color = tone === "a" ? "var(--color-primary)" : "var(--color-accent)";
  tag.textContent = label;
  wrap.appendChild(tag);

  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.lineHeight = "2.2";
  p.style.margin = "0";
  if (chipWord) {
    const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${chipWord}</span>`;
    p.innerHTML = sentence.replace(new RegExp("\\b" + chipWord + "\\b"), chip);
  } else {
    p.textContent = sentence;
  }
  wrap.appendChild(p);

  const speakBtn = createSpeakButton(sentence, "Listen");
  if (speakBtn) wrap.appendChild(speakBtn);
  return wrap;
}

function initSymPicker() {
  initPicker({
    buttonsId: "sym-picker-buttons",
    resultId: "sym-picker-result",
    options: SYMPTOMS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.label;
      el.appendChild(heading);

      el.appendChild(line(`weh tun (${option.verb})`, option.wehTun, "Mir", "a"));
      el.appendChild(line("with -schmerzen + haben", option.schmerzen, null, "a"));
      el.appendChild(line("advice — sollte", option.advice, "solltest", "b"));
    },
  });
}

function initDocPicker() {
  initPicker({
    buttonsId: "doc-picker-buttons",
    resultId: "doc-picker-result",
    options: DOC_OPTIONS,
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

  initSymPicker();
  initDocPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Herr Doktor, mir tut seit gestern der Hals weh.", "Doctor, my throat has hurt since yesterday."));
  discoverList.appendChild(sentenceCard("Sie sollten viel Tee trinken und ein paar Tage zu Hause bleiben.", "You should drink lots of tea and stay home for a few days."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich habe mich erkältet: Schnupfen, Husten und ein bisschen Fieber.", "I've caught a cold: runny nose, cough and a slight fever."));
  applyList.appendChild(sentenceCard("Für die Tabletten brauche ich ein Rezept, oder?", "I need a prescription for the tablets, right?"));
  applyList.appendChild(sentenceCard("Du solltest nicht arbeiten, wenn du krank bist.", "You shouldn't work when you're ill."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-health-body.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(HEALTH_IDS.map(byId).filter(Boolean), document.getElementById("grid-health"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-health").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-health-body-quiz.json");

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
