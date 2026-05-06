"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Bell, Star, Gift, Flame, BookOpen, X, BellRing, CheckCircle2, ArrowLeft, ChevronRight } from "lucide-react"
import { useTranslation, useI18n } from "@/lib/i18n"
import {
  getNotificationHistory,
  markNotificationRead as markHistoryRead,
  requestNotificationPermission,
  sendWelcomeNotification,
  startNotificationScheduler,
  registerPeriodicSync,
} from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import DeoMascot from "@/components/deo-mascot"

interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  fullMessage: string
  icon: typeof Star
  color: string
  bgGradient: string
  timestamp: Date
  read: boolean
  actionLabel?: string
  actionRoute?: string
}

// Full detailed messages for each notification type (shown when you open a notification)
const NOTIFICATION_FULL_MESSAGES = {
  fr: {
    welcome: "Bienvenue dans la communaute Tradeo ! Tu as fait le premier pas vers ta reussite en trading. Les notifications t'aideront a rester regulier : tu recevras un rappel chaque soir pour ne pas oublier ta lecon quotidienne. Les traders qui s'entrainent tous les jours progressent 3 fois plus vite. Alors a demain !",
    dailyLesson: "Hey ! Tu n'as pas encore fait ta lecon aujourd'hui. Ta serie est en jeu ! Il suffit de 5 minutes pour completer une lecon et garder ta flamme allumee. Les meilleurs traders du monde s'entrainent chaque jour, et toi aussi tu peux le faire. Ne laisse pas ta serie se briser, ouvre ta lecon maintenant !",
    streak: "ALERTE : Ta serie est en danger ! Tu n'as pas fait ta lecon aujourd'hui et il ne reste plus beaucoup de temps. Si tu ne completes pas une lecon avant minuit, ta serie va se briser et tu repartiras a zero. Tout le travail que tu as accompli, tous ces jours consecutifs... ne les laisse pas s'envoler ! Fais vite ta lecon !",
    update: "Bonne nouvelle ! De nouvelles lecons viennent d'etre ajoutees a Tradeo. Decouvre de nouveaux concepts de trading, des exercices pratiques et des simulations ameliorees. Continue a progresser et a enrichir tes connaissances !",
    accountCreated: "Felicitations pour la creation de ton compte Tradeo ! Ton aventure trading commence maintenant. Voici quelques conseils pour bien demarrer : fais ta premiere lecon pour allumer ta flamme, reviens chaque jour pour maintenir ta serie, et n'hesite pas a activer les notifications pour ne rien manquer. Bonne chance !",
    achievement: "Bravo, tu as franchi un nouveau palier ! Ta dedication porte ses fruits. Continue sur cette lancee et tu deviendras un veritable expert du trading. Chaque XP gagne te rapproche de ton objectif !",
    streakReward: "Incroyable ! Ta serie de jours consecutifs est impressionnante. C'est la preuve de ta determination et de ta discipline. Les traders les plus reussis partagent cette qualite : la regularite. Continue comme ca, tu es sur la bonne voie !",
    reward: "Tu as recu une recompense quotidienne ! Les gems te permettent de debloquer du contenu exclusif et des fonctionnalites speciales. Continue a te connecter chaque jour pour en recevoir davantage.",
    lesson: "Une nouvelle lecon est disponible ! Decouvre de nouveaux concepts et ameliore tes competences en trading. Chaque lecon terminee te rapproche de la maitrise complete.",
  },
  en: {
    welcome: "Welcome to the Tradeo community! You've taken the first step towards trading success. Notifications will help you stay consistent: you'll receive a reminder every evening so you don't forget your daily lesson. Traders who practice every day progress 3 times faster. See you tomorrow!",
    dailyLesson: "Hey! You haven't done your lesson today yet. Your streak is at stake! It only takes 5 minutes to complete a lesson and keep your flame burning. The best traders in the world practice every day, and you can too. Don't let your streak break, open your lesson now!",
    streak: "ALERT: Your streak is in danger! You haven't done your lesson today and time is running out. If you don't complete a lesson before midnight, your streak will break and you'll start from zero. All the work you've put in, all those consecutive days... don't let them go! Do your lesson now!",
    update: "Great news! New lessons have been added to Tradeo. Discover new trading concepts, practical exercises, and improved simulations. Keep progressing and enriching your knowledge!",
    accountCreated: "Congratulations on creating your Tradeo account! Your trading journey starts now. Here are some tips to get started: complete your first lesson to ignite your flame, come back every day to maintain your streak, and don't hesitate to enable notifications so you never miss anything. Good luck!",
    achievement: "Congratulations, you've reached a new milestone! Your dedication is paying off. Keep this momentum going and you'll become a true trading expert. Every XP earned brings you closer to your goal!",
    streakReward: "Incredible! Your consecutive day streak is impressive. It's proof of your determination and discipline. The most successful traders share this quality: consistency. Keep it up, you're on the right track!",
    reward: "You received a daily reward! Gems allow you to unlock exclusive content and special features. Keep logging in every day to receive more.",
    lesson: "A new lesson is available! Discover new concepts and improve your trading skills. Every completed lesson brings you closer to full mastery.",
  },
}

