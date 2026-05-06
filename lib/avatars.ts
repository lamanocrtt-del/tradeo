"use client"

// Profile avatar icons that can be unlocked
export type AvatarIconType = "bull" | "bear" | "diamond" | "rocket" | "crown" | "fire" | "star" | "lightning" | "shield" | "chart" | "coin" | "gem" | "trophy" | "medal" | "target" | "whale" | "fox" | "eagle" | "wolf" | "panda" | "phoenix" | "dragon" | "ninja" | "samurai" | "astronaut"

export interface Avatar {
  id: string
  name: string
  description: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockCondition: string
  icon: AvatarIconType
  chestOnly?: boolean // Can only be unlocked from chests
}

export const AVATARS: Avatar[] = [
  // Common avatars (default + chest unlockable)
  { id: "bull", name: "Taureau", description: "Le symbole du marche haussier", rarity: "common", unlockCondition: "Disponible par defaut", icon: "bull" },
  { id: "chart", name: "Analyste", description: "Tu aimes les graphiques", rarity: "common", unlockCondition: "Coffre bronze", icon: "chart", chestOnly: true },
  { id: "coin", name: "Investisseur", description: "Chaque centime compte", rarity: "common", unlockCondition: "Coffre bronze", icon: "coin", chestOnly: true },
  { id: "target", name: "Precis", description: "Tu vises juste", rarity: "common", unlockCondition: "Coffre bronze", icon: "target", chestOnly: true },
  { id: "panda", name: "Panda", description: "Calme et strategique", rarity: "common", unlockCondition: "Coffre bronze", icon: "panda", chestOnly: true },
  
  // Rare avatars (chest unlockable)
  { id: "bear", name: "Ours", description: "Le symbole du marche baissier", rarity: "rare", unlockCondition: "Coffre argent", icon: "bear", chestOnly: true },
  { id: "star", name: "Etoile montante", description: "Tu progresses vite", rarity: "rare", unlockCondition: "Coffre argent", icon: "star", chestOnly: true },
  { id: "shield", name: "Protecteur", description: "Tu proteges ton capital", rarity: "rare", unlockCondition: "Coffre argent", icon: "shield", chestOnly: true },
  { id: "medal", name: "Medaille", description: "Tu excelles", rarity: "rare", unlockCondition: "Coffre argent", icon: "medal", chestOnly: true },
  { id: "fox", name: "Renard", description: "Ruse comme un renard", rarity: "rare", unlockCondition: "Coffre argent", icon: "fox", chestOnly: true },
  { id: "whale", name: "Baleine", description: "Les gros joueurs du marche", rarity: "rare", unlockCondition: "Coffre argent", icon: "whale", chestOnly: true },
  
  // Epic avatars (chest unlockable)
  { id: "fire", name: "En feu", description: "Inarretable", rarity: "epic", unlockCondition: "Coffre or", icon: "fire", chestOnly: true },
  { id: "lightning", name: "Eclair", description: "Rapide comme l'eclair", rarity: "epic", unlockCondition: "Coffre or", icon: "lightning", chestOnly: true },
  { id: "trophy", name: "Champion", description: "Tu as tout gagne", rarity: "epic", unlockCondition: "Coffre or", icon: "trophy", chestOnly: true },
  { id: "rocket", name: "Fusee", description: "Direction la lune", rarity: "epic", unlockCondition: "Coffre or", icon: "rocket", chestOnly: true },
  { id: "eagle", name: "Aigle", description: "Vue d'ensemble sur les marches", rarity: "epic", unlockCondition: "Coffre or", icon: "eagle", chestOnly: true },
  { id: "wolf", name: "Loup", description: "Le loup de Wall Street", rarity: "epic", unlockCondition: "Coffre or", icon: "wolf", chestOnly: true },
  { id: "ninja", name: "Ninja", description: "Trades silencieux mais mortels", rarity: "epic", unlockCondition: "Coffre or", icon: "ninja", chestOnly: true },
  
  // Legendary avatars (chest unlockable)
  { id: "diamond", name: "Diamant", description: "Les mains de diamant ne vendent jamais", rarity: "legendary", unlockCondition: "Coffre legendaire", icon: "diamond", chestOnly: true },
  { id: "crown", name: "Roi du trading", description: "Tu domines les marches", rarity: "legendary", unlockCondition: "Coffre legendaire", icon: "crown", chestOnly: true },
  { id: "gem", name: "Gemme rare", description: "Un trader exceptionnel", rarity: "legendary", unlockCondition: "Coffre legendaire", icon: "gem", chestOnly: true },
  { id: "phoenix", name: "Phoenix", description: "Renait de ses pertes", rarity: "legendary", unlockCondition: "Coffre legendaire", icon: "phoenix", chestOnly: true },
  { id: "dragon", name: "Dragon", description: "Souffle le feu sur les marches", rarity: "legendary", unlockCondition: "Coffre legendaire", icon: "dragon", chestOnly: true },
  { id: "samurai", name: "Samourai", description: "Discipline et honneur", rarity: "legendary", unlockCondition: "Coffre legendaire", icon: "samurai", chestOnly: true },
  { id: "astronaut", name: "Astronaute", description: "To the moon!", rarity: "legendary", unlockCondition: "Coffre legendaire", icon: "astronaut", chestOnly: true },
]

