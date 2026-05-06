"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "./types"
import { authService } from "./auth-service"

interface OnboardingData {
  source?: string
  englishLevel?: string
  goals?: string[]
  dailyMinutes?: number
  intensity?: string
  startingPath?: string
  completedOnboarding?: boolean
}

interface AuthState {
  user: User | null
  isDemo: boolean
  onboardingData: OnboardingData
  isHydrated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setDemo: (isDemo: boolean) => void
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  syncToDatabase: () => Promise<void>
  
  // Auth methods
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error: string | null }>
  checkSession: () => Promise<void>
  
  // Legacy methods for compatibility
  registerUser: (user: User) => void
  loginUser: (email: string, password: string) => boolean
  addDailyChallenge: (challengeId: string) => void
  completeDailyChallenge: (challengeId: string) => void
  updateStreak: () => void
  earnMilestone: (milestone: string) => void
  updateOnboarding: (data: Partial<OnboardingData>) => void
  completeOnboarding: () => void
  setHydrated: (hydrated: boolean) => void
  addXP: (amount: number) => void
  addCoins: (amount: number) => void
  addGems: (amount: number) => void
  spendCoins: (amount: number) => boolean
  unlockAvatar: (avatarId: string) => void
  markChestOpened: (chestId: string) => void
  hasOpenedChest: (chestId: string) => boolean
  claimQuest: (questId: string) => boolean
  hasClaimedQuest: (questId: string) => boolean
  useStreakFreeze: () => boolean
  checkMonthlyGems: () => void
  unlockTrading: () => void
  checkDailyHeartsReset: () => void
}

