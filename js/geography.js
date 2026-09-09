/**
 * Renders city explorer cards for the geography page. Same
 * simple/detailed pattern as js/timeline.js (native <details>, a level
 * toggle, a speak button) — kept as a separate module since a "city"
 * and a "history event" are different enough data shapes that sharing
 * one function would mean branching on shape rather than reusing logic.
 */

import { createSpeakButton } from "./speak.js";

export function renderCityCards(cities, container) {
  container.innerHTML = "";
  cities.forEach((city) => {
    const details = document.createElement("details");
    details.className = "city-card";

    const summary = document.createElement("summary");
    summary.className = "city-summary";
    summary.innerHTML = `
      <span class="city-name" lang="de">${city.nameDe}</span>
      <span class="city-meta">${city.nameEn ? city.nameEn + " · " : ""}${city.state} · ${city.populationApprox}</span>
    `;
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "city-body";

    const levelToggle = document.createElement("div");
    levelToggle.className = "timeline-level-toggle";
    const simpleBtn = document.createElement("button");
    simpleBtn.type = "button";
    simpleBtn.className = "timeline-level-btn";
    simpleBtn.textContent = "Simple (A1)";
    const detailedBtn = document.createElement("button");
    detailedBtn.type = "button";
    detailedBtn.className = "timeline-level-btn";
    detailedBtn.textContent = "Detailed (B1)";
    levelToggle.append(simpleBtn, detailedBtn);

    const textDeRow = document.createElement("div");
    textDeRow.className = "timeline-text-de-row";
    const textDe = document.createElement("p");
    textDe.className = "timeline-text-de";
    textDe.lang = "de";
    const speakMount = document.createElement("span");
    textDeRow.append(textDe, speakMount);

    const textEn = document.createElement("p");
    textEn.className = "timeline-text-en";

    function show(level) {
      const data = city[level];
      textDe.textContent = data.de;
      textEn.textContent = data.en;
      simpleBtn.classList.toggle("is-active", level === "simple");
      detailedBtn.classList.toggle("is-active", level === "detailed");
      speakMount.innerHTML = "";
      const btn = createSpeakButton(data.de, "Listen");
      if (btn) speakMount.appendChild(btn);
    }
    simpleBtn.addEventListener("click", () => show("simple"));
    detailedBtn.addEventListener("click", () => show("detailed"));
    show("simple");

    body.append(levelToggle, textDeRow, textEn);
    details.appendChild(body);
    container.appendChild(details);
  });
}

export function renderStateList(states, container) {
  container.innerHTML = "";
  states.forEach((state) => {
    const li = document.createElement("li");
    li.className = "state-item";
    li.innerHTML = `
      <span class="state-name" lang="de">${state.nameDe}${state.nameEn ? ` <span class="state-name-en">(${state.nameEn})</span>` : ""}</span>
      <span class="state-capital">${state.note ? state.note : "Capital: " + state.capital}</span>
    `;
    container.appendChild(li);
  });
}
