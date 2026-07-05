import { francoFold } from "./franco";
import type { Contract, FactKey, Lang } from "./types";

/** Concept vector for each extracted clause type (stands in for an embedding). */
const FACT_CONCEPTS: Partial<Record<FactKey, string[]>> = {
  liability: ["liability", "cap", "indemnity", "exposure", "damages"],
  ip: ["ip", "ownership", "proprietary", "assignment", "workforhire", "rights"],
  law: ["law", "jurisdiction", "governing", "arbitration", "venue"],
  renewal: ["renewal", "autorenew", "notice", "term", "expiry"],
  penalty: ["payment", "penalty", "fee", "invoice", "late"],
  pdpl: ["pdpl", "data", "privacy", "processing", "transfer"],
  term: ["term", "duration", "renewal", "expiry"],
  value: ["payment", "value", "fee", "invoice"],
  counterparty: ["party", "counterparty", "vendor"],
};

/**
 * Maps free-text query keywords to a concept vector. Each row carries a regex
 * (Arabic + English substrings) and Franco-Arabic anchor words — the anchors
 * are folded to a consonant skeleton so Latin-typed Arabic ("mas2ooleya",
 * "ta7keem", "tajdeed") resolves to the same concept as its Arabic spelling.
 */
const QUERY_CONCEPTS: [RegExp, string[], string[]][] = [
  [/liab|مسؤول|indemn|تعويض|\bcap\b|سقف|damage|exposure|تعرّض/i, ["مسؤول", "تعويض", "liability", "indemnity"], ["liability", "cap", "indemnity", "exposure", "damages"]],
  [/\bip\b|intellect|ملكية|فكري|proprietary|work.?for.?hire|assign|ownership|رخصة|براءة|حقوق/i, ["ملكية فكرية", "حقوق الملكية", "intellectual property", "ownership", "assignment"], ["ip", "ownership", "proprietary", "assignment", "workforhire", "rights"]],
  [/renew|تجديد|auto|notice|إشعار|\bterm\b|expir|انتهاء|مدة/i, ["تجديد", "تمديد", "renewal"], ["renewal", "autorenew", "notice", "term", "expiry"]],
  [/data|priv|بيانات|خصوص|pdpl|process|معالجة|نقل/i, ["بيانات", "خصوصية", "حماية", "privacy"], ["pdpl", "data", "privacy", "processing", "transfer"]],
  [/pay|دفع|invoice|فاتورة|penalt|غرام|fee|late|رسوم/i, ["سداد", "فاتورة", "غرامة", "payment", "invoice", "penalty"], ["payment", "penalty", "fee", "invoice", "late"]],
  [/law|قانون|jurisdic|اختصاص|govern|arbitr|تحكيم|venue/i, ["قانون", "تحكيم", "اختصاص", "jurisdiction"], ["law", "jurisdiction", "governing", "arbitration", "venue"]],
  [/terminat|إنهاء|cure|معالجة/i, ["فسخ", "إنهاء", "termination"], ["renewal", "notice", "term"]],
];

export interface ClauseMatch {
  contractId: string;
  factKey: FactKey;
  clause: { ar: string; en: string };
  sim: number;
}

function queryConcepts(q: string): string[] {
  const set = new Set<string>();
  const fq = francoFold(q);
  for (const [re, anchors, cs] of QUERY_CONCEPTS) {
    const hit =
      re.test(q) ||
      (fq.length >= 3 &&
        anchors.some((a) => {
          const fa = francoFold(a);
          return fa.length >= 3 && fq.includes(fa);
        }));
    if (hit) cs.forEach((c) => set.add(c));
  }
  return [...set];
}

function jaccard(a: string[], b: string[]): number {
  const B = new Set(b);
  const inter = a.filter((x) => B.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * Simulated semantic clause search: query → concept vector → cosine-ish
 * similarity against each clause's concept vector → top-k nearest. Matches by
 * meaning (e.g. "liability" finds "cap", "indemnity", "exposure"), not keywords.
 */
export function semanticSearch(
  contracts: Contract[],
  query: string,
): ClauseMatch[] {
  const qc = queryConcepts(query);
  if (!query.trim() || qc.length === 0) return [];

  const results: ClauseMatch[] = [];
  for (const c of contracts) {
    for (const f of c.facts) {
      const fc = FACT_CONCEPTS[f.k];
      if (!fc) continue;
      const j = jaccard(qc, fc);
      if (j === 0) continue;
      const sim = Math.min(0.97, 0.6 + j * 0.34 + hash01(c.id + f.k) * 0.06);
      results.push({
        contractId: c.id,
        factKey: f.k,
        clause: { ar: f.sa, en: f.se },
        sim: Math.round(sim * 100) / 100,
      });
    }
  }
  return results.sort((a, b) => b.sim - a.sim).slice(0, 8);
}

export const clauseText = (m: ClauseMatch, lang: Lang) =>
  lang === "ar" ? m.clause.ar : m.clause.en;
