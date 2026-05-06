"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { haptics } from "@/lib/haptics"
import { useAuthStore } from "@/lib/auth-store"
import { useI18n } from "@/lib/i18n"
import { motion } from "framer-motion"
import { Trophy, ChevronRight, Star } from "lucide-react"

// Available emojis from chests (smileys only)
const CHEST_EMOJIS = ["😊", "😎", "🤑", "🦊", "🐺", "🦁", "🐯", "🐻", "🐼", "🦄", "🐲", "👑", "💎", "🔥", "⚡"]

// Credible player data with chest emojis only
const FAKE_PLAYERS = [
  { name: "TraderMax", xp: 2450, avatar: "🤑", country: "FR" },
  { name: "BullRun22", xp: 2280, avatar: "🐯", country: "BE" },
  { name: "FxQueen", xp: 2150, avatar: "👑", country: "CH" },
  { name: "CryptoWolf", xp: 1980, avatar: "🐺", country: "FR" },
  { name: "DiamondH", xp: 1850, avatar: "💎", country: "CA" },
  { name: "LionTrade", xp: 1720, avatar: "🦁", country: "FR" },
  { name: "FireFx", xp: 1650, avatar: "🔥", country: "BE" },
  { name: "PandaPro", xp: 1580, avatar: "🐼", country: "CH" },
  { name: "BearMarket", xp: 1450, avatar: "🐻", country: "FR" },
  { name: "FlashTrade", xp: 1380, avatar: "⚡", country: "CA" },
  { name: "FoxyFx", xp: 1250, avatar: "🦊", country: "FR" },
  { name: "DragonBull", xp: 1120, avatar: "🐲", country: "BE" },
  { name: "UniTrader", xp: 980, avatar: "🦄", country: "FR" },
  { name: "CoolKid", xp: 850, avatar: "😎", country: "CH" },
  { name: "HappyFx", xp: 720, avatar: "😊", country: "FR" },
]

const LEAGUES = [
  { id: "bronze", name: "Bronze", emoji: "🥉", color: "from-amber-700 to-amber-800", minXp: 0 },
  { id: "silver", name: "Argent", emoji: "🥈", color: "from-slate-400 to-slate-500", minXp: 500 },
  { id: "gold", name: "Or", emoji: "🥇", color: "from-amber-400 to-amber-500", minXp: 1500 },
  { id: "platinum", name: "Platine", emoji: "💎", color: "from-cyan-400 to-cyan-500", minXp: 3000 },
  { id: "diamond", name: "Diamant", emoji: "💠", color: "from-blue-400 to-blue-500", minXp: 5000 },
]

export default function LeaguesPage() {
  const [selectedTab, setSelectedTab] = useState<"weekly" | "monthly">("weekly")
  const { user } = useAuthStore()
  const { language } = useI18n()

  const userXp = user?.xp || 0
  const currentLeague = LEAGUES.slice().reverse().find(l => userXp >= l.minXp) || LEAGUES[0]
  const nextLeague = LEAGUES[LEAGUES.indexOf(currentLeague) + 1]
  const progressToNext = nextLeague 
    ? Math.min(100, ((userXp - currentLeague.minXp) / (nextLeague.minXp - currentLeague.minXp)) * 100)
    : 100
  const xpToNext = nextLeague ? nextLeague.minXp - userXp : 0

  // Generate rankings with user included
  const generateRankings = () => {
    const players = [...FAKE_PLAYERS]
    
    // Insert user at appropriate position based on XP
    const userEntry = {
      name: user?.username || "Toi",
      xp: userXp,
      avatar: user?.avatarEmoji || "😎",
      country: "FR",
      isUser: true,
    }
    
    // Find position for user
    let userRank = players.findIndex(p => userXp > p.xp)
    if (userRank === -1) userRank = players.length
    
    players.splice(userRank, 0, userEntry)
    
    return players.slice(0, 15).map((p, i) => ({
      ...p,
      rank: i + 1,
    }))
  }

  const rankings = generateRankings()

  const t = {
    fr: {
      currentLeague: "Ta ligue actuelle",
      progressTo: "Progression vers",
      xpToGo: "XP pour monter",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      ranking: "Classement",
      you: "(Toi)",
      top3: "Top 3 monte en ligue superieure",
      bottom3: "Les 3 derniers descendent",
    },
    en: {
      currentLeague: "Your current league",
      progressTo: "Progress to",
      xpToGo: "XP to go",
      weekly: "Weekly",
      monthly: "Monthly",
      ranking: "Ranking",
      you: "(You)",
      top3: "Top 3 advance to next league",
      bottom3: "Bottom 3 get demoted",
    },
  }
  const texts = t[language === "en" ? "en" : "fr"]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
          
          {/* Current League Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r ${currentLeague.color} rounded-2xl p-5 mb-6 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 opacity-20 text-8xl -mt-4 -mr-4">
              {currentLeague.emoji}
            </div>
            <p className="text-sm text-white/70 mb-1">{texts.currentLeague}</p>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
              {currentLeague.emoji} {currentLeague.name}
            </h2>
            
            {nextLeague && (
              <>
                <p className="text-xs text-white/60 mb-2">{texts.progressTo} {nextLeague.name}</p>
                <div className="w-full bg-black/30 rounded-full h-2.5 mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-white h-2.5 rounded-full"
                  />
                </div>
                <p className="text-xs text-white/80">{xpToNext} {texts.xpToGo}</p>
              </>
            )}
          </motion.div>

          {/* Tab Selection */}
          <div className="flex gap-2 mb-4">
            {(["weekly", "monthly"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setSelectedTab(tab); haptics.tap() }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  selectedTab === tab
                    ? "bg-emerald-500 text-white"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {tab === "weekly" ? texts.weekly : texts.monthly}
              </button>
            ))}
          </div>

          {/* Info Banner */}
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4">
            <Trophy className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-400">{texts.top3}</p>
          </div>

          {/* Rankings */}
          <div className="space-y-2">
            {rankings.map((player, index) => {
              const isTop3 = player.rank <= 3
              const isUser = "isUser" in player && player.isUser
              
              return (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isUser 
                      ? "bg-blue-500/20 border-2 border-blue-500/50" 
                      : isTop3 
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "bg-card border border-border"
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    player.rank === 1 ? "bg-amber-500 text-white" :
                    player.rank === 2 ? "bg-slate-400 text-white" :
                    player.rank === 3 ? "bg-amber-700 text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {player.rank}
                  </div>
                  
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl">
                    {player.avatar}
                  </div>
                  
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isUser ? "text-blue-400" : "text-foreground"}`}>
                      {player.name} {isUser && <span className="text-xs font-normal">{texts.you}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{player.country}</p>
                  </div>
                  
                  {/* XP */}
                  <div className="text-right">
                    <p className={`font-bold ${isUser ? "text-blue-400" : "text-emerald-400"}`}>
                      {player.xp.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                  </div>
                  
                  {/* Star for top 3 */}
                  {isTop3 && (
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Bottom Warning */}
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mt-4">
            <ChevronRight className="h-5 w-5 text-red-400 flex-shrink-0 rotate-90" />
            <p className="text-xs text-red-400">{texts.bottom3}</p>
          </div>

        </div>
      </main>
      <BottomNav />
    </div>
  )
}
