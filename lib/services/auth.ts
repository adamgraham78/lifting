import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export async function signUp(email: string, password: string): Promise<{ user: User; error: null } | { user: null; error: Error }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return { user: null, error }
    }

    if (!data.user) {
      return { user: null, error: new Error('User creation failed') }
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at),
      },
      error: null,
    }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error : new Error('Sign up failed') }
  }
}

export async function signIn(email: string, password: string): Promise<{ user: User; error: null } | { user: null; error: Error }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error }
    }

    if (!data.user) {
      return { user: null, error: new Error('Sign in failed') }
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at),
      },
      error: null,
    }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error : new Error('Sign in failed') }
  }
}

export async function signOut(): Promise<{ error: null } | { error: Error }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error }
    }

    return { error: null }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Sign out failed') }
  }
}

export async function resetPassword(email: string): Promise<{ error: null } | { error: Error }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { error }
    }

    return { error: null }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Password reset failed') }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return null
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      createdAt: new Date(data.user.created_at),
    }
  } catch (error) {
    return null
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return null
    }

    return data.session
  } catch (error) {
    return null
  }
}

export async function updatePassword(newPassword: string): Promise<{ error: null } | { error: Error }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error }
    }

    return { error: null }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Password update failed') }
  }
}

export async function updateEmail(newEmail: string): Promise<{ error: null } | { error: Error }> {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) {
      return { error }
    }

    return { error: null }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Email update failed') }
  }
}
