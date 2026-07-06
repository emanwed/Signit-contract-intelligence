"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  Download,
  FileText,
  Info,
  ListChecks,
  Lock,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { useSettings } from "@/context/SettingsContext";
import { CONF_META, confidenceWord } from "@/lib/confidence";
import { documentText } from "@/lib/contractText";
import { exportContract } from "@/lib/exportContract";
import { fmtDate, fmtGreg, money } from "@/lib/format";
import { factLabel } from "@/lib/i18n";
import { deviationText, playbookDeviations } from "@/lib/playbook";
import { explainClause, type ClauseExplanation } from "@/lib/clauseExplain";
import { FREE_FACT_KEYS } from "@/lib/plan";
import { RiskPanel } from "./RiskPanel";
import { EditContractModal } from "./EditContractModal";
import type { Confidence, Contract, Lang } from "@/lib/types";

type DrawerView = "values" | "document" | "risk";

/**
 * Contract drawer. Two views:
 *  • Values   — the hero: every AI-extracted fact is tappable, revealing its
 *               confidence and the exact source clause it came from.
 *  • Document — the actual contract: an uploaded PDF rendered inline, or the
 *               full text (provided or reconstructed) with source clauses
 *               highlighted by confidence.
 */
export function Drawer({
  c: initialC,
  onClose,
}: {
  c: Contract;
  onClose: () => void;
}) {
  const { lang, L, dir, plan, setUpgradeOpen } = useApp();
  const free = plan === "free";
  const { contracts, removeContract } = useContracts();
  // Always render the live version so edits reflect immediately.
  const c = contracts.find((x) => x.id === initialC.id) ?? initialC;
  // Free extracts only the basic schema (party/value/date); Pro gets it all.
  const shownFacts = free
    ? c.facts.filter((f) => FREE_FACT_KEYS.has(f.k))
    : c.facts;
  const [view, setView] = useState<DrawerView>("values");
  const [open, setOpen] = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [editing, setEditing] = useState(false);

  // Auto-reset the delete confirmation if the user doesn't follow through.
  useEffect(() => {
    if (!confirmDel) return;
    const t = setTimeout(() => setConfirmDel(false), 3500);
    return () => clearTimeout(t);
  }, [confirmDel]);

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

  return (
    <div
      className="fixed inset-0 z-[60] flex"
      style={{ justifyContent: dir === "rtl" ? "flex-start" : "flex-end" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          backdropFilter: "blur(2px)",
        }}
      />
      {editing && (
        <EditContractModal c={c} onClose={() => setEditing(false)} />
      )}
      <div
        className="rise scroll-slim"
        style={{
          position: "relative",
          width: "min(560px,100%)",
          height: "100%",
          background: "var(--bg)",
          borderInlineStart: "1px solid var(--border)",
          overflowY: "auto",
          boxShadow: "var(--shadow)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="flex items-center justify-between gap-2 px-5 py-4 sticky top-0 z-[2]"
          style={{
            background: "color-mix(in srgb, var(--bg) 95%, transparent)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={onClose}
            className="tap flex items-center gap-1"
            style={{
              fontSize: 13,
              color: "var(--text-soft)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {dir === "rtl" ? (
              <ChevronLeft size={16} style={{ transform: "scaleX(-1)" }} />
            ) : (
              <ArrowLeft size={16} />
            )}{" "}
            {L.back}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportContract(c, lang, free)}
              className="tap flex items-center gap-1.5"
              title={L.exportContract}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--accent)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border)",
                borderRadius: 9,
                padding: "6px 11px",
                cursor: "pointer",
              }}
            >
              <Download size={15} /> {L.exportContract}
            </button>
            <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{c.id}</span>
          </div>
        </div>

        <div className="px-5 py-5">
          <span style={{ fontSize: 11.5, color: "var(--text-soft)", fontWeight: 600 }}>
            {L.types[c.type]}
          </span>
          <div className="flex items-center gap-2" style={{ margin: "4px 0 2px" }}>
            <h2
              className="font-display"
              style={{ fontSize: 22, fontWeight: 700, margin: 0 }}
            >
              {lang === "ar" ? c.title_ar : c.title_en}
            </h2>
            <button
              onClick={() => setEditing(true)}
              className="tap flex items-center justify-center shrink-0"
              title={L.editContract}
              aria-label={L.editContract}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                color: "var(--accent)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              <Pencil size={15} />
            </button>
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-soft)", marginBottom: 6 }}>
            {lang === "ar" ? c.party_ar : c.party_en}
          </div>
          <div
            className="flex items-center gap-3 flex-wrap"
            style={{ fontSize: 12.5, color: "var(--text-soft)" }}
          >
            <span
              className="font-display"
              style={{ color: "var(--text)", fontWeight: 700, fontSize: 16 }}
            >
              {c.valueSAR ? money(c.valueSAR, lang) : "—"}
            </span>
            <span>
              · {fmtDate(c.endHijri, lang)} {L.hijri}
            </span>
            <span>
              · {fmtGreg(c.endGreg, lang)} {L.greg}
            </span>
          </div>

          {!free && c.anomaly_en && (
            <div
              className="flex items-start gap-2 mt-4 p-3"
              style={{
                background: "var(--low-bg)",
                borderRadius: 12,
                fontSize: 13,
                color: "var(--text)",
              }}
            >
              <AlertTriangle
                size={16}
                color="var(--low)"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span>
                <b style={{ color: "var(--low)" }}>{L.riskFlag}:</b>{" "}
                {lang === "ar" ? c.anomaly_ar : c.anomaly_en}
              </span>
            </div>
          )}

          {/* Values / Risk / Document toggle */}
          <div
            className="flex items-center gap-1 p-1 mt-4 flex-wrap"
            style={{ background: "var(--surface-alt)", borderRadius: 10, width: "fit-content" }}
            role="tablist"
          >
            <ViewTab
              on={view === "values"}
              onClick={() => setView("values")}
              Icon={ListChecks}
              label={L.valuesTab}
            />
            <ViewTab
              on={view === "risk"}
              onClick={() => setView("risk")}
              Icon={ShieldAlert}
              label={L.riskTab}
            />
            <ViewTab
              on={view === "document"}
              onClick={() => setView("document")}
              Icon={FileText}
              label={L.documentTab}
            />
          </div>

          {view === "risk" ? (
            free ? (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="tap w-full flex items-start gap-2 mt-4 p-3 text-start"
                style={{
                  background: "var(--accent-soft)",
                  border: "1px dashed var(--accent)",
                  borderRadius: 14,
                  color: "var(--accent)",
                }}
              >
                <Lock size={15} className="shrink-0" style={{ marginTop: 1 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.5 }}>
                  {L.riskProNote}
                </span>
              </button>
            ) : (
              <RiskPanel c={c} />
            )
          ) : view === "values" ? (
            <>
              {/* Source-linked-confidence promise, shown at the top of the
                  extracted-values view (moved here from the portfolio page). */}
              <div
                className="flex items-start gap-2 p-3"
                style={{
                  background: "var(--accent-soft)",
                  borderRadius: 12,
                  fontSize: 12.5,
                  color: "var(--text)",
                  margin: "14px 0 10px",
                }}
              >
                <ShieldCheck
                  size={16}
                  color="var(--accent)"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <span>{L.trustNote}</span>
              </div>

              {shownFacts.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--text-soft)", padding: "8px 0" }}>
                  {lang === "ar"
                    ? "لا توجد قيم مستخرجة لهذا العقد."
                    : "No extracted values for this contract."}
                </div>
              )}

              {shownFacts.map((f, i) => {
                const m = CONF_META[f.conf];
                const isOpen = open === i;
                return (
                  <div
                    key={f.k + i}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 18,
                      boxShadow: "var(--shadow)",
                      marginBottom: 10,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="tap w-full text-start flex items-center justify-between gap-3"
                      style={{
                        padding: 14,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <div className="min-w-0">
                        <div
                          style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 3 }}
                        >
                          {factLabel(lang, f.k)}
                        </div>
                        <div
                          style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)" }}
                        >
                          {lang === "ar" ? f.va : f.ve}
                        </div>
                      </div>
                      {!free && (
                        <span
                          className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"
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
                      )}
                    </button>

                    {isOpen && (
                      <div
                        className="rise"
                        style={{
                          borderTop: "1px solid var(--border)",
                          padding: 14,
                          background: "var(--surface-alt)",
                        }}
                      >
                        <div
                          className="flex items-center gap-1.5 mb-2"
                          style={{ fontSize: 11.5, color: "var(--text-soft)", fontWeight: 600 }}
                        >
                          <FileText size={13} /> {L.source}
                        </div>
                        <div
                          style={{
                            fontSize: 13.5,
                            lineHeight: 1.7,
                            color: "var(--text)",
                            borderInlineStart: `3px solid ${m.dot}`,
                            paddingInlineStart: 12,
                          }}
                        >
                          <mark
                            style={{
                              background: m.bg,
                              color: "var(--text)",
                              padding: "1px 2px",
                              borderRadius: 3,
                            }}
                          >
                            {lang === "ar" ? f.sa : f.se}
                          </mark>
                        </div>
                        <div
                          style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 10 }}
                        >
                          {L.confidence}:{" "}
                          <b style={{ color: m.dot }}>{confidenceWord(f.conf, lang)}</b>
                          {f.conf !== "high" &&
                            (lang === "ar"
                              ? " — يُنصح بتأكيد بشري."
                              : " — human confirmation recommended.")}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {free && c.facts.length > shownFacts.length && (
                <button
                  onClick={() => setUpgradeOpen(true)}
                  className="tap w-full flex items-start gap-2 mt-1 p-3 text-start"
                  style={{
                    background: "var(--accent-soft)",
                    border: "1px dashed var(--accent)",
                    borderRadius: 14,
                    color: "var(--accent)",
                  }}
                >
                  <Lock size={15} className="shrink-0" style={{ marginTop: 1 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.5 }}>
                    {L.extractProNote}
                  </span>
                </button>
              )}
            </>
          ) : (
            <DocumentView c={c} lang={lang} sourceNote={L.source} />
          )}

          {/* Destructive action lives at the foot of the panel, away from the
              everyday view controls. */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              onClick={() => {
                if (confirmDel) {
                  removeContract(c.id);
                  onClose();
                } else setConfirmDel(true);
              }}
              className="tap inline-flex items-center gap-1.5"
              title={L.deleteContract}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: confirmDel ? "var(--on-accent)" : "var(--low)",
                background: confirmDel ? "var(--low)" : "var(--low-bg)",
                border: `1px solid ${confirmDel ? "var(--low)" : "var(--border)"}`,
                borderRadius: 9,
                padding: "6px 11px",
                cursor: "pointer",
              }}
            >
              <Trash2 size={15} /> {confirmDel ? L.confirmDelete : L.deleteContract}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Per-contract playbook comparison — deviations from policy, or a clean bill. */
