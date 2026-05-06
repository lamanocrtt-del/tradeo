"use client"

import { useState, useRef, useEffect } from "react"
import { TrendingUp, Wallet, Target, BarChart3, ChevronRight, ChevronLeft, Play } from "lucide-react"

interface TradingIntroProps {
  onComplete: () => void
}

const SLIDES = [
  {
    icon: BarChart3,
    title: "Bienvenue dans le Simulateur de Trading",
    subtitle: "Apprends a trader sans risque",
    description:
      "Tu vas pouvoir t'entrainer sur de vrais graphiques avec de l'argent virtuel. Aucun risque, que de l'apprentissage.",
    color: "#00d4ff",
    bgGradient: "from-[#00d4ff]/20 to-transparent",
  },
  {
    icon: Wallet,
    title: "10 000$ Virtuels",
    subtitle: "Ton capital de depart",
    description:
      "Tu commences avec 10 000$ virtuels. Utilise-les pour acheter et vendre des cryptos et des actions. Ce n'est pas du vrai argent.",
    color: "#10b981",
    bgGradient: "from-[#10b981]/20 to-transparent",
  },
  {
    icon: Target,
    title: "Ton Objectif",
    subtitle: "Fais grandir ton portefeuille",
    description:
      "Applique les strategies que tu as apprises dans les lecons. Analyse les graphiques, identifie les patterns et place tes trades au bon moment.",
    color: "#f59e0b",
    bgGradient: "from-[#f59e0b]/20 to-transparent",
  },
  {
    icon: TrendingUp,
    title: "Comment ca Marche",
    subtitle: "Achete bas, vends haut",
    description:
      "Choisis une paire (BTC, ETH, AAPL...), analyse le graphique en temps reel, puis achete ou vends. Suis tes profits et pertes en direct.",
    color: "#a855f7",
    bgGradient: "from-[#a855f7]/20 to-transparent",
  },
]

