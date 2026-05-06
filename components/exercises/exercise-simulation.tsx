"use client"

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Exercise } from "@/lib/types"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useLocalizedExercise } from "@/lib/exercise-i18n"
import { useI18n } from "@/lib/i18n"
import { haptics } from "@/lib/haptics"

interface ExerciseSimulationProps {
  exercise: Exercise
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
  isCorrect: boolean | null
  showExplanation: boolean
}

// Candle data type
interface Candle {
  open: number
  close: number
  high: number
  low: number
  isBullish: boolean
}

// Generate candlestick data
function generateCandles(count: number, startPrice: number, trend: "up" | "down" | "mixed" = "mixed"): Candle[] {
  const candles: Candle[] = []
  let price = startPrice
  for (let i = 0; i < count; i++) {
    let bias = 0
    if (trend === "up") bias = 0.6
    else if (trend === "down") bias = -0.6

    const change = (Math.random() - 0.5 + bias) * 4
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * 2
    const low = Math.min(open, close) - Math.random() * 2
    candles.push({ open, close, high, low, isBullish: close >= open })
    price = close
  }
  return candles
}

// Draw candlestick chart on canvas
function drawCandlestickChart(
  canvas: HTMLCanvasElement,
  candles: Candle[],
  highlightIndex?: number | null,
  highlightColor?: string,
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

  ctx.clearRect(0, 0, w, h)

  // Background
  ctx.fillStyle = "#0f172a"
  ctx.fillRect(0, 0, w, h)

  // Grid
  ctx.strokeStyle = "#1e293b"
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = (h * i) / 4
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  if (candles.length === 0) return

  const allPrices = candles.flatMap((c) => [c.high, c.low])
  const min = Math.min(...allPrices)
  const max = Math.max(...allPrices)
  const range = max - min || 1
  const pad = 16
  const candleWidth = Math.max(4, (w - pad * 2) / candles.length - 2)
  const gap = (w - pad * 2) / candles.length

  const toY = (price: number) => pad + ((max - price) / range) * (h - pad * 2)

  candles.forEach((candle, i) => {
    const x = pad + i * gap + gap / 2

    const isHighlighted = highlightIndex === i
    const green = isHighlighted && highlightColor ? highlightColor : "#22c55e"
    const red = isHighlighted && highlightColor ? highlightColor : "#ef4444"
    const color = candle.isBullish ? green : red

    // Wick
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, toY(candle.high))
    ctx.lineTo(x, toY(candle.low))
    ctx.stroke()

    // Body
    const top = toY(Math.max(candle.open, candle.close))
    const bottom = toY(Math.min(candle.open, candle.close))
    const bodyHeight = Math.max(1, bottom - top)

    ctx.fillStyle = color
    ctx.fillRect(x - candleWidth / 2, top, candleWidth, bodyHeight)

    // Highlight outline
    if (isHighlighted) {
      ctx.strokeStyle = "#facc15"
      ctx.lineWidth = 2
      ctx.strokeRect(x - candleWidth / 2 - 2, top - 2, candleWidth + 4, bodyHeight + 4)
    }
  })
}

