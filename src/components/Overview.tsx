"use client";

import { useMemo, useRef } from "react";
import {
  Banknote,
  FileWarning,
  Gauge,
  Handshake,
  Landmark,
  Layers,
  Lock,
  PieChart,
  PiggyBank,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { useSettings } from "@/context/SettingsContext";
import { moneyCompact } from "@/lib/format";
import { portfolioInsights } from "@/lib/insights";
import type { Contract, OverviewFilter, Persona, TabKey } from "@/lib/types";
import { Stat } from "./Stat";
import { ContractsList } from "./ContractsList";

/**
 * The merged portfolio screen: one line of persona-tailored KPI insights, each
 * written in that persona's language (money & trend for Exec, deadlines &
 * leverage for Procurement, clauses & deviation for Legal) and ending in an
 * action. Every card drills into the register below or the relevant view.
 */
export function Overview({
  persona,
  filter,
  setFilter,
  onOpen,
  onTab,
}: {
  persona: Persona;
  filter: OverviewFilter;
  setFilter: (f: OverviewFilter) => void;
  onOpen: (c: Contract) => void;
  onTab: (t: TabKey) => void;
}) {
  const { lang, L, plan, setUpgradeOpen } = useApp();
  const ar = lang === "ar";
  const free = plan === "free";
  const { contracts } = useContracts();
  const { checks } = useSettings();

  // Free only reflects the user's own uploaded contracts in its insights; the
  // full seed portfolio is Pro sample data.
  const insightContracts = useMemo(
    () => (free ? contracts.filter((c) => c.source === "added") : contracts),
    [free, contracts],
  );

  const ins = useMemo(
    () => portfolioInsights(insightContracts, checks),
    [insightContracts, checks],
  );

  const topParty = useMemo(
    () => [...insightContracts].sort((a, b) => b.valueSAR - a.valueSAR)[0],
    [insightContracts],
  );
  const firstPdpl = useMemo(
    () => insightContracts.find((c) => c.facts.some((f) => f.k === "pdpl")),
    [insightContracts],
  );
  const firstHighRisk = useMemo(
    () => insightContracts.find((c) => c.risk === "high"),
    [insightContracts],
  );

  // A KPI drill-down sets the shared filter and scrolls to the register below.
  const listRef = useRef<HTMLDivElement>(null);
  const applyFilter = (f: OverviewFilter) => {
    setFilter(f);
    requestAnimationFrame(() =>
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };
  const goActive = () => applyFilter("active");
  const goRenew = () => applyFilter("renew");
  const goDeviations = () => applyFilter("deviations");
  const goAll = () => applyFilter(null);
  const noticeName = ins.noticeSoonest
    ? ar
      ? ins.noticeSoonest.title_ar
      : ins.noticeSoonest.title_en
    : "—";

  return (
    <div>
      {/* KPI row — a fixed 5-column track so fewer-than-5 personas keep the
          same box size and simply leave the trailing slot(s) empty. */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {persona === "exec" && (
          <>
            <Stat
              icon={Landmark}
              chip="accent"
              label={ar ? "إجمالي الالتزامات التعاقدية" : "Total contractual commitments"}
              value={moneyCompact(ins.totalCommit, lang)}
              sub={
                ar
                  ? `▲ +${ins.commitTrendPct}% عن الربع السابق · ${ins.active.length} عقود`
                  : `▲ +${ins.commitTrendPct}% vs last quarter · ${ins.active.length} contracts`
              }
              action={L.actDetails}
              onClick={goActive}
            />
            <Stat
              icon={Banknote}
              chip="med"
              label={ar ? "مستحقات نقدية خلال ٩٠ يومًا" : "Cash due within 90 days"}
              value={moneyCompact(ins.cashDue90, lang)}
              sub={
                ar
                  ? `${ins.next90.length} دفعات · أقربها بعد ${ins.nearestDueDays} يومًا`
                  : `${ins.next90.length} payments · nearest in ${ins.nearestDueDays} days`
              }
              tone="var(--med)"
              action={L.actReview}
              onClick={goRenew}
            />
            {free ? (
              <ProKpiCard onClick={() => setUpgradeOpen(true)} label={L.dashProLabel} sub={L.dashProSub} />
            ) : (
              <>
                <Stat
                  icon={RefreshCw}
                  chip="low"
                  label={ar ? "قيمة معرّضة للتجديد دون تفاوض" : "Value up for renewal — no negotiation"}
                  value={moneyCompact(ins.autoRenew90Value, lang)}
                  sub={
                    ar
                      ? `${ins.autoRenew90Count} عقود تتجدد تلقائيًا قريبًا`
                      : `${ins.autoRenew90Count} contracts auto-renew soon`
                  }
                  tone="var(--med)"
                  action={L.actNotify}
                  onClick={goRenew}
                />
                <Stat
                  icon={PieChart}
                  chip="accent"
                  label={ar ? "تركّز الموردين" : "Supplier concentration"}
                  value={`${ins.supplierTop1Pct}%`}
                  sub={
                    ar
                      ? `أكبر ٣ موردين = ${ins.supplierTop3Pct}% من المحفظة`
                      : `Top 3 suppliers = ${ins.supplierTop3Pct}% of portfolio`
                  }
                  tone={ins.supplierTop1Pct > 20 ? "var(--med)" : "var(--text)"}
                  action={L.actReview}
                  onClick={topParty ? () => onOpen(topParty) : goAll}
                />
                <Stat
                  icon={Gauge}
                  chip="med"
                  label={ar ? "مؤشر وضع الامتثال" : "Compliance posture"}
                  value={`${ins.complianceScore}/100`}
                  sub={
                    ar
                      ? `▼ ${ins.pdplGaps} فجوات PDPL · ${ins.deviationTotal} مخالفات دليل`
                      : `▼ ${ins.pdplGaps} PDPL gaps · ${ins.deviationTotal} playbook deviations`
                  }
                  tone={ins.complianceScore < 70 ? "var(--med)" : "var(--high)"}
                  action={L.actReview}
                  onClick={() => onTab("settings")}
                />
              </>
            )}
          </>
        )}

        {persona === "proc" && (
          <>
            <Stat
              icon={Timer}
              chip="low"
              label={ar ? "نافذة إشعار تُغلق الآن" : "Notice window closing now"}
              value={ar ? `${ins.noticeSoonestDays} يومًا` : `${ins.noticeSoonestDays} days`}
              sub={ar ? `${noticeName} · إشعار ${ins.noticeSoonest?.noticeDays ?? 0} يومًا` : `${noticeName} · ${ins.noticeSoonest?.noticeDays ?? 0}-day notice`}
              tone="var(--low)"
              action={L.actNotify}
              onClick={goRenew}
            />
            <Stat
              icon={Handshake}
              chip="accent"
              label={ar ? "قيمة قابلة لإعادة التفاوض (٩٠ يومًا)" : "Renegotiable value (90 days)"}
              value={moneyCompact(ins.cashDue90, lang)}
              sub={
                ar
                  ? `${ins.next90.length} عقود · أفضلية تفاوض في ${ins.negotiationLeverage}`
                  : `${ins.next90.length} contracts · leverage in ${ins.negotiationLeverage}`
              }
              action={L.actNegotiate}
              onClick={goRenew}
            />
            <Stat
              icon={RefreshCw}
              chip="low"
              label={ar ? "تجديد تلقائي وشيك" : "Imminent auto-renewal"}
              value={ar ? `${ins.autoRenew90Count} عقود` : `${ins.autoRenew90Count} contracts`}
              sub={
                ar
                  ? `${moneyCompact(ins.autoRenew90Value, lang)} · سيُلتزم بها ما لم تُخطِر`
                  : `${moneyCompact(ins.autoRenew90Value, lang)} · auto-commits unless you notify`
              }
              tone="var(--low)"
              action={L.actNotify}
              onClick={goRenew}
            />
            <Stat
              icon={TriangleAlert}
              chip="low"
              label={ar ? "التزامات مورّدين متأخرة" : "Overdue vendor obligations"}
              value={`${ins.overdueObligations}`}
              sub={ar ? "تسليم أو دفع متأخر لدى موردين" : "late delivery or payment at vendors"}
              tone="var(--low)"
              action={L.actClaim}
              onClick={() => onTab("notifications")}
            />
            <Stat
              icon={PiggyBank}
              chip="high"
              label={ar ? "فرص توفير مرصودة" : "Savings opportunities detected"}
              value={`~${moneyCompact(ins.savings, lang)}`}
              sub={ar ? "تداخل خدمات بين موردين" : "overlapping services across vendors"}
              tone="var(--high)"
              action={L.actReview}
              onClick={goAll}
            />
          </>
        )}

        {persona === "legal" && (
          <>
            <Stat
              icon={TriangleAlert}
              chip="low"
              label={ar ? "مخاطر عالية تنتظر قرارك" : "High risks awaiting your decision"}
              value={`${ins.highRiskCount}`}
              sub={ar ? `أقدمها بانتظارك منذ ${ins.highRiskAgeDays} يومًا` : `oldest waiting ${ins.highRiskAgeDays} days`}
              tone="var(--low)"
              action={L.actReview}
              onClick={firstHighRisk ? () => onOpen(firstHighRisk) : goDeviations}
            />
            <Stat
              icon={Scale}
              chip="low"
              label={ar ? "انحراف عن الصيغ المعتمدة" : "Deviation from approved forms"}
              value={ar ? `${ins.deviationTotal} بنود` : `${ins.deviationTotal} clauses`}
              sub={
                ar
                  ? `${ins.lowCapDeviations} سقوف مسؤولية دون السياسة`
                  : `${ins.lowCapDeviations} liability caps below policy`
              }
              tone="var(--low)"
              action={L.actReview}
              onClick={goDeviations}
            />
            <Stat
              icon={FileWarning}
              chip="med"
              label={ar ? "بنود جوهرية مفقودة" : "Missing essential clauses"}
              value={ar ? `${ins.missingClauses} عقود` : `${ins.missingClauses} contracts`}
              sub={ar ? "بلا سقف مسؤولية أو مدة علاج" : "no liability cap or cure period"}
              tone="var(--med)"
              action={L.actComplete}
              onClick={goDeviations}
            />
            <Stat
              icon={ShieldCheck}
              chip="med"
              label={ar ? "فجوات امتثال PDPL" : "PDPL compliance gaps"}
              value={ar ? `${ins.pdplGaps} عقود` : `${ins.pdplGaps} contracts`}
              sub={ar ? "معالجة بيانات بلا أساس نظامي موثّق" : "data processing without a documented legal basis"}
              tone="var(--med)"
              action={L.actReview}
              onClick={firstPdpl ? () => onOpen(firstPdpl) : goAll}
            />
            <Stat
              icon={Layers}
              chip="accent"
              label={ar ? "استخراجات بانتظار توثيقك" : "Extractions awaiting your verification"}
              value={ar ? `${ins.lowConfExtractions} قيم` : `${ins.lowConfExtractions} values`}
              sub={ar ? "ثقة منخفضة · توثيقك يحسّن الدقة" : "low confidence · your review improves accuracy"}
              action={L.actVerify}
              onClick={goAll}
            />
          </>
        )}
      </div>

      {/* Contract register — search, filters, sorting, pagination */}
      <div ref={listRef} className="mt-5" style={{ scrollMarginTop: 92 }}>
        <ContractsList filter={filter} setFilter={setFilter} onOpen={onOpen} />
      </div>
    </div>
  );
}

/** Locked placeholder for the Pro exec dashboard (concentration/exposure/PDPL). */
function ProKpiCard({
  onClick,
  label,
  sub,
}: {
  onClick: () => void;
  label: string;
  sub: string;
}) {
  const { L } = useApp();
  return (
    <button
      onClick={onClick}
      className="stat-card tap rise text-start w-full"
      style={{
        background: "var(--accent-soft)",
        border: "1px dashed var(--accent)",
        borderRadius: 18,
        padding: 18,
        cursor: "pointer",
      }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="flex items-center justify-center shrink-0"
          style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surface)" }}
        >
          <Lock size={16} color="var(--accent)" />
        </span>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700 }}>
            {label}
          </div>
          <div
            className="flex items-center gap-1"
            style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, marginTop: 12 }}
          >
            <Sparkles size={14} /> {L.planPaid}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 8 }}>
            {sub}
          </div>
        </div>
      </div>
    </button>
  );
}
