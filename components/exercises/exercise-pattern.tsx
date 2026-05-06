"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Exercise } from "@/lib/types"
import { useLocalizedExercise } from "@/lib/exercise-i18n"
import { useI18n } from "@/lib/i18n"
import { haptics } from "@/lib/haptics"
import { Target, TrendingDown, TrendingUp, CheckCircle2, XCircle } from "lucide-react"

interface ExercisePatternProps {
  exercise: Exercise
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
  isCorrect: boolean | null
  showExplanation: boolean
}

interface Candle {
  open: number
  close: number
  high: number
  low: number
}

type PatternType = NonNullable<Exercise["pattern"]>

// ===== PATTERN GENERATORS =====

function generateDoubleTop(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base * 0.9

  // Rally up to first peak
  for (let i = 0; i < 8; i++) {
    const open = p
    p += base * 0.012 + Math.random() * base * 0.008
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }
  const peak = p

  // Pull back to neckline
  for (let i = 0; i < 5; i++) {
    const open = p
    p -= base * 0.01 + Math.random() * base * 0.006
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.005 })
  }
  const neckline = p

  // Rally to second peak (same level)
  for (let i = 0; i < 6; i++) {
    const open = p
    p += base * 0.011 + Math.random() * base * 0.007
    candles.push({ open, close: p, high: p + Math.random() * base * 0.004, low: open - Math.random() * base * 0.003 })
  }
  p = peak - Math.random() * base * 0.005 // Match first peak

  // Small rejection at peak
  for (let i = 0; i < 3; i++) {
    const open = p
    p -= base * 0.006 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: open + Math.random() * base * 0.005, low: p - Math.random() * base * 0.003 })
  }

  // Break down through neckline (entry zone)
  for (let i = 0; i < 6; i++) {
    const open = p
    p -= base * 0.012 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.006 })
  }

  const total = candles.length
  return { candles, entryZone: [(total - 8) / total, (total - 5) / total] }
}

function generateDoubleBottom(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base * 1.1

  // Drop to first bottom
  for (let i = 0; i < 8; i++) {
    const open = p
    p -= base * 0.012 + Math.random() * base * 0.008
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.005 })
  }
  const bottom = p

  // Bounce up to neckline
  for (let i = 0; i < 5; i++) {
    const open = p
    p += base * 0.01 + Math.random() * base * 0.006
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }

  // Drop to second bottom
  for (let i = 0; i < 6; i++) {
    const open = p
    p -= base * 0.011 + Math.random() * base * 0.007
    candles.push({ open, close: p, high: open + Math.random() * base * 0.004, low: p - Math.random() * base * 0.003 })
  }
  p = bottom + Math.random() * base * 0.005

  // Bounce from second bottom
  for (let i = 0; i < 3; i++) {
    const open = p
    p += base * 0.006 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }

  // Break up through neckline
  for (let i = 0; i < 6; i++) {
    const open = p
    p += base * 0.012 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: p + Math.random() * base * 0.006, low: open - Math.random() * base * 0.003 })
  }

  const total = candles.length
  return { candles, entryZone: [(total - 8) / total, (total - 5) / total] }
}

function generateHeadAndShoulders(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base * 0.92

  // Left shoulder up
  for (let i = 0; i < 5; i++) {
    const open = p; p += base * 0.01 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: p + Math.random() * base * 0.004, low: open - Math.random() * base * 0.003 })
  }
  // Left shoulder down
  for (let i = 0; i < 4; i++) {
    const open = p; p -= base * 0.008 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.004 })
  }
  const necklineLevel = p

  // Head up (higher than shoulder)
  for (let i = 0; i < 6; i++) {
    const open = p; p += base * 0.014 + Math.random() * base * 0.006
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }
  // Head down
  for (let i = 0; i < 5; i++) {
    const open = p; p -= base * 0.013 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.004 })
  }
  p = necklineLevel + Math.random() * base * 0.01

  // Right shoulder up (lower than head)
  for (let i = 0; i < 4; i++) {
    const open = p; p += base * 0.008 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: p + Math.random() * base * 0.004, low: open - Math.random() * base * 0.003 })
  }
  // Right shoulder down
  for (let i = 0; i < 3; i++) {
    const open = p; p -= base * 0.007 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.004 })
  }

  // Break neckline
  for (let i = 0; i < 5; i++) {
    const open = p; p -= base * 0.012 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.006 })
  }

  const total = candles.length
  return { candles, entryZone: [(total - 7) / total, (total - 4) / total] }
}

