"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Eye, EyeOff, Check, Mail, Lock, User, AlertCircle, RefreshCw, Bell, BellOff } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { haptics } from "@/lib/haptics"
import { useI18n, useTranslation, type Language } from "@/lib/i18n"
import { requestNotificationPermission, startNotificationScheduler, registerPeriodicSync, sendWelcomeNotification, sendAccountCreatedNotification } from "@/lib/notifications"
import DeoMascot from "@/components/deo-mascot"
import { createClient } from "@/lib/supabase/client"

// Logical step order: language -> email -> username -> password -> rest of onboarding (no OTP verification needed)
const STEPS = ["language", "email", "username", "password", "source", "daily-time", "goals", "level", "notifications", "summary", "success"] as const
type Step = (typeof STEPS)[number]

const SOURCE_IDS = ["tiktok", "friends", "store", "news", "social", "tv", "linkedin"] as const
const SOURCE_ICONS: Record<string, string> = { tiktok: "📱", friends: "👥", store: "🏪", news: "📰", social: "👍", tv: "📺", linkedin: "💼" }

const GOAL_IDS = ["career", "study", "productivity", "fun", "connections", "hobby"] as const
const GOAL_ICONS: Record<string, string> = { career: "💼", study: "📚", productivity: "⏰", fun: "🎉", connections: "🤝", hobby: "🎨" }

const LEVEL_IDS = ["beginner", "basic", "intermediate", "advanced", "expert"] as const
const LEVEL_ICONS: Record<string, string> = { beginner: "1️⃣", basic: "2️⃣", intermediate: "3️⃣", advanced: "4️⃣", expert: "5️⃣" }

const DAILY_TIME_IDS = ["casual", "normal", "intense", "extreme"] as const
const DAILY_TIME_MINS: Record<string, number> = { casual: 5, normal: 10, intense: 15, extreme: 20 }

