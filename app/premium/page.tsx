"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import {
  ArrowLeft, Crown, Check, Loader2, Users, Shield, Sparkles,
  Infinity, X, Gem, RotateCcw, AlertTriangle,
} from "lucide-react"
import { haptics } from "@/lib/haptics"
import {
  useBNPurchase, useHasPremiumEntitlement,
  type BNProductKey, type BNPurchaseSuccessEvent,
} from "@/lib/natively"
import { useAuthStore } from "@/lib/auth-store"
import { FamilyEmailVerification } from "@/components/family-email-verification"

// ── Tab type ──
type Tab = "subscriptions" | "coins"

// ── Subscription plans ──
type SubPlan = "sub-monthly" | "sub-annual" | "sub-family"

interface Plan {
  key: SubPlan
  name: string
  price: string
  period: string
  perMonth?: string
  saving?: string
  badge?: string
  isFamily?: boolean
}

const PLANS: Plan[] = [
  {
    key: "sub-annual",
    name: "Annuel",
    price: "71,99",
    period: "/an",
    perMonth: "5,99/mois",
    saving: "-40%",
    badge: "Recommande",
  },
  {
    key: "sub-monthly",
    name: "Mensuel",
    price: "9,99",
    period: "/mois",
  },
  {
    key: "sub-family",
    name: "Famille",
    price: "14,99",
    period: "/mois",
    perMonth: "Jusqu'a 4 comptes",
    isFamily: true,
  },
]

const FEATURES = [
  { icon: Infinity, label: "Coeurs illimites" },
  { icon: Sparkles, label: "Lecons avancees" },
  { icon: Shield, label: "Zero publicite" },
  { icon: Crown, label: "Trading pro" },
]

// ── Coin packs ──
interface CoinPack {
  key: BNProductKey
  coins: number
  price: string
  tag?: string
}

const COIN_PACKS: CoinPack[] = [
  { key: "coins-100", coins: 100, price: "1,99" },
  { key: "coins-500", coins: 500, price: "4,99" },
  { key: "coins-1500", coins: 1500, price: "12,99", tag: "Populaire" },
  { key: "coins-5000", coins: 5000, price: "34,99", tag: "Meilleure offre" },
]

// ═══════════════════════════════════════════════
// Page component
// ═══════════════════════════════════════════════

