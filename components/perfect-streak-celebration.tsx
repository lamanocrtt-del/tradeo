"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Flame } from "lucide-react"
import { haptics } from "@/lib/haptics"
import { useI18n } from "@/lib/i18n"

interface PerfectStreakCelebrationProps {
  streakCount: number
  xpEarned: number
  onComplete: () => void
}

// Particle types for different effects
interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
  type: "confetti" | "spark" | "ember" | "star"
  scale: number
}

// Fire colors
const FIRE_COLORS = ["#FF6B35", "#FF8C42", "#FFD166", "#FFF5B8", "#FF4500", "#FF6347"]
const CONFETTI_COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#FF8C42", "#9B59B6"]

// Victory fanfare sound
function playVictoryFanfare() {
  if (typeof window === "undefined") return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    
    // Triumphant brass-like fanfare
    const fanfareNotes = [
      { freq: 392, time: 0, duration: 0.15 },      // G4
      { freq: 392, time: 0.15, duration: 0.15 },   // G4
      { freq: 392, time: 0.3, duration: 0.15 },    // G4
      { freq: 311.13, time: 0.45, duration: 0.3 }, // Eb4
      { freq: 349.23, time: 0.75, duration: 0.1 }, // F4
      { freq: 392, time: 0.85, duration: 0.15 },   // G4
      { freq: 311.13, time: 1.0, duration: 0.2 },  // Eb4
      { freq: 523.25, time: 1.2, duration: 0.5 },  // C5 (victory note)
    ]
    
    fanfareNotes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = "triangle"
      const startTime = ctx.currentTime + time
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
      osc.start(startTime)
      osc.stop(startTime + duration)
    })
    
    // Add sparkle overlay
    setTimeout(() => {
      const sparkleFreqs = [1800, 2200, 2600, 3000]
      sparkleFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = "sine"
        const startTime = ctx.currentTime + i * 0.05
        gain.gain.setValueAtTime(0.04, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2)
        osc.start(startTime)
        osc.stop(startTime + 0.2)
      })
    }, 1200)
  } catch {
    // Audio not available
  }
}

// Explosion burst sound
function playExplosionBurst() {
  if (typeof window === "undefined") return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    
    // White noise burst
    const bufferSize = ctx.sampleRate * 0.3
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1))
    }
    
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 1000
    
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()
  } catch {
    // Audio not available
  }
}

