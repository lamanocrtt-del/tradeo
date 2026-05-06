"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, Trophy, Lock, Star } from "lucide-react"
import { haptics } from "@/lib/haptics"

export default function AchievementsPage() {
  const router = useRouter()

  const achievements = [
    { name: "Premier pas", emoji: "👣", description: "Complète ta première leçon", unlocked: true },
    { name: "Trader En Herbe", emoji: "🌱", description: "Complète 10 leçons", unlocked: true },
    { name: "Séquence d'Or", emoji: "🔥", description: "Atteins 7 jours de série", unlocked: false },
    { name: "Maître de l'Analyse", emoji: "📊", description: "Complète la Section 2", unlocked: false },
    { name: "Gestionnaire de Risques", emoji: "🛡️", description: "Complète la Section 3", unlocked: false },
    { name: "Psycahanalyste du Trading", emoji: "🧠", description: "Complète la Section 4", unlocked: false },
    { name: "Millionnaire Virtuel", emoji: "💰", description: "Gagne 1M en simulation", unlocked: false },
    { name: "Champiion des Ligues", emoji: "🏆", description: "Gagne 5 ligues", unlocked: false },
  ]

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100)

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
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Réussites</h1>
            <p className="text-muted-foreground">
              {unlockedCount} / {achievements.length} réussites débloquées
            </p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                className={`rounded-xl p-4 border-2 transition cursor-pointer hover:scale-105 ${
                  achievement.unlocked
                    ? "bg-card border-primary/30 hover:border-primary"
                    : "bg-card/50 border-border opacity-60"
                }`}
                onClick={() => haptics.tap()}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl ${achievement.unlocked ? "" : "opacity-30 grayscale"}`}>
                    {achievement.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{achievement.name}</h3>
                      {achievement.unlocked && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      {!achievement.unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
