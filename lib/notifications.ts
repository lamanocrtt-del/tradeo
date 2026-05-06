"use client"

// Push notification utilities for Tradeo
// Works with native Notification API when available,
// falls back to service worker notifications,
// and always saves user preference.

const NOTIF_PREF_KEY = "tradeo-notifications-enabled"

const NOTIFICATION_MESSAGES = {
  fr: {
    dailyLesson: [
      { title: "Ta serie va se briser !", body: "Tu n'as pas encore fait ta lecon aujourd'hui. Ne perds pas tes progres !" },
      { title: "Deo a besoin de toi !", body: "5 minutes suffisent pour maintenir ta serie. C'est parti !" },
      { title: "Rappel quotidien", body: "Ta lecon du jour t'attend ! Les meilleurs traders s'entrainent chaque jour." },
      { title: "Tu es en bonne voie !", body: "Ne t'arrete pas maintenant. Fais ta lecon pour garder ta flamme !" },
      { title: "Tu nous manques !", body: "Reviens maintenir ta serie ! Il te faut juste une lecon." },
      { title: "Derniere chance !", body: "Ta serie est en danger. Ouvre Tradeo et fais ta lecon maintenant !" },
      { title: "N'oublie pas !", body: "Deo t'attend pour ta lecon quotidienne. Ne le decois pas !" },
      { title: "Le savais-tu ?", body: "Les traders qui s'entrainent regulierement reussissent 3x plus. Fais ta lecon !" },
    ],
    update: [
      { title: "Nouveaute Tradeo", body: "De nouvelles lecons sont disponibles ! Decouvre-les maintenant." },
      { title: "Mise a jour Tradeo", body: "Nouvelle fonctionnalite : simulations de trading ameliorees !" },
    ],
    streak: [
      { title: "Serie en danger !", body: "Tu n'as pas fait ta lecon aujourd'hui. Encore quelques heures avant de perdre ta serie !" },
      { title: "URGENCE : Serie menacee", body: "Plus que quelques heures ! Ne laisse pas ta flamme s'eteindre." },
      { title: "Tu vas tout perdre !", body: "Ta serie est sur le point de se briser. Ouvre Tradeo maintenant !" },
    ],
    welcome: [
      { title: "Bienvenue sur Tradeo !", body: "Les notifications sont activees. Tu recevras un rappel chaque jour pour ne pas perdre ta serie." },
    ],
    accountCreated: [
      { title: "Compte cree avec succes !", body: "Bienvenue sur Tradeo ! Ton aventure trading commence maintenant. Premiere lecon = Premiere flamme !" },
    ],
  },
  en: {
    dailyLesson: [
      { title: "Your streak is about to break!", body: "You haven't done your lesson today. Don't lose your progress!" },
      { title: "Deo needs you!", body: "5 minutes is all it takes to keep your streak. Let's go!" },
      { title: "Daily reminder", body: "Your daily lesson is waiting! The best traders practice every day." },
      { title: "You're on track!", body: "Don't stop now. Complete your lesson to keep your flame!" },
      { title: "We miss you!", body: "Come back and maintain your streak! Just one lesson needed." },
      { title: "Last chance!", body: "Your streak is at risk. Open Tradeo and do your lesson now!" },
      { title: "Don't forget!", body: "Deo is waiting for your daily lesson. Don't let him down!" },
      { title: "Did you know?", body: "Traders who practice regularly succeed 3x more. Do your lesson!" },
    ],
    update: [
      { title: "Tradeo Update", body: "New lessons are available! Check them out now." },
      { title: "Tradeo Update", body: "New feature: improved trading simulations!" },
    ],
    streak: [
      { title: "Streak at risk!", body: "You haven't done your lesson today. Only a few hours left before you lose your streak!" },
      { title: "URGENT: Streak threatened", body: "Only a few hours left! Don't let your flame go out." },
      { title: "You're about to lose it all!", body: "Your streak is about to break. Open Tradeo now!" },
    ],
    welcome: [
      { title: "Welcome to Tradeo!", body: "Notifications are enabled. You'll get a daily reminder to keep your streak going." },
    ],
    accountCreated: [
      { title: "Account created!", body: "Welcome to Tradeo! Your trading journey starts now. First lesson = First flame!" },
    ],
  },
}

