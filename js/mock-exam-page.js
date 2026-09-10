/**
 * Page script for mock-exam.html. Orchestrates one full exam sitting:
 * runs the three auto-gradable sections (Hören, Lesen, Schreiben Teil 1)
 * one after another through js/exam-engine.js's runTimedSection, then
 * shows a combined score, a full review, and — separately, since
 * neither can be machine-graded without a backend — a self-check
 * writing exercise (Schreiben Teil 2) and a set of Sprechen prompts to
 * practice out loud.
 */

import { runTimedSection, renderExamReview } from "./exam-engine.js";
import { recordMockExamResult } from "./progress-store.js";

const EXAM_ID = "a1-mock-exam-1";
const PASS_THRESHOLD_PCT = 60;

let examData = null;
let sectionResults = [];

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function startExam() {
  document.getElementById("exam-intro").hidden = true;
  document.getElementById("exam-results").hidden = true;
  document.getElementById("exam-active").hidden = false;
  sectionResults = [];
  runNextSection(0);
}

function runNextSection(sectionIndex) {
  if (sectionIndex >= examData.sections.length) {
    finishExam();
    return;
  }
  const section = examData.sections[sectionIndex];
  runTimedSection({
    container: document.getElementById("exam-active"),
    section,
    onSectionFinish: (result) => {
      sectionResults.push({ ...result, label: section.label, labelEn: section.labelEn });
      runNextSection(sectionIndex + 1);
    },
  });
}

function renderScoreSummary(totalCorrect, totalQuestions, pct) {
  const mount = document.getElementById("exam-score-mount");
  mount.innerHTML = "";

  const headline = document.createElement("p");
  headline.className = "exam-score-headline";
  headline.textContent = `${totalCorrect} / ${totalQuestions} (${pct}%)`;
  mount.appendChild(headline);

  const breakdown = document.createElement("ul");
  breakdown.className = "exam-score-breakdown";
  sectionResults.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `${s.label}: ${s.correct} / ${s.total}`;
    breakdown.appendChild(li);
  });
  mount.appendChild(breakdown);

  const note = document.createElement("p");
  note.className = "status-note";
  const passNote =
    pct >= PASS_THRESHOLD_PCT
      ? `This score alone is a good sign — Goethe/telc-style A1 exams generally need around ${PASS_THRESHOLD_PCT}% overall to pass.`
      : `Goethe/telc-style A1 exams generally need around ${PASS_THRESHOLD_PCT}% overall to pass — there's more to review here. Go back through the units these questions came from, then try again.`;
  note.innerHTML = `This covers Hören, Lesen, and the fact-based part of Schreiben — the parts a script can actually check. ${passNote} Schreiben's open writing and the whole Sprechen module still need a person to assess fairly — practice both below.`;
  mount.appendChild(note);
}

function renderSchreibenTeil2() {
  const mount = document.getElementById("exam-schreiben2-mount");
  mount.innerHTML = "";
  const data = examData.schreibenTeil2;

  const instructions = document.createElement("p");
  instructions.textContent = data.instructions;
  mount.appendChild(instructions);

  const situation = document.createElement("p");
  situation.lang = "de";
  situation.className = "exam-writing-situation";
  situation.textContent = data.situationDe;
  mount.appendChild(situation);

  const promptList = document.createElement("ul");
  data.prompts.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    promptList.appendChild(li);
  });
  mount.appendChild(promptList);

  const textarea = document.createElement("textarea");
  textarea.className = "exam-writing-textarea";
  textarea.rows = 5;
  textarea.setAttribute("aria-label", "Your message");
  textarea.placeholder = "Write your message here (about 20–30 words)…";
  mount.appendChild(textarea);

  const revealBtn = document.createElement("button");
  revealBtn.type = "button";
  revealBtn.className = "btn btn-secondary btn-sm";
  revealBtn.textContent = "Show a model answer";
  mount.appendChild(revealBtn);

  const modelWrap = document.createElement("div");
  modelWrap.className = "exam-model-answer";
  modelWrap.hidden = true;
  const modelDe = document.createElement("p");
  modelDe.lang = "de";
  modelDe.textContent = data.modelAnswer;
  const modelEn = document.createElement("p");
  modelEn.className = "vocab-example-en";
  modelEn.textContent = data.modelAnswerEn;
  modelWrap.appendChild(modelDe);
  modelWrap.appendChild(modelEn);
  mount.appendChild(modelWrap);

  revealBtn.addEventListener("click", () => {
    modelWrap.hidden = !modelWrap.hidden;
    revealBtn.textContent = modelWrap.hidden ? "Show a model answer" : "Hide model answer";
  });
}

function renderSprechen() {
  const mount = document.getElementById("exam-sprechen-mount");
  mount.innerHTML = "";
  const data = examData.sprechen;

  const instructions = document.createElement("p");
  instructions.textContent = data.instructions;
  mount.appendChild(instructions);

  const grid = document.createElement("div");
  grid.className = "grid grid-3";
  data.teile.forEach((teil) => {
    const card = document.createElement("article");
    card.className = "card";
    const h3 = document.createElement("h3");
    h3.textContent = teil.title;
    card.appendChild(h3);
    const titleEn = document.createElement("p");
    titleEn.className = "vocab-meta";
    titleEn.textContent = teil.titleEn;
    card.appendChild(titleEn);
    const p = document.createElement("p");
    p.textContent = teil.instructions;
    card.appendChild(p);
    const ul = document.createElement("ul");
    ul.className = "exam-sprechen-examples";
    teil.examples.forEach((ex) => {
      const li = document.createElement("li");
      li.lang = "de";
      li.textContent = ex;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    grid.appendChild(card);
  });
  mount.appendChild(grid);

  const linksP = document.createElement("p");
  linksP.style.marginTop = "var(--space-4)";
  linksP.innerHTML =
    'More spoken practice: <a href="pronunciation.html">Pronunciation Lab</a> and the <a href="scenarios/bahnhof.html">"Am Bahnhof" scenario</a>.';
  mount.appendChild(linksP);
}

function finishExam() {
  document.getElementById("exam-active").hidden = true;
  document.getElementById("exam-results").hidden = false;

  const totalCorrect = sectionResults.reduce((sum, s) => sum + s.correct, 0);
  const totalQuestions = sectionResults.reduce((sum, s) => sum + s.total, 0);
  const pct = totalQuestions ? Math.round((100 * totalCorrect) / totalQuestions) : 0;

  renderScoreSummary(totalCorrect, totalQuestions, pct);
  renderExamReview(document.getElementById("exam-review-mount"), sectionResults);
  renderSchreibenTeil2();
  renderSprechen();

  const allResponses = sectionResults.flatMap((s) => s.responses);
  recordMockExamResult(EXAM_ID, {
    correct: totalCorrect,
    total: totalQuestions,
    mode: "quiz",
    responses: allResponses,
  });
}

async function main() {
  try {
    examData = await loadJSON("data/exams/a1-mock-exam-1.json");
  } catch (err) {
    console.error(err);
    document.getElementById("exam-loading").hidden = true;
    document.getElementById("exam-empty").hidden = false;
    return;
  }

  document.getElementById("exam-loading").hidden = true;
  document.getElementById("exam-intro").hidden = false;
  document.getElementById("start-exam-btn").addEventListener("click", startExam);
  document.getElementById("retry-exam-btn").addEventListener("click", startExam);
}

document.addEventListener("DOMContentLoaded", main);
