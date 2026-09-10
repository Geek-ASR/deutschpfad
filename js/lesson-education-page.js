/**
 * Page script for lessons/a2-education.html — A2 Unit 25 (Phase 2
 * topic unit, 28 words). The picker is a German-university glossary
 * (like the housing ad-decoder); the apply picker gives study
 * sentences. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-25-education";

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

const ED_IDS = [
  "ed-uni", "ed-fachhochschule", "ed-studiengang", "ed-studienfach", "ed-semester",
  "ed-vorlesung", "ed-seminar", "ed-stundenplan", "ed-note", "ed-zeugnis",
  "ed-klausur", "ed-hausarbeit", "ed-referat", "ed-bibliothek", "ed-mensa",
  "ed-abschluss", "ed-bachelor", "ed-abitur", "ed-stipendium", "ed-dozent",
  "ed-studieren", "ed-bestehen", "ed-durchfallen", "ed-einschreiben",
  "ed-wiederholen", "ed-abgeben", "ed-belegen", "ed-vorbereiten",
];

const UNI_TERMS = [
  { key: "classes", term: "Vorlesung / Seminar / Übung", means: "Vorlesung: the professor speaks, hundreds listen. Seminar: small group, you discuss and give Referate. Übung: you practise / work through the material.", sentence: "Mo 8–10 Vorlesung, Di 14–16 Seminar, Fr 12–13 Übung." },
  { key: "assessment", term: "Klausur / Hausarbeit / Referat", means: "Klausur: a written exam in a hall. Hausarbeit: a long text written at home over weeks. Referat: an oral presentation in a seminar.", sentence: "Leistungsnachweis: Klausur (60%) + Referat (40%)." },
  { key: "note", term: "Note", means: "At uni: 1,0 is the best, 4,0 just passes, 5,0 is a fail. At school: 1 (best) to 6 (worst) — a different scale.", sentence: "Endnote: 2,3 (\"gut\")." },
  { key: "abschluss", term: "Bachelor / Master", means: "Bachelor ≈ 6 semesters, the first degree. Master ≈ 4 semesters on top of it. Together they replaced the old \"Diplom\".", sentence: "B.Sc. Informatik, 6 Semester, 180 ECTS." },
  { key: "abitur", term: "Abitur", means: "The school-leaving exam after ~12–13 years. You normally need it (or an equivalent) to be admitted to a German university.", sentence: "Zulassungsvoraussetzung: Abitur oder gleichwertiger Abschluss." },
  { key: "semester", term: "Semester", means: "Wintersemester runs Oct–Mar, Sommersemester Apr–Sept. The teaching-free gap is the \"vorlesungsfreie Zeit\" (Semesterferien).", sentence: "Bewerbungsfrist fürs Wintersemester: 15. Juli." },
  { key: "einschreibung", term: "Immatrikulation / Einschreibung", means: "You \"sich einschreiben\" for a Studiengang and get the Studierendenausweis, which also works as a transport ticket in many cities.", sentence: "Nach der Zusage: online immatrikulieren, Semesterbeitrag zahlen." },
  { key: "orte", term: "Mensa / Bibliothek (\"Bib\")", means: "Mensa: cheap hot meals for students. Bibliothek: where you study and borrow books — open late during the exam period.", sentence: "Mensa: Tagesgericht 2,90 €. Bib: 8–24 Uhr in der Prüfungszeit." },
];

const STUDY_OPTIONS = [
  { key: "fach", label: "I'm studying computer science, 3rd semester", response: "Ich studiere Informatik im dritten Semester an der Uni." },
  { key: "klausur", label: "I have an exam next week", response: "Nächste Woche habe ich eine Klausur — ich muss noch viel lernen." },
  { key: "bestanden", label: "I passed!", response: "Ich habe die Prüfung mit 2,0 bestanden!" },
  { key: "abgeben", label: "I have to hand in an essay", response: "Bis Freitag muss ich eine Hausarbeit abgeben." },
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

function initUniPicker() {
  initPicker({
    buttonsId: "uni-picker-buttons",
    resultId: "uni-picker-result",
    options: UNI_TERMS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.term;
      el.appendChild(heading);

      const means = document.createElement("p");
      means.style.width = "100%";
      means.style.margin = "0";
      means.style.fontSize = "var(--text-md)";
      means.textContent = option.means;
      el.appendChild(means);

      const sample = document.createElement("p");
      sample.className = "picker-result-meta";
      sample.lang = "de";
      sample.style.width = "100%";
      sample.style.marginTop = "var(--space-2)";
      sample.textContent = `In a course listing: "${option.sentence}"`;
      el.appendChild(sample);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initStudyPicker() {
  initPicker({
    buttonsId: "study-picker-buttons",
    resultId: "study-picker-result",
    options: STUDY_OPTIONS,
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

  initUniPicker();
  initStudyPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Seminar \"Einführung in die Linguistik\", Mi 10–12, Raum 4.201, Dozentin: Dr. Weber.", "Seminar \"Introduction to Linguistics\", Wed 10–12, Room 4.201, Instructor: Dr Weber."));
  discoverList.appendChild(sentenceCard("Leistung: Referat (20 Min.) + Hausarbeit (12 Seiten). Anmeldung über das Portal.", "Assessment: presentation (20 min) + term paper (12 pages). Sign up via the portal."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Im ersten Semester bin ich in Statistik durchgefallen und musste die Klausur wiederholen.", "In my first semester I failed statistics and had to resit the exam."));
  applyList.appendChild(sentenceCard("Ich bereite mich gerade auf drei Prüfungen vor und lebe fast in der Bib.", "I'm preparing for three exams and practically live in the library."));
  applyList.appendChild(sentenceCard("Nach dem Bachelor möchte ich mich für einen Master in Deutschland einschreiben.", "After my bachelor's I want to enrol on a master's in Germany."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-education.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(ED_IDS.map(byId).filter(Boolean), document.getElementById("grid-education"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-education").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-education-quiz.json");

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
