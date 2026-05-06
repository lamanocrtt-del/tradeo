"use client"

import { Card } from "./ui/card"
import type { User } from "@/lib/types"

interface TradingStatsProps {
  user: User | null
}

export function TradingStats({ user }: TradingStatsProps) {
  const stats = [
    { label: "Total des trades", value: "24", color: "bg-blue-100 text-blue-600" },
    { label: "Taux de gain", value: "58.3%", color: "bg-green-100 text-green-600" },
    { label: "Gains totaux", value: "+$2,450", color: "bg-green-100 text-green-600" },
    { label: "Pertes totales", value: "-$890", color: "bg-red-100 text-red-600" },
    { label: "Meilleur trade", value: "+$630", color: "bg-emerald-100 text-emerald-600" },
    { label: "Plus mauvais trade", value: "-$240", color: "bg-orange-100 text-orange-600" },
    { label: "Capital actuel", value: "$11,560", color: "bg-purple-100 text-purple-600" },
    { label: "Rendement", value: "+15.6%", color: "bg-cyan-100 text-cyan-600" },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 border-border/50">
            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 border-border/50 mt-8">
        <h3 className="text-lg font-bold mb-6">Performance hebdomadaire</h3>
        <div className="space-y-3">
          {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((day, i) => (
            <div key={day} className="flex items-center gap-4">
              <span className="w-16 text-sm font-semibold">{day}</span>
              <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                  style={{ width: `${60 + i * 10}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-green-600">+{80 + i * 20}$</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