function PlaybookSummary({ c, lang }: { c: Contract; lang: Lang }) {
  const { L } = useApp();
  const { checks } = useSettings();
  const devs = playbookDeviations(c, checks);

  if (devs.length === 0) {
    return (
      <div
        className="flex items-center gap-2 mt-4 p-3"
        style={{
          background: "var(--high-bg)",
          borderRadius: 12,
          fontSize: 12.5,
          color: "var(--text)",
        }}
      >
        <ShieldCheck size={16} color="var(--high)" style={{ flexShrink: 0 }} />
        <b style={{ color: "var(--high)" }}>{L.playbookMet}</b>
      </div>
    );
  }

  return (
    <div
      className="mt-4 p-3"
      style={{
        background: "var(--med-bg)",
        borderRadius: 12,
        fontSize: 12.5,
        color: "var(--text)",
      }}
    >
      <div
        className="flex items-center gap-2 mb-1.5"
        style={{ fontWeight: 700, color: "var(--med)" }}
      >
        <ShieldAlert size={16} color="var(--med)" style={{ flexShrink: 0 }} />
        {L.playbookDev} · {devs.length}
      </div>
      <ul
        style={{
          margin: 0,
          paddingInlineStart: 20,
          display: "grid",
          gap: 4,
          lineHeight: 1.5,
        }}
      >
        {devs.map((d) => (
          <li key={d.key}>{deviationText(d, lang)}</li>
        ))}
      </ul>
    </div>
  );
}

