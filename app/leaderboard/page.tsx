"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Trophy, Zap, ChevronDown } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { useI18n } from "@/lib/i18n" // Import useI18n hook

// 4 Leagues: Bronze -> Silver -> Gold -> Diamond
const LEAGUES = [
  { id: "bronze", name: { fr: "Bronze", en: "Bronze" }, color: "from-amber-600 to-amber-800", icon: "🥉", minXp: 0, maxXp: 500 },
  { id: "silver", name: { fr: "Argent", en: "Silver" }, color: "from-gray-400 to-gray-600", icon: "🥈", minXp: 500, maxXp: 1500 },
  { id: "gold", name: { fr: "Or", en: "Gold" }, color: "from-yellow-400 to-yellow-600", icon: "🥇", minXp: 1500, maxXp: 3000 },
  { id: "diamond", name: { fr: "Diamant", en: "Diamond" }, color: "from-cyan-400 to-blue-600", icon: "💎", minXp: 3000, maxXp: 10000 },
]

// Generate realistic players for each league
const generateLeaguePlayers = (leagueId: string, minXp: number, maxXp: number) => {
  const names = [
    "TradingPro42", "MarketQueen", "BullRunner", "CryptoNinja", "WallStreetWiz",
    "StockMaster", "ForexKing", "DayTrader99", "InvestorX", "ChartWizard",
    "MoneyMaker", "TrendHunter", "ProfitSeeker", "RiskTaker", "AlphaTrader",
    "BetaInvestor", "GammaGains", "DeltaDeals", "ThetaTrader", "OmegaWins",
    "LuckyTrader", "SmartMoney", "QuickProfit", "SteadyGains", "SafeInvestor",
    "BoldMoves", "CalmTrader", "FastFinance", "SlowGrowth", "BigReturns"
  ]
  
  const avatars = ["👨", "👩", "🧑", "👨‍💼", "👩‍💼", "🧑‍💻", "👨‍🎓", "👩‍🎓", "🦊", "🐺", "🦁", "🐯", "🐻", "🦅", "🦈"]
  
  const players = []
  const usedNames = new Set<string>()
  
  for (let i = 0; i < 10; i++) {
    let name = names[Math.floor(Math.random() * names.length)]
    while (usedNames.has(name)) {
      name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100)
    }
    usedNames.add(name)
    
    const xpRange = maxXp - minXp
    const xp = Math.floor(minXp + (xpRange * (10 - i) / 10) + Math.random() * (xpRange / 10))
    
    players.push({
      username: name,
      xp: Math.min(xp, maxXp - 1),
      rank: i + 1,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
    })
  }
  
  return players.sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }))
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { user, isDemo, users } = useAuthStore()
  const t = useTranslation()
  const [selectedLeague, setSelectedLeague] = useState<string>("bronze")
  const [showLeagueSelector, setShowLeagueSelector] = useState(false)
  const { language: lang } = useI18n() // Declare useI18n hook at the top level

  // User always starts in Bronze
  const userLeague = user?.league || "bronze"
  const userXp = user?.leagueXp || 0
  
  // Find current league info
  const currentLeagueIndex = LEAGUES.findIndex(l => l.id === userLeague)
  const currentLeague = LEAGUES[currentLeagueIndex]
  const nextLeague = LEAGUES[currentLeagueIndex + 1]

  useEffect(() => {
    if (!user && !isDemo) {
      router.push("/")
    }
    // Set selected league to user's league
    setSelectedLeague(userLeague)
  }, [user, isDemo, router, userLeague])

  if (!user && !isDemo) {
    return null
  }

  // Get league players (mix of real users and generated)
  const selectedLeagueInfo = LEAGUES.find(l => l.id === selectedLeague)!
  const leaguePlayers = generateLeaguePlayers(selectedLeague, selectedLeagueInfo.minXp, selectedLeagueInfo.maxXp)
  
  // Add current user to their league if viewing their league
  let displayPlayers = [...leaguePlayers]
  if (selectedLeague === userLeague) {
    const userEntry = {
      username: user?.username || "Toi",
      xp: userXp,
      rank: 0,
      avatar: "🎯",
      isCurrentUser: true,
    }
    displayPlayers.push(userEntry as any)
    displayPlayers = displayPlayers.sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }))
  }

  const userRank = displayPlayers.find((p: any) => p.isCurrentUser)?.rank || 0
  const xpToNextLeague = nextLeague ? nextLeague.minXp - userXp : 0
  const progressPercent = nextLeague 
    ? ((userXp - currentLeague.minXp) / (nextLeague.minXp - currentLeague.minXp)) * 100 
    : 100

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          {/* League Header */}
          <div className="mb-8">
            <div className={`bg-gradient-to-br ${currentLeague.color} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide opacity-90">
                    {t.yourLeague}
                  </h2>
                  <h1 className="text-3xl font-bold mt-1">
                    {currentLeague.name[lang as "fr" | "en"]}
                  </h1>
                </div>
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                  {currentLeague.icon}
                </div>
              </div>

              {/* Progress to next league */}
              {nextLeague && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.progressTo} {nextLeague.name[lang as "fr" | "en"]}</span>
                    <span className="font-bold">{userXp} / {nextLeague.minXp} XP</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs opacity-90">
                    {t.moreXpNeeded.replace("{xp}", String(xpToNextLeague)).replace("{league}", nextLeague.name[lang as "fr" | "en"])}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* League Selector */}
          <div className="mb-6 relative">
            <button
              onClick={() => setShowLeagueSelector(!showLeagueSelector)}
              className="w-full flex items-center justify-between p-4 bg-card border rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedLeagueInfo.icon}</span>
                <span className="font-bold">{selectedLeagueInfo.name[lang as "fr" | "en"]}</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${showLeagueSelector ? "rotate-180" : ""}`} />
            </button>
            
            {showLeagueSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg z-10 overflow-hidden">
                {LEAGUES.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => {
                      setSelectedLeague(league.id)
                      setShowLeagueSelector(false)
                    }}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors ${
                      selectedLeague === league.id ? "bg-muted" : ""
                    }`}
                  >
                    <span className="text-2xl">{league.icon}</span>
                    <span className="font-semibold">{league.name[lang as "fr" | "en"]}</span>
                    {league.id === userLeague && (
                      <span className="ml-auto text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        {t.itsYou}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Classement Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{t.weeklyLeaderboard}</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>{t.top3Bonus}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{t.endsIn.replace("{days}", "3")}</p>
          </div>

          {/* Leaderboard - Top 10 */}
          <div className="space-y-3">
            {displayPlayers.slice(0, 10).map((entry: any) => {
              const isTop3 = entry.rank <= 3
              const isCurrentUser = entry.isCurrentUser
              
              return (
                <div
                  key={`${entry.username}-${entry.rank}`}
                  className={`rounded-2xl p-4 flex items-center gap-4 ${
                    isCurrentUser
                      ? "bg-green-500/20 border-2 border-green-500"
                      : isTop3
                        ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30"
                        : "bg-card border border-border"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${
                        isTop3 ? "bg-yellow-400" : isCurrentUser ? "bg-green-500" : "bg-muted"
                      }`}>
                        {isTop3 ? (
                          entry.rank === 1 ? "🏆" : entry.rank === 2 ? "🥈" : "🥉"
                        ) : (
                          entry.avatar
                        )}
                      </div>
                      {!isTop3 && (
                        <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          isCurrentUser ? "bg-green-600" : "bg-gray-600"
                        }`}>
                          {entry.rank}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{entry.username}</p>
                      {isCurrentUser && (
                        <p className="text-xs text-green-500 font-semibold">{t.itsYou}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{entry.xp}</p>
                      <p className="text-xs text-muted-foreground">{t.xp}</p>
                    </div>
                  </div>
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
