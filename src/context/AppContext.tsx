"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { T, type Dict } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import type { Plan } from "@/lib/plan";

interface AppContextValue {
  lang: Lang;
  L: Dict;
  dir: "rtl" | "ltr";
  dark: boolean;
  toggleLang: () => void;
  toggleTheme: () => void;
  /** Subscription tier — gates Free-vs-Pro features (prototype demo switch). */
  plan: Plan;
  setPlan: (p: Plan) => void;
  /** Whether the plan-comparison / upgrade modal is open. */
  upgradeOpen: boolean;
  setUpgradeOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/**
 * Holds the two global UI axes — language (Arabic RTL ⇄ English LTR) and theme
 * (dark ⇄ light) — and mirrors them onto <html> as `dir` / `lang` / `data-theme`
 * so RTL layout mirroring and instant CSS-variable theme switching are real,
 * not CSS tricks. State lives in memory only (no persistence), per the brief.
 *
 * Defaults (Arabic + light) match the attributes hard-coded on <html> in the
 * root layout, so there is no hydration mismatch on first paint.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const [dark, setDark] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-theme", dark ? "dark" : "light");
    el.setAttribute("dir", T[lang].dir);
    el.setAttribute("lang", lang);
  }, [dark, lang]);

  const toggleLang = useCallback(
    () => setLang((l) => (l === "ar" ? "en" : "ar")),
    [],
  );
  const toggleTheme = useCallback(() => setDark((d) => !d), []);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      L: T[lang],
      dir: T[lang].dir,
      dark,
      toggleLang,
      toggleTheme,
      plan,
      setPlan,
      upgradeOpen,
      setUpgradeOpen,
    }),
    [lang, dark, toggleLang, toggleTheme, plan, upgradeOpen],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