// ─── User preference helpers ─────────────────────────────────────────────────
// These save/read the user's notification preference independently from the
// browser Notification API, so the app can track the user's choice even when
// the API is not available (iOS Safari, iframe, etc.)

export function saveNotificationPreference(enabled: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem(NOTIF_PREF_KEY, enabled ? "true" : "false")
}

export function getNotificationPreference(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(NOTIF_PREF_KEY) === "true"
}

// ─── Service Worker ──────────────────────────────────────────────────────────

async function ensureServiceWorkerReady(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null
  if (!("serviceWorker" in navigator)) return null

  try {
    let registration = await navigator.serviceWorker.getRegistration("/sw.js")
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    }

    if (registration.installing) {
      await new Promise<void>((resolve) => {
        const sw = registration!.installing!
        sw.addEventListener("statechange", function handler() {
          if (this.state === "activated") {
            this.removeEventListener("statechange", handler)
            resolve()
          }
        })
        // Timeout after 5 seconds to prevent hanging
        setTimeout(resolve, 5000)
      })
    }

    return registration
  } catch {
    return null
  }
}

// ─── Permission helpers ──────────────────────────────────────────────────────

/**
 * Check if the Notification API is available in this browser context.
 */
function hasNotificationAPI(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

/**
 * Request notification permission.
 * 
 * This triggers the REAL native browser/system permission dialog
 * (the same popup the OS shows for any website asking for notification access).
 * 
 * On mobile devices (iOS Safari, Android Chrome, WebViews):
 * - iOS Safari 16.4+ supports web push notifications for PWAs added to home screen
 * - Android Chrome supports standard web push notifications
 * - In-app WebViews may not support notifications but we save preference anyway
 * 
 * Returns true if permission was granted, false otherwise.
 * Always saves the user preference so we can remind them later.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false

  // Ensure service worker is registered first (needed for showNotification)
  await ensureServiceWorkerReady()

  // If the Notification API is available, trigger the REAL system dialog
  if (hasNotificationAPI()) {
    // Already granted? No dialog needed.
    if (Notification.permission === "granted") {
      saveNotificationPreference(true)
      return true
    }

    // Already denied by browser? Can't ask again - save preference anyway.
    if (Notification.permission === "denied") {
      saveNotificationPreference(true)
      return false
    }

    // Permission is "default" - this will trigger the REAL native dialog
    // On iOS Safari 16.4+: triggers iOS notification permission (if PWA)
    // On Chrome/Firefox: the browser permission bar/popup
    // On Android Chrome: the Android system notification permission dialog
    try {
      const permission = await Notification.requestPermission()
      const granted = permission === "granted"
      saveNotificationPreference(true) // User opted in regardless of result
      return granted
    } catch {
      saveNotificationPreference(true)
      return false
    }
  }

  // Notification API not available (iOS Safari before 16.4, some webviews, iframes)
  // Still save the preference - this allows the app to:
  // 1. Show in-app notifications
  // 2. Work when user installs PWA on iOS 16.4+
  // 3. Send notifications if user opens in a supported browser later
  saveNotificationPreference(true)
  await ensureServiceWorkerReady()
  return true
}

/**
 * Get the effective notification status for UI display.
 * Combines browser permission with user preference.
 */
export function getNotificationStatus(): "granted" | "denied" | "default" | "preference-only" {
  if (typeof window === "undefined") return "default"

  // If Notification API is available, use it
  if (hasNotificationAPI()) {
    const perm = Notification.permission
    // If user previously opted in but permission shows default, still show as preference-only
    if (perm === "default" && getNotificationPreference()) {
      return "preference-only"
    }
    return perm as "granted" | "denied" | "default"
  }

  // No Notification API - check user preference
  if (getNotificationPreference()) {
    return "preference-only"
  }
  return "default"
}

/**
 * @deprecated Use getNotificationStatus() instead
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined") return "unsupported"
  if (!("Notification" in window)) {
    // Check user preference as fallback
    if (getNotificationPreference()) return "granted" as NotificationPermission
    return "unsupported"
  }
  return Notification.permission
}

// ─── Send notifications ──────────────────────────────────────────────────────

type NotifType = "dailyLesson" | "update" | "streak" | "welcome" | "accountCreated"

/**
 * Send a real notification. Tries Service Worker first, then falls back to
 * Notification constructor. If neither is available, saves to history only.
 */
export async function sendLocalNotification(type: NotifType, lang: "fr" | "en" = "fr") {
  if (typeof window === "undefined") return

  const messages = NOTIFICATION_MESSAGES[lang][type]
  const message = messages[Math.floor(Math.random() * messages.length)]

  // Try service worker notification (works even when Notification API not directly available)
  try {
    const registration = await ensureServiceWorkerReady()
    if (registration?.active) {
      await registration.showNotification(message.title, {
        body: message.body,
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: type,
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
          url: type === "dailyLesson" || type === "streak" ? "/learn" : "/notifications",
        },
      })
      return
    }
  } catch {
    // Service worker notification failed
  }

  // Fallback: try direct Notification API
  if (hasNotificationAPI() && Notification.permission === "granted") {
    try {
      new Notification(message.title, {
        body: message.body,
        icon: "/icon.svg",
        tag: type,
      })
    } catch {
      // Not supported in this context
    }
  }
}

