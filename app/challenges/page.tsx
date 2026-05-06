"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { haptics } from "@/lib/haptics"
import { Zap } from "lucide-react"

const DAILY_CHALLENGES = [
  {
    id: "complete-3-lessons",
    title: "Complète 3 leçons",
    description: "Termine 3 leçons du jour",
    reward: 150,
    icon: "📚",
  },
  {
    id: "earn-500-xp",
    title: "Gagne 500 XP",
    description: "Accumule 500 points d'expérience",
    reward: 250,
    icon: "⭐",
  },
  {
    id: "perfect-practice",
    title: "Séance parfaite",
    description: "Complète une séance de pratique sans erreurs",
    reward: 300,
    icon: "🎯",
  },
  {
    id: "streak-5",
    title: "Série de 5 jours",
    description: "Maintiens une série de 5 jours consécutifs",
    reward: 500,
    icon: "🔥",
  },
]

export default function ChallengesPage() {
  const router = useRouter()
  const { user, isDemo, completeDailyChallenge } = useAuthStore()
  const [claimedRewards, setClaimedRewards] = useState<string[]>([])

  useEffect(() => {
    if (!user && !isDemo) {
      router.push("/")
    }
  }, [user, isDemo, router])

  const handleClaimReward = (challengeId: string, reward: number) => {
    haptics.success()
    completeDailyChallenge(challengeId)
    setClaimedRewards([...claimedRewards, challengeId])
  }

  if (!user && !isDemo) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 pt-6">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">Défis quotidiens</h1>
              <p className="text-muted-foreground mt-2">Complète les défis pour gagner des récompenses</p>
            </div>

            <div className="grid gap-4">
              {DAILY_CHALLENGES.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{challenge.icon}</span>
                        <h3 className="text-lg font-semibold text-foreground">{challenge.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold text-yellow-500 mb-2">
                        <Zap className="h-5 w-5" />
                        {challenge.reward}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleClaimReward(challenge.id, challenge.reward)}
                        disabled={claimedRewards.includes(challenge.id)}
                        className={claimedRewards.includes(challenge.id) ? "opacity-50" : ""}
                      >
                        {claimedRewards.includes(challenge.id) ? "Réclamé" : "Réclamer"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
