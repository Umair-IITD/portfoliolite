import { usePurchases as usePurchasesFromContext } from "../context/PurchasesContext";

/**
 * usePurchases (Context Wrapper)
 * This is now a thin wrapper around PurchasesContext to preserve existing imports.
 */
export function usePurchases() {
  return usePurchasesFromContext();
}