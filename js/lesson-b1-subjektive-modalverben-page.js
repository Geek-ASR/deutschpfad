/**
 * Page script for lessons/b1-subjektive-modalverben.html — B1 Unit 8.
 * The "cert" picker walks the certainty scale (muss → dürfte →
 * kann/könnte → mag → wird wohl → soll → will) with a worked example;
 * the "guess" picker applies a modal, present or past, to a situation.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-8-subjektive-modalverben";

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

const SM_IDS = [
  "sm-objektiv-subjektiv", "sm-muss-sein", "sm-duerfte-sein", "sm-kann-sein",
  "sm-mag-sein", "sm-wird-wohl", "sm-soll-sein", "sm-will-sein",
  "sm-infinitiv-perfekt", "sm-muss-getan-haben", "sm-duerfte-getan-haben",
  "sm-kann-getan-haben", "sm-will-getan-haben", "sm-soll-getan-haben",
  "sm-vermutung", "sm-behauptung", "sm-gewissheit", "sm-wahrscheinlichkeit",
  "sm-wahrscheinlich", "sm-vermutlich", "sm-angeblich", "sm-vielleicht",
  "sm-sicher", "sm-offenbar", "sm-annehmen", "sm-bezweifeln", "sm-vermuten",
  "sm-behaupten",
];

const CERTAINTY = [
  { key: "muss", label: "muss … sein — near-certain", line: "Das Licht brennt und die Schuhe stehen da — er muss zu Hause sein.", note: "the strongest guess, based on clear evidence. Past: muss … Partizip II + haben/sein." },
  { key: "duerfte", label: "dürfte … sein — fairly confident", line: "Sie arbeitet dort schon lange — sie dürfte die Abläufe gut kennen.", note: "Konjunktiv II of dürfen, a notch below \"muss\". Very common in careful, polite guesses." },
  { key: "kann", label: "kann/könnte … sein — possible", line: "Er antwortet nicht — er könnte im Zug ohne Netz sein.", note: "a real possibility, no strong evidence either way. Weaker than \"dürfte\"." },
  { key: "mag", label: "mag … sein — rough estimate / concession", line: "Sie mag Anfang vierzig sein — genau weiß ich es nicht. Das mag sein, aber es ändert nichts.", note: "a rough guess, or a concession before you object with \"aber\"." },
  { key: "wirdwohl", label: "wird (wohl) … — expectation", line: "Es ist schon spät — sie wird wohl schon schlafen.", note: "your own expectation of how things usually go, softened by \"wohl\"." },
  { key: "soll", label: "soll … sein — hearsay", line: "Ich war noch nicht dort, aber das Restaurant soll fantastisch sein.", note: "you're passing on what someone else said — not vouching for it yourself." },
  { key: "will", label: "will … sein/getan haben — doubted self-claim", line: "Er will die ganze Nacht gearbeitet haben — das kaufe ich ihm nicht ganz ab.", note: "the subject claims this about themselves; the speaker signals some doubt." },
];

const SITUATIONS = [
  { key: "nichtda", label: "A colleague isn't answering messages", response: "Er antwortet seit Stunden nicht — er muss ein Problem mit dem Handy haben. Vielleicht hat er es einfach vergessen." },
  { key: "verspaetet", label: "The train is late again", response: "Der Zug dürfte wieder Verspätung haben. Laut Ansage soll es an einer Signalstörung liegen." },
  { key: "pruefung", label: "A friend seems nervous before results", response: "Sie muss die ganze Nacht gelernt haben — sie sieht müde aus. Offenbar hat sie sich große Sorgen gemacht." },
  { key: "streit", label: "Two neighbours had an argument", response: "Es muss laut gewesen sein — mehrere Leute haben es gehört. Er will aber nichts damit zu tun gehabt haben." },
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

function certRenderer(option, el) {
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

function situationRenderer(option, el) {
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
    buttonsId: "cert-picker-buttons",
    resultId: "cert-picker-result",
    options: CERTAINTY,
    renderResult: certRenderer,
  });
  initPicker({
    buttonsId: "guess-picker-buttons",
    resultId: "guess-picker-result",
    options: SITUATIONS,
    renderResult: situationRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich muss heute noch zur Post gehen.", "I have to go to the post office today. (objective — an obligation)"));
  discoverList.appendChild(sentenceCard("Die Post ist gleich um die Ecke — das muss schnell gehen.", "The post office is just around the corner — that must be quick. (subjective — a guess)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Sie meldet sich nicht mehr — sie dürfte schon im Flugzeug sitzen.", "She's stopped replying — she's probably already on the plane."));
  applyList.appendChild(sentenceCard("Laut den Nachbarn soll die Wohnung schon vermietet sein.", "According to the neighbours the flat is said to already be rented."));
  applyList.appendChild(sentenceCard("Er will die E-Mail nie bekommen haben — vermutlich landete sie im Spam.", "He claims never to have received the e-mail — it presumably ended up in spam."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-subjektive-modalverben.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(SM_IDS.map(byId).filter(Boolean), document.getElementById("grid-sm"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-sm").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-subjektive-modalverben-quiz.json");

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
