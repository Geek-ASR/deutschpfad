/**
 * Reusable quiz/practice runner. Topic-agnostic — it knows nothing about
 * numbers, grammar, or any specific lesson; it only knows how to render
 * a question, evaluate an answer, and report a result.
 *
 * Supported question types today: "multiple-choice", "typing",
 * "fill-blank". The shape below is deliberately simple to add to —
 * a new type needs a case in `renderQuestion` and one in `evaluate`.
 *
 * This engine never touches localStorage itself — it just reports what
 * happened. `onFinish` receives
 *   { correct, total, mode, responses: [{ id, correct, question }] }
 * so a caller (a lesson page, wired to js/progress-store.js) can persist
 * whatever it needs — per-question detail included — without this module
 * knowing local progress tracking exists.
 *
 * Usage:
 *   import { runQuiz } from "./quiz-engine.js";
 *   runQuiz({
 *     container: document.getElementById("quiz-mount"),
 *     questions: [...],
 *     mode: "quiz",   // "quiz" (scored, final summary) or "practice" (low-stakes)
 *     onFinish: (result) => { ... },
 *   });
 */

import { answerMatches } from "./text-match.js";

function evaluate(question, response) {
  if (question.type === "multiple-choice") {
    return response.choiceIndex === question.correctIndex;
  }
  if (question.type === "typing" || question.type === "fill-blank") {
    return answerMatches(response.text || "", question.acceptedAnswers || []);
  }
  return false;
}

function correctAnswerLabel(question) {
  if (question.type === "multiple-choice") {
    return question.choices[question.correctIndex];
  }
  return (question.acceptedAnswers && question.acceptedAnswers[0]) || "";
}

function renderMultipleChoice(question, onAnswered) {
  const wrap = document.createElement("div");
  wrap.className = "quiz-choices";
  wrap.setAttribute("role", "group");
  wrap.setAttribute("aria-label", "Answer choices");

  question.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-choice";
    btn.textContent = choice;
    btn.addEventListener("click", () => {
      Array.from(wrap.children).forEach((c) => (c.disabled = true));
      onAnswered({ choiceIndex: index }, btn);
    });
    wrap.appendChild(btn);
  });

  return wrap;
}

function renderTextInput(question, onAnswered, { inline } = {}) {
  const form = document.createElement("form");
  form.className = inline ? "quiz-fill-blank-form" : "quiz-typing-form";
  form.noValidate = true;

  const input = document.createElement("input");
  input.type = "text";
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.className = "quiz-text-input";
  input.setAttribute("aria-label", inline ? "Your answer" : question.prompt);

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "btn btn-primary btn-sm";
  submit.textContent = "Check";

  form.appendChild(input);
  form.appendChild(submit);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim()) {
      input.focus();
      return;
    }
    input.disabled = true;
    submit.disabled = true;
    onAnswered({ text: input.value }, form);
  });

  requestAnimationFrame(() => input.focus());

  return form;
}

function renderFillBlank(question, onAnswered) {
  const wrap = document.createElement("div");
  wrap.className = "quiz-fill-blank";

  const parts = question.sentence.split("___");
  const sentenceEl = document.createElement("p");
  sentenceEl.className = "quiz-sentence";
  sentenceEl.lang = "de";
  sentenceEl.appendChild(document.createTextNode(parts[0] || ""));

  const inputForm = renderTextInput(question, onAnswered, { inline: true });
  const input = inputForm.querySelector("input");
  input.classList.add("quiz-blank-input");

  sentenceEl.appendChild(inputForm);
  sentenceEl.appendChild(document.createTextNode(parts[1] || ""));

  wrap.appendChild(sentenceEl);
  return wrap;
}

