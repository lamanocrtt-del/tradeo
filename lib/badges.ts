export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  unlocked: boolean
}

export const BADGES: Badge[] = [
  {
    id: "first-lesson",
    name: "Premier pas",
    description: "Termine ta première leçon",
    icon: "🎯",
    requirement: "completedLessons >= 1",
    unlocked: false,
  },
  {
    id: "streak-7",
    name: "Semaine parfaite",
    description: "Maintiens une série de 7 jours",
    icon: "🔥",
    requirement: "streak >= 7",
    unlocked: false,
  },
  {
    id: "streak-30",
    name: "Mois légendaire",
    description: "Maintiens une série de 30 jours",
    icon: "⚡",
    requirement: "streak >= 30",
    unlocked: false,
  },
  {
    id: "xp-1000",
    name: "Millionnaire XP",
    description: "Atteins 1000 XP",
    icon: "💎",
    requirement: "xp >= 1000",
    unlocked: false,
  },
  {
    id: "lessons-50",
    name: "Étudiant assidu",
    description: "Termine 50 leçons",
    icon: "📚",
    requirement: "completedLessons >= 50",
    unlocked: false,
  },
  {
    id: "gold-league",
    name: "Trader d'or",
    description: "Atteins la ligue Or",
    icon: "🏆",
    requirement: "league === 'gold'",
    unlocked: false,
  },
  {
    id: "perfect-lesson",
    name: "Perfection",
    description: "Termine une leçon sans erreur",
    icon: "⭐",
    requirement: "perfectLesson",
    unlocked: false,
  },
  {
    id: "early-bird",
    name: "Lève-tôt",
    description: "Termine une leçon avant 8h",
    icon: "🌅",
    requirement: "earlyBird",
    unlocked: false,
  },
  {
    id: "night-owl",
    name: "Oiseau de nuit",
    description: "Termine une leçon après 22h",
    icon: "🦉",
    requirement: "nightOwl",
    unlocked: false,
  },
  {
    id: "social-trader",
    name: "Trader social",
    description: "Partage ta progression 5 fois",
    icon: "🤝",
    requirement: "shares >= 5",
    unlocked: false,
  },
]

export function checkBadgeUnlock(badge: Badge, user: any): boolean {
  switch (badge.id) {
    case "first-lesson":
      return user.completedLessons.length >= 1
    case "streak-7":
      return user.streak >= 7
    case "streak-30":
      return user.streak >= 30
    case "xp-1000":
      return user.xp >= 1000
    case "lessons-50":
      return user.completedLessons.length >= 50
    case "gold-league":
      return user.league === "gold" || user.league === "sapphire" || user.league === "ruby"
    default:
      return false
  }
}
