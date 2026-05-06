"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Heart, Flame, Gem, Crown, Zap, Loader2, Coins } from "lucide-react"
import { useTranslation, useI18n } from "@/lib/i18n"
import { haptics } from "@/lib/haptics"
import { useBNPurchase, type BNProductKey, type BNPurchaseSuccessEvent } from "@/lib/natively"

interface GemPack {
  id: BNProductKey
  gems: number
  price: string
  tag?: string
}

const GEM_PACKS: GemPack[] = [
  { id: "gems-100", gems: 100, price: "1,99" },
  { id: "gems-500", gems: 500, price: "7,99" },
  { id: "gems-1200", gems: 1200, price: "14,99", tag: "Populaire" },
  { id: "gems-3000", gems: 3000, price: "29,99", tag: "Meilleure offre" },
]

export default function ShopPage() {
  const router = useRouter()
  const { user, isDemo, updateUser } = useAuthStore()
  const t = useTranslation()
  const { language } = useI18n()
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null)

  useEffect(() => {
    if (!user && !isDemo) {
      router.push("/")
    }
  }, [user, isDemo, router])

  // Handle gem purchase success from Google Play
  const handleGemSuccess = useCallback(
    (event: BNPurchaseSuccessEvent) => {
      haptics.success()
      setLoadingProduct(null)
      const pid = event.productId
      let gemsToAdd = 0
      if (pid.includes("100")) gemsToAdd = 100
      else if (pid.includes("500")) gemsToAdd = 500
      else if (pid.includes("1200")) gemsToAdd = 1200
      else if (pid.includes("3000")) gemsToAdd = 3000

      if (gemsToAdd > 0) {
        updateUser({
          gems: (user?.gems || 0) + gemsToAdd,
          nativelyTransactionId: event.purchaseToken,
        })
      }
    },
    [user?.gems, updateUser],
  )

  const { purchase, isLoading, error } = useBNPurchase(handleGemSuccess)

  // Buy gems via Google Play
  const handleBuyGems = (pack: GemPack) => {
    haptics.tap()
    setLoadingProduct(pack.id)
    purchase(pack.id)
  }

  // Buy power-ups with in-app gems
  const handlePowerUp = (type: string, cost: number) => {
    if (!user || user.gems < cost) return
    haptics.tap()

    switch (type) {
      case "heart-refill":
        updateUser({ gems: user.gems - cost, hearts: user.maxHearts })
        break
      case "streak-freeze":
        updateUser({ gems: user.gems - cost })
        break
      case "xp-boost":
        updateUser({ gems: user.gems - cost })
        break
    }
    haptics.success()
  }

  if (!user && !isDemo) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">

          {/* Premium banner */}
          {!user?.isPremium && (
            <button
              onClick={() => { haptics.tap(); router.push("/premium") }}
              className="w-full mb-8 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-foreground text-sm">Passe a Premium</p>
                <p className="text-xs text-muted-foreground">Coeurs illimites, pas de pubs</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full">
                {language === "fr" ? "Voir" : "View"}
              </span>
            </button>
          )}

          {/* Power-ups */}
          <h2 className="text-lg font-bold text-foreground mb-4">
            {language === "fr" ? "Bonus" : "Power-ups"}
          </h2>
          <div className="flex flex-col gap-3 mb-8">
            {[
              {
                type: "heart-refill",
                icon: Heart,
                iconClass: "text-red-500 fill-current",
                bg: "bg-red-500/15",
                label: language === "fr" ? "Recharge coeurs" : "Heart refill",
                desc: language === "fr" ? "Recupere tous tes coeurs" : "Recover all hearts",
                cost: 50,
              },
              {
                type: "streak-freeze",
                icon: Flame,
                iconClass: "text-orange-500",
                bg: "bg-orange-500/15",
                label: t.shop.streakFreeze,
                desc: language === "fr" ? "Protege ta serie 1 jour" : "Protect streak 1 day",
                cost: 100,
              },
              {
                type: "xp-boost",
                icon: Zap,
                iconClass: "text-yellow-500",
                bg: "bg-yellow-500/15",
                label: language === "fr" ? "Boost XP 2x" : "2x XP Boost",
                desc: language === "fr" ? "Double XP pendant 15 min" : "Double XP 15 min",
                cost: 150,
              },
            ].map((item) => (
              <div
                key={item.type}
                className="flex items-center gap-4 rounded-2xl bg-card border border-border p-4"
              >
                <div className={`h-11 w-11 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`h-5 w-5 ${item.iconClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Button
                  size="sm"
                  variant={(user?.gems || 0) < item.cost ? "outline" : "default"}
                  disabled={(user?.gems || 0) < item.cost}
                  onClick={() => handlePowerUp(item.type, item.cost)}
                  className="font-bold text-xs gap-1 rounded-xl"
                >
                  <Gem className="h-3.5 w-3.5" />
                  {item.cost}
                </Button>
              </div>
            ))}
          </div>

          {/* Buy coins with gems */}
          <h2 className="text-lg font-bold text-foreground mb-4">
            {language === "fr" ? "Acheter des pieces" : "Buy coins"}
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { coins: 500, gems: 10 },
              { coins: 1500, gems: 25 },
              { coins: 4000, gems: 60, tag: "Populaire" },
              { coins: 10000, gems: 120, tag: "Meilleur" },
            ].map((pack) => {
              const canAfford = (user?.gems || 0) >= pack.gems
              return (
                <button
                  key={pack.coins}
                  onClick={() => {
                    if (!canAfford) return
                    haptics.tap()
                    updateUser({
                      gems: (user?.gems || 0) - pack.gems,
                      coins: (user?.coins || 0) + pack.coins,
                    })
                    haptics.success()
                  }}
                  disabled={!canAfford}
                  className={`relative rounded-2xl bg-card border-2 p-4 flex flex-col items-center gap-2 active:scale-[0.96] transition-all disabled:opacity-50 ${
                    pack.tag ? "border-amber-500/50 shadow-md shadow-amber-500/5" : "border-border"
                  }`}
                >
                  {pack.tag && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider">
                      {pack.tag}
                    </div>
                  )}
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="font-extrabold text-foreground text-lg">{pack.coins.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-muted-foreground">pieces</p>
                  <div className={`w-full mt-1 py-2 rounded-xl flex items-center justify-center gap-1 ${canAfford ? "bg-blue-500/10" : "bg-muted"}`}>
                    <Gem className="h-4 w-4 text-blue-400" />
                    <span className={`text-sm font-bold ${canAfford ? "text-blue-400" : "text-muted-foreground"}`}>{pack.gems}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Gems store */}
          <h2 className="text-lg font-bold text-foreground mb-4">
            {language === "fr" ? "Acheter des gemmes" : "Buy gems"}
          </h2>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 mb-4 text-center">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {GEM_PACKS.map((pack) => {
              const isThisLoading = isLoading && loadingProduct === pack.id
              return (
                <button
                  key={pack.id}
                  onClick={() => handleBuyGems(pack)}
                  disabled={isLoading}
                  className={`relative rounded-2xl bg-card border-2 p-4 flex flex-col items-center gap-2 active:scale-[0.96] transition-all disabled:opacity-50 ${
                    pack.tag ? "border-primary/50 shadow-md shadow-primary/5" : "border-border"
                  }`}
                >
                  {pack.tag && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider">
                      {pack.tag}
                    </div>
                  )}
                  <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                    <Gem className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="font-extrabold text-foreground text-lg">{pack.gems.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-muted-foreground">gemmes</p>
                  <div className="w-full mt-1 py-2 rounded-xl bg-primary/10 text-center">
                    {isThisLoading ? (
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
            Les achats sont traites via Google Play et geres depuis votre compte Google.
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
