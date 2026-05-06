"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { BADGES, checkBadgeUnlock } from "@/lib/badges"
import { Award, Lock } from "lucide-react"

export default function BadgesPage() {
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

  const unlockedCount = user ? BADGES.filter((badge) => checkBadgeUnlock(badge, user)).length : 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Badges</h1>
            <p className="text-muted-foreground">
              {unlockedCount} / {BADGES.length} badges débloqués
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = user ? checkBadgeUnlock(badge, user) : false

              return (
                <div
                  key={badge.id}
                  className={`bg-card border-2 rounded-2xl p-4 text-center transition-all ${
                    isUnlocked ? "border-yellow-400 bg-yellow-50" : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="relative inline-block mb-3">
                    <div
                      className={`h-16 w-16 rounded-full flex items-center justify-center text-4xl ${
                        isUnlocked ? "bg-yellow-100" : "bg-gray-100"
                      }`}
                    >
                      {isUnlocked ? badge.icon : <Lock className="h-8 w-8 text-gray-400" />}
                    </div>
                    {isUnlocked && (
                      <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