const PUSH_NOTIFICATION_DETAILS = {
  fr: {
    welcome: {
      title: "Bienvenue sur Tradeo !",
      message: "Les notifications sont activees. Tu recevras un rappel chaque jour.",
      icon: CheckCircle2,
      color: "bg-green-500/20 text-green-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
    },
    dailyLesson: {
      title: "Rappel quotidien",
      message: "Ta lecon du jour t'attend ! Ne perds pas ta serie.",
      icon: BellRing,
      color: "bg-cyan-500/20 text-cyan-500",
      bgGradient: "from-cyan-500/10 to-blue-500/10",
    },
    streak: {
      title: "Serie en danger !",
      message: "Tu n'as pas fait ta lecon aujourd'hui. Ta serie est en danger !",
      icon: Flame,
      color: "bg-orange-500/20 text-orange-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
    },
    update: {
      title: "Nouveaute Tradeo",
      message: "De nouvelles lecons sont disponibles ! Decouvre-les maintenant.",
      icon: Star,
      color: "bg-purple-500/20 text-purple-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    accountCreated: {
      title: "Compte cree avec succes !",
      message: "Bienvenue sur Tradeo ! Ton aventure trading commence maintenant.",
      icon: CheckCircle2,
      color: "bg-green-500/20 text-green-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
    },
  },
  en: {
    welcome: {
      title: "Welcome to Tradeo!",
      message: "Notifications are enabled. You'll get a daily reminder.",
      icon: CheckCircle2,
      color: "bg-green-500/20 text-green-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
    },
    dailyLesson: {
      title: "Daily reminder",
      message: "Your daily lesson is waiting! Don't lose your streak.",
      icon: BellRing,
      color: "bg-cyan-500/20 text-cyan-500",
      bgGradient: "from-cyan-500/10 to-blue-500/10",
    },
    streak: {
      title: "Streak at risk!",
      message: "You haven't done your lesson today. Your streak is at risk!",
      icon: Flame,
      color: "bg-orange-500/20 text-orange-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
    },
    update: {
      title: "Tradeo Update",
      message: "New lessons are available! Check them out now.",
      icon: Star,
      color: "bg-purple-500/20 text-purple-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    accountCreated: {
      title: "Account created!",
      message: "Welcome to Tradeo! Your trading journey starts now.",
      icon: CheckCircle2,
      color: "bg-green-500/20 text-green-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
    },
  },
}

