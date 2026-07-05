"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CONTRACTS } from "@/data/contracts";
import type { Contract } from "@/lib/types";

interface ContractsContextValue {
  /** The live portfolio (everything shown across the app). */
  contracts: Contract[];
  /** Deleted contracts — kept in a trash bin, never lost. */
  deletedContracts: Contract[];
  /** Archived contracts — moved out of the trash for long-term keeping. */
  archivedContracts: Contract[];
  /** Prepend a newly-added contract so it shows first across every view. */
  addContract: (c: Contract) => void;
  /** Update fields on an existing live contract. */
  updateContract: (id: string, patch: Partial<Contract>) => void;
  /** Delete → moves the contract to the trash (recoverable). */
  removeContract: (id: string) => void;
  /** Restore a trashed or archived contract back to the live portfolio. */
  restoreContract: (id: string) => void;
  /** Archive a trashed contract — removes it from the trash, keeps it in the archive. */
  archiveContract: (id: string) => void;
  /** Generate a unique C-#### id for a new contract. */
  nextId: () => string;
}

const ContractsContext = createContext<ContractsContextValue | null>(null);

const seed: Contract[] = CONTRACTS.map((c) => ({ ...c, source: "seed" }));

/**
 * Holds the live portfolio in memory (seeded from the sample data), plus a
 * trash bin and an archive so a deleted contract is never truly lost — the user
 * can restore it, or archive it out of the way. State is not persisted; a
 * refresh returns to the seed set, matching the demo's in-memory approach.
 */
export function ContractsProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>(seed);
  const [deletedContracts, setDeleted] = useState<Contract[]>([]);
  const [archivedContracts, setArchived] = useState<Contract[]>([]);

  const addContract = useCallback((c: Contract) => {
    setContracts((prev) => [{ ...c, source: "added" }, ...prev]);
  }, []);

  const updateContract = useCallback((id: string, patch: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }, []);

  // Delete never destroys — it moves the contract into the trash bin.
  const removeContract = useCallback(
    (id: string) => {
      const c = contracts.find((x) => x.id === id);
      if (!c) return;
      setContracts((cur) => cur.filter((x) => x.id !== id));
      setDeleted((d) => [c, ...d.filter((x) => x.id !== id)]);
    },
    [contracts],
  );

  const restoreContract = useCallback(
    (id: string) => {
      const c =
        deletedContracts.find((x) => x.id === id) ??
        archivedContracts.find((x) => x.id === id);
      if (!c) return;
      setDeleted((d) => d.filter((x) => x.id !== id));
      setArchived((a) => a.filter((x) => x.id !== id));
      setContracts((cur) => [c, ...cur.filter((x) => x.id !== id)]);
    },
    [deletedContracts, archivedContracts],
  );

  const archiveContract = useCallback(
    (id: string) => {
      const c = deletedContracts.find((x) => x.id === id);
      if (!c) return;
      setDeleted((d) => d.filter((x) => x.id !== id));
      setArchived((a) => [c, ...a.filter((x) => x.id !== id)]);
    },
    [deletedContracts],
  );

  const nextId = useCallback(() => {
    const used = new Set(
      [...contracts, ...deletedContracts, ...archivedContracts].map((c) => c.id),
    );
    let id = "";
    do {
      id = `C-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (used.has(id));
    return id;
  }, [contracts, deletedContracts, archivedContracts]);

  const value = useMemo<ContractsContextValue>(
    () => ({
      contracts,
      deletedContracts,
      archivedContracts,
      addContract,
      updateContract,
      removeContract,
      restoreContract,
      archiveContract,
      nextId,
    }),
    [
      contracts,
      deletedContracts,
      archivedContracts,
      addContract,
      updateContract,
      removeContract,
      restoreContract,
      archiveContract,
      nextId,
    ],
  );

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
}

export function useContracts(): ContractsContextValue {
  const ctx = useContext(ContractsContext);
  if (!ctx)
    throw new Error("useContracts must be used within <ContractsProvider>");
  return ctx;
}
