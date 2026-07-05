/**
 * Franco-Arabic (Arabizi) aware search matching.
 *
 * Franco-Arabic is Arabic written in Latin letters and numerals — "5adamat" for
 * خدمات, "mas2ool" for مسؤول, "ta7keem" for تحكيم. To let every search box
 * accept it, we reduce Arabic script, English and Franco to one **consonant
 * skeleton** and match on that:
 *
 *   خدمات ↔ "khadamat" / "5adamat"  →  "xdmt"
 *   مسؤول ↔ "mas2ool"               →  "mswl"
 *
 * Rules that mirror how Franco spelling varies:
 *  • short vowels (a e i o u) and hamza are dropped — Arabic doesn't write them;
 *  • long vowels map to their letter — oo/ou→و (w), ee/ii→ي (y);
 *  • Arabizi numerals map to their letter — 5→خ, 7→ح, 3→ع(dropped), 9→ص…;
 *  • similar-sounding letters are merged (ت/ط/ث, س/ص, ق/ك …);
 *  • repeated letters are collapsed, since Franco doubles inconsistently.
 */

// Arabic letter → canonical latin consonant (short vowels / hamza dropped).
const AR_MAP: Record<string, string> = {
  ء: "", أ: "", إ: "", آ: "", ؤ: "", ئ: "", ٱ: "", ا: "", ى: "", ة: "",
  ب: "b",
  ت: "t", ط: "t", ث: "t",
  ج: "j",
  ح: "h", ه: "h",
  خ: "x",
  د: "d", ض: "d",
  ذ: "z", ز: "z", ظ: "z",
  ر: "r",
  س: "s", ص: "s",
  ش: "c",
  ع: "",
  غ: "g",
  ف: "f",
  ق: "k", ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  و: "w",
  ي: "y",
};

// Arabizi numerals → canonical latin (3/2 are throat/hamza sounds → dropped).
const DIGIT_MAP: Record<string, string> = {
  "2": "", "3": "", "4": "g", "5": "x", "6": "t", "7": "h", "8": "k", "9": "s",
};

// Latin digraphs, applied before single letters (order matters).
const DIGRAPHS: [RegExp, string][] = [
  [/kh/g, "x"],
  [/sh/g, "c"],
  [/ch/g, "c"],
  [/th/g, "t"],
  [/dh/g, "z"],
  [/gh/g, "g"],
  [/ph/g, "f"],
  [/[eiy]{2,}/g, "y"], // ee, ei, ie, ii, ey … → long ي
  [/[ou]{2,}/g, "w"], // oo, ou, uu … → long و
  [/ow/g, "w"],
];

/** Reduce any script/spelling to its Franco-comparable consonant skeleton. */
export function francoFold(input: string): string {
  let s = input.toLowerCase();
  // Strip Arabic diacritics and tatweel so folding is spelling-stable.
  s = s.replace(/[ً-ْٰـ]/g, "");
  // Latin digraphs + Arabizi numerals first, so Arabic-derived latin (e.g.
  // س+ح → "sh") is never re-read as a Franco digraph.
  for (const [re, to] of DIGRAPHS) s = s.replace(re, to);
  s = s.replace(/[2-9]/g, (d) => DIGIT_MAP[d] ?? "");
  // Map Arabic letters to canonical latin.
  s = s.replace(/[؀-ۿ]/g, (ch) => AR_MAP[ch] ?? "");
  // Merge remaining similar latin consonants.
  s = s.replace(/[cq]/g, "k").replace(/p/g, "b").replace(/v/g, "f");
  // Drop short vowels — Arabic script doesn't record them.
  s = s.replace(/[aeiou]/g, "");
  // Keep letters only, collapse repeats.
  s = s.replace(/[^a-z]/g, "").replace(/(.)\1+/g, "$1");
  return s;
}

/**
 * True when `term` matches `haystack` allowing Franco-Arabic input. The raw
 * (case-folded) substring test still runs first so existing Arabic/English
 * behaviour is unchanged; the skeleton test only adds recall for Latin queries.
 */
export function francoMatch(haystack: string, term: string): boolean {
  const t = term.trim();
  if (!t) return true;
  if (haystack.toLowerCase().includes(t.toLowerCase())) return true;
  const ft = francoFold(t);
  // Guard against over-matching from very short skeletons.
  if (ft.length < 3) return false;
  return francoFold(haystack).includes(ft);
}
