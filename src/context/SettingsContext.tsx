"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_CHECKS, type CheckId } from "@/lib/compliance";
import { DEFAULT_ALERT_PREFS, type AlertKind, type AlertPrefs } from "@/lib/alerts";
import type { Checks } from "@/lib/playbook";

export interface CompanyDoc {
  id: string;
  name: string;
  size: number;
}

interface SettingsContextValue {
  checks: Checks;
  toggleCheck: (id: CheckId) => void;
  companyDocs: CompanyDoc[];
  addCompanyDocs: (files: { name: string; size: number }[]) => void;
  removeCompanyDoc: (id: string) => void;
  /** On/off for email notifications only (in-app alerts are unaffected). */
  emailNotifications: boolean;
  toggleEmailNotifications: () => void;
  /** Which reminder/alert categories the user still wants (in-app feed). */
  alertPrefs: AlertPrefs;
  toggleAlertPref: (kind: AlertKind) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Holds the product's review configuration in memory: which compliance/playbook
 * checks are enabled, and the company's own playbook documents that contracts
 * are reviewed against. Not persisted (matches the demo's in-memory approach).
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [checks, setChecks] = useState<Checks>({ ...DEFAULT_CHECKS });
  const [companyDocs, setCompanyDocs] = useState<CompanyDoc[]>([]);

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

  const addCompanyDocs = useCallback(
    (files: { name: string; size: number }[]) => {
      setCompanyDocs((prev) => [
        ...files.map((f) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: f.name,
          size: f.size,
        })),
        ...prev,
      ]);
    },
    [],
  );

  const removeCompanyDoc = useCallback((id: string) => {
    setCompanyDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      checks,
      toggleCheck,
      companyDocs,
      addCompanyDocs,
      removeCompanyDoc,
      emailNotifications,
      toggleEmailNotifications,
      alertPrefs,
      toggleAlertPref,
    }),
    [
      checks,
      toggleCheck,
      companyDocs,
      addCompanyDocs,
      removeCompanyDoc,
      emailNotifications,
      toggleEmailNotifications,
      alertPrefs,
      toggleAlertPref,
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
