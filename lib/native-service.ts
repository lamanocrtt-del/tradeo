"use client"

import { useState, useEffect, useCallback } from "react"

// ══════════════════════════════════════════════════════════════════════════════
// BuildNatively Bridge Types
// ══════════════════════════════════════════════════════════════════════════════

interface RevenueCatCustomerInfo {
  entitlements: {
    active: Record<string, {
      identifier: string
      isActive: boolean
      willRenew: boolean
      periodType: string
      productIdentifier: string
      isSandbox: boolean
      originalPurchaseDate: string
      expirationDate?: string
    }>
    all: Record<string, unknown>
  }
  activeSubscriptions: string[]
  allPurchasedProductIdentifiers: string[]
  firstSeen: string
  originalAppUserId: string
  managementURL?: string
}

interface RevenueCatPurchaseResult {
  customerInfo: RevenueCatCustomerInfo
  productIdentifier: string
  transaction?: {
    transactionId: string
    productId: string
    purchaseDate: string
  }
}

interface OneSignalUserInfo {
  oderId?: string
  pushToken?: string
  isSubscribed: boolean
}

// Extend window with BuildNatively bridge
declare global {
  interface Window {
    bn?: {
      revenueCat: {
        purchase: (packageId: string) => Promise<RevenueCatPurchaseResult>
        getCustomerInfo: () => Promise<RevenueCatCustomerInfo>
        restore: () => Promise<RevenueCatCustomerInfo>
      }
      onesignal: {
        getUserId: () => Promise<string | null>
        getDeviceState: () => Promise<OneSignalUserInfo | null>
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Utility: Check if running in native app
// ══════════════════════════════════════════════════════════════════════════════

export function isNativeApp(): boolean {
  return typeof window !== "undefined" && !!window.bn
}

// ══════════════════════════════════════════════════════════════════════════════
// RevenueCat Functions
// ══════════════════════════════════════════════════════════════════════════════

export async function buyPremium(packageId: string): Promise<{ success: boolean; customerInfo?: RevenueCatCustomerInfo; error?: string }> {
  if (!isNativeApp()) {
    console.log("Mode simulation : Action native ignoree - buyPremium", packageId)
    return { success: false, error: "Mode simulation" }
  }

  try {
    const result = await window.bn!.revenueCat.purchase(packageId)
    return { success: true, customerInfo: result.customerInfo }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur d'achat"
    console.error("Erreur RevenueCat purchase:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function checkSubscription(): Promise<{ isPremium: boolean; expirationDate?: string; error?: string }> {
  if (!isNativeApp()) {
    console.log("Mode simulation : Action native ignoree - checkSubscription")
    return { isPremium: false }
  }

  try {
    const customerInfo = await window.bn!.revenueCat.getCustomerInfo()
    const premiumEntitlement = customerInfo.entitlements.active["premium"] || 
                               customerInfo.entitlements.active["premium_access"]
    
    if (premiumEntitlement?.isActive) {
      return { 
        isPremium: true, 
        expirationDate: premiumEntitlement.expirationDate 
      }
    }
    
    return { isPremium: false }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur de verification"
    console.error("Erreur RevenueCat getCustomerInfo:", errorMessage)
    return { isPremium: false, error: errorMessage }
  }
}

export async function restorePurchases(): Promise<{ success: boolean; isPremium: boolean; error?: string }> {
  if (!isNativeApp()) {
    console.log("Mode simulation : Action native ignoree - restorePurchases")
    return { success: false, isPremium: false, error: "Mode simulation" }
  }

  try {
    const customerInfo = await window.bn!.revenueCat.restore()
    const premiumEntitlement = customerInfo.entitlements.active["premium"] || 
                               customerInfo.entitlements.active["premium_access"]
    
    return { 
      success: true, 
      isPremium: !!premiumEntitlement?.isActive 
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur de restauration"
    console.error("Erreur RevenueCat restore:", errorMessage)
    return { success: false, isPremium: false, error: errorMessage }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// OneSignal Functions
// ══════════════════════════════════════════════════════════════════════════════

export async function syncPushUser(): Promise<{ success: boolean; oneSignalId?: string; error?: string }> {
  if (!isNativeApp()) {
    console.log("Mode simulation : Action native ignoree - syncPushUser")
    return { success: false, error: "Mode simulation" }
  }

  try {
    const oneSignalId = await window.bn!.onesignal.getUserId()
    
    if (!oneSignalId) {
      return { success: false, error: "ID OneSignal non disponible" }
    }

    // Optionally send to your backend or RevenueCat
    // await fetch("/api/sync-push-user", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ oneSignalId }),
    // })

    return { success: true, oneSignalId }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur OneSignal"
    console.error("Erreur OneSignal getUserId:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// React Hook: useNativeFeatures
// ══════════════════════════════════════════════════════════════════════════════

interface UseNativeFeaturesReturn {
  isPremium: boolean
  isLoading: boolean
  isNative: boolean
  buyPremium: (packageId: string) => Promise<boolean>
  restorePurchases: () => Promise<boolean>
  syncPushUser: () => Promise<string | null>
  checkSubscription: () => Promise<void>
}

export function useNativeFeatures(): UseNativeFeaturesReturn {
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isNative, setIsNative] = useState(false)

  // Check if native on mount
  useEffect(() => {
    setIsNative(isNativeApp())
    
    // Initial subscription check
    const checkInitial = async () => {
      if (isNativeApp()) {
        const result = await checkSubscription()
        setIsPremium(result.isPremium)
      }
      setIsLoading(false)
    }
    
    checkInitial()
  }, [])

  const handleBuyPremium = useCallback(async (packageId: string): Promise<boolean> => {
    setIsLoading(true)
    const result = await buyPremium(packageId)
    
    if (result.success) {
      // Re-check subscription status after purchase
      const subResult = await checkSubscription()
      setIsPremium(subResult.isPremium)
    }
    
    setIsLoading(false)
    return result.success
  }, [])

  const handleRestorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    const result = await restorePurchases()
    setIsPremium(result.isPremium)
    setIsLoading(false)
    return result.success
  }, [])

  const handleSyncPushUser = useCallback(async (): Promise<string | null> => {
    const result = await syncPushUser()
    return result.oneSignalId || null
  }, [])

  const handleCheckSubscription = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    const result = await checkSubscription()
    setIsPremium(result.isPremium)
    setIsLoading(false)
  }, [])

  return {
    isPremium,
    isLoading,
    isNative,
    buyPremium: handleBuyPremium,
    restorePurchases: handleRestorePurchases,
    syncPushUser: handleSyncPushUser,
    checkSubscription: handleCheckSubscription,
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Sound Effects
// ══════════════════════════════════════════════════════════════════════════════

export function playApplauseSound(): void {
  if (typeof window === "undefined") return
  
  try {
    const AudioContextClass = window.AudioContext || 
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioContextClass()
    
    // Fanfare celebration notes
    const notes = [
      { freq: 523.25, start: 0, dur: 0.15 },     // C5
      { freq: 659.25, start: 0.1, dur: 0.15 },   // E5
      { freq: 783.99, start: 0.2, dur: 0.15 },   // G5
      { freq: 1046.5, start: 0.3, dur: 0.5 },    // C6 (held)
    ]
    
    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = "sine"
      
      const startTime = ctx.currentTime + start
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur)
      
      osc.start(startTime)
      osc.stop(startTime + dur)
    })
    
    // Add sparkle/shimmer effect
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      const startTime = ctx.currentTime + 0.4 + (i * 0.08)
      const freq = 2000 + Math.random() * 2000
      
      osc.frequency.value = freq
      osc.type = "sine"
      
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.04, startTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12)
      
      osc.start(startTime)
      osc.stop(startTime + 0.12)
    }
  } catch {
    // Audio not available
  }
}
