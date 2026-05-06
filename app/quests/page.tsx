"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ChestOpening } from "@/components/chest-opening"
import { CHEST_PRICES, CHEST_REWARD_COUNT } from "@/lib/avatars"
import { cn } from "@/lib/utils"
import { haptics, sounds } from "@/lib/haptics"
import { Target, Zap, Trophy, Calendar, Gift, Check, Lock, Coins } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface Quest {
  id: string
  title: string
  description: string
  icon: "target" | "zap" | "trophy" | "calendar"
  progress: number
  target: number
  reward: { type: "coins" | "chest", amount: number, chestType?: "bronze" | "silver" | "gold" }
  difficulty: "easy" | "medium" | "hard"
  type: "daily" | "weekly"
  completed: boolean
  claimed: boolean
}

function generateQuests(user: { completedLessons?: string[], streak?: number, xp?: number, claimedQuests?: string[], lessonsCompletedToday?: number, lessonsCompletedTodayDate?: string }): Quest[] {
  // Check if lessonsCompletedToday is from today
  const today = new Date().toISOString().split("T")[0]
  const completedToday = user.lessonsCompletedTodayDate === today ? (user.lessonsCompletedToday || 0) : 0
  const streak = user.streak || 0
  const totalCompleted = user.completedLessons?.length || 0
  const claimedQuests = user.claimedQuests || []
  
  return [
    {
      id: "daily-1",
      title: "Premiere lecon",
      description: "Complete 1 lecon aujourd'hui",
      icon: "target",
      progress: Math.min(completedToday, 1),
      target: 1,
      reward: { type: "coins", amount: 10 },
      difficulty: "easy",
      type: "daily",
      completed: completedToday >= 1,
      claimed: claimedQuests.includes("daily-1"),
    },
    {
      id: "daily-2",
      title: "Serie du jour",
      description: "Complete 3 lecons aujourd'hui",
      icon: "zap",
      progress: Math.min(completedToday, 3),
      target: 3,
      reward: { type: "coins", amount: 25 },
      difficulty: "medium",
      type: "daily",
      completed: completedToday >= 3,
      claimed: claimedQuests.includes("daily-2"),
    },
    {
      id: "daily-3",
      title: "Maitre du trading",
      description: "Complete 5 lecons aujourd'hui",
      icon: "trophy",
      progress: Math.min(completedToday, 5),
      target: 5,
      reward: { type: "coins", amount: 50 },
      difficulty: "hard",
      type: "daily",
      completed: completedToday >= 5,
      claimed: claimedQuests.includes("daily-3"),
    },
    {
      id: "daily-4",
      title: "Maintiens ta serie",
      description: "Garde ta serie de jours actifs",
      icon: "calendar",
      progress: streak > 0 ? 1 : 0,
      target: 1,
      reward: { type: "coins", amount: 15 },
      difficulty: "easy",
      type: "daily",
      completed: streak > 0,
      claimed: claimedQuests.includes("daily-4"),
    },
    {
      id: "weekly-1",
      title: "Serie de 7 jours",
      description: "Maintiens ta serie pendant 7 jours",
      icon: "calendar",
      progress: Math.min(streak, 7),
      target: 7,
      reward: { type: "chest", amount: 1, chestType: "silver" },
      difficulty: "hard",
      type: "weekly",
      completed: streak >= 7,
      claimed: claimedQuests.includes("weekly-1"),
    },
    {
      id: "weekly-2",
      title: "Apprenti trader",
      description: "Complete 10 lecons cette semaine",
      icon: "target",
      progress: Math.min(totalCompleted % 10, 10),
      target: 10,
      reward: { type: "coins", amount: 75 },
      difficulty: "medium",
      type: "weekly",
      completed: totalCompleted >= 10,
      claimed: claimedQuests.includes("weekly-2"),
    },
    {
      id: "weekly-3",
      title: "Expert",
      description: "Complete 50 lecons au total",
      icon: "trophy",
      progress: Math.min(totalCompleted, 50),
      target: 50,
      reward: { type: "chest", amount: 1, chestType: "gold" },
      difficulty: "hard",
      type: "weekly",
      completed: totalCompleted >= 50,
      claimed: claimedQuests.includes("weekly-3"),
    },
    {
      id: "weekly-4",
      title: "Semaine productive",
      description: "Complete 20 lecons cette semaine",
      icon: "zap",
      progress: Math.min(totalCompleted % 20, 20),
      target: 20,
      reward: { type: "coins", amount: 120 },
      difficulty: "hard",
      type: "weekly",
      completed: (totalCompleted % 20) >= 20,
      claimed: claimedQuests.includes("weekly-4"),
    },
  ]
}

