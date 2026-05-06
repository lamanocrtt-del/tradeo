"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { LESSONS_DATA } from "@/lib/lessons-data"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { ExerciseQCM } from "@/components/exercises/exercise-qcm"
import { ExerciseMatch } from "@/components/exercises/exercise-match"
import { ExerciseFillBlank } from "@/components/exercises/exercise-fill-blank"
import { ExerciseOrder } from "@/components/exercises/exercise-order"
import { Dumbbell, Clock, X } from "lucide-react"

export default function PracticePage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [mode, setMode] = useState<"select" | "practice">("select")
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [practiceExercises, setPracticeExercises] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleStartPractice = (type: string) => {
    // Get exercises from completed lessons
    const allExercises: any[] = []
    LESSONS_DATA.forEach((lesson) => {
      if (user.completedLessons?.includes(lesson.id)) {
        allExercises.push(...lesson.exercises)
      }
    })

    if (allExercises.length === 0) {
      alert("Complète d'abord quelques leçons pour pouvoir pratiquer!")
      return
    }

    // Shuffle and take first 20
    const shuffled = allExercises.sort(() => Math.random() - 0.5).slice(0, 20)
    setPracticeExercises(shuffled)
    setTotalQuestions(shuffled.length)
    setMode("practice")
    setCurrentExerciseIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowExplanation(false)
  }

  const handleAnswer = (answer: string | string[]) => {
    setSelectedAnswer(answer)
  }

  const handleCheck = () => {
    if (!selectedAnswer) return

    const exercise = practiceExercises[currentExerciseIndex]
    const correct = Array.isArray(selectedAnswer)
      ? JSON.stringify(selectedAnswer) === JSON.stringify(exercise.correctAnswer)
      : selectedAnswer === exercise.correctAnswer

    setIsCorrect(correct)
    setShowExplanation(true)

    if (correct) {
      setScore(score + 1)
    }
  }

  const handleContinue = () => {
    if (currentExerciseIndex < practiceExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowExplanation(false)
    } else {
      // Practice complete
      const xpEarned = Math.floor((score / totalQuestions) * 100)
      updateUser({
        xp: user.xp + xpEarned,
        leagueXp: user.leagueXp + xpEarned,
      })
      alert(`Pratique terminée!\nScore: ${score}/${totalQuestions}\nXP gagné: ${xpEarned}`)
      setMode("select")
    }
  }

  const handleExit = () => {
    if (confirm("Quitter la pratique?")) {
      setMode("select")
    }
  }

  if (mode === "select") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="container max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Pratique</h1>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="h-6 w-6" />
                      <h2 className="text-xl font-bold">Pratique libre</h2>
                    </div>
                    <p className="text-sm opacity-90">Révise tes leçons terminées sans perdre de cœurs</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartPractice("free")}
                  className="w-full bg-white text-blue-600 hover:bg-white/90 font-bold h-12 rounded-xl"
                >
                  Commencer
                </Button>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-6 w-6" />
                      <h2 className="text-xl font-bold">Défi chronométré</h2>
                    </div>
                    <p className="text-sm opacity-90">Réponds à 10 questions en 3 minutes</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartPractice("timed")}
                  className="w-full bg-white text-orange-600 hover:bg-white/90 font-bold h-12 rounded-xl"
                >
                  Lancer le défi
                </Button>
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  // Practice mode
  if (practiceExercises.length === 0 || !practiceExercises[currentExerciseIndex]) {
    return null
  }

  const currentExercise = practiceExercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / practiceExercises.length) * 100

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 bg-white border-b border-border z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Question {currentExerciseIndex + 1}/{totalQuestions}
            </p>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button onClick={handleExit} className="p-2 hover:bg-muted rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
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
        </div>
      </main>

      <div className="sticky bottom-0 border-t bg-background p-4">
        <div className="container max-w-2xl mx-auto">
          {!showExplanation ? (
            <Button
              size="lg"
              onClick={handleCheck}
              disabled={!selectedAnswer}
              className="w-full h-14 text-lg font-bold rounded-2xl"
            >
              VÉRIFIER
            </Button>
          ) : (
            <div className="space-y-4">
              {isCorrect ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-4">
                  <p className="text-green-700 font-bold text-lg">✓ Excellent !</p>
                  <p className="text-green-600 text-sm mt-1">+10 XP</p>
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-4">
                  <p className="text-red-700 font-bold text-lg">✗ Pas tout à fait...</p>
                  {currentExercise.explanation && (
                    <p className="text-red-600 text-sm mt-1">{currentExercise.explanation}</p>
                  )}
                </div>
              )}

              <Button
                size="lg"
                onClick={handleContinue}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-green-500 hover:bg-green-600"
              >
                CONTINUER
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
