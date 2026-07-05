"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Sparkles,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { daysUntil, fmtSAR } from "@/lib/format";
import type {
  Confidence,
  Contract,
  ContractType,
  ExtractResult,
  Fact,
  Risk,
} from "@/lib/types";

const TYPES: ContractType[] = [
  "nda",
  "msa",
  "sow",
  "lease",
  "employment",
  "po",
  "licence",
];
const RISKS: Risk[] = ["low", "medium", "high"];
const FACT_KEYS = new Set([
  "value",
  "renewal",
  "liability",
  "penalty",
  "law",
  "term",
  "pdpl",
  "counterparty",
  "type",
]);
const CONFS = new Set<Confidence>(["high", "medium", "low"]);

interface PdfAttachment {
  base64: string;
  dataUrl: string;
  name: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "9px 11px",
  color: "var(--text)",
  fontSize: 13.5,
  fontFamily: "inherit",
};

/** Sanitise the model's facts into well-formed Fact objects. */
function sanitizeFacts(raw: unknown): Fact[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f): Fact | null => {
      if (typeof f !== "object" || f === null) return null;
      const o = f as Record<string, unknown>;
      const k = typeof o.k === "string" && FACT_KEYS.has(o.k) ? o.k : "term";
      const conf =
        typeof o.conf === "string" && CONFS.has(o.conf as Confidence)
          ? (o.conf as Confidence)
          : "medium";
      const s = (v: unknown) => (typeof v === "string" ? v : "—");
      return {
        k: k as Fact["k"],
        conf,
        va: s(o.va),
        ve: s(o.ve),
        sa: s(o.sa),
        se: s(o.se),
      };
    })
    .filter((f): f is Fact => f !== null)
    .slice(0, 6);
}

