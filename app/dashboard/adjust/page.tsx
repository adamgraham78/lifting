'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { getCurrentCycle, calculateTargetSets, setWeekOverride, removeWeekOverride } from '@/lib/services/training-cycles'
import { getAllExercises } from '@/lib/services/exercises'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { TrainingCycle, Exercise } from '@/types'

export default function AdjustPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [cycle, setCycle] = useState<TrainingCycle | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Track custom sets for each exercise/week
  const [customSets, setCustomSets] = useState<Record<string, Record<number, string>>>({})
  const [savingExId, setSavingExId] = useState<string | null>(null)

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

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setLoading(false)
    }
  }

  const getDefaultSets = (exercise: Exercise, week: 1 | 2 | 3 | 4 | 5): number => {
    const baselineSets = cycle?.baselineSets[exercise.id] || exercise.defaultSets
    return calculateTargetSets(baselineSets, week)
  }

  const handleSetChange = (exerciseId: string, week: number, value: string) => {
    setCustomSets((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [week]: value,
      },
    }))
  }

  const handleSaveOverride = async (exerciseId: string, week: number) => {
    if (!cycle) return

    const value = customSets[exerciseId]?.[week]
    if (!value) return

    const sets = parseInt(value, 10)
    if (isNaN(sets) || sets < 1) {
      setError('Please enter a valid number of sets (minimum 1)')
      return
    }

    setSavingExId(`${exerciseId}-${week}`)

    try {
      await setWeekOverride(cycle.id, user!.id, week as 1 | 2 | 3 | 4 | 5, exerciseId, sets)
      setError('')
      setSuccess(`Updated ${exercises.find((e) => e.id === exerciseId)?.name} to ${sets} sets for week ${week}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save override')
    } finally {
      setSavingExId(null)
    }
  }

  const handleRemoveOverride = async (exerciseId: string, week: number) => {
    if (!cycle) return

    setSavingExId(`${exerciseId}-${week}`)

    try {
      await removeWeekOverride(cycle.id, week as 1 | 2 | 3 | 4 | 5, exerciseId)
      setCustomSets((prev) => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          [week]: '',
        },
      }))
      setError('')
      setSuccess(`Removed override for ${exercises.find((e) => e.id === exerciseId)?.name} week ${week}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove override')
    } finally {
      setSavingExId(null)
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
          <h1 className="text-3xl font-bold mb-2">Adjust Weekly Sets</h1>
          <p className="text-muted-foreground">
            Override target set counts for any week. Default progression shown on the left.
          </p>
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
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="p-6">
              <h3 className="font-bold text-lg mb-4">{exercise.name}</h3>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((week) => {
                  const defaultSets = getDefaultSets(exercise, week as 1 | 2 | 3 | 4 | 5)
                  const weekLabel =
                    week === 1
                      ? 'Baseline'
                      : week === 2
                        ? '+1 set'
                        : week === 3
                          ? '+2 sets'
                          : week === 4
                            ? 'Deload (-1)'
                            : 'Final (+2)'

                  return (
                    <div key={week} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">Week {week}</p>
                        <p className="text-xs text-muted-foreground">{weekLabel}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Default</p>
                        <p className="font-bold">{defaultSets}</p>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Custom sets"
                          value={customSets[exercise.id]?.[week] || ''}
                          onChange={(e) => handleSetChange(exercise.id, week, e.target.value)}
                          className="w-20"
                          min="1"
                          disabled={savingExId === `${exercise.id}-${week}`}
                        />

                        {customSets[exercise.id]?.[week] ? (
                          <Button
                            size="sm"
                            onClick={() => handleSaveOverride(exercise.id, week)}
                            disabled={savingExId === `${exercise.id}-${week}`}
                          >
                            {savingExId === `${exercise.id}-${week}` ? '...' : 'Save'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRemoveOverride(exercise.id, week)}
                            disabled={savingExId === `${exercise.id}-${week}`}
                          >
                            {savingExId === `${exercise.id}-${week}` ? '...' : 'Clear'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-blue-500/10 border-blue-500">
          <h3 className="font-bold mb-2">How it works</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Default progression: W1 baseline, W2 +1, W3 +2, W4 -1 (deload), W5 +2</li>
            <li>• Enter a custom number to override the default for that week</li>
            <li>• Click &quot;Save&quot; to apply your custom set count</li>
            <li>• Click &quot;Clear&quot; to revert to the default progression</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
