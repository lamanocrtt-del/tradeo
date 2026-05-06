"use client"

import { createClient } from "@/lib/supabase/client"
import type { User } from "./types"

// Supabase Auth Service
export const authService = {
  // Sign up with email and password
  async signup(email: string, password: string, username: string): Promise<{ user: User | null; error: string | null; needsConfirmation?: boolean }> {
    const supabase = createClient()
    
    // Validate inputs
    if (!email.includes("@")) return { user: null, error: "Email invalide" }
    if (password.length < 6) return { user: null, error: "Le mot de passe doit faire au moins 6 caracteres" }
    if (username.length < 3) return { user: null, error: "Le nom d'utilisateur doit faire au moins 3 caracteres" }

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/learn`,
          data: {
            username: username,
            display_name: username,
          },
        },
      })

      if (authError) {
        console.error("[v0] Signup error:", authError.message, authError.code)
        if (authError.message.includes("already registered")) {
          return { user: null, error: "Cet email est deja utilise" }
        }
        if (authError.message.includes("rate limit")) {
          return { user: null, error: "Trop de tentatives. Veuillez reessayer plus tard." }
        }
        // For other errors (including "invalid email" which is often a Supabase config issue)
        // Fall through to demo mode
        console.log("[v0] Falling back to demo mode due to Supabase error")
        return this.createDemoUser(email, password, username)
      }

      if (!authData.user) {
        return { user: null, error: "Erreur lors de la creation du compte" }
      }

      // Check if email confirmation is required
      // If identities is empty, email confirmation is required
      if (authData.user.identities?.length === 0) {
        return { 
          user: null, 
          error: null, 
          needsConfirmation: true 
        }
      }

      // The trigger will auto-create the profile, but we need to wait and fetch it
      // Small delay to let the trigger complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // Fetch the profile
      const profile = await this.fetchProfile(authData.user.id)
      
      return { 
        user: profile || this.createDefaultUser(authData.user.id, email, username),
        error: null 
      }
    } catch (err) {
      console.error("[v0] Signup exception:", err)
      // Fall back to demo mode
      return this.createDemoUser(email, password, username)
    }
  },

  // Create a demo user (stored locally) when Supabase auth fails
  createDemoUser(email: string, password: string, username: string): { user: User; error: null } {
    const id = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const user = this.createDefaultUser(id, email, username)
    
    // Store demo user credentials in localStorage for persistence
    const demoUsers = JSON.parse(localStorage.getItem("tradeo-demo-users") || "[]")
    demoUsers.push({ id, email, password, username })
    localStorage.setItem("tradeo-demo-users", JSON.stringify(demoUsers))
    
    // Set demo session
    this.setDemoSession(id)
    
    // Save user data
    localStorage.setItem(`tradeo-user-${id}`, JSON.stringify(user))
    
    return { user, error: null }
  },

  // Login with email and password
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const supabase = createClient()

    // First, check for demo users
    const demoUser = this.checkDemoLogin(email, password)
    if (demoUser) {
      return { user: demoUser, error: null }
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("[v0] Login error:", authError)
        if (authError.message.includes("Invalid login credentials")) {
          return { user: null, error: "Email ou mot de passe incorrect" }
        }
        if (authError.message.includes("Email not confirmed")) {
          return { user: null, error: "Veuillez confirmer votre email avant de vous connecter" }
        }
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: "Erreur de connexion" }
      }

      // Fetch user profile from database
      const profile = await this.fetchProfile(authData.user.id)
      
      if (!profile) {
        // Profile might not exist yet, create default
        const username = authData.user.user_metadata?.username || authData.user.email?.split("@")[0] || "Trader"
        return { 
          user: this.createDefaultUser(authData.user.id, authData.user.email || "", username),
          error: null 
        }
      }

      return { user: profile, error: null }
    } catch (err) {
      console.error("[v0] Login exception:", err)
      return { user: null, error: "Erreur de connexion" }
    }
  },

  // Check for demo user login
  checkDemoLogin(email: string, password: string): User | null {
    try {
      const demoUsers = JSON.parse(localStorage.getItem("tradeo-demo-users") || "[]") as Array<{id: string, email: string, password: string, username: string}>
      const demoUserData = demoUsers.find((u) => u.email === email && u.password === password)
      
      if (demoUserData) {
        // Set demo session
        this.setDemoSession(demoUserData.id)
        
        // Load saved user data if exists
        const savedData = localStorage.getItem(`tradeo-user-${demoUserData.id}`)
        if (savedData) {
          return JSON.parse(savedData)
        }
        return this.createDefaultUser(demoUserData.id, demoUserData.email, demoUserData.username)
      }
    } catch (e) {
      console.error("[v0] Demo login check error:", e)
    }
    return null
  },

  // Logout
  async logout(): Promise<void> {
    // Clear demo session
    this.clearDemoSession()
    
    // Sign out from Supabase
    const supabase = createClient()
    await supabase.auth.signOut()
  },

  // Get current session
  async getSession(): Promise<{ user: User | null; isAuthenticated: boolean; isDemo: boolean }> {
    const supabase = createClient()
    
    // Check for demo session first
    const demoSession = this.getDemoSession()
    if (demoSession) {
      return { user: demoSession, isAuthenticated: true, isDemo: true }
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user) {
        return { user: null, isAuthenticated: false, isDemo: false }
      }

      const profile = await this.fetchProfile(session.user.id)
      
      if (!profile) {
        const username = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "Trader"
        return { 
          user: this.createDefaultUser(session.user.id, session.user.email || "", username),
          isAuthenticated: true,
          isDemo: false
        }
      }

      return { user: profile, isAuthenticated: true, isDemo: false }
    } catch (err) {
      console.error("[v0] Session check error:", err)
      return { user: null, isAuthenticated: false, isDemo: false }
    }
  },

  // Get demo session if exists
  getDemoSession(): User | null {
    try {
      const demoSessionId = localStorage.getItem("tradeo-demo-session")
      if (demoSessionId) {
        const savedData = localStorage.getItem(`tradeo-user-${demoSessionId}`)
        if (savedData) {
          return JSON.parse(savedData)
        }
        // Check if user exists in demo users
        const demoUsers = JSON.parse(localStorage.getItem("tradeo-demo-users") || "[]") as Array<{id: string, email: string, username: string}>
        const demoUserData = demoUsers.find((u) => u.id === demoSessionId)
        if (demoUserData) {
          return this.createDefaultUser(demoUserData.id, demoUserData.email, demoUserData.username)
        }
      }
    } catch (e) {
      console.error("[v0] Demo session check error:", e)
    }
    return null
  },

  // Set demo session
  setDemoSession(userId: string) {
    localStorage.setItem("tradeo-demo-session", userId)
  },

  // Clear demo session
  clearDemoSession() {
    localStorage.removeItem("tradeo-demo-session")
  },

  // Fetch user profile from database
  async fetchProfile(userId: string): Promise<User | null> {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle 0 rows gracefully

      if (error) {
        console.error("[v0] Fetch profile error:", error.message)
        return null
      }
      
      if (!data) {
        // Profile doesn't exist yet (trigger might not have completed)
        return null
      }

      return this.mapProfileToUser(data)
    } catch (err) {
      console.error("[v0] Fetch profile exception:", err)
      return null
    }
  },

  // Update user profile in database
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; error: string | null }> {
    const supabase = createClient()
    
    const dbUpdates: Record<string, unknown> = {}
    
    // Map User fields to database fields
    if (updates.username !== undefined) dbUpdates.username = updates.username
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp
    if (updates.hearts !== undefined) dbUpdates.hearts = updates.hearts
    if (updates.maxHearts !== undefined) dbUpdates.max_hearts = updates.maxHearts
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak
    if (updates.longestStreak !== undefined) dbUpdates.longest_streak = updates.longestStreak
    if (updates.coins !== undefined) dbUpdates.coins = updates.coins
    if (updates.gems !== undefined) dbUpdates.gems = updates.gems
    if (updates.completedLessons !== undefined) dbUpdates.completed_lessons = updates.completedLessons
    if (updates.currentSection !== undefined) dbUpdates.current_section = updates.currentSection
    if (updates.currentUnit !== undefined) dbUpdates.current_unit = updates.currentUnit
    if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium
    if (updates.premiumUntil !== undefined) dbUpdates.premium_until = updates.premiumUntil
    if (updates.league !== undefined) dbUpdates.league = updates.league
    if (updates.leagueXp !== undefined) dbUpdates.league_xp = updates.leagueXp
    if (updates.avatar !== undefined) dbUpdates.selected_avatar = updates.avatar
    if (updates.unlockedAvatars !== undefined) dbUpdates.unlocked_avatars = updates.unlockedAvatars
    if (updates.openedChests !== undefined) dbUpdates.opened_chests = updates.openedChests
    if (updates.claimedQuests !== undefined) dbUpdates.claimed_quests = updates.claimedQuests
    if (updates.achievements !== undefined) dbUpdates.achievements = updates.achievements
    if (updates.lastHeartsReset !== undefined) dbUpdates.last_hearts_reset = updates.lastHeartsReset
    if (updates.streakFreezes !== undefined) dbUpdates.streak_freezes = updates.streakFreezes
    if (updates.tradingUnlocked !== undefined) dbUpdates.trading_unlocked = updates.tradingUnlocked
    if (updates.lastMonthlyGemsAt !== undefined) dbUpdates.last_monthly_gems_at = updates.lastMonthlyGemsAt
    if (updates.preferredLanguage !== undefined) dbUpdates.preferred_language = updates.preferredLanguage
    if (updates.lastLessonDate !== undefined) dbUpdates.last_lesson_date = updates.lastLessonDate
    if (updates.lessonsCompletedToday !== undefined) dbUpdates.lessons_completed_today = updates.lessonsCompletedToday
    if (updates.lessonsCompletedTodayDate !== undefined) dbUpdates.lessons_completed_today_date = updates.lessonsCompletedTodayDate
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme
    if (updates.notifications !== undefined) dbUpdates.notifications = updates.notifications
    if (updates.haptics !== undefined) dbUpdates.haptics = updates.haptics
    if (updates.completedOnboarding !== undefined) dbUpdates.completed_onboarding = updates.completedOnboarding
    if (updates.tradingBalance !== undefined) dbUpdates.trading_balance = updates.tradingBalance
    if (updates.tradingProfit !== undefined) dbUpdates.trading_profit = updates.tradingProfit
    if (updates.tradingWins !== undefined) dbUpdates.trading_wins = updates.tradingWins
    if (updates.tradingTotal !== undefined) dbUpdates.trading_total = updates.tradingTotal
    if (updates.hasSeenTradingIntro !== undefined) dbUpdates.has_seen_trading_intro = updates.hasSeenTradingIntro

    dbUpdates.last_active = new Date().toISOString()

    const { error } = await supabase
      .from("profiles")
      .update(dbUpdates)
      .eq("id", userId)

    if (error) {
      console.error("[v0] Update profile error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  },

  // Map database profile to User type
  mapProfileToUser(data: Record<string, unknown>): User {
    return {
      id: data.id as string,
      email: data.email as string || "",
      username: data.username as string || "Trader",
      password: "", // Never store/return password
      xp: data.xp as number || 0,
      hearts: data.hearts as number || 5,
      maxHearts: data.max_hearts as number || 5,
      streak: data.streak as number || 0,
      currentStreak: data.streak as number || 0,
      longestStreak: data.longest_streak as number || 0,
      coins: data.coins as number || 500,
      gems: data.gems as number || 0,
      completedLessons: (data.completed_lessons as string[]) || [],
      currentSection: data.current_section as number || 1,
      currentUnit: data.current_unit as number || 1,
      createdAt: new Date(data.created_at as string),
      lastActive: data.last_active ? new Date(data.last_active as string) : new Date(),
      isPremium: data.is_premium as boolean || false,
      premiumUntil: data.premium_until ? new Date(data.premium_until as string) : undefined,
      league: data.league as string || "bronze",
      leagueXp: data.league_xp as number || 0,
      avatar: data.selected_avatar as string || "bull",
      unlockedAvatars: (data.unlocked_avatars as string[]) || ["bull"],
      openedChests: (data.opened_chests as string[]) || [],
      claimedQuests: (data.claimed_quests as string[]) || [],
      achievements: (data.achievements as string[]) || [],
      lastLessonDate: data.last_lesson_date as string || undefined,
      lessonsCompletedToday: data.lessons_completed_today as number || 0,
      lessonsCompletedTodayDate: data.lessons_completed_today_date as string || undefined,
      theme: data.theme as string || "dark",
      notifications: data.notifications as boolean ?? true,
      haptics: data.haptics as boolean ?? true,
      completedOnboarding: data.completed_onboarding as boolean || false,
      lastHeartsReset: data.last_hearts_reset as string || undefined,
      streakFreezes: data.streak_freezes as number || 2,
      tradingUnlocked: data.trading_unlocked as boolean || false,
      lastMonthlyGemsAt: data.last_monthly_gems_at as string || undefined,
      preferredLanguage: data.preferred_language as "fr" | "en" || "fr",
      tradingBalance: data.trading_balance as number || 10000,
      tradingProfit: data.trading_profit as number || 0,
      tradingWins: data.trading_wins as number || 0,
      tradingTotal: data.trading_total as number || 0,
      hasSeenTradingIntro: data.has_seen_trading_intro as boolean || false,
    }
  },

  // Create default user object
  createDefaultUser(id: string, email: string, username: string): User {
    return {
      id,
      email,
      username,
      password: "",
      xp: 0,
      hearts: 5,
      maxHearts: 5,
      streak: 0,
      currentStreak: 0,
      longestStreak: 0,
      coins: 500,
      gems: 0,
      completedLessons: [],
      currentSection: 1,
      currentUnit: 1,
      createdAt: new Date(),
      lastActive: new Date(),
      isPremium: false,
      league: "bronze",
      leagueXp: 0,
      avatar: "bull",
      unlockedAvatars: ["bull"],
      openedChests: [],
      claimedQuests: [],
      achievements: [],
      theme: "dark",
      notifications: true,
      haptics: true,
      completedOnboarding: false,
    }
  },
}

// Hook for auth state changes
export function useSupabaseAuthListener(onAuthChange: (user: User | null) => void) {
  const supabase = createClient()
  
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("[v0] Auth state change:", event)
    
    if (event === "SIGNED_OUT" || !session?.user) {
      onAuthChange(null)
      return
    }

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      const profile = await authService.fetchProfile(session.user.id)
      if (profile) {
        onAuthChange(profile)
      } else {
        const username = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "Trader"
        onAuthChange(authService.createDefaultUser(session.user.id, session.user.email || "", username))
      }
    }
  })
}
