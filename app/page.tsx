"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import DeoMascot from "@/components/deo-mascot"
import { useState, useEffect } from "react"
import { LESSONS_DATA } from "@/lib/lessons-data"
import { useAuthStore } from "@/lib/auth-store"
import { useI18n, type Language } from "@/lib/i18n"
import { Globe } from "lucide-react"

export default function SplashPage() {
  const router = useRouter()
  const { user, isHydrated } = useAuthStore()
  const { language, setLanguage } = useI18n()

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr")
  }

  // Translations for the splash page
  const texts = {
    fr: {
      loading: "Chargement...",
      tagline: "Apprends le trading gratuitement.",
      subtitle: "Avec des lecons interactives et une simulation realiste.",
      features: [
        "Lecons progressives et completes",
        "Simulation de trading realiste",
        "Competitions avec d'autres traders",
      ],
      cta: "C'EST PARTI !",
      login: "J'AI DEJA UN COMPTE",
      startLesson: "Commencer une lecon",
      viewAll: "Voir toutes les lecons",
    },
    en: {
      loading: "Loading...",
      tagline: "Learn trading for free.",
      subtitle: "With interactive lessons and realistic simulation.",
      features: [
        "Progressive and complete lessons",
        "Realistic trading simulation",
        "Compete with other traders",
      ],
      cta: "LET'S GO!",
      login: "I ALREADY HAVE AN ACCOUNT",
      startLesson: "Start a lesson",
      viewAll: "View all lessons",
    },
  }

  const t = texts[language]

  // Auto-redirect logged-in users to /learn (persistent session)
  useEffect(() => {
    if (isHydrated && user) {
      router.replace("/learn")
    }
  }, [isHydrated, user, router])

  // Show nothing while checking session (avoids flash)
  if (isHydrated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900">
        <div className="animate-pulse text-center">
          <h1 className="font-black text-5xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Tradeo
          </h1>
          <p className="text-cyan-300/60 mt-2 text-sm">{t.loading}</p>
        </div>
      </div>
    )
  }

  const featuredLessons = LESSONS_DATA.slice(0, 6) // First 6 lessons
  const sectionLessons = {
    1: LESSONS_DATA.filter((l) => l.sectionId === 1).slice(0, 3),
    2: LESSONS_DATA.filter((l) => l.sectionId === 2).slice(0, 3),
    3: LESSONS_DATA.filter((l) => l.sectionId === 3).slice(0, 3),
    4: LESSONS_DATA.filter((l) => l.sectionId === 4).slice(0, 3),
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900 p-6 md:p-8 overflow-hidden">
      {/* Language toggle button */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 transition-all backdrop-blur-sm"
      >
        <Globe className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-medium text-white">{language.toUpperCase()}</span>
      </button>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top spacer */}
      <div className="flex-1" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md">
        {/* Static Mascot - Main element */}
        <div className="drop-shadow-2xl">
          <DeoMascot pose="celebrating" size={420} />
        </div>

        <div className="text-center space-y-4">
          <h1 className="font-black text-6xl md:text-7xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Tradeo
          </h1>
          <p className="text-cyan-300 text-xl md:text-2xl font-bold">{t.tagline}</p>
          <p className="text-slate-300 text-base md:text-lg">
            {t.subtitle}
          </p>
        </div>

        <div className="w-full space-y-3 text-sm">
          {t.features.map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:bg-slate-800/80 backdrop-blur"
            >
              <span className="text-cyan-400 text-xl font-bold">✓</span>
              <span className="text-slate-200">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {user && (
        <div className="relative z-10 w-full max-w-2xl space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t.startLesson}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {featuredLessons.map((lesson) => (
                <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                  <Button
                    variant="outline"
                    className="w-full h-full p-4 rounded-xl border-2 border-cyan-500/50 bg-slate-800/50 hover:bg-slate-700/80 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 transition-all flex flex-col items-start justify-start text-left"
                  >
                    <span className="font-bold text-sm mb-1 line-clamp-2">{lesson.title}</span>
                    <span className="text-xs text-slate-400">+{lesson.xpReward} XP</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 1, name: "Les bases du trading", icon: "📚" },
              { id: 2, name: "Analyse technique", icon: "📊" },
              { id: 3, name: "Gestion du risque", icon: "🛡️" },
              { id: 4, name: "Psychologie du trading", icon: "🧠" },
            ].map((section) => (
              <Link key={section.id} href="/learn">
                <Button
                  className="w-full h-16 rounded-xl bg-gradient-to-r text-white font-bold hover:opacity-90 transition-all"
                  style={{
                    backgroundImage:
                      section.id === 1
                        ? "linear-gradient(to right, rgb(6, 182, 212), rgb(6, 182, 212))"
                        : section.id === 2
                          ? "linear-gradient(to right, rgb(147, 51, 234), rgb(147, 51, 234))"
                          : section.id === 3
                            ? "linear-gradient(to right, rgb(34, 197, 94), rgb(34, 197, 94))"
                            : "linear-gradient(to right, rgb(234, 88, 12), rgb(234, 88, 12))",
                  }}
                >
                  <span className="text-xl mr-2">{section.icon}</span>
                  {section.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md space-y-3">
        {!user ? (
          <>
            <Link href="/onboarding" className="block">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg h-14 rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-cyan-500/30"
              >
                {t.cta}
              </Button>
            </Link>

            <Link href="/auth/login" className="block">
              <Button
                size="lg"
                variant="outline"
                className="w-full font-bold text-lg h-14 rounded-xl border-2 border-slate-600 text-slate-200 hover:bg-slate-800/50 bg-slate-800/30 transition-all backdrop-blur"
              >
                {t.login}
              </Button>
            </Link>
          </>
        ) : (
          <Link href="/learn" className="block">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg h-14 rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-cyan-500/30"
            >
              {t.viewAll}
            </Button>
          </Link>
        )}
      </div>

      <div className="flex-1" />
    </div>
  )
}
