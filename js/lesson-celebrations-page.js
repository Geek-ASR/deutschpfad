/**
 * Page script for lessons/a2-celebrations.html — A2 Unit 28 (Phase 2
 * topic unit, 28 words). The picker shows each party verb in a
 * sentence with the separable prefix / reflexive pronoun / Dativ
 * person chipped (Unicode-aware). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-28-celebrations";

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

const CE_IDS = [
  "ce-feier", "ce-einladung", "ce-anlass", "ce-gastgeber", "ce-gast",
  "ce-ueberraschung", "ce-geschenk", "ce-feiertag", "ce-hochzeit", "ce-empfang",
  "ce-sekt", "ce-rede", "ce-deko", "ce-torte", "ce-kerze", "ce-zusage",
  "ce-absage", "ce-weihnachten", "ce-silvester", "ce-einladen", "ce-feiern",
  "ce-gratulieren", "ce-schenken", "ce-zusagen", "ce-absagen", "ce-anstossen",
  "ce-mitbringen", "ce-sich-verkleiden",
];

// chip = the separable prefix / reflexive pronoun / Dativ phrase to highlight.
const CE_VERBS = [
  { key: "einladen", label: "einladen — to invite", sentence: "Ich lade dich herzlich zu meiner Feier ein.", chip: "ein", note: "separable: lädt … ein; jemanden ZU etwas einladen (Dativ)" },
  { key: "gratulieren", label: "gratulieren — to congratulate", sentence: "Ich gratuliere dir zum neuen Job!", chip: "dir", note: "gratulieren + Dativ (person); + ZU + Dativ (the occasion). No ge- (-ieren)" },
  { key: "schenken", label: "schenken — to give (as a present)", sentence: "Ich schenke meiner Schwester ein Buch.", chip: "meiner Schwester", note: "jemandem (Dativ) etwas (Akk) schenken — two objects" },
  { key: "zusagen", label: "zusagen — to accept / say yes", sentence: "Ich habe für Samstag schon fest zugesagt.", chip: "zugesagt", note: "separable; the opposite is absagen" },
  { key: "absagen", label: "absagen — to decline / cancel", sentence: "Sie musste die Party kurzfristig absagen.", chip: "absagen", note: "separable; jemandem absagen (Dativ)" },
  { key: "anstossen", label: "anstoßen — to raise a toast", sentence: "Lass uns auf das Brautpaar anstoßen!", chip: "auf das Brautpaar", note: "separable; anstoßen AUF + Akkusativ; then say \"Prost!\"" },
  { key: "mitbringen", label: "mitbringen — to bring along", sentence: "Bring bitte einen Salat und Getränke mit.", chip: "mit", note: "separable: bringt … mit. \"Was soll ich mitbringen?\"" },
  { key: "verkleiden", label: "sich verkleiden — to dress up", sentence: "An Karneval verkleiden sich hier fast alle.", chip: "sich", note: "reflexive; sich (als …) verkleiden = to dress up as" },
];

const RSVP_OPTIONS = [
  { key: "ja", label: "Yes, I'd love to come", response: "Vielen Dank für die Einladung — ich komme sehr gern!" },
  { key: "nein", label: "Sorry, I can't make it", response: "Leider muss ich absagen, ich bin an dem Wochenende nicht da." },
  { key: "mitbringen", label: "What should I bring?", response: "Soll ich etwas mitbringen, zum Beispiel einen Nachtisch?" },
  { key: "glueckwunsch", label: "Happy birthday!", response: "Herzlichen Glückwunsch zum Geburtstag, ich wünsche dir alles Gute!" },
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

function chipInto(sentence, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp("(?<![\\p{L}\\p{N}_])" + escaped + "(?![\\p{L}\\p{N}_])", "u");
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${word}</span>`;
  return sentence.replace(rx, chip);
}

function initPartyPicker() {
  initPicker({
    buttonsId: "party-picker-buttons",
    resultId: "party-picker-result",
    options: CE_VERBS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.label;
      el.appendChild(heading);

      const s = document.createElement("p");
      s.lang = "de";
      s.style.fontSize = "var(--text-md)";
      s.style.lineHeight = "2.2";
      s.style.width = "100%";
      s.innerHTML = chipInto(option.sentence, option.chip);
      el.appendChild(s);

      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.style.width = "100%";
      meta.style.margin = "0";
      meta.textContent = option.note;
      el.appendChild(meta);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initRsvpPicker() {
  initPicker({
    buttonsId: "rsvp-picker-buttons",
    resultId: "rsvp-picker-result",
    options: RSVP_OPTIONS,
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

  initPartyPicker();
  initRsvpPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich werde 30! Das feiere ich am Samstag ab 19 Uhr bei mir. Bringt gute Laune mit!", "I'm turning 30! I'm celebrating on Saturday from 7 pm at my place. Bring good vibes!"));
  discoverList.appendChild(sentenceCard("Danke für die Einladung, ich sage gern zu. Soll ich etwas mitbringen?", "Thanks for the invitation, I'd love to accept. Should I bring something?"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Zur Hochzeit meiner Cousine schenken wir dem Paar einen Gutschein.", "For my cousin's wedding we're giving the couple a voucher."));
  applyList.appendChild(sentenceCard("An Silvester stoßen wir um Mitternacht mit Sekt auf das neue Jahr an.", "On New Year's Eve we toast the new year with sparkling wine at midnight."));
  applyList.appendChild(sentenceCard("Leider muss ich der Feier absagen — meine Tochter ist krank geworden.", "Unfortunately I have to cancel the party — my daughter has fallen ill."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-celebrations.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(CE_IDS.map(byId).filter(Boolean), document.getElementById("grid-celebrations"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-celebrations").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-celebrations-quiz.json");

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
