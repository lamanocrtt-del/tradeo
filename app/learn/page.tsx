"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { LessonTree } from "@/components/lesson-tree"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
// DailyGoal replaced by QuestBadge in header
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { NotificationPermissionPrompt } from "@/components/notification-permission-prompt"
import { WelcomeBackModal } from "@/components/welcome-back-modal"

export default function LearnPage() {
  const router = useRouter()
  const { user, isDemo, updateUser, checkDailyHeartsReset, checkMonthlyGems } = useAuthStore()
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [hasLostStreak, setHasLostStreak] = useState(false)
  const [previousStreak, setPreviousStreak] = useState(0)

  // Check daily hearts reset and monthly gems on mount
  useEffect(() => {
    if (user) {
      checkDailyHeartsReset()
      checkMonthlyGems()
    }
  }, [user, checkDailyHeartsReset, checkMonthlyGems])

  useEffect(() => {
    if (!user && !isDemo) {
      router.push("/")
      return
    }

    // Check if user should see welcome back modal
    if (user) {
      const lastVisitKey = "tradeo-last-visit"
      const welcomeShownKey = "tradeo-welcome-shown-today"
      const now = new Date()
      const today = now.toDateString()
      
      // Check if welcome was already shown today
      const welcomeShownToday = sessionStorage.getItem(welcomeShownKey) === today
      
      if (!welcomeShownToday) {
        const lastVisit = localStorage.getItem(lastVisitKey)
        
        if (lastVisit) {
          const lastVisitDate = new Date(lastVisit)
          const daysSinceLastVisit = Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
          
          // If more than 1 day since last visit and user had a streak
          if (daysSinceLastVisit > 1 && user.streak && user.streak > 0) {
            setPreviousStreak(user.streak)
            setHasLostStreak(true)
            setShowWelcomeBack(true)
            // Reset streak
            updateUser({ streak: 0, currentStreak: 0 })
          } else if (daysSinceLastVisit >= 1) {
            // Just show welcome back
            setShowWelcomeBack(true)
          }
        }
        
        // Update last visit
        localStorage.setItem(lastVisitKey, now.toISOString())
        sessionStorage.setItem(welcomeShownKey, today)
      }
    }
  }, [user, isDemo, router, updateUser])

  if (!user && !isDemo) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <LessonTree />
      </main>
      <BottomNav />
      <PWAInstallPrompt />
      <NotificationPermissionPrompt />
      
      {/* Welcome back / Streak lost modal */}
      {showWelcomeBack && user && (
        <WelcomeBackModal
          username={user.username || ""}
          hasLostStreak={hasLostStreak}
          previousStreak={previousStreak}
          onContinue={() => setShowWelcomeBack(false)}
        />
      )}
    </div>
  )
}
