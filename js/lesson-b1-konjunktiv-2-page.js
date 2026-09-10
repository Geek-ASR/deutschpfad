/**
 * Page script for lessons/b1-konjunktiv-2.html — B1 Unit 1.
 * The "use" picker walks the jobs Konjunktiv II does (polite request,
 * advice, unreal present, unreal past / regret, als ob, beinahe);
 * the "wish" picker gives personal unreal sentences. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-1-konjunktiv-2";

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

const K2B_IDS = [
  "k2b-wuerde", "k2b-waere", "k2b-haette", "k2b-koennte", "k2b-muesste",
  "k2b-sollte", "k2b-duerfte", "k2b-braeuchte", "k2b-ginge", "k2b-wuesste",
  "k2b-kaeme", "k2b-haette-gemacht", "k2b-waere-gegangen", "k2b-haette-sein-koennen",
  "k2b-haette-sollen", "k2b-wenn-satz", "k2b-irrealer-wunsch", "k2b-als-ob",
  "k2b-an-stelle", "k2b-sonst", "k2b-beinahe", "k2b-angenommen", "k2b-hypothese",
  "k2b-bedingung", "k2b-ratschlag", "k2b-vermutung", "k2b-konjunktiv", "k2b-hoeflich",
];

const USES = [
  { key: "bitte", label: "A polite request", line: "Könnten Sie mir sagen, wo der Schalter ist? — Und dürfte ich kurz Ihren Stift haben?", note: "könnte / dürfte in the Konjunktiv II is the normal register for asking strangers." },
  { key: "rat", label: "Giving advice", line: "An deiner Stelle würde ich mich schriftlich beschweren. Du solltest auch eine Frist setzen.", note: "\"an deiner Stelle würde ich …\" + \"du solltest …\" — the two everyday advice frames." },
  { key: "irreal-praesens", label: "If things were different now", line: "Wenn ich mehr Zeit hätte, würde ich einen Deutschkurs machen. So schaffe ich nur eine Stunde am Abend.", note: "Both halves in K II. wenn-clause verb-final; würde in the main clause for the full verb." },
  { key: "irreal-vergangenheit", label: "A regret about the past", line: "Ich hätte früher mit dem Lernen anfangen sollen. Dann hätte ich die Prüfung schon hinter mir.", note: "hätte + Infinitiv + sollen (double infinitive); second clause: hätte + Partizip II." },
  { key: "beinahe", label: "It almost went wrong", line: "Puh — ich wäre fast in den falschen Zug gestiegen. Ohne die Durchsage hätte ich es nicht gemerkt.", note: "fast / beinahe + past K II = nearly happened but didn't. sonst / ohne … carries the alternative." },
  { key: "als-ob", label: "Describing odd behaviour", line: "Er begrüßte mich freundlich, als ob nichts passiert wäre. Sie tut so, als hätte sie alles im Griff.", note: "als ob + verb-final; bare als + verb straight after. Content is unreal, so K II." },
  { key: "hypothese", label: "Setting up a hypothetical", line: "Angenommen, du hättest ein Jahr frei und genug Geld — was würdest du machen?", note: "angenommen / gesetzt den Fall opens it; everything after stays in K II." },
];

const WISHES = [
  { key: "zeit", label: "I wish I had more time", response: "Wenn ich mehr Zeit hätte, würde ich mehr lesen und Sport machen." },
  { key: "sprache", label: "I wish my German were better", response: "Wenn mein Deutsch besser wäre, hätte ich im Alltag weniger Stress." },
  { key: "frueher", label: "I should have started earlier", response: "Ich hätte viel früher anfangen sollen, regelmäßig zu üben." },
  { key: "wohnen", label: "If I could live anywhere", response: "Könnte ich überall wohnen, würde ich es ein Jahr in einer anderen Stadt versuchen." },
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

function initWishPicker() {
  initPicker({
    buttonsId: "wish-picker-buttons",
    resultId: "wish-picker-result",
    options: WISHES,
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
  initWishPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Es wäre toll, wenn Sie mir bis Freitag Bescheid geben könnten.", "It would be great if you could let me know by Friday."));
  discoverList.appendChild(sentenceCard("Ich hätte den Termin fast vergessen — ich hätte ihn mir aufschreiben sollen.", "I almost forgot the appointment — I should have written it down."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Wenn ich das früher gewusst hätte, hätte ich mich anders entschieden.", "If I had known that earlier, I would have decided differently."));
  applyList.appendChild(sentenceCard("An Ihrer Stelle würde ich noch einmal beim Amt nachfragen.", "If I were you, I'd check with the office again."));
  applyList.appendChild(sentenceCard("Das hätte auch schiefgehen können — gut, dass nichts passiert ist.", "That could have gone wrong too — good that nothing happened."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-konjunktiv-2.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(K2B_IDS.map(byId).filter(Boolean), document.getElementById("grid-k2b"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-k2b").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-konjunktiv-2-quiz.json");

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
