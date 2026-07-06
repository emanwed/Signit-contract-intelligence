import type { Contract } from "./types";

/** Subscription tier used to gate features across the prototype. */
export type Plan = "free" | "paid";

/** Max contracts a Free workspace can upload/add (then Pro is required). */
export const FREE_UPLOAD_LIMIT = 3;

/** The one persona lens available on Free (others are Pro). */
export const FREE_PERSONA = "exec" as const;

/** Fact keys included in Free's "basic" extraction (party/value/date). */
export const FREE_FACT_KEYS = new Set(["value", "renewal", "term"]);

/** Whether the plan unlocks a given Pro-tier capability. */
export const isPro = (plan: Plan) => plan === "paid";

/**
 * Whether a contract belongs to a Free workspace's list. A Free workspace is
 * exactly the user's own contracts — the `FREE_UPLOAD_LIMIT` sample "uploads"
 * it ships with (source `"added"`), plus anything the user uploads. The rest
 * of the seed portfolio is Pro-only sample data. Deleting one shrinks the list
 * for good (no backfill from the larger seed set), and these same contracts
 * are what the Free insights are computed from — so the list and the KPIs
 * always agree.
 */
export const isFreeWorkspaceContract = (c: Contract): boolean =>
  c.source === "added";
