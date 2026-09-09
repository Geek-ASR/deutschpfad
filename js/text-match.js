/**
 * Forgiving text comparison for typed German answers. Shared by the quiz
 * engine and anything else that needs to check a learner's typed input —
 * not specific to numbers or any one topic.
 *
 * Many learners type on keyboards without ü/ö/ä/ß, so "dreissig" and
 * "dreißig" should both count as correct, alongside case/whitespace
 * differences.
 */

export function normalizeGerman(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ü/g, "ue")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/\s+/g, " ");
}

export function answerMatches(input, acceptedAnswers) {
  const normalizedInput = normalizeGerman(input);
  return acceptedAnswers.some((a) => normalizeGerman(a) === normalizedInput);
}
