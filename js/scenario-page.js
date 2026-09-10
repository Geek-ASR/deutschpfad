/**
 * Page script shared by every scenario page (scenarios/*.html). Thin
 * glue: fetch this scenario's data, hand it to the generic scenario
 * engine, then reveal and mount the comprehension quiz on completion.
 *
 * Which scenario to load comes from the #scenario-mount element:
 *   data-scenario-id   — stable id used for progress tracking
 *   data-scenario-src  — path to the scenario JSON, relative to the page
 * Older pages that omit these fall back to the first A1 scenario.
 */

import { renderScenario } from "./scenario.js";
import { runQuiz } from "./quiz-engine.js";
import { markScenarioVisited, recordScenarioResult } from "./progress-store.js";

const mount = document.getElementById("scenario-mount");
const SCENARIO_ID = mount?.dataset.scenarioId || "bahnhof";
const SCENARIO_SRC = mount?.dataset.scenarioSrc || "../data/scenarios/bahnhof.json";

async function main() {
  markScenarioVisited(SCENARIO_ID);

  let scenario;
  try {
    const res = await fetch(SCENARIO_SRC);
    if (!res.ok) throw new Error(String(res.status));
    scenario = await res.json();
  } catch (err) {
    console.error(err);
    mount.innerHTML =
      '<p class="quiz-empty">Couldn\'t load the scenario. If you opened this file directly, run it from a local server instead (see the README).</p>';
    return;
  }

  renderScenario({
    container: mount,
    scenario,
    onComplete: () => {
      const section = document.getElementById("comprehension-section");
      section.hidden = false;
      section.scrollIntoView({ behavior: "smooth", block: "start" });

      runQuiz({
        container: document.getElementById("quiz-mount"),
        questions: scenario.comprehension,
        mode: "quiz",
        onFinish: (result) => {
          recordScenarioResult(SCENARIO_ID, result);
          const after = document.getElementById("quiz-after");
          after.innerHTML = "";
          const p = document.createElement("p");
          p.className = "status-note";
          p.innerHTML = `Saved to your <a href="../dashboard.html">local dashboard</a>.`;
          after.appendChild(p);
        },
      });
    },
  });
}

document.addEventListener("DOMContentLoaded", main);
