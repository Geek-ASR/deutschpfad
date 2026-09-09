/**
 * German cardinal- and ordinal-number formation, 0–1000.
 *
 * This is the "teach the logic, not a list" engine behind the Numbers
 * unit: rather than a lookup table of every number, only the irregular
 * base forms (0–19, the tens, "hundert", "tausend") are hard-coded: every
 * other number is *composed* from them using the same rule a learner is
 * taught (ones + "und" + tens). Reused by the lesson's builder widget and
 * its "type your own number" exploration field.
 *
 * Exported: numberToGerman(n) -> { word, parts }
 *   `word`  - the full German word, e.g. "einundzwanzig"
 *   `parts` - a breakdown for highlighting, e.g.
 *             [{ text: "ein", type: "ones" },
 *              { text: "und", type: "connector" },
 *              { text: "zwanzig", type: "tens" }]
 *
 * Exported: ordinalToGerman(n) -> { word, parts }
 *   Ordinals (1st, 2nd, 3rd...) follow a different, smaller rule than
 *   cardinals: a stem (usually the cardinal itself) plus "-te" below 20
 *   and "-ste" from 20 on — except stems that already end in "t"
 *   (erst-, dritt-), which just add "-e" to avoid a double "-tte". Four
 *   stems are irregular outright (erst, dritt, sieb, ach), the same way
 *   English has "first/third" instead of "oneth/threeth."
 */

const ONES = [
  "null", "eins", "zwei", "drei", "vier", "fünf",
  "sechs", "sieben", "acht", "neun",
];

// 10–19 are irregular enough (elf, zwölf; sech(s)zehn, sieb(en)zehn drop
// letters) that they're simplest as a literal table, not derived.
const TEENS = [
  "zehn", "elf", "zwölf", "dreizehn", "vierzehn",
  "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn",
];

// Index 2–9 = 20,30,...,90. dreißig and the sech(s)zig/sieb(en)zig
// contractions are irregular, so this is literal too.
const TENS = [
  "", "", "zwanzig", "dreißig", "vierzig", "fünfzig",
  "sechzig", "siebzig", "achtzig", "neunzig",
];

function onesForCompound(d) {
  // "eins" contracts to "ein" whenever it's compounded with something
  // after it (einundzwanzig, not einsundzwanzig) — the one real
  // irregularity inside an otherwise fully regular rule.
  return d === 1 ? "ein" : ONES[d];
}

/**
 * @param {number} n integer, 0–1000
 * @returns {{ word: string, parts: {text: string, type: string}[] }}
 */
export function numberToGerman(n) {
  if (!Number.isInteger(n) || n < 0 || n > 1000) {
    throw new RangeError("numberToGerman: expects an integer 0–1000");
  }

  if (n === 1000) return { word: "tausend", parts: [{ text: "tausend", type: "literal" }] };
  if (n === 100) return { word: "hundert", parts: [{ text: "hundert", type: "literal" }] };
  if (n < 10) return { word: ONES[n], type: "ones", parts: [{ text: ONES[n], type: "ones" }] };
  if (n < 20) return { word: TEENS[n - 10], parts: [{ text: TEENS[n - 10], type: "teens" }] };

  if (n < 100) {
    const tensDigit = Math.floor(n / 10);
    const onesDigit = n % 10;
    if (onesDigit === 0) {
      return { word: TENS[tensDigit], parts: [{ text: TENS[tensDigit], type: "tens" }] };
    }
    const onesPart = onesForCompound(onesDigit);
    return {
      word: `${onesPart}und${TENS[tensDigit]}`,
      parts: [
        { text: onesPart, type: "ones" },
        { text: "und", type: "connector" },
        { text: TENS[tensDigit], type: "tens" },
      ],
    };
  }

  // 101–999
  const hundredsDigit = Math.floor(n / 100);
  const remainder = n % 100;
  const hundredsPrefix = hundredsDigit === 1 ? "hundert" : `${ONES[hundredsDigit]}hundert`;
  const hundredsParts =
    hundredsDigit === 1
      ? [{ text: "hundert", type: "hundreds" }]
      : [{ text: ONES[hundredsDigit], type: "ones" }, { text: "hundert", type: "hundreds" }];

  if (remainder === 0) {
    return { word: hundredsPrefix, parts: hundredsParts };
  }
  const rest = numberToGerman(remainder);
  return { word: hundredsPrefix + rest.word, parts: [...hundredsParts, ...rest.parts] };
}

const IRREGULAR_ORDINAL_STEMS = { 1: "erst", 3: "dritt", 7: "sieb", 8: "ach" };

/**
 * @param {number} n integer, 1–1000
 * @returns {{ word: string, parts: {text: string, type: string}[] }}
 */
export function ordinalToGerman(n) {
  if (!Number.isInteger(n) || n < 1 || n > 1000) {
    throw new RangeError("ordinalToGerman: expects an integer 1–1000");
  }

  // 101–999: only the last component (the part under 100) actually
  // takes the ordinal ending — "hundert" + "erste", not a "-ste" glued
  // onto the whole cardinal. Composed the same recursive way
  // numberToGerman() composes hundreds + remainder.
  if (n > 100 && n < 1000) {
    const hundredsDigit = Math.floor(n / 100);
    const remainder = n % 100;
    const hundreds = numberToGerman(hundredsDigit * 100);
    if (remainder === 0) {
      return { word: `${hundreds.word}ste`, parts: [...hundreds.parts, { text: "ste", type: "ending" }] };
    }
    const rest = ordinalToGerman(remainder);
    return { word: hundreds.word + rest.word, parts: [...hundreds.parts, ...rest.parts] };
  }

  const stem = IRREGULAR_ORDINAL_STEMS[n] || numberToGerman(n).word;
  const suffix = n >= 20 ? "ste" : stem.endsWith("t") ? "e" : "te";
  return {
    word: `${stem}${suffix}`,
    parts: [
      { text: stem, type: "stem" },
      { text: suffix, type: "ending" },
    ],
  };
}

export { normalizeGerman, answerMatches } from "./text-match.js";
