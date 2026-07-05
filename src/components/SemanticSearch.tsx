"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Database, Search, Sparkles, Target } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { factLabel } from "@/lib/i18n";
import { clauseText, semanticSearch } from "@/lib/semanticSearch";
import type { Contract } from "@/lib/types";

const STEPS = [
  { icon: Search, label: "ssStep1" as const },
  { icon: Sparkles, label: "ssStep2" as const },
  { icon: Database, label: "ssStep3" as const },
  { icon: Target, label: "ssStep4" as const },
];

/**
 * Module 5 — semantic contract search. A query is turned into a concept vector
 * and matched by meaning against every extracted clause, returning the nearest
 * clauses with similarity scores (simulating the embedding → vector-DB pipeline).
 */
export function SemanticSearch({ onOpen }: { onOpen: (c: Contract) => void }) {
  const { lang, L } = useApp();
  const { contracts } = useContracts();
  const [q, setQ] = useState(
    lang === "ar" ? "المسؤولية والتعويض" : "liability obligations",
  );

  const results = useMemo(() => semanticSearch(contracts, q), [contracts, q]);
  const contractOf = (id: string) => contracts.find((c) => c.id === id);

  return (
    <div className="max-w-[820px] mx-auto">
      <p style={{ fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 12 }}>
        {L.ssIntro}
      </p>

      {/* Pipeline */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {STEPS.map((s, i) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--text-soft)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              <s.icon size={13} color="var(--accent)" /> {L[s.label]}
            </span>
            {i < STEPS.length - 1 && (
              <ArrowLeft
                size={13}
                color="var(--text-soft)"
                className="rtl-flip"
                style={{ opacity: 0.5 }}
              />
            )}
          </span>
        ))}
      </div>

      {/* Search box */}
      <div className="relative mb-4">
        <Search
          size={16}
          color="var(--text-soft)"
          className="pointer-events-none"
          style={{ position: "absolute", insetInlineStart: 12, top: "50%", transform: "translateY(-50%)" }}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={L.ssPlaceholder}
          className="w-full"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "11px 12px",
            paddingInlineStart: 36,
            fontSize: 14,
            color: "var(--text)",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div style={{ fontSize: 14, color: "var(--text-soft)", padding: 24, textAlign: "center" }}>
          {L.ssNoResults}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((m, i) => {
            const c = contractOf(m.contractId);
            return (
              <button
                key={`${m.contractId}-${m.factKey}-${i}`}
                onClick={() => c && onOpen(c)}
                className="tap text-start w-full flex items-start gap-3 p-3.5"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  boxShadow: "var(--shadow)",
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0 font-display"
                  style={{
                    minWidth: 52,
                    padding: "6px 8px",
                    borderRadius: 10,
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {m.sim.toFixed(2)}
                </span>
                <div className="min-w-0 flex-1">
                  <div style={{ fontSize: 11.5, color: "var(--accent)", fontWeight: 700 }}>
                    {factLabel(lang, m.factKey)} · {L.ssSim} {m.sim.toFixed(2)}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--text)",
                      lineHeight: 1.6,
                      margin: "3px 0 4px",
                    }}
                  >
                    {clauseText(m, lang)}
                  </div>
                  {c && (
                    <div style={{ fontSize: 12, color: "var(--text-soft)" }}>
                      {c.id} · {lang === "ar" ? c.title_ar : c.title_en}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 12, lineHeight: 1.6 }}>
        {L.ssSimNote}
      </div>
    </div>
  );
}