const ICON_COMPONENTS = {
  target: Target,
  zap: Zap,
  trophy: Trophy,
  calendar: Calendar,
}

const COIN_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" fill="#FCD34D" />
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#92400E">$</text>
  </svg>
)

const CHEST_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <rect x="3" y="10" width="18" height="11" rx="2" fill="#CD7136" />
    <path d="M3 10 Q3 5 12 4 Q21 5 21 10" fill="#E08746" />
    <rect x="10" y="12" width="4" height="3" rx="1" fill="#FCD34D" />
  </svg>
)

const DIFFICULTY_BADGE = {
  easy: { label: "Facile", color: "bg-green-500/20 text-green-400" },
  medium: { label: "Moyen", color: "bg-yellow-500/20 text-yellow-400" },
  hard: { label: "Difficile", color: "bg-red-500/20 text-red-400" },
}

const CHEST_TYPE_NAMES = {
  bronze: "Bronze",
  silver: "Argent",
  gold: "Or",
  legendary: "Legendaire",
}

export default function QuestsPage() {
  const router = useRouter()
  const { user, isDemo, addCoins, spendCoins, claimQuest, hasClaimedQuest } = useAuthStore()
  const { language } = useI18n()
  const [quests, setQuests] = useState<Quest[]>([])
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily")
  const [chestToOpen, setChestToOpen] = useState<"bronze" | "silver" | "gold" | "legendary" | null>(null)

  useEffect(() => {
    if (!user && !isDemo) {
      router.push("/")
    }
  }, [user, isDemo, router])

  useEffect(() => {
    if (user) {
      setQuests(generateQuests(user))
    }
  }, [user, user?.claimedQuests, user?.lessonsCompletedToday, user?.lessonsCompletedTodayDate])

  const handleClaimReward = (quest: Quest) => {
    if (!quest.completed || quest.claimed) return
    
    // Check if already claimed (prevent double-claiming)
    if (hasClaimedQuest(quest.id)) return
    
    // Mark as claimed in persistent storage
    const claimed = claimQuest(quest.id)
    if (!claimed) return // Already claimed
    
    haptics.success()
    sounds.click()
    
    if (quest.reward.type === "coins") {
      addCoins(quest.reward.amount)
    } else if (quest.reward.type === "chest") {
      setChestToOpen(quest.reward.chestType || "bronze")
    }
    
    setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, claimed: true } : q))
  }

  const handleBuyChest = (type: "bronze" | "silver" | "gold" | "legendary") => {
    const price = CHEST_PRICES[type]
    const userCoins = user?.coins || 0
    
    if (userCoins < price) return
    
    haptics.tap()
    sounds.click()
    
    const success = spendCoins(price)
    if (success) {
      setChestToOpen(type)
    }
  }

  if (!user && !isDemo) {
    return null
  }

  const dailyQuests = quests.filter(q => q.type === "daily")
  const weeklyQuests = quests.filter(q => q.type === "weekly")
  const activeQuests = activeTab === "daily" ? dailyQuests : weeklyQuests
  const userCoins = user?.coins || 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          {/* Title + Coins balance */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30">
                <Gift className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Quetes</h1>
                <p className="text-sm text-muted-foreground">Gagne des pieces et ouvre des coffres</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
              <Coins className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-amber-400">{userCoins}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setActiveTab("daily"); sounds.click() }}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-semibold transition-all",
                activeTab === "daily"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Quotidiennes
            </button>
            <button
              onClick={() => { setActiveTab("weekly"); sounds.click() }}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-semibold transition-all",
                activeTab === "weekly"
                  ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Hebdomadaires
            </button>
          </div>

          {/* Quests list */}
          <div className="space-y-3">
            {activeQuests.map((quest) => {
              const IconComponent = ICON_COMPONENTS[quest.icon]
              const progressPercent = (quest.progress / quest.target) * 100
              const diff = DIFFICULTY_BADGE[quest.difficulty]
              
              return (
                <div
                  key={quest.id}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all",
                    quest.claimed
                      ? "bg-muted/50 border-muted opacity-60"
                      : quest.completed
                      ? "bg-green-950/30 border-green-800"
                      : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl flex-shrink-0",
                      quest.completed ? "bg-green-500" : "bg-muted"
                    )}>
                      {quest.completed ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : (
                        <IconComponent className={cn(
                          "h-6 w-6",
                          quest.icon === "target" && "text-red-500",
                          quest.icon === "zap" && "text-yellow-500",
                          quest.icon === "trophy" && "text-amber-500",
                          quest.icon === "calendar" && "text-blue-500"
                        )} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{quest.title}</h3>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", diff.color)}>
                            {diff.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {quest.reward.type === "coins" ? COIN_ICON : CHEST_ICON}
                          <span className="text-sm font-bold text-foreground">
                            {quest.reward.type === "coins" ? `+${quest.reward.amount}` : CHEST_TYPE_NAMES[quest.reward.chestType || "bronze"]}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{quest.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              quest.completed ? "bg-green-500" : "bg-primary"
                            )}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                    </div>
                    
                    {quest.completed && !quest.claimed && (
                      <button
                        onClick={() => handleClaimReward(quest)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/30 hover:from-green-500 hover:to-emerald-600 transition-all active:scale-95 flex-shrink-0"
                      >
                        Recuperer
                      </button>
                    )}
                    
                    {quest.claimed && (
                      <div className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-medium flex-shrink-0">
                        Recupere
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chests shop section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Coffres</h2>
              <span className="text-sm text-muted-foreground">Achete avec tes pieces</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["bronze", "silver", "gold", "legendary"] as const).map((type) => {
                const price = CHEST_PRICES[type]
                const rewardCount = CHEST_REWARD_COUNT[type]
                const canAfford = userCoins >= price
                return (
                  <button
                    key={type}
                    onClick={() => handleBuyChest(type)}
                    disabled={!canAfford}
                    className={cn(
                      "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                      !canAfford
                        ? "bg-muted/30 border-muted opacity-50 cursor-not-allowed"
                        : "bg-card border-border hover:border-primary/50 active:scale-95"
                    )}
                  >
                    <div className="relative">
                      <svg viewBox="0 0 60 50" className="w-16 h-14">
                        <rect x="5" y="22" width="50" height="25" rx="4" fill={
                          type === "bronze" ? "#A85C2A" :
                          type === "silver" ? "#6B7280" :
                          type === "gold" ? "#E5A800" :
                          "#7E22CE"
                        } />
                        <rect x="5" y="22" width="50" height="22" rx="4" fill={
                          type === "bronze" ? "#CD7136" :
                          type === "silver" ? "#9CA3AF" :
                          type === "gold" ? "#FFC800" :
                          "#A855F7"
                        } />
                        <path d={`M5 22 Q5 10 30 8 Q55 10 55 22`} fill={
                          type === "bronze" ? "#E08746" :
                          type === "silver" ? "#D1D5DB" :
                          type === "gold" ? "#FFD900" :
                          "#C084FC"
                        } />
                        <rect x="25" y="26" width="10" height="8" rx="2" fill={
                          type === "bronze" ? "#FCD34D" :
                          type === "silver" ? "#FCD34D" :
                          type === "gold" ? "#FEF3C7" :
                          "#FCD34D"
                        } />
                      </svg>
                      {!canAfford && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      type === "bronze" && "text-orange-400",
                      type === "silver" && "text-slate-400",
                      type === "gold" && "text-yellow-400",
                      type === "legendary" && "text-purple-400"
                    )}>
                      {CHEST_TYPE_NAMES[type]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {rewardCount} recompense{rewardCount > 1 ? "s" : ""}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full",
                      canAfford ? "bg-amber-500/20" : "bg-muted/50"
                    )}>
                      <Coins className={cn("h-3.5 w-3.5", canAfford ? "text-amber-400" : "text-muted-foreground")} />
                      <span className={cn("text-xs font-bold", canAfford ? "text-amber-400" : "text-muted-foreground")}>{price}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
      
      {chestToOpen && (
        <ChestOpening
          chestType={chestToOpen}
          onClose={() => setChestToOpen(null)}
          onRewardClaimed={() => {}}
        />
      )}
    </div>
  )
}
