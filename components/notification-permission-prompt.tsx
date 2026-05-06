"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import DeoMascot from "@/components/deo-mascot"
import { useI18n } from "@/lib/i18n"
import {
  requestNotificationPermission,
  getNotificationPreference,
  sendWelcomeNotification,
  startNotificationScheduler,
  registerPeriodicSync,
} from "@/lib/notifications"
import { useAuthStore } from "@/lib/auth-store"

const DISMISSED_KEY = "tradeo-notif-prompt-dismissed"

/**
 * A popup modal that appears when a logged-in user hasn't been asked
 * about notification permissions yet. Shows up on /learn after a brief delay.
 * Once dismissed (allow or deny), it won't appear again.
 */
export function NotificationPermissionPrompt() {
  const { user } = useAuthStore()
  const { language } = useI18n()
  const lang = (language === "en" ? "en" : "fr") as "fr" | "en"
  const [visible, setVisible] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    if (!user) return

    // Don't show if already dismissed or preference is already set
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    const hasPreference = getNotificationPreference()

    if (dismissed === "true" || hasPreference) return

    // Check native permission - if already granted or denied, don't show
    // But on mobile (iOS/Android), the Notification API might not be available
    // so we still want to show the prompt to save the user's preference
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted" || Notification.permission === "denied") {
        return
      }
    }

    // Show after a short delay so it doesn't feel jarring
    // This will show on ALL devices including iOS and Android
    const timer = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(timer)
  }, [user])

  const handleAllow = async () => {
    const result = await requestNotificationPermission()
    setGranted(result)
    setAnswered(true)
    localStorage.setItem(DISMISSED_KEY, "true")

    if (result) {
      sendWelcomeNotification(lang)
      startNotificationScheduler(lang)
      registerPeriodicSync()
    }

    // Auto-close after showing result
    setTimeout(() => setVisible(false), 2000)
  }

  const handleDeny = () => {
    setGranted(false)
    setAnswered(true)
    localStorage.setItem(DISMISSED_KEY, "true")
    setTimeout(() => setVisible(false), 1500)
  }

  const handleClose = () => {
    localStorage.setItem(DISMISSED_KEY, "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {!answered ? (
          <div className="space-y-5 text-center">
            {/* Mascot */}
            <div className="flex justify-center">
              <DeoMascot pose="presenting" size={120} />
            </div>

            {/* Title and description */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Bell className="h-6 w-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-foreground">
                  {lang === "fr" ? "Activer les notifications ?" : "Enable notifications?"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === "fr"
                  ? "Recois un rappel chaque soir pour ne pas perdre ta serie ! Les traders reguliers progressent 3x plus vite."
                  : "Get a daily reminder to keep your streak! Regular traders progress 3x faster."}
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={handleAllow}
                className="w-full h-13 text-base font-bold rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25"
              >
                {lang === "fr" ? "AUTORISER" : "ALLOW"}
              </Button>
              <button
                onClick={handleDeny}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {lang === "fr" ? "Pas maintenant" : "Not now"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            {granted ? (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Bell className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <p className="text-lg font-bold text-green-400">
                  {lang === "fr" ? "Notifications activees !" : "Notifications enabled!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === "fr"
                    ? "Tu recevras un rappel chaque soir."
                    : "You'll get a daily reminder."}
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <BellOff className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-base font-medium text-muted-foreground">
                  {lang === "fr" ? "Pas de souci !" : "No problem!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === "fr"
                    ? "Tu peux les activer plus tard dans les parametres."
                    : "You can enable them later in settings."}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