/**
 * Send a welcome notification right after opt-in.
 * Sends an immediate notification + a second one after 5 seconds.
 */
export function sendWelcomeNotification(lang: "fr" | "en" = "fr") {
  setTimeout(() => {
    sendLocalNotification("welcome", lang)
    saveNotificationToHistory({
      type: "welcome",
      lang,
      timestamp: Date.now(),
    })
  }, 1500)

  setTimeout(() => {
    sendLocalNotification("dailyLesson", lang)
    saveNotificationToHistory({
      type: "dailyLesson",
      lang,
      timestamp: Date.now(),
    })
  }, 6000)
}

/**
 * Send a notification when account is created.
 */
export function sendAccountCreatedNotification(lang: "fr" | "en" = "fr") {
  if (typeof window === "undefined") return

  setTimeout(() => {
    sendLocalNotification("accountCreated", lang)
    saveNotificationToHistory({
      type: "accountCreated",
      lang,
      timestamp: Date.now(),
    })
  }, 1000)
}

// ─── Notification history ────────────────────────────────────────────────────

const NOTIF_HISTORY_KEY = "tradeo-notification-history"

export interface NotificationHistoryItem {
  id: string
  type: NotifType
  lang: "fr" | "en"
  timestamp: number
  read: boolean
}

export function saveNotificationToHistory(item: { type: string; lang: string; timestamp: number }) {
  if (typeof window === "undefined") return
  const history = getNotificationHistory()
  const newItem: NotificationHistoryItem = {
    id: `${item.type}-${item.timestamp}`,
    type: item.type as NotifType,
    lang: item.lang as "fr" | "en",
    timestamp: item.timestamp,
    read: false,
  }
  history.unshift(newItem)
  if (history.length > 50) history.length = 50
  localStorage.setItem(NOTIF_HISTORY_KEY, JSON.stringify(history))
}

