"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "./ui/dialog"
import { PRODUCTS } from "@/lib/products"
import { Crown, Gem, Heart, Flame, Loader2 } from "lucide-react"
import { useBNPurchase, type BNProductKey, type BNPurchaseSuccessEvent } from "@/lib/natively"
import { useAuthStore } from "@/lib/auth-store"
import { haptics } from "@/lib/haptics"

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  productId: string
}

const ICONS: Record<string, typeof Crown> = {
  premium: Crown,
  gems: Gem,
  hearts: Heart,
  "streak-freeze": Flame,
}

export function CheckoutModal({ open, onClose, productId }: CheckoutModalProps) {
  const router = useRouter()
  const product = PRODUCTS.find((p) => p.id === productId)
  const { updateUser, user } = useAuthStore()
  const Icon = ICONS[product?.type || "premium"] || Crown

  const handleSuccess = useCallback(
    (event: BNPurchaseSuccessEvent) => {
      haptics.complete()
      if (product?.type === "premium") {
        const planType = productId.includes("family")
          ? "family"
          : productId.includes("annual")
            ? "annual"
            : "monthly"
        updateUser({
          isPremium: true,
          premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          subscriptionType: planType as "monthly" | "annual" | "family",
          hearts: 999,
          maxHearts: 999,
          nativelyTransactionId: event.purchaseToken,
        })
        onClose()
        router.push(`/premium-success?plan=${planType}`)
      } else if (product?.type === "gems" && product.gems) {
        updateUser({
          gems: (user?.gems || 0) + product.gems,
          nativelyTransactionId: event.purchaseToken,
        })
        haptics.success()
        onClose()
      } else {
        onClose()
      }
    },
    [product, productId, updateUser, user?.gems, onClose, router],
  )

  const { purchase, isLoading, error } = useBNPurchase(handleSuccess)

  // Clicking this triggers the native Google Play purchase sheet
  const handlePurchase = () => {
    haptics.tap()
    purchase(productId as BNProductKey)
  }

  const priceFormatted = product
    ? `${(product.priceInCents / 100).toFixed(2).replace(".", ",")} EUR`
    : "--"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-card border-border p-0 overflow-hidden">
        <div className="flex flex-col items-center p-6 gap-4">
          {/* Icon */}
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Icon className="h-8 w-8 text-white" />
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="font-bold text-foreground text-lg">{product?.name || "Produit"}</p>
            <p className="text-sm text-muted-foreground mt-1">{product?.description}</p>
          </div>

          {/* Price */}
          <div className="bg-primary/10 rounded-xl px-6 py-3">
            <span className="text-2xl font-extrabold text-foreground">{priceFormatted}</span>
          </div>

          {/* Error */}
          {error && (
            <div className="w-full rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-2.5 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* CTA -- opens native Google Play bottom sheet */}
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60 shadow-lg shadow-orange-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Google Play...
              </>
            ) : (
              "Acheter"
            )}
          </button>

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            Paiement via Google Play
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
