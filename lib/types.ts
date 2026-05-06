export interface User {
  id: string
  username: string
  email?: string
  password: string
  xp: number
  hearts: number
  maxHearts: number
  lastHeartsReset?: string
  streak: number
  currentStreak: number
  longestStreak: number
  league: League
  leagueXp: number
  gems: number
  completedLessons: string[]
  currentSection: number
  currentUnit: number
  createdAt: Date
  lastActive: Date
  isPremium: boolean
  premiumUntil?: Date
  subscriptionType?: "monthly" | "annual" | "family"
  nativelyTransactionId?: string
  lastLessonDate?: string // ISO date string of the last day a lesson was completed (YYYY-MM-DD)
  lessonsCompletedToday?: number // Number of lessons completed today
  lessonsCompletedTodayDate?: string // Date when lessonsCompletedToday was last reset (YYYY-MM-DD)
  theme: "light" | "dark"
  notifications: boolean
  haptics: boolean
  avatar?: string
  avatarColor?: string
  avatarEmoji?: string
  avatarIcon?: string
  unlockedAvatars?: string[]
  openedChests?: string[]
  claimedQuests?: string[] // Track which quests have been claimed to prevent double-claiming
  coins?: number
  completedOnboarding?: boolean
  tradingSource?: string
  englishLevel?: string
  goals?: string[]
  dailyMinutes?: number
  intensity?: string
  totalXpGoal?: number
  tradingBalance?: number
  tradingProfit?: number
  tradingTrophies?: string[]
  tradingWins?: number
  tradingTotal?: number
  positions?: TradingPosition[]
  hasSeenTradingIntro?: boolean
  // Streak freeze
  streakFreezes?: number
  streakFreezeUsedAt?: string
  // Monthly gems
  lastMonthlyGemsAt?: string
  // Trading
  tradingUnlocked?: boolean
  // Achievements
  achievements?: string[]
  // Language preference
  preferredLanguage?: "fr" | "en"
}

export interface TradingPosition {
  id: string
  symbol: string
  type: "buy" | "sell"
  entryPrice: number
  amount: number
  timestamp: number
}

export type League =
  | "bronze"
  | "silver"
  | "gold"
  | "sapphire"
  | "ruby"
  | "emerald"
  | "diamond"
  | "obsidian"
  | "pearl"
  | "legend"

export interface LeaderboardEntry {
  username: string
  xp: number
  rank: number
  avatar?: string
}

export interface Lesson {
  id: string
  sectionId: number
  unitId: number
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  xpReward: number
  exercises: Exercise[]
  isLocked: boolean
  type: "lesson" | "practice" | "story" | "unit-review" | "chest"
}

export interface Exercise {
  id: string
  type: "qcm" | "demo" | "simulation" | "match" | "fill-blank" | "order" | "pattern"
  pattern?: "double-top" | "double-bottom" | "head-shoulders" | "inv-head-shoulders" | "rising-wedge" | "falling-wedge" | "supply-demand" | "fibonacci" | "break-retest" | "support-resistance"
  entryZone?: { minPercent: number; maxPercent: number }
  question: string
  questionEn?: string
  options?: string[]
  optionsEn?: string[]
  correctAnswer: string | string[]
  correctAnswerEn?: string | string[]
  explanation?: string
  explanationEn?: string
  media?: string
}

export interface ShopItem {
  id: string
  name: string
  description: string
  priceInGems?: number
  priceInCents?: number
  type: "heart-refill" | "streak-freeze" | "theme" | "avatar" | "premium"
  icon: string
}
