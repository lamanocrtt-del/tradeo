"use client"

import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"
import { Button } from "./ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem("pwa-install-dismissed")
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted PWA install")
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-card border-2 border-primary rounded-xl p-4 shadow-2xl">
        <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Installer Tradeo</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Accédez plus rapidement à vos leçons et utilisez l'app hors ligne
            </p>
            <Button onClick={handleInstall} size="sm" className="w-full">
              Installer l'application
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
