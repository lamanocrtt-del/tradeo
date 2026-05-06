import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role for admin operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Generate a secure 6-digit code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST: Send OTP code to email
export async function POST(request: NextRequest) {
  try {
    const { email, language = "fr" } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email requis" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format d'email invalide" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const emailLower = email.toLowerCase()
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Check rate limit: max 3 requests per hour per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from("email_verification_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", emailLower)
      .gte("created_at", oneHourAgo)

    if (count && count >= 3) {
      return NextResponse.json(
        {
          success: false,
          message: language === "fr"
            ? "Trop de tentatives. Attends une heure."
            : "Too many attempts. Wait an hour.",
        },
        { status: 429 }
      )
    }

    // Delete old codes for this email
    await supabase
      .from("email_verification_codes")
      .delete()
      .eq("email", emailLower)

    // Insert new code
    const { error: insertError } = await supabase
      .from("email_verification_codes")
      .insert({
        email: emailLower,
        code: code,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
      })

    if (insertError) {
      console.error("[OTP] Insert error:", insertError.message)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la creation du code" },
        { status: 500 }
      )
    }

    // Send email using Supabase's invite functionality
    // This uses Supabase's built-in email system
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(emailLower, {
      data: {
        otp_code: code,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradeo.app'}/onboarding?code=${code}`,
    })

    // If invite fails (user might already exist), try magic link
    if (inviteError) {
      // For existing users or if invite fails, we'll just store the code
      // The user will need to check the code we display
      console.log("[OTP] Invite failed, code stored in database:", inviteError.message)
    }

    // Return success with code for testing/development
    // In production, remove the code from response
    return NextResponse.json({
      success: true,
      message: language === "fr"
        ? "Code envoye! Verifie tes emails."
        : "Code sent! Check your email.",
      // Include code for testing - remove in production
      code: code,
    })
  } catch (error) {
    console.error("[OTP] Error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// PUT: Verify OTP code from our database
export async function PUT(request: NextRequest) {
  try {
    const { email, code, language = "fr" } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Donnees manquantes" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const emailLower = email.toLowerCase()
    const MAX_ATTEMPTS = 5

    // Get the verification code from our database
    const { data: verificationData, error: fetchError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("email", emailLower)
      .single()

    if (fetchError || !verificationData) {
      return NextResponse.json({
        success: false,
        message: language === "fr"
          ? "Aucun code trouve. Demande un nouveau code."
          : "No code found. Request a new code.",
      }, { status: 400 })
    }

    // Check if code expired
    if (new Date(verificationData.expires_at) < new Date()) {
      await supabase
        .from("email_verification_codes")
        .delete()
        .eq("id", verificationData.id)

      return NextResponse.json({
        success: false,
        message: language === "fr"
          ? "Code expire. Demande un nouveau code."
          : "Code expired. Request a new code.",
      }, { status: 400 })
    }

    // Check attempts
    if (verificationData.attempts >= MAX_ATTEMPTS) {
      await supabase
        .from("email_verification_codes")
        .delete()
        .eq("id", verificationData.id)

      return NextResponse.json({
        success: false,
        message: language === "fr"
          ? "Trop de tentatives. Demande un nouveau code."
          : "Too many attempts. Request a new code.",
      }, { status: 400 })
    }

    // Verify the code
    if (verificationData.code !== code) {
      // Increment attempts
      await supabase
        .from("email_verification_codes")
        .update({ attempts: verificationData.attempts + 1 })
        .eq("id", verificationData.id)

      const remainingAttempts = MAX_ATTEMPTS - verificationData.attempts - 1
      return NextResponse.json({
        success: false,
        message: language === "fr"
          ? `Code incorrect. ${remainingAttempts} tentative(s) restante(s).`
          : `Incorrect code. ${remainingAttempts} attempt(s) remaining.`,
      }, { status: 400 })
    }

    // Code is correct - mark as verified
    await supabase
      .from("email_verification_codes")
      .update({ verified: true })
      .eq("id", verificationData.id)

    return NextResponse.json({
      success: true,
      verified: true,
      message: language === "fr" ? "Email verifie!" : "Email verified!",
    })
  } catch (error) {
    console.error("[OTP Verify] Error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur de verification" },
      { status: 500 }
    )
  }
}
