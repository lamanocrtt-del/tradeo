"use client"

import type { User } from "./types"

export interface Quest {
  id: string
  type: "daily" | "weekly"
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  target: number
  progress: number
  reward: {
    coins: number
    chest?: "bronze" | "silver" | "gold"
  }
  difficulty: "easy" | "medium" | "hard"
  icon: "lesson" | "streak" | "xp" | "accuracy" | "trade" | "time"
  completed: boolean
  claimed: boolean
}

// Generate daily quests based on user progress
export function generateDailyQuests(user: User): Quest[] {
  const completedToday = user.completedLessons?.filter(() => true).length || 0

  const quests: Quest[] = [
    {
      id: "daily-lesson-1",
      type: "daily",
      title: "Premiere lecon",
      titleEn: "First lesson",
      description: "Complete 1 lecon aujourd'hui",
      descriptionEn: "Complete 1 lesson today",
      target: 1,
      progress: Math.min(completedToday, 1),
      reward: { coins: 10 },
      difficulty: "easy",
      icon: "lesson",
      completed: completedToday >= 1,
      claimed: false,
    },
    {
      id: "daily-lesson-3",
      type: "daily",
      title: "Etudiant assidu",
      titleEn: "Dedicated student",
      description: "Complete 3 lecons aujourd'hui",
      descriptionEn: "Complete 3 lessons today",
      target: 3,
      progress: Math.min(completedToday, 3),
      reward: { coins: 25 },
      difficulty: "medium",
      icon: "lesson",
      completed: completedToday >= 3,
      claimed: false,
    },
    {
      id: "daily-streak",
      type: "daily",
      title: "Maintiens ta serie",
      titleEn: "Keep your streak",
      description: "Garde ta serie de jours actifs",
      descriptionEn: "Keep your active day streak",
      target: 1,
      progress: user.streak > 0 ? 1 : 0,
      reward: { coins: 15 },
      difficulty: "easy",
      icon: "streak",
      completed: user.streak > 0,
      claimed: false,
    },
    {
      id: "daily-5-lessons",
      type: "daily",
      title: "Maitre du trading",
      titleEn: "Trading master",
      description: "Complete 5 lecons aujourd'hui",
      descriptionEn: "Complete 5 lessons today",
      target: 5,
      progress: Math.min(completedToday, 5),
      reward: { coins: 50 },
      difficulty: "hard",
      icon: "lesson",
      completed: completedToday >= 5,
      claimed: false,
    },
  ]

  return quests
}

// Generate weekly quests
export function generateWeeklyQuests(user: User): Quest[] {
  const totalLessons = user.completedLessons?.length || 0

  return [
    {
      id: "weekly-lesson-10",
      type: "weekly",
      title: "Semaine productive",
      titleEn: "Productive week",
      description: "Complete 10 lecons cette semaine",
      descriptionEn: "Complete 10 lessons this week",
      target: 10,
      progress: Math.min(totalLessons % 10, 10),
      reward: { coins: 75 },
      difficulty: "medium",
      icon: "lesson",
      completed: totalLessons >= 10,
      claimed: false,
    },
    {
      id: "weekly-streak-7",
      type: "weekly",
      title: "Serie de 7 jours",
      titleEn: "7-day streak",
      description: "Atteins une serie de 7 jours",
      descriptionEn: "Reach a 7-day streak",
      target: 7,
      progress: Math.min(user.streak, 7),
      reward: { coins: 0, chest: "silver" },
      difficulty: "hard",
      icon: "streak",
      completed: user.streak >= 7,
      claimed: false,
    },
    {
      id: "weekly-trade-5",
      type: "weekly",
      title: "Trader actif",
      titleEn: "Active trader",
      description: "Fais 5 trades en simulation",
      descriptionEn: "Make 5 simulation trades",
      target: 5,
      progress: 0,
      reward: { coins: 120 },
      difficulty: "hard",
      icon: "trade",
      completed: false,
      claimed: false,
    },
  ]
}

// Get chest rarity colors
export function getChestColors(type: "bronze" | "silver" | "gold" | "legendary") {
  const colors = {
    bronze: {
      bg: "from-amber-600 to-amber-800",
      glow: "shadow-amber-500/30",
      text: "text-amber-400",
    },
    silver: {
      bg: "from-slate-300 to-slate-500",
      glow: "shadow-slate-400/30",
      text: "text-slate-300",
    },
    gold: {
      bg: "from-yellow-400 to-amber-600",
      glow: "shadow-yellow-500/40",
      text: "text-yellow-400",
    },
    legendary: {
      bg: "from-purple-500 via-pink-500 to-violet-600",
      glow: "shadow-purple-500/50",
      text: "text-purple-400",
    },
  }
  return colors[type]
}

// Calculate combo multiplier
export function calculateComboMultiplier(correctStreak: number): number {
  if (correctStreak < 2) return 1
  if (correctStreak < 5) return 1.5
  if (correctStreak < 10) return 2
  if (correctStreak < 15) return 2.5
  return 3
}

// Get combo level name
export function getComboLevel(correctStreak: number): { name: string; nameEn: string; color: string } {
  if (correctStreak < 2) return { name: "Aucun", nameEn: "None", color: "text-muted-foreground" }
  if (correctStreak < 5) return { name: "Bon debut!", nameEn: "Good start!", color: "text-blue-500" }
  if (correctStreak < 10) return { name: "En feu!", nameEn: "On fire!", color: "text-orange-500" }
  if (correctStreak < 15) return { name: "Incroyable!", nameEn: "Amazing!", color: "text-amber-500" }
  return { name: "LEGENDAIRE!", nameEn: "LEGENDARY!", color: "text-purple-500" }
}
