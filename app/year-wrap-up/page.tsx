"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Flame, Target, TrendingUp, Award, Calendar, Sparkles } from "lucide-react"
import { haptics } from "@/lib/haptics"

export default function YearWrapUpPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const yearStats = {
    totalXP: user.xp,
    lessonsCompleted: user.completedLessons?.length || 0,
    longestStreak: user.longestStreak || 0,
    currentLeague: user.league,
    totalGems: user.gems,
    hoursLearned: Math.floor((user.xp / 100) * 1.5),
    topAchievement: "Expert Trader",
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-8">
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

          {/* Hero Section */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 text-white text-center mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <Sparkles className="h-12 w-12 mx-auto mb-4 animate-pulse" />
              <h1 className="text-4xl font-bold mb-2">Ton année {currentYear}</h1>
              <p className="text-white/90 text-lg">Voici un récapitulatif de ton parcours</p>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
              <Trophy className="h-8 w-8 mb-3" />
              <p className="text-4xl font-bold mb-1">{yearStats.totalXP.toLocaleString()}</p>
              <p className="text-white/90 text-sm">XP Total</p>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-white">
              <Target className="h-8 w-8 mb-3" />
              <p className="text-4xl font-bold mb-1">{yearStats.lessonsCompleted}</p>
              <p className="text-white/90 text-sm">Leçons complétées</p>
            </div>

            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white">
              <Flame className="h-8 w-8 mb-3" />
              <p className="text-4xl font-bold mb-1">{yearStats.longestStreak}</p>
              <p className="text-white/90 text-sm">Plus longue série</p>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 text-white">
              <Calendar className="h-8 w-8 mb-3" />
              <p className="text-4xl font-bold mb-1">{yearStats.hoursLearned}h</p>
              <p className="text-white/90 text-sm">Temps d'apprentissage</p>
            </div>
          </div>

          {/* Achievement Section */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Ton plus beau succès
            </h2>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 text-center">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">{yearStats.topAchievement}</p>
              <p className="text-sm text-muted-foreground capitalize">Ligue {yearStats.currentLeague}</p>
            </div>
          </div>

          {/* Progress Message */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-8">
            <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">Tu as progressé incroyablement!</h3>
            <p className="text-muted-foreground">
              En {currentYear}, tu as consacré{" "}
              <span className="font-bold text-foreground">{yearStats.hoursLearned} heures</span> à maîtriser le trading.
              Continue comme ça en {currentYear + 1}!
            </p>
          </div>

          {/* Share Button */}
          <Button
            className="w-full h-12 font-bold"
            onClick={() => {
              haptics.tap()
              alert("Fonctionnalité de partage bientôt disponible!")
            }}
          >
            Partager mon année
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
