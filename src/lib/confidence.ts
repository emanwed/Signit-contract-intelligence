import {
  CircleAlert,
  CircleCheck,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";
import type { Confidence, Lang } from "./types";
import { T } from "./i18n";

interface ConfMeta {
  /** CSS variable for the dot / text colour. */
  dot: string;
  /** CSS variable for the pill background. */
  bg: string;
  Icon: LucideIcon;
  label: (lang: Lang) => string;
}

/**
 * Presentation for each confidence level. High reads as "Verified"; medium and
 * low both read as "Needs review" (the review queue picks up only the low ones).
 */
export const CONF_META: Record<Confidence, ConfMeta> = {
  high: {
    dot: "var(--high)",
    bg: "var(--high-bg)",
    Icon: CircleCheck,
    label: (l) => T[l].verified,
  },
  medium: {
    dot: "var(--med)",
    bg: "var(--med-bg)",
    Icon: CircleAlert,
    label: (l) => T[l].needsReview,
  },
  low: {
    dot: "var(--low)",
    bg: "var(--low-bg)",
    Icon: CircleHelp,
    label: (l) => T[l].needsReview,
  },
};

/** Long-form confidence word for the drawer detail line. */
export function confidenceWord(conf: Confidence, lang: Lang): string {
  const d = T[lang];
  return conf === "high" ? d.high : conf === "medium" ? d.medium : d.low;
}
