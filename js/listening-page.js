import { runQuiz } from "./quiz-engine.js";
import { markListeningVisited, recordListeningResult } from "./progress-store.js";

const SET_ID = "listening-practice-1";

async function main() {
  markListeningVisited(SET_ID);

  let data;
  try {
    const res = await fetch("data/listening/practice-1.json");
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch (err) {
    console.error(err);
    document.getElementById("quiz-mount").innerHTML =
      '<p class="quiz-empty">Couldn\'t load listening practice. If you opened this file directly, run it from a local server instead (see the README).</p>';
    return;
  }

  runQuiz({
    container: document.getElementById("quiz-mount"),
    questions: data.questions,
    mode: "quiz",
    onFinish: (result) => {
      recordListeningResult(SET_ID, result);
      const after = document.getElementById("quiz-after");
      after.innerHTML = "";
      const p = document.createElement("p");
      p.className = "status-note";
      p.innerHTML = `Saved to your <a href="dashboard.html">local dashboard</a>.`;
      after.appendChild(p);
    },
  });
}

document.addEventListener("DOMContentLoaded", main);
