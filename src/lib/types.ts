/* Shared domain types for Signit. */

export type Lang = "ar" | "en";
export type ThemeMode = "light" | "dark";
export type Persona = "exec" | "proc" | "legal";
export type TabKey =
  | "overview"
  | "obligations"
  | "search"
  | "notifications"
  | "notifsettings"
  | "settings";

/** Primary (first-layer) navigation sections, mirroring the Signit product. */
export type Section =
  | "home"
  | "documents"
  | "contracts"
  | "templates"
  | "reports";

/** Confidence of an AI extraction. */
export type Confidence = "high" | "medium" | "low";

/** Overall contract risk rating. */
export type Risk = "high" | "medium" | "low";

/** Contract type — the classification taxonomy, keyed into i18n `types`. */
export type ContractType =
  | "nda"
  | "msa"
  | "sow"
  | "lease"
  | "employment"
  | "po"
  | "licence";

/** Shared portfolio filter for the merged overview + contract register. */
export type OverviewFilter =
  | null
  | "cap"
  | "renew"
  | "deviations"
  | "uploaded"
  | "active"
  | "draft"
  | "inactive"
  | `cat:${ContractType}`;

/** The extractable fact fields, keyed into the i18n dictionary for labels. */
export type FactKey =
  | "value"
  | "renewal"
  | "liability"
  | "penalty"
  | "law"
  | "term"
  | "ip"
  | "pdpl"
  | "counterparty"
  | "type";

/**
 * A single AI-extracted fact. Each carries bilingual value text (`va`/`ve`)
 * and the bilingual source clause it was extracted from (`sa`/`se`), plus a
 * confidence score — the core "source-linked confidence" pattern.
 */
export interface Fact {
  k: FactKey;
  conf: Confidence;
  /** value, Arabic */
  va: string;
  /** value, English */
  ve: string;
  /** source clause, Arabic */
  sa: string;
  /** source clause, English */
  se: string;
}

/** Payment frequency for a contract's value. */
export type PayPeriod =
  | "annual"
  | "quarterly"
  | "monthly"
  | "biannual"
  | "oneoff"
  | "milestone";

export interface Contract {
  id: string;
  type: ContractType;
  /** AI classification confidence (0–100) for `type` — drives routing. */
  typeConfidence?: number;
  lang: "ar" | "en" | "bilingual";
  risk: Risk;
  title_ar: string;
  title_en: string;
  party_ar: string;
  party_en: string;
  valueSAR: number;
  /** How often the value is paid. Optional — derived from `type` when absent. */
  payPeriod?: PayPeriod;
  /** Lifecycle status. Optional — derived from the end date when absent. */
  status?: "active" | "draft" | "inactive";
  /** Contract start / signing date (Gregorian). Optional — derived if absent. */
  startGreg?: string;
  endGreg: string;
  endHijri: string;
  autoRenew: boolean;
  noticeDays: number;
  daysToRenew: number;
  facts: Fact[];
  anomaly_ar: string | null;
  anomaly_en: string | null;
  /** Where the contract came from — seed sample vs user-added. */
  source?: "seed" | "added";
  /** The actual contract text (pasted, or synthesized for seed contracts). */
  docText?: string;
  /** Original file name, when a document was uploaded. */
  docFileName?: string;
  /** Data URL for an uploaded PDF, so the real document can be rendered inline. */
  docDataUrl?: string;
}

/**
 * Shape returned by /api/extract — the AI's read of an uploaded/pasted signed
 * contract. Every field is optional so the client can defensively fall back to
 * manual entry for anything the model didn't return.
 */
export interface ExtractResult {
  title_ar?: string;
  title_en?: string;
  party_ar?: string;
  party_en?: string;
  type?: ContractType;
  typeConfidence?: number;
  valueSAR?: number;
  endGreg?: string;
  endHijri?: string;
  autoRenew?: boolean;
  noticeDays?: number;
  risk?: Risk;
  facts?: Fact[];
  anomaly_ar?: string | null;
  anomaly_en?: string | null;
}

/** Compact projection of a contract sent to the /api/ask route. */
export interface CompactContract {
  id: string;
  title: string;
  party: string;
  type: ContractType;
  valueSAR: number;
  endGreg: string;
  autoRenew: boolean;
  noticeDays: number;
  daysToRenew: number;
  liability: string;
  pdpl: string;
  anomaly: string;
}

/** Shape returned by /api/ask (and matched by the local fallback). */
export interface AskAnswer {
  answer_ar: string;
  answer_en: string;
  matchIds: string[];
}
