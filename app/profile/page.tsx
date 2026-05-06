"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { AvatarIcon } from "@/components/avatar-icons"
import { AVATARS, RARITY_COLORS, RARITY_LABELS, isAvatarUnlocked } from "@/lib/avatars"
import {
  Trophy,
  Flame,
  Target,
  Settings,
  LogOut,
  Gift,
  ShoppingBag,
  Lock,
  BarChart3,
  Users,
  Camera,
  Brain,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  ScrollText,
  Coins,
  X,
} from "lucide-react"
import { haptics } from "@/lib/haptics"
import { useTranslation, useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const AVATAR_COLORS = [
  { id: "bg-red-500", color: "#EF4444" },
  { id: "bg-blue-500", color: "#3B82F6" },
  { id: "bg-green-500", color: "#22C55E" },
  { id: "bg-purple-500", color: "#A855F7" },
  { id: "bg-pink-500", color: "#EC4899" },
  { id: "bg-amber-500", color: "#F59E0B" },
  { id: "bg-indigo-500", color: "#6366F1" },
  { id: "bg-cyan-500", color: "#06B6D4" },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuthStore()
  const t = useTranslation()
  const { language } = useI18n()
  const [avatarColor, setAvatarColor] = useState("bg-purple-500")
  const [avatarIcon, setAvatarIcon] = useState("bull")
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
    if (user?.avatarColor) setAvatarColor(user.avatarColor)
    if (user?.avatarIcon) setAvatarIcon(user.avatarIcon)
  }, [user, router])

  if (!user) {
    return null
  }

  const handleColorChange = (colorId: string) => {
    haptics.tap()
    setAvatarColor(colorId)
    updateUser({ avatarColor: colorId })
  }

  const handleIconChange = (iconId: string) => {
    haptics.tap()
    setAvatarIcon(iconId)
    updateUser({ avatarIcon: iconId })
  }

  const handleLogout = () => {
    haptics.tap()
    const msg = language === "fr" ? "Es-tu sur de vouloir te deconnecter ?" : "Are you sure you want to log out?"
    if (confirm(msg)) {
      logout()
      router.push("/")
    }
  }

  // Menu items with different accent colors for each
  const menuItems = [
    { icon: ScrollText, label: language === "fr" ? "Quetes" : "Quests", href: "/quests", accent: "from-amber-500 to-orange-500", iconColor: "text-amber-400", borderColor: "border-amber-500/40", bgColor: "bg-amber-500/10" },
    { icon: Settings, label: t.profile.settings, href: "/settings", accent: "from-slate-500 to-slate-600", iconColor: "text-slate-400", borderColor: "border-slate-500/40", bgColor: "bg-slate-500/10" },
    { icon: ShoppingBag, label: language === "fr" ? "Abonnements" : "Subscriptions", href: "/premium", accent: "from-violet-500 to-purple-600", iconColor: "text-violet-400", borderColor: "border-violet-500/40", bgColor: "bg-violet-500/10" },
    { icon: BarChart3, label: t.profile.statistics, href: "/stats", accent: "from-cyan-500 to-blue-500", iconColor: "text-cyan-400", borderColor: "border-cyan-500/40", bgColor: "bg-cyan-500/10" },
    { icon: Users, label: language === "fr" ? "Amis" : "Friends", href: "/friends", accent: "from-green-500 to-emerald-500", iconColor: "text-green-400", borderColor: "border-green-500/40", bgColor: "bg-green-500/10" },
    { icon: Brain, label: language === "fr" ? "Apprentissage" : "Learning", href: "/learning-stats", accent: "from-pink-500 to-rose-500", iconColor: "text-pink-400", borderColor: "border-pink-500/40", bgColor: "bg-pink-500/10" },
    { icon: Award, label: language === "fr" ? "Reussites" : "Achievements", href: "/achievements", accent: "from-yellow-500 to-amber-500", iconColor: "text-yellow-400", borderColor: "border-yellow-500/40", bgColor: "bg-yellow-500/10" },
    { icon: Sparkles, label: t.profile.yearWrapUp, href: "/year-wrap-up", accent: "from-indigo-500 to-blue-600", iconColor: "text-indigo-400", borderColor: "border-indigo-500/40", bgColor: "bg-indigo-500/10" },
  ]

  const stats = [
    { icon: Flame, label: t.profile.currentStreak, value: user.currentStreak || 0, color: "text-orange-500" },
    { icon: Trophy, label: t.profile.totalXp, value: user.xp, color: "text-primary" },
    { icon: Target, label: t.profile.lessonsCompleted, value: user.completedLessons?.length || 0, color: "text-cyan-400" },
    { icon: Coins, label: language === "fr" ? "Pieces" : "Coins", value: user.coins || 0, color: "text-amber-400" },
    { icon: TrendingUp, label: t.profile.longestStreak, value: user.longestStreak || 0, color: "text-blue-500" },
    { icon: Clock, label: language === "fr" ? "Total d'heures" : "Total hours", value: Math.floor((user.xp / 100) * 1.5), color: "text-purple-500" },
  ]

  const unlockedAvatars = user.unlockedAvatars || ["bull"]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-3xl p-8 text-center mb-8 relative">
            <div className="relative inline-block mb-6">
              <div
                className={cn(
                  "h-32 w-32 rounded-full flex items-center justify-center shadow-lg border-4 border-primary/50 mx-auto transition hover:scale-105 text-7xl",
                  avatarColor
                )}
              >
                <AvatarIcon icon={avatarIcon} size="xl" />
              </div>
              <button
                onClick={() => {
                  haptics.tap()
                  setShowAvatarEditor(true)
                }}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-3 hover:opacity-90 transition shadow-lg"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <h1 className="text-3xl font-bold mb-1 text-foreground">{user.username}</h1>
            <p className="text-muted-foreground mb-3">{user.email}</p>
            {user.isPremium && (
              <div className="inline-block bg-amber-500/20 border border-amber-500/30 px-4 py-1 rounded-full text-sm font-semibold text-amber-400">
                Premium
              </div>
            )}
            <div className="mt-4 bg-card/50 backdrop-blur rounded-lg p-3 border border-border">
              <p className="text-sm text-muted-foreground mb-2 capitalize">
                {user.league} - {user.leagueXp || 0} / 1500 XP
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{ width: `${Math.min((user.leagueXp || 0) / 15, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Avatar Editor Modal */}
          {showAvatarEditor && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Personnaliser l{"'"}avatar
                  </h2>
                  <button onClick={() => setShowAvatarEditor(false)} className="p-2 rounded-lg hover:bg-muted transition">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Preview */}
                <div className="flex justify-center mb-6">
                  <div className={cn("h-20 w-20 rounded-full flex items-center justify-center border-4 border-primary/50 text-4xl", avatarColor)}>
                    <AvatarIcon icon={avatarIcon} size="lg" />
                  </div>
                </div>

                {/* Color selection */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3 text-foreground">Couleur</p>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleColorChange(c.id)}
                        className={cn(
                          "h-12 rounded-xl transition-all hover:scale-105",
                          c.id,
                          avatarColor === c.id ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon selection - grouped by rarity */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3 text-foreground">Icone de profil</p>
                  <p className="text-xs text-muted-foreground mb-3">Debloque de nouvelles icones dans les coffres</p>
                  
                  {(["common", "rare", "epic", "legendary"] as const).map((rarity) => {
                    const rarityAvatars = AVATARS.filter(a => a.rarity === rarity)
                    if (rarityAvatars.length === 0) return null
                    return (
                      <div key={rarity} className="mb-4">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block", RARITY_COLORS[rarity].bg, RARITY_COLORS[rarity].text)}>
                          {RARITY_LABELS[rarity]}
                        </span>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {rarityAvatars.map((avatar) => {
                            const unlocked = isAvatarUnlocked(avatar.id, { unlockedAvatars })
                            return (
                              <button
                                key={avatar.id}
                                onClick={() => unlocked && handleIconChange(avatar.id)}
                                disabled={!unlocked}
                                className={cn(
                                  "h-12 w-12 rounded-xl flex items-center justify-center transition-all relative text-2xl",
                                  unlocked ? "bg-muted hover:bg-muted/80 hover:scale-105" : "bg-muted/30 cursor-not-allowed",
                                  avatarIcon === avatar.id && unlocked ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                                )}
                              >
                                {unlocked ? (
                                  <AvatarIcon icon={avatar.icon} size="sm" />
                                ) : (
                                  <div className="relative flex items-center justify-center">
                                    <span className="opacity-20 grayscale text-xl">
                                      <AvatarIcon icon={avatar.icon} size="sm" className="opacity-30 grayscale" />
                                    </span>
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground absolute" />
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Button
                  onClick={() => {
                    haptics.tap()
                    setShowAvatarEditor(false)
                  }}
                  className="w-full font-bold h-12"
                >
                  Terminer
                </Button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition"
              >
                <stat.icon className={cn("h-5 w-5 mx-auto mb-2", stat.color)} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Menu Grid - each tab with different color */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  haptics.tap()
                  router.push(item.href)
                }}
                className={cn(
                  "rounded-xl p-4 transition text-center border hover:scale-[1.02] active:scale-[0.98]",
                  item.borderColor,
                  item.bgColor
                )}
              >
                <item.icon className={cn("h-6 w-6 mx-auto mb-2", item.iconColor)} />
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {user.isPremium && (
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-card hover:bg-primary/5"
                onClick={() => {
                  haptics.tap()
                  router.push("/manage-premium")
                }}
              >
                <Lock className="h-5 w-5 mr-3 text-primary" />
                Gerer Premium
              </Button>
            )}

            <Button variant="destructive" className="w-full justify-start h-12" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-3" />
              {t.profile.logout}
            </Button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
