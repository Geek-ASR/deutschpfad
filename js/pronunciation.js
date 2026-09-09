/**
 * Renders the Pronunciation Lab: one card per tricky sound, each with an
 * articulation tip and example words you can hear via the Web Speech
 * API. Deliberately listen-only — no "record yourself and compare"
 * feature. Doing that honestly would need either a server (against this
 * project's zero-backend constraint) or the browser's SpeechRecognition
 * API, which in practice sends microphone audio to a cloud speech
 * service — a real exception to the "nothing you do here is ever sent
 * anywhere" promise made throughout this site. Rather than quietly
 * break that promise or ship a fake comparison that doesn't actually
 * analyze anything, this stays "listen and practice on your own."
 */

import { createSpeakButton } from "./speak.js";

function renderExampleList(examples, container) {
  const ul = document.createElement("ul");
  ul.className = "sound-examples";
  examples.forEach((ex) => {
    const li = document.createElement("li");
    li.className = "sound-example";
    const de = document.createElement("span");
    de.lang = "de";
    de.className = "sound-example-de";
    de.textContent = ex.de;
    const en = document.createElement("span");
    en.className = "sound-example-en";
    en.textContent = ex.en;
    li.append(de, en);
    const speakBtn = createSpeakButton(ex.de, "Listen");
    if (speakBtn) li.appendChild(speakBtn);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

export function renderPronunciationSounds(sounds, container) {
  container.innerHTML = "";
  sounds.forEach((sound) => {
    const card = document.createElement("article");
    card.className = "sound-card";

    const head = document.createElement("div");
    head.className = "sound-head";
    const glyph = document.createElement("span");
    glyph.className = "sound-glyph";
    glyph.lang = "de";
    glyph.textContent = sound.sound;
    const tip = document.createElement("p");
    tip.className = "sound-tip";
    tip.textContent = sound.tip;
    head.append(glyph, tip);
    card.appendChild(head);

    if (Array.isArray(sound.variants)) {
      sound.variants.forEach((variant) => {
        const v = document.createElement("div");
        v.className = "sound-variant";
        const label = document.createElement("p");
        label.className = "sound-variant-label";
        label.textContent = variant.label;
        const vTip = document.createElement("p");
        vTip.className = "sound-tip";
        vTip.textContent = variant.tip;
        v.append(label, vTip);
        renderExampleList(variant.examples, v);
        card.appendChild(v);
      });
    } else {
      renderExampleList(sound.examples, card);
    }

    container.appendChild(card);
  });
}
