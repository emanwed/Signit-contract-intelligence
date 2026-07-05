import type { Contract } from "./types";

/**
 * Confidence-based routing for the classifier's contract-type decision:
 *  • > 95%  → auto-classify (trusted)
 *  • 85–95% → auto-classify, but flag for a spot-check
 *  • < 85%  → route to the human classification queue
 */
export type ClassTier = "auto" | "spotcheck" | "queue";

export function classConfidence(c: Contract): number {
  return c.typeConfidence ?? 100;
}

export function classTier(c: Contract): ClassTier {
  const conf = classConfidence(c);
  if (conf > 95) return "auto";
  if (conf >= 85) return "spotcheck";
  return "queue";
}

/** Needs a human look (spot-check or full re-classification). */
export function needsClassReview(c: Contract): boolean {
  return classTier(c) !== "auto";
}

export const CLASS_TIER_TONE: Record<ClassTier, string> = {
  auto: "var(--high)",
  spotcheck: "var(--med)",
  queue: "var(--low)",
};

export const CLASS_TIER_KEY: Record<
  ClassTier,
  "classAuto" | "classSpotcheck" | "classQueue"
> = {
  auto: "classAuto",
  spotcheck: "classSpotcheck",
  queue: "classQueue",
};