export function AddContractModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (c: Contract) => void;
}) {
  const { lang, L } = useApp();
  const A = L.add;
  const { addContract, nextId } = useContracts();
  const fileRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [pdf, setPdf] = useState<PdfAttachment | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [note, setNote] = useState<null | "aiFilled" | "aiFailed">(null);

  // Review fields
  const [title, setTitle] = useState("");
  const [party, setParty] = useState("");
  const [type, setType] = useState<ContractType | "">("");
  const [value, setValue] = useState("");
  const [endGreg, setEndGreg] = useState("");
  const [noticeDays, setNoticeDays] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [risk, setRisk] = useState<Risk>("medium");
  const [facts, setFacts] = useState<Fact[]>([]);
  const [aiExtras, setAiExtras] = useState<{
    endHijri?: string;
    anomaly_ar?: string | null;
    anomaly_en?: string | null;
    typeConfidence?: number;
  }>({});
  const [err, setErr] = useState<string | null>(null);

  const reset = () => {
    setText("");
    setPdf(null);
    setAnalyzing(false);
    setNote(null);
    setTitle("");
    setParty("");
    setType("");
    setValue("");
    setEndGreg("");
    setNoticeDays("");
    setAutoRenew(false);
    setRisk("medium");
    setFacts([]);
    setAiExtras({});
    setErr(null);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const close = () => {
    reset();
    onClose();
  };

  const onFile = (file: File) => {
    setNote(null);
    const reader = new FileReader();
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setPdf({ base64: dataUrl.split(",")[1] ?? "", dataUrl, name: file.name });
        setText("");
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        setText(String(reader.result));
        setPdf(null);
      };
      reader.readAsText(file);
    }
  };

  const applyExtraction = (data: ExtractResult) => {
    const pick = (ar?: string, en?: string) =>
      (lang === "ar" ? ar || en : en || ar) ?? "";
    if (data.title_ar || data.title_en)
      setTitle(pick(data.title_ar, data.title_en));
    if (data.party_ar || data.party_en)
      setParty(pick(data.party_ar, data.party_en));
    if (data.type && TYPES.includes(data.type)) setType(data.type);
    if (typeof data.valueSAR === "number") setValue(String(data.valueSAR));
    if (data.endGreg) setEndGreg(data.endGreg);
    if (typeof data.noticeDays === "number")
      setNoticeDays(String(data.noticeDays));
    if (typeof data.autoRenew === "boolean") setAutoRenew(data.autoRenew);
    if (data.risk && RISKS.includes(data.risk)) setRisk(data.risk);
    setFacts(sanitizeFacts(data.facts));
    setAiExtras({
      endHijri: data.endHijri,
      anomaly_ar: data.anomaly_ar ?? null,
      anomaly_en: data.anomaly_en ?? null,
      typeConfidence:
        typeof data.typeConfidence === "number"
          ? data.typeConfidence
          : undefined,
    });
  };

  const analyze = async () => {
    if (!pdf && !text.trim()) return;
    setAnalyzing(true);
    setNote(null);
    try {
      const r = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          pdf
            ? { pdfBase64: pdf.base64, fileName: pdf.name }
            : { text: text.trim() },
        ),
      });
      const json = await r.json();
      if (json?.ok && json.data) {
        applyExtraction(json.data as ExtractResult);
        setNote("aiFilled");
      } else {
        setNote("aiFailed");
      }
    } catch {
      setNote("aiFailed");
    } finally {
      setAnalyzing(false);
    }
  };

  const save = () => {
    if (!title.trim()) {
      setErr(A.needTitle);
      return;
    }
    const v = Number(value) || 0;
    const t = title.trim();
    const p = party.trim();
    const finalFacts: Fact[] =
      facts.length > 0
        ? facts
        : v > 0
          ? [
              {
                k: "value",
                conf: "high",
                va: `${fmtSAR(v)} ر.س`,
                ve: `SAR ${fmtSAR(v)}`,
                sa: text.trim() ? "«القيمة كما وردت في المستند»." : "—",
                se: text.trim() ? '"Value as stated in the document."' : "—",
              },
            ]
          : [];

    const contract: Contract = {
      id: nextId(),
      type: type || "msa",
      typeConfidence: aiExtras.typeConfidence,
      lang: lang === "ar" ? "ar" : "en",
      risk,
      title_ar: t,
      title_en: t,
      party_ar: p || (lang === "ar" ? "غير محدّد" : "Not specified"),
      party_en: p || (lang === "ar" ? "غير محدّد" : "Not specified"),
      valueSAR: v,
      startGreg: new Date().toISOString().slice(0, 10),
      endGreg: endGreg || "—",
      endHijri: aiExtras.endHijri || "—",
      autoRenew,
      noticeDays: Number(noticeDays) || 0,
      daysToRenew: endGreg ? daysUntil(endGreg) : 9999,
      facts: finalFacts,
      anomaly_ar: aiExtras.anomaly_ar ?? null,
      anomaly_en: aiExtras.anomaly_en ?? null,
      source: "added",
      docText: pdf ? undefined : text.trim() || undefined,
      docFileName: pdf?.name,
      docDataUrl: pdf?.dataUrl,
    };

    addContract(contract);
    const added = contract;
    reset();
    onAdded(added);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={A.title}
    >
      <div
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        className="rise scroll-slim"
        style={{
          position: "relative",
          width: "min(640px,100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          boxShadow: "var(--shadow)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 px-5 py-4 sticky top-0 z-[2]"
          style={{
            background: "color-mix(in srgb, var(--bg) 95%, transparent)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{A.title}</div>
            <div
              style={{ fontSize: 12.5, color: "var(--text-soft)", marginTop: 2 }}
            >
              {A.subtitle}
            </div>
          </div>
          <button
            onClick={close}
            aria-label={A.cancel}
            className="tap shrink-0"
            style={{
              background: "var(--surface-alt)",
              border: "none",
              borderRadius: 9,
              padding: 7,
              color: "var(--text-soft)",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">
          {/* Ingestion */}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />

          {pdf ? (
            <div
              className="flex items-center gap-2 p-3"
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                background: "var(--surface)",
              }}
            >
              <FileText size={18} color="var(--accent)" className="shrink-0" />
              <span className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>
                {pdf.name}
              </span>
              <span style={{ fontSize: 11.5, color: "var(--text-soft)" }}>
                · {A.attached}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => setPdf(null)}
                aria-label={A.cancel}
                className="tap shrink-0"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-soft)",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="tap w-full flex items-center justify-center gap-2 py-3"
                style={{
                  border: "1px dashed var(--border)",
                  borderRadius: 12,
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                <Upload size={16} color="var(--accent)" /> {A.upload}
                <span style={{ fontSize: 11.5, color: "var(--text-soft)" }}>
                  ({A.uploadHint})
                </span>
              </button>

              <div
                className="flex items-center gap-3 my-3"
                style={{ color: "var(--text-soft)", fontSize: 12 }}
              >
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                {A.orPaste}
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={A.placeholder}
                rows={5}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </>
          )}

          <button
            onClick={analyze}
            disabled={analyzing || (!pdf && !text.trim())}
            className="tap w-full flex items-center justify-center gap-2 mt-3 py-2.5"
            style={{
              background: "var(--grad-primary)",
              color: "var(--on-accent)",
              border: "none",
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 700,
              opacity: analyzing || (!pdf && !text.trim()) ? 0.55 : 1,
            }}
          >
            <Sparkles size={16} /> {analyzing ? A.analyzing : A.analyze}
          </button>

          {note && (
            <div
              className="rise flex items-start gap-2 mt-3 p-2.5"
              style={{
                background: note === "aiFilled" ? "var(--high-bg)" : "var(--med-bg)",
                color: note === "aiFilled" ? "var(--high)" : "var(--med)",
                borderRadius: 10,
                fontSize: 12.5,
              }}
            >
              <Sparkles size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{note === "aiFilled" ? A.aiFilled : A.aiFailed}</span>
            </div>
          )}

          {/* Review & confirm */}
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--text-soft)",
              margin: "20px 0 10px",
            }}
          >
            {A.review}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={A.fTitle} className="sm:col-span-2">
              <input
                style={inputStyle}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (err) setErr(null);
                }}
              />
            </Field>
            <Field label={A.fParty} className="sm:col-span-2">
              <input
                style={inputStyle}
                value={party}
                onChange={(e) => setParty(e.target.value)}
              />
            </Field>
            <Field label={A.fType}>
              <select
                style={inputStyle}
                value={type}
                onChange={(e) => setType(e.target.value as ContractType | "")}
              >
                <option value="" disabled>
                  {A.selectType}
                </option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {L.types[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={A.fValue}>
              <input
                style={inputStyle}
                type="number"
                inputMode="numeric"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </Field>
            <Field label={A.fEnd}>
              <input
                style={inputStyle}
                type="date"
                value={endGreg === "—" ? "" : endGreg}
                onChange={(e) => setEndGreg(e.target.value)}
              />
            </Field>
            <Field label={A.fNotice}>
              <input
                style={inputStyle}
                type="number"
                inputMode="numeric"
                min={0}
                value={noticeDays}
                onChange={(e) => setNoticeDays(e.target.value)}
              />
            </Field>
            <Field label={A.fRisk}>
              <select
                style={inputStyle}
                value={risk}
                onChange={(e) => setRisk(e.target.value as Risk)}
              >
                {RISKS.map((r) => (
                  <option key={r} value={r}>
                    {r === "high" ? L.high : r === "medium" ? L.medium : L.low}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={A.fAutoRenew}>
              <button
                type="button"
                onClick={() => setAutoRenew((a) => !a)}
                aria-pressed={autoRenew}
                className="tap w-full flex items-center gap-2"
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                  textAlign: "start",
                  fontWeight: 600,
                  color: autoRenew ? "var(--accent)" : "var(--text-soft)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 34,
                    height: 20,
                    borderRadius: 20,
                    background: autoRenew ? "var(--accent)" : "var(--surface-alt)",
                    position: "relative",
                    transition: "background .2s",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      insetInlineStart: autoRenew ? 16 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: 16,
                      background: "#fff",
                      transition: "inset-inline-start .2s",
                    }}
                  />
                </span>
                {autoRenew
                  ? lang === "ar"
                    ? "نعم"
                    : "Yes"
                  : lang === "ar"
                    ? "لا"
                    : "No"}
              </button>
            </Field>
          </div>

          {facts.length > 0 && (
            <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 10 }}>
              {facts.length} {lang === "ar" ? "بند مُستخرج" : "extracted clauses"} ·{" "}
              {lang === "ar"
                ? "ستظهر في تفاصيل العقد"
                : "will appear in the contract details"}
            </div>
          )}

          {err && (
            <div style={{ color: "var(--low)", fontSize: 12.5, marginTop: 10 }}>
              {err}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              onClick={close}
              className="tap px-4 py-2"
              style={{
                background: "transparent",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {A.cancel}
            </button>
            <button
              onClick={save}
              className="tap px-4 py-2"
              style={{
                background: "var(--grad-primary)",
                color: "var(--on-accent)",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {A.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
  Icon?: LucideIcon;
}) {
  return (
    <label className={className} style={{ display: "block" }}>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--text-soft)",
          fontWeight: 600,
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}
