import { renderTimeline } from "./timeline.js";

async function main() {
  const mount = document.getElementById("timeline-mount");
  try {
    const res = await fetch("data/history/timeline.json");
    if (!res.ok) throw new Error(String(res.status));
    const events = await res.json();
    renderTimeline(events, mount);
  } catch (err) {
    console.error(err);
    mount.innerHTML =
      '<p class="quiz-empty">Couldn\'t load the timeline. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }
}

document.addEventListener("DOMContentLoaded", main);
