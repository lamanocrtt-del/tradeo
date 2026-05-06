"use client"

import { useAuthStore } from "@/lib/auth-store"
import { Heart, Flame, Gem, Crown, Infinity, Coins } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { haptics } from "@/lib/haptics"
import { useTranslation, useI18n } from "@/lib/i18n"
import { QuestBadge } from "./quest-badge"

export function Header() {
  const { user, isDemo, isHydrated } = useAuthStore()
  const t = useTranslation()
  const { language } = useI18n()

  // Show login button only if hydrated and no user (not logged in)
  // isDemo means demo user IS logged in, not that they need to log in
  if (isHydrated && !user) {
    return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background">
      <div className="container flex h-14 items-center justify-between px-3">
        <div className="flex items-center">
          <span className="text-lg font-bold text-green-500">tradeo</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-primary font-semibold">
            {language === "fr" ? "Se connecter" : "Log in"}
          </Button>
        </Link>
      </div>
    </header>
    )
  }
  
  // While hydrating, show minimal header without login button to prevent flash
  if (!isHydrated) {
    return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background">
      <div className="container flex h-14 items-center justify-between px-3">
        <div className="flex items-center">
          <span className="text-lg font-bold text-green-500">tradeo</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background">
      <div className="container flex h-14 items-center justify-between px-3">
        <div className="flex items-center">
          <span className="text-lg font-bold text-green-500">tradeo</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Streak */}
          <button
            onClick={() => haptics.tap()}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors"
          >
            <Flame className="h-4 w-4" />
            <span className="font-bold text-xs">{user?.currentStreak || user?.streak || 0}</span>
          </button>

          {/* Coins */}
          <button
            onClick={() => haptics.tap()}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors"
          >
            <Coins className="h-4 w-4" />
            <span className="font-bold text-xs">{user?.coins || 0}</span>
          </button>

          {/* Gems */}
          <button
            onClick={() => haptics.tap()}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
          >
            <Gem className="h-4 w-4" />
            <span className="font-bold text-xs">{user?.gems || 0}</span>
          </button>

          {/* Hearts */}
          <button
            onClick={() => haptics.tap()}
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
              user?.isPremium
                ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
            }`}
          >
            <Heart className="h-4 w-4 fill-current" />
            {user?.isPremium ? (
              <Infinity className="h-3.5 w-3.5" />
            ) : (
              <span className="font-bold text-xs">
                {user?.hearts || 0}
              </span>
            )}
          </button>

          {/* Premium badge */}
          {user?.isPremium && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Crown className="h-3 w-3 text-amber-400" />
            </div>
          )}

          {/* Quest button */}
          <Link 
            href="/quests"
            onClick={() => haptics.tap()}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
          >
            <QuestBadge />
          </Link>

          {/* Profile */}
          <Link href="/profile" onClick={() => haptics.tap()}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs hover:shadow-lg transition-shadow">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