export function PerfectStreakCelebration({ streakCount, xpEarned, onComplete }: PerfectStreakCelebrationProps) {
  const { language } = useI18n()
  const [phase, setPhase] = useState<"buildup" | "explode" | "celebrate" | "show" | "exit">("buildup")
  const [particles, setParticles] = useState<Particle[]>([])
  const [displayCount, setDisplayCount] = useState(0)
  const [shakeIntensity, setShakeIntensity] = useState(0)
  const soundPlayedRef = useRef(false)
  const animationRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Create explosion particles
  const createExplosionParticles = useCallback(() => {
    const newParticles: Particle[] = []
    const centerX = 50
    const centerY = 40
    
    // Fire embers shooting out
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40 + Math.random() * 0.5
      const speed = 8 + Math.random() * 12
      newParticles.push({
        id: i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 4 + Math.random() * 8,
        color: FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
        type: "ember",
        scale: 1,
      })
    }
    
    // Confetti burst
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 8
      newParticles.push({
        id: 100 + i,
        x: centerX + (Math.random() - 0.5) * 20,
        y: centerY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8,
        size: 8 + Math.random() * 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
        type: "confetti",
        scale: 1,
      })
    }
    
    // Sparks
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 15 + Math.random() * 10
      newParticles.push({
        id: 200 + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: "#FFFFFF",
        rotation: 0,
        rotationSpeed: 0,
        opacity: 1,
        type: "spark",
        scale: 1,
      })
    }
    
    // Stars
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * 6
      newParticles.push({
        id: 300 + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 15 + Math.random() * 10,
        color: "#FFD700",
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
        type: "star",
        scale: 0,
      })
    }
    
    return newParticles
  }, [])

  // Animate particles
  useEffect(() => {
    if (phase !== "explode" && phase !== "celebrate" && phase !== "show") return
    
    const animate = () => {
      setParticles(prev => prev.map(p => {
        let newVy = p.vy + 0.3 // gravity
        let newOpacity = p.opacity
        let newScale = p.scale
        
        if (p.type === "spark") {
          newOpacity = p.opacity - 0.03
        } else if (p.type === "ember") {
          newOpacity = p.opacity - 0.015
          newScale = p.scale * 0.98
        } else if (p.type === "star") {
          newScale = Math.min(p.scale + 0.1, 1)
          newOpacity = p.opacity - 0.008
        } else {
          newOpacity = p.y > 90 ? p.opacity - 0.02 : p.opacity
        }
        
        return {
          ...p,
          x: p.x + p.vx * 0.5,
          y: p.y + newVy * 0.5,
          vx: p.vx * 0.98,
          vy: newVy,
          rotation: p.rotation + p.rotationSpeed,
          opacity: Math.max(0, newOpacity),
          scale: newScale,
        }
      }).filter(p => p.opacity > 0))
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [phase])

  // Main animation sequence
  useEffect(() => {
    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true
      haptics.celebrate()
    }

    // Phase 1: Buildup with shake
    const buildupInterval = setInterval(() => {
      setShakeIntensity(prev => Math.min(prev + 0.5, 8))
    }, 50)

    const timers = [
      // Explosion phase
      setTimeout(() => {
        clearInterval(buildupInterval)
        setPhase("explode")
        setParticles(createExplosionParticles())
        playExplosionBurst()
        setShakeIntensity(15)
        haptics.complete()
        
        // Shake decay
        const shakeDecay = setInterval(() => {
          setShakeIntensity(prev => {
            if (prev <= 0) {
              clearInterval(shakeDecay)
              return 0
            }
            return prev * 0.85
          })
        }, 30)
      }, 600),
      
      // Celebrate phase - show flame
      setTimeout(() => {
        setPhase("celebrate")
        playVictoryFanfare()
        haptics.success()
      }, 900),
      
      // Count up animation
      setTimeout(() => {
        setPhase("show")
        let count = 0
        const countInterval = setInterval(() => {
          count++
          if (count >= streakCount) {
            setDisplayCount(streakCount)
            clearInterval(countInterval)
            haptics.tap()
          } else {
            setDisplayCount(count)
          }
        }, Math.max(30, 500 / streakCount))
      }, 1400),
      
      // Exit phase
      setTimeout(() => setPhase("exit"), 4000),
      setTimeout(() => onComplete(), 4500),
    ]

    return () => {
      clearInterval(buildupInterval)
      timers.forEach(clearTimeout)
    }
  }, [onComplete, streakCount, createExplosionParticles])

  // Get message based on streak
  const getMessage = () => {
    if (streakCount === 1) return { fr: "C'est parti!", en: "Let's go!" }
    if (streakCount >= 365) return { fr: "LEGENDAIRE!", en: "LEGENDARY!" }
    if (streakCount >= 100) return { fr: "INCROYABLE!", en: "INCREDIBLE!" }
    if (streakCount >= 50) return { fr: "PHENOMENAL!", en: "PHENOMENAL!" }
    if (streakCount >= 30) return { fr: "UN MOIS!", en: "ONE MONTH!" }
    if (streakCount >= 14) return { fr: "DEUX SEMAINES!", en: "TWO WEEKS!" }
    if (streakCount >= 7) return { fr: "UNE SEMAINE!", en: "ONE WEEK!" }
    if (streakCount >= 3) return { fr: "EN FEU!", en: "ON FIRE!" }
    return { fr: "BIEN JOUE!", en: "NICE!" }
  }

  const message = getMessage()
  const shakeStyle = shakeIntensity > 0 ? {
    transform: `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)`,
  } : {}

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={shakeStyle}
    >
      {/* Background with radial gradient */}
      <div className="absolute inset-0 bg-black">
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            phase === "explode" || phase === "celebrate" || phase === "show" ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(255,107,53,0.4) 0%, rgba(255,69,0,0.2) 30%, transparent 70%)",
          }}
        />
      </div>

      {/* Particles layer */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`,
            }}
          >
            {p.type === "star" ? (
              <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : p.type === "spark" ? (
              <div
                style={{
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                }}
              />
            ) : (
              <div
                style={{
                  width: p.size,
                  height: p.type === "confetti" ? p.size * 0.4 : p.size,
                  borderRadius: p.type === "ember" ? "50%" : "2px",
                  backgroundColor: p.color,
                  boxShadow: p.type === "ember" ? `0 0 ${p.size}px ${p.color}` : "none",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Central flame burst */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glow rings */}
        <div 
          className={`absolute transition-all duration-700 ${
            phase === "celebrate" || phase === "show" ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
          style={{
            width: 200,
            height: 200,
            top: -20,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping" />
          <div className="absolute inset-4 rounded-full bg-yellow-500/20 animate-ping" style={{ animationDelay: "0.2s" }} />
          <div className="absolute inset-8 rounded-full bg-red-500/20 animate-ping" style={{ animationDelay: "0.4s" }} />
        </div>

        {/* Main flame */}
        <div 
          className={`relative transition-all duration-500 ${
            phase === "buildup" 
              ? "scale-50 opacity-50" 
              : phase === "explode"
              ? "scale-150 opacity-100"
              : phase === "celebrate" || phase === "show"
              ? "scale-100 opacity-100"
              : "scale-75 opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-orange-500 rounded-full blur-3xl opacity-60 scale-150" />
          <Flame 
            className="relative h-32 w-32 text-orange-400"
            style={{
              filter: "drop-shadow(0 0 30px rgba(255,107,53,1)) drop-shadow(0 0 60px rgba(255,69,0,0.8))",
              animation: phase === "celebrate" || phase === "show" ? "flame-dance 0.5s ease-in-out infinite" : "none",
            }}
          />
        </div>

        {/* Streak count */}
        <div 
          className={`mt-6 transition-all duration-500 ${
            phase === "show" ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-75"
          }`}
        >
          <div className="text-center">
            <span 
              className="text-8xl font-black"
              style={{
                background: "linear-gradient(180deg, #FFF5B8 0%, #FFD166 30%, #FF8C42 60%, #FF6B35 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 20px rgba(255,140,66,0.6))",
              }}
            >
              {displayCount}
            </span>
            <p className="text-2xl font-bold text-orange-200 mt-1">
              {streakCount === 1 
                ? (language === "fr" ? "jour de serie" : "day streak")
                : (language === "fr" ? "jours de serie" : "day streak")
              }
            </p>
          </div>
        </div>

        {/* Message badge */}
        <div 
          className={`mt-6 transition-all duration-500 ${
            phase === "show" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div 
            className="px-8 py-3 rounded-full font-black text-xl text-white"
            style={{
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFD166 100%)",
              boxShadow: "0 4px 20px rgba(255,107,53,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            {message[language as "fr" | "en"] || message.fr}
          </div>
        </div>

        {/* XP bonus */}
        <div 
          className={`mt-4 transition-all duration-500 ${
            phase === "show" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="flex items-center gap-2 text-yellow-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-lg font-bold">+{xpEarned} XP</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flame-dance {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(1.05) scaleX(0.97); }
        }
      `}</style>
    </div>
  )
}
