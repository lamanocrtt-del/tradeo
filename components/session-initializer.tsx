"use client"

import { useEffect, useRef } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { createClient } from "@/lib/supabase/client"
import {
  startNotificationScheduler,
  registerPeriodicSync,
  getNotificationPreference,
  sendLocalNotification,
} from "@/lib/notifications"

/**
 * Initializes session on app load.
 * Checks Supabase session and syncs with local state,
 * marks the store as hydrated, starts notification scheduler,
 * and sends a welcome-back notification once per session.
 */
export function SessionInitializer() {
  const { checkSession, setHydrated, setUser } = useAuthStore()
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null)

  useEffect(() => {
    // Register service worker for notifications
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(
        (registration) => {
          console.log("[SW] Registered:", registration.scope)
        },
        (error) => console.log("[SW] Registration failed:", error)
      )
    }

    // Set up Supabase auth state listener for real-time session changes
    const supabase = createClient()
    authListenerRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] State change:", event)
      
      if (event === "SIGNED_OUT") {
        // Only clear user if actually signed out
        const currentUser = useAuthStore.getState().user
        // Don't clear demo users on SIGNED_OUT events
        if (currentUser && !currentUser.id.startsWith("demo-")) {
          setUser(null)
        }
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        // Session exists, sync user data
        if (session?.user) {
          await checkSession()
        }
      }
    })

    // Wait for zustand persist to rehydrate from localStorage
    const unsub = useAuthStore.persist.onFinishHydration(async () => {
      setHydrated(true)
      // Check Supabase session and sync user data from database
      await checkSession()
    })

    // If already hydrated (e.g. sync storage), check session immediately
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      checkSession()
    }

    // Start notification scheduler if user opted in
    let notifCleanup: (() => void) | undefined
    if (getNotificationPreference()) {
      const lang = (localStorage.getItem("tradeo-language") || "fr") as "fr" | "en"
      notifCleanup = startNotificationScheduler(lang)
      registerPeriodicSync()

      // Send a welcome-back notification once per session
      const user = useAuthStore.getState().user
      const sessionKey = "tradeo-session-notif-sent"
      if (user && !sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true")
        setTimeout(() => {
          sendLocalNotification("welcome", lang)
        }, 2000)
      }
    }

    return () => {
      unsub()
      if (notifCleanup) notifCleanup()
      if (authListenerRef.current) {
        authListenerRef.current.data.subscription.unsubscribe()
      }
    }
  }, [checkSession, setHydrated, setUser])

  return null
}