// Chest prices in coins
export const CHEST_PRICES = {
  bronze: 50,
  silver: 150,
  gold: 400,
  legendary: 1000,
}

// Number of rewards per chest type
export const CHEST_REWARD_COUNT = {
  bronze: 1,
  silver: 2,
  gold: 3,
  legendary: 4,
}

export const RARITY_COLORS = {
  common: { bg: "bg-slate-800", border: "border-slate-500", text: "text-slate-300", glow: "" },
  rare: { bg: "bg-blue-900/60", border: "border-blue-400", text: "text-blue-400", glow: "shadow-blue-400/30" },
  epic: { bg: "bg-purple-900/60", border: "border-purple-400", text: "text-purple-400", glow: "shadow-purple-400/40" },
  legendary: { bg: "bg-amber-900/60", border: "border-amber-400", text: "text-amber-400", glow: "shadow-amber-400/50" },
}

export const RARITY_LABELS = {
  common: "Commun",
  rare: "Rare",
  epic: "Epique",
  legendary: "Legendaire",
}

// Check if user has unlocked an avatar
export function isAvatarUnlocked(avatarId: string, user: { 
  unlockedAvatars?: string[]
}): boolean {
  // Bull is always unlocked
  if (avatarId === "bull") return true
  
  // Check if unlocked (from chest)
  if (user.unlockedAvatars?.includes(avatarId)) return true
  
  return false
}

// Get random avatar from chest based on rarity, excluding already unlocked ones
export function getRandomAvatarFromChest(
  chestType: "bronze" | "silver" | "gold" | "legendary",
  unlockedAvatars: string[] = []
): Avatar | null {
  const rarityChances = {
    bronze: { common: 0.8, rare: 0.18, epic: 0.02, legendary: 0 },
    silver: { common: 0.4, rare: 0.45, epic: 0.13, legendary: 0.02 },
    gold: { common: 0.15, rare: 0.35, epic: 0.4, legendary: 0.1 },
    legendary: { common: 0, rare: 0.15, epic: 0.45, legendary: 0.4 },
  }
  
  const chances = rarityChances[chestType]
  const roll = Math.random()
  
  let targetRarity: Avatar["rarity"]
  if (roll < chances.legendary) targetRarity = "legendary"
  else if (roll < chances.legendary + chances.epic) targetRarity = "epic"
  else if (roll < chances.legendary + chances.epic + chances.rare) targetRarity = "rare"
  else targetRarity = "common"
  
  // Filter to only chest-unlockable avatars that haven't been unlocked yet
  const availableAvatars = AVATARS.filter(a => 
    a.rarity === targetRarity && 
    a.chestOnly && 
    !unlockedAvatars.includes(a.id)
  )
  
  // If all avatars of this rarity are unlocked, try another rarity
  if (availableAvatars.length === 0) {
    const allChestAvatars = AVATARS.filter(a => a.chestOnly && !unlockedAvatars.includes(a.id))
    if (allChestAvatars.length === 0) return null
    return allChestAvatars[Math.floor(Math.random() * allChestAvatars.length)]
  }
  
  return availableAvatars[Math.floor(Math.random() * availableAvatars.length)]
}
