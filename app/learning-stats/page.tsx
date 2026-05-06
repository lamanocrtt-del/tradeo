"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, BookOpen, Zap, Target, Clock, TrendingUp, Award } from "lucide-react"
import { haptics } from "@/lib/haptics"

export default function LearningStatsPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  if (!user) return null

  const stats = [
    {
      label: "Leçons complétées",
      value: user.completedLessons?.length || 0,
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      label: "Séquence actuelle",
      value: user.currentStreak || 0,
      icon: Zap,
      color: "text-orange-500",
    },
    {
      label: "Meilleure séquence",
      value: user.longestStreak || 0,
      icon: Award,
      color: "text-yellow-500",
    },
    {
      label: "Heures d'étude",
      value: Math.floor((user.xp / 100) * 1.5),
      icon: Clock,
      color: "text-purple-500",
    },
    {
      label: "XP gagnés",
      value: user.xp,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Taux de complétion",
      value: "72%",
      icon: Target,
      color: "text-cyan-500",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => {
              haptics.tap()
              router.back()
            }}
            className="flex items-center gap-2 text-primary mb-6 hover:opacity-80 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 bg-primary/20 rounded-full mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Statistiques d'apprentissage</h1>
            <p className="text-muted-foreground">Suivi de ta progression pédagogique</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary hover:bg-primary/5 transition"
              >
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Card */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Progression globale</h2>
            <div className="space-y-4">
              {[
                { section: "Section 1: Les Bases", progress: 100 },
                { section: "Section 2: Analyse Technique", progress: 65 },
                { section: "Section 3: Gestion du Risque", progress: 42 },
                { section: "Section 4: Psychologie", progress: 20 },
              ].map((item) => (
                <div key={item.section}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-foreground">{item.section}</p>
                    <p className="text-sm text-muted-foreground">{item.progress}%</p>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Breakdown */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Temps d'étude par jour</h2>
            <div className="space-y-3">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => {
                const height = Math.floor(Math.random() * 100) + 20
                return (
                  <div key={day} className="flex items-end gap-2 h-16">
                    <span className="text-xs text-muted-foreground w-8">{day}</span>
                    <div
                      className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t transition"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
