"use client"

import { useI18n } from "./i18n"
import type { Exercise, Lesson } from "./types"

// Returns localized exercise fields based on current language
export function useLocalizedExercise(exercise: Exercise) {
  const { language } = useI18n()
  const isEn = language === "en"

  return {
    question: (isEn && exercise.questionEn) || exercise.question,
    options: (isEn && exercise.optionsEn) || exercise.options,
    correctAnswer: (isEn && exercise.correctAnswerEn) || exercise.correctAnswer,
    explanation: (isEn && exercise.explanationEn) || exercise.explanation,
    // pass through the rest
    id: exercise.id,
    type: exercise.type,
    media: exercise.media,
  }
}

// Returns localized lesson fields
export function useLocalizedLesson(lesson: Lesson) {
  const { language } = useI18n()
  const isEn = language === "en"

  return {
    ...lesson,
    title: (isEn && lesson.titleEn) || lesson.title,
    description: (isEn && lesson.descriptionEn) || lesson.description,
  }
}
