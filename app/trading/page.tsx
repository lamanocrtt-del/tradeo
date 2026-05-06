"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { BottomNav } from "@/components/bottom-nav"
import { useI18n } from "@/lib/i18n"
import { TradingIntro } from "@/components/trading-intro"
import { haptics } from "@/lib/haptics"
import { motion, AnimatePresence } from "framer-motion"

interface Candle {
  open: number
  high: number
  low: number
  close: number
  time: number
}

// EUR/USD Flag Logo
const EurUsdLogo = () => (
  <svg viewBox="0 0 48 48" className="h-full w-full">
    <circle cx="24" cy="24" r="23" fill="#003399"/>
    <circle cx="24" cy="24" r="16" fill="#fff"/>
    <circle cx="24" cy="24" r="16" fill="url(#usFlag)"/>
    <defs>
      <pattern id="usFlag" patternUnits="objectBoundingBox" width="1" height="1">
        <rect width="32" height="32" fill="#bf0a30"/>
        <rect y="2.5" width="32" height="2.5" fill="#fff"/>
        <rect y="7.5" width="32" height="2.5" fill="#fff"/>
        <rect y="12.5" width="32" height="2.5" fill="#fff"/>
        <rect y="17.5" width="32" height="2.5" fill="#fff"/>
        <rect y="22.5" width="32" height="2.5" fill="#fff"/>
        <rect y="27.5" width="32" height="2.5" fill="#fff"/>
        <rect width="13" height="17" fill="#002868"/>
      </pattern>
    </defs>
    <g transform="translate(6, 8)">
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
        <polygon
          key={i}
          points="9,0 10.5,5 16,5 11.5,8 13,14 9,10 5,14 6.5,8 2,5 7.5,5"
          fill="#ffcc00"
          transform={`rotate(${i * 30}, 9, 9) scale(0.35) translate(${9 + 20 * Math.cos(i * 30 * Math.PI / 180)}, ${9 + 20 * Math.sin(i * 30 * Math.PI / 180)})`}
        />
      ))}
    </g>
  </svg>
)

// Bitcoin Logo
const BitcoinLogo = () => (
  <svg viewBox="0 0 48 48" className="h-full w-full">
    <circle cx="24" cy="24" r="23" fill="#f7931a"/>
    <path d="M33.5 20.8c.5-3.4-2.1-5.2-5.6-6.4l1.1-4.6-2.8-.7-1.1 4.5c-.7-.2-1.5-.4-2.2-.5l1.1-4.5-2.8-.7-1.1 4.6c-.6-.1-1.2-.3-1.7-.4l-3.9-1-.7 3s2.1.5 2 .5c1.1.3 1.3 1 1.3 1.6l-1.3 5.4c.1 0 .2 0 .3.1l-.3-.1-1.9 7.5c-.1.4-.5.9-1.3.7 0 0-2-.5-2-.5l-1.4 3.2 3.7.9c.7.2 1.4.4 2 .5l-1.2 4.7 2.8.7 1.1-4.6c.8.2 1.5.4 2.2.6l-1.1 4.5 2.8.7 1.2-4.7c4.7.9 8.2.5 9.7-3.7 1.2-3.4-.1-5.3-2.5-6.6 1.8-.4 3.1-1.6 3.5-4zm-6.2 8.7c-.9 3.5-6.7 1.6-8.6 1.1l1.5-6.2c1.9.5 8 1.4 7.1 5.1zm.9-8.8c-.8 3.2-5.7 1.6-7.3 1.2l1.4-5.6c1.6.4 6.7 1.1 5.9 4.4z" fill="#fff"/>
  </svg>
)

// Gold Logo
const GoldLogo = () => (
  <svg viewBox="0 0 48 48" className="h-full w-full">
    <circle cx="24" cy="24" r="23" fill="#fbbf24"/>
    <g transform="translate(8, 10)">
      <polygon points="16,0 20,8 32,8 22,14 26,24 16,18 6,24 10,14 0,8 12,8" fill="#fff"/>
      <rect x="10" y="20" width="12" height="8" rx="1" fill="#d97706"/>
      <rect x="11" y="21" width="10" height="6" rx="0.5" fill="#fcd34d"/>
    </g>
  </svg>
)

