"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, Globe, Trash2, Shield, FileText, Check, Snowflake } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import {
  requestNotificationPermission,
  getNotificationStatus,
  sendWelcomeNotification,
  startNotificationScheduler,
  registerPeriodicSync,
  getNotificationPermission,
} from "@/lib/notifications"
import { useI18n, type Language } from "@/lib/i18n"

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "fr", label: "Francais", flag: "FR" },
  { code: "en", label: "English", flag: "EN" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { language, setLanguage } = useI18n()
  const { user, updateUser } = useAuthStore()
  const [notifStatus, setNotifStatus] = useState<"loading" | "granted" | "denied" | "default" | "preference-only">("loading")
  const [enabling, setEnabling] = useState(false)

  const t = {
    fr: {
      title: "Parametres",
      notifications: "Notifications",
      loading: "Chargement...",
      notifEnabled: "Notifications activees",
      notifEnabledDesc: "Tu recois un rappel quotidien a 19h et des alertes pour ta serie.",
      notifPending: "Notifications en attente",
      notifPendingDesc: "Pour recevoir les notifications, autorise Tradeo dans les parametres de ton navigateur > Notifications.",
      retry: "Reessayer",
      notifDisabled: "Active les notifications pour recevoir des rappels quotidiens et ne pas perdre ta serie.",
      enableNotif: "Activer les notifications",
      enabling: "Activation...",
      language: "Langue",
      legal: "Informations legales",
      privacy: "Politique de confidentialite",
      privacyDesc: "Comment nous protegeons vos donnees",
      disclaimer: "Tradeo est un simulateur educatif. Aucun argent reel n'est utilise.",
      dangerZone: "Zone dangereuse",
      deleteAccount: "Supprimer mon compte",
      streakFreeze: "Gel de serie",
      streakFreezeDesc: "Protege ta serie quand tu oublies de t'entrainer",
      freezesRemaining: "gel restant",
      freezesRemainingPlural: "gels restants",
    },
    en: {
      title: "Settings",
      notifications: "Notifications",
      loading: "Loading...",
      notifEnabled: "Notifications enabled",
      notifEnabledDesc: "You receive a daily reminder at 7pm and streak alerts.",
      notifPending: "Notifications pending",
      notifPendingDesc: "To receive notifications, allow Tradeo in your browser settings > Notifications.",
      retry: "Retry",
      notifDisabled: "Enable notifications to receive daily reminders and not lose your streak.",
      enableNotif: "Enable notifications",
      enabling: "Enabling...",
      language: "Language",
      legal: "Legal information",
      privacy: "Privacy policy",
      privacyDesc: "How we protect your data",
      disclaimer: "Tradeo is an educational simulator. No real money is used.",
      dangerZone: "Danger zone",
      deleteAccount: "Delete my account",
      streakFreeze: "Streak freeze",
      streakFreezeDesc: "Protects your streak when you forget to practice",
      freezesRemaining: "freeze remaining",
      freezesRemainingPlural: "freezes remaining",
    },
  }

  const texts = t[language]

  useEffect(() => {
    const status = getNotificationStatus()
    setNotifStatus(status)
  }, [])

  const handleEnableNotifications = async () => {
    setEnabling(true)
    const granted = await requestNotificationPermission()
    if (granted) {
      setNotifStatus("granted")
      sendWelcomeNotification(language)
      startNotificationScheduler(language)
      registerPeriodicSync()
    } else {
      setNotifStatus(getNotificationPermission() as typeof notifStatus)
    }
    setEnabling(false)
  }

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    // Also update user preferences in database
    if (user) {
      updateUser({ preferredLanguage: lang })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 bg-card border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-lg transition">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">{texts.title}</h1>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Notifications */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {texts.notifications}
              </h2>
              {notifStatus === "loading" ? (
                <p className="text-muted-foreground text-sm">{texts.loading}</p>
              ) : notifStatus === "granted" || notifStatus === "preference-only" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-400">{texts.notifEnabled}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {texts.notifEnabledDesc}
                  </p>
                </div>
              ) : notifStatus === "denied" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium text-orange-400">{texts.notifPending}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {texts.notifPendingDesc}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await handleEnableNotifications()
                    }}
                    className="w-full bg-transparent"
                  >
                    {texts.retry}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {texts.notifDisabled}
                  </p>
                  <Button
                    onClick={handleEnableNotifications}
                    disabled={enabling}
                    className="w-full"
                  >
                    {enabling ? texts.enabling : texts.enableNotif}
                  </Button>
                </div>
              )}
            </section>

            {/* Streak Freeze */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-cyan-400" />
                {texts.streakFreeze}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <div>
                    <p className="font-bold text-2xl text-cyan-400">{user?.streakFreezes || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {(user?.streakFreezes || 0) === 1 ? texts.freezesRemaining : texts.freezesRemainingPlural}
                    </p>
                  </div>
                  <Snowflake className="h-10 w-10 text-cyan-400/50" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {texts.streakFreezeDesc}
                </p>
              </div>
            </section>

            {/* Language */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {texts.language}
              </h2>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      language === lang.code
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">{lang.flag}</span>
                      <span className="font-medium text-foreground">{lang.label}</span>
                    </div>
                    {language === lang.code && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Legal / Play Store */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {texts.legal}
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/privacy")}
                  className="w-full flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition text-left"
                >
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-foreground font-medium text-sm">{texts.privacy}</p>
                    <p className="text-muted-foreground text-xs">{texts.privacyDesc}</p>
                  </div>
                </button>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-amber-400 text-xs font-semibold">
                    {texts.disclaimer}
                  </p>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                {texts.dangerZone}
              </h2>
              <Button variant="destructive" className="w-full" onClick={() => alert("Compte supprime (simulation)")}>
                {texts.deleteAccount}
              </Button>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
