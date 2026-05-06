"use client"

import { useEffect, useState } from "react"
import DeoMascot from "@/components/deo-mascot"

interface InteractiveLessonMascotProps {
  size?: number
  state?: "thinking" | "correct" | "incorrect" | "explaining" | "celebrating"
  message?: string
}

/**
 * Interactive Fall Guys style mascot component that shows context-aware reactions
 */
export function InteractiveLessonMascot({
  size = 160,
  state = "thinking",
  message = "",
}: InteractiveLessonMascotProps) {
  const [displayMessage, setDisplayMessage] = useState("")

  useEffect(() => {
    const messages: Record<string, string> = {
      thinking: "Reflechis bien...",
      correct: "Excellente reponse !",
      incorrect: "Essaie encore !",
      explaining: "Laisse-moi t'expliquer...",
      celebrating: "Tu es un champion !",
    }

    setDisplayMessage(messages[state] || message)
  }, [state, message])

  const stateMap = {
    thinking: "thinking" as const,
    correct: "celebrating" as const,
    incorrect: "sad" as const,
    explaining: "thinking" as const,
    celebrating: "celebrating" as const,
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`transition-all duration-300 ${
          state === "correct" ? "scale-110" : state === "incorrect" ? "scale-95" : "scale-100"
        }`}
      >
        <DeoMascot pose={stateMap[state]} size={size} />
      </div>

      {displayMessage && (
        <div
          className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap ${
            state === "correct"
              ? "bg-green-500/20 text-green-400 border border-green-500/50"
              : state === "incorrect"
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/50"
          }`}
        >
          {displayMessage}
        </div>
      )}
    </div>
  )
}
