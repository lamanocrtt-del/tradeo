import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createClient } from "@/lib/supabase/server"

// Configurer le transporteur SMTP Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const supabase = await createClient()
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Supprimer les anciens codes pour cet email
    await supabase
      .from("email_verification_codes")
      .delete()
      .eq("email", email.toLowerCase())

    // Creer un nouveau code
    const { error: insertError } = await supabase
      .from("email_verification_codes")
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0
      })

    if (insertError) {
      console.error("Error inserting code:", insertError)
      return NextResponse.json({ error: "Erreur lors de la creation du code" }, { status: 500 })
    }

    // Envoyer l'email avec Nodemailer/Gmail
    try {
      await transporter.sendMail({
        from: `Tradeo <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Votre code de verification Tradeo",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="480" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2d2d44;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #2d2d44;">
                      <div style="display: inline-flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #a855f7, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 24px; font-weight: bold; color: white;">T</span>
                        </div>
                        <span style="font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Tradeo</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #ffffff; text-align: center;">
                        Code de verification
                      </h1>
                      <p style="margin: 0 0 24px; font-size: 15px; color: #a1a1aa; text-align: center; line-height: 1.6;">
                        Un membre de votre famille souhaite vous ajouter a son abonnement Tradeo Family. Voici votre code de verification :
                      </p>
                      
                      <!-- Code Box -->
                      <div style="background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: monospace;">
                          ${code}
                        </span>
                      </div>
                      
                      <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                        Ce code expire dans <strong style="color: #a855f7;">10 minutes</strong>
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center;">
                        Si vous n'avez pas demande ce code, ignorez cet email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: rgba(0,0,0,0.2); border-top: 1px solid #2d2d44;">
                      <p style="margin: 0; font-size: 12px; color: #52525b; text-align: center; line-height: 1.6;">
                        Cet email a ete envoye par Tradeo.<br>
                        Apprenez le trading de maniere ludique et securisee.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
      })

      return NextResponse.json({ success: true })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in send-verification-email:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
