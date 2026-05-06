"use server"

import { createClient } from "@/lib/supabase/server"

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
      },
    })

    if (error) {
      console.error("[v0] Server signUp error:", error.message)
      if (error.message.includes("already registered")) {
        return { success: false, error: "EMAIL_EXISTS" }
      }
      return { success: false, error: error.message }
    }

    if (data?.user) {
      return { success: true, userId: data.user.id }
    }

    return { success: false, error: "NO_USER_RETURNED" }
  } catch (err) {
    console.error("[v0] Server signUp exception:", err)
    return { success: false, error: "SERVER_ERROR" }
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      console.error("[v0] Server signIn error:", error.message)
      return { success: false, error: error.message }
    }

    if (data?.user) {
      return { success: true, userId: data.user.id }
    }

    return { success: false, error: "NO_USER_RETURNED" }
  } catch (err) {
    console.error("[v0] Server signIn exception:", err)
    return { success: false, error: "SERVER_ERROR" }
  }
}