export function TradingIntro({ onComplete }: TradingIntroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [isAnimating, setIsAnimating] = useState(false)
  const touchStartX = useRef(0)

  const isLastSlide = currentSlide === SLIDES.length - 1

  const goToSlide = (index: number, dir: "left" | "right") => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(dir)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const next = () => {
    if (isLastSlide) {
      onComplete()
    } else {
      goToSlide(currentSlide + 1, "right")
    }
  }

  const prev = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1, "left")
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < SLIDES.length - 1) next()
      else if (diff < 0 && currentSlide > 0) prev()
    }
  }

  // Animated mini chart for first slide
  const MiniChart = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = 280 * dpr
      canvas.height = 120 * dpr
      ctx.scale(dpr, dpr)

      let frame = 0
      let animId: number

      const draw = () => {
        ctx.clearRect(0, 0, 280, 120)

        // Draw grid
        ctx.strokeStyle = "rgba(255,255,255,0.05)"
        ctx.lineWidth = 1
        for (let y = 20; y < 120; y += 25) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(280, y)
          ctx.stroke()
        }

        // Draw price line
        const points: [number, number][] = []
        for (let x = 0; x < 280; x += 4) {
          const baseY = 60
          const wave1 = Math.sin((x + frame * 2) * 0.02) * 25
          const wave2 = Math.sin((x + frame * 3) * 0.035) * 12
          const wave3 = Math.cos((x + frame) * 0.01) * 8
          const y = baseY - wave1 - wave2 - wave3
          points.push([x, y])
        }

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 120)
        gradient.addColorStop(0, "rgba(0, 212, 255, 0.15)")
        gradient.addColorStop(1, "rgba(0, 212, 255, 0)")
        ctx.beginPath()
        ctx.moveTo(points[0][0], points[0][1])
        for (const [x, y] of points) ctx.lineTo(x, y)
        ctx.lineTo(280, 120)
        ctx.lineTo(0, 120)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()

        // Line
        ctx.beginPath()
        ctx.moveTo(points[0][0], points[0][1])
        for (const [x, y] of points) ctx.lineTo(x, y)
        ctx.strokeStyle = "#00d4ff"
        ctx.lineWidth = 2
        ctx.stroke()

        // Current price dot
        const lastPoint = points[points.length - 1]
        ctx.beginPath()
        ctx.arc(lastPoint[0], lastPoint[1], 4, 0, Math.PI * 2)
        ctx.fillStyle = "#00d4ff"
        ctx.fill()
        ctx.beginPath()
        ctx.arc(lastPoint[0], lastPoint[1], 8, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(0, 212, 255, 0.3)"
        ctx.lineWidth = 2
        ctx.stroke()

        frame++
        animId = requestAnimationFrame(draw)
      }

      draw()
      return () => cancelAnimationFrame(animId)
    }, [])

    return (
      <canvas
        ref={canvasRef}
        style={{ width: 280, height: 120 }}
        className="rounded-xl"
      />
    )
  }

  const slide = SLIDES[currentSlide]
  const Icon = slide.icon

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top spacing */}
      <div className="flex-1 min-h-[60px]" />

      {/* Slide content */}
      <div className="flex flex-col items-center px-6 text-center">
        {/* Icon circle */}
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${slide.bgGradient} flex items-center justify-center mb-6 border border-border`}
          style={{ boxShadow: `0 0 40px ${slide.color}20` }}
        >
          <Icon className="w-10 h-10" style={{ color: slide.color }} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2 leading-tight text-balance">
          {slide.title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm font-semibold mb-4" style={{ color: slide.color }}>
          {slide.subtitle}
        </p>

        {/* Description */}
        <p className="text-muted-foreground text-base leading-relaxed max-w-sm text-pretty">
          {slide.description}
        </p>

        {/* Visual element for first slide */}
        {currentSlide === 0 && (
          <div className="mt-8 bg-card border border-border rounded-2xl p-4">
            <MiniChart />
          </div>
        )}

        {/* Balance preview for slide 2 */}
        {currentSlide === 1 && (
          <div className="mt-8 bg-card border border-border rounded-2xl p-6 w-full max-w-xs">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
              Ton solde virtuel
            </p>
            <p className="text-4xl font-bold text-[#10b981] font-mono">
              $10,000
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Wallet className="w-3.5 h-3.5" />
              <span>Argent fictif - aucun risque reel</span>
            </div>
          </div>
        )}

        {/* Trophy list for slide 3 */}
        {currentSlide === 2 && (
          <div className="mt-8 flex gap-3">
            {["$100", "$500", "$1K", "$5K"].map((label, i) => (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1"
                style={{
                  opacity: 0.5 + i * 0.15,
                  borderColor: i === 3 ? "#f59e0b" : undefined,
                }}
              >
                <span className="text-lg">
                  {["🥉", "🥈", "🥇", "🏆"][i]}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pairs preview for slide 4 */}
        {currentSlide === 3 && (
          <div className="mt-8 grid grid-cols-3 gap-2 w-full max-w-xs">
            {[
              { symbol: "BTC", color: "#f7931a" },
              { symbol: "ETH", color: "#627eea" },
              { symbol: "SOL", color: "#9945ff" },
              { symbol: "AAPL", color: "#555555" },
              { symbol: "TSLA", color: "#cc0000" },
              { symbol: "BNB", color: "#f3ba2f" },
            ].map((pair) => (
              <div
                key={pair.symbol}
                className="bg-card border border-border rounded-xl py-2.5 px-3 text-center"
              >
                <div
                  className="w-6 h-6 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: pair.color + "30", border: `1px solid ${pair.color}50` }}
                />
                <span className="text-xs font-bold text-foreground">{pair.symbol}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[40px]" />

      {/* Bottom controls */}
      <div className="px-6 pb-8 safe-area-bottom">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i, i > currentSlide ? "right" : "left")}
              className="transition-all duration-300"
              aria-label={`Slide ${i + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "w-8"
                    : "w-2 bg-muted-foreground/30"
                }`}
                style={
                  i === currentSlide ? { backgroundColor: slide.color } : undefined
                }
              />
            </button>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          {currentSlide > 0 && (
            <button
              onClick={prev}
              className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={next}
            className="flex-1 h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{
              backgroundColor: slide.color,
              color: "#0a0e14",
            }}
          >
            {isLastSlide ? (
              <>
                <Play className="w-5 h-5" />
                Commencer a trader
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
