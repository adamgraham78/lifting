'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { getCurrentCycle } from '@/lib/services/training-cycles'
import { getExercisesForDay } from '@/lib/services/exercises'
import {
  createOrGetWorkoutSession,
  getWorkoutSets,
  createWorkoutSets,
  logWorkoutSet,
  updateSessionStatus,
} from '@/lib/services/workouts'
import { getWeekTargetSets } from '@/lib/services/training-cycles'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { TrainingCycle, Exercise, WorkoutSession, WorkoutSet } from '@/types'

export default function TodayPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [cycle, setCycle] = useState<TrainingCycle | null>(null)
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [sets, setSets] = useState<Record<string, WorkoutSet[]>>({})
  const [targetSetsMap, setTargetSetsMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggingSet, setLoggingSet] = useState<string | null>(null)

  // Form state for logging sets
  const [formData, setFormData] = useState<
    Record<string, { reps: string; weight: string }>
  >({})

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

      // Get current cycle
      const currentCycle = await getCurrentCycle(user.id)
      if (!currentCycle) {
        router.push('/dashboard')
        return
      }

      setCycle(currentCycle)

      // Get today's date to determine day of week (simplified: use cycle/week logic)
      // For MVP, we'll let user select the day

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setLoading(false)
    }
  }

  const handleSelectDay = async (dayNumber: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!user || !cycle) return

    try {
      setError('')
      setLoading(true)

      // Create or get today's session
      const workoutSession = await createOrGetWorkoutSession(user.id, cycle.id, cycle.currentWeek, dayNumber)
      setSession(workoutSession)

      // Get exercises for this day
      const dayExercises = await getExercisesForDay(user.id, dayNumber)
      setExercises(dayExercises)

      // Calculate target sets for each exercise
      const targetMap: Record<string, number> = {}
      for (const ex of dayExercises) {
        const targetSets = await getWeekTargetSets(
          cycle.id,
          cycle.currentWeek,
          ex.id,
          cycle.baselineSets[ex.id] || ex.defaultSets
        )
        targetMap[ex.id] = targetSets
      }
      setTargetSetsMap(targetMap)

      // Get existing workout sets or create them
      const existingSets = await getWorkoutSets(workoutSession.id)

      if (existingSets.length === 0) {
        // Create sets for this workout
        const allSets: WorkoutSet[] = []
        for (const ex of dayExercises) {
          const targetSets = targetMap[ex.id]
          const createdSets = await createWorkoutSets(user.id, workoutSession.id, ex.id, 8, targetSets)
          allSets.push(...createdSets)
        }

        // Group by exercise
        const groupedSets: Record<string, WorkoutSet[]> = {}
        allSets.forEach((set) => {
          if (!groupedSets[set.exerciseId]) {
            groupedSets[set.exerciseId] = []
          }
          groupedSets[set.exerciseId].push(set)
        })
        setSets(groupedSets)
      } else {
        // Group existing sets by exercise
        const groupedSets: Record<string, WorkoutSet[]> = {}
        existingSets.forEach((set) => {
          if (!groupedSets[set.exerciseId]) {
            groupedSets[set.exerciseId] = []
          }
          groupedSets[set.exerciseId].push(set)
        })
        setSets(groupedSets)
      }

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workout')
      setLoading(false)
    }
  }

  const handleLogSet = async (setId: string) => {
    if (!formData[setId]) return

    const { reps, weight } = formData[setId]

    if (!reps) {
      setError('Please enter reps for this set')
      return
    }

    setLoggingSet(setId)

    try {
      const actualReps = parseInt(reps, 10)
      const weightNum = weight ? parseFloat(weight) : undefined

      await logWorkoutSet(setId, actualReps, weightNum)

      // Update local state
      setSets((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((exId) => {
          updated[exId] = updated[exId].map((s) =>
            s.id === setId ? { ...s, actualReps, weight: weightNum } : s
          )
        })
        return updated
      })

      // Clear form
      setFormData((prev) => ({
        ...prev,
        [setId]: { reps: '', weight: '' },
      }))

      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log set')
    } finally {
      setLoggingSet(null)
    }
  }

  const handleCompleteWorkout = async () => {
    if (!session) return

    try {
      await updateSessionStatus(session.id, 'completed')
      setSession({ ...session, status: 'completed' })
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete workout')
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
            <p className="text-muted-foreground mb-4">No active training cycle. Start one first.</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-background/80">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard">
            <Button variant="secondary" className="mb-4">
              ← Back
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Select Today's Day</h1>
          <p className="text-muted-foreground mb-6">
            Week {cycle.currentWeek} of your cycle - which day are you training?
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((day) => (
              <Button
                key={day}
                variant="secondary"
                className="h-20"
                onClick={() => handleSelectDay(day as 1 | 2 | 3 | 4 | 5 | 6)}
              >
                <div className="text-center">
                  <p className="font-bold">Day {day}</p>
                  {day === 1 && <p className="text-xs">Push</p>}
                  {day === 2 && <p className="text-xs">Squat</p>}
                  {day === 3 && <p className="text-xs">Back</p>}
                  {day === 4 && <p className="text-xs">Upper B</p>}
                  {day === 5 && <p className="text-xs">Leg B</p>}
                  {day === 6 && <p className="text-xs">Accessory</p>}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-background/80">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard">
          <Button variant="secondary" className="mb-4">
            ← Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Today's Workout</h1>
          <p className="text-muted-foreground">
            Week {session.week}, Day {session.dayNumber} • {session.status}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {exercises.map((exercise) => {
            const exSets = sets[exercise.id] || []
            const targetSets = targetSetsMap[exercise.id] || 0

            return (
              <Card key={exercise.id} className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">{exercise.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {targetSets} sets × 8 reps • {exercise.equipment}
                  </p>
                </div>

                <div className="space-y-3">
                  {exSets.length === 0 ? (
                    <p className="text-muted-foreground">No sets loaded</p>
                  ) : (
                    exSets.map((set, idx) => (
                      <div key={set.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold">Set {idx + 1}</p>
                          {set.completedAt && (
                            <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                              ✓ Logged
                            </span>
                          )}
                        </div>

                        {set.actualReps === undefined ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Reps"
                              value={formData[set.id]?.reps || ''}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [set.id]: {
                                    ...prev[set.id],
                                    reps: e.target.value,
                                  },
                                }))
                              }
                              className="w-24"
                              min="1"
                            />

                            <Input
                              type="number"
                              placeholder="Weight (lbs)"
                              value={formData[set.id]?.weight || ''}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [set.id]: {
                                    ...prev[set.id],
                                    weight: e.target.value,
                                  },
                                }))
                              }
                              className="flex-1"
                              step="2.5"
                            />

                            <Button
                              size="sm"
                              onClick={() => handleLogSet(set.id)}
                              disabled={loggingSet === set.id}
                            >
                              {loggingSet === set.id ? '...' : 'Log'}
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 bg-background rounded">
                            <p className="text-sm">
                              <span className="font-semibold">{set.actualReps}</span> reps
                              {set.weight && (
                                <>
                                  {' '}
                                  at <span className="font-semibold">{set.weight} lbs</span>
                                </>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {session.status !== 'completed' && (
          <div className="mt-8">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCompleteWorkout}
              disabled={Object.values(sets).flat().some((s) => !s.completedAt)}
            >
              Complete Workout
            </Button>
            {Object.values(sets).flat().some((s) => !s.completedAt) && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Log all sets before completing
              </p>
            )}
          </div>
        )}

        {session.status === 'completed' && (
          <Card className="mt-8 p-6 bg-green-500/10 border border-green-500">
            <p className="text-green-700 dark:text-green-400 font-semibold text-center">
              ✓ Workout completed!
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
