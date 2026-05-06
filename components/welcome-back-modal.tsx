"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Flame, AlertTriangle } from "lucide-react"
import DeoMascot from "@/components/deo-mascot"
import { useI18n } from "@/lib/i18n"
import { haptics } from "@/lib/haptics"

interface WelcomeBackModalProps {
  username: string
  hasLostStreak: boolean
  previousStreak?: number
  onContinue: () => void
}

export function WelcomeBackModal({ username, hasLostStreak, previousStreak = 0, onContinue }: WelcomeBackModalProps) {
  const { language } = useI18n()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100)
    haptics.tap()
  }, [])

  const handleContinue = () => {
    haptics.success()
    setIsVisible(false)
    setTimeout(onContinue, 300)
  }

  // Messages based on streak status
  const getContent = () => {
    if (hasLostStreak && previousStreak > 0) {
      return {
        title: language === "fr" ? "Oh non..." : "Oh no...",
        subtitle: language === "fr" 
          ? `Tu as perdu ta serie de ${previousStreak} jour${previousStreak > 1 ? "s" : ""} !`
          : `You lost your ${previousStreak} day streak!`,
        message: language === "fr"
          ? "Mais ne t'inquiete pas ! Commence une lecon maintenant pour en demarrer une nouvelle."
          : "But don't worry! Start a lesson now to begin a new one.",
        buttonText: language === "fr" ? "RECOMMENCER" : "START AGAIN",
        mascotPose: "sad" as const,
        showStreakLost: true,
      }
    }

    // Welcome back messages (random)
    const welcomeMessages = language === "fr" ? [
      { title: "Content de te revoir !", message: "Pret a devenir le GOAT du trading ?" },
      { title: "Te revoila !", message: "Une lecon par jour et tu seras imbattable !" },
      { title: "Salut champion !", message: "On continue l'aventure ensemble ?" },
      { title: "Hey !", message: "Les marches t'attendent, on y va ?" },
    ] : [
      { title: "Good to see you!", message: "Ready to become a trading GOAT?" },
      { title: "Welcome back!", message: "One lesson a day keeps the losses away!" },
      { title: "Hey champ!", message: "Let's continue the journey together?" },
      { title: "Hey!", message: "The markets are waiting, let's go?" },
    ]

    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]

    return {
      title: randomMessage.title,
      subtitle: username ? (language === "fr" ? `Salut ${username} !` : `Hi ${username}!`) : "",
      message: randomMessage.message,
      buttonText: language === "fr" ? "C'EST PARTI !" : "LET'S GO!",
      mascotPose: "happy" as const,
      showStreakLost: false,
    }
  }

  const content = getContent()

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div 
        className={`relative z-10 w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl border border-border transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Mascot */}
        <div className="flex justify-center -mt-20 mb-4">
          <DeoMascot pose={content.mascotPose} size={140} />
        </div>

        {/* Streak lost indicator */}
        {content.showStreakLost && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30">
              <Flame className="h-5 w-5 text-red-400" />
              <span className="font-bold text-red-400">{previousStreak}</span>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="text-center space-y-3">
          {content.subtitle && (
            <p className="text-sm text-muted-foreground">{content.subtitle}</p>
          )}
          <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
          <p className="text-muted-foreground">{content.message}</p>
        </div>

        {/* Button */}
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full mt-6 h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {content.buttonText}
        </Button>
      </div>
    </div>
  )
}
