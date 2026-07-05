"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  RefreshCw,
  RotateCcw,
  ScanSearch,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { useSettings } from "@/context/SettingsContext";
import { fmtGreg, hasLowLiabilityCap, money, riskVar } from "@/lib/format";
import { francoMatch } from "@/lib/franco";
import { documentText } from "@/lib/contractText";
import { hasPlaybookDeviation } from "@/lib/playbook";
import {
  contractStart,
  contractStatus,
  isExpiringSoon,
  type ContractStatusKey,
} from "@/lib/status";
import {
  CLASS_TIER_KEY,
  CLASS_TIER_TONE,
  classConfidence,
  classTier,
  needsClassReview,
} from "@/lib/classification";
import type { Contract, ContractType, Lang, OverviewFilter } from "@/lib/types";

type SortKey = "name" | "status" | "start" | "end" | "value";
type SortDir = "asc" | "desc";

const STATUS_ORDER: ContractStatusKey[] = ["active", "draft", "inactive"];
const STATUS_TONE: Record<ContractStatusKey, string> = {
  active: "var(--high)",
  draft: "var(--text-soft)",
  inactive: "var(--low)",
};
const STATUS_KEY: Record<ContractStatusKey, "stActive" | "stDraft" | "stInactive"> = {
  active: "stActive",
  draft: "stDraft",
  inactive: "stInactive",
};
const STATUS_FILTERS = new Set<string>(["active", "draft", "inactive"]);

const TYPES: ContractType[] = [
  "nda",
  "msa",
  "sow",
  "lease",
  "employment",
  "po",
  "licence",
];
const PER_PAGE = [10, 25, 50];

const title = (c: Contract, lang: Lang) => (lang === "ar" ? c.title_ar : c.title_en);
const party = (c: Contract, lang: Lang) => (lang === "ar" ? c.party_ar : c.party_en);

/**
 * The contract register — a Signit-styled data table: search, pill filters with
 * a reset, sortable columns (status, start/end dates, auto-renewal, value, risk)
 * and pagination. Honours the shared portfolio filter so an Overview drill-down
 * lands here pre-filtered, and opens the full contract view on row click.
 */
