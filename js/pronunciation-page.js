import { renderPronunciationSounds } from "./pronunciation.js";

async function main() {
  const mount = document.getElementById("sound-mount");
  try {
    const res = await fetch("data/pronunciation/sounds.json");
    if (!res.ok) throw new Error(String(res.status));
    const sounds = await res.json();
    renderPronunciationSounds(sounds, mount);
  } catch (err) {
    console.error(err);
    mount.innerHTML =
      '<p class="quiz-empty">Couldn\'t load pronunciation data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }
}

document.addEventListener("DOMContentLoaded", main);
