"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { TradingChart } from "./trading-chart"
import { Card } from "./ui/card"
import { TrendingUp, TrendingDown, MinusCircle } from "lucide-react"
import type { User } from "@/lib/types"

interface TradingSimulatorProps {
  user: User | null
}

export function TradingSimulator({ user }: TradingSimulatorProps) {
  const [balance, setBalance] = useState(10000)
  const [position, setPosition] = useState<{ type: "long" | "short"; shares: number; entryPrice: number } | null>(null)
  const [currentPrice, setCurrentPrice] = useState(100)
  const [priceHistory, setPriceHistory] = useState<number[]>([100])
  const [totalTrades, setTotalTrades] = useState(0)
  const [winningTrades, setWinningTrades] = useState(0)

  // Simulate price movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 3
        const newPrice = Math.max(50, Math.min(200, prev + change))
        setPriceHistory((history) => [...history.slice(-100), newPrice])
        return newPrice
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleBuy = () => {
    if (position) {
      alert("Ferme ta position actuelle d'abord")
      return
    }
    setPosition({ type: "long", shares: 10, entryPrice: currentPrice })
  }

  const handleSell = () => {
    if (position) {
      alert("Ferme ta position actuelle d'abord")
      return
    }
    setPosition({ type: "short", shares: 10, entryPrice: currentPrice })
  }

  const handleClose = () => {
    if (!position) return

    const priceDiff = position.type === "long" ? currentPrice - position.entryPrice : position.entryPrice - currentPrice
    const profit = priceDiff * position.shares
    const newBalance = balance + profit

    setBalance(newBalance)
    setTotalTrades(totalTrades + 1)
    if (profit > 0) setWinningTrades(winningTrades + 1)

    setPosition(null)
  }

  const currentPnL = position
    ? (position.type === "long" ? currentPrice - position.entryPrice : position.entryPrice - currentPrice) *
      position.shares
    : 0

  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/50 border-border/50">
          <p className="text-sm text-muted-foreground mb-1">Solde</p>
          <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/50">
          <p className="text-sm text-muted-foreground mb-1">Prix actuel</p>
          <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/50">
          <p className="text-sm text-muted-foreground mb-1">Trades</p>
          <p className="text-2xl font-bold text-secondary">{totalTrades}</p>
        </Card>
        <Card className="p-4 bg-card/50 border-border/50">
          <p className="text-sm text-muted-foreground mb-1">Taux de gain</p>
          <p
            className={`text-2xl font-bold ${Number.parseFloat(winRate) >= 50 ? "text-green-500" : "text-orange-500"}`}
          >
            {winRate}%
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-4 border-border/50">
        <TradingChart data={priceHistory} currentPrice={currentPrice} />
      </Card>

      {/* Trading Panel */}
      <Card className="p-6 bg-card/50 border-border/50">
        <h3 className="text-lg font-bold mb-4">Panneau de trading</h3>

        {!position ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleBuy}
              className="h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
            >
              <TrendingUp className="h-5 w-5" />
              Acheter (LONG)
            </Button>
            <Button
              onClick={handleSell}
              className="h-14 text-lg font-bold bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
            >
              <TrendingDown className="h-5 w-5" />
              Vendre (SHORT)
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border-2 ${position.type === "long" ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Position ouverte</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold text-white ${position.type === "long" ? "bg-green-500" : "bg-red-500"}`}
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
                  <p className="text-muted-foreground text-xs">Prix actuel</p>
                  <p className="font-bold">${currentPrice.toFixed(2)}</p>
                </div>
                <div
                  className={`text-right ${currentPnL > 0 ? "text-green-600" : currentPnL < 0 ? "text-red-600" : ""}`}
                >
                  <p className="text-muted-foreground text-xs">P&L</p>
                  <p className="font-bold">${currentPnL.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="w-full h-12 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
            >
              <MinusCircle className="h-5 w-5" />
              Fermer la position
            </Button>
          </div>
        )}
      </Card>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border/50">
          <p className="font-semibold mb-2">📊 Ordres avancés</p>
          <p className="text-sm text-muted-foreground">Limit, Stop Loss, Take Profit</p>
        </Card>
        <Card className="p-4 border-border/50">
          <p className="font-semibold mb-2">📈 Indicateurs techniques</p>
          <p className="text-sm text-muted-foreground">RSI, MACD, Bollinger, EMA</p>
        </Card>
        <Card className="p-4 border-border/50">
          <p className="font-semibold mb-2">🎯 Backtesting</p>
          <p className="text-sm text-muted-foreground">Teste tes stratégies</p>
        </Card>
      </div>
    </div>
  )
}
