/**
 * Page script for lessons/b1-verbraucherrecht.html — B1 Unit 19 (topic unit).
 * The "topic" picker walks core consumer-rights situations (online
 * purchases, warranty claims, signing, cancelling, complaints); the
 * "action" picker answers "what would you do?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-19-verbraucherrecht";

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

const VR_IDS = [
  "vr-vertrag", "vr-kuendigungsfrist", "vr-widerrufsrecht", "vr-garantie",
  "vr-gewaehrleistung", "vr-reklamation", "vr-agb", "vr-kleingedruckte",
  "vr-abo", "vr-rechnung", "vr-mahnung", "vr-verbraucherschutz",
  "vr-verbraucherzentrale", "vr-umtausch", "vr-erstattung",
  "vr-vertragslaufzeit", "vr-frist", "vr-quittung", "vr-mangelhaft",
  "vr-fristlos", "vr-verbindlich", "vr-abschliessen", "vr-widerrufen",
  "vr-kuendigen", "vr-erstatten", "vr-haften", "vr-beanstanden",
  "vr-abonnieren",
];

const TOPICS = [
  { key: "online-kauf", moment: "Buying something online", line: "Bei Online-Käufen habe ich vierzehn Tage Widerrufsrecht, ich kann die Ware also ohne Grund zurückschicken.", note: "das Widerrufsrecht = the 14-day right of withdrawal for most online/distance purchases — one of the most useful consumer rights to know." },
  { key: "garantie", moment: "A product breaks", line: "Der Hersteller gibt zwei Jahre Garantie, aber gesetzlich habe ich sogar zwei Jahre Gewährleistung gegenüber dem Verkäufer.", note: "Garantie (manufacturer, voluntary) and Gewährleistung (seller, required by law) are easy to confuse — but legally very different." },
  { key: "vertrag", moment: "Signing a contract", line: "Bevor ich unterschreibe, lese ich immer das Kleingedruckte und die AGB.", note: "das Kleingedruckte and die AGB (Allgemeine Geschäftsbedingungen) are where the details that matter usually hide." },
  { key: "abo", moment: "Cancelling a subscription", line: "Ich möchte mein Abo fristgerecht kündigen — die Kündigungsfrist beträgt einen Monat.", note: "always check die Kündigungsfrist before you try to cancel — many contracts auto-renew if you miss it." },
  { key: "reklamation", moment: "Making a complaint", line: "Die Ware war mangelhaft, deshalb habe ich eine Reklamation eingereicht und eine Erstattung bekommen.", note: "if a seller won't help, die Verbraucherzentrale can advise you for free or cheap." },
];

const ACTIONS = [
  { key: "lesen", label: "Vor der Unterschrift", response: "Ich lese jeden Vertrag genau durch, bevor ich ihn unterschreibe — besonders das Kleingedruckte." },
  { key: "online", label: "Beim Online-Shopping", response: "Wenn mir etwas nicht gefällt, nutze ich einfach mein Widerrufsrecht und schicke es zurück." },
  { key: "reklamieren", label: "Bei einem Mangel", response: "Ich beanstande den Mangel schriftlich und fordere eine Reparatur oder eine Erstattung." },
  { key: "hilfe", label: "Bei Unsicherheit", response: "Wenn ich unsicher bin, frage ich die Verbraucherzentrale um Rat." },
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

function initActionPicker() {
  initPicker({
    buttonsId: "action-picker-buttons",
    resultId: "action-picker-result",
    options: ACTIONS,
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
  initActionPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Bevor Sie einen Vertrag unterschreiben, sollten Sie das Kleingedruckte genau lesen.", "Before you sign a contract, you should read the fine print carefully."));
  discoverList.appendChild(sentenceCard("Bei den meisten Online-Käufen haben Sie vierzehn Tage Widerrufsrecht.", "For most online purchases, you have a fourteen-day right of withdrawal."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Da die Ware mangelhaft war, habe ich innerhalb der Gewährleistungsfrist eine Reparatur verlangt.", "Since the item was defective, I demanded a repair within the statutory warranty period."));
  applyList.appendChild(sentenceCard("Ich habe mein Abo fristgerecht gekündigt, um keine weitere Zahlung zu riskieren.", "I cancelled my subscription in time to avoid another payment."));
  applyList.appendChild(sentenceCard("Wenn ein Unternehmen nicht reagiert, kann die Verbraucherzentrale weiterhelfen.", "If a company doesn't respond, the consumer advice center can help further."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-verbraucherrecht.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(VR_IDS.map(byId).filter(Boolean), document.getElementById("grid-vr"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-vr").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-verbraucherrecht-quiz.json");

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
