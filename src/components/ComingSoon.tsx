"use client";

import {
  Building2,
  Database,
  HardDrive,
  MessageSquare,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

type Feature = {
  icon: LucideIcon;
  name_ar: string;
  name_en: string;
  /** The business need — short, Arabic-first. */
  why_ar: string;
  why_en: string;
};

// Roadmap features from the product document — teasers to keep interest warm.
const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    name_ar: "تنبيهات فورية عبر Slack و Teams",
    name_en: "Real-time Slack & Teams alerts",
    why_ar: "يصل التنبيه لصاحب المهمة في مكان عمله فورًا، فتقلّ المواعيد الفائتة.",
    why_en: "Alerts reach the owner where they already work, so fewer deadlines slip.",
  },
  {
    icon: HardDrive,
    name_ar: "مزامنة Google Drive و SharePoint",
    name_en: "Google Drive & SharePoint sync",
    why_ar: "تُجلب العقود تلقائيًا دون رفع يدوي، فيوفّر الفريق وقته.",
    why_en: "Contracts flow in automatically — no manual uploads, less busywork.",
  },
  {
    icon: Database,
    name_ar: "تكامل مع أنظمة ERP والمالية",
    name_en: "ERP & finance integration",
    why_ar: "تُربَط الالتزامات المالية مباشرة بأنظمة المحاسبة، فتقلّ الأخطاء اليدوية.",
    why_en: "Wires financial obligations into your accounting systems, cutting manual errors.",
  },
  {
    icon: TrendingUp,
    name_ar: "التنبؤ الاستباقي بمخاطر العقود",
    name_en: "Predictive contract-risk alerts",
    why_ar: "يتوقّع النظام العقود المعرّضة للتعثّر قبل وقوعه، فتتصرّف مبكرًا.",
    why_en: "Flags contracts likely to slip before they do, so you act early.",
  },
  {
    icon: Building2,
    name_ar: "لوحة الكيانات المتعددة",
    name_en: "Multi-entity dashboard",
    why_ar: "رؤية موحّدة لعقود كل الشركات التابعة تحت مظلة واحدة.",
    why_en: "One unified view across every subsidiary's contracts.",
  },
];

/** Roadmap teasers — upcoming features with a "Soon" badge to keep interest warm. */
export function ComingSoon() {
  const { lang, L } = useApp();

  return (
    <div className="max-w-[760px] mx-auto">
      <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.7 }}>
        {L.soonIntro}
      </p>

      <div className="flex flex-col gap-2.5 mt-4">
        {FEATURES.map((f) => (
          <div
            key={f.name_en}
            className="flex items-start gap-3 p-3.5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "var(--shadow)",
            }}
          >
            <span
              className="flex items-center justify-center shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "var(--accent-soft)",
              }}
            >
              <f.icon size={19} color="var(--accent)" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  {lang === "ar" ? f.name_ar : f.name_en}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    color: "var(--cta-ink)",
                    background: "var(--cta)",
                    borderRadius: 999,
                    padding: "2px 8px",
                  }}
                >
                  {L.soonBadge}
                </span>
              </div>
              <div
                style={{ fontSize: 12.5, color: "var(--text-soft)", lineHeight: 1.6, marginTop: 3 }}
              >
                {lang === "ar" ? f.why_ar : f.why_en}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-2 mt-4 p-3"
        style={{ background: "var(--accent-soft)", borderRadius: 12, fontSize: 12.5, color: "var(--text)" }}
      >
        <span>{L.soonFootnote}</span>
      </div>
    </div>
  );
}
