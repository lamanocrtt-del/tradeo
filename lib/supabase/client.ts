import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern to avoid multiple GoTrueClient instances
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create new instance
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  // Client-side: use singleton with persistent storage
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // Use localStorage for persistent sessions (survives browser close)
          persistSession: true,
          // Auto refresh token before expiry
          autoRefreshToken: true,
          // Detect session from URL (for OAuth callbacks)
          detectSessionInUrl: true,
          // Storage key for the session
          storageKey: 'tradeo-supabase-auth',
        },
      }
    )
  }

  return client
}
