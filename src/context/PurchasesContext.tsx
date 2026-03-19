import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as Application from "expo-application";
import { Platform } from "react-native";

const STORAGE_KEY = "@portfoliolite_pro_status";
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const RAZORPAY_LINK = process.env.EXPO_PUBLIC_RAZORPAY_LINK;

interface PurchasesContextType {
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
  purchasePro: () => Promise<void>;
  redeemCode: (code: string) => Promise<boolean>;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

const getDeviceId = async () => {
  try {
    if (Platform.OS === "android") {
      return Application.androidId;
    }
    if (Platform.OS === "ios") {
      return await Application.getIosIdForVendorAsync();
    }
  } catch (e) {
    console.error("[PurchasesContext] Device ID error:", e);
  }
  return "unknown_device";
};

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (value === "true") setIsPro(true);
      } catch (e) {
        console.error("[PurchasesContext] Load failed:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStatus();
  }, []);

  const purchasePro = useCallback(async () => {
    if (!RAZORPAY_LINK) return;
    try {
      await Linking.openURL(RAZORPAY_LINK);
    } catch (e) {
      setError("Could not open payment link.");
    }
  }, []);

  const redeemCode = useCallback(async (code: string): Promise<boolean> => {
    if (!code || code.length !== 8) return false;
    setIsLoading(true);
    setError(null);
    try {
      const deviceId = await getDeviceId();
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ code, deviceId }),
      });
      const res = await resp.json();
      if (resp.ok && res.valid) {
        await AsyncStorage.setItem(STORAGE_KEY, "true");
        setIsPro(true);
        return true;
      }
      setError(res.error || "Invalid code");
      return false;
    } catch (e) {
      setError("Network error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    isPro, isLoading, error, purchasePro, redeemCode
  }), [isPro, isLoading, error, purchasePro, redeemCode]);

  return (
    <PurchasesContext.Provider value={value}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const context = useContext(PurchasesContext);
  if (context === undefined) {
    throw new Error("usePurchases must be used within a PurchasesProvider");
  }
  return context;
}
