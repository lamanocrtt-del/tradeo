"use client"

import { Card } from "./ui/card"
import type { User } from "@/lib/types"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TradingHistoryProps {
  user: User | null
}

export function TradingHistory({ user }: TradingHistoryProps) {
  const sampleTrades = [
    { id: 1, type: "long", entryPrice: 98.5, exitPrice: 102.3, shares: 10, pnl: 380, date: "Aujourd'hui 14:32" },
    { id: 2, type: "short", entryPrice: 105.2, exitPrice: 103.8, shares: 10, pnl: 140, date: "Aujourd'hui 13:15" },
    { id: 3, type: "long", entryPrice: 100, exitPrice: 99.2, shares: 10, pnl: -80, date: "Hier 16:45" },
    { id: 4, type: "long", entryPrice: 95.5, exitPrice: 101.8, shares: 10, pnl: 630, date: "Hier 12:20" },
    { id: 5, type: "short", entryPrice: 102.1, exitPrice: 104.5, shares: 10, pnl: -240, date: "Lundi 15:30" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Tous</button>
        <button className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-card/80 font-semibold text-sm">
          Gains
        </button>
        <button className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-card/80 font-semibold text-sm">
          Pertes
        </button>
      </div>

      {sampleTrades.map((trade) => (
        <Card key={trade.id} className="p-4 border-border/50 hover:bg-card/70 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${trade.type === "long" ? "bg-green-100" : "bg-red-100"}`}>
                {trade.type === "long" ? (
                  <TrendingUp className={`h-5 w-5 text-green-600`} />
                ) : (
                  <TrendingDown className={`h-5 w-5 text-red-600`} />
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {trade.type === "long" ? "LONG" : "SHORT"} x{trade.shares}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trade.entryPrice} → {trade.exitPrice}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${trade.pnl > 0 ? "text-green-600" : "text-red-600"}`}>
                {trade.pnl > 0 ? "+" : ""}
                {trade.pnl}$
              </p>
              <p className="text-xs text-muted-foreground">{trade.date}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