export function ExerciseSimulation({
  exercise,
  selectedAnswer,
  onAnswer,
  isCorrect,
  showExplanation,
}: ExerciseSimulationProps) {
  const localized = useLocalizedExercise(exercise)
  const { language } = useI18n()
  const t = language === "fr"
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Determine simulation mode from exercise question content
  // If question contains keywords, switch mode
  const questionLower = (localized.question || "").toLowerCase()
  const isIdentifyMode =
    questionLower.includes("identifie") ||
    questionLower.includes("identify") ||
    questionLower.includes("repere") ||
    questionLower.includes("spot") ||
    questionLower.includes("trouve") ||
    questionLower.includes("find") ||
    questionLower.includes("clique") ||
    questionLower.includes("click") ||
    questionLower.includes("tap") ||
    questionLower.includes("appuie") ||
    questionLower.includes("touche") ||
    questionLower.includes("montre") ||
    questionLower.includes("show")

  const isObserveMode =
    questionLower.includes("observe") ||
    questionLower.includes("watch") ||
    questionLower.includes("regarde") ||
    questionLower.includes("combien") ||
    questionLower.includes("how many") ||
    questionLower.includes("count") ||
    questionLower.includes("compte")

  const isTradingMode = !isIdentifyMode && !isObserveMode

  // --- IDENTIFY MODE: tap a candle on the chart ---
  const [identifyCandles] = useState<Candle[]>(() => generateCandles(20, 100, "mixed"))
  const [tappedCandle, setTappedCandle] = useState<number | null>(null)
  const [identifyFeedback, setIdentifyFeedback] = useState<string>("")

  // --- OBSERVE MODE: answer about the chart ---
  const [observeCandles] = useState<Candle[]>(() => generateCandles(25, 100, "mixed"))
  const [observeChoice, setObserveChoice] = useState<string | null>(null)

  // --- TRADING MODE: buy/sell simulation ---
  const [balance, setBalance] = useState(10000)
  const [position, setPosition] = useState<"long" | "short" | null>(null)
  const [entryPrice, setEntryPrice] = useState<number | null>(null)
  const [currentPrice, setCurrentPrice] = useState(100)
  const [priceHistory, setPriceHistory] = useState<number[]>([100])
  const [tradeCandles, setTradeCandles] = useState<Candle[]>([])
  const tradeCanvasRef = useRef<HTMLCanvasElement>(null)

  // Identify mode: draw chart
  useEffect(() => {
    if (!isIdentifyMode || !canvasRef.current) return
    drawCandlestickChart(canvasRef.current, identifyCandles, tappedCandle, "#facc15")
  }, [isIdentifyMode, identifyCandles, tappedCandle])

  // Observe mode: draw chart
  useEffect(() => {
    if (!isObserveMode || !canvasRef.current) return
    drawCandlestickChart(canvasRef.current, observeCandles)
  }, [isObserveMode, observeCandles])

  // Trading mode: live price updates with candle data
  useEffect(() => {
    if (!isTradingMode || showExplanation) return

    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 3
        const newPrice = Math.max(50, Math.min(200, prev + change))
        setPriceHistory((h) => [...h.slice(-60), newPrice])

        // Build candles from price history
        setTradeCandles((prevCandles) => {
          const lastCandle = prevCandles[prevCandles.length - 1]
          if (!lastCandle || Math.random() > 0.85) {
            // New candle
            return [
              ...prevCandles.slice(-30),
              {
                open: prev,
                close: newPrice,
                high: Math.max(prev, newPrice),
                low: Math.min(prev, newPrice),
                isBullish: newPrice >= prev,
              },
            ]
          }
          // Update last candle
          const updated = [...prevCandles]
          const last = { ...updated[updated.length - 1] }
          last.close = newPrice
          last.high = Math.max(last.high, newPrice)
          last.low = Math.min(last.low, newPrice)
          last.isBullish = last.close >= last.open
          updated[updated.length - 1] = last
          return updated
        })

        return newPrice
      })
    }, 800)

    return () => clearInterval(interval)
  }, [isTradingMode, showExplanation])

  // Trading mode: draw candle chart
  useEffect(() => {
    if (!isTradingMode || !tradeCanvasRef.current) return
    drawCandlestickChart(tradeCanvasRef.current, tradeCandles)
  }, [isTradingMode, tradeCandles])

  // Handle identify mode tap
  const handleCanvasTap = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isIdentifyMode || showExplanation || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const w = rect.width
      const pad = 16
      const gap = (w - pad * 2) / identifyCandles.length
      const index = Math.floor((x - pad) / gap)

      if (index >= 0 && index < identifyCandles.length) {
        haptics.tap()
        setTappedCandle(index)
        const candle = identifyCandles[index]

        // Check what the question asks - green candles, biggest, etc.
        const wantsBullish =
          questionLower.includes("vert") ||
          questionLower.includes("green") ||
          questionLower.includes("hausse") ||
          questionLower.includes("bullish") ||
          questionLower.includes("monte") ||
          questionLower.includes("up")

        const wantsBearish =
          questionLower.includes("rouge") ||
          questionLower.includes("red") ||
          questionLower.includes("baisse") ||
          questionLower.includes("bearish") ||
          questionLower.includes("descend") ||
          questionLower.includes("down")

        const wantsBiggest =
          questionLower.includes("grosse") ||
          questionLower.includes("biggest") ||
          questionLower.includes("grande") ||
          questionLower.includes("largest") ||
          questionLower.includes("plus haute") ||
          questionLower.includes("highest")

        let isCorrectTap = false

        if (wantsBiggest) {
          // Find the biggest candle
          const sizes = identifyCandles.map((c) => Math.abs(c.close - c.open))
          const maxSize = Math.max(...sizes)
          const biggestIdx = sizes.indexOf(maxSize)
          isCorrectTap = index === biggestIdx
          if (!isCorrectTap) {
            setIdentifyFeedback(
              t ? "Pas celle-la ! Cherche la bougie avec le plus grand corps." : "Not that one! Look for the candle with the biggest body.",
            )
          }
        } else if (wantsBearish) {
          isCorrectTap = !candle.isBullish
          if (!isCorrectTap) {
            setIdentifyFeedback(t ? "C'est une bougie verte (haussiere). Trouve une rouge !" : "That's a green (bullish) candle. Find a red one!")
          }
        } else {
          // Default: wants bullish/green
          isCorrectTap = candle.isBullish
          if (!isCorrectTap) {
            setIdentifyFeedback(t ? "C'est une bougie rouge (baissiere). Trouve une verte !" : "That's a red (bearish) candle. Find a green one!")
          }
        }

        if (isCorrectTap) {
          haptics.success()
          setIdentifyFeedback("")
          onAnswer("success")
        } else {
          haptics.error()
        }
      }
    },
    [isIdentifyMode, showExplanation, identifyCandles, questionLower, t, onAnswer],
  )

  // Handle observe mode answer
  const handleObserveAnswer = (answer: string) => {
    haptics.tap()
    setObserveChoice(answer)
    const greenCount = observeCandles.filter((c) => c.isBullish).length
    const redCount = observeCandles.filter((c) => !c.isBullish).length

    const wantsGreenCount = questionLower.includes("vert") || questionLower.includes("green")
    const expected = wantsGreenCount ? greenCount : redCount

    // Accept if close enough (+-1)
    const parsed = Number.parseInt(answer)
    if (!Number.isNaN(parsed) && Math.abs(parsed - expected) <= 1) {
      onAnswer("success")
    }
  }

  // Trading handlers
  const handleBuy = () => {
    if (position) return
    haptics.tap()
    setPosition("long")
    setEntryPrice(currentPrice)
  }

  const handleSell = () => {
    if (position) return
    haptics.tap()
    setPosition("short")
    setEntryPrice(currentPrice)
  }

  const handleClose = () => {
    if (!position || !entryPrice) return
    const priceDiff = position === "long" ? currentPrice - entryPrice : entryPrice - currentPrice
    const profit = priceDiff * 10
    const newBalance = balance + profit
    setBalance(newBalance)
    setPosition(null)
    setEntryPrice(null)

    if (newBalance > 10500) {
      haptics.success()
      onAnswer("success")
    } else if (profit > 0) {
      haptics.success()
    } else {
      haptics.error()
    }
  }

  const currentPnL = position && entryPrice ? (position === "long" ? currentPrice - entryPrice : entryPrice - currentPrice) * 10 : 0

  // ==========================
  // IDENTIFY MODE RENDER
  // ==========================
  if (isIdentifyMode) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-foreground">{localized.question}</h2>
          <p className="text-muted-foreground text-sm">
            {t ? "Appuie sur la bonne bougie sur le graphique" : "Tap the correct candle on the chart"}
          </p>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700">
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasTap}
            className="w-full touch-manipulation cursor-pointer"
            style={{ height: 220 }}
          />
        </div>

        {identifyFeedback && (
          <div className="bg-orange-500/10 border border-orange-500/40 rounded-xl p-3 text-center">
            <p className="text-orange-400 text-sm font-medium">{identifyFeedback}</p>
          </div>
        )}

        {selectedAnswer === "success" && (
          <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-3 text-center">
            <p className="text-green-400 font-bold">{t ? "Bravo ! Bonne bougie !" : "Great job! Correct candle!"}</p>
          </div>
        )}

        <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-slate-300">{t ? "Bougie verte = prix monte" : "Green candle = price went up"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm text-slate-300">{t ? "Bougie rouge = prix baisse" : "Red candle = price went down"}</span>
          </div>
        </div>
      </div>
    )
  }

  // ==========================
  // OBSERVE MODE RENDER
  // ==========================
  if (isObserveMode) {
    const greenCount = observeCandles.filter((c) => c.isBullish).length
    const redCount = observeCandles.filter((c) => !c.isBullish).length
    const choices = [String(greenCount - 2), String(greenCount), String(greenCount + 3), String(redCount)]
      .sort(() => Math.random() - 0.5)

    return (
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-foreground">{localized.question}</h2>
          <p className="text-muted-foreground text-sm">
            {t ? "Observe bien le graphique et reponds" : "Observe the chart carefully and answer"}
          </p>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700">
          <canvas ref={canvasRef} className="w-full" style={{ height: 220 }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {choices.map((c) => (
            <button
              type="button"
              key={c}
              onPointerDown={(e) => {
                e.preventDefault()
                handleObserveAnswer(c)
              }}
              disabled={showExplanation}
              className={`p-4 rounded-xl border-2 text-lg font-bold transition-all touch-manipulation select-none ${
                observeChoice === c
                  ? selectedAnswer === "success"
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : "border-red-500 bg-red-500/20 text-red-400"
                  : "border-slate-700 bg-slate-800/50 text-foreground hover:border-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ==========================
  // TRADING MODE RENDER
  // ==========================
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2 text-foreground">{localized.question}</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t ? "Solde" : "Balance"}</p>
          <p className="text-base font-bold text-foreground">${balance.toFixed(0)}</p>
        </div>
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t ? "Prix" : "Price"}</p>
          <p className="text-base font-bold text-foreground">${currentPrice.toFixed(2)}</p>
        </div>
        <div
          className={`bg-slate-800/70 border rounded-xl p-3 text-center ${
            currentPnL > 0 ? "border-green-500/50" : currentPnL < 0 ? "border-red-500/50" : "border-slate-700"
          }`}
        >
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">P&L</p>
          <p className={`text-base font-bold ${currentPnL > 0 ? "text-green-500" : currentPnL < 0 ? "text-red-500" : "text-foreground"}`}>
            {currentPnL >= 0 ? "+" : ""}${currentPnL.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Candlestick chart */}
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <canvas ref={tradeCanvasRef} className="w-full" style={{ height: 200 }} />
      </div>

      <div className="space-y-3">
        {!position ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                if (!showExplanation) handleBuy()
              }}
              disabled={showExplanation}
              className="h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 touch-manipulation select-none active:scale-[0.97] transition-transform"
            >
              <TrendingUp className="h-5 w-5" />
              {t ? "Acheter" : "Buy"}
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                if (!showExplanation) handleSell()
              }}
              disabled={showExplanation}
              className="h-14 text-lg font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 touch-manipulation select-none active:scale-[0.97] transition-transform"
            >
              <TrendingDown className="h-5 w-5" />
              {t ? "Vendre" : "Sell"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-500/10 border-2 border-blue-500/40 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-foreground">{t ? "Position ouverte" : "Open position"}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    position === "long" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {position === "long" ? "LONG" : "SHORT"}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t ? "Entree" : "Entry"}: ${entryPrice?.toFixed(2)}</span>
                <span>10 {t ? "unites" : "units"}</span>
              </div>
            </div>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                if (!showExplanation) handleClose()
              }}
              disabled={showExplanation}
              className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl touch-manipulation select-none active:scale-[0.97] transition-transform"
            >
              {t ? "Fermer la position" : "Close position"}
            </button>
          </div>
        )}
      </div>

      {/* Goal */}
      <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-3">
        <p className="text-sm font-semibold text-yellow-500">
          {t ? "Objectif : Solde > $10,500" : "Goal: Balance > $10,500"}
        </p>
        <div className="mt-2 h-2 bg-yellow-500/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, ((balance - 10000) / 500) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
