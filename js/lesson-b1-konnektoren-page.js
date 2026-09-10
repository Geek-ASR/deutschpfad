/**
 * Page script for lessons/b1-konnektoren.html — B1 Unit 3.
 * The "connector" picker takes one situation and shows it with each
 * connector type, spelling out the word-order effect; the "argument"
 * picker shows a topic argued from both sides with zwar … aber /
 * einerseits … andererseits. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-3-konnektoren";

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

const KON_IDS = [
  "kon-weil", "kon-da", "kon-denn", "kon-naemlich", "kon-deshalb", "kon-deswegen",
  "kon-daher", "kon-darum", "kon-aus-diesem-grund", "kon-folglich", "kon-somit",
  "kon-grund", "kon-ursache", "kon-obwohl", "kon-obgleich", "kon-trotzdem",
  "kon-dennoch", "kon-gleichwohl", "kon-trotz", "kon-zwar-aber", "kon-allerdings",
  "kon-dabei", "kon-widerspruch", "kon-dagegen", "kon-hingegen", "kon-waehrend",
  "kon-einerseits-andererseits", "kon-sodass", "kon-konjunktionaladverb",
];

const CONNECTORS = [
  { key: "weil", label: "weil (subordinating)", line: "Ich fahre mit dem Rad, weil das Wetter schön ist.", note: "Comma, then the clause, verb LAST: \"… ist\". The reason-clause can also come first: \"Weil das Wetter schön ist, fahre ich mit dem Rad.\"" },
  { key: "denn", label: "denn (coordinating)", line: "Ich fahre mit dem Rad, denn das Wetter ist schön.", note: "\"denn\" sits in position zero and changes nothing — subject then verb, as normal. Never starts the sentence." },
  { key: "deshalb", label: "deshalb (adverb)", line: "Das Wetter ist schön, deshalb fahre ich mit dem Rad.", note: "Position 1 → verb second → subject AFTER the verb: \"deshalb fahre ich\". Same for deswegen, daher, darum." },
  { key: "naemlich", label: "nämlich (mid-clause)", line: "Ich fahre mit dem Rad; das Wetter ist nämlich schön.", note: "Can't start a clause. It stands just after the verb, inside the sentence." },
  { key: "obwohl", label: "obwohl (subordinating, concessive)", line: "Ich fahre mit dem Rad, obwohl es regnet.", note: "Concession. Verb LAST in the obwohl-clause: \"… regnet\"." },
  { key: "trotzdem", label: "trotzdem (adverb, concessive)", line: "Es regnet. Trotzdem fahre ich mit dem Rad.", note: "Position 1 → verb second → \"trotzdem fahre ich\". Same word order as deshalb, opposite meaning." },
  { key: "trotz", label: "trotz + Genitiv (preposition)", line: "Trotz des Regens fahre ich mit dem Rad.", note: "Takes a noun in the Genitiv, not a clause. Still position 1, so verb second." },
  { key: "zwaraber", label: "zwar …, aber … (two-part)", line: "Es regnet zwar, aber ich fahre trotzdem mit dem Rad.", note: "Concede first (\"zwar\" mid-clause), then counter with \"aber\" starting the next clause." },
];

const ARGUMENTS = [
  { key: "homeoffice", label: "Working from home", line: "Einerseits spart man das Pendeln und arbeitet oft konzentrierter, andererseits fehlt der direkte Kontakt zu den Kollegen. Homeoffice hat also Vorteile, trotzdem braucht ein Team feste Bürotage.", note: "einerseits …, andererseits … to weigh both sides; trotzdem to land on a position." },
  { key: "auto", label: "Owning a car in the city", line: "Ein eigenes Auto ist zwar bequem, aber es ist teuer und man findet kaum einen Parkplatz. Da der Nahverkehr gut ausgebaut ist, lohnt sich ein Auto in der Stadt oft nicht.", note: "zwar … aber … for the concession; da … for the reason, verb to the end." },
  { key: "englisch", label: "Learning German vs. getting by in English", line: "Man kommt im Alltag zunächst mit Englisch durch, deshalb schieben viele das Deutschlernen auf. Wer aber wirklich ankommen will, sollte früh anfangen, weil Behörden, Ärzte und Nachbarn meist Deutsch sprechen.", note: "deshalb (adverb, verb second); aber (position 0); weil (verb last)." },
  { key: "stadt-land", label: "City life vs. countryside", line: "In der Stadt gibt es mehr Jobs und Kultur; auf dem Land hingegen sind die Mieten niedriger und es ist ruhiger. Beides hat seinen Preis — folglich hängt die Wahl vom Lebensstil ab.", note: "hingegen for the formal contrast; folglich to draw the conclusion." },
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

function pickerRenderer(option, el) {
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

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initPicker({
    buttonsId: "con-picker-buttons",
    resultId: "con-picker-result",
    options: CONNECTORS,
    renderResult: pickerRenderer,
  });
  initPicker({
    buttonsId: "arg-picker-buttons",
    resultId: "arg-picker-result",
    options: ARGUMENTS,
    renderResult: pickerRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich lerne jeden Tag Deutsch, weil ich hier arbeiten möchte.", "I study German every day because I want to work here."));
  discoverList.appendChild(sentenceCard("Ich möchte hier arbeiten, deshalb lerne ich jeden Tag Deutsch.", "I want to work here, that's why I study German every day."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Obwohl der Kurs anstrengend war, habe ich viel gelernt.", "Although the course was demanding, I learned a lot."));
  applyList.appendChild(sentenceCard("Der Bus war voll, trotzdem habe ich einen Sitzplatz gefunden.", "The bus was full; nevertheless I found a seat."));
  applyList.appendChild(sentenceCard("Das Angebot klingt gut. Ich muss es mir allerdings noch überlegen.", "The offer sounds good. However, I still need to think it over."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-konnektoren.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(KON_IDS.map(byId).filter(Boolean), document.getElementById("grid-kon"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-kon").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-konnektoren-quiz.json");

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
