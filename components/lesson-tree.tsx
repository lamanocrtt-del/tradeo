"use client"

import { useState } from "react"
import { LessonNode } from "./lesson-node"
import { LESSONS_DATA } from "@/lib/lessons-data"
import { useAuthStore } from "@/lib/auth-store"
import { useI18n } from "@/lib/i18n"
import { Crown, Trophy, Sparkles, CheckCircle, Lock } from "lucide-react"
import { SectionRecapQuiz } from "./section-recap-quiz"
import { haptics } from "@/lib/haptics"

export function LessonTree() {
  const { user, updateUser, addCoins } = useAuthStore()
  const { language } = useI18n()
  const [showRecapQuiz, setShowRecapQuiz] = useState<number | null>(null)
  const [completedRecaps, setCompletedRecaps] = useState<number[]>([])

  const sections = LESSONS_DATA.reduce(
    (acc, lesson) => {
      if (!acc[lesson.sectionId]) {
        acc[lesson.sectionId] = {}
      }
      if (!acc[lesson.sectionId][lesson.unitId]) {
        acc[lesson.sectionId][lesson.unitId] = []
      }
      acc[lesson.sectionId][lesson.unitId].push(lesson)
      return acc
    },
    {} as Record<number, Record<number, typeof LESSONS_DATA>>,
  )

  const totalSections = Object.keys(sections).length
  const premiumStartSection = Math.max(1, totalSections - 1) // Last 2 sections are premium

  // Check if all lessons in a section are completed
  const isSectionComplete = (sectionId: number) => {
    const sectionLessons = LESSONS_DATA.filter(l => l.sectionId === sectionId)
    return sectionLessons.every(l => user?.completedLessons.includes(l.id))
  }

  // Handle recap quiz completion
  const handleRecapComplete = (score: number, total: number) => {
    const xpBonus = score * 10
    if (user) {
      updateUser({ xp: user.xp + xpBonus })
      addCoins(score * 5)
    }
    if (showRecapQuiz !== null) {
      setCompletedRecaps(prev => [...prev, showRecapQuiz])
    }
    setShowRecapQuiz(null)
    haptics.celebrate()
  }

  const handleStartRecap = (sectionId: number) => {
    haptics.tap()
    setShowRecapQuiz(sectionId)
  }

  const sectionTitles: Record<number, { fr: string; en: string; icon: string; color: string }> = {
    1: { fr: "Premiers Pas", en: "First Steps", icon: "1", color: "from-cyan-500 to-cyan-600" },
    2: { fr: "Lire le Marche", en: "Reading the Market", icon: "2", color: "from-blue-500 to-blue-600" },
    3: { fr: "Gestion du Risque", en: "Risk Management", icon: "3", color: "from-purple-500 to-purple-600" },
    4: { fr: "Analyse Technique", en: "Technical Analysis", icon: "4", color: "from-green-500 to-green-600" },
    5: { fr: "Strategies de Trading", en: "Trading Strategies", icon: "5", color: "from-orange-500 to-orange-600" },
    6: { fr: "Analyse Fondamentale", en: "Fundamental Analysis", icon: "6", color: "from-red-500 to-red-600" },
    7: { fr: "Trading Avance", en: "Advanced Trading", icon: "7", color: "from-pink-500 to-pink-600" },
    8: { fr: "Maitre du Trading", en: "Trading Master", icon: "8", color: "from-yellow-500 to-amber-600" },
    9: { fr: "Crypto & Forex", en: "Crypto & Forex", icon: "9", color: "from-teal-500 to-emerald-600" },
    10: { fr: "Psychologie & Discipline", en: "Psychology & Discipline", icon: "10", color: "from-indigo-500 to-blue-600" },
    11: { fr: "Strategies Expert", en: "Expert Strategies", icon: "11", color: "from-rose-500 to-pink-600" },
    12: { fr: "Maitre des Marches", en: "Market Master", icon: "12", color: "from-amber-500 to-yellow-600" },
  }

  return (
    <>
      {/* Recap Quiz Modal */}
      {showRecapQuiz !== null && (
        <SectionRecapQuiz
          sectionId={showRecapQuiz}
          onComplete={handleRecapComplete}
          onClose={() => setShowRecapQuiz(null)}
        />
      )}

      <div className="container max-w-2xl mx-auto px-4 py-4 space-y-12">
      {Object.entries(sections).map(([sectionId, units]) => {
        const sectionInfo = sectionTitles[Number(sectionId)]
        if (!sectionInfo) return null

        return (
          <div key={sectionId} className="space-y-6">
            {/* Section Header */}
            <div className={`bg-gradient-to-r ${sectionInfo.color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}>
              {Number(sectionId) >= premiumStartSection && !user?.isPremium && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300">PREMIUM</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide opacity-90">
                    {language === "fr" ? `Chapitre ${sectionId}` : `Chapter ${sectionId}`}
                  </h2>
                  <h1 className="text-2xl font-bold mt-1">{sectionInfo[language]}</h1>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">{sectionInfo.icon}</span>
                </div>
              </div>
            </div>

            {/* Units and Lessons */}
            <div className="space-y-8">
              {Object.entries(units).map(([unitId, lessons], unitIndex) => (
                <div key={unitId} className="relative">
                  {/* Unit Header */}
                  <div className="mb-6 px-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {language === "fr" ? `Unite ${unitId}` : `Unit ${unitId}`}
                    </h3>
                  </div>

                  {/* Lessons in zigzag pattern */}
                  <div className="space-y-6">
                    {lessons.map((lesson, lessonIndex) => {
                      const isCompleted = user?.completedLessons.includes(lesson.id)
                      const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null
                      const isPreviousCompleted = previousLesson
                        ? user?.completedLessons.includes(previousLesson.id)
                        : true
                      const isUnlocked = lessonIndex === 0 || isPreviousCompleted
                      // Only the last 2 sections are premium
                      const isPremiumOnly = lesson.sectionId >= premiumStartSection

                      const positions = ["left", "center", "right"]
                      const position = positions[lessonIndex % 3]

                      return (
                        <div
                          key={lesson.id}
                          className={`flex ${
                            position === "left"
                              ? "justify-start"
                              : position === "right"
                                ? "justify-end"
                                : "justify-center"
                          }`}
                        >
                          <LessonNode lesson={lesson} isCompleted={isCompleted} isUnlocked={isUnlocked} isPremiumOnly={isPremiumOnly} />
                        </div>
                      )
                    })}
                  </div>

                  {/* Connecting line to next unit */}
                  {unitIndex < Object.keys(units).length - 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="h-12 w-1 bg-gradient-to-b from-gray-300 to-transparent rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Section Recap Quiz Button */}
            {Number(sectionId) <= 3 && (
              <div className="flex justify-center mt-8">
                {isSectionComplete(Number(sectionId)) ? (
                  completedRecaps.includes(Number(sectionId)) ? (
                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl px-6 py-4">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-bold text-green-400">
                          {language === "fr" ? "Quiz Recap Complete !" : "Recap Quiz Complete!"}
                        </p>
                        <p className="text-xs text-green-400/70">
                          {language === "fr" ? "Bravo pour cette section !" : "Great job on this section!"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartRecap(Number(sectionId))}
                      className="group relative flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-2xl px-6 py-4 shadow-lg hover:shadow-yellow-500/30 transition-all active:scale-95"
                    >
                      <div className="absolute -top-1 -right-1">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-200"></span>
                        </span>
                      </div>
                      <Trophy className="h-6 w-6" />
                      <div className="text-left">
                        <p className="font-bold">
                          {language === "fr" ? "Quiz Recapitulatif" : "Recap Quiz"}
                        </p>
                        <p className="text-xs opacity-80">
                          {language === "fr" ? "4 questions + bonus XP" : "4 questions + XP bonus"}
                        </p>
                      </div>
                      <Sparkles className="h-5 w-5 opacity-80 group-hover:animate-pulse" />
                    </button>
                  )
                ) : (
                  <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-2xl px-6 py-4 opacity-60">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {language === "fr" ? "Quiz Recapitulatif" : "Recap Quiz"}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {language === "fr" ? "Termine toutes les lecons" : "Complete all lessons"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Completion Message */}
      <div className="mt-12 text-center pb-8">
        <div className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl px-6 py-4 text-white shadow-lg">
          <p className="text-lg font-bold">
            {language === "fr"
              ? "Vous avez termine toutes les lecons !"
              : "You have completed all lessons!"}
          </p>
          <p className="text-sm opacity-90 mt-1">
            {language === "fr"
              ? "Continuez a pratiquer dans l'onglet Trading"
              : "Continue practicing in the Trading tab"}
          </p>
        </div>
      </div>
      </div>
    </>
  )
}
