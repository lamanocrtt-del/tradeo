"use client"

import type React from "react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { GripVertical } from "lucide-react"
import type { Exercise } from "@/lib/types"
import { useLocalizedExercise } from "@/lib/exercise-i18n"
import { useI18n } from "@/lib/i18n"
import { haptics } from "@/lib/haptics"

interface ExerciseOrderProps {
  exercise: Exercise
  selectedAnswer: string[] | null
  onAnswer: (answer: string[]) => void
  isCorrect: boolean | null
  showExplanation: boolean
}

export function ExerciseOrder({ exercise, selectedAnswer, onAnswer, isCorrect, showExplanation }: ExerciseOrderProps) {
  const localized = useLocalizedExercise(exercise)
  const { language } = useI18n()
  const [items, setItems] = useState<string[]>(
    localized.options ? [...localized.options].sort(() => Math.random() - 0.5) : [],
  )
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [touchIndex, setTouchIndex] = useState<number | null>(null)
  const touchStartRef = useRef<number>(0)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)

    setItems(newItems)
    setDraggedIndex(index)
    onAnswer(newItems)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleTouchStart = (index: number) => {
    setTouchIndex(index)
    touchStartRef.current = index
  }

  const handleTouchMove = (e: React.TouchEvent, targetIndex: number) => {
    e.preventDefault()
    if (touchIndex === null || touchIndex === targetIndex) return

    const newItems = [...items]
    const touchedItem = newItems[touchIndex]
    newItems.splice(touchIndex, 1)
    newItems.splice(targetIndex, 0, touchedItem)

    setItems(newItems)
    setTouchIndex(targetIndex)
    onAnswer(newItems)
  }

  const handleTouchEnd = () => {
    setTouchIndex(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
    setItems(newItems)
    onAnswer(newItems)
  }

  const moveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    setItems(newItems)
    onAnswer(newItems)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{localized.question}</h2>
        <p className="text-muted-foreground">
          {language === "fr"
            ? "Glisse sur desktop, utilise les boutons sur mobile"
            : "Drag on desktop, use buttons on mobile"}
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            draggable={!showExplanation}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onTouchStart={() => handleTouchStart(index)}
            onTouchMove={(e) => handleTouchMove(e, index)}
            onTouchEnd={handleTouchEnd}
            className={cn(
              "flex items-center gap-3 p-4 border-2 rounded-xl bg-card cursor-move transition-all",
              "border-border hover:border-cyan-500/50",
              touchIndex === index && "opacity-70 border-cyan-500",
              draggedIndex === index && "opacity-50",
              !showExplanation && "hover:bg-card/80",
            )}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="font-semibold text-lg flex-1">{item}</span>

            {!showExplanation && (
              <div className="flex gap-1 md:hidden">
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); haptics.tap(); moveUp(index) }}
                  disabled={index === 0}
                  className="px-3 py-2 text-sm font-bold bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 rounded touch-manipulation select-none active:scale-95"
                >
                  {"^"}
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); haptics.tap(); moveDown(index) }}
                  disabled={index === items.length - 1}
                  className="px-3 py-2 text-sm font-bold bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 rounded touch-manipulation select-none active:scale-95"
                >
                  v
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