function generateInvHeadAndShoulders(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base * 1.08

  // Left shoulder down
  for (let i = 0; i < 5; i++) {
    const open = p; p -= base * 0.01 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.004 })
  }
  // Left shoulder up
  for (let i = 0; i < 4; i++) {
    const open = p; p += base * 0.008 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: p + Math.random() * base * 0.004, low: open - Math.random() * base * 0.003 })
  }
  const necklineLevel = p

  // Head down (lower)
  for (let i = 0; i < 6; i++) {
    const open = p; p -= base * 0.014 + Math.random() * base * 0.006
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.005 })
  }
  // Head up
  for (let i = 0; i < 5; i++) {
    const open = p; p += base * 0.013 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }
  p = necklineLevel - Math.random() * base * 0.01

  // Right shoulder down
  for (let i = 0; i < 4; i++) {
    const open = p; p -= base * 0.008 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.004 })
  }
  // Right shoulder up
  for (let i = 0; i < 3; i++) {
    const open = p; p += base * 0.007 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: p + Math.random() * base * 0.004, low: open - Math.random() * base * 0.003 })
  }

  // Break neckline up
  for (let i = 0; i < 5; i++) {
    const open = p; p += base * 0.012 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: p + Math.random() * base * 0.006, low: open - Math.random() * base * 0.003 })
  }

  const total = candles.length
  return { candles, entryZone: [(total - 7) / total, (total - 4) / total] }
}

function generateRisingWedge(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base * 0.9

  // Converging upward moves with decreasing amplitude
  for (let i = 0; i < 24; i++) {
    const amp = 0.015 * (1 - i / 30)
    const bias = i < 18 ? 0.003 : -0.005
    const open = p
    p += (bias + (Math.random() - 0.45) * amp) * base
    candles.push({ open, close: p, high: Math.max(open, p) + Math.random() * base * 0.004, low: Math.min(open, p) - Math.random() * base * 0.004 })
  }

  // Breakdown
  for (let i = 0; i < 6; i++) {
    const open = p; p -= base * 0.015 + Math.random() * base * 0.006
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.006 })
  }

  const total = candles.length
  return { candles, entryZone: [(total - 8) / total, (total - 5) / total] }
}

function generateFallingWedge(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base * 1.1

  for (let i = 0; i < 24; i++) {
    const amp = 0.015 * (1 - i / 30)
    const bias = i < 18 ? -0.003 : 0.005
    const open = p
    p += (bias + (Math.random() - 0.55) * amp) * base
    candles.push({ open, close: p, high: Math.max(open, p) + Math.random() * base * 0.004, low: Math.min(open, p) - Math.random() * base * 0.004 })
  }

  // Breakout up
  for (let i = 0; i < 6; i++) {
    const open = p; p += base * 0.015 + Math.random() * base * 0.006
    candles.push({ open, close: p, high: p + Math.random() * base * 0.006, low: open - Math.random() * base * 0.003 })
  }

  const total = candles.length
  return { candles, entryZone: [(total - 8) / total, (total - 5) / total] }
}

function generateSupplyDemand(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base

  // Drop from supply zone
  for (let i = 0; i < 5; i++) {
    const open = p; p -= base * 0.015 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: open + Math.random() * base * 0.004, low: p - Math.random() * base * 0.005 })
  }

  // Consolidate in demand zone
  const demandBase = p
  for (let i = 0; i < 6; i++) {
    const open = p; p += (Math.random() - 0.5) * base * 0.006
    candles.push({ open, close: p, high: Math.max(open, p) + Math.random() * base * 0.003, low: Math.min(open, p) - Math.random() * base * 0.003 })
  }

  // Bounce from demand
  for (let i = 0; i < 8; i++) {
    const open = p; p += base * 0.01 + Math.random() * base * 0.006
    candles.push({ open, close: p, high: p + Math.random() * base * 0.004, low: open - Math.random() * base * 0.003 })
  }

  // Return to supply zone
  for (let i = 0; i < 5; i++) {
    const open = p; p += base * 0.003 + Math.random() * base * 0.003
    candles.push({ open, close: p, high: p + Math.random() * base * 0.004, low: open - Math.random() * base * 0.003 })
  }

  // Rejection from supply
  for (let i = 0; i < 4; i++) {
    const open = p; p -= base * 0.012 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: open + Math.random() * base * 0.005, low: p - Math.random() * base * 0.005 })
  }

  const total = candles.length
  // Entry zone: at demand bounce
  return { candles, entryZone: [5 / total, 12 / total] }
}

