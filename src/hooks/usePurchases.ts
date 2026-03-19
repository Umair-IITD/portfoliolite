import { useState, useEffect, useCallback } from "react";
import { getSetting, setSetting } from "../db/database";

// ─────────────────────────────────────────────────────────────────
// Phase A (Expo Go): Pro status read/written from SQLite only.
// Phase B (Step 09 APK): Replace purchasePro() body with
// real RevenueCat SDK. Interface stays identical.
// ─────────────────────────────────────────────────────────────────

const RAZORPAY_PAYMENT_LINK_BASE = "https://rzp.io/rzp/wKEZmcX";

// Export so paywall.tsx can import it
export const RAZORPAY_PAYMENT_LINK = RAZORPAY_PAYMENT_LINK_BASE;

export interface VerifyResult {
  success: boolean;
  error?:  string;
}

interface UsePurchasesReturn {
  isPro:          boolean;
  isLoading:      boolean;
  purchasePro:    () => Promise<void>;
  restorePro:     () => Promise<void>;
  verifyUpiCode:  (code: string) => Promise<VerifyResult>;
}

// ── Supabase config ───────────────────────────────────────────────
// Replace with your actual values after Supabase setup
const SUPABASE_VERIFY_URL =
  "https://sdmmujejnxrzgozpstcp.supabase.co/functions/v1/verify-code";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbW11amVqbnhyemdvenBzdGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTI0MzIsImV4cCI6MjA4OTQ4ODQzMn0.UB1wOIf62Ail25ka2h3Ca41s91KtMRkElWwJ7FkYyvM";

// ── Hook ─────────────────────────────────────────────────────────
export function usePurchases(): UsePurchasesReturn {
  const [isPro,     setIsPro]     = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Read pro status from SQLite on mount
  const loadProStatus = useCallback(() => {
    const saved = getSetting("pro_unlocked");
    setIsPro(saved === "true");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProStatus();
  }, [loadProStatus]);

  // ── Google Play billing (Phase B — RevenueCat at Step 09) ────────
  const purchasePro = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO Step 09: replace body with Purchases.purchasePackage()
      // For now: simulate purchase for UI testing
      setSetting("pro_unlocked", "true");
      // ⚠️ Must call setIsPro directly here so React state updates immediately
      setIsPro(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Restore Google Play purchase ──────────────────────────────────
  const restorePro = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO Step 09: replace with Purchases.restorePurchases()
      const saved = getSetting("pro_unlocked");
      const isUnlocked = saved === "true";
      setIsPro(isUnlocked);
      // Return result for caller to show Alert
      if (!isUnlocked) {
        throw new Error("No previous purchase found");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── UPI unlock code verification ──────────────────────────────────
  const verifyUpiCode = useCallback(
    async (code: string): Promise<VerifyResult> => {
      const trimmed = code.trim();

      if (trimmed.length !== 8 || !/^\d{8}$/.test(trimmed)) {
        return { success: false, error: "Code must be exactly 8 digits" };
      }

      try {
        const res = await fetch(SUPABASE_VERIFY_URL, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ code: trimmed }),
        });

        const data = await res.json() as { valid: boolean; error?: string };

        if (data.valid) {
          setSetting("pro_unlocked", "true");
          setIsPro(true);
          return { success: true };
        }

        return {
          success: false,
          error: data.error ?? "Invalid code. Please check and try again.",
        };
      } catch {
        return {
          success: false,
          error: "Network error. Check your connection and try again.",
        };
      }
    },
    []
  );

  return { isPro, isLoading, purchasePro, restorePro, verifyUpiCode };
}

// ── Direct unlock helpers ─────────────────────────────────────────
export function unlockProLocally(): void {
  setSetting("pro_unlocked", "true");
}

export function revokeProLocally(): void {
  setSetting("pro_unlocked", "false");
}