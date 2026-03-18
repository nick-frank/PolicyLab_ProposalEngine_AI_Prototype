"use client";

import { useState, useCallback, useEffect } from "react";
import type { ClaimSet, CostAllocationEntry } from "@/lib/types";

const STORAGE_KEY = "claims-search-claim-sets";

function generateId() {
  return `set-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadSets(): ClaimSet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSets(sets: ClaimSet[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch {
    // localStorage full or unavailable
  }
}

export function useClaimSets() {
  const [claimSets, setClaimSets] = useState<ClaimSet[]>(loadSets);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [pendingClaimIds, setPendingClaimIds] = useState<Set<string>>(new Set());

  // Persist whenever sets change
  useEffect(() => {
    saveSets(claimSets);
  }, [claimSets]);

  // --- pending selection ---
  const togglePendingClaim = useCallback((id: string) => {
    setPendingClaimIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearPending = useCallback(() => {
    setPendingClaimIds(new Set());
  }, []);

  // --- set CRUD ---
  const createSet = useCallback(
    (name: string, claimIds: string[]) => {
      const newSet: ClaimSet = {
        id: generateId(),
        name,
        createdAt: new Date().toISOString(),
        claimIds,
        allocations: [],
      };
      setClaimSets((prev) => [...prev, newSet]);
      setActiveSetId(newSet.id);
      clearPending();
      return newSet.id;
    },
    [clearPending]
  );

  const deleteSet = useCallback(
    (id: string) => {
      setClaimSets((prev) => prev.filter((s) => s.id !== id));
      if (activeSetId === id) setActiveSetId(null);
    },
    [activeSetId]
  );

  const renameSet = useCallback((id: string, name: string) => {
    setClaimSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  }, []);

  // --- claims within sets ---
  const addClaimsToSet = useCallback(
    (setId: string, claimIds: string[]) => {
      setClaimSets((prev) =>
        prev.map((s) => {
          if (s.id !== setId) return s;
          const existing = new Set(s.claimIds);
          const merged = [...s.claimIds, ...claimIds.filter((id) => !existing.has(id))];
          return { ...s, claimIds: merged };
        })
      );
      clearPending();
    },
    [clearPending]
  );

  const removeClaimFromSet = useCallback((setId: string, claimId: string) => {
    setClaimSets((prev) =>
      prev.map((s) =>
        s.id === setId
          ? { ...s, claimIds: s.claimIds.filter((c) => c !== claimId) }
          : s
      )
    );
  }, []);

  // --- allocations ---
  const addAllocation = useCallback(
    (setId: string, formNumber: string, formName: string) => {
      setClaimSets((prev) =>
        prev.map((s) => {
          if (s.id !== setId) return s;
          if (s.allocations.some((a) => a.formNumber === formNumber)) return s;
          const entry: CostAllocationEntry = { formNumber, formName, percentage: 0 };
          return { ...s, allocations: [...s.allocations, entry] };
        })
      );
    },
    []
  );

  const removeAllocation = useCallback((setId: string, formNumber: string) => {
    setClaimSets((prev) =>
      prev.map((s) =>
        s.id === setId
          ? { ...s, allocations: s.allocations.filter((a) => a.formNumber !== formNumber) }
          : s
      )
    );
  }, []);

  const updateAllocationPercentage = useCallback(
    (setId: string, formNumber: string, pct: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(pct)));
      setClaimSets((prev) =>
        prev.map((s) =>
          s.id === setId
            ? {
                ...s,
                allocations: s.allocations.map((a) =>
                  a.formNumber === formNumber ? { ...a, percentage: clamped } : a
                ),
              }
            : s
        )
      );
    },
    []
  );

  const distributeEvenly = useCallback((setId: string) => {
    setClaimSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId || s.allocations.length === 0) return s;
        const n = s.allocations.length;
        const base = Math.floor(100 / n);
        const remainder = 100 - base * n;
        return {
          ...s,
          allocations: s.allocations.map((a, i) => ({
            ...a,
            percentage: base + (i < remainder ? 1 : 0),
          })),
        };
      })
    );
  }, []);

  const fillRemaining = useCallback((setId: string, formNumber: string) => {
    setClaimSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        const othersSum = s.allocations
          .filter((a) => a.formNumber !== formNumber)
          .reduce((acc, a) => acc + a.percentage, 0);
        const remaining = Math.max(0, 100 - othersSum);
        return {
          ...s,
          allocations: s.allocations.map((a) =>
            a.formNumber === formNumber ? { ...a, percentage: remaining } : a
          ),
        };
      })
    );
  }, []);

  const activeSet = claimSets.find((s) => s.id === activeSetId) ?? null;

  return {
    claimSets,
    activeSetId,
    activeSet,
    setActiveSetId,
    pendingClaimIds,
    togglePendingClaim,
    clearPending,
    createSet,
    deleteSet,
    renameSet,
    addClaimsToSet,
    removeClaimFromSet,
    addAllocation,
    removeAllocation,
    updateAllocationPercentage,
    distributeEvenly,
    fillRemaining,
  };
}

export type UseClaimSetsReturn = ReturnType<typeof useClaimSets>;