function generateFibonacci(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base * 0.85

  // Strong impulse move up
  for (let i = 0; i < 10; i++) {
    const open = p; p += base * 0.018 + Math.random() * base * 0.006
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }
  const top = p

  // Retrace to 61.8% level
  const impulseSize = top - base * 0.85
  const retrace618 = top - impulseSize * 0.618
  const targetP = retrace618

  for (let i = 0; i < 8; i++) {
    const open = p
    const step = (p - targetP) / (8 - i)
    p -= step * (0.8 + Math.random() * 0.4)
    candles.push({ open, close: p, high: open + Math.random() * base * 0.004, low: p - Math.random() * base * 0.005 })
  }

  // Bounce from fib level
  for (let i = 0; i < 3; i++) {
    const open = p; p += (Math.random() - 0.4) * base * 0.005
    candles.push({ open, close: p, high: Math.max(open, p) + Math.random() * base * 0.003, low: Math.min(open, p) - Math.random() * base * 0.003 })
  }

  // Resume uptrend
  for (let i = 0; i < 7; i++) {
    const open = p; p += base * 0.013 + Math.random() * base * 0.007
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }

  const total = candles.length
  return { candles, entryZone: [17 / total, 22 / total] }
}

function generateBreakRetest(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base * 0.95
  const resistanceLevel = base

  // Approach resistance
  for (let i = 0; i < 6; i++) {
    const open = p; p += base * 0.008 + Math.random() * base * 0.004
    candles.push({ open, close: p, high: p + Math.random() * base * 0.003, low: open - Math.random() * base * 0.003 })
  }

  // Rejection at resistance
  for (let i = 0; i < 3; i++) {
    const open = p; p -= base * 0.006 + Math.random() * base * 0.003
    candles.push({ open, close: p, high: open + Math.random() * base * 0.004, low: p - Math.random() * base * 0.003 })
  }

  // Second attempt - breakout
  for (let i = 0; i < 4; i++) {
    const open = p; p += base * 0.012 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }

  // Retest of broken resistance (now support)
  for (let i = 0; i < 4; i++) {
    const open = p; p -= base * 0.008 + Math.random() * base * 0.003
    candles.push({ open, close: p, high: open + Math.random() * base * 0.003, low: p - Math.random() * base * 0.004 })
  }
  p = resistanceLevel + Math.random() * base * 0.008 // Land near resistance

  // Bounce from retest (entry zone here)
  for (let i = 0; i < 2; i++) {
    const open = p; p += base * 0.004 + Math.random() * base * 0.003
    candles.push({ open, close: p, high: p + Math.random() * base * 0.004, low: open - Math.random() * base * 0.003 })
  }

  // Continue up
  for (let i = 0; i < 6; i++) {
    const open = p; p += base * 0.011 + Math.random() * base * 0.005
    candles.push({ open, close: p, high: p + Math.random() * base * 0.005, low: open - Math.random() * base * 0.003 })
  }

  const total = candles.length
  return { candles, entryZone: [16 / total, 21 / total] }
}

function generateSupportResistance(base: number): { candles: Candle[]; entryZone: [number, number] } {
  const candles: Candle[] = []
  let p = base
  const support = base * 0.92
  const resistance = base * 1.08

  // Bounce between support and resistance
  for (let i = 0; i < 30; i++) {
    const open = p
    if (p > resistance * 0.98) {
      p -= base * 0.008 + Math.random() * base * 0.006
    } else if (p < support * 1.02) {
      p += base * 0.008 + Math.random() * base * 0.006
    } else {
      p += (Math.random() - 0.5) * base * 0.012
    }
    candles.push({ open, close: p, high: Math.max(open, p) + Math.random() * base * 0.004, low: Math.min(open, p) - Math.random() * base * 0.004 })
  }

  const total = candles.length
  return { candles, entryZone: [0.3, 0.7] }
}

