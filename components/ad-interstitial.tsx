"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Crown, ExternalLink } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useRouter } from "next/navigation"

interface AdInterstitialProps {
  onClose: () => void
}

const AD_DURATION = 5 // seconds before skip is available

// Placeholder ads - replace with real ad network (Google AdMob, AdSense, etc.)
const ADS = [
  {
    id: "ad-1",
    title: "Tradeo Premium",
    titleEn: "Tradeo Premium",
    description: "Pas de pubs, coeurs infinis, lecons exclusives",
    descriptionEn: "No ads, infinite hearts, exclusive lessons",
    cta: "Passer Premium",
    ctaEn: "Go Premium",
    link: "/premium",
    bgColor: "from-amber-500 to-orange-600",
    isInternal: true,
  },
  {
    id: "ad-2",
    title: "Ouvre ton compte de trading",
    titleEn: "Open your trading account",
    description: "Commence a trader avec 0% de commission sur les actions",
    descriptionEn: "Start trading with 0% commission on stocks",
    cta: "En savoir plus",
    ctaEn: "Learn more",
    link: "#",
    bgColor: "from-emerald-500 to-teal-600",
    isInternal: false,
  },
  {
    id: "ad-3",
    title: "Formation Crypto avancee",
    titleEn: "Advanced Crypto training",
    description: "Maitrise le Bitcoin et les altcoins avec nos experts",
    descriptionEn: "Master Bitcoin and altcoins with our experts",
    cta: "Decouvrir",
    ctaEn: "Discover",
    link: "#",
    bgColor: "from-blue-500 to-indigo-600",
    isInternal: false,
  },
]

export function AdInterstitial({ onClose }: AdInterstitialProps) {
  const { language } = useI18n()
  const router = useRouter()
  const [countdown, setCountdown] = useState(AD_DURATION)
  const [canSkip, setCanSkip] = useState(false)

  const ad = ADS[Math.floor(Math.random() * ADS.length)]

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAdClick = useCallback(() => {
    if (ad.isInternal) {
      router.push(ad.link)
    }
    // For external ads, you'd track the click and open in new tab
    onClose()
  }, [ad, router, onClose])

  const handleSkip = useCallback(() => {
    if (canSkip) {
      onClose()
    }
  }, [canSkip, onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Skip button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            disabled={!canSkip}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              canSkip
                ? "bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                : "bg-white/5 text-white/40 cursor-not-allowed"
            }`}
          >
            {canSkip ? (
              <>
                <X className="h-4 w-4" />
                {language === "fr" ? "Passer" : "Skip"}
              </>
            ) : (
              <>{language === "fr" ? `Passer dans ${countdown}s` : `Skip in ${countdown}s`}</>
            )}
          </button>
        </div>

        {/* Ad content */}
        <div
          className={`bg-gradient-to-br ${ad.bgColor} rounded-3xl p-8 text-white shadow-2xl cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]`}
          onClick={handleAdClick}
        >
          <div className="text-center space-y-4">
            {ad.isInternal && (
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-bold">
                  {language === "fr" ? "Recommande" : "Recommended"}
                </span>
              </div>
            )}

            <h2 className="text-3xl font-black">
              {language === "en" && ad.titleEn ? ad.titleEn : ad.title}
            </h2>

            <p className="text-lg text-white/90">
              {language === "en" && ad.descriptionEn ? ad.descriptionEn : ad.description}
            </p>

            <button
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 rounded-xl text-lg hover:bg-white/90 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleAdClick()
              }}
            >
              {language === "en" && ad.ctaEn ? ad.ctaEn : ad.cta}
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Remove ads prompt */}
        {!ad.isInternal && (
          <button
            onClick={() => router.push("/premium")}
            className="w-full mt-4 text-center text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors"
          >
            <Crown className="h-4 w-4 inline mr-1.5" />
            {language === "fr" ? "Supprimer les pubs avec Premium" : "Remove ads with Premium"}
          </button>
        )}
      </div>
    </div>
  )
}
