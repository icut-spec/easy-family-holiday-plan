/**
 * src/lib/auth.ts
 * Thin, typed wrapper around Supabase Auth.
 * All functions gracefully handle the offline/no-config case (supabase === null).
 */
import { supabase } from './supabase'
import type { Session, User, AuthError } from '@supabase/supabase-js'

export type { Session, User }

export interface AuthResult {
  user: User | null
  error: string | null
}

// ─── Sign-up ────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  if (!supabase) return { user: null, error: 'Offline mode: Supabase not configured.' }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  return {
    user: data.user ?? null,
    error: formatError(error),
  }
}

// ─── Sign-in ─────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { user: null, error: 'Offline mode: Supabase not configured.' }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  return {
    user: data.user ?? null,
    error: formatError(error),
  }
}

// ─── OAuth (Google) ──────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Offline mode: Supabase not configured.' }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // After OAuth redirect, Supabase will redirect back to the app root
      redirectTo: window.location.origin + window.location.pathname,
    },
  })

  return { error: formatError(error) }
}

// ─── Sign-out ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<{ error: string | null }> {
  if (!supabase) return { error: null }

  const { error } = await supabase.auth.signOut()
  return { error: formatError(error) }
}

// ─── Session ─────────────────────────────────────────────────────────────────

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null

  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser(): Promise<User | null> {
  if (!supabase) return null

  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

// ─── Auth state listener ─────────────────────────────────────────────────────

type AuthChangeCallback = (user: User | null) => void

export function onAuthChange(callback: AuthChangeCallback): () => void {
  if (!supabase) return () => {}

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })

  // Return unsubscribe function
  return () => data.subscription.unsubscribe()
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatError(error: AuthError | null): string | null {
  if (!error) return null
  // Surface friendly messages for common cases
  if (error.message.includes('already registered') || error.message.includes('already exists')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (error.message.includes('Email not confirmed')) {
    return 'Please confirm your email address before logging in.'
  }
  if (error.message.includes('Password should be at least')) {
    return 'Password must be at least 8 characters.'
  }
  return error.message
}
