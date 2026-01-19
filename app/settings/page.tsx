'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { updatePassword, updateEmail } from '@/lib/services/auth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Email update
  const [newEmail, setNewEmail] = useState('')
  const [updatingEmail, setUpdatingEmail] = useState(false)

  // Password update
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  // Logout
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newEmail) {
      setError('Please enter a new email')
      return
    }

    setUpdatingEmail(true)

    try {
      const result = await updateEmail(newEmail)

      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess('Email update initiated. Check your new email for confirmation.')
        setNewEmail('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email')
    } finally {
      setUpdatingEmail(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setUpdatingPassword(true)

    try {
      const result = await updatePassword(newPassword)

      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess('Password updated successfully')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    setError('')

    try {
      await signOut()
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
      setSigningOut(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-background/80">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard">
          <Button variant="secondary" className="mb-4">
            ← Back to Dashboard
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-700 dark:text-green-400 rounded-lg p-4 mb-6">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Account Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-mono text-sm bg-muted p-2 rounded">{user?.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">User ID</p>
                <p className="font-mono text-xs bg-muted p-2 rounded text-muted-foreground">{user?.id}</p>
              </div>
            </div>
          </Card>

          {/* Update Email */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Change Email</h2>

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <Input
                type="email"
                placeholder="New email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={updatingEmail}
              />

              <Button type="submit" disabled={updatingEmail} className="w-full">
                {updatingEmail ? 'Updating...' : 'Update Email'}
              </Button>

              <p className="text-xs text-muted-foreground">
                A confirmation link will be sent to your new email address.
              </p>
            </form>
          </Card>

          {/* Update Password */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={updatingPassword}
              />

              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={updatingPassword}
              />

              <Button type="submit" disabled={updatingPassword} className="w-full">
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </Button>

              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long.
              </p>
            </form>
          </Card>

          {/* Sign Out */}
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <h2 className="text-xl font-bold mb-4 text-destructive">Sign Out</h2>

            <p className="text-muted-foreground mb-4">
              You will be signed out and redirected to the login page.
            </p>

            <Button
              variant="danger"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full"
            >
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
