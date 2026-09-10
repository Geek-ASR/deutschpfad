/**
 * Page script for lessons/a2-media-internet.html — A2 Unit 24 (Phase 2
 * topic unit, 28 words). The picker shows a digital-life verb in a
 * sentence with the separable prefix or reflexive pronoun chipped
 * (Unicode-aware). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-24-media-internet";

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

const MEDIA_IDS = [
  "mi-wlan", "mi-app", "mi-smartphone", "mi-nachricht", "mi-anhang", "mi-betreff",
  "mi-link", "mi-webseite", "mi-passwort", "mi-benutzerkonto", "mi-profil",
  "mi-beitrag", "mi-kommentar", "mi-datei", "mi-ordner", "mi-soziale-medien",
  "mi-herunterladen", "mi-hochladen", "mi-speichern", "mi-loeschen", "mi-teilen",
  "mi-anmelden", "mi-abmelden", "mi-klicken", "mi-googeln", "mi-surfen",
  "mi-abstuerzen", "mi-funktionieren",
];

// chip = the separable prefix / reflexive pronoun / participle to highlight.
const DIG_VERBS = [
  { key: "herunterladen", label: "herunterladen — to download", sentence: "Lädst du die neue App gerade herunter?", chip: "herunter", note: "separable: lädt … herunter; Perfekt heruntergeladen; also \"downloaden\"" },
  { key: "hochladen", label: "hochladen — to upload", sentence: "Ich habe die Fotos schon hochgeladen.", chip: "hochgeladen", note: "separable; the opposite of herunterladen" },
  { key: "speichern", label: "speichern — to save", sentence: "Speicher das Dokument, bevor der Computer abstürzt!", chip: "Speicher", note: "regular; \"unter … speichern\" = save as. Opposite: löschen" },
  { key: "loeschen", label: "löschen — to delete", sentence: "Ich habe die alte E-Mail gelöscht.", chip: "gelöscht", note: "regular; a file, a message, an app, a whole account" },
  { key: "teilen", label: "teilen — to share", sentence: "Sie hat den Artikel in den sozialen Medien geteilt.", chip: "geteilt", note: "\"einen Beitrag teilen\" — also \"to divide\" (den Kuchen teilen)" },
  { key: "anmelden", label: "sich anmelden — to log in / sign up", sentence: "Du musst dich zuerst mit deinem Passwort anmelden.", chip: "dich", note: "reflexive AND separable: sich … anmelden. Log out = sich abmelden" },
  { key: "abstuerzen", label: "abstürzen — to crash", sentence: "Die App ist schon wieder abgestürzt.", chip: "abgestürzt", note: "separable; a sudden change of state → Perfekt with sein (Unit 7)" },
  { key: "googeln", label: "googeln — to google", sentence: "Ich google kurz, wie das Wort geschrieben wird.", chip: "google", note: "informal but a real dictionary word; = look it up online" },
];

const NET_OPTIONS = [
  { key: "medien", label: "I'm always on social media", response: "Ich bin ständig in den sozialen Medien unterwegs." },
  { key: "wlan", label: "The wifi isn't working", response: "Das WLAN funktioniert gerade nicht, ich muss den Router neu starten." },
  { key: "datei", label: "Send me the file as an attachment", response: "Kannst du mir die Datei als Anhang schicken?" },
  { key: "passwort", label: "I forgot my password", response: "Ich habe mein Passwort vergessen und muss es zurücksetzen." },
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

function initDigPicker() {
  initPicker({
    buttonsId: "dig-picker-buttons",
    resultId: "dig-picker-result",
    options: DIG_VERBS,
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

function initNetPicker() {
  initPicker({
    buttonsId: "net-picker-buttons",
    resultId: "net-picker-result",
    options: NET_OPTIONS,
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

  initDigPicker();
  initNetPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Laden Sie die App herunter und öffnen Sie sie.", "Download the app and open it."));
  discoverList.appendChild(sentenceCard("Erstellen Sie ein Konto und melden Sie sich mit Ihrem Passwort an.", "Create an account and log in with your password."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Seite lädt bei mir nicht — könnten Sie das bitte prüfen?", "The page won't load for me — could you check it, please?"));
  applyList.appendChild(sentenceCard("Ich habe dir den Link per Nachricht geschickt, klick einfach drauf.", "I sent you the link by message, just click on it."));
  applyList.appendChild(sentenceCard("Vor dem Update lief alles, seit dem Update stürzt die App ständig ab.", "Before the update everything worked; since the update the app keeps crashing."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-media-internet.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MEDIA_IDS.map(byId).filter(Boolean), document.getElementById("grid-media"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-media").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-media-internet-quiz.json");

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
