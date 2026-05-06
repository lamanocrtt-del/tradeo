"use client"

import { useEffect, useState, useCallback } from "react"

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocity: { x: number; y: number }
  rotationSpeed: number
  opacity: number
}

const COLORS = [
  "#FFD700", // Gold
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Light Gold
  "#BB8FCE", // Purple
]

interface ConfettiCelebrationProps {
  duration?: number
  particleCount?: number
  onComplete?: () => void
}

export function ConfettiCelebration({
  duration = 4000,
  particleCount = 100,
  onComplete,
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isActive, setIsActive] = useState(true)

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
        velocity: {
          x: (Math.random() - 0.5) * 3,
          y: 2 + Math.random() * 4,
        },
        rotationSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
      })
    }
    return newParticles
  }, [particleCount])

  useEffect(() => {
    setParticles(createParticles())

    const timer = setTimeout(() => {
      setIsActive(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [createParticles, duration, onComplete])

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.velocity.x,
          y: p.y + p.velocity.y,
          rotation: p.rotation + p.rotationSpeed,
          velocity: {
            x: p.velocity.x * 0.99,
            y: p.velocity.y + 0.1, // gravity
          },
          opacity: p.y > 80 ? Math.max(0, p.opacity - 0.02) : p.opacity,
        }))
      )
    }, 16)

    return () => clearInterval(interval)
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size * 0.6,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            borderRadius: "2px",
            boxShadow: `0 0 ${particle.size / 2}px ${particle.color}40`,
          }}
        />
      ))}
      
      {/* Sparkle burst effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-ping absolute h-32 w-32 rounded-full bg-yellow-400/20" />
        <div className="animate-ping absolute h-48 w-48 rounded-full bg-cyan-400/10 animation-delay-200" />
        <div className="animate-ping absolute h-64 w-64 rounded-full bg-green-400/10 animation-delay-400" />
      </div>
    </div>
  )
}
