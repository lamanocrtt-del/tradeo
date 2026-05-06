"use client"

import { Progress } from "./ui/progress"
import { Heart, X, Infinity } from "lucide-react"
import { Button } from "./ui/button"
import { useAuthStore } from "@/lib/auth-store"

interface LessonHeaderProps {
  progress: number
  hearts: number
  onExit: () => void
}

export function LessonHeader({ progress, hearts, onExit }: LessonHeaderProps) {
  const { user } = useAuthStore()
  const isPremium = user?.isPremium

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onExit} className="shrink-0">
            <X className="h-6 w-6" />
          </Button>

          <Progress value={progress} className="flex-1 h-4" />

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 ${isPremium ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
            <Heart className="h-5 w-5 fill-current" />
            {isPremium ? (
              <Infinity className="h-5 w-5" />
            ) : (
              <span className="font-bold text-sm">{hearts}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
