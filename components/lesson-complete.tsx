"use client"

import { Button } from "./ui/button"
import { Trophy, Star, Sparkles, Flame, Crown, Zap, Gift } from "lucide-react"
import type { Lesson } from "@/lib/types"
import { LESSONS_DATA } from "@/lib/lessons-data"
import { useEffect, useState, useCallback, useRef } from "react"
import { haptics } from "@/lib/haptics"
import DeoMascot from "@/components/deo-mascot"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/auth-store"
import { PremiumAdInterstitial } from "@/components/premium-ad-interstitial"
import { PerfectStreakCelebration } from "@/components/perfect-streak-celebration"
import { ConfettiCelebration } from "@/components/confetti-celebration"
import { playApplauseSound } from "@/lib/native-service"

interface LessonCompleteProps {
  lesson: Lesson
  earnedXP: number
  onContinue: () => void
  lessonId: string
}

// Sound effects
function playSuccessSound() {
  if (typeof window === "undefined") return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = "sine"
      const startTime = ctx.currentTime + i * 0.1
      gain.gain.setValueAtTime(0.12, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      osc.start(startTime)
      osc.stop(startTime + 0.3)
    })
  } catch (e) {
    // Audio not available
  }
}

function playXPSound() {
  if (typeof window === "undefined") return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)
    osc.type = "sine"
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  } catch (e) {
    // Audio not available
  }
}