// Oil Logo  
const OilLogo = () => (
  <svg viewBox="0 0 48 48" className="h-full w-full">
    <circle cx="24" cy="24" r="23" fill="#1f2937"/>
    <path d="M24 8c-2 0-4 6-4 12 0 4 1.8 7.5 4 9 2.2-1.5 4-5 4-9 0-6-2-12-4-12z" fill="#60a5fa"/>
    <ellipse cx="24" cy="32" rx="8" ry="4" fill="#374151"/>
    <ellipse cx="24" cy="31" rx="7" ry="3" fill="#4b5563"/>
    <rect x="20" y="34" width="8" height="6" rx="1" fill="#374151"/>
  </svg>
)

// Assets with SVG logos
const ASSETS = [
  { id: "eurusd", symbol: "EUR/USD", name: "EUR/USD", basePrice: 1.16241, Logo: EurUsdLogo },
  { id: "btc", symbol: "BTC/USD", name: "Bitcoin", basePrice: 68572.21, Logo: BitcoinLogo },
  { id: "gold", symbol: "XAU/USD", name: "Gold", basePrice: 4761.85, Logo: GoldLogo },
  { id: "oil", symbol: "OIL/USD", name: "Oil", basePrice: 98.90, Logo: OilLogo },
]

function generateCandles(base: number, count: number): Candle[] {
  const candles: Candle[] = []
  let price = base * 0.998
  for (let i = 0; i < count; i++) {
    const volatility = price * 0.002
    const open = price
    const direction = Math.random() > 0.45 ? 1 : -1
    const close = open + direction * Math.random() * volatility
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    candles.push({ open, high, low, close, time: Date.now() - (count - i) * 60000 })
    price = close
  }
  return candles
}

function nextCandle(prev: Candle): Candle {
  const volatility = prev.close * 0.0015
  const open = prev.close
  const direction = Math.random() > 0.45 ? 1 : -1
  const close = open + direction * Math.random() * volatility
  return { 
    open, 
    high: Math.max(open, close) + Math.random() * volatility * 0.4, 
    low: Math.min(open, close) - Math.random() * volatility * 0.4, 
    close, 
    time: Date.now() 
  }
}

