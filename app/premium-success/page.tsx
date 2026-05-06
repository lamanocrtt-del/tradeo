"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, ArrowRight, Loader2, Users, Plus, X, AlertCircle } from "lucide-react"
import { haptics } from "@/lib/haptics"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"

export default function PremiumSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planType = searchParams.get("plan") || "monthly"
  const { user, updateUser, users } = useAuthStore()
  const [isVerifying, setIsVerifying] = useState(true)
  const [showFamilySetup, setShowFamilySetup] = useState(false)
  const [familyUsername, setFamilyUsername] = useState("")
  const [familyError, setFamilyError] = useState("")
  const [familyMembers, setFamilyMembers] = useState<Array<{ username: string; email: string }>>([])

  useEffect(() => {
    haptics.tap()

    // Short delay for visual feedback, then activate premium
    const timer = setTimeout(() => {
      if (user) {
        const subscriptionType = planType.includes("family")
          ? "family"
          : planType.includes("annual")
            ? "annual"
            : "monthly"

        updateUser({
          isPremium: true,
          premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          subscriptionType,
          hearts: 999,
          maxHearts: 999,
        })

        if (subscriptionType === "family") {
          setShowFamilySetup(true)
        }
      }

      setIsVerifying(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [planType, user, updateUser])

  const handleAddFamilyMember = () => {
    setFamilyError("")

    if (!familyUsername.trim()) {
      setFamilyError("Veuillez entrer un nom d'utilisateur")
      return
    }

    if (familyMembers.length >= 3) {
      setFamilyError("Maximum 3 membres dans le plan famille")
      return
    }

    if (familyUsername === user?.username) {
      setFamilyError("Vous ne pouvez pas vous ajouter vous-meme")
      return
    }

    if (familyMembers.some((m) => m.username === familyUsername)) {
      setFamilyError("Ce membre est deja ajoute")
      return
    }

    // Check if user exists
    const existingUser = users.find((u) => u.username === familyUsername)
    if (!existingUser) {
      setFamilyError("Aucun utilisateur trouve avec ce nom. Verifiez l'orthographe.")
      return
    }

    setFamilyMembers([...familyMembers, { username: existingUser.username, email: existingUser.email || "" }])
    setFamilyUsername("")
    haptics.success()
  }

  const handleRemoveFamilyMember = (username: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.username !== username))
    haptics.tap()
  }

  const handleFinishFamilySetup = () => {
    // Save family members and activate their premium
    updateUser({
      familyMembers: familyMembers.map((m) => ({
        ...m,
        addedAt: new Date().toISOString(),
      })),
    })

    // Activate premium for family members in the local store
    const store = useAuthStore.getState()
    for (const member of familyMembers) {
      const memberUser = store.users.find((u) => u.username === member.username)
      if (memberUser) {
        const updatedUsers = store.users.map((u) =>
          u.username === member.username
            ? {
                ...u,
                isPremium: true,
                premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                subscriptionType: "family" as const,
                familyOwnerId: user?.id,
                hearts: 999,
                maxHearts: 999,
              }
            : u,
        )
        useAuthStore.setState({ users: updatedUsers })
      }
    }

    haptics.complete()
    setShowFamilySetup(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20 flex items-center justify-center">
        <div className="container max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="mb-6">
            {isVerifying ? (
              <div className="flex justify-center">
                <Loader2 className="h-24 w-24 text-primary animate-spin" />
              </div>
            ) : (
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
            )}
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-3">
            {isVerifying ? "Verification en cours..." : "Bienvenue Premium!"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {isVerifying
              ? "Nous verifions votre paiement..."
              : "Ton abonnement est active. Tu as maintenant acces a toutes les fonctionnalites premium."}
          </p>

          {!isVerifying && showFamilySetup && (
            <div className="bg-card border-2 border-emerald-500/50 rounded-2xl p-6 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-foreground">Configurer le plan Famille</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                {"Ajoutez jusqu'a 3 comptes existants pour partager votre abonnement Premium. Chaque membre aura acces a toutes les fonctionnalites Premium."}
              </p>

              {/* Add member form */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nom d'utilisateur du membre"
                  value={familyUsername}
                  onChange={(e) => {
                    setFamilyUsername(e.target.value)
                    setFamilyError("")
                  }}
                  className="flex-1 bg-background border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleAddFamilyMember()}
                />
                <Button
                  onClick={handleAddFamilyMember}
                  disabled={familyMembers.length >= 3}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {familyError && (
                <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{familyError}</span>
                </div>
              )}

              {/* Members list */}
              <div className="space-y-2 mb-6">
                {familyMembers.map((member) => (
                  <div
                    key={member.username}
                    className="flex items-center justify-between bg-background rounded-xl px-4 py-3 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-emerald-400 font-bold text-sm">
                          {member.username[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">{member.username}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFamilyMember(member.username)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {familyMembers.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    {"Aucun membre ajoute. Entrez le nom d'utilisateur d'un compte existant."}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFamilySetup(false)}
                  className="flex-1"
                >
                  Plus tard
                </Button>
                <Button
                  onClick={handleFinishFamilySetup}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {familyMembers.length > 0
                    ? `Activer pour ${familyMembers.length} membre${familyMembers.length > 1 ? "s" : ""}`
                    : "Continuer sans membres"}
                </Button>
              </div>
            </div>
          )}

          {!isVerifying && !showFamilySetup && (
            <>
              <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
                <h2 className="text-xl font-bold text-foreground mb-4">Profite maintenant de:</h2>
                <ul className="space-y-3">
                  {[
                    "Coeurs infinis - plus de limites",
                    "Aucune publicite",
                    "Lecons exclusives (chapitres 6, 7, 8)",
                    "Simulations de trading avancees",
                    "Badges et trophees exclusifs",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-foreground">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="w-full h-12 font-bold text-lg"
                onClick={() => {
                  haptics.tap()
                  router.push("/learn")
                }}
              >
                Commencer a apprendre
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