function renderQuestion(question, container, onAnswered) {
  container.innerHTML = "";

  const prompt = document.createElement("p");
  prompt.className = "quiz-prompt";
  if (question.type !== "fill-blank") {
    prompt.textContent = question.prompt;
    container.appendChild(prompt);
  } else if (question.prompt) {
    prompt.className = "quiz-prompt quiz-prompt-sr";
    prompt.textContent = question.prompt;
    container.appendChild(prompt);
  }

  if (question.type === "multiple-choice") {
    container.appendChild(renderMultipleChoice(question, onAnswered));
  } else if (question.type === "typing") {
    container.appendChild(renderTextInput(question, onAnswered));
  } else if (question.type === "fill-blank") {
    container.appendChild(renderFillBlank(question, onAnswered));
  }
}

/**
 * @param {object} opts
 * @param {HTMLElement} opts.container
 * @param {object[]} opts.questions
 * @param {"quiz"|"practice"} [opts.mode]
 * @param {(result: {correct:number, total:number, mode:string}) => void} [opts.onFinish]
 */
export function runQuiz({ container, questions, mode = "quiz", onFinish }) {
  if (!questions || questions.length === 0) {
    container.innerHTML = '<p class="quiz-empty">No questions available.</p>';
    return;
  }

  let index = 0;
  let correctCount = 0;
  let responses = [];

  const shell = document.createElement("div");
  shell.className = "quiz-shell";

  const progress = document.createElement("p");
  progress.className = "quiz-progress";

  const questionMount = document.createElement("div");
  questionMount.className = "quiz-question";

  const feedback = document.createElement("div");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");

  const nextWrap = document.createElement("div");
  nextWrap.className = "quiz-next-wrap";

  shell.appendChild(progress);
  shell.appendChild(questionMount);
  shell.appendChild(feedback);
  shell.appendChild(nextWrap);
  container.innerHTML = "";
  container.appendChild(shell);

  function showQuestion() {
    feedback.innerHTML = "";
    feedback.className = "quiz-feedback";
    nextWrap.innerHTML = "";
    progress.textContent = `${mode === "quiz" ? "Question" : "Item"} ${index + 1} of ${questions.length}`;

    const q = questions[index];
    renderQuestion(q, questionMount, (response, answeredEl) => {
      const isCorrect = evaluate(q, response);
      if (isCorrect) correctCount += 1;
      responses.push({ id: q.id, correct: isCorrect, question: q });

      feedback.classList.add(isCorrect ? "is-correct" : "is-incorrect");
      if (isCorrect) {
        feedback.textContent = "Correct.";
      } else {
        feedback.textContent = `Not quite — the answer is "${correctAnswerLabel(q)}".`;
      }

      if (answeredEl && answeredEl.classList && answeredEl.classList.contains("quiz-choice")) {
        answeredEl.classList.add(isCorrect ? "is-correct" : "is-incorrect");
      }

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "btn btn-primary btn-sm";
      nextBtn.textContent = index === questions.length - 1 ? "See results" : "Next";
      nextBtn.addEventListener("click", () => {
        index += 1;
        if (index < questions.length) {
          showQuestion();
        } else {
          showSummary();
        }
      });
      nextWrap.appendChild(nextBtn);
      nextBtn.focus();
    });
  }

  function showSummary() {
    const result = { correct: correctCount, total: questions.length, mode, responses };
    shell.innerHTML = "";

    const heading = document.createElement("p");
    heading.className = "quiz-summary-score";
    heading.textContent =
      mode === "quiz"
        ? `You got ${correctCount} of ${questions.length} correct.`
        : `Nice work — ${correctCount} of ${questions.length} correct.`;
    shell.appendChild(heading);

    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "btn btn-secondary btn-sm";
    retryBtn.textContent = "Try again";
    retryBtn.addEventListener("click", () => {
      index = 0;
      correctCount = 0;
      responses = [];
      shell.appendChild(progress);
      shell.appendChild(questionMount);
      shell.appendChild(feedback);
      shell.appendChild(nextWrap);
      showQuestion();
    });
    shell.appendChild(retryBtn);

    if (onFinish) onFinish(result);
  }

  showQuestion();
}
