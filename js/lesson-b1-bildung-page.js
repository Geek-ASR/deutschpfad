/**
 * Page script for lessons/b1-bildung.html — B1 Unit 13 (topic unit).
 * The "stage" picker walks the steps of getting a foreign qualification
 * recognised; the "system" picker explains a piece of the German
 * education system. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-13-bildung";

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

const BI_IDS = [
  "bi-anerkennung", "bi-anerkennen", "bi-zeugnisbewertung", "bi-gleichwertigkeit",
  "bi-auslaendischer-abschluss", "bi-zustaendige-stelle", "bi-nachqualifizierung",
  "bi-defizitbescheid", "bi-schulsystem", "bi-grundschule", "bi-weiterfuehrende-schule",
  "bi-gymnasium", "bi-berufsschule", "bi-duale-ausbildung", "bi-fernstudium",
  "bi-volkshochschule", "bi-immatrikulation", "bi-exmatrikulation",
  "bi-regelstudienzeit", "bi-leistungspunkte", "bi-pruefungsordnung", "bi-thesis",
  "bi-numerus-clausus", "bi-zulassungsbeschraenkung", "bi-sprachnachweis",
  "bi-anerkennungsberatung", "bi-nostrifizierung", "bi-anerkennungsgesetz",
];

const STAGES = [
  { key: "stelle", moment: "1 · Find the right office", line: "Zuerst finde ich heraus, welche Stelle für meinen Beruf zuständig ist — das Portal \"Anerkennung in Deutschland\" hilft dabei.", note: "different professions go through different offices — there's no single universal one." },
  { key: "unterlagen", moment: "2 · Submit the documents", line: "Ich reiche meine Zeugnisse, eine beglaubigte Übersetzung und den Antrag auf Zeugnisbewertung ein.", note: "documents usually need a certified translation, not just any translation." },
  { key: "pruefung", moment: "3 · The equivalence is checked", line: "Die zuständige Stelle prüft die Gleichwertigkeit meines ausländischen Abschlusses mit einem deutschen.", note: "this can take weeks to months, depending on the profession and country." },
  { key: "defizit", moment: "4 · If something's missing", line: "Im Defizitbescheid steht, dass mir zwei Praxismodule fehlen — dafür mache ich jetzt eine Nachqualifizierung.", note: "a partial match isn't a rejection — it names exactly what still needs doing." },
  { key: "anerkannt", moment: "5 · Full recognition", line: "Nach der Nachqualifizierung wurde mein Abschluss vollständig anerkannt.", note: "the end goal: your qualification now counts the same as a German one for that purpose." },
];

const SYSTEM = [
  { key: "schule", label: "School tracks", response: "Nach der Grundschule gehen Kinder auf eine Hauptschule, eine Realschule oder ein Gymnasium — je nach Empfehlung und Leistung." },
  { key: "ausbildung", label: "Dual vocational training", response: "Bei einer dualen Ausbildung arbeitet man einige Tage in der Woche im Betrieb und geht an den anderen Tagen in die Berufsschule." },
  { key: "weiterbildung", label: "Studying alongside work", response: "Wer neben dem Job lernen möchte, kann ein Fernstudium machen oder Kurse an der Volkshochschule belegen." },
  { key: "zulassung", label: "Limited university places", response: "Für stark nachgefragte Fächer wie Medizin gibt es einen Numerus clausus — man braucht einen sehr guten Notendurchschnitt." },
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

function initStagePicker() {
  initPicker({
    buttonsId: "stage-picker-buttons",
    resultId: "stage-picker-result",
    options: STAGES,
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

function initSystemPicker() {
  initPicker({
    buttonsId: "system-picker-buttons",
    resultId: "system-picker-result",
    options: SYSTEM,
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

  initStagePicker();
  initSystemPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ihr Abschluss wurde als gleichwertig anerkannt.", "Your qualification has been recognised as equivalent."));
  discoverList.appendChild(sentenceCard("Laut Defizitbescheid fehlen noch zwei Praktika.", "According to the deficiency notice, two internships are still missing."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Für die Anerkennung meines Abschlusses brauche ich eine beglaubigte Übersetzung.", "For the recognition of my qualification I need a certified translation."));
  applyList.appendChild(sentenceCard("Die Anerkennungsberatung hat mir erklärt, welche Stelle zuständig ist.", "The recognition counselling service explained to me which office is responsible."));
  applyList.appendChild(sentenceCard("Nach der Immatrikulation bekam ich sofort einen Studierendenausweis.", "After enrolling I immediately got a student ID."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-bildung.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(BI_IDS.map(byId).filter(Boolean), document.getElementById("grid-bi"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-bi").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-bildung-quiz.json");

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
