"use client"

import { cn } from "@/lib/utils"
import DeoMascot from "@/components/deo-mascot"

interface BullMascotProps {
  size?: "sm" | "md" | "lg" | "xl"
  expression?: "happy" | "excited" | "thinking" | "sad"
  className?: string
}

export function BullMascot({ size = "md", expression = "happy", className }: BullMascotProps) {
  const sizeMap = {
    sm: 80,
    md: 150,
    lg: 200,
    xl: 280,
  }

  const poseMap: Record<string, "happy" | "celebrating" | "thinking" | "sad"> = {
    happy: "happy",
    excited: "celebrating",
    thinking: "thinking",
    sad: "sad",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <DeoMascot size={sizeMap[size]} pose={poseMap[expression] || "happy"} />
    </div>
  )
}