export function ContractsList({
  filter,
  setFilter,
  onOpen,
}: {
  filter: OverviewFilter;
  setFilter: (f: OverviewFilter) => void;
  onOpen: (c: Contract) => void;
}) {
  const { lang, L, plan } = useApp();
  const { contracts: allContracts } = useContracts();
  const { checks } = useSettings();

  // Free plan surfaces only 3 active contracts; upgrading unlocks the full set.
  const free = plan === "free";
  const contracts = useMemo(() => {
    if (!free) return allContracts;
    return allContracts.filter((c) => contractStatus(c) === "active").slice(0, 3);
  }, [free, allContracts]);

  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState<"all" | ContractType>("all");
  const [autoOnly, setAutoOnly] = useState(false);
  const [classOnly, setClassOnly] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "end",
    dir: "asc",
  });
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Status is part of the shared filter so an Overview KPI can drill into it
  // (e.g. Total commitments → active) and the status pill highlights to match.
  const statusF: "all" | ContractStatusKey =
    filter && STATUS_FILTERS.has(filter)
      ? (filter as ContractStatusKey)
      : "all";
  const setStatusF = (v: "all" | ContractStatusKey) =>
    setFilter(v === "all" ? null : v);

  const next90 = useMemo(
    () => contracts.filter((c) => c.daysToRenew > 0 && c.daysToRenew <= 90),
    [contracts],
  );
  const hasUploads = useMemo(
    () => contracts.some((c) => c.source === "added"),
    [contracts],
  );

  // 1) shared portfolio filter (from an Overview drill-down)
  const byShared = useMemo(() => {
    if (filter === "cap") return contracts.filter(hasLowLiabilityCap);
    if (filter === "renew") return next90;
    if (filter === "deviations")
      return contracts.filter((c) => hasPlaybookDeviation(c, checks));
    if (filter === "uploaded")
      return contracts.filter((c) => c.source === "added");
    if (filter && STATUS_FILTERS.has(filter))
      return contracts.filter((c) => contractStatus(c) === filter);
    if (typeof filter === "string" && filter.startsWith("cat:")) {
      const cat = filter.slice(4) as ContractType;
      return contracts.filter((c) => c.type === cat);
    }
    return contracts;
  }, [filter, next90, contracts, checks]);

  // 2) local filters + search
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = byShared.filter((c) => {
      if (typeF !== "all" && c.type !== typeF) return false;
      if (autoOnly && !c.autoRenew) return false;
      if (classOnly && !needsClassReview(c)) return false;
      if (term) {
        // Searches metadata AND the contract's content — its clauses, extracted
        // values, and full document text — so a user who only remembers a word
        // inside a contract (not its name or party) can still find it.
        // Franco-Arabic aware: raw substring first, then consonant-skeleton match.
        const facts = c.facts
          .map((f) => `${f.va} ${f.ve} ${f.sa} ${f.se}`)
          .join(" ");
        const hay = `${c.id} ${c.title_ar} ${c.title_en} ${c.party_ar} ${c.party_en} ${L.types[c.type]} ${facts} ${c.anomaly_ar ?? ""} ${c.anomaly_en ?? ""} ${documentText(c, lang)} ${c.docText ?? ""}`;
        if (!francoMatch(hay, term)) return false;
      }
      return true;
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    return [...out].sort((a, b) => {
      let r = 0;
      switch (sort.key) {
        case "name":
          r = title(a, lang).localeCompare(title(b, lang), lang);
          break;
        case "status":
          r =
            STATUS_ORDER.indexOf(contractStatus(a)) -
            STATUS_ORDER.indexOf(contractStatus(b));
          break;
        case "start":
          r = contractStart(a).localeCompare(contractStart(b));
          break;
        case "end":
          r = a.endGreg.localeCompare(b.endGreg);
          break;
        case "value":
          r = a.valueSAR - b.valueSAR;
          break;
      }
      return r * dir;
    });
  }, [byShared, q, typeF, autoOnly, classOnly, sort, lang, L]);

  useEffect(() => {
    setPage(0);
  }, [q, typeF, autoOnly, classOnly, filter, perPage]);

  const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(safePage * perPage, safePage * perPage + perPage);

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const anyActive =
    !!q || typeF !== "all" || autoOnly || classOnly || filter !== null;
  const resetAll = () => {
    setQ("");
    setTypeF("all");
    setAutoOnly(false);
    setClassOnly(false);
    setFilter(null);
  };

  const sharedLabel =
    filter === "cap"
      ? L.filterCap
      : filter === "renew"
        ? L.filterRenew
        : filter === "deviations"
          ? L.playbookDev
          : typeof filter === "string" && filter.startsWith("cat:")
            ? L.types[filter.slice(4) as ContractType]
            : null;

  return (
    <div>
      {/* Toolbar — search, pill filters, reset */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search
            size={16}
            color="var(--text-soft)"
            className="pointer-events-none"
            style={{
              position: "absolute",
              insetInlineStart: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={L.searchContracts}
            className="w-full"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "9px 12px",
              paddingInlineStart: 36,
              fontSize: 13.5,
              color: "var(--text)",
              fontFamily: "inherit",
            }}
          />
        </div>

        <FilterPill
          active={statusF !== "all"}
          value={statusF}
          onChange={(v) => setStatusF(v as "all" | ContractStatusKey)}
          placeholder={L.fltStatus}
          options={STATUS_ORDER.map((s) => ({ value: s, label: L[STATUS_KEY[s]] }))}
        />
        <FilterPill
          active={typeF !== "all"}
          value={typeF}
          onChange={(v) => setTypeF(v as "all" | ContractType)}
          placeholder={L.fltType}
          options={TYPES.map((t) => ({ value: t, label: L.types[t] }))}
        />
        <PillToggle
          on={autoOnly}
          onClick={() => setAutoOnly((v) => !v)}
          Icon={RefreshCw}
          label={L.colAutoRenew}
        />
        <PillToggle
          on={classOnly}
          onClick={() => setClassOnly((v) => !v)}
          Icon={ScanSearch}
          label={L.fltNeedsClass}
        />
        {hasUploads && (
          <PillToggle
            on={filter === "uploaded"}
            onClick={() => setFilter(filter === "uploaded" ? null : "uploaded")}
            Icon={Upload}
            label={L.filterUploaded}
          />
        )}
        {anyActive && (
          <button
            onClick={resetAll}
            title={L.reset}
            className="tap flex items-center gap-1.5 shrink-0"
            style={{
              color: "var(--text-soft)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              padding: "6px 12px",
            }}
          >
            <RotateCcw size={13} className="rtl-flip" /> {L.reset}
          </button>
        )}
      </div>

      {/* Active drill-down + result count */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {sharedLabel && (
          <button
            onClick={() => setFilter(null)}
            className="tap flex items-center gap-1"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {sharedLabel} <X size={12} />
          </button>
        )}
        {free && (
          <span
            className="inline-flex items-center gap-1 shrink-0"
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--accent)",
              background: "var(--accent-soft)",
              borderRadius: 999,
              padding: "3px 9px",
            }}
          >
            <Sparkles size={12} /> {L.freeContractsNote}
          </span>
        )}
        <span
          className="ms-auto shrink-0"
          style={{ fontSize: 12.5, color: "var(--text-soft)", fontWeight: 600 }}
        >
          {rows.length} {L.contractsCount}
        </span>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 14,
          background: "var(--surface)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <Th onClick={() => toggleSort("name")} active={sort.key === "name"} dir={sort.dir}>
                {L.colName}
              </Th>
              <Th className="hidden lg:table-cell">{L.colParty}</Th>
              <Th onClick={() => toggleSort("status")} active={sort.key === "status"} dir={sort.dir}>
                {L.colStatus}
              </Th>
              <Th
                className="hidden xl:table-cell"
                onClick={() => toggleSort("start")}
                active={sort.key === "start"}
                dir={sort.dir}
              >
                {L.colStart}
              </Th>
              <Th
                className="hidden sm:table-cell"
                onClick={() => toggleSort("end")}
                active={sort.key === "end"}
                dir={sort.dir}
              >
                {L.colEnd}
              </Th>
              <Th className="hidden md:table-cell">{L.colAutoRenew}</Th>
              <Th
                className="hidden md:table-cell"
                onClick={() => toggleSort("value")}
                active={sort.key === "value"}
                dir={sort.dir}
              >
                {L.colValue}
              </Th>
              <Th className="hidden lg:table-cell">{L.colRisk}</Th>
              <Th className="text-end">{L.colActions}</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((c) => {
              const st = contractStatus(c);
              return (
                <tr
                  key={c.id}
                  onClick={() => onOpen(c)}
                  className="row-hover"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                >
                  <Td>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                      {title(c, lang)}
                    </div>
                    <div
                      className="flex items-center gap-1.5 flex-wrap"
                      style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 2 }}
                    >
                      <span>
                        {c.id} · {L.types[c.type]}
                      </span>
                      {needsClassReview(c) && (
                        <span
                          className="inline-flex items-center gap-1"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: CLASS_TIER_TONE[classTier(c)],
                            background: `color-mix(in srgb, ${CLASS_TIER_TONE[classTier(c)]} 15%, transparent)`,
                            borderRadius: 5,
                            padding: "1px 6px",
                          }}
                        >
                          {L[CLASS_TIER_KEY[classTier(c)]]} · {classConfidence(c)}%
                        </span>
                      )}
                      {c.source === "added" && (
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                          {L.filterUploaded}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td className="hidden lg:table-cell">
                    <span style={{ fontSize: 12.5, color: "var(--text-soft)" }}>
                      {party(c, lang)}
                    </span>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1.5 whitespace-nowrap"
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: STATUS_TONE[st],
                          background: `color-mix(in srgb, ${STATUS_TONE[st]} 14%, transparent)`,
                          borderRadius: 20,
                          padding: "3px 9px",
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 7,
                            background: STATUS_TONE[st],
                          }}
                        />
                        {L[STATUS_KEY[st]]}
                      </span>
                      {isExpiringSoon(c) && (
                        <span
                          className="whitespace-nowrap"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--med)",
                            background: "var(--med-bg)",
                            borderRadius: 20,
                            padding: "2px 8px",
                          }}
                        >
                          {L.tagExpiring}
                        </span>
                      )}
                    </span>
                  </Td>
                  <Td className="hidden xl:table-cell">
                    <span style={{ fontSize: 12.5, color: "var(--text-soft)" }}>
                      {fmtGreg(contractStart(c), lang)}
                    </span>
                  </Td>
                  <Td className="hidden sm:table-cell">
                    <span style={{ fontSize: 12.5, color: "var(--text)" }}>
                      {fmtGreg(c.endGreg, lang)}
                    </span>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <span
                      className="whitespace-nowrap"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: c.autoRenew ? "var(--med)" : "var(--text-soft)",
                      }}
                    >
                      {c.autoRenew
                        ? `${L.autoOn} · ${c.noticeDays}${lang === "ar" ? " يوم" : "d"}`
                        : L.autoOff}
                    </span>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <span
                      className="font-display whitespace-nowrap"
                      style={{ fontSize: 13, fontWeight: 700 }}
                    >
                      {c.valueSAR ? money(c.valueSAR, lang) : "—"}
                    </span>
                  </Td>
                  <Td className="hidden lg:table-cell">
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{ fontSize: 12.5, color: "var(--text-soft)" }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: 9,
                          background: riskVar(c.risk),
                        }}
                      />
                      {c.risk === "high" ? L.high : c.risk === "medium" ? L.medium : L.low}
                    </span>
                  </Td>
                  <Td className="text-end">
                    <span
                      className="inline-flex items-center justify-center"
                      aria-label={L.back}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        color: "var(--text-soft)",
                      }}
                    >
                      <ChevronRight size={15} className="rtl-flip" />
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div
            style={{
              color: "var(--text-soft)",
              fontSize: 14,
              padding: 28,
              textAlign: "center",
            }}
          >
            {L.noMatches}
          </div>
        )}

      </div>

      {/* Pagination */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12.5, color: "var(--text-soft)" }}>
              {L.rowsPerPage}
            </span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "4px 8px",
                fontSize: 12.5,
                color: "var(--text)",
                fontFamily: "inherit",
              }}
            >
              {PER_PAGE.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              style={{ fontSize: 12.5, color: "var(--text-soft)", marginInlineEnd: 6 }}
            >
              {L.pageOf.replace("{n}", `${safePage + 1}`).replace("{m}", `${pageCount}`)}
            </span>
            <PageBtn disabled={safePage === 0} onClick={() => setPage(0)}>
              <ChevronsLeft size={15} className="rtl-flip" />
            </PageBtn>
            <PageBtn disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
              <ChevronLeft size={15} className="rtl-flip" />
            </PageBtn>
            <PageBtn
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRight size={15} className="rtl-flip" />
            </PageBtn>
            <PageBtn
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(pageCount - 1)}
            >
              <ChevronsRight size={15} className="rtl-flip" />
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/** Pill-styled dropdown filter: a leading + icon, the select, a trailing caret. */
function FilterPill({
  value,
  onChange,
  options,
  placeholder,
  active,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  active: boolean;
}) {
  return (
    <div
      className="relative flex items-center gap-1 shrink-0"
      style={{
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent-soft)" : "var(--surface)",
        borderRadius: 999,
        paddingInline: 10,
        height: 34,
      }}
    >
      <Plus size={13} color={active ? "var(--accent)" : "var(--text-soft)"} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent"
        style={{
          border: "none",
          outline: "none",
          fontSize: 12.5,
          fontWeight: 600,
          color: active ? "var(--accent)" : "var(--text)",
          fontFamily: "inherit",
          cursor: "pointer",
          paddingInlineEnd: 16,
        }}
      >
        <option value="all">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        color="var(--text-soft)"
        className="pointer-events-none"
        style={{ position: "absolute", insetInlineEnd: 8 }}
      />
    </div>
  );
}

