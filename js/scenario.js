/**
 * Renders a branching dialogue scenario as a growing chat transcript:
 * an NPC line, then choice buttons. Picking the marked-`best` choice
 * advances to its `next` step; any other choice shows brief feedback
 * inline and re-offers the same choices — there's no dead end and no
 * scored failure, just "try a different phrase." Generic over any
 * scenario with this shape (see docs/content-model.md) — not specific
 * to the train-station scenario.
 */

import { createSpeakButton } from "./speak.js";

/**
 * @param {object} opts
 * @param {HTMLElement} opts.container
 * @param {object} opts.scenario parsed scenario JSON
 * @param {() => void} [opts.onComplete] called once, when the learner reaches "end"
 */
export function renderScenario({ container, scenario, onComplete }) {
  container.innerHTML = "";

  const transcript = document.createElement("div");
  transcript.className = "scenario-transcript";
  transcript.setAttribute("aria-live", "polite");

  const choicesMount = document.createElement("div");
  choicesMount.className = "scenario-choices";

  container.append(transcript, choicesMount);

  const findStep = (id) => scenario.steps.find((s) => s.id === id);

  function addBubble(kind, textDe, textEn) {
    const bubble = document.createElement("div");
    bubble.className = `scenario-bubble scenario-bubble-${kind}`;
    const de = document.createElement("p");
    de.lang = "de";
    de.className = "scenario-bubble-de";
    de.textContent = textDe;
    bubble.appendChild(de);
    if (textEn) {
      const en = document.createElement("p");
      en.className = "scenario-bubble-en";
      en.textContent = textEn;
      bubble.appendChild(en);
    }
    if (kind === "npc") {
      const speakBtn = createSpeakButton(textDe, "Listen");
      if (speakBtn) bubble.appendChild(speakBtn);
    }
    transcript.appendChild(bubble);
    bubble.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return bubble;
  }

  function renderChoices(step) {
    choicesMount.innerHTML = "";
    const feedback = document.createElement("p");
    feedback.className = "scenario-feedback";
    feedback.setAttribute("aria-live", "polite");
    choicesMount.appendChild(feedback);

    const list = document.createElement("div");
    list.className = "scenario-choice-list";
    step.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "scenario-choice";
      btn.lang = "de";
      btn.textContent = choice.de;
      btn.addEventListener("click", () => handleChoice(step, choice, btn));
      list.appendChild(btn);
    });
    choicesMount.appendChild(list);
  }

  function handleChoice(step, choice, btn) {
    if (choice.best) {
      addBubble("learner", choice.de, choice.en);
      goToStep(choice.next);
      return;
    }

    // Not the best choice: show it was tried, give feedback, let them
    // pick again from the same step — no dead end, no scored failure.
    btn.disabled = true;
    const feedback = choicesMount.querySelector(".scenario-feedback");
    feedback.textContent = choice.feedback || "Let's try a different response.";
    feedback.classList.add("is-visible");
    window.setTimeout(() => {
      feedback.classList.remove("is-visible");
      renderChoices(step);
    }, 2200);
  }

  function goToStep(stepId) {
    if (stepId === "end") {
      choicesMount.innerHTML = "";
      const done = document.createElement("div");
      done.className = "scenario-complete";
      done.innerHTML = `<p><strong>Goal reached.</strong> You completed the conversation.</p>`;
      choicesMount.appendChild(done);
      if (onComplete) onComplete();
      return;
    }
    const step = findStep(stepId);
    addBubble("npc", step.npc, step.npcEn);
    renderChoices(step);
  }

  goToStep(scenario.startStep);
}
