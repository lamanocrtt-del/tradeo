"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useErrorToast } from "@/components/error-toast"

// ──────────────────────────────────────────────
// Build Natively / RevenueCat bridge types
// ──────────────────────────────────────────────

declare global {
  interface Window {
    BN?: {
      purchase: (productId: string) => void
      restore: () => void
      getEntitlements?: () => void
    }
  }
}

export interface BNPurchaseSuccessEvent {
  productId: string
  purchaseToken: string
  orderId?: string
}

export interface BNPurchaseErrorEvent {
  code: string
  message: string
}

export interface BNEntitlement {
  identifier: string
  isActive: boolean
  productIdentifier?: string
}

// ──────────────────────────────────────────────
// RevenueCat product IDs (Google Play Console)
// ──────────────────────────────────────────────

export const BN_PRODUCTS = {
  // Subscriptions
  "sub-monthly": { id: "tradeo_premium_monthly", type: "subscription" as const },
  "sub-annual": { id: "tradeo_premium_annual", type: "subscription" as const },
  "sub-family": { id: "tradeo_premium_family", type: "subscription" as const },
  // Coin packs (consumable)
  "coins-100": { id: "tradeo_coins_100", type: "consumable" as const, coins: 100 },
  "coins-500": { id: "tradeo_coins_500", type: "consumable" as const, coins: 500 },
  "coins-1500": { id: "tradeo_coins_1500", type: "consumable" as const, coins: 1500 },
  "coins-5000": { id: "tradeo_coins_5000", type: "consumable" as const, coins: 5000 },
} as const

export type BNProductKey = keyof typeof BN_PRODUCTS

// Entitlement identifier set in RevenueCat dashboard
export const PREMIUM_ENTITLEMENT = "premium_access"

// ──────────────────────────────────────────────
// Detection
// ──────────────────────────────────────────────

export function useIsBuildNatively(): boolean {
  const [is, setIs] = useState(false)
  useEffect(() => {
    setIs(typeof window !== "undefined" && !!window.BN)
  }, [])
  return is
}

// ──────────────────────────────────────────────
// Purchase hook (event-driven bridge)
// ──────────────────────────────────────────────

interface UseBNPurchaseReturn {
  purchase: (key: BNProductKey) => void
  restore: () => void
  purchasing: boolean
  /** @deprecated use `purchasing` instead */
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useBNPurchase(
  onSuccess?: (e: BNPurchaseSuccessEvent) => void,
  onError?: (e: BNPurchaseErrorEvent) => void,
): UseBNPurchaseReturn {
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useErrorToast()
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    const ok = (e: Event) => {
      const d = (e as CustomEvent).detail as BNPurchaseSuccessEvent
      setPurchasing(false)
      setError(null)
      onSuccessRef.current?.(d)
    }
    const fail = (e: Event) => {
      const d = (e as CustomEvent).detail as BNPurchaseErrorEvent
      setPurchasing(false)
      if (d.code !== "User Cancelled" && !d.message?.toLowerCase().includes("cancel")) {
        const errorMsg = d.message || "Erreur de paiement"
        setError(errorMsg)
        showToast(errorMsg, "error")
      }
      onErrorRef.current?.(d)
    }
    window.addEventListener("bn-purchase-success", ok)
    window.addEventListener("bn-purchase-error", fail)
    return () => {
      window.removeEventListener("bn-purchase-success", ok)
      window.removeEventListener("bn-purchase-error", fail)
    }
  }, [showToast])

  const purchase = useCallback((key: BNProductKey) => {
    if (!window.BN) {
      const errorMsg = "Google Play non disponible"
      setError(errorMsg)
      showToast(errorMsg, "error")
      return
    }
    setPurchasing(true)
    setError(null)
    window.BN.purchase(BN_PRODUCTS[key].id)
  }, [showToast])

  const restore = useCallback(() => {
    if (!window.BN) {
      const errorMsg = "Restauration non disponible"
      setError(errorMsg)
      showToast(errorMsg, "error")
      return
    }
    setPurchasing(true)
    setError(null)
    window.BN.restore()
  }, [showToast])

  const clearError = useCallback(() => setError(null), [])

  return { purchase, restore, purchasing, isLoading: purchasing, error, clearError }
}

// ──────────────────────────────────────────────
// Entitlement checker
// ──────────────────────────────────────────────

export function useHasPremiumEntitlement(): { hasPremium: boolean; checking: boolean } {
  const [hasPremium, setHasPremium] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const handler = (e: Event) => {
      const entitlements = (e as CustomEvent).detail as BNEntitlement[]
      const active = entitlements?.some(
        (ent) => ent.identifier === PREMIUM_ENTITLEMENT && ent.isActive,
      )
      setHasPremium(!!active)
      setChecking(false)
    }

    window.addEventListener("bn-entitlements", handler)

    // Request entitlements from the bridge
    if (window.BN?.getEntitlements) {
      window.BN.getEntitlements()
    } else {
      setChecking(false)
    }

    return () => window.removeEventListener("bn-entitlements", handler)
  }, [])

  return { hasPremium, checking }
}
