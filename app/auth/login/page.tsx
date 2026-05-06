"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, EyeOff, AlertCircle, Mail } from "lucide-react"
import DeoMascot from "@/components/deo-mascot"
import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { haptics } from "@/lib/haptics"

export default function LoginPage() {
  const router = useRouter()
  const { login, loginUser, user, isHydrated, checkSession, isLoading: authLoading } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (isHydrated && user) {
      router.replace("/learn")
    }
  }, [isHydrated, user, router])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    haptics.tap()
    
    try {
      // Use Supabase auth
      const result = await login(email, password)

      if (!result.success) {
        setError("Email ou mot de passe incorrect")
        haptics.error()
        setIsLoading(false)
        return
      }

      haptics.success()
      router.push("/learn")
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Erreur lors de la connexion")
      haptics.error()
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-purple-500/20">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Static Mascot */}
          <div className="flex justify-center">
            <DeoMascot pose="happy" size={220} />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold text-white">Connexion</h1>
            <p className="text-gray-400">Bienvenue sur Tradeo</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-400 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base pl-12 bg-slate-800 border-purple-400/30 text-white placeholder:text-gray-600"
                  disabled={isLoading || authLoading}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400 mb-2 block">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base bg-slate-800 border-purple-400/30 text-white placeholder:text-gray-600 pr-12"
                  disabled={isLoading || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition"
                  disabled={isLoading || authLoading}
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!validateEmail(email) || !password || isLoading || authLoading}
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
            >
              {isLoading || authLoading ? "Connexion..." : "SE CONNECTER"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Pas encore inscrit ?{" "}
                <Link href="/onboarding" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Creer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