export default function TradingPage() {
  const router = useRouter()
  const { user, isDemo, updateUser } = useAuthStore()
  const { language } = useI18n()
  const [showIntro, setShowIntro] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(0)
  const [candles, setCandles] = useState<Record<string, Candle[]>>({})
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [chartMode, setChartMode] = useState<"line" | "candle">("candle")
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeDirection, setTradeDirection] = useState<"buy" | "sell">("buy")
  const [tradeAmount, setTradeAmount] = useState(1000)
  const [tradeLeverage, setTradeLeverage] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const balance = user?.tradingBalance ?? 10100

  useEffect(() => {
    if (user && !user.hasSeenTradingIntro) setShowIntro(true)
  }, [user])

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    updateUser({ hasSeenTradingIntro: true })
  }, [updateUser])

  useEffect(() => {
    const initialCandles: Record<string, Candle[]> = {}
    const initialPrices: Record<string, number> = {}
    ASSETS.forEach(asset => {
      const c = generateCandles(asset.basePrice, 60)
      initialCandles[asset.id] = c
      initialPrices[asset.id] = c[c.length - 1].close
    })
    setCandles(initialCandles)
    setPrices(initialPrices)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles(prev => {
        const updated: Record<string, Candle[]> = {}
        const newPrices: Record<string, number> = {}
        ASSETS.forEach(asset => {
          const existing = prev[asset.id]
          if (!existing?.length) return
          const nc = nextCandle(existing[existing.length - 1])
          updated[asset.id] = [...existing.slice(-59), nc]
          newPrices[asset.id] = nc.close
        })
        setPrices(newPrices)
        return updated
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    const asset = ASSETS[selectedAsset]
    const data = candles[asset.id]
    if (!canvas || !data?.length) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    const W = rect.width
    const H = rect.height
    const PADDING_RIGHT = 60
    const PADDING_TOP = 10
    const PADDING_BOTTOM = 25
    
    ctx.fillStyle = "#0d1117"
    ctx.fillRect(0, 0, W, H)
    
    const displayData = data.slice(-50)
    const allValues = displayData.flatMap(c => [c.high, c.low])
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const range = (maxVal - minVal) || 1
    
    const candleWidth = (W - PADDING_RIGHT) / displayData.length
    const chartHeight = H - PADDING_TOP - PADDING_BOTTOM
    
    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = PADDING_TOP + (chartHeight * i / 4)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W - PADDING_RIGHT, y)
      ctx.stroke()
      
      const priceAtLine = maxVal - (range * i / 4)
      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.font = "10px -apple-system, system-ui, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(priceAtLine.toFixed(asset.id === "btc" ? 0 : 5), W - PADDING_RIGHT + 5, y + 4)
    }
    
    if (chartMode === "candle") {
      displayData.forEach((candle, i) => {
        const x = i * candleWidth + candleWidth / 2
        const yHigh = PADDING_TOP + ((maxVal - candle.high) / range) * chartHeight
        const yLow = PADDING_TOP + ((maxVal - candle.low) / range) * chartHeight
        const yOpen = PADDING_TOP + ((maxVal - candle.open) / range) * chartHeight
        const yClose = PADDING_TOP + ((maxVal - candle.close) / range) * chartHeight
        
        const isGreen = candle.close >= candle.open
        const color = isGreen ? "#22c55e" : "#ef4444"
        
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, yHigh)
        ctx.lineTo(x, yLow)
        ctx.stroke()
        
        ctx.fillStyle = color
        const bodyTop = Math.min(yOpen, yClose)
        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen))
        const bodyWidth = Math.max(3, candleWidth * 0.65)
        ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight)
      })
    } else {
      ctx.beginPath()
      displayData.forEach((candle, i) => {
        const x = i * candleWidth + candleWidth / 2
        const y = PADDING_TOP + ((maxVal - candle.close) / range) * chartHeight
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()
    }
    
    // Current price line
    const currentPrice = prices[asset.id] || asset.basePrice
    const currentY = PADDING_TOP + ((maxVal - currentPrice) / range) * chartHeight
    
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, currentY)
    ctx.lineTo(W - PADDING_RIGHT, currentY)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Price badge
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.roundRect(W - PADDING_RIGHT + 2, currentY - 10, 55, 20, 4)
    ctx.fill()
    
    ctx.fillStyle = "#fff"
    ctx.font = "bold 10px -apple-system, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(currentPrice.toFixed(asset.id === "btc" ? 0 : 5), W - PADDING_RIGHT + 30, currentY + 4)
    
  }, [candles, selectedAsset, chartMode, prices])

  useEffect(() => { drawChart() }, [drawChart])

  useEffect(() => {
    if (!user && !isDemo) router.push("/")
  }, [user, isDemo, router])

  const openTrade = (direction: "buy" | "sell") => {
    haptics.tap()
    setTradeDirection(direction)
    setShowTradeModal(true)
  }

  const executeTrade = () => {
    haptics.success()
    setShowTradeModal(false)
    const profit = (Math.random() - 0.4) * tradeAmount * tradeLeverage * 0.02
    updateUser({
      tradingBalance: balance + profit,
      tradingTotal: (user?.tradingTotal || 0) + 1,
      tradingWins: profit > 0 ? (user?.tradingWins || 0) + 1 : user?.tradingWins,
    })
  }

  if (showIntro) return <TradingIntro onComplete={handleIntroComplete} />
  if (!user && !isDemo) return null

  const asset = ASSETS[selectedAsset]
  const currentPrice = prices[asset.id] || asset.basePrice
  const candleData = candles[asset.id] || []
  const firstPrice = candleData.length > 0 ? candleData[0].open : currentPrice
  const priceChange = currentPrice - firstPrice
  const percentChange = (priceChange / firstPrice) * 100
  const isPositive = percentChange >= 0

  const texts = language === "en" ? {
    portfolio: "Virtual portfolio",
    today: "Today",
    amount: "Amount",
    leverage: "Leverage",
    sell: "SELL",
    buy: "BUY",
    confirm: "Confirm trade",
  } : {
    portfolio: "Portefeuille virtuel",
    today: "Aujourd'hui",
    amount: "Montant",
    leverage: "Levier",
    sell: "VENDRE",
    buy: "ACHETER",
    confirm: "Confirmer le trade",
  }

  const AssetLogo = asset.Logo

  return (
    <>
    <div className="flex flex-col bg-[#0d1117] overflow-hidden" style={{ height: 'calc(100dvh - 64px)' }}>
      {/* Header compact */}
      <header className="px-4 pt-3 pb-1 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wide">{texts.portfolio}</p>
            <p className="text-xl font-bold text-white">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <button 
            onClick={() => setChartMode(m => m === "line" ? "candle" : "line")}
            className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center active:scale-95"
          >
            <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Asset selector compact */}
      <div className="px-2 py-1.5 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {ASSETS.map((a, idx) => {
            const p = prices[a.id] || a.basePrice
            const cd = candles[a.id] || []
            const fp = cd.length > 0 ? cd[0].open : p
            const ch = ((p - fp) / fp) * 100
            const up = ch >= 0
            const Logo = a.Logo
            
            return (
              <button
                key={a.id}
                onClick={() => { setSelectedAsset(idx); haptics.tap() }}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                  selectedAsset === idx ? "bg-white/15 ring-1 ring-blue-500/50" : "bg-white/5"
                }`}
              >
                <div className="h-10 w-10 rounded-full overflow-hidden mb-1">
                  <Logo />
                </div>
                <span className="text-[10px] font-medium text-white/90">{a.name}</span>
                <span className={`text-[9px] font-semibold ${up ? "text-green-400" : "text-red-400"}`}>
                  {up ? "+" : ""}{ch.toFixed(2)}%
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Price display compact */}
      <div className="px-4 py-1 shrink-0">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              ${asset.id === "btc" ? currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }) : currentPrice.toFixed(5)}
            </h2>
            <p className={`text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {texts.today} {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
            </p>
          </div>
          <select className="bg-white/10 text-white/80 text-xs px-2 py-1.5 rounded-lg border-0" defaultValue="1m">
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="1h">1H</option>
          </select>
        </div>
      </div>

      {/* Chart - takes remaining space but leaves room for buttons */}
      <div className="flex-1 min-h-[180px] max-h-[300px] px-2">
        <canvas ref={canvasRef} className="w-full h-full rounded-xl" />
      </div>

      {/* Trade buttons - ALWAYS visible at bottom */}
      <div className="px-4 py-4 pb-2 shrink-0 bg-[#0d1117]">
        <div className="flex gap-3">
          {/* SELL Button - Red with down arrow */}
          <button
            onClick={() => openTrade("sell")}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#ef5350] hover:bg-[#e53935] active:bg-[#c62828] rounded-xl text-white font-bold text-base transition-colors shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {texts.sell}
          </button>

          {/* BUY Button - Green with up arrow */}
          <button
            onClick={() => openTrade("buy")}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#4caf50] hover:bg-[#43a047] active:bg-[#388e3c] rounded-xl text-white font-bold text-base transition-colors shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {texts.buy}
          </button>
        </div>
      </div>

      {/* Trade Modal */}
      <AnimatePresence>
        {showTradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-end"
            onClick={() => setShowTradeModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full bg-[#161b22] rounded-t-3xl p-5 pb-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <AssetLogo />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{asset.name}</p>
                  <p className="text-white/60 text-sm">
                    ${asset.id === "btc" ? currentPrice.toFixed(2) : currentPrice.toFixed(5)}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                  tradeDirection === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {tradeDirection === "buy" ? texts.buy : texts.sell}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-white/60 mb-2">{texts.amount}</p>
                <div className="grid grid-cols-5 gap-2">
                  {[100, 500, 1000, 2000, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTradeAmount(amt)}
                      className={`py-2.5 rounded-lg text-xs font-semibold ${
                        tradeAmount === amt ? "bg-blue-500 text-white" : "bg-white/10 text-white/70"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs text-white/60 mb-2">{texts.leverage}</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 5, 10, 20, 50].map(lev => (
                    <button
                      key={lev}
                      onClick={() => setTradeLeverage(lev)}
                      className={`py-2.5 rounded-lg text-xs font-semibold ${
                        tradeLeverage === lev ? "bg-blue-500 text-white" : "bg-white/10 text-white/70"
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={executeTrade}
                className={`w-full py-4 rounded-xl font-bold text-base ${
                  tradeDirection === "buy" ? "bg-[#4caf50]" : "bg-[#ef5350]"
                } text-white`}
              >
                {texts.confirm}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <BottomNav />
    </>
  )
}
