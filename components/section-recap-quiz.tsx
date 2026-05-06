"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Star, CheckCircle, XCircle, ArrowRight, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { haptics } from "@/lib/haptics"
import { ConfettiCelebration } from "@/components/confetti-celebration"
import DeoMascot from "@/components/deo-mascot"

interface RecapQuestion {
  id: string
  question: string
  questionEn: string
  image?: string // URL or path to image
  imageAlt?: string
  options: string[]
  optionsEn: string[]
  correctAnswer: string
  correctAnswerEn: string
  explanation: string
  explanationEn: string
}

// Section recap questions with images
const SECTION_RECAPS: Record<number, RecapQuestion[]> = {
  1: [
    {
      id: "s1-q1",
      question: "Que represente cette bougie sur un graphique ?",
      questionEn: "What does this candle represent on a chart?",
      image: "/images/recap/green-candle.svg",
      imageAlt: "Bougie verte",
      options: ["Le prix a monte", "Le prix a baisse", "Le marche est ferme", "Aucun changement"],
      optionsEn: ["Price went up", "Price went down", "Market is closed", "No change"],
      correctAnswer: "Le prix a monte",
      correctAnswerEn: "Price went up",
      explanation: "Une bougie verte signifie que le prix a monte pendant cette periode.",
      explanationEn: "A green candle means the price went up during that period.",
    },
    {
      id: "s1-q2",
      question: "Tu achetes a 100$ et le prix monte a 120$. Quel est ton profit ?",
      questionEn: "You buy at $100 and price goes to $120. What's your profit?",
      image: "/images/recap/profit-chart.svg",
      imageAlt: "Graphique de profit",
      options: ["20$", "100$", "120$", "220$"],
      optionsEn: ["$20", "$100", "$120", "$220"],
      correctAnswer: "20$",
      correctAnswerEn: "$20",
      explanation: "120$ - 100$ = 20$ de profit. Acheter bas, vendre haut !",
      explanationEn: "$120 - $100 = $20 profit. Buy low, sell high!",
    },
    {
      id: "s1-q3",
      question: "Quel marche est ouvert 24h/24, 7j/7 ?",
      questionEn: "Which market is open 24/7?",
      image: "/images/recap/markets.svg",
      imageAlt: "Differents marches",
      options: ["Cryptomonnaies", "Actions US", "Bourse de Paris", "Forex uniquement"],
      optionsEn: ["Cryptocurrencies", "US Stocks", "Paris Stock Exchange", "Forex only"],
      correctAnswer: "Cryptomonnaies",
      correctAnswerEn: "Cryptocurrencies",
      explanation: "Les cryptomonnaies ne dorment jamais ! Tu peux trader Bitcoin a n'importe quelle heure.",
      explanationEn: "Cryptocurrencies never sleep! You can trade Bitcoin at any hour.",
    },
    {
      id: "s1-q4",
      question: "Une grosse bougie rouge signifie que...",
      questionEn: "A big red candle means that...",
      image: "/images/recap/red-candle.svg",
      imageAlt: "Grosse bougie rouge",
      options: ["Le prix a beaucoup baisse", "Le prix a un peu monte", "Le marche est stable", "C'est une erreur"],
      optionsEn: ["Price dropped a lot", "Price went up a little", "Market is stable", "It's an error"],
      correctAnswer: "Le prix a beaucoup baisse",
      correctAnswerEn: "Price dropped a lot",
      explanation: "Plus la bougie rouge est grande, plus la baisse est importante. Attention aux grosses bougies !",
      explanationEn: "The bigger the red candle, the bigger the drop. Watch out for big candles!",
    },
  ],
  2: [
    {
      id: "s2-q1",
      question: "Qu'est-ce que le corps d'une bougie japonaise ?",
      questionEn: "What is the body of a Japanese candlestick?",
      image: "/images/recap/candle-anatomy.svg",
      imageAlt: "Anatomie d'une bougie",
      options: ["La zone entre l'ouverture et la fermeture", "Les meches", "L'ombre superieure", "Le volume"],
      optionsEn: ["The area between open and close", "The wicks", "The upper shadow", "The volume"],
      correctAnswer: "La zone entre l'ouverture et la fermeture",
      correctAnswerEn: "The area between open and close",
      explanation: "Le corps represente la difference entre le prix d'ouverture et de fermeture.",
      explanationEn: "The body represents the difference between the opening and closing price.",
    },
    {
      id: "s2-q2",
      question: "Qu'est-ce qu'un Doji ?",
      questionEn: "What is a Doji?",
      image: "/images/recap/doji.svg",
      imageAlt: "Bougie Doji",
      options: ["Une bougie avec un tres petit corps", "Une grosse bougie verte", "Un indicateur technique", "Un type de graphique"],
      optionsEn: ["A candle with a very small body", "A big green candle", "A technical indicator", "A chart type"],
      correctAnswer: "Une bougie avec un tres petit corps",
      correctAnswerEn: "A candle with a very small body",
      explanation: "Un Doji montre l'hesitation du marche - les acheteurs et vendeurs sont a egalite.",
      explanationEn: "A Doji shows market indecision - buyers and sellers are equal.",
    },
    {
      id: "s2-q3",
      question: "Que signifie un Marteau (Hammer) ?",
      questionEn: "What does a Hammer pattern mean?",
      image: "/images/recap/hammer.svg",
      imageAlt: "Pattern Marteau",
      options: ["Signal haussier potentiel", "Signal baissier certain", "Continuation de tendance", "Marche ferme"],
      optionsEn: ["Potential bullish signal", "Certain bearish signal", "Trend continuation", "Market closed"],
      correctAnswer: "Signal haussier potentiel",
      correctAnswerEn: "Potential bullish signal",
      explanation: "Le Marteau apparait apres une baisse et peut signaler un retournement a la hausse.",
      explanationEn: "The Hammer appears after a decline and may signal a reversal upward.",
    },
    {
      id: "s2-q4",
      question: "Une longue meche superieure indique...",
      questionEn: "A long upper wick indicates...",
      image: "/images/recap/upper-wick.svg",
      imageAlt: "Longue meche superieure",
      options: ["Rejet des prix hauts", "Forte demande", "Le marche est ferme", "Aucune information"],
      optionsEn: ["Rejection of high prices", "Strong demand", "Market is closed", "No information"],
      correctAnswer: "Rejet des prix hauts",
      correctAnswerEn: "Rejection of high prices",
      explanation: "Les vendeurs ont repousse le prix vers le bas depuis les sommets.",
      explanationEn: "Sellers pushed the price down from the highs.",
    },
  ],
  3: [
    {
      id: "s3-q1",
      question: "Qu'est-ce qu'une tendance haussiere (uptrend) ?",
      questionEn: "What is an uptrend?",
      image: "/images/recap/uptrend.svg",
      imageAlt: "Tendance haussiere",
      options: ["Des sommets et creux de plus en plus hauts", "Des sommets de plus en plus bas", "Un mouvement lateral", "Une chute brutale"],
      optionsEn: ["Higher highs and higher lows", "Lower highs", "Sideways movement", "A sharp drop"],
      correctAnswer: "Des sommets et creux de plus en plus hauts",
      correctAnswerEn: "Higher highs and higher lows",
      explanation: "Une tendance haussiere se caracterise par des hauts et des bas toujours plus hauts.",
      explanationEn: "An uptrend is characterized by continuously higher highs and higher lows.",
    },
    {
      id: "s3-q2",
      question: "Qu'est-ce qu'un support ?",
      questionEn: "What is a support level?",
      image: "/images/recap/support.svg",
      imageAlt: "Niveau de support",
      options: ["Un niveau ou le prix rebondit vers le haut", "Un niveau ou le prix rebondit vers le bas", "Le prix le plus haut", "Le volume d'echanges"],
      optionsEn: ["A level where price bounces up", "A level where price bounces down", "The highest price", "Trading volume"],
      correctAnswer: "Un niveau ou le prix rebondit vers le haut",
      correctAnswerEn: "A level where price bounces up",
      explanation: "Le support est comme un plancher - les acheteurs empechent le prix de descendre plus bas.",
      explanationEn: "Support is like a floor - buyers prevent the price from going lower.",
    },
    {
      id: "s3-q3",
      question: "Que se passe-t-il quand une resistance est cassee ?",
      questionEn: "What happens when a resistance is broken?",
      image: "/images/recap/breakout.svg",
      imageAlt: "Cassure de resistance",
      options: ["Elle peut devenir un support", "Elle disparait completement", "Le marche ferme", "Rien de special"],
      optionsEn: ["It can become a support", "It disappears completely", "Market closes", "Nothing special"],
      correctAnswer: "Elle peut devenir un support",
      correctAnswerEn: "It can become a support",
      explanation: "Quand le prix casse une resistance, celle-ci peut se transformer en support.",
      explanationEn: "When price breaks a resistance, it can turn into support.",
    },
    {
      id: "s3-q4",
      question: "Qu'est-ce qu'un range (consolidation) ?",
      questionEn: "What is a range (consolidation)?",
      image: "/images/recap/range.svg",
      imageAlt: "Range de consolidation",
      options: ["Le prix oscille entre support et resistance", "Une forte tendance haussiere", "Un crash du marche", "Un indicateur technique"],
      optionsEn: ["Price oscillates between support and resistance", "A strong uptrend", "A market crash", "A technical indicator"],
      correctAnswer: "Le prix oscille entre support et resistance",
      correctAnswerEn: "Price oscillates between support and resistance",
      explanation: "Dans un range, le prix rebondit entre un support et une resistance sans direction claire.",
      explanationEn: "In a range, price bounces between support and resistance without a clear direction.",
    },
  ],
}