export function getNotificationHistory(): NotificationHistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(NOTIF_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function markNotificationRead(id: string) {
  if (typeof window === "undefined") return
  const history = getNotificationHistory()
  const item = history.find((n) => n.id === id)
  if (item) {
    item.read = true
    localStorage.setItem(NOTIF_HISTORY_KEY, JSON.stringify(history))
  }
}

export function clearNotificationHistory() {
  if (typeof window === "undefined") return
  localStorage.removeItem(NOTIF_HISTORY_KEY)
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

export function startNotificationScheduler(lang: "fr" | "en" = "fr") {
  if (typeof window === "undefined") return null

  // Check if user opted in (via preference, not just browser API)
  if (!getNotificationPreference()) return null

  const STORAGE_KEY_REMINDER = "tradeo-last-reminder-notif"
  const STORAGE_KEY_STREAK = "tradeo-last-streak-notif"

  const checkAndSend = () => {
    const now = new Date()
    const hour = now.getHours()
    const today = now.toDateString()

    // Check if user already did a lesson today
    const authRaw = localStorage.getItem("tradeo-auth-store")
    let didLessonToday = false
    if (authRaw) {
      try {
        const authState = JSON.parse(authRaw)
        const lastLessonDate = authState?.state?.user?.lastLessonDate
        if (lastLessonDate === now.toISOString().split("T")[0]) {
          didLessonToday = true
        }
      } catch { /* ignore */ }
    }

    // If user already did lesson today, no notifications needed
    if (didLessonToday) return

    // Evening reminder (6-7 PM) - gentle daily lesson reminder
    const lastReminder = localStorage.getItem(STORAGE_KEY_REMINDER)
    if (hour >= 18 && hour < 20 && lastReminder !== today) {
      sendLocalNotification("dailyLesson", lang)
      saveNotificationToHistory({
        type: "dailyLesson",
        lang,
        timestamp: Date.now(),
      })
      localStorage.setItem(STORAGE_KEY_REMINDER, today)
    }

    // Late evening (9-10 PM) - urgent streak danger notification
    const lastStreak = localStorage.getItem(STORAGE_KEY_STREAK)
    if (hour >= 21 && hour < 23 && lastStreak !== today) {
      sendLocalNotification("streak", lang)
      saveNotificationToHistory({
        type: "streak",
        lang,
        timestamp: Date.now(),
      })
      localStorage.setItem(STORAGE_KEY_STREAK, today)
    }
  }

  checkAndSend()
  const intervalId = setInterval(checkAndSend, 15 * 60 * 1000) // Check every 15 minutes
  return () => clearInterval(intervalId)
}

export async function registerPeriodicSync() {
  if (typeof window === "undefined") return
  if (!("serviceWorker" in navigator)) return

  try {
    const registration = await navigator.serviceWorker.ready

    // Register periodic sync for background notifications
    if ("periodicSync" in registration) {
      const status = await navigator.permissions.query({
        name: "periodic-background-sync" as PermissionName,
      })

      if (status.state === "granted") {
        // Daily lesson reminder - every 12 hours
        await (registration as any).periodicSync.register("daily-lesson-reminder", {
          minInterval: 12 * 60 * 60 * 1000, // 12 hours
        })
        
        // Streak reminder - every 6 hours for urgency
        await (registration as any).periodicSync.register("streak-reminder", {
          minInterval: 6 * 60 * 60 * 1000, // 6 hours
        })
      }
    }
  } catch {
    // Periodic sync not supported - fall back to alternative method
    scheduleBackgroundNotifications()
  }
}

/**
 * Schedule notifications using the service worker message API
 * This is a fallback for browsers that don't support periodic sync
 */
async function scheduleBackgroundNotifications() {
  if (typeof window === "undefined") return
  if (!("serviceWorker" in navigator)) return
  
  try {
    const registration = await navigator.serviceWorker.ready
    
    // Schedule evening reminder (8 hours from now)
    registration.active?.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      delay: 8 * 60 * 60 * 1000,
      title: "Tradeo",
      body: "Ta lecon du jour t'attend ! Ne perds pas ta serie.",
      url: "/learn"
    })
    
    // Schedule morning reminder (next day)
    registration.active?.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      delay: 24 * 60 * 60 * 1000,
      title: "Tradeo",
      body: "Bonjour ! Commence ta journee avec une lecon de trading.",
      url: "/learn"
    })
  } catch (e) {
    console.log("[Notifications] Failed to schedule background notifications:", e)
  }
}