// Debounce timer for database syncs
let syncTimeout: ReturnType<typeof setTimeout> | null = null

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isDemo: false,
      onboardingData: {},
      isHydrated: false,
      isLoading: false,

      setUser: (user) => set({ user, isDemo: false }),

      setDemo: (isDemo) => set({ isDemo }),

      logout: async () => {
        await authService.logout()
        set({ user: null, isDemo: false })
      },

      // Sync current user state to database (debounced)
      syncToDatabase: async () => {
        const state = get()
        if (!state.user) return
        
        // Clear existing timeout
        if (syncTimeout) clearTimeout(syncTimeout)
        
        // Debounce sync by 1 second
        syncTimeout = setTimeout(async () => {
          const currentState = get()
          const currentUser = currentState.user
          if (!currentUser) return
          
          // Check if this is a valid UUID (Supabase auth user IDs are UUIDs)
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id)
          
          // For demo users or non-UUID IDs, save to localStorage only
          if (currentState.isDemo || currentUser.id.startsWith("demo-") || !isValidUUID) {
            try {
              localStorage.setItem(`tradeo-user-${currentUser.id}`, JSON.stringify(currentUser))
            } catch (e) {
              console.error("[v0] Failed to save demo user data:", e)
            }
            return
          }
          
          // For real users with valid UUIDs, sync to Supabase
          const result = await authService.updateProfile(currentUser.id, currentUser)
          if (!result.success) {
            console.error("[v0] Failed to sync to database:", result.error)
          }
        }, 1000)
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
        // Trigger database sync
        get().syncToDatabase()
      },

      // Supabase Auth: Login
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        const result = await authService.login(email, password)
        
        if (result.user) {
          // Check if this is a demo user (id starts with "demo-")
          const isDemo = result.user.id.startsWith("demo-")
          set({ user: result.user, isDemo, isLoading: false })
          return { success: true, error: null }
        }
        
        set({ isLoading: false })
        return { success: false, error: result.error }
      },

      // Supabase Auth: Signup
      signup: async (email: string, password: string, username: string) => {
        set({ isLoading: true })
        
        const result = await authService.signup(email, password, username)
        
        if (result.user) {
          // Check if this is a demo user (id starts with "demo-")
          const isDemo = result.user.id.startsWith("demo-")
          set({ user: result.user, isDemo, isLoading: false })
          return { success: true, error: null }
        }
        
        set({ isLoading: false })
        return { success: false, error: result.error }
      },

      // Check existing session on app load
      checkSession: async () => {
        set({ isLoading: true })
        
        const result = await authService.getSession()
        
        if (result.isAuthenticated && result.user) {
          set({ user: result.user, isDemo: result.isDemo, isLoading: false })
        } else {
          set({ isLoading: false })
        }
      },

      // Legacy: Register user (now uses Supabase)
      registerUser: (user) => {
        set({ user, isDemo: false })
      },

      // Legacy: Login user (for demo mode only)
      loginUser: (email: string, password: string) => {
        // Demo mode
        if (email === "demo@tradeo.app" && password === "demo") {
          const demoUser: User = {
            id: "demo-user",
            email,
            username: "DemoTrader",
            password: "",
            xp: 1420,
            hearts: 5,
            maxHearts: 5,
            streak: 12,
            currentStreak: 12,
            longestStreak: 15,
            coins: 2500,
            gems: 50,
            league: "argent",
            leagueXp: 1420,
            completedLessons: ["lesson-1-1-1", "lesson-1-1-2", "lesson-1-1-3"],
            currentSection: 1,
            currentUnit: 2,
            createdAt: new Date("2024-10-01"),
            lastActive: new Date(),
            isPremium: true,
            premiumUntil: new Date("2025-12-31"),
            theme: "dark",
            notifications: true,
            haptics: true,
            avatar: "bull",
            unlockedAvatars: ["bull", "bear", "fox"],
            completedOnboarding: true,
          }
          set({ user: demoUser, isDemo: true })
          return true
        }
        return false
      },

      addDailyChallenge: (challengeId: string) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                dailyChallenges: [...(state.user.dailyChallenges || []), challengeId],
              }
            : null,
        }))
        get().syncToDatabase()
      },

      completeDailyChallenge: (challengeId: string) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                completedChallenges: [...(state.user.completedChallenges || []), challengeId],
              }
            : null,
        }))
        get().syncToDatabase()
      },

      updateStreak: () => {
        set((state) => {
          if (!state.user) return { user: null }

          const today = new Date().toISOString().split("T")[0]
          const lastLessonDate = state.user.lastLessonDate || null
          const lessonsCompletedTodayDate = state.user.lessonsCompletedTodayDate || null

          let lessonsToday = state.user.lessonsCompletedToday || 0
          if (lessonsCompletedTodayDate !== today) {
            lessonsToday = 0
          }
          lessonsToday += 1

          let newStreak = state.user.streak || 0
          
          if (lastLessonDate !== today) {
            if (lastLessonDate) {
              const lastDate = new Date(lastLessonDate)
              const todayDate = new Date(today)
              const diffMs = todayDate.getTime() - lastDate.getTime()
              const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

              if (diffDays === 1) {
                newStreak = (state.user.streak || 0) + 1
              } else if (diffDays > 1) {
                newStreak = 1
              }
            } else {
              newStreak = 1
            }
          }

          return {
            user: {
              ...state.user,
              streak: newStreak,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.user.longestStreak || 0),
              lastLessonDate: today,
              lastActive: new Date().toISOString(),
              lessonsCompletedToday: lessonsToday,
              lessonsCompletedTodayDate: today,
            },
          }
        })
        get().syncToDatabase()
      },

      earnMilestone: (milestone: string) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                achievements: [...(state.user.achievements || []), milestone],
              }
            : null,
        }))
        get().syncToDatabase()
      },

      updateOnboarding: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),

      completeOnboarding: () => {
        set((state) => ({
          onboardingData: { ...state.onboardingData, completedOnboarding: true },
          user: state.user ? { ...state.user, completedOnboarding: true } : null,
        }))
        get().syncToDatabase()
      },

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      addXP: (amount: number) => {
        set((state) => {
          if (!state.user) return { user: null }
          const newXp = (state.user.xp || 0) + amount
          const newLeagueXp = (state.user.leagueXp || 0) + amount
          return {
            user: { ...state.user, xp: newXp, leagueXp: newLeagueXp },
          }
        })
        get().syncToDatabase()
      },

      addCoins: (amount: number) => {
        set((state) => {
          if (!state.user) return { user: null }
          const newCoins = (state.user.coins || 0) + amount
          return {
            user: { ...state.user, coins: newCoins },
          }
        })
        get().syncToDatabase()
      },

      addGems: (amount: number) => {
        set((state) => {
          if (!state.user) return { user: null }
          const newGems = (state.user.gems || 0) + amount
          return {
            user: { ...state.user, gems: newGems },
          }
        })
        get().syncToDatabase()
      },

      spendCoins: (amount: number) => {
        const state = get()
        if (!state.user) return false
        const currentCoins = state.user.coins || 0
        if (currentCoins < amount) return false
        
        set((s) => {
          if (!s.user) return { user: null }
          return {
            user: { ...s.user, coins: (s.user.coins || 0) - amount },
          }
        })
        get().syncToDatabase()
        return true
      },

      markChestOpened: (chestId: string) => {
        set((state) => {
          if (!state.user) return { user: null }
          const openedChests = state.user.openedChests || []
          if (openedChests.includes(chestId)) return { user: state.user }
          return {
            user: { ...state.user, openedChests: [...openedChests, chestId] },
          }
        })
        get().syncToDatabase()
      },

      hasOpenedChest: (chestId: string) => {
        const state = get()
        if (!state.user) return false
        return (state.user.openedChests || []).includes(chestId)
      },

      unlockAvatar: (avatarId: string) => {
        set((state) => {
          if (!state.user) return { user: null }
          const currentAvatars = state.user.unlockedAvatars || ["bull"]
          if (currentAvatars.includes(avatarId)) return { user: state.user }
          return {
            user: { ...state.user, unlockedAvatars: [...currentAvatars, avatarId] },
          }
        })
        get().syncToDatabase()
      },

      claimQuest: (questId: string) => {
        const state = get()
        if (!state.user) return false
        const claimedQuests = state.user.claimedQuests || []
        if (claimedQuests.includes(questId)) return false
        
        set((s) => {
          if (!s.user) return { user: null }
          return {
            user: { ...s.user, claimedQuests: [...(s.user.claimedQuests || []), questId] },
          }
        })
        get().syncToDatabase()
        return true
      },

      hasClaimedQuest: (questId: string) => {
        const state = get()
        if (!state.user) return false
        return (state.user.claimedQuests || []).includes(questId)
      },

      // Use a streak freeze to protect streak
      useStreakFreeze: () => {
        const state = get()
        if (!state.user) return false
        const freezes = state.user.streakFreezes || 0
        if (freezes <= 0) return false
        
        set((s) => {
          if (!s.user) return { user: null }
          return {
            user: {
              ...s.user,
              streakFreezes: (s.user.streakFreezes || 0) - 1,
              streakFreezeUsedAt: new Date().toISOString(),
            },
          }
        })
        get().syncToDatabase()
        return true
      },

      // Check and grant monthly gems (50 gems per month)
      checkMonthlyGems: () => {
        const state = get()
        if (!state.user) return
        
        const lastGems = state.user.lastMonthlyGemsAt
        const now = new Date()
        
        let shouldGrant = false
        if (!lastGems) {
          shouldGrant = true
        } else {
          const lastDate = new Date(lastGems)
          const monthDiff = (now.getFullYear() - lastDate.getFullYear()) * 12 + 
                           (now.getMonth() - lastDate.getMonth())
          if (monthDiff >= 1) {
            shouldGrant = true
          }
        }
        
        if (shouldGrant) {
          set((s) => {
            if (!s.user) return { user: null }
            return {
              user: {
                ...s.user,
                gems: (s.user.gems || 0) + 50,
                lastMonthlyGemsAt: now.toISOString(),
              },
            }
          })
          get().syncToDatabase()
        }
      },

      // Unlock trading after lesson 4
      unlockTrading: () => {
        set((state) => {
          if (!state.user) return { user: null }
          return {
            user: { ...state.user, tradingUnlocked: true },
          }
        })
        get().syncToDatabase()
      },

      // Reset hearts to 5 every day at midnight
      checkDailyHeartsReset: () => {
        const state = get()
        if (!state.user) return
        
        const now = new Date()
        const today = now.toDateString()
        const lastReset = state.user.lastHeartsReset
        
        if (lastReset !== today) {
          set((s) => {
            if (!s.user) return { user: null }
            return {
              user: {
                ...s.user,
                hearts: s.user.maxHearts || 5,
                lastHeartsReset: today,
              },
            }
          })
          get().syncToDatabase()
        }
      },
    }),
    {
      name: "tradeo-auth-storage-v3",
      partialize: (state) => ({
        user: state.user,
        onboardingData: state.onboardingData,
        isDemo: state.isDemo,
      }),
    }
  )
)
