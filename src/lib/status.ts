import type { Contract } from "./types";

/** Lifecycle status — active, draft, or inactive (expired/ended). */
export type ContractStatusKey = "active" | "draft" | "inactive";

export function contractStatus(c: Contract): ContractStatusKey {
  if (c.status) return c.status;
  // Past its end date with no auto-renewal → no longer in force.
  if (c.daysToRenew <= 0 && !c.autoRenew) return "inactive";
  return "active";
}

/** A tag (not a status): an active contract whose renewal window is closing. */
export function isExpiringSoon(c: Contract): boolean {
  return (
    contractStatus(c) === "active" &&
    c.daysToRenew > 0 &&
    c.daysToRenew <= 30
  );
}

/**
 * Contract start date. Uses the explicit `startGreg` when present, otherwise
 * assumes a one-year term ending on `endGreg` (a reasonable default for the
 * demo portfolio, which only records end dates).
 */
export function contractStart(c: Contract): string {
  if (c.startGreg) return c.startGreg;
  if (!c.endGreg || c.endGreg === "—") return "—";
  const d = new Date(c.endGreg);
  if (Number.isNaN(d.getTime())) return "—";
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}
