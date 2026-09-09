/**
 * A generic "pick a button, reveal a result" widget. First built inline
 * inside js/lesson-greetings-page.js for its three pickers (time of day,
 * formality, how-are-you); extracted here once a third lesson
 * (Introductions' verb picker) needed the exact same shape — see
 * docs/lesson-engine.md's note on genericity for the reasoning.
 *
 * Renders a row of buttons into `buttonsId`; clicking one marks it
 * active and calls `renderResult(option, resultEl)` to fill `resultId`.
 * Knows nothing about what a "result" looks like — that's entirely the
 * caller's `renderResult` function, so this stays reusable across
 * completely different content (a greeting, a pronoun, a verb form).
 */

/**
 * @param {object} opts
 * @param {string} opts.buttonsId
 * @param {string} opts.resultId
 * @param {object[]} opts.options — each needs at least {key, label}
 * @param {(option: object, resultEl: HTMLElement) => void} opts.renderResult
 * @param {number} [opts.defaultIndex]
 */
export function initPicker({ buttonsId, resultId, options, renderResult, defaultIndex = 0 }) {
  const buttonsEl = document.getElementById(buttonsId);
  const resultEl = document.getElementById(resultId);
  const buttons = [];

  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-btn";
    btn.textContent = option.label;
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderResult(option, resultEl);
    });
    buttonsEl.appendChild(btn);
    buttons.push(btn);
  });

  if (buttons.length) buttons[defaultIndex].click();
}
