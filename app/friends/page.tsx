"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, UserPlus, Trophy, TrendingUp } from "lucide-react"
import { haptics } from "@/lib/haptics"

export default function FriendsPage() {
  const router = useRouter()

  const friends = [
    { username: "TradingPro42", xp: 2450, streak: 12, position: 2 },
    { username: "MarketQueen", xp: 2320, streak: 8, position: 3 },
    { username: "CryptoNinja", xp: 1890, streak: 15, position: 5 },
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
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mes Amis</h1>
            <p className="text-muted-foreground">Compétitionne avec tes amis</p>
          </div>

          {/* Add Friend Button */}
          <Button className="w-full mb-8 h-11 font-bold" onClick={() => haptics.tap()}>
            <UserPlus className="h-5 w-5 mr-2" />
            Ajouter un ami
          </Button>

          {/* Friends List */}
          <div className="space-y-3">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend.username}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xl font-bold">🎯</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{friend.username}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-primary" />
                          Pos. {friend.position}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-success" />
                          Série {friend.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{friend.xp}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">Tu n'as pas encore d'amis</p>
                <Button onClick={() => haptics.tap()}>Inviter des amis</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
