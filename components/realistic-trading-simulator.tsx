"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { TrendingUp, TrendingDown, Settings } from "lucide-react"
import type { User } from "@/lib/types"

interface RealisticTradingSimulatorProps {
  user: User | null
}

export function RealisticTradingSimulator({ user }: RealisticTradingSimulatorProps) {
  const [balance, setBalance] = useState(100000)
  const [currentPrice, setCurrentPrice] = useState(189.0)
  const [showPassword, setShowPassword] = useState(true)
  const [selectedStock, setSelectedStock] = useState("GORO")
  const [position, setPosition] = useState<{ type: "long" | "short"; shares: number; entryPrice: number } | null>(null)
  const [priceHistory, setPriceHistory] = useState<{ time: string; price: number }[]>([
    { time: "10:00", price: 185 },
    { time: "10:15", price: 187 },
    { time: "10:30", price: 186 },
    { time: "10:45", price: 188 },
    { time: "11:00", price: 189 },
  ])

  const stocks = [
    { symbol: "GORO", name: "GORO Holdings", price: 189.0, change: 2.5, volume: "2.4M" },
    { symbol: "BBRI", name: "Bank Rakyat", price: 3650, change: 1.2, volume: "1.8M" },
    { symbol: "ASII", name: "Astra Int'l", price: 7450, change: -0.8, volume: "1.5M" },
    { symbol: "UNVR", name: "Unilever", price: 2480, change: 0.5, volume: "890K" },
    { symbol: "BREN", name: "Bren Tankindo", price: 580, change: 3.2, volume: "3.1M" },
  ]

  const selectedStockData = stocks.find((s) => s.symbol === selectedStock)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 4
        const newPrice = Math.max(150, Math.min(250, prev + change))
        setPriceHistory((history) => [
          ...history.slice(-19),
          { time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), price: newPrice },
        ])
        return newPrice
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const currentPnL = position
    ? (position.type === "long" ? currentPrice - position.entryPrice : position.entryPrice - currentPrice) *
      position.shares
    : 0

  const handleBuy = () => {
    if (position) return
    setPosition({ type: "long", shares: 50, entryPrice: currentPrice })
  }

  const handleSell = () => {
    if (position) return
    setPosition({ type: "short", shares: 50, entryPrice: currentPrice })
  }

  const handleClose = () => {
    if (!position) return
    const profit =
      (position.type === "long" ? currentPrice - position.entryPrice : position.entryPrice - currentPrice) *
      position.shares
    setBalance((b) => b + profit)
    setPosition(null)
  }

  return (
    <div className="space-y-6">
      {/* Main Trading Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Stock List */}
        <div className="lg:col-span-1">
          <Card className="p-4 border-border/50 bg-card">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-sm">📊</span> Actifs Populaires
            </h3>
            <div className="space-y-2">
              {stocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock.symbol)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedStock === stock.symbol
                      ? "bg-primary/20 border border-primary"
                      : "bg-card border border-border/30 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-3 w-3 rounded-full ${stock.change > 0 ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="font-semibold text-sm">{stock.symbol}</span>
                    <span className={`text-xs ml-auto ${stock.change > 0 ? "text-green-500" : "text-red-500"}`}>
                      {stock.change > 0 ? "+" : ""}
                      {stock.change}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                  <p className="text-sm font-bold">${stock.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Center - Chart and Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header with Balance */}
          <Card className="p-4 border-border/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">SOLDE TOTAL</p>
                <p className="text-3xl font-bold text-primary">${balance.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">ACTIF</p>
                <p className="text-lg font-bold">${selectedStockData?.price.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Chart Area */}
          <Card className="p-4 border-border/50 bg-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedStockData?.symbol}</h2>
                <p className="text-sm text-muted-foreground">{selectedStockData?.name}</p>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Mini Chart */}
            <div className="h-48 bg-slate-900/30 rounded-lg border border-border/30 p-4 mb-4 relative">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Grid */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="#334155" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#334155" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="#334155" strokeWidth="1" opacity="0.5" />

                {/* Price line */}
                <polyline
                  points={priceHistory
                    .map((p, i) => `${(i / (priceHistory.length - 1)) * 600},${100 - ((p.price - 180) / 30) * 100}`)
                    .join(" ")}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />

                {/* Current price dot */}
                <circle cx="600" cy={`${100 - ((currentPrice - 180) / 30) * 100}`} r="4" fill="#0ea5e9" />
              </svg>

              {/* Price Label */}
              <div className="absolute top-4 right-4 bg-slate-900/80 rounded px-3 py-2 border border-cyan-500/50">
                <p className="text-cyan-400 font-bold text-lg">${currentPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Chart Info */}
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="bg-slate-900/30 p-2 rounded">
                <p className="text-xs text-muted-foreground">HAUT</p>
                <p className="font-bold">${Math.max(...priceHistory.map((p) => p.price)).toFixed(2)}</p>
              </div>
              <div className="bg-slate-900/30 p-2 rounded">
                <p className="text-xs text-muted-foreground">BAS</p>
                <p className="font-bold">${Math.min(...priceHistory.map((p) => p.price)).toFixed(2)}</p>
              </div>
              <div className="bg-slate-900/30 p-2 rounded">
                <p className="text-xs text-muted-foreground">VOL</p>
                <p className="font-bold">{selectedStockData?.volume}</p>
              </div>
              <div
                className={`rounded p-2 ${selectedStockData && selectedStockData.change > 0 ? "bg-green-500/10" : "bg-red-500/10"}`}
              >
                <p className="text-xs text-muted-foreground">CHNG</p>
                <p
                  className={`font-bold ${selectedStockData && selectedStockData.change > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {selectedStockData && selectedStockData.change > 0 ? "+" : ""}
                  {selectedStockData?.change}%
                </p>
              </div>
            </div>
          </Card>

          {/* Order Panel */}
          <Card className="p-4 border-border/50 bg-card">
            {!position ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleBuy}
                  className="h-12 text-base font-bold bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  Acheter
                </Button>
                <Button
                  onClick={handleSell}
                  className="h-12 text-base font-bold bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
                >
                  <TrendingDown className="h-5 w-5" />
                  Vendre
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-xl border-2 ${
                    position.type === "long" ? "bg-green-50/10 border-green-500" : "bg-red-50/10 border-red-500"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Position ouverte</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        position.type === "long" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {position.type === "long" ? "LONG" : "SHORT"} x{position.shares}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Entrée</p>
                      <p className="font-bold">${position.entryPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Actual</p>
                      <p className="font-bold">${currentPrice.toFixed(2)}</p>
                    </div>
                    <div className={currentPnL > 0 ? "text-green-500" : "text-red-500"}>
                      <p className="text-muted-foreground text-xs">P&L</p>
                      <p className="font-bold">${currentPnL.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleClose}
                  className="w-full h-11 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Fermer la position
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Buy/Sell Side Panels */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-green-500/30 bg-green-50/5">
          <p className="text-sm font-semibold text-green-400 mb-2">Achat</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantité</span>
              <span className="font-bold">100 actions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prix</span>
              <span className="font-bold">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${(currentPrice * 100).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-red-500/30 bg-red-50/5">
          <p className="text-sm font-semibold text-red-400 mb-2">Vente</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantité</span>
              <span className="font-bold">100 actions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prix</span>
              <span className="font-bold">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${(currentPrice * 100).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
