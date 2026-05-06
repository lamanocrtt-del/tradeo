import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const MAX_ATTEMPTS = 5

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 })
    }

    const supabase = await createClient()

    // Recuperer le code de verification
    const { data: verificationData, error: fetchError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (fetchError || !verificationData) {
      return NextResponse.json({ 
        success: false, 
        error: "Aucun code trouve pour cet email. Veuillez demander un nouveau code." 
      }, { status: 400 })
    }

    // Verifier si le code a expire
    if (new Date(verificationData.expires_at) < new Date()) {
      await supabase
        .from("email_verification_codes")
        .delete()
        .eq("id", verificationData.id)

      return NextResponse.json({ 
        success: false, 
        error: "Le code a expire. Veuillez demander un nouveau code." 
      }, { status: 400 })
    }

    // Verifier le nombre de tentatives
    if (verificationData.attempts >= MAX_ATTEMPTS) {
      await supabase
        .from("email_verification_codes")
        .delete()
        .eq("id", verificationData.id)

      return NextResponse.json({ 
        success: false, 
        error: "Trop de tentatives. Veuillez demander un nouveau code." 
      }, { status: 400 })
    }

    // Verifier le code
    if (verificationData.code !== code) {
      // Incrementer le nombre de tentatives
      await supabase
        .from("email_verification_codes")
        .update({ attempts: verificationData.attempts + 1 })
        .eq("id", verificationData.id)

      const remainingAttempts = MAX_ATTEMPTS - verificationData.attempts - 1
      return NextResponse.json({ 
        success: false, 
        error: `Code incorrect. ${remainingAttempts} tentative(s) restante(s).` 
      }, { status: 400 })
    }

    // Code correct - marquer comme verifie
    await supabase
      .from("email_verification_codes")
      .update({ verified: true })
      .eq("id", verificationData.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in verify-email-code:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
