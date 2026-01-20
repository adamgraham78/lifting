'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setLoading(false)
          return
        }

        if (data.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            createdAt: new Date(data.session.user.created_at),
          })
        }

        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          createdAt: new Date(session.user.created_at),
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      throw error
    }

    // Update user state immediately to avoid race condition with onAuthStateChange
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at),
      })
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      throw error
    }

    // Update user state immediately if session is available (no email confirmation required)
    if (data.user && data.session) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at),
      })
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
