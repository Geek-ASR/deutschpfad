/**
 * Timed exam-section runner — the mock exam's equivalent of
 * js/quiz-engine.js's runQuiz, built for a different job. A lesson
 * quiz's whole point is instant feedback (see something wrong, learn
 * the right answer, move on); a mock exam's whole point is the
 * opposite — no feedback until the section is over, plus a visible
 * countdown, because that's what actually simulates exam conditions
 * and builds pacing under pressure.
 *
 * Reuses js/quiz-engine.js's renderQuestion/evaluate/correctAnswerLabel
 * for the actual question rendering and scoring, so every question
 * type it supports (multiple-choice, typing, fill-blank, the two
 * listening types) works here with zero duplicated rendering code —
 * this module only owns the timer, the no-feedback flow, and the
 * post-exam review screen.
 *
 * The timer is advisory, not punitive: hitting zero shows "Time's up"
 * and stops counting, but never force-submits or locks the learner
 * out — losing an in-progress attempt to a hard cutoff would be a bad
 * trade for a practice tool with no real stakes.
 */

import { renderQuestion, evaluate, correctAnswerLabel } from "./quiz-engine.js";

function formatTime(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function responseLabel(question, response) {
  if (!response) return "(no answer)";
  if (Array.isArray(question.choices)) {
    return question.choices[response.choiceIndex] ?? "(no answer)";
  }
  return response.text || "(no answer)";
}

/**
 * @param {object} opts
 * @param {HTMLElement} opts.container
 * @param {object} opts.section {id, label, labelEn, instructions, timeLimitSeconds, questions}
 * @param {(result: {sectionId:string, correct:number, total:number, responses:object[]}) => void} opts.onSectionFinish
 */
export function runTimedSection({ container, section, onSectionFinish }) {
  let index = 0;
  let correctCount = 0;
  const responses = [];
  let remaining = section.timeLimitSeconds;
  let timerId = null;

  const shell = document.createElement("div");
  shell.className = "exam-shell";

  const header = document.createElement("div");
  header.className = "exam-section-header";
  const titleEl = document.createElement("h2");
  titleEl.textContent = `${section.label} — ${section.labelEn}`;
  const timerEl = document.createElement("p");
  timerEl.className = "exam-timer";
  header.appendChild(titleEl);
  header.appendChild(timerEl);

  const instructionsEl = document.createElement("p");
  instructionsEl.className = "exam-instructions";
  instructionsEl.textContent = section.instructions;

  const progress = document.createElement("p");
  progress.className = "exam-progress";

  const partLabelEl = document.createElement("p");
  partLabelEl.className = "exam-part-label";

  const passageEl = document.createElement("div");
  passageEl.className = "exam-passage";

  const questionMount = document.createElement("div");
  questionMount.className = "exam-question";

  const nextWrap = document.createElement("div");
  nextWrap.className = "exam-next-wrap";

  shell.appendChild(header);
  shell.appendChild(instructionsEl);
  shell.appendChild(progress);
  shell.appendChild(partLabelEl);
  shell.appendChild(passageEl);
  shell.appendChild(questionMount);
  shell.appendChild(nextWrap);
  container.innerHTML = "";
  container.appendChild(shell);

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      timerEl.textContent = "Time's up";
      timerEl.classList.remove("is-urgent");
      timerEl.classList.add("is-over");
      clearInterval(timerId);
      return;
    }
    timerEl.textContent = formatTime(remaining);
    timerEl.classList.toggle("is-urgent", remaining <= 60);
  }

  function startTimer() {
    timerEl.textContent = formatTime(remaining);
    timerId = window.setInterval(tick, 1000);
  }

  function showQuestion() {
    nextWrap.innerHTML = "";
    progress.textContent = `Question ${index + 1} of ${section.questions.length}`;

    const q = section.questions[index];
    partLabelEl.textContent = q.partLabel || "";
    partLabelEl.hidden = !q.partLabel;

    if (q.passage && q.passage.de) {
      passageEl.innerHTML = "";
      const p = document.createElement("p");
      p.lang = "de";
      p.textContent = q.passage.de;
      passageEl.appendChild(p);
      passageEl.hidden = false;
    } else {
      passageEl.hidden = true;
    }

    renderQuestion(q, questionMount, (response) => {
      const isCorrect = evaluate(q, response);
      if (isCorrect) correctCount += 1;
      responses.push({ id: q.id, correct: isCorrect, question: q, response });

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "btn btn-primary btn-sm";
      nextBtn.textContent = index === section.questions.length - 1 ? "Finish section" : "Next";
      nextBtn.addEventListener("click", () => {
        index += 1;
        if (index < section.questions.length) {
          showQuestion();
        } else {
          finishSection();
        }
      });
      nextWrap.appendChild(nextBtn);
      nextBtn.focus();
    });
  }

  function finishSection() {
    clearInterval(timerId);
    onSectionFinish({ sectionId: section.id, correct: correctCount, total: section.questions.length, responses });
  }

  startTimer();
  showQuestion();
}

/**
 * Full question-by-question review, grouped by section — shown once
 * after every timed section is done, the way a real exam only tells
 * you what you got right after the whole sitting, not mid-section.
 * @param {HTMLElement} container
 * @param {{ label:string, labelEn:string, correct:number, total:number, responses:object[] }[]} sectionResults
 */
export function renderExamReview(container, sectionResults) {
  container.innerHTML = "";
  sectionResults.forEach((result) => {
    const h3 = document.createElement("h3");
    h3.textContent = `${result.label} — ${result.correct} / ${result.total}`;
    container.appendChild(h3);

    const list = document.createElement("ul");
    list.className = "exam-review-list";
    result.responses.forEach((r) => {
      const li = document.createElement("li");
      li.className = `exam-review-item ${r.correct ? "is-correct" : "is-incorrect"}`;

      const prompt = document.createElement("p");
      prompt.className = "exam-review-prompt";
      prompt.textContent = r.question.prompt;
      li.appendChild(prompt);

      const yourAnswer = document.createElement("p");
      yourAnswer.className = "exam-review-your-answer";
      yourAnswer.textContent = `Your answer: ${responseLabel(r.question, r.response)}`;
      li.appendChild(yourAnswer);

      if (!r.correct) {
        const correctP = document.createElement("p");
        correctP.className = "exam-review-correct-answer";
        correctP.textContent = `Correct answer: ${correctAnswerLabel(r.question)}`;
        li.appendChild(correctP);
      }

      list.appendChild(li);
    });
    container.appendChild(list);
  });
}
