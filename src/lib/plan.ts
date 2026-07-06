import { CONTRACTS } from "@/data/contracts";
import { contractStatus } from "./status";
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
 * The fixed starter contracts a Free workspace begins with — always the same
 * `FREE_UPLOAD_LIMIT` seed contracts, resolved once from the static demo
 * dataset (not "whichever are active right now"). Deleting one shrinks the
 * Free view permanently instead of backfilling from the much larger seed
 * portfolio, which is what previously kept the list stuck at 3.
 */
const FREE_SEED_IDS = new Set(
  CONTRACTS.filter((c) => contractStatus(c) === "active")
    .slice(0, FREE_UPLOAD_LIMIT)
    .map((c) => c.id),
);

/**
 * Whether a contract counts toward a Free workspace's contract list: one of
 * its starter seed contracts (until deleted) plus anything the user uploaded.
 */
export const isFreeWorkspaceContract = (c: Contract): boolean =>
  FREE_SEED_IDS.has(c.id) || c.source === "added";
