"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-border safe-area-top">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold text-foreground">Politique de confidentialite</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">
            Derniere mise a jour : Fevrier 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">1. Introduction</h2>
            <p>
              Bienvenue sur Tradeo. Cette politique de confidentialite decrit comment nous collectons,
              utilisons et protegeons vos informations lorsque vous utilisez notre application mobile
              et nos services.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-primary font-semibold text-sm">
                IMPORTANT : Tradeo est une application EDUCATIVE et de SIMULATION.
                Aucun argent reel n&apos;est utilise dans les transactions de trading.
                Tous les soldes, profits et pertes affiches sont purement fictifs
                et destines a l&apos;apprentissage.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">2. Donnees collectees</h2>
            <p>Nous collectons les informations suivantes :</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-foreground">Compte utilisateur :</strong> Nom d&apos;utilisateur
                et mot de passe (stockes localement sur votre appareil)
              </li>
              <li>
                <strong className="text-foreground">Progression :</strong> Lecons completees,
                score XP, streak, badges obtenus (stockes localement)
              </li>
              <li>
                <strong className="text-foreground">Donnees de simulation :</strong> Historique
                des trades simules, solde virtuel, profits/pertes fictifs
              </li>
              <li>
                <strong className="text-foreground">Preferences :</strong> Langue, parametres
                de notification, objectif quotidien
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">3. Stockage des donnees</h2>
            <p>
              Toutes vos donnees sont stockees localement sur votre appareil via le stockage
              du navigateur (localStorage). Nous ne transmettons pas vos donnees personnelles
              a des serveurs externes, sauf si vous optez pour la synchronisation cloud
              (fonctionnalite premium optionnelle).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">4. Nature educative de l&apos;application</h2>
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <p className="font-semibold text-foreground">Tradeo est un simulateur educatif :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Aucune transaction financiere reelle n&apos;est effectuee</li>
                <li>Les cours affiches sont simules et ne refletent pas les marches reels</li>
                <li>L&apos;argent utilise dans le simulateur est 100% virtuel</li>
                <li>L&apos;application ne constitue pas un conseil en investissement</li>
                <li>Les resultats de simulation ne garantissent pas de futurs resultats reels</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">5. Utilisation des donnees</h2>
            <p>Vos donnees sont utilisees uniquement pour :</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Sauvegarder votre progression d&apos;apprentissage</li>
              <li>Personnaliser votre experience educative</li>
              <li>Afficher vos statistiques de simulation</li>
              <li>Envoyer des rappels de notification (si autorises)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">6. Partage des donnees</h2>
            <p>
              Nous ne vendons, ne louons et ne partageons pas vos donnees personnelles
              avec des tiers. Vos donnees restent sur votre appareil.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">7. Securite</h2>
            <p>
              Nous prenons la securite de vos donnees au serieux. Les donnees stockees
              localement sont protegees par les mecanismes de securite standard de votre
              appareil et du navigateur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">8. Droits des utilisateurs</h2>
            <p>Vous avez le droit de :</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Supprimer votre compte et toutes vos donnees a tout moment</li>
              <li>Exporter vos donnees de progression</li>
              <li>Desactiver les notifications</li>
              <li>Demander des informations sur les donnees que nous stockons</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">9. Mineurs</h2>
            <p>
              Tradeo est une application educative accessible a tous les ages.
              Nous ne collectons pas intentionnellement de donnees personnelles
              sensibles. L&apos;application ne contient pas de transactions financieres
              reelles et est securisee pour un usage familial.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">10. Modifications</h2>
            <p>
              Nous nous reservons le droit de modifier cette politique de confidentialite
              a tout moment. Les modifications seront notifiees via l&apos;application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">11. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialite,
              contactez-nous a : contact@tradeo.app
            </p>
          </section>

          <div className="pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>Tradeo - Simulateur educatif de trading</p>
            <p>Tous droits reserves - 2026</p>
          </div>
        </div>
      </main>
    </div>
  )
}
