"use client"

import type React from "react"
import { Input } from "../ui/input"
import type { Exercise } from "@/lib/types"
import { useLocalizedExercise } from "@/lib/exercise-i18n"
import { useI18n } from "@/lib/i18n"

interface ExerciseFillBlankProps {
  exercise: Exercise
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
  isCorrect: boolean | null
  showExplanation: boolean
}

export function ExerciseFillBlank({
  exercise,
  selectedAnswer,
  onAnswer,
  isCorrect,
  showExplanation,
}: ExerciseFillBlankProps) {
  const localized = useLocalizedExercise(exercise)
  const { language } = useI18n()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAnswer(e.target.value)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{localized.question}</h2>
        <p className="text-muted-foreground">
          {language === "fr"
            ? "Complete la phrase (les fautes legeres sont acceptees)"
            : "Complete the sentence (minor typos are accepted)"}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Input
          type="text"
          value={selectedAnswer || ""}
          onChange={handleInputChange}
          disabled={showExplanation}
          placeholder={language === "fr" ? "Ta reponse..." : "Your answer..."}
          className="h-14 text-lg text-center"
          autoFocus
        />
      </div>

      {showExplanation && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {language === "fr" ? "Reponse acceptee:" : "Accepted answer:"}{" "}
            <span className="font-bold text-green-600">{localized.correctAnswer as string}</span>
          </p>
        </div>
      )}
    </div>
  )
}
