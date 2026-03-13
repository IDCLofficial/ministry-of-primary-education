// ─────────────────────────────────────────────────────────────────────────────
//  numberToWords.ts  –  Number → Text utilities
// ─────────────────────────────────────────────────────────────────────────────

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];

const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];

const SCALES = ["", "thousand", "million", "billion", "trillion", "quadrillion"];

// ── Internal helpers ──────────────────────────────────────────────────────────

function convertChunk(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  return (
    ONES[Math.floor(n / 100)] +
    " hundred" +
    (n % 100 ? " " + convertChunk(n % 100) : "")
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Core: number → words ──────────────────────────────────────────────────────

/**
 * Converts any integer to its full English word form.
 *
 * @example toWord(0)          → "zero"
 * @example toWord(11)         → "eleven"
 * @example toWord(42)         → "forty-two"
 * @example toWord(-5)         → "negative five"
 * @example toWord(1_000_001)  → "one million one"
 */
export function toWord(n: number): string {
  if (!Number.isInteger(n)) throw new TypeError(`toWord expects an integer, got ${n}`);
  if (n === 0) return "zero";

  const sign = n < 0 ? "negative " : "";
  let abs = Math.abs(n);
  const parts: string[] = [];

  for (let i = 0; abs > 0; i++) {
    const chunk = abs % 1000;
    if (chunk !== 0) {
      const scale = SCALES[i] ? " " + SCALES[i] : "";
      parts.unshift(convertChunk(chunk) + scale);
    }
    abs = Math.floor(abs / 1000);
  }

  return sign + parts.join(" ");
}

// ── Year-style (pair grouping) ────────────────────────────────────────────────

/**
 * Converts a 4-digit year into natural spoken English by splitting into two
 * 2-digit halves, matching how years are actually said aloud.
 *
 * Special cases:
 *  - x000  → "two thousand"  (not "twenty hundred")
 *  - x00x  → "twenty oh-one"
 *  - non-4-digit → falls back to toWord()
 *
 * @example toYearWord(2025)  → "twenty twenty-five"
 * @example toYearWord(2000)  → "two thousand"
 * @example toYearWord(2001)  → "twenty oh-one"
 * @example toYearWord(1905)  → "nineteen oh-five"
 * @example toYearWord(1900)  → "nineteen hundred"
 * @example toYearWord(1100)  → "eleven hundred"
 */
export function toYearWord(n: number): string {
  console.log("triggering toYearWord", n);
  if (!Number.isInteger(n)) throw new TypeError(`toYearWord expects an integer, got ${n}`);

  const abs = Math.abs(n);
  const sign = n < 0 ? "negative " : "";

  // Only apply year-grouping for 4-digit numbers
  if (abs < 1000 || abs > 9999) return sign + toWord(abs);

  const high = Math.floor(abs / 100); // e.g. 20
  const low = abs % 100;             // e.g. 25

  // e.g. 2000 → "two thousand"
  if (low === 0 && high % 10 === 0) {
    return sign + toWord(high / 10) + " thousand";
  }

  // e.g. 1900 → "nineteen hundred"
  if (low === 0) {
    return sign + convertChunk(high) + " hundred";
  }

  // e.g. 2001 → "twenty oh-one", 1905 → "nineteen oh-five"
  const highWord = convertChunk(high);
  const lowWord = low < 10 ? "oh-" + ONES[low] : convertChunk(low);

  return sign + highWord + " " + lowWord;
}

/**
 * Wraps toYearWord with an arbitrary prefix string.
 *
 * @example toYearPhrase(2025, "the year")  → "the year twenty twenty-five"
 * @example toYearPhrase(1900, "born in")   → "born in nineteen hundred"
 */
export function toYearPhrase(n: number, prefix: string): string {
  return `${prefix} ${toYearWord(n)}`;
}

// ── Bracketed formats ─────────────────────────────────────────────────────────

/**
 * Returns "Word(number)" – word label with numeric hint in parentheses.
 *
 * @example toWordBracket(11)   → "Eleven(11)"
 * @example toWordBracket(100)  → "One hundred(100)"
 * @example toWordBracket(11, { capitalize: false }) → "eleven(11)"
 */
export function toWordBracket(
  n: number,
  options: { capitalize?: boolean } = {}
): string {
  const { capitalize: cap = true } = options;
  const word = toWord(n);
  return `${cap ? capitalize(word) : word}(${n})`;
}

/**
 * Returns "number(Word)" – numeric value with word hint in parentheses.
 *
 * @example toNumberBracket(11)   → "11(eleven)"
 * @example toNumberBracket(100)  → "100(one hundred)"
 * @example toNumberBracket(5, { capitalize: true }) → "5(Five)"
 */
export function toNumberBracket(
  n: number,
  options: { capitalize?: boolean } = {}
): string {
  const { capitalize: cap = false } = options;
  const word = toWord(n);
  return `${n}(${cap ? capitalize(word) : word})`;
}

// ── Noun helpers ──────────────────────────────────────────────────────────────

/**
 * @example toWords(1, "cat")          → "one cat"
 * @example toWords(3, "cat")          → "three cats"
 * @example toWords(3, "box", "boxes") → "three boxes"
 */
export function toWords(n: number, noun: string, pluralNoun?: string): string {
  const plural = pluralNoun ?? noun + "s";
  return `${toWord(n)} ${Math.abs(n) === 1 ? noun : plural}`;
}

/**
 * @example toSentence(1, "apple")             → "One apple."
 * @example toSentence(5, "child", "children") → "Five children."
 */
export function toSentence(n: number, noun: string, pluralNoun?: string): string {
  return capitalize(toWords(n, noun, pluralNoun)) + ".";
}

/**
 * @example toSentenceWithPrefix(3, "There are", "item") → "There are three items."
 * @example toSentenceWithPrefix(1, "I found", "result") → "I found one result."
 */
export function toSentenceWithPrefix(
  n: number,
  prefix: string,
  noun: string,
  pluralNoun?: string
): string {
  const plural = pluralNoun ?? noun + "s";
  return `${prefix} ${toWord(n)} ${Math.abs(n) === 1 ? noun : plural}.`;
}

/**
 * @example toWordSlashWords(1)         → "word/words(1)"
 * @example toWordSlashWords(5)         → "words/words(5)"
 * @example toWordSlashWords(3, "item") → "items/items(3)"
 */
export function toWordSlashWords(n: number, noun = "word", pluralNoun?: string): string {
  const plural = pluralNoun ?? noun + "s";
  const label = Math.abs(n) === 1 ? noun : plural;
  return `${label}/${plural}(${n})`;
}