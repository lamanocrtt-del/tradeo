"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"

interface StreakFlameCelebrationProps {
  streakCount: number
  onComplete: () => void
}

// Generate random flame particles
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // % from left
    delay: Math.random() * 0.8,
    duration: 1.2 + Math.random() * 0.8,
    size: 16 + Math.random() * 24,
    rotate: -30 + Math.random() * 60,
  }))
}

export function StreakFlameCelebration({ streakCount, onComplete }: StreakFlameCelebrationProps) {
  const [phase, setPhase] = useState<"flames" | "number" | "fadeout">("flames")
  const [particles] = useState(() => generateParticles(20))

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("number"), 800)
    const t2 = setTimeout(() => setPhase("fadeout"), 2600)
    const t3 = setTimeout(() => onComplete(), 3200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Rising flame particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-flame-rise"
          style={{
            left: `${p.x}%`,
            bottom: "-10%",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <Flame
            className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
            style={{
              width: p.size,
              height: p.size,
              transform: `rotate(${p.rotate}deg)`,
              filter: `hue-rotate(${Math.random() * 20 - 10}deg)`,
            }}
          />
        </div>
      ))}

      {/* Center flame + number */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Big central flame */}
        <div
          className={`transition-all duration-700 ${
            phase === "number" ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 blur-3xl bg-orange-500/40 rounded-full scale-150" />
            <Flame className="relative h-32 w-32 text-orange-400 drop-shadow-[0_0_30px_rgba(251,146,60,0.8)] animate-pulse" />
          </div>
        </div>

        {/* Streak number */}
        <div
          className={`transition-all duration-500 ${
            phase === "number" ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: phase === "number" ? "300ms" : "0ms" }}
        >
          <p className="text-8xl font-black bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(251,146,60,0.5)]">
            {streakCount}
          </p>
        </div>

        {/* Label */}
        <div
          className={`transition-all duration-500 ${
            phase === "number" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: phase === "number" ? "500ms" : "0ms" }}
        >
          <p className="text-xl font-bold text-orange-200 text-center">
            {streakCount === 1 ? "Premier jour de serie !" : `${streakCount} jours de serie !`}
          </p>
        </div>
      </div>
    </div>
  )
}
