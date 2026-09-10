/**
 * Page script for lessons/b1-temporalsaetze.html — B1 Unit 5.
 * The "time" picker shows each temporal connector with an example and
 * its tense rule; the "story" picker tells a short personal moment with
 * the matching time clause. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-5-temporalsaetze";

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

const T2_IDS = [
  "t2-nachdem", "t2-plusquamperfekt", "t2-bevor", "t2-ehe", "t2-waehrend-temporal",
  "t2-seitdem", "t2-bis", "t2-sobald", "t2-solange", "t2-als", "t2-wenn-temporal",
  "t2-wann", "t2-sooft", "t2-kaum-dass", "t2-nach-dem", "t2-vor-dem",
  "t2-waehrend-gen", "t2-seit-dat", "t2-bis-zu", "t2-vorher", "t2-nachher",
  "t2-inzwischen", "t2-anschliessend", "t2-zuvor", "t2-gleichzeitig",
  "t2-zeitpunkt", "t2-ablauf", "t2-reihenfolge",
];

const CONNECTORS = [
  { key: "nachdem", label: "nachdem (+ one tense back)", line: "Nachdem ich den Antrag abgeschickt hatte, wartete ich vier Wochen auf den Bescheid.", note: "Main clause past → nachdem + Plusquamperfekt (hatte abgeschickt). Main clause present → nachdem + Perfekt." },
  { key: "bevor", label: "bevor / ehe (same tense)", line: "Bevor ich unterschreibe, lese ich immer das Kleingedruckte.", note: "No tense shift — both halves in the same tense. \"ehe\" is the formal twin of \"bevor\"." },
  { key: "waehrend", label: "während (at the same time)", line: "Während das Wasser kocht, schneide ich das Gemüse.", note: "Two things happening together, same tense. (The \"whereas\" contrast sense was Unit 3.)" },
  { key: "seitdem", label: "seit / seitdem (present tense!)", line: "Seitdem ich in Deutschland lebe, koche ich viel mehr selbst.", note: "Started in the past, still true now → Präsens in German, even though English says \"have been living\"." },
  { key: "bis", label: "bis / sobald / solange", line: "Sobald der Vertrag da ist, unterschreibe ich; bis dahin miete ich das Zimmer nur mündlich.", note: "sobald = as soon as; bis = until; solange = for the whole time that. All take the Präsens for future situations." },
  { key: "alswennwann", label: "als vs. wenn vs. wann", line: "Als ich ankam, war es dunkel. Wenn ich abends ankomme, ist es meistens dunkel. Ich weiß nicht, wann es dunkel wird.", note: "als = one past event · wenn = repeated / present / future · wann = question only." },
  { key: "nominal", label: "short forms with a noun", line: "Nach dem Essen mache ich einen Spaziergang. Vor dem Termin trinke ich einen Kaffee. Während der Fahrt lese ich.", note: "nach / vor / seit + Dativ, während + Genitiv. Turns the verb into a noun and drops the clause." },
];

const MOMENTS = [
  { key: "ankunft", label: "My first days here", response: "Als ich zum ersten Mal in Deutschland ankam, verstand ich fast nichts. Seitdem ich jeden Tag übe, wird es langsam besser." },
  { key: "job", label: "Looking for work", response: "Nachdem ich zehn Bewerbungen geschrieben hatte, bekam ich endlich eine Einladung. Bevor ich zum Gespräch ging, habe ich viel über die Firma gelesen." },
  { key: "wohnung", label: "Moving into a flat", response: "Sobald ich die Zusage hatte, habe ich den Mietvertrag unterschrieben. Seit dem Umzug wohne ich näher an der Uni." },
  { key: "alltag", label: "A normal weekday", response: "Während ich frühstücke, höre ich Nachrichten. Nach der Arbeit gehe ich oft noch schwimmen, und anschließend koche ich." },
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

function connectorRenderer(option, el) {
  el.innerHTML = "";

  const heading = document.createElement("span");
  heading.className = "picker-result-word";
  heading.lang = "de";
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
}

function momentRenderer(option, el) {
  el.innerHTML = "";
  const word = document.createElement("span");
  word.className = "picker-result-word";
  word.lang = "de";
  word.style.fontSize = "var(--text-md)";
  word.textContent = option.response;
  el.appendChild(word);
  const speakBtn = createSpeakButton(option.response, "Listen");
  if (speakBtn) el.appendChild(speakBtn);
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initPicker({
    buttonsId: "time-picker-buttons",
    resultId: "time-picker-result",
    options: CONNECTORS,
    renderResult: connectorRenderer,
  });
  initPicker({
    buttonsId: "story-picker-buttons",
    resultId: "story-picker-result",
    options: MOMENTS,
    renderResult: momentRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Nachdem ich mich angemeldet hatte, bekam ich eine Steuernummer.", "After I had registered, I got a tax number."));
  discoverList.appendChild(sentenceCard("Als ich beim Amt ankam, war die Nummer, die ich gezogen hatte, schon aufgerufen.", "When I got to the office, the number I had drawn had already been called."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Bevor ich eine Wohnung besichtige, mache ich eine Liste mit Fragen.", "Before I view a flat, I make a list of questions."));
  applyList.appendChild(sentenceCard("Seitdem ich einen Sprachpartner habe, spreche ich viel freier.", "Since I've had a language partner, I speak much more freely."));
  applyList.appendChild(sentenceCard("Sobald der Kurs vorbei ist, melde ich mich für die Prüfung an.", "As soon as the course is over, I'll register for the exam."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-temporalsaetze.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(T2_IDS.map(byId).filter(Boolean), document.getElementById("grid-t2"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-t2").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-temporalsaetze-quiz.json");

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
