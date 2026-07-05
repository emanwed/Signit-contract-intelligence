"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { money, riskVar } from "@/lib/format";
import type { Contract } from "@/lib/types";

/** Portfolio card. Tapping it opens the contract drawer. */
export function ContractCard({
  c,
  onOpen,
  highlight = false,
}: {
  c: Contract;
  onOpen: (c: Contract) => void;
  highlight?: boolean;
}) {
  const { lang, L, plan } = useApp();
  return (
    <button
      onClick={() => onOpen(c)}
      className="tap rise text-start"
      style={{
        background: "var(--surface)",
        border: `1px solid ${highlight ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 16,
        padding: 16,
        textAlign: "start",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className="flex items-center gap-1.5 min-w-0"
          style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 600 }}
        >
          <span className="truncate">
            {c.id} · {L.types[c.type]}
          </span>
          {c.source === "added" && (
            <span
              className="shrink-0"
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: "var(--accent)",
                background: "var(--accent-soft)",
                borderRadius: 5,
                padding: "1px 5px",
              }}
            >
              {L.filterUploaded}
            </span>
          )}
        </span>
        <span
          aria-hidden
          className="shrink-0"
          style={{
            width: 9,
            height: 9,
            borderRadius: 9,
            background: riskVar(c.risk),
          }}
        />
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 3,
          color: "var(--text)",
        }}
      >
        {lang === "ar" ? c.title_ar : c.title_en}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--text-soft)", marginBottom: 10 }}>
        {lang === "ar" ? c.party_ar : c.party_en}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>
          {c.valueSAR ? money(c.valueSAR, lang) : "—"}
        </span>
        {c.autoRenew && c.daysToRenew <= 90 && (
          <span
            className="flex items-center gap-1 whitespace-nowrap"
            style={{
              fontSize: 11,
              color: "var(--med)",
              background: "var(--med-bg)",
              borderRadius: 20,
              padding: "2px 8px",
              fontWeight: 600,
            }}
          >
            <Clock size={12} /> {c.daysToRenew} {L.daysLeft}
          </span>
        )}
      </div>
      {plan === "paid" && c.anomaly_en && (
        <div
          className="flex items-center gap-1 mt-2"
          style={{ fontSize: 11.5, color: "var(--low)" }}
        >
          <AlertTriangle size={13} /> {L.riskFlag}
        </div>
      )}
    </button>
  );
}
