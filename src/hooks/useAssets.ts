import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  Asset, AssetInput, AssetType,
  getAllAssets, insertAsset, updateAsset,
  deleteAsset, getAssetCount, saveSnapshot,
} from "../db/database";

// ─── Allocation helper (used by Dashboard chart) ──────────────────

export interface AllocationItem {
  type: AssetType;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const TYPE_META: Record<AssetType, { label: string; color: string }> = {
  mutual_fund:  { label: "Mutual Funds", color: "#00D4B4" },
  stock:        { label: "Stocks",       color: "#F97316" },
  gold:         { label: "Gold",         color: "#F5A623" },
  fd:           { label: "Fixed Deposit",color: "#22C55E" },
  crypto:       { label: "Crypto",       color: "#3B82F6" },
  ppf:          { label: "PPF",          color: "#A855F7" },
  real_estate:  { label: "Real Estate",  color: "#64748B" },
  cash:         { label: "Cash",         color: "#94A3B8" },
};

// ─── Portfolio calculation helpers ───────────────────────────────

export function calcNetWorth(assets: Asset[]): number {
  return assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
}

export function calcAllocation(assets: Asset[]): AllocationItem[] {
  const total = calcNetWorth(assets);
  if (total === 0) return [];

  const grouped: Partial<Record<AssetType, number>> = {};
  for (const a of assets) {
    grouped[a.type] = (grouped[a.type] ?? 0) + a.quantity * a.currentPrice;
  }

  return (Object.entries(grouped) as [AssetType, number][])
    .map(([type, value]) => ({
      type,
      label:      TYPE_META[type].label,
      color:      TYPE_META[type].color,
      value,
      percentage: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

export function calcPnL(asset: Asset): { absolute: number; percentage: number } {
  if (asset.buyPrice === 0) return { absolute: 0, percentage: 0 };
  const absolute   = (asset.currentPrice - asset.buyPrice) * asset.quantity;
  const percentage = ((asset.currentPrice - asset.buyPrice) / asset.buyPrice) * 100;
  return { absolute, percentage };
}

export function formatINR(n: number): string {
  return "\u20B9" + Math.round(n).toLocaleString("en-IN");
}

// ─── Main hook ────────────────────────────────────────────────────

interface UseAssetsReturn {
  assets:       Asset[];
  isLoading:    boolean;
  error:        string | null;
  netWorth:     number;
  allocation:   AllocationItem[];
  assetCount:   number;
  addAsset:     (input: AssetInput) => Promise<Asset>;
  editAsset:    (id: string, updates: Partial<AssetInput>) => Promise<void>;
  removeAsset:  (id: string) => Promise<void>;
  refresh:      () => void;
}

export function useAssets(): UseAssetsReturn {
  const [assets,    setAssets]    = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(() => {
    try {
      setIsLoading(true);
      const data = getAllAssets();
      setAssets(data);
      setError(null);

      // Save a snapshot whenever assets are loaded (daily fingerprint)
      if (data.length > 0) {
        const total = calcNetWorth(data);
        const breakdown: Record<string, number> = {};
        for (const a of data) {
          breakdown[a.type] = (breakdown[a.type] ?? 0) + a.quantity * a.currentPrice;
        }
        saveSnapshot(total, breakdown);
      }
    } catch (e) {
      setError("Failed to load assets");
      console.error("[useAssets] load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { load(); }, [load]);

  // Reload every time screen comes into focus
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addAsset = useCallback(async (input: AssetInput): Promise<Asset> => {
    const asset = insertAsset(input);
    load();
    return asset;
  }, [load]);

  const editAsset = useCallback(async (
    id: string,
    updates: Partial<AssetInput>
  ): Promise<void> => {
    updateAsset(id, updates);
    load();
  }, [load]);

  const removeAsset = useCallback(async (id: string): Promise<void> => {
    deleteAsset(id);
    load();
  }, [load]);

  return {
    assets,
    isLoading,
    error,
    netWorth:   calcNetWorth(assets),
    allocation: calcAllocation(assets),
    assetCount: assets.length,
    addAsset,
    editAsset,
    removeAsset,
    refresh:    load,
  };
}

// ─── Pro gate helper ──────────────────────────────────────────────

export const FREE_LIMIT = 5;

export function canAddAsset(count: number, isPro: boolean): boolean {
  return isPro || count < FREE_LIMIT;
}