function ViewTab({
  on,
  onClick,
  Icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  Icon: typeof FileText;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={on}
      className="tap flex items-center gap-1.5 px-3 py-1.5"
      style={{
        borderRadius: 8,
        fontSize: 12.5,
        fontWeight: 600,
        color: on ? "var(--text)" : "var(--text-soft)",
        background: on ? "var(--surface)" : "transparent",
        border: `1px solid ${on ? "var(--border)" : "transparent"}`,
      }}
    >
      <Icon size={14} color={on ? "var(--accent)" : "var(--text-soft)"} /> {label}
    </button>
  );
}

/** The actual-contract view: inline PDF, or full text with clauses highlighted. */
function DocumentView({
  c,
  lang,
  sourceNote,
}: {
  c: Contract;
  lang: Lang;
  sourceNote: string;
}) {
  const { L } = useApp();
  const { checks } = useSettings();
  const text = documentText(c, lang);
  const isReconstructed = !c.docText || c.docText.trim().length === 0;
  const nodes = useMemo(
    () => (c.docDataUrl ? [] : highlightClauses(text, c, lang)),
    [text, c, lang],
  );

  // Highlight-to-ask: selecting any clause in the text below offers an inline,
  // plain-language explanation (what it means, standard vs. your playbook, why
  // it matters). `sel` anchors the floating popover to the selection (viewport
  // coords → position:fixed); `exp` holds the computed explanation once asked.
  const bodyRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<{ text: string; x: number; y: number } | null>(
    null,
  );
  const [exp, setExp] = useState<ClauseExplanation | null>(null);

  const clearAsk = () => {
    setSel(null);
    setExp(null);
  };

  const onSelect = () => {
    const s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0) return;
    const range = s.getRangeAt(0);
    const body = bodyRef.current;
    if (!body || !body.contains(range.commonAncestorContainer)) return;
    const picked = s.toString().trim();
    if (picked.length < 6) return;
    const r = range.getBoundingClientRect();
    setSel({ text: picked, x: r.left + r.width / 2, y: r.bottom });
    setExp(null);
  };

  // Dismiss on outside click / Escape while the popover is open.
  useEffect(() => {
    if (!sel) return;
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) clearAsk();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && clearAsk();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [sel]);

  if (c.docDataUrl) {
    return (
      <div className="mt-3">
        <div
          className="flex items-center gap-1.5 mb-2"
          style={{ fontSize: 11.5, color: "var(--text-soft)", fontWeight: 600 }}
        >
          <FileText size={13} /> {c.docFileName ?? L.docUploaded}
        </div>
        <iframe
          src={c.docDataUrl}
          title={c.docFileName ?? "contract"}
          style={{
            width: "100%",
            height: "70vh",
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "#fff",
          }}
        />
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className="flex items-center gap-1.5 min-w-0"
          style={{ fontSize: 11.5, color: "var(--text-soft)", fontWeight: 600 }}
        >
          <FileText size={13} className="shrink-0" />{" "}
          <span className="truncate">
            {c.docFileName
              ? c.docFileName
              : isReconstructed
                ? L.docReconstructed
                : sourceNote}
          </span>
        </div>
        <div
          className="flex items-center gap-1 shrink-0"
          style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}
        >
          <Sparkles size={12} /> {L.askClauseHint}
        </div>
      </div>
      <div
        ref={bodyRef}
        onMouseUp={onSelect}
        className="scroll-slim"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 16,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 13.5,
          lineHeight: 1.85,
          color: "var(--text)",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {nodes}
      </div>

      {sel && (
        <ClauseAsk
          popRef={popRef}
          anchor={sel}
          lang={lang}
          exp={exp}
          onAsk={() => setExp(explainClause(sel.text, c, checks))}
          onClose={clearAsk}
        />
      )}
    </div>
  );
}