interface SectionRecapQuizProps {
  sectionId: number
  onComplete: (score: number, total: number) => void
  onClose: () => void
}

export function SectionRecapQuiz({ sectionId, onComplete, onClose }: SectionRecapQuizProps) {
  const { language } = useI18n()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const questions = SECTION_RECAPS[sectionId] || SECTION_RECAPS[1]
  const question = questions[currentQuestion]

  const getLocalizedText = (fr: string, en: string) => {
    return language === "en" ? en : fr
  }

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return
    setSelectedAnswer(answer)
    haptics.tap()
  }

  const handleCheck = () => {
    if (!selectedAnswer) return
    
    const correctAnswer = language === "en" ? question.correctAnswerEn : question.correctAnswer
    const correct = selectedAnswer === correctAnswer
    
    setIsCorrect(correct)
    setIsAnswered(true)
    
    if (correct) {
      setScore(score + 1)
      haptics.success()
    } else {
      haptics.error()
    }
  }

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setIsCorrect(false)
      haptics.tap()
    } else {
      setIsComplete(true)
      if (score + (isCorrect ? 1 : 0) >= questions.length * 0.75) {
        setShowConfetti(true)
        haptics.celebrate()
      }
    }
  }

  const finalScore = score + (isAnswered && isCorrect ? 0 : 0) // score is already updated

  if (isComplete) {
    const passed = finalScore >= questions.length * 0.5
    
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        {showConfetti && <ConfettiCelebration duration={4000} particleCount={100} />}
        
        <div className="w-full max-w-md text-center space-y-6">
          <DeoMascot pose={passed ? "celebrating" : "thinking"} size={150} />
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-foreground">
              {passed 
                ? getLocalizedText("Bravo !", "Well done!")
                : getLocalizedText("Continue tes efforts !", "Keep trying!")}
            </h1>
            <p className="text-muted-foreground">
              {getLocalizedText(
                `Tu as repondu correctement a ${finalScore}/${questions.length} questions.`,
                `You answered ${finalScore}/${questions.length} questions correctly.`
              )}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {Array.from({ length: questions.length }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < finalScore ? "bg-green-500" : "bg-red-500/50"
                }`}
              />
            ))}
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <span className="text-3xl font-black text-yellow-400">
                +{finalScore * 10} XP
              </span>
            </div>
            <p className="text-sm text-yellow-300/80">
              {getLocalizedText("Bonus de recap", "Recap bonus")}
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => onComplete(finalScore, questions.length)}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {getLocalizedText("CONTINUER", "CONTINUE")}
          </Button>
        </div>
      </div>
    )
  }

  const options = language === "en" ? question.optionsEn : question.options
  const correctAnswer = language === "en" ? question.correctAnswerEn : question.correctAnswer

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          {getLocalizedText("Fermer", "Close")}
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span className="font-bold">
            {getLocalizedText("Quiz Recap", "Recap Quiz")}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentQuestion + 1}/{questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Image placeholder - will be generated or use SVG */}
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
            {question.image ? (
              <RecapImage type={question.id} />
            ) : (
              <Star className="h-16 w-16 text-yellow-500/50" />
            )}
          </div>

          <h2 className="text-xl font-bold text-foreground text-center">
            {getLocalizedText(question.question, question.questionEn)}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrectOption = option === correctAnswer
              
              let optionClass = "border-2 border-border bg-card hover:border-primary/50"
              
              if (isAnswered) {
                if (isCorrectOption) {
                  optionClass = "border-2 border-green-500 bg-green-500/10"
                } else if (isSelected && !isCorrectOption) {
                  optionClass = "border-2 border-red-500 bg-red-500/10"
                }
              } else if (isSelected) {
                optionClass = "border-2 border-primary bg-primary/10"
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl text-left transition-all ${optionClass} ${
                    isAnswered ? "cursor-default" : "cursor-pointer active:scale-[0.98]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {isAnswered && isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className={`p-4 rounded-xl ${isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
              <p className={`text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                {getLocalizedText(question.explanation, question.explanationEn)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom button */}
      <div className="p-4 border-t bg-background/95 backdrop-blur">
        {!isAnswered ? (
          <Button
            size="lg"
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className="w-full h-14 text-lg font-bold"
          >
            {getLocalizedText("VERIFIER", "CHECK")}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleContinue}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600"
          >
            <span>{getLocalizedText("CONTINUER", "CONTINUE")}</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

// SVG illustrations for recap questions
function RecapImage({ type }: { type: string }) {
  switch (type) {
    case "s1-q1": // Green candle
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-8">
          <rect x="85" y="20" width="30" height="100" fill="#22c55e" rx="4" />
          <line x1="100" y1="10" x2="100" y2="20" stroke="#22c55e" strokeWidth="4" />
          <line x1="100" y1="120" x2="100" y2="140" stroke="#22c55e" strokeWidth="4" />
          <text x="100" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10">Bougie Verte</text>
        </svg>
      )
    case "s1-q2": // Profit chart
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-6">
          <line x1="30" y1="120" x2="30" y2="20" stroke="#475569" strokeWidth="2" />
          <line x1="30" y1="120" x2="180" y2="120" stroke="#475569" strokeWidth="2" />
          <path d="M40 100 L80 100 L120 60 L160 60" fill="none" stroke="#22c55e" strokeWidth="3" />
          <circle cx="80" cy="100" r="6" fill="#3b82f6" />
          <circle cx="120" cy="60" r="6" fill="#22c55e" />
          <text x="75" y="115" fill="#3b82f6" fontSize="10">100$</text>
          <text x="115" y="50" fill="#22c55e" fontSize="10">120$</text>
          <text x="145" y="90" fill="#fbbf24" fontSize="12" fontWeight="bold">+20$</text>
        </svg>
      )
    case "s1-q3": // Markets
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-4">
          <circle cx="60" cy="60" r="30" fill="#f7931a" opacity="0.9" />
          <text x="60" y="65" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">BTC</text>
          <text x="60" y="105" textAnchor="middle" fill="#94a3b8" fontSize="9">24/7</text>
          <rect x="110" y="35" width="50" height="50" fill="#3b82f6" rx="8" />
          <text x="135" y="65" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">NYSE</text>
          <text x="135" y="105" textAnchor="middle" fill="#94a3b8" fontSize="9">9h-17h</text>
        </svg>
      )
    case "s1-q4": // Big red candle
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-8">
          <rect x="85" y="15" width="30" height="110" fill="#ef4444" rx="4" />
          <line x1="100" y1="5" x2="100" y2="15" stroke="#ef4444" strokeWidth="4" />
          <line x1="100" y1="125" x2="100" y2="145" stroke="#ef4444" strokeWidth="4" />
          <path d="M130 40 L150 60 L140 60 L140 80 L120 80 L120 60 L110 60 Z" fill="#fbbf24" />
          <text x="100" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10">Forte Baisse</text>
        </svg>
      )
    case "s2-q1": // Candle anatomy
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-4">
          <line x1="100" y1="10" x2="100" y2="30" stroke="#22c55e" strokeWidth="4" />
          <rect x="80" y="30" width="40" height="70" fill="#22c55e" rx="4" />
          <line x1="100" y1="100" x2="100" y2="130" stroke="#22c55e" strokeWidth="4" />
          <line x1="130" y1="20" x2="160" y2="20" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
          <text x="165" y="23" fill="#94a3b8" fontSize="8">Meche haute</text>
          <line x1="130" y1="65" x2="160" y2="65" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
          <text x="165" y="68" fill="#94a3b8" fontSize="8">Corps</text>
          <line x1="130" y1="115" x2="160" y2="115" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
          <text x="165" y="118" fill="#94a3b8" fontSize="8">Meche basse</text>
        </svg>
      )
    case "s2-q2": // Doji
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-8">
          <line x1="100" y1="20" x2="100" y2="60" stroke="#94a3b8" strokeWidth="4" />
          <rect x="85" y="60" width="30" height="5" fill="#94a3b8" rx="2" />
          <line x1="100" y1="65" x2="100" y2="130" stroke="#94a3b8" strokeWidth="4" />
          <text x="100" y="145" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold">DOJI</text>
        </svg>
      )
    case "s2-q3": // Hammer
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-8">
          <rect x="85" y="20" width="30" height="25" fill="#22c55e" rx="4" />
          <line x1="100" y1="45" x2="100" y2="130" stroke="#22c55e" strokeWidth="4" />
          <path d="M60 20 C60 10, 80 0, 100 10" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <text x="50" y="15" fill="#fbbf24" fontSize="10">Signal haussier</text>
        </svg>
      )
    case "s2-q4": // Upper wick
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-8">
          <line x1="100" y1="10" x2="100" y2="70" stroke="#ef4444" strokeWidth="4" />
          <rect x="85" y="70" width="30" height="40" fill="#ef4444" rx="4" />
          <line x1="100" y1="110" x2="100" y2="130" stroke="#ef4444" strokeWidth="4" />
          <path d="M130 30 L160 50" stroke="#fbbf24" strokeWidth="2" />
          <text x="140" y="25" fill="#fbbf24" fontSize="9">Rejet</text>
        </svg>
      )
    case "s3-q1": // Uptrend
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-6">
          <path d="M20 120 L60 90 L80 100 L120 60 L140 75 L180 30" fill="none" stroke="#22c55e" strokeWidth="3" />
          <circle cx="60" cy="90" r="4" fill="#22c55e" />
          <circle cx="80" cy="100" r="4" fill="#22c55e" />
          <circle cx="120" cy="60" r="4" fill="#22c55e" />
          <circle cx="140" cy="75" r="4" fill="#22c55e" />
          <text x="100" y="145" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">UPTREND</text>
        </svg>
      )
    case "s3-q2": // Support
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-6">
          <line x1="20" y1="100" x2="180" y2="100" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8" />
          <path d="M30 60 L60 95 L90 70 L120 95 L150 50 L170 40" fill="none" stroke="#22c55e" strokeWidth="2" />
          <circle cx="60" cy="95" r="5" fill="#3b82f6" />
          <circle cx="120" cy="95" r="5" fill="#3b82f6" />
          <text x="100" y="120" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">SUPPORT</text>
        </svg>
      )
    case "s3-q3": // Breakout
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-6">
          <line x1="20" y1="60" x2="120" y2="60" stroke="#ef4444" strokeWidth="2" strokeDasharray="6" />
          <line x1="120" y1="60" x2="180" y2="60" stroke="#22c55e" strokeWidth="2" strokeDasharray="6" />
          <path d="M30 90 L60 65 L80 80 L100 65 L130 40 L160 30" fill="none" stroke="#22c55e" strokeWidth="3" />
          <circle cx="110" cy="60" r="8" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <text x="50" y="50" fill="#ef4444" fontSize="8">Resistance</text>
          <text x="140" y="75" fill="#22c55e" fontSize="8">Support</text>
        </svg>
      )
    case "s3-q4": // Range
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full p-6">
          <line x1="20" y1="40" x2="180" y2="40" stroke="#ef4444" strokeWidth="2" strokeDasharray="6" />
          <line x1="20" y1="110" x2="180" y2="110" stroke="#22c55e" strokeWidth="2" strokeDasharray="6" />
          <path d="M30 100 L50 50 L70 100 L90 50 L110 100 L130 50 L150 100 L170 60" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <text x="100" y="30" textAnchor="middle" fill="#ef4444" fontSize="8">Resistance</text>
          <text x="100" y="130" textAnchor="middle" fill="#22c55e" fontSize="8">Support</text>
        </svg>
      )
    default:
      return (
        <Star className="h-16 w-16 text-yellow-500/50" />
      )
  }
}
