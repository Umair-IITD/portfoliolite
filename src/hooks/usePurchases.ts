import { useState, useEffect, useCallback } from "react";
import { getSetting, setSetting } from "../db/database";

// ─── Config ───────────────────────────────────────────────────────
// Replace with your actual Supabase project URL after setup
const SUPABASE_VERIFY_URL =
  "https://sdmmujejnxrzgozpstcp.supabase.co/functions/v1/verify-code";

// Replace with your Supabase anon key after setup
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbW11amVqbnhyemdvenBzdGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTI0MzIsImV4cCI6MjA4OTQ4ODQzMn0.UB1wOIf62Ail25ka2h3Ca41s91KtMRkElWwJ7FkYyvM";

// Replace with your actual Razorpay payment link after setup
// Create at razorpay.com/payment-links → set amount ₹45, UPI enabled
export const RAZORPAY_PAYMENT_LINK = "https://rzp.io/rzp/wKEZmcX";

// ─── Types ────────────────────────────────────────────────────────

export type PaymentMethod = "google_play" | "upi";

interface UsePurchasesReturn {
  isPro:           boolean;
  isLoading:       boolean;
  purchasePro:     () => Promise<void>;        // Google Play (Phase B)
  restorePro:      () => Promise<void>;        // Google Play restore
  verifyUpiCode:   (code: string) => Promise<VerifyResult>;
}

export interface VerifyResult {
  success: boolean;
  error?:  string;
}

// ─── Hook ─────────────────────────────────────────────────────────

export function usePurchases(): UsePurchasesReturn {
  const [isPro,     setIsPro]     = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = getSetting("pro_unlocked");
    setIsPro(saved === "true");
    setIsLoading(false);
  }, []);

  // ── Google Play billing (Phase B — RevenueCat wired at Step 09) ──
  const purchasePro = useCallback(async (): Promise<void> => {
    // TODO Step 09: replace with Purchases.purchasePackage()
    setSetting("pro_unlocked", "true");
    setIsPro(true);
  }, []);

  const restorePro = useCallback(async (): Promise<void> => {
    // TODO Step 09: replace with Purchases.restorePurchases()
    const saved = getSetting("pro_unlocked");
    if (saved === "true") setIsPro(true);
  }, []);

  // ── UPI unlock code verification ─────────────────────────────────
  const verifyUpiCode = useCallback(
    async (code: string): Promise<VerifyResult> => {
      const trimmed = code.trim();

      if (trimmed.length !== 8 || !/^\d{8}$/.test(trimmed)) {
        return { success: false, error: "Code must be 8 digits" };
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
      } catch (e) {
        console.error("[verifyUpiCode] network error:", e);
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
        };
      }
    },
    []
  );

  return { isPro, isLoading, purchasePro, restorePro, verifyUpiCode };
}

// ─── Direct unlock helpers (used by Settings for testing) ─────────

export function unlockProLocally(): void {
  setSetting("pro_unlocked", "true");
}

export function revokeProLocally(): void {
  setSetting("pro_unlocked", "false");
}