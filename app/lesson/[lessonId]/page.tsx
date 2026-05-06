"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { LESSONS_DATA } from "@/lib/lessons-data"
import { LessonHeader } from "@/components/lesson-header"
import { ExerciseQCM } from "@/components/exercises/exercise-qcm"
import { ExerciseMatch } from "@/components/exercises/exercise-match"
import { ExerciseFillBlank } from "@/components/exercises/exercise-fill-blank"
import { ExerciseOrder } from "@/components/exercises/exercise-order"
import { ExerciseSimulation } from "@/components/exercises/exercise-simulation"
import { ExercisePattern } from "@/components/exercises/exercise-pattern"
import { LessonComplete } from "@/components/lesson-complete"
import { InteractiveLessonMascot } from "@/components/interactive-lesson-mascot"
import { Button } from "@/components/ui/button"
import { validateAnswer } from "@/lib/validation-utils"
import { useI18n } from "@/lib/i18n"
import { haptics } from "@/lib/haptics"

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const { language } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)

  const lesson = LESSONS_DATA.find((l) => l.id === lessonId)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push("/")
    }
  }, [user, router, mounted])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!lesson || !user || lesson.exercises.length === 0) {
    return null
  }

  const currentExercise = lesson.exercises[currentExerciseIndex]

  // Get the localized correctAnswer for validation
  const getLocalizedCorrectAnswer = () => {
    const isEn = language === "en"
    if (isEn && currentExercise.correctAnswerEn) {
      return currentExercise.correctAnswerEn
    }
    return currentExercise.correctAnswer
  }

  const getLocalizedExplanation = () => {
    const isEn = language === "en"
    if (isEn && currentExercise.explanationEn) {
      return currentExercise.explanationEn
    }
    return currentExercise.explanation
  }

  const progress = ((currentExerciseIndex + 1) / lesson.exercises.length) * 100

  const handleAnswer = (answer: string | string[]) => {
    setSelectedAnswer(answer)
  }

  const handleCheck = () => {
    if (!selectedAnswer) return
    haptics.doubleTap()

    const localizedCorrect = getLocalizedCorrectAnswer()
    let correct = false

    if (currentExercise.type === "pattern") {
      correct = selectedAnswer === "correct"
    } else if (currentExercise.type === "fill-blank") {
      correct = validateAnswer(
        selectedAnswer as string,
        localizedCorrect as string,
        1,
      )
    } else if (Array.isArray(selectedAnswer)) {
      correct = JSON.stringify(selectedAnswer) === JSON.stringify(localizedCorrect)
    } else {
      correct = selectedAnswer === localizedCorrect
    }

    setIsCorrect(correct)
    setShowExplanation(true)

    if (correct) {
      haptics.success()
    } else {
      haptics.error()
    }

    if (!correct && !user.isPremium) {
      const newHearts = Math.max(0, user.hearts - 1)
      updateUser({ hearts: newHearts })

      if (newHearts === 0) {
        setTimeout(() => {
          router.push("/shop")
        }, 2000)
      }
    }
  }

  const handleContinue = () => {
    haptics.tap()
    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowExplanation(false)
    } else {
      const xpEarned = lesson.xpReward
      setEarnedXP(xpEarned)

      const newCompletedLessons = [...user.completedLessons, lessonId]
      const newXP = user.xp + xpEarned
      const newLeagueXP = user.leagueXp + xpEarned

      updateUser({
        completedLessons: newCompletedLessons,
        xp: newXP,
        leagueXp: newLeagueXP,
        lastActive: new Date(),
      })

      setIsComplete(true)
    }
  }

  const handleExit = () => {
    const msg =
      language === "fr"
        ? "Es-tu sur de vouloir quitter ? Ta progression ne sera pas sauvegardee."
        : "Are you sure you want to quit? Your progress will not be saved."
    if (confirm(msg)) {
      router.push("/learn")
    }
  }

  const getMascotState = () => {
    if (!showExplanation) return "thinking"
    return isCorrect ? "correct" : "incorrect"
  }

  if (isComplete) {
    return <LessonComplete lesson={lesson} earnedXP={earnedXP} onContinue={handleContinue} lessonId={lessonId} />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LessonHeader progress={progress} hearts={user.hearts} onExit={handleExit} />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-12 flex justify-center">
            <InteractiveLessonMascot size={140} state={getMascotState()} />
          </div>

          {currentExercise.type === "qcm" && (
            <ExerciseQCM
              exercise={currentExercise}
              selectedAnswer={selectedAnswer as string | null}
              onAnswer={handleAnswer}
              isCorrect={isCorrect}
              showExplanation={showExplanation}
            />
          )}

          {currentExercise.type === "match" && (
            <ExerciseMatch
              exercise={currentExercise}
              selectedAnswer={selectedAnswer as string[] | null}
              onAnswer={handleAnswer}
              isCorrect={isCorrect}
              showExplanation={showExplanation}
            />
          )}

          {currentExercise.type === "fill-blank" && (
            <ExerciseFillBlank
              exercise={currentExercise}
              selectedAnswer={selectedAnswer as string | null}
              onAnswer={handleAnswer}
              isCorrect={isCorrect}
              showExplanation={showExplanation}
            />
          )}

          {currentExercise.type === "order" && (
            <ExerciseOrder
              exercise={currentExercise}
              selectedAnswer={selectedAnswer as string[] | null}
              onAnswer={handleAnswer}
              isCorrect={isCorrect}
              showExplanation={showExplanation}
            />
          )}

          {currentExercise.type === "simulation" && (
            <ExerciseSimulation
              exercise={currentExercise}
              selectedAnswer={selectedAnswer as string | null}
              onAnswer={handleAnswer}
              isCorrect={isCorrect}
              showExplanation={showExplanation}
            />
          )}

          {currentExercise.type === "pattern" && (
            <ExercisePattern
              exercise={currentExercise}
              selectedAnswer={selectedAnswer as string | null}
              onAnswer={handleAnswer}
              isCorrect={isCorrect}
              showExplanation={showExplanation}
            />
          )}
        </div>
      </main>

      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur p-4 z-50">
        <div className="container max-w-2xl mx-auto">
          {!showExplanation ? (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                if (selectedAnswer) handleCheck()
              }}
              disabled={!selectedAnswer}
              className={`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-lg select-none touch-manipulation ${
                selectedAnswer
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 hover:shadow-cyan-500/20 active:scale-[0.98]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {language === "fr" ? "VERIFIER" : "CHECK"}
            </button>
          ) : (
            <div className="space-y-4">
              {isCorrect ? (
                <div className="bg-green-500/10 border-2 border-green-500/50 rounded-2xl p-4 backdrop-blur animate-in fade-in">
                  <p className="text-green-400 font-bold text-lg">
                    {language === "fr" ? "Excellent !" : "Excellent!"}
                  </p>
                  {getLocalizedExplanation() && (
                    <p className="text-green-300/80 text-sm mt-2">{getLocalizedExplanation()}</p>
                  )}
                </div>
              ) : (
                <div className="bg-red-500/10 border-2 border-red-500/50 rounded-2xl p-4 backdrop-blur animate-in fade-in">
                  <p className="text-red-400 font-bold text-lg">
                    {language === "fr" ? "Pas tout a fait..." : "Not quite..."}
                  </p>
                  {getLocalizedExplanation() && (
                    <p className="text-red-300/80 text-sm mt-2">{getLocalizedExplanation()}</p>
                  )}
                </div>
              )}

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault()
                  handleContinue()
                }}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-all shadow-lg hover:shadow-green-500/20 active:scale-[0.98] select-none touch-manipulation"
              >
                {currentExerciseIndex < lesson.exercises.length - 1
                  ? language === "fr"
                    ? "CONTINUER"
                    : "CONTINUE"
                  : language === "fr"
                    ? "LECON TERMINEE"
                    : "LESSON COMPLETE"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
