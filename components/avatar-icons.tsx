"use client"

import { cn } from "@/lib/utils"

interface AvatarIconProps {
  icon: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-16 h-16 text-4xl",
  xl: "w-24 h-24 text-6xl",
}

// Map icon ids to emoji characters
const ICON_EMOJIS: Record<string, string> = {
  bull: "\u{1F402}",
  bear: "\u{1F43B}",
  diamond: "\u{1F48E}",
  rocket: "\u{1F680}",
  crown: "\u{1F451}",
  fire: "\u{1F525}",
  star: "\u{2B50}",
  lightning: "\u{26A1}",
  shield: "\u{1F6E1}\uFE0F",
  chart: "\u{1F4CA}",
  coin: "\u{1FA99}",
  gem: "\u{1F48E}",
  trophy: "\u{1F3C6}",
  medal: "\u{1F3C5}",
  target: "\u{1F3AF}",
  whale: "\u{1F433}",
  fox: "\u{1F98A}",
  eagle: "\u{1F985}",
  wolf: "\u{1F43A}",
  panda: "\u{1F43C}",
  phoenix: "\u{1F426}\u200D\u{1F525}",
  dragon: "\u{1F409}",
  ninja: "\u{1F977}",
  samurai: "\u{2694}\uFE0F",
  astronaut: "\u{1F468}\u200D\u{1F680}",
}

export function AvatarIcon({ icon, size = "md", className }: AvatarIconProps) {
  const sizeClass = sizeClasses[size]
  const emoji = ICON_EMOJIS[icon] || ICON_EMOJIS.bull

  return (
    <span
      className={cn(
        "flex items-center justify-center select-none leading-none",
        sizeClass,
        className
      )}
      role="img"
      aria-label={icon}
    >
      {emoji}
    </span>
  )
}
