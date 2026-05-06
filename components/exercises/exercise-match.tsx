"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/lib/types"
import { useLocalizedExercise } from "@/lib/exercise-i18n"
import { haptics } from "@/lib/haptics"

interface ExerciseMatchProps {
  exercise: Exercise
  selectedAnswer: string[] | null
  onAnswer: (answer: string[]) => void
  isCorrect: boolean | null
  showExplanation: boolean
}

export function ExerciseMatch({ exercise, selectedAnswer, onAnswer, isCorrect, showExplanation }: ExerciseMatchProps) {
  const localized = useLocalizedExercise(exercise)
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)

  const leftOptions = localized.options || []
  const rightOptions = (localized.correctAnswer as string[]) || []

  const handleLeftClick = (option: string) => {
    if (showExplanation) return
    setSelectedLeft(option)
  }

  const handleRightClick = (option: string) => {
    if (showExplanation || !selectedLeft) return

    const newMatches = { ...matches, [selectedLeft]: option }
    setMatches(newMatches)
    setSelectedLeft(null)

    if (Object.keys(newMatches).length === leftOptions.length) {
      const answer = leftOptions.map((left) => newMatches[left])
      onAnswer(answer)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{localized.question}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          {leftOptions.map((option) => {
            const isSelected = selectedLeft === option
            const hasMatch = matches[option]

            return (
              <button
                type="button"
                key={option}
                onPointerDown={(e) => { e.preventDefault(); haptics.tap(); handleLeftClick(option) }}
                disabled={showExplanation || hasMatch !== undefined}
                className={cn(
                  "h-auto min-h-[60px] text-sm font-semibold p-3 w-full rounded-xl border-2 transition-all touch-manipulation select-none active:scale-[0.97]",
                  !isSelected && !hasMatch && "border-border bg-card text-foreground",
                  isSelected && "border-cyan-500 bg-cyan-500/10 text-foreground",
                  hasMatch && "opacity-50 border-green-500/30",
                )}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          {rightOptions.map((option) => {
            const isMatched = Object.values(matches).includes(option)

            return (
              <button
                type="button"
                key={option}
                onPointerDown={(e) => { e.preventDefault(); haptics.tap(); handleRightClick(option) }}
                disabled={showExplanation || isMatched}
                className={cn(
                  "h-auto min-h-[60px] text-sm font-semibold p-3 w-full rounded-xl border-2 transition-all touch-manipulation select-none active:scale-[0.97]",
                  !isMatched && "border-border bg-card text-foreground",
                  isMatched && "opacity-50 border-green-500/30 bg-green-500/10",
                )}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
