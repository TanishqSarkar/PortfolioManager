import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

interface SignResult {
  error?: string
  needsEmailConfirmation?: boolean
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<SignResult>
  signUp: (email: string, password: string, name: string) => Promise<SignResult>
  signOut: () => void
  resetPassword: (email: string) => Promise<SignResult>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function mapSupabaseUser(u: any): User | null {
  if (!u) return null
  return {
    id: u.id,
    email: u.email ?? '',
    name: u.user_metadata?.full_name || (u.email ? u.email.split('@')[0] : 'User'),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(mapSupabaseUser(data.session?.user))
      setIsLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user))
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const signUp: AuthContextValue['signUp'] = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) return { error: error.message }
    // If email confirmation is required in your Supabase project's Auth
    // settings, `data.session` is null right after sign-up.
    if (!data.session) return { needsEmailConfirmation: true }
    return {}
  }

  const signOut = () => {
    supabase.auth.signOut()
  }

  const resetPassword: AuthContextValue['resetPassword'] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) return { error: error.message }
    return {}
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