function buildNotifications(user: any, lang: "fr" | "en"): AppNotification[] {
  const now = new Date()
  const notifications: AppNotification[] = []
  const fullMsgs = NOTIFICATION_FULL_MESSAGES[lang]

  // Real push notification history
  const pushHistory = getNotificationHistory()
  for (const item of pushHistory) {
    const details = PUSH_NOTIFICATION_DETAILS[item.lang]?.[item.type] || PUSH_NOTIFICATION_DETAILS.fr[item.type]
    if (details) {
      const typeKey = item.type as keyof typeof fullMsgs
      notifications.push({
        id: item.id,
        type: item.type,
        title: details.title,
        message: details.message,
        fullMessage: fullMsgs[typeKey] || details.message,
        icon: details.icon,
        color: details.color,
        bgGradient: details.bgGradient,
        timestamp: new Date(item.timestamp),
        read: item.read,
        actionLabel: item.type === "dailyLesson" || item.type === "streak"
          ? lang === "fr" ? "Faire ma lecon" : "Do my lesson"
          : undefined,
        actionRoute: item.type === "dailyLesson" || item.type === "streak" ? "/learn" : undefined,
      })
    }
  }

  // Activity-based notifications
  if (user?.xp >= 100) {
    const xpMilestone = Math.floor((user.xp || 0) / 100) * 100
    notifications.push({
      id: "xp-100",
      type: "achievement",
      title: lang === "fr" ? "Nouveau succes !" : "New achievement!",
      message: lang === "fr" ? `Tu as atteint ${xpMilestone} XP !` : `You reached ${xpMilestone} XP!`,
      fullMessage: fullMsgs.achievement,
      icon: Star,
      color: "bg-yellow-500/20 text-yellow-500",
      bgGradient: "from-yellow-500/10 to-amber-500/10",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      read: false,
    })
  }

  if (user?.streak >= 1) {
    notifications.push({
      id: "streak-congrats",
      type: "streakReward",
      title: lang === "fr" ? `Serie de ${user.streak} jours !` : `${user.streak} day streak!`,
      message: lang === "fr" ? "Continue comme ca, tu es incroyable !" : "Keep it up, you're incredible!",
      fullMessage: fullMsgs.streakReward,
      icon: Flame,
      color: "bg-orange-500/20 text-orange-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      read: false,
    })
  }

  notifications.push({
    id: "daily-reward",
    type: "reward",
    title: lang === "fr" ? "Recompense quotidienne" : "Daily reward",
    message: lang === "fr" ? "Tu as gagne 50 gems !" : "You earned 50 gems!",
    fullMessage: fullMsgs.reward,
    icon: Gift,
    color: "bg-blue-500/20 text-blue-500",
    bgGradient: "from-blue-500/10 to-indigo-500/10",
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  })

  notifications.push({
    id: "lesson-new",
    type: "lesson",
    title: lang === "fr" ? "Nouvelle lecon disponible" : "New lesson available",
    message: lang === "fr" ? "La lecon Supply & Demand est disponible !" : "The Supply & Demand lesson is available!",
    fullMessage: fullMsgs.lesson,
    icon: BookOpen,
    color: "bg-green-500/20 text-green-500",
    bgGradient: "from-green-500/10 to-emerald-500/10",
    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    read: false,
    actionLabel: lang === "fr" ? "Voir la lecon" : "View lesson",
    actionRoute: "/learn",
  })

  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

function formatTimeAgo(date: Date, t: any): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return t.notifications.timeAgo.now
  if (minutes < 60) return t.notifications.timeAgo.minutes.replace("{n}", String(minutes))
  if (hours < 24) return t.notifications.timeAgo.hours.replace("{n}", String(hours))
  return t.notifications.timeAgo.days.replace("{n}", String(days))
}

