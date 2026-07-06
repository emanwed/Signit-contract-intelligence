"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_CHECKS, type CheckId } from "@/lib/compliance";
import { DEFAULT_ALERT_PREFS, type AlertKind, type AlertPrefs } from "@/lib/alerts";
import type { Checks } from "@/lib/playbook";

export interface CompanyDoc {
  id: string;
  name: string;
  size: number;
  /** Whether this document is applied when reviewing contracts. */
  enabled: boolean;
  /** Inline preview content — data URL for PDFs, raw text for text files. */
  dataUrl?: string;
  text?: string;
}

/** Payload accepted when uploading company documents. */
export type CompanyDocInput = Pick<CompanyDoc, "name" | "size" | "dataUrl" | "text">;

/**
 * Starter company policy documents — one per team whose contracts get
 * reviewed against it (HR, IT, Procurement/Operations), so the "مستندات
 * سياسات الشركة" list isn't empty on first load. Seeded, not user-uploaded;
 * still fully editable (toggle on/off, delete) like any uploaded document.
 */
const SEED_COMPANY_DOCS: CompanyDoc[] = [
  {
    id: "seed-hr-policy",
    name: "سياسة مراجعة عقود الموارد البشرية والتوظيف.txt",
    size: 2150,
    enabled: true,
    text: [
      "سياسة مراجعة عقود الموارد البشرية والتوظيف",
      "",
      "١. النطاق",
      "تنطبق هذه السياسة على جميع عقود التوظيف وعقود مزوّدي خدمات التوظيف والاستقدام التي تبرمها المنشأة.",
      "",
      "٢. الشروط الإلزامية",
      "- يجب أن يتوافق كل عقد عمل مع نظام العمل السعودي ولوائحه التنفيذية، بما في ذلك مدة العقد والإجازات ومكافأة نهاية الخدمة.",
      "- تلتزم عقود التوظيف بمتطلبات السعودة (نطاقات) عند توريد قوى عاملة أو التعاقد مع مكاتب استقدام.",
      "- تُحدَّد بنود عدم المنافسة وسريتها بما لا يتجاوز اثني عشر شهرًا بعد انتهاء العقد، ما لم يوافق الفريق القانوني على خلاف ذلك.",
      "- تخضع معالجة بيانات الموظفين الشخصية لنظام حماية البيانات الشخصية (PDPL)، ويجب تحديد الأساس النظامي لجمعها ومكان تخزينها.",
      "",
      "٣. جهة المراجعة",
      "يراجع فريق الموارد البشرية بالتنسيق مع الفريق القانوني كل عقد قبل التوقيع، وتُصعَّد أي مخالفة لهذه السياسة إلى مدير الموارد البشرية.",
    ].join("\n"),
  },
  {
    id: "seed-it-policy",
    name: "سياسة مراجعة عقود تقنية المعلومات والسحابة.txt",
    size: 1980,
    enabled: true,
    text: [
      "سياسة مراجعة عقود تقنية المعلومات والسحابة",
      "",
      "١. النطاق",
      "تنطبق على عقود اشتراكات البرمجيات (SaaS) والاستضافة السحابية وخدمات الأمن السيبراني ومزوّدي الدعم التقني.",
      "",
      "٢. الشروط الإلزامية",
      "- يجب تحديد مكان استضافة البيانات صراحةً، وتفضيل مراكز البيانات داخل المملكة أو ما يعادلها من ضمانات النقل الآمن للبيانات.",
      "- تلتزم العقود بالضوابط الأساسية للأمن السيبراني الصادرة عن الهيئة الوطنية للأمن السيبراني.",
      "- يُشترط وجود بند لمستوى الخدمة (SLA) وغرامة واضحة عند الإخلال به، مع نافذة إشعار لا تقل عن ٣٠ يومًا لأي تجديد تلقائي.",
      "- تُراجَع بنود ملكية البيانات والحق في استرجاعها أو حذفها عند إنهاء العقد.",
      "",
      "٣. جهة المراجعة",
      "تراجع إدارة تقنية المعلومات هذه العقود بالتنسيق مع مسؤول أمن المعلومات قبل أي التزام مالي جديد.",
    ].join("\n"),
  },
  {
    id: "seed-procurement-policy",
    name: "سياسة مراجعة عقود المشتريات والعمليات.txt",
    size: 1760,
    enabled: true,
    text: [
      "سياسة مراجعة عقود المشتريات والعمليات",
      "",
      "١. النطاق",
      "تنطبق على أوامر الشراء واتفاقيات التوريد وعقود الخدمات اللوجستية والتشغيلية مع الموردين والمقاولين.",
      "",
      "٢. الشروط الإلزامية",
      "- لا يقل سقف المسؤولية عن مليون ريال، أو يُحدَّد بما يعادل قيمة العقد أيهما أعلى.",
      "- تُطبَّق غرامة تأخير واضحة النسبة على التسليم أو التوريد المتأخر.",
      "- تخضع العقود المبرمة مع جهات حكومية لمواءمة إضافية مع نظام المنافسات والمشتريات الحكومية.",
      "- تُشترط بنود مكافحة الرشوة والنزاهة وتعارض المصالح في جميع عقود الموردين والمقاولين.",
      "",
      "٣. جهة المراجعة",
      "تراجع إدارة المشتريات هذه العقود، وتُصعَّد أي انحراف عن هذه الشروط للفريق القانوني قبل الاعتماد النهائي.",
    ].join("\n"),
  },
];

