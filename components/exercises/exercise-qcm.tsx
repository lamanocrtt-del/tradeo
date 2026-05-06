"use client"

import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/lib/types"
import { useEffect, useState } from "react"
import { useLocalizedExercise } from "@/lib/exercise-i18n"
import { haptics } from "@/lib/haptics"

interface ExerciseQCMProps {
  exercise: Exercise
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
  isCorrect: boolean | null
  showExplanation: boolean
}

export function ExerciseQCM({ exercise, selectedAnswer, onAnswer, isCorrect, showExplanation }: ExerciseQCMProps) {
  const localized = useLocalizedExercise(exercise)
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])

  useEffect(() => {
    if (localized.options) {
      const shuffled = [...localized.options].sort(() => Math.random() - 0.5)
      setShuffledOptions(shuffled)
    }
  }, [exercise.id])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{localized.question}</h2>
      </div>

      <div className="grid gap-3">
        {shuffledOptions.map((option) => {
          const isSelected = selectedAnswer === option
          const isCorrectAnswer = showExplanation && option === localized.correctAnswer
          const isWrongAnswer = showExplanation && isSelected && !isCorrect

          return (
            <button
              type="button"
              key={option}
              onPointerDown={(e) => {
                e.preventDefault()
                if (!showExplanation) {
                  haptics.tap()
                  onAnswer(option)
                }
              }}
              disabled={showExplanation}
              className={cn(
                "h-auto min-h-[60px] text-lg font-semibold p-4 text-left whitespace-normal rounded-xl border-2 transition-all touch-manipulation select-none active:scale-[0.98]",
                !isSelected && !showExplanation && "border-border bg-card text-foreground hover:border-slate-500",
                isSelected && !showExplanation && "border-cyan-500 bg-cyan-500/10 text-foreground",
                isCorrectAnswer && "border-green-500 bg-green-500/10 text-green-400",
                isWrongAnswer && "border-red-500 bg-red-500/10 text-red-400",
                showExplanation && !isCorrectAnswer && !isWrongAnswer && "border-border bg-card text-muted-foreground opacity-50",
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
