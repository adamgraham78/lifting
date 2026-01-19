'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { getCurrentCycle } from '@/lib/services/training-cycles'
import { getAllExercises } from '@/lib/services/exercises'
import { getCycleSessions, getWorkoutSets } from '@/lib/services/workouts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { TrainingCycle, Exercise, WorkoutSession, WorkoutSet } from '@/types'

interface SetData {
  week: number
  dayNumber: number
  reps: number | undefined
  weight: number | undefined
}

export default function ProgressionPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [cycle, setCycle] = useState<TrainingCycle | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [setsByExercise, setSetsByExercise] = useState<Record<string, SetData[]>>({})
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

      const allExercises = await getAllExercises(user.id)
      setExercises(allExercises)

      const allSessions = await getCycleSessions(currentCycle.id)
      setSessions(allSessions)

      // Get all sets and group by exercise
      const allSets: Record<string, SetData[]> = {}

      for (const session of allSessions) {
        const sessionSets = await getWorkoutSets(session.id)

        for (const set of sessionSets) {
          if (!allSets[set.exerciseId]) {
            allSets[set.exerciseId] = []
          }

          allSets[set.exerciseId].push({
            week: session.week,
            dayNumber: session.dayNumber,
            reps: set.actualReps,
            weight: set.weight,
          })
        }
      }

      setSetsByExercise(allSets)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progression')
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
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="secondary" className="mb-4">
            ← Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Cycle Progression</h1>
          <p className="text-muted-foreground">Track your performance throughout the cycle</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {exercises.map((exercise) => {
            const exerciseSets = setsByExercise[exercise.id] || []

            if (exerciseSets.length === 0) {
              return (
                <Card key={exercise.id} className="p-6 opacity-50">
                  <h3 className="font-bold mb-2">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground">No workouts logged yet</p>
                </Card>
              )
            }

            // Group by week
            const byWeek: Record<number, SetData[]> = {}
            exerciseSets.forEach((set) => {
              if (!byWeek[set.week]) {
                byWeek[set.week] = []
              }
              byWeek[set.week].push(set)
            })

            return (
              <Card key={exercise.id} className="p-6">
                <h3 className="font-bold text-lg mb-4">{exercise.name}</h3>

                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((week) => {
                    const weekSets = byWeek[week] || []

                    if (weekSets.length === 0) {
                      return (
                        <div key={week} className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-semibold">Week {week}</p>
                          <p className="text-xs text-muted-foreground">Not started</p>
                        </div>
                      )
                    }

                    const completedSets = weekSets.filter((s) => s.reps !== undefined)

                    return (
                      <div key={week} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold">Week {week}</p>
                            <p className="text-xs text-muted-foreground">
                              {completedSets.length}/{weekSets.length} sets logged
                            </p>
                          </div>

                          {completedSets.length === weekSets.length && (
                            <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                              Complete
                            </span>
                          )}
                        </div>

                        {completedSets.length > 0 && (
                          <div className="text-xs space-y-1">
                            <p>
                              <span className="text-muted-foreground">Avg reps:</span>{' '}
                              <span className="font-semibold">
                                {(
                                  completedSets.reduce((sum, s) => sum + (s.reps || 0), 0) / completedSets.length
                                ).toFixed(1)}
                              </span>
                            </p>
                            {completedSets.some((s) => s.weight) && (
                              <p>
                                <span className="text-muted-foreground">Avg weight:</span>{' '}
                                <span className="font-semibold">
                                  {(
                                    completedSets.reduce((sum, s) => sum + (s.weight || 0), 0) / completedSets.length
                                  ).toFixed(1)}{' '}
                                  lbs
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
