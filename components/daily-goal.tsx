"use client"

import { useAuthStore } from "@/lib/auth-store"
import { Target, CheckCircle2, Flame, Zap } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useMemo, useState, useEffect } from "react"
import { haptics } from "@/lib/haptics"

/**
 * Computes how many lessons were completed today
 */
function getTodayLessonCount(user: { completedLessons: string[]; lastLessonDate?: string }): number {
  const today = new Date().toISOString().split("T")[0]
  const storageKey = "tradeo-daily-goal-baseline"
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data.date === today) {
          return Math.max(0, (user.completedLessons?.length || 0) - data.count)
        }
      } catch {
        // ignore
      }
    }
    if (user.lastLessonDate === today) {
      const baseline = Math.max(0, (user.completedLessons?.length || 0) - 1)
      localStorage.setItem(storageKey, JSON.stringify({ date: today, count: baseline }))
      return Math.max(0, (user.completedLessons?.length || 0) - baseline)
    } else {
      localStorage.setItem(storageKey, JSON.stringify({ date: today, count: user.completedLessons?.length || 0 }))
      return 0
    }
  }
  return 0
}

/**
 * Derives the daily lesson goal from the user's chosen dailyMinutes setting.
 */
function getDailyGoalFromSettings(dailyMinutes?: number): number {
  if (!dailyMinutes) return 2
  if (dailyMinutes <= 5) return 1
  if (dailyMinutes <= 10) return 2
  if (dailyMinutes <= 15) return 3
  return 4
}

/**
 * Minimal daily goal badge - subtle indicator that doesn't clutter the interface
 * Shows a small progress ring with streak count
 */
export function DailyGoal() {
  const { user } = useAuthStore()
  const { language } = useI18n()
  const [showDetails, setShowDetails] = useState(false)

  const todayLessons = useMemo(() => {
    if (!user) return 0
    return getTodayLessonCount(user)
  }, [user])

  const dailyGoal = useMemo(() => {
    if (!user) return 2
    return getDailyGoalFromSettings(user.dailyMinutes)
  }, [user])

  if (!user) return null

  const progress = Math.min(100, (todayLessons / dailyGoal) * 100)
  const isGoalMet = todayLessons >= dailyGoal

  // Calculate ring progress for SVG
  const circumference = 2 * Math.PI * 18 // radius = 18
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const handleClick = () => {
    haptics.tap()
    setShowDetails(!showDetails)
  }

  return (
    <div className="relative">
      {/* Compact badge - click to expand */}
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
          isGoalMet 
            ? "bg-emerald-500/10 border border-emerald-500/30" 
            : "bg-primary/10 border border-primary/20 hover:bg-primary/15"
        }`}
      >
        {/* Circular progress indicator */}
        <div className="relative w-7 h-7">
          <svg className="w-7 h-7 -rotate-90" viewBox="0 0 44 44">
            {/* Background circle */}
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted-foreground/20"
            />
            {/* Progress circle */}
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className={isGoalMet ? "text-emerald-400" : "text-primary"}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isGoalMet ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Target className="h-3 w-3 text-primary" />
            )}
          </div>
        </div>

        {/* Streak flame */}
        {user.streak > 0 && (
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">{user.streak}</span>
          </div>
        )}
      </button>

      {/* Expanded details popover */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDetails(false)}
          />
          
          {/* Popover */}
          <div className="absolute top-full right-0 mt-2 w-64 p-4 rounded-2xl bg-card border border-border shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className={`h-5 w-5 ${isGoalMet ? "text-emerald-400" : "text-primary"}`} />
                <span className="font-bold text-foreground">
                  {language === "fr" ? "Objectif du jour" : "Daily Goal"}
                </span>
              </div>
              {isGoalMet && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                  {language === "fr" ? "Atteint!" : "Done!"}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-2 mb-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    isGoalMet ? "bg-emerald-500" : "bg-primary"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{todayLessons}/{dailyGoal} {language === "fr" ? "lecons" : "lessons"}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Streak section */}
            {user.streak > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-400/10 border border-orange-400/20">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <span className="text-sm font-medium text-foreground">
                    {language === "fr" ? "Serie" : "Streak"}
                  </span>
                </div>
                <span className="text-lg font-bold text-orange-400">{user.streak} {language === "fr" ? "jours" : "days"}</span>
              </div>
            )}

            {/* Bonus XP if goal met */}
            {isGoalMet && (
              <div className="flex items-center justify-center gap-2 mt-3 p-2 rounded-lg bg-amber-400/10 text-amber-400">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">+20 XP bonus!</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