/** Pill toggle button (auto-renew / uploaded quick filters). */
function PillToggle({
  on,
  onClick,
  Icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  Icon: typeof RefreshCw;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="tap flex items-center gap-1.5 shrink-0"
      style={{
        border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
        background: on ? "var(--accent-soft)" : "var(--surface)",
        color: on ? "var(--accent)" : "var(--text)",
        borderRadius: 999,
        paddingInline: 12,
        height: 34,
        fontSize: 12.5,
        fontWeight: 600,
      }}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function Th({
  children,
  className,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  dir?: SortDir;
}) {
  return (
    <th
      className={className}
      style={{
        textAlign: "start",
        padding: "10px 14px",
        fontSize: 11.5,
        fontWeight: 700,
        color: "var(--text-soft)",
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {onClick && (
          <ArrowUpDown
            size={12}
            style={{
              opacity: active ? 1 : 0.35,
              transform: active && dir === "desc" ? "scaleY(-1)" : "none",
            }}
          />
        )}
      </span>
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={className} style={{ padding: "11px 14px", verticalAlign: "middle" }}>
      {children}
    </td>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="tap flex items-center justify-center"
      style={{
        width: 30,
        height: 30,
        border: "1px solid var(--border)",
        borderRadius: 8,
        background: "var(--surface)",
        color: "var(--text)",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
