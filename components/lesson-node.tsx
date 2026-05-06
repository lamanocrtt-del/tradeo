"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Lesson } from "@/lib/types"
import { Lock, Star, Trophy, BookOpen, Repeat, Gift, Crown } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/auth-store"
import { haptics, sounds } from "@/lib/haptics"

interface LessonNodeProps {
  lesson: Lesson
  isCompleted: boolean
  isUnlocked: boolean
  isPremiumOnly?: boolean
}

export function LessonNode({ lesson, isCompleted, isUnlocked, isPremiumOnly }: LessonNodeProps) {
  const router = useRouter()
  const { language } = useI18n()
  const { user } = useAuthStore()

  const handleClick = () => {
    if (!isUnlocked) return
    sounds.click()
    haptics.tap()
    if (isPremiumOnly && !user?.isPremium) {
      router.push("/premium")
      return
    }
    router.push(`/lesson/${lesson.id}`)
  }

  const getIcon = () => {
    if (isPremiumOnly && !user?.isPremium) {
      return <Crown className="h-7 w-7 drop-shadow-sm" />
    }
    switch (lesson.type) {
      case "lesson":
        return <BookOpen className="h-7 w-7 drop-shadow-sm" />
      case "practice":
        return <Repeat className="h-7 w-7 drop-shadow-sm" />
      case "story":
        return <BookOpen className="h-7 w-7 drop-shadow-sm" />
      case "unit-review":
        return <Trophy className="h-7 w-7 drop-shadow-sm" />
      case "chest":
        return <Gift className="h-7 w-7 drop-shadow-sm" />
      default:
        return <Star className="h-7 w-7 drop-shadow-sm" />
    }
  }

  // Color system inspired by the glossy 3D image
  const getColorSet = () => {
    if (!isUnlocked) return {
      face: "#3a3f4a",
      faceLight: "#4a4f5a",
      bottom: "#2a2f3a",
      shine: "rgba(255,255,255,0.03)",
      text: "text-gray-500",
    }
    if (isPremiumOnly && !user?.isPremium) return {
      face: "#f59e0b",
      faceLight: "#fbbf24",
      bottom: "#b45309",
      shine: "rgba(255,255,255,0.25)",
      text: "text-white",
    }
    if (isCompleted) return {
      face: "#eab308",
      faceLight: "#facc15",
      bottom: "#a16207",
      shine: "rgba(255,255,255,0.25)",
      text: "text-white",
    }
    switch (lesson.type) {
      case "lesson":
        return { face: "#22c55e", faceLight: "#4ade80", bottom: "#15803d", shine: "rgba(255,255,255,0.22)", text: "text-white" }
      case "practice":
        return { face: "#3b82f6", faceLight: "#60a5fa", bottom: "#1d4ed8", shine: "rgba(255,255,255,0.22)", text: "text-white" }
      case "story":
        return { face: "#a855f7", faceLight: "#c084fc", bottom: "#7e22ce", shine: "rgba(255,255,255,0.22)", text: "text-white" }
      case "unit-review":
        return { face: "#f97316", faceLight: "#fb923c", bottom: "#c2410c", shine: "rgba(255,255,255,0.22)", text: "text-white" }
      case "chest":
        return { face: "#ef4444", faceLight: "#f87171", bottom: "#b91c1c", shine: "rgba(255,255,255,0.22)", text: "text-white" }
      default:
        return { face: "#22c55e", faceLight: "#4ade80", bottom: "#15803d", shine: "rgba(255,255,255,0.22)", text: "text-white" }
    }
  }

  const colors = getColorSet()

  return (
    <button
      onClick={handleClick}
      disabled={!isUnlocked}
      className={cn(
        "relative group transition-all duration-150 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isUnlocked && "cursor-pointer active:scale-[0.92] hover:scale-[1.04]",
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="relative flex flex-col items-center">
        {/* Drop shadow on the ground */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[52px] h-[10px] rounded-[50%] blur-[6px] transition-all duration-150 group-active:blur-[4px] group-active:w-[48px]"
          style={{
            background: isUnlocked ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.12)",
            transform: "translateX(-50%) translateY(6px)",
          }}
        />

        {/* 3D squircle button */}
        <div className="relative" style={{ width: 64, height: 64 }}>
          {/* Bottom face (3D depth) */}
          <div
            className="absolute inset-0 transition-all duration-150 group-active:translate-y-[1px]"
            style={{
              background: colors.bottom,
              borderRadius: 18,
              transform: "translateY(5px)",
            }}
          />

          {/* Main face */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-150 group-active:translate-y-[3px]",
              colors.text,
              !isUnlocked && "opacity-50",
            )}
            style={{
              background: `linear-gradient(145deg, ${colors.faceLight} 0%, ${colors.face} 50%, ${colors.face} 100%)`,
              borderRadius: 18,
            }}
          >
            {/* Glossy shine overlay - top highlight like the reference image */}
            <div
              className="absolute overflow-hidden pointer-events-none"
              style={{
                top: 3,
                left: 5,
                right: 5,
                height: "45%",
                borderRadius: "14px 14px 50% 50%",
                background: `linear-gradient(180deg, ${colors.shine} 0%, transparent 100%)`,
              }}
            />

            {/* Inner subtle border highlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: 18,
                boxShadow: `inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.1)`,
              }}
            />

            {/* Icon */}
            <div className="relative z-10">
              {!isUnlocked ? <Lock className="h-7 w-7 drop-shadow-sm" /> : getIcon()}
            </div>
          </div>

          {/* Completed star badge */}
          {isCompleted && (
            <div
              className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full flex items-center justify-center z-20"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                boxShadow: "0 2px 6px rgba(245,158,11,0.5)",
              }}
            >
              <Star className="h-3.5 w-3.5 text-white fill-current" />
            </div>
          )}

          {/* Premium crown badge */}
          {isPremiumOnly && !user?.isPremium && isUnlocked && (
            <div
              className="absolute -top-1.5 -left-1.5 h-6 w-6 rounded-full flex items-center justify-center z-20"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #d97706)",
                boxShadow: "0 2px 6px rgba(217,119,6,0.5)",
              }}
            >
              <Crown className="h-3 w-3 text-white fill-current" />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
