"use client"

import { useState, useEffect } from "react"
import { X, Crown, Zap, Heart, Shield, Sparkles, Star, Check } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useRouter } from "next/navigation"
import { haptics } from "@/lib/haptics"

interface PremiumAdInterstitialProps {
  onClose: () => void
}

const AD_DURATION = 10 // 10 seconds before skip

// Different premium ad "scenes" with animations
const PREMIUM_SCENES = [
  {
    id: "no-ads",
    icon: Shield,
    title: { fr: "Plus de publicites", en: "No More Ads" },
    subtitle: { fr: "Apprends sans interruption", en: "Learn without interruption" },
    color: "from-emerald-500 to-teal-600",
    iconColor: "text-emerald-300",
  },
  {
    id: "infinite-hearts",
    icon: Heart,
    title: { fr: "Coeurs illimites", en: "Unlimited Hearts" },
    subtitle: { fr: "Ne perds jamais ta progression", en: "Never lose your progress" },
    color: "from-rose-500 to-pink-600",
    iconColor: "text-rose-300",
  },
  {
    id: "exclusive",
    icon: Crown,
    title: { fr: "Contenu exclusif", en: "Exclusive Content" },
    subtitle: { fr: "Lecons et strategies avancees", en: "Advanced lessons and strategies" },
    color: "from-amber-500 to-orange-600",
    iconColor: "text-amber-300",
  },
  {
    id: "boost",
    icon: Zap,
    title: { fr: "Progresse 2x plus vite", en: "Progress 2x Faster" },
    subtitle: { fr: "XP bonus sur chaque lecon", en: "Bonus XP on every lesson" },
    color: "from-violet-500 to-purple-600",
    iconColor: "text-violet-300",
  },
]

export function PremiumAdInterstitial({ onClose }: PremiumAdInterstitialProps) {
  const { language } = useI18n()
  const router = useRouter()
  const [countdown, setCountdown] = useState(AD_DURATION)
  const [canSkip, setCanSkip] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [showFeatures, setShowFeatures] = useState(false)

  // Countdown timer
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

  // Cycle through scenes
  useEffect(() => {
    const sceneInterval = setInterval(() => {
      setIsAnimating(false)
      setTimeout(() => {
        setCurrentScene((prev) => (prev + 1) % PREMIUM_SCENES.length)
        setIsAnimating(true)
      }, 300)
    }, 2500)

    // Show features after 4 seconds
    const featuresTimer = setTimeout(() => setShowFeatures(true), 4000)

    return () => {
      clearInterval(sceneInterval)
      clearTimeout(featuresTimer)
    }
  }, [])

  const scene = PREMIUM_SCENES[currentScene]
  const SceneIcon = scene.icon

  const handleGetPremium = () => {
    haptics.success()
    router.push("/premium")
    onClose()
  }

  const handleSkip = () => {
    if (canSkip) {
      haptics.tap()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scene.color} transition-all duration-500`}>
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              <Sparkles className="h-4 w-4 text-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Skip button - top right */}
      <div className="relative z-20 flex justify-end p-4">
        <button
          onClick={handleSkip}
          disabled={!canSkip}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            canSkip
              ? "bg-white/20 text-white hover:bg-white/30"
              : "bg-white/10 text-white/50"
          }`}
        >
          {canSkip ? (
            <>
              <X className="h-4 w-4" />
              {language === "fr" ? "Passer" : "Skip"}
            </>
          ) : (
            <span className="tabular-nums">
              {language === "fr" ? `Passer dans ${countdown}s` : `Skip in ${countdown}s`}
            </span>
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Premium badge */}
        <div className="mb-8 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
          <Crown className="h-5 w-5 text-yellow-300" />
          <span className="font-bold text-white">TRADEO PREMIUM</span>
        </div>

        {/* Animated scene */}
        <div
          className={`flex flex-col items-center transition-all duration-300 ${
            isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-4"
          }`}
        >
          {/* Icon with glow */}
          <div className="relative mb-6">
            <div className="absolute inset-0 blur-3xl bg-white/30 rounded-full scale-150" />
            <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-6">
              <SceneIcon className={`h-20 w-20 ${scene.iconColor}`} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-white text-center mb-3">
            {scene.title[language as "fr" | "en"] || scene.title.fr}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-white/80 text-center">
            {scene.subtitle[language as "fr" | "en"] || scene.subtitle.fr}
          </p>
        </div>

        {/* Features list - appears after 4 seconds */}
        <div
          className={`mt-10 space-y-3 transition-all duration-500 ${
            showFeatures ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {[
            { fr: "Pas de publicites", en: "No advertisements" },
            { fr: "Coeurs illimites", en: "Unlimited hearts" },
            { fr: "Lecons exclusives", en: "Exclusive lessons" },
            { fr: "Support prioritaire", en: "Priority support" },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-white/90"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex-shrink-0 bg-white/20 rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
              <span className="font-medium">
                {feature[language as "fr" | "en"] || feature.fr}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-20 p-6 pb-8">
        <button
          onClick={handleGetPremium}
          className="w-full bg-white text-gray-900 font-bold py-4 px-8 rounded-2xl text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98] shadow-2xl"
        >
          <Crown className="h-6 w-6 text-amber-500" />
          {language === "fr" ? "Devenir Premium" : "Get Premium"}
          <Star className="h-5 w-5 text-amber-500 fill-current" />
        </button>

        {/* Price hint */}
        <p className="text-center text-white/60 text-sm mt-3">
          {language === "fr" ? "A partir de 9,99€/mois" : "Starting at $9.99/month"}
        </p>
      </div>

      <style jsx>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.6;
          }
        }
        .animate-float-particle {
          animation: float-particle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
