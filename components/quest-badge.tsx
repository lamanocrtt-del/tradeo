"use client"

import { useState } from "react"
import { Target, Flame, Trophy, Star, X, CheckCircle2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useI18n } from "@/lib/i18n"
import { haptics } from "@/lib/haptics"

// Daily quests
const QUESTS = [
  { id: "lesson-1", goal: 1, xp: 10, icon: Target },
  { id: "lesson-3", goal: 3, xp: 30, icon: Trophy },
  { id: "streak", goal: 1, xp: 20, icon: Flame },
]

export function QuestBadge() {
  const { user } = useAuthStore()
  const { language } = useI18n()
  const [showPopup, setShowPopup] = useState(false)

  if (!user) return null

  // Calculate today's lessons
  const today = new Date().toDateString()
  const todayLessons = user.completedLessons?.filter((lessonId: string) => {
    const completedDate = localStorage.getItem(`lesson-${lessonId}-date`)
    return completedDate && new Date(completedDate).toDateString() === today
  }).length || 0

  // Calculate quest progress
  const questProgress = QUESTS.map((quest) => {
    let current = 0
    if (quest.id === "lesson-1" || quest.id === "lesson-3") {
      current = todayLessons
    } else if (quest.id === "streak") {
      current = user.streak > 0 ? 1 : 0
    }
    return { ...quest, current, completed: current >= quest.goal }
  })

  const completedCount = questProgress.filter((q) => q.completed).length
  const allCompleted = completedCount === QUESTS.length
  const progress = (completedCount / QUESTS.length) * 100

  const togglePopup = () => {
    haptics.tap()
    setShowPopup(!showPopup)
  }

  return (
    <div className="relative">
      {/* Small badge button */}
      <button
        onClick={togglePopup}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
          allCompleted
            ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30"
            : "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
        }`}
      >
        <Star className={`h-5 w-5 ${allCompleted ? "text-white" : "text-cyan-400"}`} />
        
        {/* Progress ring */}
        {!allCompleted && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-cyan-500/20"
            />
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${(progress / 100) * 106.8} 106.8`}
              className="text-cyan-400"
            />
          </svg>
        )}

        {/* Notification dot */}
        {completedCount > 0 && !allCompleted && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {completedCount}
          </span>
        )}
      </button>

      {/* Popup */}
      {showPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPopup(false)}
          />
          
          {/* Popup content */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-border">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <span className="font-bold text-foreground">
                  {language === "fr" ? "Quetes du jour" : "Daily Quests"}
                </span>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Quest list */}
            <div className="p-2 space-y-1">
              {questProgress.map((quest) => {
                const QuestIcon = quest.icon
                const labels: Record<string, { fr: string; en: string }> = {
                  "lesson-1": { fr: "Termine 1 lecon", en: "Complete 1 lesson" },
                  "lesson-3": { fr: "Termine 3 lecons", en: "Complete 3 lessons" },
                  "streak": { fr: "Maintiens ta serie", en: "Keep your streak" },
                }
                const label = labels[quest.id]

                return (
                  <div
                    key={quest.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      quest.completed
                        ? "bg-green-500/10"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      quest.completed ? "bg-green-500/20" : "bg-muted"
                    }`}>
                      <QuestIcon className={`h-4 w-4 ${
                        quest.completed ? "text-green-400" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        quest.completed ? "text-green-400 line-through" : "text-foreground"
                      }`}>
                        {language === "fr" ? label.fr : label.en}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quest.current}/{quest.goal}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {quest.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <span className="text-xs font-bold text-amber-400">+{quest.xp} XP</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-muted/30 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                {allCompleted
                  ? (language === "fr" ? "Toutes les quetes terminees !" : "All quests completed!")
                  : (language === "fr" ? `${QUESTS.length - completedCount} quete(s) restante(s)` : `${QUESTS.length - completedCount} quest(s) remaining`)
                }
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
