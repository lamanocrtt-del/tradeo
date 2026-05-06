"use client"

import { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { haptics, sounds } from "@/lib/haptics"
import { AvatarIcon } from "./avatar-icons"
import { RARITY_COLORS, RARITY_LABELS, getRandomAvatarFromChest, CHEST_REWARD_COUNT, type Avatar } from "@/lib/avatars"
import { useAuthStore } from "@/lib/auth-store"
import { X, ChevronRight } from "lucide-react"

export interface ChestReward {
  type: "coins" | "xp" | "avatar" | "streak_freeze"
  amount?: number
  avatar?: Avatar
}

interface ChestOpeningProps {
  chestType: "bronze" | "silver" | "gold" | "legendary"
  onClose: () => void
  onRewardClaimed: (rewards: ChestReward[]) => void
}

const CHEST_COLORS = {
  bronze: { primary: "#CD7136", secondary: "#A85C2A", accent: "#E08746", glow: "shadow-orange-500/50" },
  silver: { primary: "#9CA3AF", secondary: "#6B7280", accent: "#D1D5DB", glow: "shadow-slate-400/50" },
  gold: { primary: "#FFC800", secondary: "#E5A800", accent: "#FFD900", glow: "shadow-yellow-500/50" },
  legendary: { primary: "#A855F7", secondary: "#7E22CE", accent: "#C084FC", glow: "shadow-purple-500/60" },
}

function generateRewards(
  chestType: "bronze" | "silver" | "gold" | "legendary",
  unlockedAvatars: string[] = []
): ChestReward[] {
  const count = CHEST_REWARD_COUNT[chestType]
  const rewards: ChestReward[] = []
  const usedAvatarIds: string[] = []
  
  // Avatar chance: higher rarity chests have better odds
  const avatarChance = { bronze: 0.15, silver: 0.25, gold: 0.4, legendary: 0.55 }[chestType]
  
  for (let i = 0; i < count; i++) {
    const roll = Math.random()
    
    // Try to give avatar
    if (roll < avatarChance) {
      const avatar = getRandomAvatarFromChest(chestType, [...unlockedAvatars, ...usedAvatarIds])
      if (avatar) {
        rewards.push({ type: "avatar", avatar })
        usedAvatarIds.push(avatar.id)
        continue
      }
    }
    
    // Coin rewards based on chest type
    const coinRanges = {
      bronze: { min: 5, max: 15 },
      silver: { min: 15, max: 40 },
      gold: { min: 30, max: 80 },
      legendary: { min: 60, max: 150 },
    }
    
    // 15% chance for streak freeze (silver+)
    if (chestType !== "bronze" && Math.random() < 0.15) {
      rewards.push({ type: "streak_freeze", amount: 1 })
      continue
    }
    
    // 20% chance for XP
    if (Math.random() < 0.2) {
      const xpRanges = {
        bronze: { min: 10, max: 30 },
        silver: { min: 25, max: 60 },
        gold: { min: 50, max: 120 },
        legendary: { min: 100, max: 250 },
      }
      const range = xpRanges[chestType]
      rewards.push({ type: "xp", amount: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min })
      continue
    }
    
    // Default: coins
    const range = coinRanges[chestType]
    rewards.push({ type: "coins", amount: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min })
  }
  
  return rewards
}

export function ChestOpening({ chestType, onClose, onRewardClaimed }: ChestOpeningProps) {
  const [tapCount, setTapCount] = useState(0)
  const [isOpening, setIsOpening] = useState(false)
  const [isOpened, setIsOpened] = useState(false)
  const [rewards, setRewards] = useState<ChestReward[]>([])
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const { user, addCoins, addXP, unlockAvatar } = useAuthStore()
  
  const colors = CHEST_COLORS[chestType]
  
  const handleTap = useCallback(() => {
    if (isOpened || isOpening) return
    
    haptics.tap()
    sounds.click()
    
    const newTapCount = tapCount + 1
    setTapCount(newTapCount)
    
    if (newTapCount >= 3) {
      setIsOpening(true)
      haptics.success()
      
      // Generate all rewards
      const generatedRewards = generateRewards(chestType, user?.unlockedAvatars || [])
      setRewards(generatedRewards)
      
      // Opening animation
      setTimeout(() => {
        setIsOpened(true)
        setTimeout(() => {
          setShowReward(true)
        }, 500)
      }, 800)
    }
  }, [tapCount, isOpening, isOpened, chestType, user?.unlockedAvatars])
  
  const currentReward = rewards[currentRewardIndex]
  const isLastReward = currentRewardIndex >= rewards.length - 1
  
  const handleNextReward = () => {
    haptics.tap()
    sounds.click()
    
    // Apply current reward
    if (currentReward) {
      if (currentReward.type === "coins" && currentReward.amount) {
        addCoins(currentReward.amount)
      } else if (currentReward.type === "xp" && currentReward.amount) {
        addXP(currentReward.amount)
      } else if (currentReward.type === "avatar" && currentReward.avatar) {
        unlockAvatar(currentReward.avatar.id)
      }
    }
    
    if (isLastReward) {
      haptics.success()
      onRewardClaimed(rewards)
      onClose()
    } else {
      setCurrentRewardIndex(prev => prev + 1)
    }
  }
  
  // Particle positions memoized to avoid re-renders
  const particles = useMemo(() => 
    [...Array(20)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${1 + Math.random()}s`,
    })), []
  )
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="h-6 w-6 text-white" />
      </button>
      
      {isOpened && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                left: p.left,
                top: p.top,
                backgroundColor: colors.primary,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      )}
      
      <div className="flex flex-col items-center gap-8">
        {!isOpened && (
          <div className="text-white text-center">
            <p className="text-lg font-semibold mb-2">Appuie sur le coffre !</p>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    tapCount > i ? "bg-white scale-125" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Reward counter */}
        {showReward && rewards.length > 1 && (
          <div className="flex gap-2 justify-center">
            {rewards.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  i === currentRewardIndex ? "bg-white scale-125" : i < currentRewardIndex ? "bg-white/60" : "bg-white/20"
                )}
              />
            ))}
          </div>
        )}
        
        <button
          onClick={handleTap}
          disabled={isOpened}
          className={cn(
            "relative transition-all duration-500 outline-none",
            isOpening && !isOpened && "animate-bounce",
            isOpened && "scale-110",
            !isOpened && "active:scale-95 hover:scale-105"
          )}
        >
          <svg viewBox="0 0 120 100" className={cn("w-48 h-40", isOpened && `drop-shadow-2xl ${colors.glow}`)}>
            <rect x="10" y="45" width="100" height="50" rx="8" fill={colors.secondary} />
            <rect x="10" y="45" width="100" height="45" rx="8" fill={colors.primary} />
            <g className={cn("origin-bottom transition-transform duration-500", isOpened && "-rotate-[60deg]")} style={{ transformOrigin: "60px 45px" }}>
              <path d="M10 45 Q10 20 60 15 Q110 20 110 45 Z" fill={colors.secondary} />
              <path d="M10 45 Q10 25 60 20 Q110 25 110 45 Z" fill={colors.primary} />
              <path d="M25 38 Q25 30 60 28 Q95 30 95 38" fill={colors.accent} fillOpacity="0.5" />
            </g>
            {!isOpened && (
              <g>
                <rect x="50" y="50" width="20" height="16" rx="3" fill={colors.accent} />
                <circle cx="60" cy="58" r="3" fill={colors.secondary} />
              </g>
            )}
            {isOpened && (
              <ellipse cx="60" cy="50" rx="35" ry="20" fill="url(#chest-glow)" />
            )}
            <defs>
              <radialGradient id="chest-glow">
                <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="20" y="55" width="80" height="4" rx="2" fill={colors.accent} />
            <rect x="20" y="70" width="80" height="4" rx="2" fill={colors.accent} />
          </svg>
          <div className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white font-bold text-sm",
            chestType === "bronze" && "bg-orange-600",
            chestType === "silver" && "bg-slate-500",
            chestType === "gold" && "bg-yellow-500 text-yellow-900",
            chestType === "legendary" && "bg-purple-600"
          )}>
            {chestType === "bronze" && "Bronze"}
            {chestType === "silver" && "Argent"}
            {chestType === "gold" && "Or"}
            {chestType === "legendary" && "Legendaire"}
          </div>
        </button>
        
        {/* Reward display - shows one reward at a time */}
        {showReward && currentReward && (
          <div key={currentRewardIndex} className="animate-in zoom-in-50 fade-in duration-500 flex flex-col items-center gap-4">
            <div className={cn(
              "p-6 rounded-2xl border-4",
              currentReward.type === "avatar" && currentReward.avatar
                ? `${RARITY_COLORS[currentReward.avatar.rarity].bg} ${RARITY_COLORS[currentReward.avatar.rarity].border}`
                : "bg-card border-border"
            )}>
              {currentReward.type === "coins" && (
                <div className="flex flex-col items-center gap-2">
                  <svg viewBox="0 0 64 64" className="w-20 h-20">
                    <circle cx="32" cy="32" r="28" fill="#FCD34D" />
                    <circle cx="32" cy="32" r="22" fill="#FBBF24" />
                    <text x="32" y="42" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#92400E">$</text>
                  </svg>
                  <span className="text-3xl font-bold text-amber-400">+{currentReward.amount}</span>
                  <span className="text-amber-400 font-semibold">Pieces</span>
                </div>
              )}
              
              {currentReward.type === "xp" && (
                <div className="flex flex-col items-center gap-2">
                  <svg viewBox="0 0 64 64" className="w-20 h-20">
                    <circle cx="32" cy="32" r="28" fill="#8B5CF6" />
                    <circle cx="32" cy="32" r="22" fill="#7C3AED" />
                    <text x="32" y="42" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">XP</text>
                  </svg>
                  <span className="text-3xl font-bold text-purple-400">+{currentReward.amount}</span>
                  <span className="text-purple-400 font-semibold">Experience</span>
                </div>
              )}
              
              {currentReward.type === "streak_freeze" && (
                <div className="flex flex-col items-center gap-2">
                  <svg viewBox="0 0 64 64" className="w-20 h-20">
                    <circle cx="32" cy="32" r="28" fill="#60A5FA" />
                    <path d="M32 12L36 28L48 32L36 36L32 52L28 36L16 32L28 28Z" fill="white" />
                  </svg>
                  <span className="text-xl font-bold text-blue-400">+1</span>
                  <span className="text-blue-400 font-semibold">Gel de serie</span>
                </div>
              )}
              
              {currentReward.type === "avatar" && currentReward.avatar && (
                <div className="flex flex-col items-center gap-2">
                  <AvatarIcon icon={currentReward.avatar.icon} size="xl" />
                  <span className="text-xl font-bold text-foreground">{currentReward.avatar.name}</span>
                  <span className={cn("text-sm font-semibold px-3 py-1 rounded-full", RARITY_COLORS[currentReward.avatar.rarity].bg, RARITY_COLORS[currentReward.avatar.rarity].text)}>
                    {RARITY_LABELS[currentReward.avatar.rarity]}
                  </span>
                  <span className="text-sm text-muted-foreground text-center max-w-[200px]">{currentReward.avatar.description}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleNextReward}
              className={cn(
                "px-8 py-3 rounded-xl font-bold text-white text-lg transition-all active:scale-95 flex items-center gap-2",
                "bg-gradient-to-b from-green-400 to-green-600 shadow-lg shadow-green-500/30",
                "hover:from-green-500 hover:to-green-700"
              )}
            >
              {isLastReward ? "Recuperer" : "Suivant"}
              {!isLastReward && <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