const VERDICT_META = {
  ok: { icon: ShieldCheck, color: "var(--low)" },
  flag: { icon: ShieldAlert, color: "var(--high)" },
  info: { icon: Info, color: "var(--text-soft)" },
} as const;

/**
 * Floating highlight-to-ask popover, anchored to the text selection. First a
 * compact "explain this clause" chip; on click it expands into the explanation
 * card (plain meaning · standard vs. playbook · why it matters).
 */
function ClauseAsk({
  popRef,
  anchor,
  lang,
  exp,
  onAsk,
  onClose,
}: {
  popRef: React.RefObject<HTMLDivElement | null>;
  anchor: { text: string; x: number; y: number };
  lang: Lang;
  exp: ClauseExplanation | null;
  onAsk: () => void;
  onClose: () => void;
}) {
  const { L } = useApp();
  const ar = lang === "ar";
  const width = exp ? 320 : 200;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  // Position by the popover's own left edge (centred on the selection, then
  // clamped fully inside the viewport). We deliberately avoid a translateX
  // centring transform: the `.rise` entrance animation animates `transform`
  // and would clobber it, spilling the card off-screen.
  const left = Math.max(10, Math.min(anchor.x - width / 2, vw - width - 10));
  const top = Math.max(10, Math.min(anchor.y + 8, vh - (exp ? 320 : 60)));

  if (typeof document === "undefined") return null;

  // Portal to <body> so the fixed position uses viewport coordinates — the
  // drawer's own transform would otherwise become the containing block.
  return createPortal(
    <div
      ref={popRef}
      dir={ar ? "rtl" : "ltr"}
      className="rise"
      style={{
        position: "fixed",
        left,
        top,
        width,
        zIndex: 9999,
      }}
    >
      {!exp ? (
        <button
          onClick={onAsk}
          className="tap flex items-center gap-1.5 w-full justify-center"
          style={{
            background: "var(--cta)",
            color: "var(--cta-ink)",
            border: "none",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 12.5,
            fontWeight: 700,
            boxShadow: "var(--shadow)",
          }}
        >
          <Sparkles size={14} /> {L.askClauseCta}
        </button>
      ) : (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "var(--shadow)",
            padding: 14,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles size={14} color="var(--accent)" className="shrink-0" />
              <span
                className="truncate"
                style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}
              >
                {ar ? exp.title.ar : exp.title.en}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="tap shrink-0 flex items-center justify-center"
              style={{ width: 22, height: 22, borderRadius: 6, color: "var(--text-soft)" }}
            >
              <X size={14} />
            </button>
          </div>

          <p
            style={{
              fontSize: 12.5,
              color: "var(--text)",
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            {ar ? exp.plain.ar : exp.plain.en}
          </p>

          <StandardRow exp={exp} ar={ar} standardLabel={L.askClauseStandard} />

          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: "var(--text-soft)",
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              {L.askClauseWhy}
            </div>
            <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.55, marginTop: 3 }}>
              {ar ? exp.why.ar : exp.why.en}
            </p>
          </div>

          {exp.matchedFact && (
            <div
              className="flex items-center gap-1.5"
              style={{
                marginTop: 10,
                paddingTop: 9,
                borderTop: "1px solid var(--border)",
                fontSize: 11,
                color: "var(--text-soft)",
              }}
            >
              <span
                className="shrink-0"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: CONF_META[exp.matchedFact.conf].dot,
                }}
              />
              {L.askClauseLinked} · {confidenceWord(exp.matchedFact.conf, lang)}
            </div>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}

function StandardRow({
  exp,
  ar,
  standardLabel,
}: {
  exp: ClauseExplanation;
  ar: boolean;
  standardLabel: string;
}) {
  const meta = VERDICT_META[exp.standard.verdict];
  const Icon = meta.icon;
  return (
    <div
      className="flex items-start gap-2"
      style={{
        marginTop: 10,
        background: `color-mix(in srgb, ${meta.color} 9%, transparent)`,
        borderRadius: 10,
        padding: "8px 10px",
      }}
    >
      <Icon size={15} color={meta.color} className="shrink-0" style={{ marginTop: 1 }} />
      <div className="min-w-0">
        <div style={{ fontSize: 10.5, fontWeight: 700, color: meta.color, textTransform: "uppercase", letterSpacing: 0.4 }}>
          {standardLabel}
        </div>
        <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5, marginTop: 2 }}>
          {ar ? exp.standard.ar : exp.standard.en}
        </p>
      </div>
    </div>
  );
}

