"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type BulliPose = "neutral" | "happy" | "excited" | "thinking" | "sad" | "presenting" | "celebrating" | "wink" | "surprised"

interface BulliMascotProps {
  pose?: BulliPose
  size?: number
  className?: string
  withSpeechBubble?: boolean
  speechText?: string
}

/**
 * Bulli - The cute trading bull mascot for Tradeo
 * A friendly bull character wearing a blue vest and green tie,
 * inspired by Duolingo's owl but for trading education.
 */
export function BulliMascot({ 
  pose = "neutral", 
  size = 150, 
  className,
  withSpeechBubble = false,
  speechText = ""
}: BulliMascotProps) {
  // Calculate image position offsets for different poses
  // The sprite sheet has 5 poses in a grid layout
  const getPoseStyles = (): { objectPosition: string; transform?: string } => {
    switch (pose) {
      case "sad":
      case "thinking":
        // Top-left pose (innocent/worried)
        return { objectPosition: "0% 0%" }
      case "presenting":
      case "explaining":
        // Top-right pose (timid/presenting)
        return { objectPosition: "100% 0%" }
      case "excited":
      case "surprised":
        // Bottom-left pose (amazed)
        return { objectPosition: "0% 100%" }
      case "celebrating":
      case "wink":
        // Bottom-right pose (happy/recovered)
        return { objectPosition: "100% 100%" }
      case "happy":
      case "neutral":
      default:
        // Center pose (main neutral happy)
        return { objectPosition: "50% 50%" }
    }
  }

  const poseStyles = getPoseStyles()
  
  // Animation class based on pose
  const getAnimationClass = () => {
    switch (pose) {
      case "celebrating":
      case "excited":
        return "animate-bounce"
      case "thinking":
        return "animate-pulse"
      default:
        return ""
    }
  }

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Speech bubble */}
      {withSpeechBubble && speechText && (
        <div className="relative mb-2 bg-white rounded-2xl px-4 py-3 shadow-lg max-w-[200px]">
          <p className="text-slate-800 font-semibold text-sm text-center leading-snug">
            {speechText}
          </p>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
        </div>
      )}
      
      {/* Mascot container */}
      <div 
        className={cn("relative overflow-hidden rounded-full", getAnimationClass())}
        style={{ 
          width: size, 
          height: size,
        }}
      >
        <Image
          src="/images/bulli-mascot.png"
          alt="Bulli - Tradeo Mascot"
          fill
          className="object-cover"
          style={{ 
            objectPosition: poseStyles.objectPosition,
            transform: poseStyles.transform,
          }}
          priority
        />
      </div>

      {/* Shadow */}
      <div 
        className="rounded-full bg-black/20 blur-md mt-2"
        style={{ 
          width: size * 0.6, 
          height: size * 0.1,
        }}
      />
    </div>
  )
}

export default BulliMascot
