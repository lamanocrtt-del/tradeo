import { NextRequest, NextResponse } from "next/server"

// POST /api/add-coins
// Body: { userId: string, purchaseToken: string, productId: string, coins: number }
//
// In production you would:
//   1. Verify the purchaseToken with Google Play Developer API or RevenueCat webhook
//   2. Check the token hasn't already been redeemed (idempotency)
//   3. Credit the user in your database
//
// For now this returns success so the client can credit locally,
// and you wire up real server-side validation when your backend is ready.

interface AddCoinsBody {
  userId: string
  purchaseToken: string
  productId: string
  coins: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AddCoinsBody

    if (!body.userId || !body.purchaseToken || !body.productId || !body.coins) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, purchaseToken, productId, coins" },
        { status: 400 },
      )
    }

    if (typeof body.coins !== "number" || body.coins <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid coins amount" },
        { status: 400 },
      )
    }

    // ── TODO: Server-side verification ──
    // 1. Call RevenueCat REST API:
    //    GET https://api.revenuecat.com/v1/receipts
    //    with header Authorization: Bearer <REVENUECAT_API_KEY>
    //    and body { "app_user_id": body.userId, "fetch_token": body.purchaseToken }
    //
    // 2. Or call Google Play Developer API:
    //    GET https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{pkg}/purchases/products/{productId}/tokens/{token}
    //
    // 3. Check that the purchase is valid and not already consumed
    // 4. Persist to your database (Supabase, etc.)

    console.log("[add-coins] Credit request:", {
      userId: body.userId,
      productId: body.productId,
      coins: body.coins,
      purchaseToken: body.purchaseToken.substring(0, 20) + "...",
    })

    return NextResponse.json({
      success: true,
      credited: body.coins,
      message: `${body.coins} pieces creditees avec succes`,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
