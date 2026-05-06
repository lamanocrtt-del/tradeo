"use client"

import { cn } from "@/lib/utils"
import DeoMascot from "@/components/deo-mascot"

interface OwlMascotProps {
  size?: "sm" | "md" | "lg" | "xl"
  expression?: "happy" | "excited" | "thinking" | "sad" | "celebrating"
  className?: string
}

export function OwlMascot({ size = "md", expression = "happy", className }: OwlMascotProps) {
  const sizeMap = {
    sm: 100,
    md: 160,
    lg: 220,
    xl: 290,
  }

  const poseMap: Record<string, "happy" | "celebrating" | "thinking" | "sad"> = {
    happy: "happy",
    excited: "celebrating",
    thinking: "thinking",
    sad: "sad",
    celebrating: "celebrating",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <DeoMascot size={sizeMap[size]} pose={poseMap[expression] || "happy"} />
    </div>
  )
}

export default OwlMascot
