"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { haptics, sounds } from "@/lib/haptics"
import { useTranslation, useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/auth-store"
import { useState } from "react"

// First unit lessons (chapter 1) that must be completed to unlock simulation
const CHAPTER_1_LESSONS = ["lesson-1-1-1", "lesson-1-1-2", "lesson-1-1-3", "lesson-1-1-4"]

// Simple Duolingo-style icons with solid colors and subtle 3D effect
function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      {/* Book base */}
      <path 
        d="M4 6C4 4.9 4.9 4 6 4H26C27.1 4 28 4.9 28 6V26C28 27.1 27.1 28 26 28H6C4.9 28 4 27.1 4 26V6Z" 
        fill={active ? "#58CC02" : "#89E219"}
      />
      {/* 3D effect bottom */}
      <path 
        d="M4 22V26C4 27.1 4.9 28 6 28H26C27.1 28 28 27.1 28 26V22H4Z" 
        fill={active ? "#46A302" : "#58CC02"}
      />
      {/* Book spine */}
      <rect x="4" y="4" width="4" height="24" fill={active ? "#46A302" : "#58CC02"} />
      {/* Page lines */}
      <rect x="11" y="9" width="13" height="2.5" rx="1.25" fill="white" fillOpacity="0.9" />
      <rect x="11" y="14" width="10" height="2.5" rx="1.25" fill="white" fillOpacity="0.7" />
      <rect x="11" y="19" width="13" height="2.5" rx="1.25" fill="white" fillOpacity="0.7" />
      {/* Bookmark */}
      <path d="M22 4V12L24.5 10L27 12V4" fill={active ? "#FF4B4B" : "#FF6B6B"} />
    </svg>
  )
}

function LeaderboardIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      {/* Trophy cup */}
      <path 
        d="M8 5H24V15C24 20.5 20.4 25 16 25C11.6 25 8 20.5 8 15V5Z" 
        fill={active ? "#FFC800" : "#FFD900"}
      />
      {/* Trophy cup bottom/3D */}
      <path 
        d="M8 15C8 20.5 11.6 25 16 25C20.4 25 24 20.5 24 15V18C24 23.5 20.4 25 16 25C11.6 25 8 23.5 8 18V15Z" 
        fill={active ? "#E5A800" : "#FFC800"}
      />
      {/* Left handle */}
      <path 
        d="M8 7H5C4 7 3 8 3 9V11C3 13.5 5 15.5 7 16H8V7Z" 
        fill={active ? "#FFC800" : "#FFD900"}
      />
      {/* Right handle */}
      <path 
        d="M24 7H27C28 7 29 8 29 9V11C29 13.5 27 15.5 25 16H24V7Z" 
        fill={active ? "#FFC800" : "#FFD900"}
      />
      {/* Base */}
      <rect x="12" y="25" width="8" height="2" fill={active ? "#E5A800" : "#FFC800"} />
      <rect x="10" y="27" width="12" height="3" rx="1" fill={active ? "#E5A800" : "#FFC800"} />
    </svg>
  )
}

function TradingIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      {/* Background circle */}
      <circle cx="16" cy="16" r="14" fill={active ? "#1CB0F6" : "#49C0F8"} />
      {/* Darker bottom for 3D */}
      <path 
        d="M2 16C2 23.7 8.3 30 16 30C23.7 30 30 23.7 30 16C30 16 30 20 16 20C2 20 2 16 2 16Z" 
        fill={active ? "#1899D6" : "#1CB0F6"}
      />
      {/* Chart arrow up */}
      <path 
        d="M8 22L13 16L17 19L24 10" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      <path 
        d="M20 10H24V14" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
    </svg>
  )
}

function ShopIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      {/* Shield shape */}
      <path 
        d="M16 3L4 7V15C4 22 9 28 16 30C23 28 28 22 28 15V7L16 3Z" 
        fill={active ? "#CD7136" : "#E08746"}
      />
      {/* Darker bottom for 3D */}
      <path 
        d="M4 18V15C4 22 9 28 16 30C23 28 28 22 28 15V18C28 25 23 28 16 30C9 28 4 25 4 18Z" 
        fill={active ? "#A85C2A" : "#CD7136"}
      />
      {/* Inner shield */}
      <path 
        d="M16 7L8 10V15C8 20 11 24 16 26C21 24 24 20 24 15V10L16 7Z" 
        fill={active ? "#E5A800" : "#FFC800"}
      />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      {/* Background rounded square */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill={active ? "#9333EA" : "#A855F7"} />
      {/* 3D effect */}
      <path 
        d="M2 20V22C2 26.4 5.6 30 10 30H22C26.4 30 30 26.4 30 22V20C30 20 26 24 16 24C6 24 2 20 2 20Z" 
        fill={active ? "#7E22CE" : "#9333EA"}
      />
      {/* Person silhouette - head */}
      <circle cx="16" cy="11" r="5" fill="white" fillOpacity="0.95" />
      {/* Person silhouette - body */}
      <path 
        d="M8 26C8 20.5 11.6 16 16 16C20.4 16 24 20.5 24 26" 
        fill="white" 
        fillOpacity="0.95"
      />
    </svg>
  )
}

function LockedIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      <circle cx="16" cy="16" r="14" fill="#AFAFAF" />
      <path 
        d="M2 16C2 23.7 8.3 30 16 30C23.7 30 30 23.7 30 16C30 16 28 22 16 22C4 22 2 16 2 16Z" 
        fill="#8E8E8E"
      />
      <rect x="10" y="14" width="12" height="10" rx="2" fill="#6B6B6B" />
      <path d="M12 14V11C12 8.8 13.8 7 16 7C18.2 7 20 8.8 20 11V14" stroke="#6B6B6B" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslation()
  const { language } = useI18n()
  const { user } = useAuthStore()
  const [showLockedToast, setShowLockedToast] = useState(false)

  const completedLessons = user?.completedLessons || []
  const isSimulationUnlocked = CHAPTER_1_LESSONS.every((id) => completedLessons.includes(id))

  const NAV_ITEMS = [
    { href: "/learn", Icon: LearnIcon, label: t.nav.learn, locked: false, activeColor: "text-[#58CC02]", inactiveColor: "text-[#89E219]" },
    { href: "/leaderboard", Icon: LeaderboardIcon, label: t.nav.leagues, locked: false, activeColor: "text-[#FFC800]", inactiveColor: "text-[#FFD900]" },
    { href: "/trading", Icon: TradingIcon, label: t.nav.trading, locked: !isSimulationUnlocked, activeColor: "text-[#1CB0F6]", inactiveColor: "text-[#49C0F8]" },
    { href: "/shop", Icon: ShopIcon, label: t.nav.shop, locked: false, activeColor: "text-[#CD7136]", inactiveColor: "text-[#E08746]" },
    { href: "/profile", Icon: ProfileIcon, label: t.nav.profile, locked: false, activeColor: "text-[#9333EA]", inactiveColor: "text-[#A855F7]" },
  ]

  return (
    <>
      {/* Locked toast notification */}
      {showLockedToast && (
        <div className="fixed bottom-20 left-4 right-4 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">
                {language === "fr" ? "Simulation verrouillée" : "Simulation Locked"}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "fr"
                  ? "Termine le premier chapitre de leçons pour débloquer la simulation de trading !"
                  : "Complete the first chapter of lessons to unlock the trading simulation!"}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/30">
        <div className="container flex h-[68px] items-center justify-around px-2 pb-safe">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const { Icon } = item

            if (item.locked) {
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    sounds.click()
                    haptics.tap()
                    setShowLockedToast(true)
                    setTimeout(() => setShowLockedToast(false), 3000)
                  }}
                  className="flex flex-col items-center justify-center gap-1 py-1.5 transition-all min-w-[56px] flex-shrink-0 opacity-50"
                >
                  <LockedIcon />
                  <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { sounds.click(); haptics.tap() }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1.5 transition-all duration-200 min-w-[56px] flex-shrink-0",
                  isActive && "scale-110"
                )}
              >
                <div className={cn(
                  "transition-transform duration-200",
                  isActive && "drop-shadow-md"
                )}>
                  <Icon active={isActive} />
                </div>
                <span 
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    isActive ? item.activeColor : item.inactiveColor
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
