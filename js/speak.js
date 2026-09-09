/**
 * Free, offline-capable pronunciation using the browser's built-in
 * Web Speech API (SpeechSynthesis) — no server, no API key, no audio
 * files to host. Quality depends on the voices installed on the
 * learner's device/OS, but it costs nothing and works without a
 * network request once the page has loaded.
 */

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedGermanVoice = null;

function pickGermanVoice() {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("de")) || null;
}

if (speechSupported()) {
  // Voice lists load asynchronously in some browsers.
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    cachedGermanVoice = pickGermanVoice();
  });
  cachedGermanVoice = pickGermanVoice();
}

/**
 * Speak German text aloud. Safe to call even where speech synthesis
 * isn't supported — it just does nothing.
 */
export function speakGerman(text) {
  if (!speechSupported() || !text) return;
  window.speechSynthesis.cancel(); // don't queue/overlap repeated clicks
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  if (cachedGermanVoice) utterance.voice = cachedGermanVoice;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

/**
 * Build a small "listen" button wired up to speak the given text.
 * Returns null (renders nothing) when speech synthesis isn't
 * available, rather than shipping a button that silently fails.
 */
export function createSpeakButton(text, label = "Listen") {
  if (!speechSupported()) return null;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "speak-btn";
  btn.setAttribute("aria-label", `${label}: ${text}`);
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/></svg>';
  btn.addEventListener("click", () => speakGerman(text));
  return btn;
}
