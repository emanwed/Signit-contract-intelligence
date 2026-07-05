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
