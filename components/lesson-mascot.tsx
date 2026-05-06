"use client"

import DeoMascot from "@/components/deo-mascot"

interface LessonMascotProps {
  size?: "sm" | "md" | "lg"
  pose?: "thinking" | "happy" | "presenting" | "celebrating"
}

/**
 * Component to display Fall Guys style mascot in lessons
 */
export function LessonMascot({ size = "md", pose = "happy" }: LessonMascotProps) {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160,
  }

  return (
    <div className="flex justify-center">
      <DeoMascot size={sizeMap[size]} pose={pose} />
    </div>
  )
}