// Notification detail view component
function NotificationDetail({
  notification,
  onBack,
  onAction,
  lang,
}: {
  notification: AppNotification
  onBack: () => void
  onAction: (route: string) => void
  lang: "fr" | "en"
}) {
  const Icon = notification.icon
  const mascotPose = notification.type === "streak" ? "thinking" : notification.type === "achievement" || notification.type === "streakReward" ? "celebrating" : "presenting"

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">{lang === "fr" ? "Retour" : "Back"}</span>
      </button>

      {/* Notification header with gradient */}
      <div className={`bg-gradient-to-br ${notification.bgGradient} rounded-2xl p-6 border border-border`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${notification.color}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{notification.title}</h2>
            <p className="text-xs text-muted-foreground">
              {notification.timestamp.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Mascot with speech bubble */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <DeoMascot pose={mascotPose as any} size={100} />
        </div>
        <div className="relative bg-card rounded-2xl px-5 py-4 border border-border flex-1 shadow-sm">
          <div className="absolute left-[-10px] top-6 w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-card border-b-[8px] border-b-transparent" />
          <p className="text-foreground text-sm leading-relaxed">
            {notification.fullMessage}
          </p>
        </div>
      </div>

      {/* Action button */}
      {notification.actionLabel && notification.actionRoute && (
        <Button
          size="lg"
          onClick={() => onAction(notification.actionRoute!)}
          className="w-full h-14 text-lg font-bold rounded-xl bg-green-500 hover:bg-green-600 text-white"
        >
          {notification.actionLabel}
        </Button>
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isDemo } = useAuthStore()
  const t = useTranslation()
  const { language } = useI18n()
  const lang = (language === "en" ? "en" : "fr") as "fr" | "en"
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [permissionStatus, setPermissionStatus] = useState<"loading" | "granted" | "denied" | "default" | "preference-only">("loading")
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null)

  useEffect(() => {
    if (!user && !isDemo) {
      router.push("/")
    }
  }, [user, isDemo, router])

  useEffect(() => {
    import("@/lib/notifications").then(({ getNotificationStatus }) => {
      setPermissionStatus(getNotificationStatus())
    })
  }, [])

  useEffect(() => {
    if (user || isDemo) {
      setNotifications(buildNotifications(user, lang))
    }
  }, [user, isDemo, lang])

  const handleEnableNotifications = async () => {
    await requestNotificationPermission()
    setPermissionStatus("granted")
    sendWelcomeNotification(lang)
    startNotificationScheduler(lang)
    registerPeriodicSync()
    setTimeout(() => {
      setNotifications(buildNotifications(user, lang))
    }, 2000)
  }

  const openNotification = (notif: AppNotification) => {
    // Mark as read
    if (notif.id.includes("-")) {
      markHistoryRead(notif.id)
    }
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    setSelectedNotification({ ...notif, read: true })
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (!user && !isDemo) {
    return null
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 pt-6">
          {selectedNotification ? (
            <NotificationDetail
              notification={selectedNotification}
              onBack={() => setSelectedNotification(null)}
              onAction={(route) => router.push(route)}
              lang={lang}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="relative">
                    <Bell className="h-8 w-8" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {t.notifications.title}
                </h1>
              </div>

              {/* Notification permission status banner */}
              {permissionStatus === "granted" || permissionStatus === "preference-only" ? (
                <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/30 p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-400 text-sm">
                      {lang === "fr" ? "Les notifications sont activees" : "Notifications are enabled"}
                    </p>
                    <p className="text-xs text-green-400/70">
                      {lang === "fr"
                        ? "Tu recevras un rappel chaque soir pour ta lecon."
                        : "You'll receive a daily reminder for your lesson."}
                    </p>
                  </div>
                </div>
              ) : permissionStatus === "denied" ? (
                <div className="flex items-center gap-3 rounded-xl bg-orange-500/10 border border-orange-500/30 p-4">
                  <Bell className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-orange-400 text-sm">
                      {lang === "fr" ? "Notifications en attente" : "Notifications pending"}
                    </p>
                    <p className="text-xs text-orange-400/70">
                      {lang === "fr"
                        ? "Autorise les notifications dans les parametres de ton navigateur."
                        : "Allow notifications in your browser settings."}
                    </p>
                  </div>
                </div>
              ) : permissionStatus !== "loading" ? (
                <div className="flex items-center gap-3 rounded-xl bg-card border border-border p-4">
                  <Bell className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">
                      {lang === "fr" ? "Notifications desactivees" : "Notifications disabled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "fr"
                        ? "Active-les pour ne pas manquer tes rappels quotidiens."
                        : "Enable them to never miss your daily reminders."}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleEnableNotifications}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {lang === "fr" ? "Activer" : "Enable"}
                  </Button>
                </div>
              ) : null}

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {lang === "fr" ? "Aucune notification" : "No notifications"}
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => {
                    const Icon = notif.icon

                    return (
                      <div
                        key={notif.id}
                        onClick={() => openNotification(notif)}
                        className={`rounded-xl p-4 border transition-all cursor-pointer active:scale-[0.98] ${
                          notif.read
                            ? "bg-card border-border"
                            : "bg-card border-primary/30 shadow-lg shadow-primary/5"
                        }`}
                      >
                        <div className="flex gap-4 items-center">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className={`font-semibold text-sm ${notif.read ? "text-muted-foreground" : "text-foreground"}`}>{notif.title}</h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notif.id)
                                }}
                                className="text-muted-foreground hover:text-foreground p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatTimeAgo(notif.timestamp, t)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notif.read && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
