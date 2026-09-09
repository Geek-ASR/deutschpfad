/**
 * Page script for stories/a1-der-erste-tag.html. Thin glue: fetch this
 * story's data, hand it to the generic story-reader engine, and mount
 * its comprehension quiz. If a second story needs more than this, that's
 * the point to extract a shared "story page" pattern — see
 * docs/story-reader.md.
 */

import { renderStoryReader } from "./story-reader.js";
import { runQuiz } from "./quiz-engine.js";
import { markStoryVisited, recordStoryQuizResult } from "./progress-store.js";

const STORY_ID = "a1-der-erste-tag";

async function main() {
  markStoryVisited(STORY_ID);

  let story;
  try {
    const res = await fetch("../data/stories/a1-der-erste-tag.json");
    if (!res.ok) throw new Error(`${res.status}`);
    story = await res.json();
  } catch (err) {
    console.error(err);
    document.getElementById("story-text").innerHTML =
      '<p class="quiz-empty">Couldn\'t load the story. If you opened this file directly, run it from a local server instead (see the README).</p>';
    return;
  }

  renderStoryReader({
    container: document.getElementById("story-text"),
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
