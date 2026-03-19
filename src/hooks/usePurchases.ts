import { useState, useEffect, useCallback } from "react";
import { getSetting, setSetting } from "../db/database";

// ─────────────────────────────────────────────────────────────────
// Phase A (Expo Go): Pro status read/written from SQLite only.
// Phase B (Step 09 APK): Replace this file with full RevenueCat
// SDK integration. The interface stays identical so all screens
// that import this hook need zero changes.
// ─────────────────────────────────────────────────────────────────

interface UsePurchasesReturn {
  isPro:        boolean;
  isLoading:    boolean;
  purchasePro:  () => Promise<void>;
  restorePro:   () => Promise<void>;
}

export function usePurchases(): UsePurchasesReturn {
  const [isPro,     setIsPro]     = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = getSetting("pro_unlocked");
    setIsPro(saved === "true");
    setIsLoading(false);
  }, []);

  // Phase A stub — shows coming-soon alert
  // Phase B: replace body with Purchases.purchasePackage()
  const purchasePro = useCallback(async (): Promise<void> => {
    // TODO Phase B: wire RevenueCat here
    // For now: simulate unlock for testing UI flow
    setSetting("pro_unlocked", "true");
    setIsPro(true);
  }, []);

  const restorePro = useCallback(async (): Promise<void> => {
    // TODO Phase B: wire Purchases.restorePurchases() here
    const saved = getSetting("pro_unlocked");
    if (saved === "true") {
      setIsPro(true);
    }
  }, []);

  return { isPro, isLoading, purchasePro, restorePro };
}

// Helper: unlock pro directly (for Settings "Restore" and test purposes)
export function unlockProLocally(): void {
  setSetting("pro_unlocked", "true");
}

export function revokeProLocally(): void {
  setSetting("pro_unlocked", "false");
}