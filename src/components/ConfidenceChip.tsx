"use client";

import { CONF_META } from "@/lib/confidence";
import type { Confidence, Lang } from "@/lib/types";

/** Small pill showing an extraction's confidence (Verified / Needs review). */
export function ConfidenceChip({
  conf,
  lang,
}: {
  conf: Confidence;
  lang: Lang;
}) {
  const m = CONF_META[conf];
  return (
    <span
      className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"
      style={{
        fontSize: 11.5,
        fontWeight: 700,
        color: m.dot,
        background: m.bg,
        borderRadius: 20,
        padding: "3px 10px",
      }}
    >
      <m.Icon size={13} /> {m.label(lang)}
    </span>
  );
}
