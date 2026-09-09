import { renderScenario } from "./scenario.js";
import { runQuiz } from "./quiz-engine.js";
import { markScenarioVisited, recordScenarioResult } from "./progress-store.js";

const SCENARIO_ID = "bahnhof";

async function main() {
  markScenarioVisited(SCENARIO_ID);

  let scenario;
  try {
    const res = await fetch("../data/scenarios/bahnhof.json");
    if (!res.ok) throw new Error(String(res.status));
    scenario = await res.json();
  } catch (err) {
    console.error(err);
    document.getElementById("scenario-mount").innerHTML =
      '<p class="quiz-empty">Couldn\'t load the scenario. If you opened this file directly, run it from a local server instead (see the README).</p>';
    return;
  }

  renderScenario({
    container: document.getElementById("scenario-mount"),
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
