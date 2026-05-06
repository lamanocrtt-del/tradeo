"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"

/**
 * Native-style splash screen. Only shows once per browser session.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Check sessionStorage only on client after mount to avoid hydration mismatch
    const alreadyShown = sessionStorage.getItem("tradeo-splash-shown")
    if (alreadyShown) return

    setVisible(true)
    sessionStorage.setItem("tradeo-splash-shown", "1")
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setVisible(false), 300)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-400 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 w-20 bg-gradient-to-br from-primary to-cyan-400 rounded-2xl mb-6 shadow-lg shadow-primary/30">
        <TrendingUp className="h-10 w-10 text-primary-foreground" />
      </div>

      {/* App name */}
      <h1 className="text-3xl font-bold text-foreground tracking-tight">Tradeo</h1>
      <p className="text-muted-foreground text-sm mt-2">
        Apprends le trading gratuitement
      </p>

      {/* Loading indicator */}
      <div className="mt-8 flex gap-1.5">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>

      {/* Simulation disclaimer (Play Store compliance) */}
      <p className="absolute bottom-8 text-muted-foreground text-xs text-center px-8">
        Simulateur educatif - Argent virtuel uniquement
      </p>
    </div>
  )
}