// ===== PATTERN MAP =====
const GENERATORS: Record<PatternType, (base: number) => { candles: Candle[]; entryZone: [number, number] }> = {
  "double-top": generateDoubleTop,
  "double-bottom": generateDoubleBottom,
  "head-shoulders": generateHeadAndShoulders,
  "inv-head-shoulders": generateInvHeadAndShoulders,
  "rising-wedge": generateRisingWedge,
  "falling-wedge": generateFallingWedge,
  "supply-demand": generateSupplyDemand,
  "fibonacci": generateFibonacci,
  "break-retest": generateBreakRetest,
  "support-resistance": generateSupportResistance,
}

const PATTERN_LABELS: Record<PatternType, { fr: string; en: string }> = {
  "double-top": { fr: "Double Top", en: "Double Top" },
  "double-bottom": { fr: "Double Bottom", en: "Double Bottom" },
  "head-shoulders": { fr: "Tete et Epaules", en: "Head & Shoulders" },
  "inv-head-shoulders": { fr: "Tete et Epaules Inverse", en: "Inv. Head & Shoulders" },
  "rising-wedge": { fr: "Biseau Ascendant", en: "Rising Wedge" },
  "falling-wedge": { fr: "Biseau Descendant", en: "Falling Wedge" },
  "supply-demand": { fr: "Offre et Demande", en: "Supply & Demand" },
  "fibonacci": { fr: "Fibonacci", en: "Fibonacci" },
  "break-retest": { fr: "Break & Retest", en: "Break & Retest" },
  "support-resistance": { fr: "Support & Resistance", en: "Support & Resistance" },
}

// ===== DRAWING =====
function drawPatternChart(
  canvas: HTMLCanvasElement,
  candles: Candle[],
  entryZone: [number, number],
  tapX: number | null,
  showResult: boolean,
  isCorrectResult: boolean | null,
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)
  const w = rect.width
  const h = rect.height

  // Background
  ctx.fillStyle = "#0f172a"
  ctx.fillRect(0, 0, w, h)

  // Grid
  ctx.strokeStyle = "#1e293b"
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = (h * i) / 4
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  if (candles.length === 0) return

  const allPrices = candles.flatMap((c) => [c.high, c.low])
  const min = Math.min(...allPrices)
  const max = Math.max(...allPrices)
  const range = max - min || 1
  const pad = 16
  const candleWidth = Math.max(3, (w - pad * 2) / candles.length - 2)
  const gap = (w - pad * 2) / candles.length
  const toY = (price: number) => pad + ((max - price) / range) * (h - pad * 2)

  // Draw entry zone highlight
  const zoneStartX = pad + entryZone[0] * (w - pad * 2)
  const zoneEndX = pad + entryZone[1] * (w - pad * 2)

  if (showResult) {
    ctx.fillStyle = isCorrectResult ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.08)"
    ctx.fillRect(zoneStartX, 0, zoneEndX - zoneStartX, h)
    ctx.strokeStyle = isCorrectResult ? "#10b981" : "#ef4444"
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.beginPath(); ctx.moveTo(zoneStartX, 0); ctx.lineTo(zoneStartX, h); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(zoneEndX, 0); ctx.lineTo(zoneEndX, h); ctx.stroke()
    ctx.setLineDash([])
  }

  // Draw candles
  candles.forEach((candle, i) => {
    const x = pad + i * gap + gap / 2
    const isBullish = candle.close >= candle.open
    const color = isBullish ? "#22c55e" : "#ef4444"

    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x, toY(candle.high)); ctx.lineTo(x, toY(candle.low)); ctx.stroke()

    const top = toY(Math.max(candle.open, candle.close))
    const bottom = toY(Math.min(candle.open, candle.close))
    ctx.fillStyle = color
    ctx.fillRect(x - candleWidth / 2, top, candleWidth, Math.max(1, bottom - top))
  })

  // Draw user tap
  if (tapX !== null) {
    ctx.strokeStyle = "#00d4ff"
    ctx.lineWidth = 2
    ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.moveTo(tapX, 0); ctx.lineTo(tapX, h); ctx.stroke()
    ctx.setLineDash([])

    // Dot
    ctx.beginPath()
    ctx.arc(tapX, h / 2, 6, 0, Math.PI * 2)
    ctx.fillStyle = "#00d4ff"
    ctx.fill()
    ctx.strokeStyle = "#0a0e14"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Labels
  if (showResult) {
    ctx.font = "bold 11px sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = "#10b981"
    ctx.fillText("Zone d'entree", (zoneStartX + zoneEndX) / 2, 20)
  }
}

