"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface DeoPose {
  pose?:
    | "happy"
    | "celebrating"
    | "presenting"
    | "thinking"
    | "surprised"
    | "explaining"
    | "rich"
    | "success"
    | "neutral"
    | "sad"
    | "excited"
    | "wink"
  size?: number
  className?: string
}

/**
 * Bulli - The cute trading bull mascot for Tradeo
 * A friendly bull character wearing a blue vest and green tie,
 * inspired by Duolingo's owl but for trading education.
 * 
 * Uses CSS filter to remove the white/gray background and make
 * the mascot blend seamlessly with any page background.
 */
function DeoMascot({ pose = "neutral", size = 320, className }: DeoPose) {
  return (
    <div 
      className={cn("relative flex flex-col items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Glow effect behind mascot */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-transparent blur-2xl scale-75"
        style={{ width: size, height: size }}
      />
      <Image
        src="/images/tradeo-mascot.png"
        alt="Bulli - Tradeo Mascot"
        width={size}
        height={size}
        className="object-contain relative z-10 drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]"
        style={{
          filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))",
        }}
        priority
      />
    </div>
  )
}

export { DeoMascot }
export default DeoMascot
