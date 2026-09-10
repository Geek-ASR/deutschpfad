/**
 * Page script shared by every story page (stories/*.html). Thin glue:
 * fetch this story's data, hand it to the generic story-reader engine,
 * and mount its comprehension quiz.
 *
 * Which story to load comes from the #story-text element:
 *   data-story-id   — stable id used for progress tracking
 *   data-story-src  — path to the story JSON, relative to the page
 * Older pages that omit these fall back to the first A1 story.
 */

import { renderStoryReader } from "./story-reader.js";
import { runQuiz } from "./quiz-engine.js";
import { markStoryVisited, recordStoryQuizResult } from "./progress-store.js";

const mount = document.getElementById("story-text");
const STORY_ID = mount?.dataset.storyId || "a1-der-erste-tag";
const STORY_SRC = mount?.dataset.storySrc || "../data/stories/a1-der-erste-tag.json";

async function main() {
  markStoryVisited(STORY_ID);

  let story;
  try {
    const res = await fetch(STORY_SRC);
    if (!res.ok) throw new Error(`${res.status}`);
    story = await res.json();
  } catch (err) {
    console.error(err);
    mount.innerHTML =
      '<p class="quiz-empty">Couldn\'t load the story. If you opened this file directly, run it from a local server instead (see the README).</p>';
    return;
  }

  renderStoryReader({
    container: mount,
    paragraphs: story.paragraphs,
    glossary: story.glossary,
    storyId: STORY_ID,
  });

  runQuiz({
    container: document.getElementById("quiz-mount"),
    questions: story.comprehension,
    mode: "quiz",
    onFinish: (result) => {
      recordStoryQuizResult(STORY_ID, result);
      const after = document.getElementById("quiz-after");
      after.innerHTML = "";
      const p = document.createElement("p");
      p.className = "status-note";
      p.innerHTML = `Saved to your <a href="../dashboard.html">local dashboard</a>. Missed questions schedule their story vocabulary for review, same as a lesson quiz.`;
      after.appendChild(p);
    },
  });
}

document.addEventListener("DOMContentLoaded", main);