interface SettingsContextValue {
  checks: Checks;
  toggleCheck: (id: CheckId) => void;
  companyDocs: CompanyDoc[];
  addCompanyDocs: (files: CompanyDocInput[]) => void;
  removeCompanyDoc: (id: string) => void;
  toggleCompanyDoc: (id: string) => void;
  /** On/off for email notifications only (in-app alerts are unaffected). */
  emailNotifications: boolean;
  toggleEmailNotifications: () => void;
  /** Which reminder/alert categories the user still wants (in-app feed). */
  alertPrefs: AlertPrefs;
  toggleAlertPref: (kind: AlertKind) => void;
  /** Restore default checks, seed docs and notification prefs (demo reset). */
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Holds the product's review configuration in memory: which compliance/playbook
 * checks are enabled, and the company's own playbook documents that contracts
 * are reviewed against. Not persisted (matches the demo's in-memory approach).
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [checks, setChecks] = useState<Checks>({ ...DEFAULT_CHECKS });
  const [companyDocs, setCompanyDocs] = useState<CompanyDoc[]>(SEED_COMPANY_DOCS);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [alertPrefs, setAlertPrefs] = useState<AlertPrefs>({
    ...DEFAULT_ALERT_PREFS,
  });

  const toggleEmailNotifications = useCallback(
    () => setEmailNotifications((v) => !v),
    [],
  );

  const toggleAlertPref = useCallback((kind: AlertKind) => {
    setAlertPrefs((prev) => ({ ...prev, [kind]: !prev[kind] }));
  }, []);

  const toggleCheck = useCallback((id: CheckId) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const addCompanyDocs = useCallback((files: CompanyDocInput[]) => {
    setCompanyDocs((prev) => [
      ...files.map((f) => ({
        ...f,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        enabled: true,
      })),
      ...prev,
    ]);
  }, []);

  const removeCompanyDoc = useCallback((id: string) => {
    setCompanyDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleCompanyDoc = useCallback((id: string) => {
    setCompanyDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)),
    );
  }, []);

  const resetSettings = useCallback(() => {
    setChecks({ ...DEFAULT_CHECKS });
    setCompanyDocs(SEED_COMPANY_DOCS);
    setEmailNotifications(true);
    setAlertPrefs({ ...DEFAULT_ALERT_PREFS });
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      checks,
      toggleCheck,
      companyDocs,
      addCompanyDocs,
      removeCompanyDoc,
      toggleCompanyDoc,
      emailNotifications,
      toggleEmailNotifications,
      alertPrefs,
      toggleAlertPref,
      resetSettings,
    }),
    [
      checks,
      toggleCheck,
      companyDocs,
      addCompanyDocs,
      removeCompanyDoc,
      toggleCompanyDoc,
      emailNotifications,
      toggleEmailNotifications,
      alertPrefs,
      toggleAlertPref,
      resetSettings,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
