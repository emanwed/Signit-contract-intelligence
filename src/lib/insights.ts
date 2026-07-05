import type { Contract } from "./types";
import { contractStatus } from "./status";
import { liabilityCap, playbookDeviations, type Checks } from "./playbook";
import { generateObligations } from "./obligations";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Portfolio metrics behind the persona KPI cards. Real values where the data
 * supports it; a few figures (quarter-over-quarter trend, waiting age, detected
 * savings) are deterministic illustrative estimates — clearly demo signals.
 */
export interface Insights {
  active: Contract[];
  totalCommit: number;
  commitTrendPct: number;
  next90: Contract[];
  cashDue90: number;
  nearestDueDays: number;
  autoRenew90Count: number;
  autoRenew90Value: number;
  supplierTop1Pct: number;
  supplierTop3Pct: number;
  complianceScore: number;
  pdplGaps: number;
  deviationTotal: number;
  lowCapDeviations: number;
  missingClauses: number;
  overdueObligations: number;
  savings: number;
  negotiationLeverage: number;
  highRiskCount: number;
  highRiskAgeDays: number;
  lowConfExtractions: number;
  noticeSoonestDays: number;
  noticeSoonest: Contract | null;
}

export function portfolioInsights(
  contracts: Contract[],
  checks: Checks,
): Insights {
  const active = contracts.filter((c) => contractStatus(c) === "active");
  const totalCommit = active.reduce((s, c) => s + c.valueSAR, 0);

  const next90 = contracts.filter((c) => c.daysToRenew > 0 && c.daysToRenew <= 90);
  const cashDue90 = next90.reduce((s, c) => s + c.valueSAR, 0);
  const nearestDueDays = next90.length
    ? Math.min(...next90.map((c) => c.daysToRenew))
    : 0;

  const autoRenew90 = next90.filter((c) => c.autoRenew);
  const autoRenew90Value = autoRenew90.reduce((s, c) => s + c.valueSAR, 0);

  // Supplier concentration — share of value held by the top 1 and top 3 parties.
  const byParty = new Map<string, number>();
  for (const c of active) {
    byParty.set(c.party_en, (byParty.get(c.party_en) ?? 0) + c.valueSAR);
  }
  const partyTotals = [...byParty.values()].sort((a, b) => b - a);
  const pctOf = (v: number) => (totalCommit ? Math.round((v / totalCommit) * 100) : 0);
  const supplierTop1Pct = pctOf(partyTotals[0] ?? 0);
  const supplierTop3Pct = pctOf(partyTotals.slice(0, 3).reduce((s, v) => s + v, 0));

  // Compliance — a single composite score out of 100.
  const pdplGaps = contracts.filter((c) =>
    c.facts.some((f) => f.k === "pdpl" && f.conf !== "high"),
  ).length;
  const deviationTotal = contracts.reduce(
    (s, c) => s + playbookDeviations(c, checks).length,
    0,
  );
  const lowCapDeviations = contracts.reduce(
    (s, c) =>
      s +
      playbookDeviations(c, checks).filter(
        (d) => d.key === "lowcap" || d.key === "nocap",
      ).length,
    0,
  );
  const complianceScore = Math.max(
    0,
    Math.min(100, Math.round(100 - pdplGaps * 3 - Math.min(deviationTotal, 18) * 2)),
  );

  // Contracts missing an essential clause (no liability cap at all).
  const missingClauses = contracts.filter((c) => liabilityCap(c) === null).length;

  // Overdue obligations across the portfolio.
  const obligations = generateObligations(contracts);
  const overdueObligations = obligations.filter((o) => o.daysLeft < 0).length;

  // Detected savings — illustrative overlap between the two priciest SaaS licences.
  const licences = contracts
    .filter((c) => c.type === "licence")
    .sort((a, b) => b.valueSAR - a.valueSAR);
  const savings =
    licences.length >= 2 ? Math.round((licences[1]!.valueSAR * 0.22) / 1000) * 1000 : 0;

  const negotiationLeverage = next90.filter((c) => c.noticeDays >= 45).length;

  const highRisk = contracts.filter((c) => c.risk === "high");
  const highRiskAgeDays = highRisk.length
    ? 4 + (hash(highRisk[0]!.id) % 18)
    : 0;

  const lowConfExtractions = contracts.reduce(
    (s, c) => s + c.facts.filter((f) => f.conf === "low").length,
    0,
  );

  // Tightest notice window — the auto-renewing contract whose notice deadline
  // (days-to-renew minus required notice) is closing soonest.
  let noticeSoonest: Contract | null = null;
  let noticeSoonestDays = 0;
  for (const c of contracts) {
    if (!c.autoRenew || c.daysToRenew <= 0) continue;
    const window = c.daysToRenew - c.noticeDays;
    if (noticeSoonest === null || window < noticeSoonestDays) {
      noticeSoonest = c;
      noticeSoonestDays = window;
    }
  }

  const commitTrendPct = 6 + (hash(`${active.length}-commit`) % 14); // illustrative +6..+19%

  return {
    active,
    totalCommit,
    commitTrendPct,
    next90,
    cashDue90,
    nearestDueDays,
    autoRenew90Count: autoRenew90.length,
    autoRenew90Value,
    supplierTop1Pct,
    supplierTop3Pct,
    complianceScore,
    pdplGaps,
    deviationTotal,
    lowCapDeviations,
    missingClauses,
    overdueObligations,
    savings,
    negotiationLeverage,
    highRiskCount: highRisk.length,
    highRiskAgeDays,
    lowConfExtractions,
    noticeSoonestDays: Math.max(0, noticeSoonestDays),
    noticeSoonest,
  };
}
