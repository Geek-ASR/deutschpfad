/**
 * Page script for lessons/b1-relativsaetze.html — B1 Unit 6.
 * The "rel" picker shows a relative clause for each preposition / type
 * and explains why the pronoun has that case; the "desc" picker defines
 * a person or thing with a relative clause. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-6-relativsaetze";

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

const R2_IDS = [
  "r2-prep-relativ", "r2-mit-dem", "r2-fuer-den", "r2-bei-der", "r2-ueber-das",
  "r2-auf-den", "r2-woran", "r2-was-alles", "r2-was-satz", "r2-das-beste-was",
  "r2-wo-relativ", "r2-wohin", "r2-woher", "r2-wer-der", "r2-was-freies",
  "r2-welcher", "r2-dessen-gebrauch", "r2-relativpronomen", "r2-bezugswort",
  "r2-einschub", "r2-relativsatz-position", "r2-derjenige", "r2-worum-es-geht",
  "r2-zusammenhang", "r2-umstand", "r2-grundlage", "r2-eigenschaft",
];

const RELATIVES = [
  { key: "mitdem", label: "mit + Dativ → mit dem / der / denen", line: "Die Kollegin, mit der ich das Projekt mache, ist heute krank.", note: "\"mit\" always takes the Dativ, so: dem (m/n), der (f), denen (pl). Gender from \"die Kollegin\" → der." },
  { key: "fuerden", label: "für + Akkusativ → für den / die / das", line: "Der Verein, für den ich mich engagiere, sucht Helfer.", note: "\"für\" takes the Akkusativ: den (m), die (f/pl), das (n). \"der Verein\" → den." },
  { key: "beider", label: "bei + Dativ (workplace, doctor)", line: "Die Bank, bei der ich mein Konto habe, schließt die Filiale.", note: "very common for institutions: \"der Arzt, bei dem …\", \"die Firma, bei der …\"." },
  { key: "ueberden", label: "über + Akkusativ (talk about)", line: "Das Problem, über das wir gesprochen haben, ist gelöst.", note: "\"reden / sprechen über\" + Akkusativ → über das (n), über den (m), über die (f/pl)." },
  { key: "aufden", label: "warten auf + Akkusativ", line: "Der Bescheid, auf den ich seit Wochen warte, ist noch nicht da.", note: "\"warten auf\" fixes the Akkusativ, even though \"auf\" is a two-way preposition." },
  { key: "worauf", label: "wo(r)- for things", line: "Ich sage dir gleich, worum es geht und worauf du achten musst.", note: "for a thing (or a \"das\") you may fuse preposition + was: worum, worauf, worüber, womit. Never for people." },
  { key: "wasalles", label: "was after alles / nichts / das Beste", line: "Das Beste, was du tun kannst, ist abwarten. Es gibt nichts, was jetzt hilft.", note: "after alles, nichts, etwas, vieles and neuter superlatives, the relative pronoun is \"was\", not \"das\"." },
  { key: "wassatz", label: "was referring to a whole clause", line: "Der Zug fiel aus, was bedeutete, dass wir ein Taxi brauchten.", note: "when \"which\" comments on the whole preceding sentence, use \"was\"." },
  { key: "wo", label: "wo / wohin / woher (places)", line: "Die Gegend, wo ich aufgewachsen bin, hat sich sehr verändert.", note: "\"wo\" for location, \"wohin\" for direction to, \"woher\" for origin. Natural after place names and vague places." },
  { key: "werder", label: "wer …, der … (free relative)", line: "Wer sich früh anmeldet, bekommt einen besseren Platz.", note: "no antecedent: \"wer\" is subject of its own clause; \"der / den / dem\" carries on in the main clause if the case changes." },
];

const DESCRIPTIONS = [
  { key: "freund", label: "A good friend", response: "Ein guter Freund ist jemand, mit dem man auch schweigen kann und auf den man sich verlassen kann." },
  { key: "wohnung", label: "The flat I want", response: "Ich suche eine Wohnung, die hell ist, in der ich einen Arbeitsplatz habe und deren Miete ich mir leisten kann." },
  { key: "job", label: "A job worth having", response: "Ein Job, für den es sich lohnt aufzustehen, ist einer, bei dem man etwas lernt und in dem man respektiert wird." },
  { key: "stadt", label: "A city I'd move to", response: "Eine Stadt, in die ich ziehen würde, ist eine, wo der Nahverkehr gut ist und woher man schnell ins Grüne kommt." },
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

function relRenderer(option, el) {
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

function descRenderer(option, el) {
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
    buttonsId: "rel-picker-buttons",
    resultId: "rel-picker-result",
    options: RELATIVES,
    renderResult: relRenderer,
  });
  initPicker({
    buttonsId: "desc-picker-buttons",
    resultId: "desc-picker-result",
    options: DESCRIPTIONS,
    renderResult: descRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das ist der Sachbearbeiter, mit dem ich telefoniert habe.", "That's the caseworker I spoke to on the phone."));
  discoverList.appendChild(sentenceCard("Die Unterlagen, auf die das Amt wartet, schicke ich morgen.", "The documents the office is waiting for I'll send tomorrow."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Wohnung, für die wir uns entschieden haben, liegt im vierten Stock.", "The flat we decided on is on the fourth floor."));
  applyList.appendChild(sentenceCard("Alles, was ich für den Termin brauche, liegt schon bereit.", "Everything I need for the appointment is already laid out."));
  applyList.appendChild(sentenceCard("Er hat den Termin vergessen, was ihm sehr unangenehm war.", "He forgot the appointment, which was very awkward for him."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-relativsaetze.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(R2_IDS.map(byId).filter(Boolean), document.getElementById("grid-r2"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-r2").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-relativsaetze-quiz.json");

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
