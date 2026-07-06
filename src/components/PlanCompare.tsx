"use client";

import { useEffect } from "react";
import { Check, Minus, Sparkles, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Dict } from "@/lib/i18n";

type Val = boolean | string;
type FeatRow = { feat: keyof Dict; free: Val; pro: Val };
type Row = { section: keyof Dict } | FeatRow;

// Practical, feature-sliced comparison — same feature, different slice per
// tier. Every row here maps to an actual gate in the code (see src/lib/plan.ts,
// compliance.ts's PRO_CHECKS, and the isPro/free checks across components) —
// keep it that way when features change instead of describing a roadmap.
const ROWS: Row[] = [
  { section: "secIngest" },
  { feat: "cmpUploads", free: "valUploadsFree", pro: "valUploadsPro" },
  { feat: "cmpExtraction", free: "valExtractFree", pro: "valExtractPro" },
  { feat: "cmpSourceClauses", free: true, pro: true },

  { section: "secCompliance" },
  { feat: "cmpPdpl", free: "valPdplFree", pro: "valPdplPro" },
  { feat: "cmpZatca", free: false, pro: true },
  { feat: "cmpAnomaly", free: false, pro: true },
  { feat: "cmpCompanyDocs", free: false, pro: true },

  { section: "secObligations" },
  { feat: "cmpRenewals", free: "valRenewFree", pro: "valRenewPro" },
  { feat: "cmpActionWindow", free: "valActionWindowFree", pro: "valActionWindowPro" },
  { feat: "cmpWorkflow", free: false, pro: true },
  { feat: "cmpLenses", free: "valExecOnly", pro: "valAllLenses" },

  { section: "secIntel" },
  { feat: "cmpAsk", free: "valAskSingle", pro: "valAskPortfolio" },
  { feat: "cmpDashboard", free: false, pro: true },
];

/** Free-vs-Pro feature comparison, with Upgrade / Keep-free CTAs. */
export function PlanCompareModal({ onClose }: { onClose: () => void }) {
  const { L, plan, setPlan } = useApp();
  const free = plan === "free";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const upgrade = () => {
    setPlan("paid");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise relative scroll-slim"
        style={{
          width: "min(560px,100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          className="flex items-start justify-between gap-2 px-5 py-4 sticky top-0"
          style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="min-w-0">
            <div className="font-display" style={{ fontSize: 17, fontWeight: 700 }}>
              {L.cmpTitle}
            </div>
            {free && (
              <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 2 }}>
                {L.cmpSubtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            className="tap flex items-center justify-center shrink-0"
            style={{ width: 30, height: 30, borderRadius: 8, color: "var(--text-soft)" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={thHead}>{L.cmpFeature}</th>
                <th style={{ ...thHead, textAlign: "center", fontWeight: 700 }}>
                  {L.planFree}
                </th>
                <th
                  style={{
                    ...thHead,
                    textAlign: "center",
                    fontWeight: 800,
                    color: "var(--accent)",
                  }}
                >
                  <span className="inline-flex items-center gap-1 justify-center">
                    <Sparkles size={12} /> {L.planPaid}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) =>
                "section" in r ? (
                  <tr key={`s-${i}`}>
                    <td
                      colSpan={3}
                      style={{
                        padding: "12px 6px 5px",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.3,
                        textTransform: "uppercase",
                        color: "var(--accent)",
                      }}
                    >
                      {L[r.section] as string}
                    </td>
                  </tr>
                ) : (
                  <tr key={r.feat} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 6px", fontSize: 12.5, color: "var(--text)" }}>
                      {L[r.feat] as string}
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center" }}>
                      <Cell v={r.free} pro={false} L={L} />
                    </td>
                    <td
                      style={{
                        padding: "10px 6px",
                        textAlign: "center",
                        background: "color-mix(in srgb, var(--accent) 5%, transparent)",
                      }}
                    >
                      <Cell v={r.pro} pro L={L} />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          {/* CTAs */}
          {free ? (
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={upgrade}
                className="tap flex-1 flex items-center justify-center gap-2 py-3"
                style={{
                  background: "var(--cta)",
                  color: "var(--cta-ink)",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                <Sparkles size={16} /> {L.upgradePro}
              </button>
              <button
                onClick={onClose}
                className="tap shrink-0 py-3 px-4"
                style={{
                  background: "var(--surface)",
                  color: "var(--text-soft)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                {L.keepFree}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="tap w-full py-3 mt-5"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              {L.back}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const thHead: React.CSSProperties = {
  textAlign: "start",
  padding: "8px 6px",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--text-soft)",
};

function Cell({ v, pro, L }: { v: Val; pro: boolean; L: Dict }) {
  if (typeof v === "string") {
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: pro ? 700 : 600,
          color: pro ? "var(--text)" : "var(--text-soft)",
        }}
      >
        {L[v as keyof Dict] as string}
      </span>
    );
  }
  return v ? (
    <Check size={17} color={pro ? "var(--accent)" : "var(--high)"} className="inline" />
  ) : (
    <Minus size={16} color="var(--low)" className="inline" style={{ opacity: 0.65 }} />
  );
}