// ===== COMPONENT =====
export function ExercisePattern({
  exercise,
  selectedAnswer,
  onAnswer,
  isCorrect,
  showExplanation,
}: ExercisePatternProps) {
  const localized = useLocalizedExercise(exercise)
  const { language } = useI18n()
  const isFr = language === "fr"
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const patternType = exercise.pattern || "double-top"
  const label = PATTERN_LABELS[patternType]

  const [patternData] = useState(() => {
    const generator = GENERATORS[patternType]
    return generator(100)
  })

  const [tapX, setTapX] = useState<number | null>(null)
  const [userAnswer, setUserAnswer] = useState<"correct" | "incorrect" | null>(null)
  const [hintText, setHintText] = useState<string>(
    isFr ? "Touche le graphique pour placer ton entree" : "Tap the chart to place your entry"
  )

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current) return
    drawPatternChart(
      canvasRef.current,
      patternData.candles,
      patternData.entryZone,
      tapX,
      showExplanation || userAnswer !== null,
      userAnswer === "correct",
    )
  }, [patternData, tapX, showExplanation, userAnswer])

  const handleTap = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (selectedAnswer || showExplanation || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const w = rect.width
      const pad = 16

      const normalizedX = (x - pad) / (w - pad * 2)
      setTapX(x)
      haptics.tap()

      const [zoneStart, zoneEnd] = patternData.entryZone
      const margin = 0.08 // Tolerance
      const isInZone = normalizedX >= zoneStart - margin && normalizedX <= zoneEnd + margin

      if (isInZone) {
        setUserAnswer("correct")
        setHintText(isFr ? "Excellent ! Bonne zone d'entree !" : "Excellent! Good entry zone!")
        onAnswer("correct")
      } else {
        setUserAnswer("incorrect")
        setHintText(
          isFr
            ? "Pas tout a fait... La zone optimale est entre les lignes vertes."
            : "Not quite... The optimal zone is between the green lines."
        )
        onAnswer("incorrect")
      }
    },
    [selectedAnswer, showExplanation, patternData, onAnswer, isFr],
  )

  const isBearish = ["double-top", "head-shoulders", "rising-wedge"].includes(patternType)

  return (
    <div className="flex flex-col gap-4">
      {/* Question */}
      <p className="text-foreground font-semibold text-base leading-relaxed">
        {localized.question}
      </p>

      {/* Pattern label */}
      <div className="flex items-center gap-2">
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
          isBearish ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"
        }`}>
          {isBearish ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
          {isFr ? label.fr : label.en}
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] text-xs font-bold flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          {isFr ? "Place ton entree" : "Place your entry"}
        </div>
      </div>

      {/* Interactive chart */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair"
          style={{ height: 220 }}
          onPointerDown={handleTap}
        />
      </div>

      {/* Feedback */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        userAnswer === "correct"
          ? "bg-green-500/10 text-green-400"
          : userAnswer === "incorrect"
            ? "bg-red-500/10 text-red-400"
            : "bg-muted/50 text-muted-foreground"
      }`}>
        {userAnswer === "correct" ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : userAnswer === "incorrect" ? (
          <XCircle className="w-4 h-4 shrink-0" />
        ) : (
          <Target className="w-4 h-4 shrink-0" />
        )}
        {hintText}
      </div>

      {/* Explanation */}
      {showExplanation && localized.explanation && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {localized.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