export default function PremiumPage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()

  const [tab, setTab] = useState<Tab>("subscriptions")
  const [selectedPlan, setSelectedPlan] = useState<SubPlan>("sub-annual")
  const [showFamily, setShowFamily] = useState(false)
  const [isFamilyValid, setIsFamilyValid] = useState(false)
  const [coinLoading, setCoinLoading] = useState<string | null>(null)

  const { hasPremium } = useHasPremiumEntitlement()

  // ── Subscription purchase callback ──
  const handleSubSuccess = useCallback(
    (ev: BNPurchaseSuccessEvent) => {
      haptics.complete()
      const pid = ev.productId
      const planType = pid.includes("family")
        ? "family"
        : pid.includes("annual")
          ? "annual"
          : "monthly"

      updateUser({
        isPremium: true,
        premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        subscriptionType: planType as "monthly" | "annual" | "family",
        hearts: 999,
        maxHearts: 999,
        nativelyTransactionId: ev.purchaseToken,
      })
      router.push(`/premium-success?plan=${planType}`)
    },
    [updateUser, router],
  )

  // ── Coin purchase callback ──
  const handleCoinSuccess = useCallback(
    async (ev: BNPurchaseSuccessEvent) => {
      haptics.success()
      const pid = ev.productId
      let coins = 0
      if (pid.includes("5000")) coins = 5000
      else if (pid.includes("1500")) coins = 1500
      else if (pid.includes("500")) coins = 500
      else if (pid.includes("100")) coins = 100

      if (coins > 0) {
        // Call backend to credit coins with purchaseToken
        try {
          await fetch("/api/add-coins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id,
              purchaseToken: ev.purchaseToken,
              productId: ev.productId,
              coins,
            }),
          })
        } catch {
          // Backend call failed, still credit locally as fallback
        }

        updateUser({
          gems: (user?.gems || 0) + coins,
          nativelyTransactionId: ev.purchaseToken,
        })
      }
      setCoinLoading(null)
    },
    [user?.id, user?.gems, updateUser],
  )

  const subPurchase = useBNPurchase(handleSubSuccess)
  const coinPurchase = useBNPurchase(handleCoinSuccess)

  // ── Handlers ──
  const handleSubscribe = () => {
    haptics.tap()
    if (selectedPlan === "sub-family") {
      setShowFamily(true)
      return
    }
    subPurchase.purchase(selectedPlan)
  }

  const handleFamilySubscribe = () => {
    haptics.tap()
    subPurchase.purchase("sub-family")
  }

  const handleBuyCoins = (pack: CoinPack) => {
    haptics.tap()
    setCoinLoading(pack.key)
    coinPurchase.purchase(pack.key)
  }

  const handleRestore = () => {
    haptics.tap()
    subPurchase.restore()
  }

  const error = subPurchase.error || coinPurchase.error
  const isSubLoading = subPurchase.purchasing

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Back button */}
          <button
            onClick={() => { haptics.tap(); router.back() }}
            className="flex items-center gap-2 text-muted-foreground mb-6 active:opacity-60 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Retour</span>
          </button>

          {/* Hero */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Crown className="h-10 w-10 text-white" />
              </div>
              {(hasPremium || user?.isPremium) && (
                <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-foreground text-balance">Tradeo Premium</h1>
            <p className="text-muted-foreground text-sm mt-1">Apprends sans limites</p>
          </div>

          {/* ── Tab selector ── */}
          <div className="flex rounded-2xl bg-muted/50 p-1 mb-6">
            {([
              { id: "subscriptions" as Tab, label: "Abonnements" },
              { id: "coins" as Tab, label: "Boutique de pieces" },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => { haptics.tap(); setTab(t.id) }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tab === t.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* TAB 1 : Abonnements                    */}
          {/* ═══════════════════════════════════════ */}
          {tab === "subscriptions" && (
            <>
              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {FEATURES.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-2.5 rounded-xl bg-card border border-border p-3"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground leading-tight">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Plan cards */}
              <div className="flex flex-col gap-3 mb-5">
                {PLANS.map((plan) => {
                  const sel = selectedPlan === plan.key
                  return (
                    <button
                      key={plan.key}
                      onClick={() => { haptics.tap(); setSelectedPlan(plan.key) }}
                      className={`relative w-full rounded-2xl p-4 text-left transition-all duration-150 active:scale-[0.98] ${
                        sel
                          ? "bg-primary/10 border-2 border-primary shadow-md shadow-primary/10"
                          : "bg-card border-2 border-transparent hover:border-border"
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                          {plan.badge}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* radio */}
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            sel ? "border-primary bg-primary" : "border-muted-foreground/40"
                          }`}>
                            {sel && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {plan.isFamily && <Users className="h-3.5 w-3.5 text-primary" />}
                              <p className="font-bold text-foreground text-sm">{plan.name}</p>
                            </div>
                            {plan.perMonth && (
                              <p className="text-xs text-muted-foreground">{plan.perMonth}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {plan.saving && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                              {plan.saving}
                            </span>
                          )}
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-foreground">{plan.price}</span>
                            <span className="text-xs text-muted-foreground ml-0.5">{plan.period}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 mb-4">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* CTA -- triggers native Google Play sheet */}
              <button
                onClick={handleSubscribe}
                disabled={isSubLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60 shadow-lg shadow-orange-500/25"
              >
                {isSubLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Chargement...</>
                ) : (
                  <><Crown className="h-5 w-5" /> {"S'abonner"}</>
                )}
              </button>

              {/* Restore */}
              <button
                onClick={handleRestore}
                disabled={isSubLoading}
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurer mes achats
              </button>

              <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
                Paiement via Google Play. Renouvellement automatique. Annulable a tout moment depuis les parametres du Play Store.
              </p>
            </>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* TAB 2 : Boutique de pieces              */}
          {/* ═══════════════════════════════════════ */}
          {tab === "coins" && (
            <>
              {/* Current balance */}
              <div className="flex items-center justify-center gap-2.5 mb-6 py-3 rounded-2xl bg-card border border-border">
                <Gem className="h-5 w-5 text-blue-400" />
                <span className="text-lg font-extrabold text-foreground">
                  {(user?.gems || 0).toLocaleString("fr-FR")}
                </span>
                <span className="text-sm text-muted-foreground">pieces</span>
              </div>

              {/* Error */}
              {coinPurchase.error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 mb-4">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{coinPurchase.error}</p>
                </div>
              )}

              {/* Coin pack grid */}
              <div className="grid grid-cols-2 gap-3">
                {COIN_PACKS.map((pack) => {
                  const loading = coinPurchase.purchasing && coinLoading === pack.key
                  return (
                    <button
                      key={pack.key}
                      onClick={() => handleBuyCoins(pack)}
                      disabled={coinPurchase.purchasing}
                      className={`relative rounded-2xl bg-card border-2 p-4 flex flex-col items-center gap-2 active:scale-[0.96] transition-all disabled:opacity-50 ${
                        pack.tag ? "border-primary/40 shadow-md shadow-primary/5" : "border-border"
                      }`}
                    >
                      {pack.tag && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider">
                          {pack.tag}
                        </div>
                      )}
                      <div className="h-11 w-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                        <Gem className="h-5 w-5 text-blue-400" />
                      </div>
                      <p className="font-extrabold text-foreground text-xl leading-none">
                        {pack.coins.toLocaleString("fr-FR")}
                      </p>
                      <p className="text-[11px] text-muted-foreground -mt-0.5">pieces</p>
                      <div className="w-full mt-1 py-2.5 rounded-xl bg-primary/10 text-center">
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                        ) : (
                          <span className="text-sm font-bold text-primary">{pack.price} EUR</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
                Les achats sont traites via Google Play. Les pieces sont creditees immediatement.
              </p>
            </>
          )}
        </div>

        {/* ── Family bottom sheet ── */}
        {showFamily && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-in fade-in duration-200"
            onClick={() => setShowFamily(false)}
          >
            <div
              className="w-full max-w-lg bg-card rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Plan Famille</h2>
                </div>
                <button onClick={() => setShowFamily(false)} className="text-muted-foreground active:opacity-60">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-primary/10 rounded-xl p-4 mb-5">
                <div>
                  <p className="font-bold text-foreground">Premium Famille</p>
                  <p className="text-xs text-muted-foreground">{"Jusqu'a 4 comptes partages"}</p>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-foreground">14,99</span>
                  <span className="text-xs text-muted-foreground ml-0.5">/mois</span>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {["Tout Premium inclus", "Partager avec 3 proches", "Tableaux de bord famille"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <FamilyEmailVerification onValidityChange={setIsFamilyValid} />

              <button
                onClick={handleFamilySubscribe}
                disabled={isSubLoading}
                className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60 shadow-lg shadow-orange-500/25"
              >
                {isSubLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Chargement...</>
                ) : (
                  <><Users className="h-5 w-5" /> {"S'abonner en famille"}</>
                )}
              </button>

              <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
                Paiement via Google Play. Annulable a tout moment.
              </p>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
