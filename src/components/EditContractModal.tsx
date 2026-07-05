"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { daysUntil } from "@/lib/format";
import type { Contract, ContractType, Risk } from "@/lib/types";

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

/** Edit an existing contract's details — writes back via updateContract. */
export function EditContractModal({
  c,
  onClose,
}: {
  c: Contract;
  onClose: () => void;
}) {
  const { L, lang } = useApp();
  const { updateContract } = useContracts();
  const A = L.add;

  const [titleAr, setTitleAr] = useState(c.title_ar);
  const [titleEn, setTitleEn] = useState(c.title_en);
  const [partyAr, setPartyAr] = useState(c.party_ar);
  const [partyEn, setPartyEn] = useState(c.party_en);
  const [type, setType] = useState<ContractType>(c.type);
  const [value, setValue] = useState(String(c.valueSAR || ""));
  const [endGreg, setEndGreg] = useState(c.endGreg === "—" ? "" : c.endGreg);
  const [autoRenew, setAutoRenew] = useState(c.autoRenew);
  const [noticeDays, setNoticeDays] = useState(String(c.noticeDays));
  const [risk, setRisk] = useState<Risk>(c.risk);

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

  const save = () => {
    updateContract(c.id, {
      title_ar: titleAr.trim() || c.title_ar,
      title_en: titleEn.trim() || c.title_en,
      party_ar: partyAr.trim() || c.party_ar,
      party_en: partyEn.trim() || c.party_en,
      type,
      valueSAR: Number(value) || 0,
      endGreg: endGreg || "—",
      daysToRenew: endGreg ? daysUntil(endGreg) : c.daysToRenew,
      autoRenew,
      noticeDays: Number(noticeDays) || 0,
      risk,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise relative scroll-slim"
        style={{
          width: "min(520px,100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          className="flex items-center justify-between gap-2 px-5 py-4 sticky top-0"
          style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>
            {L.editContract} · {c.id}
          </div>
          <button
            onClick={onClose}
            aria-label={A.cancel}
            className="tap flex items-center justify-center shrink-0"
            style={{ width: 30, height: 30, borderRadius: 8, color: "var(--text-soft)" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={`${A.fTitle} · AR`}>
              <input style={inputStyle} value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" />
            </Field>
            <Field label={`${A.fTitle} · EN`}>
              <input style={inputStyle} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} dir="ltr" />
            </Field>
            <Field label={`${A.fParty} · AR`}>
              <input style={inputStyle} value={partyAr} onChange={(e) => setPartyAr(e.target.value)} dir="rtl" />
            </Field>
            <Field label={`${A.fParty} · EN`}>
              <input style={inputStyle} value={partyEn} onChange={(e) => setPartyEn(e.target.value)} dir="ltr" />
            </Field>
            <Field label={A.fType}>
              <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value as ContractType)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {L.types[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={A.fValue}>
              <input style={inputStyle} type="number" inputMode="numeric" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
            <Field label={A.fEnd}>
              <input style={inputStyle} type="date" value={endGreg} onChange={(e) => setEndGreg(e.target.value)} />
            </Field>
            <Field label={A.fNotice}>
              <input style={inputStyle} type="number" inputMode="numeric" min={0} value={noticeDays} onChange={(e) => setNoticeDays(e.target.value)} />
            </Field>
            <Field label={A.fRisk}>
              <select style={inputStyle} value={risk} onChange={(e) => setRisk(e.target.value as Risk)}>
                {RISKS.map((r) => (
                  <option key={r} value={r}>
                    {r === "high" ? L.high : r === "medium" ? L.medium : L.low}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={A.fAutoRenew}>
              <label
                className="flex items-center gap-2"
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                />
                <span style={{ fontSize: 13 }}>
                  {lang === "ar"
                    ? autoRenew
                      ? "نعم"
                      : "لا"
                    : autoRenew
                      ? "Yes"
                      : "No"}
                </span>
              </label>
            </Field>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={save}
              className="tap flex-1 flex items-center justify-center gap-2 py-2.5"
              style={{
                background: "var(--grad-primary)",
                color: "var(--on-accent)",
                border: "none",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              <Save size={16} /> {L.saveChanges}
            </button>
            <button
              onClick={onClose}
              className="tap shrink-0 py-2.5 px-4"
              style={{
                background: "var(--surface)",
                color: "var(--text-soft)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {A.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block"
        style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4 }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