export default function OnboardingPage() {
  const router = useRouter()
  const { signup, setUser, setDemo } = useAuthStore()
  const { language, setLanguage } = useI18n()
  const t = useTranslation()
  const [currentStep, setCurrentStep] = useState<Step>("language")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string>("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [formError, setFormError] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationAsked, setNotificationAsked] = useState(false)
  
  // Email & account state
  const [email, setEmail] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [resendingCode, setResendingCode] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)
  const [emailError, setEmailError] = useState("")
  const [codeError, setCodeError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [testCode, setTestCode] = useState<string | null>(null) // For development testing
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const [usernameAvailable, setUsernameAvailable] = useState(false)

  const progress = ((STEPS.indexOf(currentStep) + 1) / STEPS.length) * 100

  // Build dynamic arrays based on current language
  const SOURCES = useMemo(() => SOURCE_IDS.map(id => ({
    id,
    icon: SOURCE_ICONS[id],
    label: t.sources[id as keyof typeof t.sources]
  })), [t])

  const GOALS = useMemo(() => GOAL_IDS.map(id => ({
    id,
    icon: GOAL_ICONS[id],
    label: t.goals[id as keyof typeof t.goals]
  })), [t])

  const LEVELS = useMemo(() => LEVEL_IDS.map(id => ({
    id,
    icon: LEVEL_ICONS[id],
    label: t.levels[id as keyof typeof t.levels]
  })), [t])

  const DAILY_TIMES = useMemo(() => DAILY_TIME_IDS.map(id => ({
    id,
    label: t.dailyTimes[id as keyof typeof t.dailyTimes],
    minutes: DAILY_TIME_MINS[id],
    subtitle: `${DAILY_TIME_MINS[id]} min/${language === "fr" ? "jour" : "day"}`
  })), [t, language])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Generate random username suggestions
  const generateUsernameSuggestions = (base: string): string[] => {
    const adjectives = ["Trader", "Smart", "Pro", "Star", "Bull", "Bear", "Fast", "Rich", "Top", "Lucky"]
    const suffixes = ["_fx", "_pro", "123", "_1", "_2", "_3", "007", "_x", "_v", "_z"]
    const suggestions: string[] = []
    
    for (let i = 0; i < 4; i++) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      const rand = Math.floor(Math.random() * 99)
      
      if (i % 2 === 0) {
        suggestions.push(`${adj}${base.charAt(0).toUpperCase()}${base.slice(1)}${rand}`)
      } else {
        suggestions.push(`${base}${suffix}`)
      }
    }
    return suggestions
  }

  // Check if username is available
  const checkUsernameAvailability = async (name: string) => {
    if (name.length < 3) {
      setUsernameAvailable(false)
      setUsernameSuggestions([])
      return
    }
    
    setCheckingUsername(true)
    setUsernameError("")
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", name)
        .maybeSingle()
      
      if (error) {
        console.log("[v0] Username check error:", error)
        // If error, assume available to not block user
        setUsernameAvailable(true)
        setUsernameSuggestions([])
      } else if (data) {
        // Username taken
        setUsernameAvailable(false)
        setUsernameError(language === "fr" ? "Ce nom d'utilisateur est deja pris" : "This username is already taken")
        setUsernameSuggestions(generateUsernameSuggestions(name))
      } else {
        // Username available
        setUsernameAvailable(true)
        setUsernameSuggestions([])
      }
    } catch (err) {
      console.log("[v0] Username check exception:", err)
      setUsernameAvailable(true)
    } finally {
      setCheckingUsername(false)
    }
  }

  const validatePassword = (pwd: string) => {
    return pwd.length >= 6
  }

  // Step 1: Validate email and proceed (no OTP - we'll create account at the end)
  const handleEmailNext = async () => {
    haptics.tap()
    setEmailError("")
    
    if (!validateEmail(email)) {
      setEmailError(t.emailInvalid)
      return
    }

    // Check if email is already in use
    setSendingCode(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email.toLowerCase())
        .maybeSingle()
      
      if (data) {
        setEmailError(language === "fr" ? "Cet email est deja utilise. Connecte-toi." : "This email is already in use. Please log in.")
        haptics.error()
        setSendingCode(false)
        return
      }
      
      haptics.success()
      handleNext()
    } catch {
      // If check fails, proceed anyway - we'll catch duplicates at signup
      haptics.success()
      handleNext()
    } finally {
      setSendingCode(false)
    }
  }

  // Step 2: Save username
  const handleSaveUsername = async () => {
    haptics.tap()
    setUsernameError("")

    if (username.length < 3) {
      setUsernameError(t.usernameError)
      return
    }

    // Check if username is available before proceeding
    setCheckingUsername(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle()
      
      if (!error && data) {
        // Username taken
        setUsernameError(language === "fr" ? "Ce nom d'utilisateur est deja pris" : "This username is already taken")
        setUsernameSuggestions(generateUsernameSuggestions(username))
        haptics.error()
        setCheckingUsername(false)
        return
      }
      
      // Username is available
      setUsernameAvailable(true)
      haptics.success()
      handleNext()
    } catch {
      // If check fails, proceed anyway
      handleNext()
    } finally {
      setCheckingUsername(false)
    }
  }

  // Step 3: Create account with email/password directly
  const handleCreateAccount = async () => {
    haptics.tap()
    setPasswordError("")
    
    if (!validatePassword(password)) {
      setPasswordError(t.passwordError)
      return
    }

    if (password !== confirmPassword) {
      setPasswordError(language === "fr" ? "Les mots de passe ne correspondent pas" : "Passwords do not match")
      return
    }

    setIsCreatingAccount(true)

    try {
      const supabase = createClient()
      
      // Sign up with email and password
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            username: username,
            display_name: username,
          },
        },
      })
      
      if (signupError) {
        if (signupError.message.includes("already registered")) {
          setPasswordError(language === "fr" ? "Cet email est deja utilise. Connecte-toi." : "This email is already registered. Please log in.")
        } else {
          setPasswordError(signupError.message)
        }
        haptics.error()
        setIsCreatingAccount(false)
        return
      }
      
      if (signupData?.user) {
        setSupabaseUserId(signupData.user.id)
        haptics.success()
        handleNext()
      }
    } catch (err) {
      console.error("[v0] Signup exception:", err)
      setPasswordError(language === "fr" ? "Erreur lors de la creation du compte" : "Error creating account")
      haptics.error()
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const handleNext = () => {
    haptics.tap()
    const currentIndex = STEPS.indexOf(currentStep)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1])
    }
  }

  const handleBack = () => {
    haptics.tap()
    const currentIndex = STEPS.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1])
    } else {
      router.push("/")
    }
  }

  const handleCreateProfile = async () => {
    haptics.success()

    try {
      const supabase = createClient()
      
      // Update the user's metadata with username and onboarding data
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: username,
          display_name: username,
        },
      })

      if (updateError) {
        console.error("[v0] Error updating user metadata:", updateError)
      }

      // Update the profile in the database
      if (supabaseUserId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            username: username,
            onboarding_source: selectedSource,
            onboarding_goals: selectedGoals,
            onboarding_level: selectedLevel,
            daily_goal: DAILY_TIME_MINS[selectedTime] || 10,
            notifications: notificationsEnabled,
            completed_onboarding: true,
          })
          .eq("id", supabaseUserId)

        if (profileError) {
          console.error("[v0] Error updating profile:", profileError)
        }
      }

      // Get the current session to update auth store
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Update local auth store
        setUser({
          id: user.id,
          email: user.email || email,
          username: username,
          password: "",
          xp: 0,
          hearts: 5,
          maxHearts: 5,
          streak: 0,
          currentStreak: 0,
          longestStreak: 0,
          coins: 500,
          gems: 50,
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
          streakFreezes: 2,
          tradingUnlocked: false,
          theme: "dark",
          notifications: notificationsEnabled,
          haptics: true,
          completedOnboarding: true,
        })
        setDemo(false)
      }
    } catch (err) {
      console.error("[v0] Error creating profile:", err)
    }
    
    if (notificationsEnabled) {
      sendAccountCreatedNotification(username)
      startNotificationScheduler(language as Language)
      registerPeriodicSync()
    }

    handleNext()
  }

  const handleFinish = () => {
    haptics.celebrate()
    
    if (notificationsEnabled) {
      sendWelcomeNotification(username)
    }
    
    router.push("/learn")
  }

  const handleGoalToggle = (goalId: string) => {
    haptics.tap()
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    )
  }

  const handleRequestNotifications = async () => {
    haptics.tap()
    try {
      const granted = await requestNotificationPermission()
      setNotificationsEnabled(granted)
      setNotificationAsked(true)
      if (granted) {
        haptics.success()
      }
    } catch (e) {
      console.error("Notification permission error:", e)
      setNotificationAsked(true)
    }
  }

  // Render mascot using 2D image
  const renderMascot = (pose: string, size: number) => {
    return <DeoMascot pose={pose as "neutral" | "happy"} size={size} />
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950">
      {/* Header with progress */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-xs text-gray-500 min-w-[40px] text-right">
            {Math.round(progress)}%
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-md">
          {/* Language selection - FIRST STEP */}
          {currentStep === "language" && (
            <div className="space-y-8 text-center">
              <div className="flex justify-center">
                {renderMascot("happy", 180)}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-white">
                  {language === "fr" ? "Bienvenue!" : "Welcome!"}
                </h1>
                <p className="text-gray-400">
                  {language === "fr" ? "Choisis ta langue" : "Choose your language"}
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setLanguage("fr")
                    haptics.tap()
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    language === "fr"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-gray-700 bg-slate-800 hover:border-gray-600"
                  }`}
                >
                  <span className="text-3xl">🇫🇷</span>
                  <span className="text-lg font-bold text-white">Francais</span>
                  {language === "fr" && <Check className="ml-auto h-5 w-5 text-purple-400" />}
                </button>
                <button
                  onClick={() => {
                    setLanguage("en")
                    haptics.tap()
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    language === "en"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-gray-700 bg-slate-800 hover:border-gray-600"
                  }`}
                >
                  <span className="text-3xl">🇬🇧</span>
                  <span className="text-lg font-bold text-white">English</span>
                  {language === "en" && <Check className="ml-auto h-5 w-5 text-purple-400" />}
                </button>
              </div>
              <Button
                size="lg"
                onClick={handleNext}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {t.next}
              </Button>
            </div>
          )}

          {/* Step 1: Email input */}
          {currentStep === "email" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                {renderMascot("neutral", 140)}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">{t.emailTitle}</h1>
                <p className="text-sm text-gray-400">{t.emailSubtitle}</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type="email"
                    inputMode="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError("")
                    }}
                    className="h-14 text-lg pl-12 bg-slate-800 border-purple-400/30 text-white placeholder:text-gray-500"
                    autoFocus
                  />
                </div>
                {emailError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm text-left">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {emailError}
                  </div>
                )}
              </div>
              <Button
                size="lg"
                onClick={handleEmailNext}
                disabled={!validateEmail(email) || sendingCode}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {sendingCode ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    {language === "fr" ? "Verification..." : "Checking..."}
                  </span>
                ) : (
                  t.next
                )}
              </Button>
            </div>
          )}

          {/* Username */}
          {currentStep === "username" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                {renderMascot("happy", 140)}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  {language === "fr" ? "Choisis ton pseudo" : "Choose your username"}
                </h1>
                <p className="text-sm text-gray-400">{t.usernamePlaceholder}</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    placeholder={t.username}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setUsernameError("")
                      setUsernameAvailable(false)
                      setUsernameSuggestions([])
                    }}
                    className="h-14 text-lg pl-12 bg-slate-800 border-purple-400/30 text-white placeholder:text-gray-500"
                    autoFocus
                  />
                  {checkingUsername && (
                    <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                  )}
                </div>
                {usernameError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm text-left">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {usernameError}
                  </div>
                )}
                {usernameSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 text-left">
                      {language === "fr" ? "Suggestions disponibles:" : "Available suggestions:"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {usernameSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setUsername(suggestion)
                            setUsernameError("")
                            setUsernameSuggestions([])
                            setUsernameAvailable(true)
                            haptics.tap()
                          }}
                          className="px-3 py-1.5 text-sm bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {username.length >= 3 && !usernameError && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="h-4 w-4" />
                    {language === "fr" ? "Pseudo valide" : "Valid username"}
                  </div>
                )}
              </div>
              <Button
                size="lg"
                onClick={handleSaveUsername}
                disabled={username.length < 3 || checkingUsername}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {checkingUsername ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  t.next
                )}
              </Button>
            </div>
          )}

          {/* Step 4: Password */}
          {currentStep === "password" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                {renderMascot("neutral", 140)}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">{t.createAccount}</h1>
                <p className="text-sm text-gray-400">
                  {language === "fr" ? "Choisis un mot de passe securise" : "Choose a secure password"}
                </p>
              </div>
              <div className="space-y-4">
                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError("")
                    }}
                    className="h-14 text-lg pl-12 pr-12 bg-slate-800 border-purple-400/30 text-white placeholder:text-gray-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={language === "fr" ? "Confirmer le mot de passe" : "Confirm password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setPasswordError("")
                    }}
                    className="h-14 text-lg pl-12 pr-12 bg-slate-800 border-purple-400/30 text-white placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm text-left">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {passwordError}
                  </div>
                )}

                {password.length >= 6 && password === confirmPassword && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="h-4 w-4" />
                    {language === "fr" ? "Mots de passe valides" : "Passwords match"}
                  </div>
                )}
              </div>
              <Button
                size="lg"
                onClick={handleCreateAccount}
                disabled={!validatePassword(password) || password !== confirmPassword || isCreatingAccount}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {isCreatingAccount ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    {language === "fr" ? "Creation du compte..." : "Creating account..."}
                  </span>
                ) : (
                  t.next
                )}
              </Button>
            </div>
          )}

          {/* Source */}
          {currentStep === "source" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">{t.sourceQuestion}</h1>
                <p className="text-sm text-gray-400">
                  {language === "fr" ? "Aide-nous a mieux te connaitre" : "Help us get to know you better"}
                </p>
              </div>
              <div className="space-y-2">
                {SOURCES.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => {
                      setSelectedSource(source.id)
                      haptics.tap()
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedSource === source.id
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-gray-700 bg-slate-800 hover:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{source.icon}</span>
                    <span className="font-medium text-white">{source.label}</span>
                    {selectedSource === source.id && <Check className="ml-auto h-5 w-5 text-purple-400" />}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!selectedSource}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {t.next}
              </Button>
            </div>
          )}

          {/* Goals */}
          {currentStep === "goals" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">{t.goalsQuestion}</h1>
                <p className="text-sm text-gray-400">{t.selectMultiple}</p>
              </div>
              <div className="space-y-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedGoals.includes(goal.id)
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-gray-700 bg-slate-800 hover:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="font-medium text-white">{goal.label}</span>
                    {selectedGoals.includes(goal.id) && <Check className="ml-auto h-5 w-5 text-purple-400" />}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={selectedGoals.length === 0}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {t.next}
              </Button>
            </div>
          )}

          {/* Level */}
          {currentStep === "level" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">{t.levelQuestion}</h1>
                <p className="text-sm text-gray-400">
                  {language === "fr" ? "On adaptera les lecons pour toi" : "We'll adapt lessons for you"}
                </p>
              </div>
              <div className="space-y-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      setSelectedLevel(level.id)
                      haptics.tap()
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedLevel === level.id
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-gray-700 bg-slate-800 hover:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{level.icon}</span>
                    <span className="font-medium text-white text-sm">{level.label}</span>
                    {selectedLevel === level.id && <Check className="ml-auto h-5 w-5 text-purple-400" />}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!selectedLevel}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {t.next}
              </Button>
            </div>
          )}

          {/* Daily time */}
          {currentStep === "daily-time" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">{t.dailyTimeQuestion}</h1>
                <p className="text-sm text-gray-400">
                  {language === "fr" ? "Tu pourras le modifier plus tard" : "You can change this later"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DAILY_TIMES.map((time) => (
                  <button
                    key={time.id}
                    onClick={() => {
                      setSelectedTime(time.id)
                      haptics.tap()
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      selectedTime === time.id
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-gray-700 bg-slate-800 hover:border-gray-600"
                    }`}
                  >
                    <span className="text-lg font-bold text-white">{time.label}</span>
                    <span className="text-xs text-gray-400">{time.subtitle}</span>
                    {selectedTime === time.id && <Check className="mt-2 h-5 w-5 text-purple-400" />}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!selectedTime}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {t.next}
              </Button>
            </div>
          )}

          {/* Notifications */}
          {currentStep === "notifications" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                {renderMascot("happy", 160)}
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-white">{t.notificationsTitle}</h1>
                <p className="text-gray-400 text-sm">{t.notificationsSubtitle}</p>
              </div>
              {!notificationAsked ? (
                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={handleRequestNotifications}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
                  >
                    <Bell className="mr-2 h-5 w-5" />
                    {t.enableNotifications}
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => {
                      setNotificationAsked(true)
                      handleNext()
                    }}
                    className="w-full h-12 text-gray-400 hover:text-white"
                  >
                    {t.skipNotifications}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${notificationsEnabled ? "bg-green-500/20 border border-green-500/30" : "bg-gray-500/20 border border-gray-500/30"}`}>
                    {notificationsEnabled ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <Bell className="h-5 w-5" />
                        <span>{language === "fr" ? "Notifications activees!" : "Notifications enabled!"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <BellOff className="h-5 w-5" />
                        <span>{language === "fr" ? "Notifications desactivees" : "Notifications disabled"}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="lg"
                    onClick={handleNext}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                  >
                    {t.next}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {currentStep === "summary" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                {renderMascot("happy", 140)}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  {language === "fr" ? `Super, ${username}!` : `Awesome, ${username}!`}
                </h1>
                <p className="text-gray-400 text-sm">
                  {language === "fr" ? "Ton profil est pret. Voici le resume:" : "Your profile is ready. Here's the summary:"}
                </p>
              </div>
              <div className="space-y-3 text-left">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase">
                    {language === "fr" ? "Utilisateur" : "Username"}
                  </p>
                  <p className="text-white font-bold">{username}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase">Email</p>
                  <p className="text-white font-bold">{email}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase">
                    {language === "fr" ? "Objectif quotidien" : "Daily goal"}
                  </p>
                  <p className="text-white font-bold">
                    {DAILY_TIME_MINS[selectedTime] || 10} min/{language === "fr" ? "jour" : "day"}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleCreateProfile}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
              >
                {language === "fr" ? "CREER MON PROFIL" : "CREATE MY PROFILE"}
              </Button>
            </div>
          )}

          {/* Success */}
          {currentStep === "success" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                {renderMascot("happy", 200)}
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-black text-white">
                  {language === "fr" ? `Bravo ${username}!` : `Congratulations ${username}!`}
                </h1>
                <p className="text-gray-400">
                  {language === "fr" 
                    ? "Ton compte est pret. Commenceons ta premiere lecon!" 
                    : "Your account is ready. Let's start your first lesson!"}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleFinish}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              >
                {language === "fr" ? "COMMENCER MA PREMIERE LECON" : "START MY FIRST LESSON"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