export function LessonComplete({ lesson, earnedXP, onContinue, lessonId }: LessonCompleteProps) {
  const router = useRouter()
  const { language } = useI18n()
  const { user, updateStreak } = useAuthStore()
  const [isNavigating, setIsNavigating] = useState(false)
  const [showAd, setShowAd] = useState(false)
  const [showStreakCelebration, setShowStreakCelebration] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showXPAnimation, setShowXPAnimation] = useState(false)
  const [newStreakCount, setNewStreakCount] = useState(0)
  const [displayedXP, setDisplayedXP] = useState(0)
  const [celebrationPhase, setCelebrationPhase] = useState<"streak" | "xp" | "complete">("streak")
  const streakUpdatedRef = useRef(false)
  const [showMotivation, setShowMotivation] = useState(false)

  useEffect(() => {
    // Play initial sound and haptics
    haptics.celebrate()
    playSuccessSound()
    playApplauseSound()

    // Update streak on lesson completion (only once)
    if (!streakUpdatedRef.current) {
      streakUpdatedRef.current = true
      const prevStreak = user?.streak || 0
      const prevLastLessonDate = user?.lastLessonDate || null
      const today = new Date().toISOString().split("T")[0]

      updateStreak()

      // Determine what the new streak will be
      let expectedNewStreak = 1
      if (prevLastLessonDate === today) {
        expectedNewStreak = prevStreak
      } else if (prevLastLessonDate) {
        const lastDate = new Date(prevLastLessonDate)
        const todayDate = new Date(today)
        const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          expectedNewStreak = prevStreak + 1
        }
      }

      setNewStreakCount(expectedNewStreak)

      // Start celebration sequence
      if (prevLastLessonDate !== today) {
        // First lesson of the day - show full streak celebration
        setShowStreakCelebration(true)
        setCelebrationPhase("streak")
      } else {
        // Not first lesson - skip to XP animation
        setCelebrationPhase("xp")
        setShowConfetti(true)
        setTimeout(() => setShowXPAnimation(true), 500)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle streak celebration complete
  const handleStreakComplete = useCallback(() => {
    setShowStreakCelebration(false)
    setCelebrationPhase("xp")
    setShowConfetti(true)
    setTimeout(() => setShowXPAnimation(true), 300)
  }, [])

  // Animate XP count up
  useEffect(() => {
    if (!showXPAnimation) return
    
    playXPSound()
    const duration = 1000
    const steps = 20
    const increment = earnedXP / steps
    let current = 0
    
    const interval = setInterval(() => {
      current += increment
      if (current >= earnedXP) {
        setDisplayedXP(earnedXP)
        clearInterval(interval)
        haptics.success()
        setCelebrationPhase("complete")
        // Show motivation message after XP animation
        setTimeout(() => setShowMotivation(true), 500)
      } else {
        setDisplayedXP(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [showXPAnimation, earnedXP, user?.isPremium])

  const handleContinueClick = async () => {
    haptics.tap()
    // Show ad for non-premium users before navigating
    if (!user?.isPremium && !showAd) {
      setShowAd(true)
      return
    }
    setIsNavigating(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.push("/learn")
  }

  const handleNextLesson = async () => {
    haptics.success()
    // Show ad for non-premium users before navigating
    if (!user?.isPremium && !showAd) {
      setShowAd(true)
      return
    }
    setIsNavigating(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    // Always navigate to /learn so user can see their progress
    router.push("/learn")
  }
  
  // Handle ad close - navigate after ad is dismissed
  const handleAdClose = () => {
    setShowAd(false)
    setIsNavigating(true)
    setTimeout(() => router.push("/learn"), 300)
  }

  // Motivation messages
  const motivationMessages = [
    { fr: "Tu es en feu!", en: "You're on fire!" },
    { fr: "Continue comme ca!", en: "Keep it up!" },
    { fr: "Impressionnant!", en: "Impressive!" },
    { fr: "Tu progresses vite!", en: "You're progressing fast!" },
    { fr: "Excellent travail!", en: "Excellent work!" },
  ]
  const randomMotivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)]

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Streak celebration overlay */}
      {showStreakCelebration && (
        <PerfectStreakCelebration
          streakCount={newStreakCount}
          xpEarned={earnedXP}
          onComplete={handleStreakComplete}
        />
      )}

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCelebration duration={6000} particleCount={150} onComplete={() => setShowConfetti(false)} />
      )}

      {/* Premium ad - fullscreen, shown when user tries to continue */}
      {showAd && <PremiumAdInterstitial onClose={handleAdClose} />}

      {/* Main content - only visible after streak celebration */}
      <div
        className={`w-full max-w-md px-6 space-y-6 text-center transition-all duration-500 ${
          !showStreakCelebration ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Mascot */}
        <div className="flex justify-center">
          <div className="animate-bounce">
            <DeoMascot pose="celebrating" size={160} />
          </div>
        </div>

        {/* Trophy and title */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/30 blur-2xl rounded-full" />
              <Sparkles className="absolute -top-6 -left-6 h-6 w-6 text-yellow-400 animate-spin" />
              <Trophy className="relative h-14 w-14 text-yellow-500" />
              <Sparkles className="absolute -bottom-6 -right-6 h-6 w-6 text-yellow-400 animate-spin" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white">
            {language === "fr" ? "Lecon terminee!" : "Lesson complete!"}
          </h1>
        </div>

        {/* XP earned - animated */}
        <div
          className={`transition-all duration-500 ${
            showXPAnimation ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-5 border-2 border-yellow-500/40 shadow-xl backdrop-blur">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Star className="h-8 w-8 text-yellow-400 fill-current animate-pulse" />
              <span className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent tabular-nums">
                +{displayedXP}
              </span>
              <Star className="h-8 w-8 text-yellow-400 fill-current animate-pulse" />
            </div>
            <p className="text-sm text-yellow-300 font-semibold">
              {language === "fr" ? "Experience gagnee" : "Experience earned"}
            </p>
          </div>
        </div>

        {/* Streak display */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-4 border-2 border-orange-500/40 shadow-xl backdrop-blur">
          <div className="flex items-center justify-center gap-3">
            <Flame className="h-7 w-7 text-orange-400" />
            <span className="text-3xl font-black bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
              {newStreakCount || user?.streak || 0}
            </span>
            <span className="text-lg text-orange-300 font-bold">
              {language === "fr" ? "jours" : "days"}
            </span>
          </div>
        </div>

        {/* Motivation message */}
        <div
          className={`transition-all duration-500 ${
            showMotivation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-cyan-400">
            <Zap className="h-5 w-5" />
            <span className="text-lg font-bold">
              {randomMotivation[language as "fr" | "en"] || randomMotivation.fr}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          {/* Next lesson button - primary */}
          <Button
            size="lg"
            onClick={handleNextLesson}
            disabled={isNavigating}
            className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all shadow-lg hover:shadow-green-500/30 active:scale-95 disabled:opacity-75"
          >
            {isNavigating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {language === "fr" ? "Chargement..." : "Loading..."}
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                {language === "fr" ? "LECON SUIVANTE" : "NEXT LESSON"}
              </>
            )}
          </Button>

          {/* Return home button - secondary */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleContinueClick}
            disabled={isNavigating}
            className="w-full h-12 text-base font-semibold rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            {language === "fr" ? "Retour a l'accueil" : "Back to home"}
          </Button>
        </div>

        {/* Premium upsell for non-premium users */}
        {!user?.isPremium && (
          <button
            onClick={() => router.push("/premium")}
            className="flex items-center justify-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm font-semibold mx-auto"
          >
            <Crown className="h-4 w-4" />
            {language === "fr" ? "Passer Premium pour 2x XP" : "Go Premium for 2x XP"}
          </button>
        )}
      </div>
    </div>
  )
}
