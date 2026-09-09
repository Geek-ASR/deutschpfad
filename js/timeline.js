/**
 * Renders a history-style timeline: expandable entries, each offering a
 * German text at two levels (simple/detailed) plus an English gloss.
 * Generic over any dataset shaped like data/history/timeline.json — not
 * specific to German history, so it could serve a different timeline
 * later without changes here.
 *
 * Uses native <details>/<summary> for the expand/collapse, which gets
 * keyboard operability and screen-reader semantics for free instead of
 * reimplementing an ARIA disclosure widget.
 */

import { createSpeakButton } from "./speak.js";

export function renderTimeline(events, container) {
  container.innerHTML = "";

  events.forEach((event) => {
    const details = document.createElement("details");
    details.className = "timeline-entry";

    const summary = document.createElement("summary");
    summary.className = "timeline-summary";
    summary.innerHTML = `
      <span class="timeline-year">${event.yearLabel}</span>
      <span class="timeline-title">${event.titleEn}<span class="timeline-title-de" lang="de">${event.titleDe}</span></span>
    `;
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "timeline-body";

    const levelToggle = document.createElement("div");
    levelToggle.className = "timeline-level-toggle";
    levelToggle.setAttribute("role", "group");
    levelToggle.setAttribute("aria-label", "Reading level");

    const simpleBtn = document.createElement("button");
    simpleBtn.type = "button";
    simpleBtn.className = "timeline-level-btn";
    simpleBtn.textContent = `Simple (${event.simple.cefr})`;

    const detailedBtn = document.createElement("button");
    detailedBtn.type = "button";
    detailedBtn.className = "timeline-level-btn";
    detailedBtn.textContent = `Detailed (${event.detailed.cefr})`;

    levelToggle.append(simpleBtn, detailedBtn);

    const textWrap = document.createElement("div");
    textWrap.className = "timeline-text-wrap";
    const textDe = document.createElement("p");
    textDe.className = "timeline-text-de";
    textDe.lang = "de";
    const textEn = document.createElement("p");
    textEn.className = "timeline-text-en";

    const speakMount = document.createElement("span");

    function show(level) {
      const data = event[level];
      textDe.textContent = data.de;
      textEn.textContent = data.en;
      simpleBtn.classList.toggle("is-active", level === "simple");
      simpleBtn.setAttribute("aria-pressed", String(level === "simple"));
      detailedBtn.classList.toggle("is-active", level === "detailed");
      detailedBtn.setAttribute("aria-pressed", String(level === "detailed"));
      speakMount.innerHTML = "";
      const btn = createSpeakButton(data.de, "Listen");
      if (btn) speakMount.appendChild(btn);
    }

    simpleBtn.addEventListener("click", () => show("simple"));
    detailedBtn.addEventListener("click", () => show("detailed"));
    show("simple");

    const textDeRow = document.createElement("div");
    textDeRow.className = "timeline-text-de-row";
    textDeRow.append(textDe, speakMount);

    textWrap.append(textDeRow, textEn);
    body.append(levelToggle, textWrap);
    details.appendChild(body);
    container.appendChild(details);
  });
}
