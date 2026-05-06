"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { BarChart3, Zap, Trophy, Target, TrendingUp } from "lucide-react"

export default function StatsPage() {
  const router = useRouter()
  const { user, isDemo } = useAuthStore()

  useEffect(() => {
    if (!user && !isDemo) {
      router.push("/")
    }
  }, [user, isDemo, router])

  if (!user && !isDemo) {
    return null
  }

  const stats = [
    {
      label: "XP Total",
      value: user?.xp || 0,
      icon: Zap,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Série actuelle",
      value: user?.streak || 0,
      icon: Target,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Leçons complétées",
      value: user?.completedLessons?.length || 0,
      icon: Trophy,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Ligue",
      value: (user?.league || "bronze").toUpperCase(),
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 pt-6">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Mes statistiques
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color} mb-3`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">Progression cette semaine</h2>
              <div className="flex justify-around items-end h-24">
                {[65, 45, 78, 92, 58, 85, 95].map((height, i) => (
                  <div key={i} className="bg-green-500 rounded-t w-6" style={{ height: `${height}%` }} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">Lun Mar Mer Jeu Ven Sam Dim</p>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
