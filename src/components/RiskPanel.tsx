"use client";

import { Check, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useSettings } from "@/context/SettingsContext";
import type { Dict } from "@/lib/i18n";
import {
  RISK_DIMS,
  RISK_TONE,
  dimLevel,
  playbookComparison,
  riskBand,
  riskScore,
  rowText,
  type RiskDimKey,
} from "@/lib/risk";
import type { Contract } from "@/lib/types";

const DIM_LABEL: Record<RiskDimKey, [keyof Dict, keyof Dict]> = {
  liability: ["dimLiability", "dimLiabilityInd"],
  termination: ["dimTermination", "dimTerminationInd"],
  ip: ["dimIp", "dimIpInd"],
  indemnity: ["dimIndemnity", "dimIndemnityInd"],
  autorenew: ["dimAutorenew", "dimAutorenewInd"],
  law: ["dimLaw", "dimLawInd"],
};

/**
 * Module 3 — per-contract risk scoring: a 0–100 gauge, the six clause-risk
 * dimensions, and a structured clause-vs-playbook comparison.
 */
export function RiskPanel({ c }: { c: Contract }) {
  const { L, lang } = useApp();
  const { checks } = useSettings();

  const score = riskScore(c);
  const band = riskBand(score);
  const tone = RISK_TONE[band];
  const bandLabel =
    band === "high" ? L.riskBandHigh : band === "medium" ? L.riskBandMed : L.riskBandLow;

  const rows = playbookComparison(c, checks);
  const devCount = rows.filter((r) => !r.met).length;

  // Gauge marker position (semicircle, 0 left → 100 right).
  const theta = Math.PI * (1 - score / 100);
  const mx = 100 + 80 * Math.cos(theta);
  const my = 100 - 80 * Math.sin(theta);

  return (
    <div className="mt-3">
      {/* Score gauge */}
      <Section title={L.riskTitle}>
        <div className="flex justify-center">
          <svg viewBox="0 0 200 122" style={{ width: "100%", maxWidth: 300 }}>
            <defs>
              <linearGradient id="riskgrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--high)" />
                <stop offset="0.5" stopColor="var(--med)" />
                <stop offset="1" stopColor="var(--low)" />
              </linearGradient>
            </defs>
            <path
              d="M20 100 A80 80 0 0 1 180 100"
              fill="none"
              stroke="var(--surface-alt)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M20 100 A80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#riskgrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Marker at the score */}
            <circle cx={mx} cy={my} r="9" fill="var(--bg)" stroke={tone} strokeWidth="3" />
            <circle cx={mx} cy={my} r="3.5" fill={tone} />
            {/* Score + band */}
            <text
              x="100"
              y="74"
              textAnchor="middle"
              className="font-display"
              style={{ fontSize: 34, fontWeight: 800, fill: tone }}
            >
              {score}
            </text>
            <text
              x="100"
              y="92"
              textAnchor="middle"
              style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, fill: tone }}
            >
              {bandLabel}
            </text>
            <text x="20" y="118" style={{ fontSize: 8, fill: "var(--text-soft)" }}>
              {L.riskLow}
            </text>
            <text x="180" y="118" textAnchor="end" style={{ fontSize: 8, fill: "var(--text-soft)" }}>
              {L.riskHigh}
            </text>
          </svg>
        </div>
      </Section>

      {/* Six risk dimensions */}
      <Section title={L.riskDimsTitle}>
        {RISK_DIMS.map((k) => {
          const [labelKey, indKey] = DIM_LABEL[k];
          const level = dimLevel(c, k);
          return (
            <div
              key={k}
              className="flex items-start gap-2.5 py-2.5"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span
                aria-hidden
                className="shrink-0"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 9,
                  marginTop: 4,
                  background: RISK_TONE[level],
                }}
              />
              <div className="min-w-0">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  {L[labelKey] as string}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5, marginTop: 1 }}>
                  {L[indKey] as string}
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      {/* Playbook comparison */}
      <Section
        title={L.playbookDev}
        badge={devCount}
      >
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center gap-2.5 py-2.5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {r.met ? (
              <Check size={16} color="var(--high)" className="shrink-0" />
            ) : (
              <X size={16} color="var(--low)" className="shrink-0" />
            )}
            <span className="flex-1 min-w-0" style={{ fontSize: 13, color: "var(--text)" }}>
              {L[r.clause]}
            </span>
            <span
              className="shrink-0 whitespace-nowrap"
              style={{ fontSize: 12, color: r.met ? "var(--text-soft)" : "var(--low)" }}
            >
              {rowText(r.contract, lang)}{" "}
              <span style={{ color: "var(--text-soft)" }}>
                {L.pbVs} {rowText(r.standard, lang)}
              </span>
            </span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mb-3 p-3.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-soft)" }}>
          {title}
        </span>
        {badge != null && badge > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--low)",
              background: "var(--low-bg)",
              borderRadius: 20,
              padding: "1px 8px",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
