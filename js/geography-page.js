import { renderCityCards, renderStateList } from "./geography.js";

async function main() {
  const cityMount = document.getElementById("city-mount");
  const stateMount = document.getElementById("state-mount");
  try {
    const res = await fetch("data/geography/germany.json");
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    renderCityCards(data.cities, cityMount);
    renderStateList(data.states, stateMount);
  } catch (err) {
    console.error(err);
    const msg =
      '<p class="quiz-empty">Couldn\'t load geography data. If you opened this file directly, run it from a local server instead (see the README).</p>';
    cityMount.innerHTML = msg;
    stateMount.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", main);
