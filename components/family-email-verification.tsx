"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle2, XCircle, AlertCircle, Mail } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

type EmailValidation = {
  isValid: boolean
  error: string | null
  username: string | null
  codeSent: boolean
  codeVerified: boolean
}

const EMPTY_VALIDATION: EmailValidation = { 
  isValid: false, 
  error: null, 
  username: null, 
  codeSent: false, 
  codeVerified: false 
}

interface FamilyEmailVerificationProps {
  onValidityChange: (isValid: boolean) => void
}

export function FamilyEmailVerification({ onValidityChange }: FamilyEmailVerificationProps) {
  const { users, user: currentUser } = useAuthStore()

  const [email1, setEmail1] = useState("")
  const [email2, setEmail2] = useState("")
  const [email3, setEmail3] = useState("")

  const [code1, setCode1] = useState("")
  const [code2, setCode2] = useState("")
  const [code3, setCode3] = useState("")

  const [validation1, setValidation1] = useState<EmailValidation>(EMPTY_VALIDATION)
  const [validation2, setValidation2] = useState<EmailValidation>(EMPTY_VALIDATION)
  const [validation3, setValidation3] = useState<EmailValidation>(EMPTY_VALIDATION)

  const [validating1, setValidating1] = useState(false)
  const [validating2, setValidating2] = useState(false)
  const [validating3, setValidating3] = useState(false)

  const [sendingCode1, setSendingCode1] = useState(false)
  const [sendingCode2, setSendingCode2] = useState(false)
  const [sendingCode3, setSendingCode3] = useState(false)

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const checkValidity = useCallback(
    (
      v1: EmailValidation,
      v2: EmailValidation,
      v3: EmailValidation,
      e1: string,
      e2: string,
      e3: string,
    ) => {
      const entered = [e1, e2, e3].filter((e) => e.trim()).map((e) => e.toLowerCase())
      const hasDupes = new Set(entered).size !== entered.length
      const valid =
        v1.codeVerified &&
        (!e2.trim() || v2.codeVerified) &&
        (!e3.trim() || v3.codeVerified) &&
        !hasDupes
      onValidityChange(valid)
      return hasDupes
    },
    [onValidityChange],
  )

  const sendVerificationCode = async (
    email: string,
    setValidation: (v: EmailValidation) => void,
    setSending: (v: boolean) => void,
    index: number,
  ) => {
    if (!isValidEmail(email)) {
      setValidation({ ...EMPTY_VALIDATION, error: "Format d'email invalide" })
      return
    }

    if (currentUser?.email && email.toLowerCase() === currentUser.email.toLowerCase()) {
      setValidation({ 
        ...EMPTY_VALIDATION, 
        error: "Vous ne pouvez pas ajouter votre propre email" 
      })
      return
    }

    setSending(true)

    try {
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setValidation({ 
          isValid: false, 
          error: null, 
          username: null, 
          codeSent: true, 
          codeVerified: false 
        })
      } else {
        setValidation({ ...EMPTY_VALIDATION, error: data.error || "Erreur lors de l'envoi" })
      }
    } catch {
      setValidation({ ...EMPTY_VALIDATION, error: "Erreur de connexion" })
    } finally {
      setSending(false)
    }
  }

  const verifyCode = async (
    email: string,
    code: string,
    setValidation: (v: EmailValidation) => void,
    setValidating: (v: boolean) => void,
    currentValidation: EmailValidation,
    otherV1: EmailValidation,
    otherV2: EmailValidation,
    allEmails: [string, string, string],
    index: number,
  ) => {
    if (code.length !== 6) return

    setValidating(true)

    try {
      const response = await fetch("/api/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (data.success) {
        // Check if user exists with this email
        const foundUser = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase())
        
        const result: EmailValidation = { 
          isValid: true, 
          error: null, 
          username: foundUser?.username || null, 
          codeSent: true, 
          codeVerified: true 
        }
        setValidation(result)
        
        const vals = [otherV1, otherV2]
        vals.splice(index, 0, result)
        checkValidity(vals[0], vals[1], vals[2], ...allEmails)
      } else {
        setValidation({ 
          ...currentValidation, 
          error: data.error || "Code incorrect" 
        })
      }
    } catch {
      setValidation({ ...currentValidation, error: "Erreur de verification" })
    } finally {
      setValidating(false)
    }
  }

  const emailsEntered = [email1, email2, email3].filter((e) => e.trim()).map((e) => e.toLowerCase())
  const hasDuplicateEmails = new Set(emailsEntered).size !== emailsEntered.length

  const renderField = (
    label: string,
    required: boolean,
    email: string,
    setEmail: (v: string) => void,
    code: string,
    setCode: (v: string) => void,
    validation: EmailValidation,
    setValidation: (v: EmailValidation) => void,
    validating: boolean,
    setValidating: (v: boolean) => void,
    sendingCode: boolean,
    setSendingCode: (v: boolean) => void,
    index: number,
  ) => {
    const others = index === 0
      ? [validation2, validation3]
      : index === 1
        ? [validation1, validation3]
        : [validation1, validation2]

    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        
        {/* Email input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="email"
              inputMode="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setValidation(EMPTY_VALIDATION)
                setCode("")
                onValidityChange(false)
              }}
              disabled={validation.codeSent}
              className={`h-11 bg-background border-border text-foreground placeholder:text-muted-foreground pr-10 ${
                validation.error && !validation.codeSent ? "border-red-500 focus:border-red-500" : ""
              } ${validation.codeVerified ? "border-emerald-500 focus:border-emerald-500" : ""}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validation.codeVerified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              {validation.error && !validation.codeSent && <XCircle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
          
          {/* Send code button */}
          {!validation.codeSent && email.trim() && (
            <button
              onClick={() => sendVerificationCode(email, setValidation, setSendingCode, index)}
              disabled={sendingCode || !isValidEmail(email)}
              className="h-11 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {sendingCode ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Verifier
                </>
              )}
            </button>
          )}
        </div>

        {/* Code input - shown after email is sent */}
        {validation.codeSent && !validation.codeVerified && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Code a 6 chiffres"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  if (val.length <= 6) {
                    setCode(val)
                    if (val.length === 6) {
                      verifyCode(
                        email, 
                        val, 
                        setValidation, 
                        setValidating, 
                        validation,
                        others[0], 
                        others[1], 
                        [email1, email2, email3].map((e, i) => (i === index ? email : e)) as [string, string, string],
                        index
                      )
                    }
                  }
                }}
                className={`h-11 bg-background border-border text-foreground text-center tracking-widest font-mono ${
                  validation.error && validation.codeSent ? "border-red-500" : ""
                }`}
              />
              {validating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setValidation(EMPTY_VALIDATION)
                  setCode("")
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Changer d&apos;email
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={() => sendVerificationCode(email, setValidation, setSendingCode, index)}
                disabled={sendingCode}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                {sendingCode ? "Envoi..." : "Renvoyer le code"}
              </button>
            </div>
          </div>
        )}

        {/* Error messages */}
        {validation.error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {validation.error}
          </p>
        )}
        
        {/* Success message */}
        {validation.codeVerified && (
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 
            Email verifie{validation.username ? ` : ${validation.username}` : " - invitation envoyee"}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-muted/50 rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-emerald-500" />
        <h3 className="font-bold text-foreground text-sm">Emails de vos proches</h3>
      </div>
      <div className="space-y-4">
        {renderField("Proche 1", true, email1, setEmail1, code1, setCode1, validation1, setValidation1, validating1, setValidating1, sendingCode1, setSendingCode1, 0)}
        {renderField("Proche 2", false, email2, setEmail2, code2, setCode2, validation2, setValidation2, validating2, setValidating2, sendingCode2, setSendingCode2, 1)}
        {renderField("Proche 3", false, email3, setEmail3, code3, setCode3, validation3, setValidation3, validating3, setValidating3, sendingCode3, setSendingCode3, 2)}
      </div>

      {hasDuplicateEmails && (
        <p className="text-xs text-red-400 mt-3 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Vous ne pouvez pas ajouter le meme email deux fois.
        </p>
      )}

      <div className="flex items-start gap-2 mt-4 p-3 bg-background/50 rounded-lg border border-border">
        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Entrez l&apos;email de vos proches. Un code de verification a 6 chiffres leur sera envoye par email pour confirmer leur accord.
        </p>
      </div>
    </div>
  )
}

export { FamilyEmailVerification }