/** Wrap each fact's source clause in a confidence-coloured highlight. */
function highlightClauses(
  text: string,
  c: Contract,
  lang: Lang,
): React.ReactNode[] {
  const clauses = c.facts
    .map((f) => ({ text: lang === "ar" ? f.sa : f.se, conf: f.conf }))
    .filter((cl) => cl.text && cl.text.length > 3 && cl.text !== "—");

  const marks: { start: number; end: number; conf: Confidence }[] = [];
  for (const cl of clauses) {
    const idx = text.indexOf(cl.text);
    if (idx >= 0) marks.push({ start: idx, end: idx + cl.text.length, conf: cl.conf });
  }
  marks.sort((a, b) => a.start - b.start);

  const clean: typeof marks = [];
  let lastEnd = -1;
  for (const m of marks) {
    if (m.start >= lastEnd) {
      clean.push(m);
      lastEnd = m.end;
    }
  }

  const nodes: React.ReactNode[] = [];
  let cur = 0;
  clean.forEach((m, i) => {
    if (m.start > cur) nodes.push(text.slice(cur, m.start));
    const meta = CONF_META[m.conf];
    nodes.push(
      <mark
        key={i}
        title={meta.label(lang)}
        style={{
          background: meta.bg,
          color: "var(--text)",
          borderRadius: 3,
          padding: "0 2px",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {text.slice(m.start, m.end)}
      </mark>,
    );
    cur = m.end;
  });
  if (cur < text.length) nodes.push(text.slice(cur));
  return nodes;
}
