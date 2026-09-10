/**
 * Page script for lessons/a2-work.html — A2 Unit 11, same shape as
 * the other A2 grammar-unit glue. The picker shows each profession
 * three ways — "als" (working as), "werden" (becoming), and a Perfekt
 * career line — with the article-less job word chipped (shared
 * .word-breakdown-part). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-11-work";

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

const WORK_IDS = [
  "wk-bewerben",
  "wk-bewerbung",
  "wk-stelle",
  "wk-vorstellungsgespraech",
  "wk-lebenslauf",
  "wk-ausbildung",
  "wk-berufserfahrung",
  "wk-kenntnisse",
  "wk-einstellen",
  "wk-kuendigen",
  "wk-arbeitgeber",
  "wk-selbststaendig",
  "wk-werden",
];

// noun = the bare, article-less profession word to chip in each line.
const ROLES = [
  { key: "lehrerin", label: "teacher (f)", noun: "Lehrerin", als: "Ich arbeite als Lehrerin an einer Grundschule.", werden: "Ich wollte schon als Kind Lehrerin werden.", perfekt: "Ich habe fünf Jahre an einer Schule in Bonn gearbeitet." },
  { key: "ingenieur", label: "engineer", noun: "Ingenieur", als: "Ich arbeite als Ingenieur bei einer Autofirma.", werden: "Mein Sohn will auch Ingenieur werden.", perfekt: "Ich habe mein Studium 2018 abgeschlossen." },
  { key: "aerztin", label: "doctor (f)", noun: "Ärztin", als: "Sie arbeitet als Ärztin im Krankenhaus.", werden: "Sie möchte später auch Ärztin werden.", perfekt: "Sie hat drei Jahre in einer Praxis gearbeitet." },
  { key: "koch", label: "cook / chef", noun: "Koch", als: "Er arbeitet als Koch in einem Hotel.", werden: "Nach der Schule will er Koch werden.", perfekt: "Er hat eine Ausbildung als Koch gemacht." },
  { key: "pflegerin", label: "nurse (f)", noun: "Krankenpflegerin", als: "Ich arbeite als Krankenpflegerin auf der Kinderstation.", werden: "Viele wollen heute nicht mehr Krankenpflegerin werden.", perfekt: "Ich habe zehn Jahre im selben Krankenhaus gearbeitet." },
  { key: "mechaniker", label: "mechanic", noun: "Mechaniker", als: "Er arbeitet als Mechaniker in einer Werkstatt.", werden: "Er wird nächstes Jahr Kfz-Mechaniker.", perfekt: "Er hat seine Ausbildung mit einer guten Note abgeschlossen." },
  { key: "verkaeuferin", label: "sales assistant (f)", noun: "Verkäuferin", als: "Ich arbeite als Verkäuferin in einem Schuhgeschäft.", werden: "Sie will nicht ihr ganzes Leben Verkäuferin bleiben.", perfekt: "Ich habe mich um eine Stelle als Filialleiterin beworben." },
  { key: "programmierer", label: "programmer", noun: "Programmierer", als: "Ich arbeite als Programmierer bei einem Start-up.", werden: "Immer mehr Leute wollen Programmierer werden.", perfekt: "Ich habe zwei Jahre bei einer großen Firma gearbeitet und dann gekündigt." },
];

const IV_OPTIONS = [
  { key: "koch", label: "Trained cook, some experience", response: "Ich habe eine Ausbildung als Koch gemacht und danach vier Jahre in einem Restaurant gearbeitet." },
  { key: "wechsel", label: "Employed, want to change field", response: "Zurzeit arbeite ich als Ingenieur, aber ich möchte mich beruflich verändern." },
  { key: "absolvent", label: "Just finished studying", response: "Ich habe gerade mein Studium abgeschlossen und suche jetzt meine erste feste Stelle." },
  { key: "bewerbung", label: "Straight to the point", response: "Ich bewerbe mich um die Stelle als Projektleiterin, weil ich schon viel Erfahrung im Team habe." },
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
    // Unicode-aware word boundary: \\b breaks on umlauts (Ärztin, Über…),
    // so guard with "not a letter/number" on each side instead.
    const escaped = chipWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp("(?<![\\p{L}\\p{N}_])" + escaped + "(?![\\p{L}\\p{N}_])", "u");
    p.innerHTML = sentence.replace(rx, chip);
  } else {
    p.textContent = sentence;
  }
  wrap.appendChild(p);

  const speakBtn = createSpeakButton(sentence, "Listen");
  if (speakBtn) wrap.appendChild(speakBtn);
  return wrap;
}

function initRolePicker() {
  initPicker({
    buttonsId: "role-picker-buttons",
    resultId: "role-picker-result",
    options: ROLES,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.label;
      el.appendChild(heading);

      el.appendChild(line("als (working as) — no article", option.als, option.noun, "a"));
      el.appendChild(line("werden (becoming) — no article", option.werden, option.noun, "a"));
      el.appendChild(line("Perfekt — a career line", option.perfekt, null, "b"));
    },
  });
}

function initIvPicker() {
  initPicker({
    buttonsId: "iv-picker-buttons",
    resultId: "iv-picker-result",
    options: IV_OPTIONS,
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

  initRolePicker();
  initIvPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich arbeite als Krankenpfleger in einem Altenheim.", "I work as a nurse in a care home."));
  discoverList.appendChild(sentenceCard("Meine Schwester will Anwältin werden.", "My sister wants to become a lawyer."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich habe mich bei drei Firmen beworben und zwei Vorstellungsgespräche bekommen.", "I applied to three companies and got two interviews."));
  applyList.appendChild(sentenceCard("Nach zehn Jahren im Büro habe ich gekündigt und mich selbstständig gemacht.", "After ten years in the office I quit and went self-employed."));
  applyList.appendChild(sentenceCard("Für die Stelle braucht man gute Deutschkenntnisse und drei Jahre Berufserfahrung.", "The job needs good German skills and three years of work experience."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-work.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(WORK_IDS.map(byId).filter(Boolean), document.getElementById("grid-work"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-work").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-work-quiz.json");

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
