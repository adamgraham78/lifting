'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { getCurrentCycle } from '@/lib/services/training-cycles'
import { getWeekSessions } from '@/lib/services/workouts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { TrainingCycle, WorkoutSession } from '@/types'

const dayLabels = ['', 'Push', 'Squat/Quad', 'Back/Deadlift', 'Upper B', 'Leg B', 'Accessory']
const dayColors = [
  '',
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-red-500 to-red-600',
  'from-green-500 to-green-600',
  'from-pink-500 to-pink-600',
  'from-yellow-500 to-yellow-600',
]

export default function WeekPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [cycle, setCycle] = useState<TrainingCycle | null>(null)
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (!authLoading && user) {
      loadData()
    }
  }, [authLoading, user, router])

  const loadData = async () => {
    if (!user) return

    try {
      setError('')

      const currentCycle = await getCurrentCycle(user.id)
      if (!currentCycle) {
        router.push('/dashboard')
        return
      }

      setCycle(currentCycle)

      const weekSessions = await getWeekSessions(currentCycle.id, currentCycle.currentWeek)
      setSessions(weekSessions)

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load week data')
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!cycle) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard">
            <Button variant="secondary" className="mb-4">
              ← Back
            </Button>
          </Link>

          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No active training cycle.</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-background/80">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard">
          <Button variant="secondary" className="mb-4">
            ← Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Week {cycle.currentWeek} Overview</h1>
          <p className="text-muted-foreground">
            {cycle.currentWeek === 4
              ? 'Deload week - reduced volume to recover'
              : cycle.currentWeek === 5
                ? 'Final week - peak week before restart'
                : 'Progressive overload week'}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((dayNumber) => {
            const session = sessions.find((s) => s.dayNumber === dayNumber)
            const statusColor = session
              ? session.status === 'completed'
                ? 'bg-green-500/10 border-green-500'
                : session.status === 'in_progress'
                  ? 'bg-blue-500/10 border-blue-500'
                  : 'bg-muted'
              : 'bg-muted'

            const statusIcon = session
              ? session.status === 'completed'
                ? '✓'
                : session.status === 'in_progress'
                  ? '⏱'
                  : '○'
              : '○'

            return (
              <Card key={dayNumber} className={`p-4 border ${statusColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">
                      Day {dayNumber} • {dayLabels[dayNumber]}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {session ? session.status : 'Not started'}
                    </p>
                  </div>

                  <div className="text-center mr-4">
                    <p className="text-2xl font-bold">{statusIcon}</p>
                  </div>

                  {session ? (
                    <Link href="/dashboard/today">
                      <Button size="sm" variant="secondary">
                        View
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard/today">
                      <Button size="sm">Start</Button>
                    </Link>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        <Card className="mt-8 p-6">
          <h3 className="font-bold mb-4">Week Summary</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Planned</p>
              <p className="text-2xl font-bold">{sessions.filter((s) => s.status === 'planned').length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{sessions.filter((s) => s.status === 'in_progress').length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{sessions.filter((s) => s.status === 'completed').length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
