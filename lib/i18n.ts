"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Language = "fr" | "en"

interface I18nState {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      language: "fr",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "tradeo-language",
    }
  )
)

export const translations = {
  fr: {
    // Common
    next: "SUIVANT",
    continue: "CONTINUER",
    back: "Retour",
    start: "COMMENCER",
    letsGo: "C'EST PARTI !",
    check: "VERIFIER",
    correct: "Correct !",
    incorrect: "Incorrect",
    tryAgain: "Essaie encore",
    
    // Onboarding
    chooseLanguage: "Choisis ta langue",
    french: "Francais",
    english: "English",
    createAccount: "Cree ton compte",
    username: "Nom d'utilisateur",
    usernamePlaceholder: "(N'utilise pas ton vrai nom)",
    password: "Mot de passe",
    passwordPlaceholder: "Minimum 6 caracteres",
    usernameError: "Le nom d'utilisateur doit faire au moins 3 caracteres",
    passwordError: "Le mot de passe doit faire au moins 6 caracteres",
    
    // Email verification
    emailTitle: "Ton adresse email",
    emailSubtitle: "On va t'envoyer un code pour verifier ton compte",
    emailPlaceholder: "ton@email.com",
    emailInvalid: "Adresse email invalide",
    sendCode: "ENVOYER LE CODE",
    sending: "Envoi en cours...",
    enterCode: "Entre le code",
    codeSentTo: "Code envoye a",
    codeIncorrect: "Code incorrect",
    verify: "VERIFIER",
    verifying: "Verification...",
    changeEmail: "Changer d'email",
    testMode: "Mode test",
    resendCode: "Renvoyer le code",
    resending: "Renvoi...",
    accountCreated: "Compte cree avec succes !",
    confirmPassword: "Confirmer le mot de passe",
    passwordsMismatch: "Les mots de passe ne correspondent pas",
    creating: "Creation...",
    
    // Notifications step
    notificationsTitle: "Active les notifications",
    notificationsSubtitle: "Pour ne jamais manquer ton streak !",
    enableNotifications: "ACTIVER",
    skipNotifications: "Plus tard",
    
    welcomeTitle: "Salut, moi c'est Deo !",
    welcomeSubtitle: "Je vais t'apprendre a trader comme un pro !",
    
    sourceQuestion: "Comment as-tu entendu parler de Tradeo ?",
    sources: {
      tiktok: "TikTok",
      friends: "Amis ou famille",
      store: "App Store / Play Store",
      news: "Actualites ou articles",
      social: "Facebook ou Instagram",
      tv: "Television",
      linkedin: "LinkedIn",
    },
    
    goalsQuestion: "Pourquoi veux-tu apprendre le trading ?",
    selectMultiple: "Tu peux en selectionner plusieurs",
    goals: {
      career: "Booster ma carriere",
      study: "M'aider dans mes etudes",
      productivity: "Bien utiliser mon temps",
      fun: "Me divertir",
      connections: "Tisser des liens",
      hobby: "Decouvrir un hobby",
    },
    
    levelQuestion: "Tu connais deja un peu le trading ?",
    levels: {
      beginner: "Je debute en trading",
      basic: "Je connais quelques termes de base",
      intermediate: "Je comprends les bases",
      advanced: "Je trade regulierement",
      expert: "Je suis un trader experimente",
    },
    
    dailyTimeQuestion: "Quel est ton objectif quotidien ?",
    dailyTimes: {
      casual: "Tranquille",
      normal: "Normal",
      intense: "Intensif",
      extreme: "Extreme",
    },
    
    summaryTitle: "Regarde tout ce que tu peux accomplir en 3 mois !",
    summaryPoints: {
      speak: "Parle avec assurance",
      speakDesc: "Des exercices sans stress pour apprendre le trading",
      vocabulary: "Enrichis ton vocabulaire",
      vocabularyDesc: "Des termes courants et des expressions utiles",
      habits: "Prends de bonnes habitudes",
      habitsDesc: "Des rappels intelligents et des defis amusants",
    },
    
    welcomeUser: "Bienvenue",
    profileCreated: "Ton profil a ete cree avec succes.",
    gemsReceived: "Tu as recu 50 gems pour commencer !",
    
    // Leaderboard
    yourLeague: "Ta ligue actuelle",
    progressTo: "Progression vers",
    moreXpNeeded: "Encore {xp} XP pour monter en ligue {league}",
    weeklyLeaderboard: "Classement Hebdomadaire",
    top3Bonus: "Top 3 = +100 XP bonus",
    endsIn: "Se termine dans {days} jours",
    itsYou: "C'est toi !",
    xp: "XP",
    
    // Leagues
    leagues: {
      bronze: "Bronze",
      silver: "Argent",
      gold: "Or",
      diamond: "Diamant",
    },
    
    // Navigation
    nav: {
      learn: "Apprendre",
      leagues: "Ligues",
      trading: "Trading",
      shop: "Boutique",
      profile: "Compte",
    },
    
    // Trading
    trading: {
      title: "Pulse Markets",
      live: "LIVE",
      amount: "MONTANT",
      buy: "ACHETER",
      sell: "VENDRE",
      balance: "Solde",
      portfolio: "Portefeuille",
      profit: "Profit",
      loss: "Perte",
    },
    
    // Notifications
    notifications: {
      title: "Notifications",
      newAchievement: "Nouvelle reussite !",
      xpReached: "Vous avez atteint {xp} XP",
      streakDays: "Serie de {days} jours !",
      keepGoing: "Continuez comme ca !",
      dailyReward: "Recompense quotidienne",
      gemsEarned: "Vous avez gagne {gems} gemmes",
      newChallenge: "Nouveau defi disponible",
      completeForBadge: "Completez 5 lecons pour gagner un badge",
      leaguePromotion: "Promotion de ligue !",
      promotedTo: "Vous etes promu en ligue {league}",
      newLesson: "Nouvelle lecon disponible",
      lessonUnlocked: "La lecon '{lesson}' est debloquee",
      timeAgo: {
        now: "A l'instant",
        minutes: "Il y a {n} min",
        hours: "Il y a {n}h",
        days: "Il y a {n}j",
      },
    },
    
    // Learn page
    learn: {
      title: "Apprendre",
      section: "Section",
      unit: "Unite",
      lesson: "Lecon",
      locked: "Verrouille",
      completed: "Termine",
      start: "Commencer",
      continueLesson: "Continuer",
      xpEarned: "{xp} XP gagnes",
      questionsRemaining: "{n} questions restantes",
    },
    
    // Profile
    profile: {
      title: "Profil",
      statistics: "Statistiques",
      totalXp: "XP Total",
      lessonsCompleted: "Lecons terminees",
      currentStreak: "Serie actuelle",
      longestStreak: "Plus longue serie",
      joinDate: "Membre depuis",
      settings: "Parametres",
      logout: "Deconnexion",
      yearWrapUp: "Bilan de l'annee",
    },
    
    // Shop
    shop: {
      title: "Boutique",
      gems: "Gemmes",
      streakFreeze: "Gel de serie",
      doubleXp: "Double XP",
      premium: "Premium",
      buy: "Acheter",
    },
    
    // Header
    header: {
      streak: "Serie",
      gems: "Gemmes",
      hearts: "Coeurs",
    },
  },
  en: {
    // Common
    next: "NEXT",
    continue: "CONTINUE",
    back: "Back",
    start: "START",
    letsGo: "LET'S GO!",
    check: "CHECK",
    correct: "Correct!",
    incorrect: "Incorrect",
    tryAgain: "Try again",
    
    // Onboarding
    chooseLanguage: "Choose your language",
    french: "Francais",
    english: "English",
    createAccount: "Create your account",
    username: "Username",
    usernamePlaceholder: "(Don't use your real name)",
    password: "Password",
    passwordPlaceholder: "Minimum 6 characters",
    usernameError: "Username must be at least 3 characters",
    passwordError: "Password must be at least 6 characters",
    
    // Email verification
    emailTitle: "Your email address",
    emailSubtitle: "We'll send you a code to verify your account",
    emailPlaceholder: "your@email.com",
    emailInvalid: "Invalid email address",
    sendCode: "SEND CODE",
    sending: "Sending...",
    enterCode: "Enter the code",
    codeSentTo: "Code sent to",
    codeIncorrect: "Incorrect code",
    verify: "VERIFY",
    verifying: "Verifying...",
    changeEmail: "Change email",
    testMode: "Test mode",
    resendCode: "Resend code",
    resending: "Resending...",
    accountCreated: "Account created successfully!",
    confirmPassword: "Confirm password",
    passwordsMismatch: "Passwords do not match",
    creating: "Creating...",
    
    // Notifications step
    notificationsTitle: "Enable notifications",
    notificationsSubtitle: "Never miss your streak!",
    enableNotifications: "ENABLE",
    skipNotifications: "Later",
    
    welcomeTitle: "Hi, I'm Deo!",
    welcomeSubtitle: "I'll teach you how to trade like a pro!",
    
    sourceQuestion: "How did you hear about Tradeo?",
    sources: {
      tiktok: "TikTok",
      friends: "Friends or family",
      store: "App Store / Play Store",
      news: "News or articles",
      social: "Facebook or Instagram",
      tv: "Television",
      linkedin: "LinkedIn",
    },
    
    goalsQuestion: "Why do you want to learn trading?",
    selectMultiple: "You can select multiple",
    goals: {
      career: "Boost my career",
      study: "Help with my studies",
      productivity: "Use my time wisely",
      fun: "Have fun",
      connections: "Build connections",
      hobby: "Discover a hobby",
    },
    
    levelQuestion: "Do you already know some trading?",
    levels: {
      beginner: "I'm a complete beginner",
      basic: "I know some basic terms",
      intermediate: "I understand the basics",
      advanced: "I trade regularly",
      expert: "I'm an experienced trader",
    },
    
    dailyTimeQuestion: "What's your daily goal?",
    dailyTimes: {
      casual: "Casual",
      normal: "Normal",
      intense: "Intense",
      extreme: "Extreme",
    },
    
    summaryTitle: "Look at what you can achieve in 3 months!",
    summaryPoints: {
      speak: "Speak with confidence",
      speakDesc: "Stress-free exercises to learn trading",
      vocabulary: "Enrich your vocabulary",
      vocabularyDesc: "Common terms and useful expressions",
      habits: "Build good habits",
      habitsDesc: "Smart reminders and fun challenges",
    },
    
    welcomeUser: "Welcome",
    profileCreated: "Your profile has been created successfully.",
    gemsReceived: "You received 50 gems to start!",
    
    // Leaderboard
    yourLeague: "Your current league",
    progressTo: "Progress to",
    moreXpNeeded: "{xp} more XP to reach {league} league",
    endsIn: "Ends in {days} days",
    weeklyLeaderboard: "Weekly Leaderboard",
    top3Bonus: "Top 3 = +100 XP bonus",
    itsYou: "It's you!",
    xp: "XP",
    
    // Leagues
    leagues: {
      bronze: "Bronze",
      silver: "Silver",
      gold: "Gold",
      diamond: "Diamond",
    },
    
    // Navigation
    nav: {
      learn: "Learn",
      leagues: "Leagues",
      trading: "Trading",
      shop: "Shop",
      profile: "Account",
    },
    
    // Trading
    trading: {
      title: "Pulse Markets",
      live: "LIVE",
      amount: "AMOUNT",
      buy: "BUY",
      sell: "SELL",
      balance: "Balance",
      portfolio: "Portfolio",
      profit: "Profit",
      loss: "Loss",
    },
    
    // Notifications
    notifications: {
      title: "Notifications",
      newAchievement: "New achievement!",
      xpReached: "You reached {xp} XP",
      streakDays: "{days} day streak!",
      keepGoing: "Keep it up!",
      dailyReward: "Daily reward",
      gemsEarned: "You earned {gems} gems",
      newChallenge: "New challenge available",
      completeForBadge: "Complete 5 lessons to earn a badge",
      leaguePromotion: "League promotion!",
      promotedTo: "You've been promoted to {league} league",
      newLesson: "New lesson available",
      lessonUnlocked: "Lesson '{lesson}' is unlocked",
      timeAgo: {
        now: "Just now",
        minutes: "{n} min ago",
        hours: "{n}h ago",
        days: "{n}d ago",
      },
    },
    
    // Learn page
    learn: {
      title: "Learn",
      section: "Section",
      unit: "Unit",
      lesson: "Lesson",
      locked: "Locked",
      completed: "Completed",
      start: "Start",
      continueLesson: "Continue",
      xpEarned: "{xp} XP earned",
      questionsRemaining: "{n} questions remaining",
    },
    
    // Profile
    profile: {
      title: "Profile",
      statistics: "Statistics",
      totalXp: "Total XP",
      lessonsCompleted: "Lessons completed",
      currentStreak: "Current streak",
      longestStreak: "Longest streak",
      joinDate: "Member since",
      settings: "Settings",
      logout: "Logout",
      yearWrapUp: "Year wrap-up",
    },
    
    // Shop
    shop: {
      title: "Shop",
      gems: "Gems",
      streakFreeze: "Streak freeze",
      doubleXp: "Double XP",
      premium: "Premium",
      buy: "Buy",
    },
    
    // Header
    header: {
      streak: "Streak",
      gems: "Gems",
      hearts: "Hearts",
    },
  },
}

export function useTranslation() {
  const { language } = useI18n()
  return translations[language]
}
