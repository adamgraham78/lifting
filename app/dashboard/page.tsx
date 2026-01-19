'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import {
  getCurrentCycle,
  createTrainingCycle,
  completeCycle,
  restartCycle,
} from '@/lib/services/training-cycles'
import { getAllExercises, loadExercisesFromCSV } from '@/lib/services/exercises'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { TrainingCycle, Exercise } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [cycle, setCycle] = useState<TrainingCycle | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingCycle, setCreatingCycle] = useState(false)
  const [error, setError] = useState('')
  const [showStartModal, setShowStartModal] = useState(false)
  const [showRestartModal, setShowRestartModal] = useState(false)
  const [initialSets, setInitialSets] = useState<Record<string, number>>({})
  const [restarting, setRestarting] = useState(false)

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

      // Load exercises from CSV if needed
      const csvResult = await loadExercisesFromCSV(user.id)
      if (!csvResult.success && csvResult.error) {
        console.warn('Failed to load CSV exercises:', csvResult.error)
      }

      // Get all exercises
      const allExercises = await getAllExercises(user.id)
      setExercises(allExercises)

      // Create initial sets from default_sets
      const initialSetsMap: Record<string, number> = {}
      allExercises.forEach((ex) => {
        initialSetsMap[ex.id] = ex.defaultSets
      })
      setInitialSets(initialSetsMap)

      // Get current cycle
      const currentCycle = await getCurrentCycle(user.id)
      setCycle(currentCycle)

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setLoading(false)
    }
  }

  const handleStartTraining = async () => {
    if (!user) return

    setCreatingCycle(true)

    try {
      const newCycle = await createTrainingCycle(user.id, initialSets)
      setCycle(newCycle)
      setShowStartModal(false)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start training')
    } finally {
      setCreatingCycle(false)
    }
  }

  const handleCompleteCycle = async () => {
    if (!cycle || !user) return

    setRestarting(true)

    try {
      await completeCycle(cycle.id)
      setShowRestartModal(true)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete cycle')
    } finally {
      setRestarting(false)
    }
  }

  const handleRestartTraining = async () => {
    if (!cycle || !user) return

    setRestarting(true)

    try {
      const newCycle = await restartCycle(user.id, cycle.id)
      setCycle(newCycle)
      setShowRestartModal(false)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart training')
    } finally {
      setRestarting(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Lifting Tracker</h1>
          <p className="text-muted-foreground">6-day split, 5-week cycles</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {!cycle ? (
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to start training?</h2>
              <p className="text-muted-foreground mb-6">
                Click below to begin a new 5-week training cycle with your default set counts
              </p>

              <Button
                size="lg"
                onClick={() => setShowStartModal(true)}
                disabled={creatingCycle}
                className="w-full"
              >
                {creatingCycle ? 'Creating cycle...' : 'Start Training'}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Current Status */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Current Cycle</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Week</p>
                    <p className="text-3xl font-bold">{cycle.currentWeek}/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="text-lg font-semibold capitalize">{cycle.status}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 mb-6">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(cycle.currentWeek / 5) * 100}%` }}
                  />
                </div>

                {cycle.currentWeek === 5 && cycle.status === 'active' && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                    You've completed your final week! You can now restart training with increased volume.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/today" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Today's Workout
                  </Button>
                </Link>

                <Link href="/dashboard/week" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    This Week
                  </Button>
                </Link>

                <Link href="/dashboard/progression" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Progression
                  </Button>
                </Link>

                <Link href="/dashboard/adjust" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Adjust Sets
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Week Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Week Overview</h3>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((week) => (
                  <div
                    key={week}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      cycle.currentWeek === week
                        ? 'bg-primary/10 border border-primary'
                        : cycle.currentWeek > week
                          ? 'bg-green-500/10 border border-green-500'
                          : 'bg-muted'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">Week {week}</p>
                      {week === 4 && <p className="text-xs text-muted-foreground">Deload week</p>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {week === 1
                        ? 'Baseline'
                        : week === 2 || week === 3
                          ? '+1-2 sets'
                          : week === 4
                            ? '-1 set'
                            : '+2 sets'}
                    </p>
                  </div>
                ))}
              </div>

              {cycle.currentWeek === 5 && cycle.status === 'active' && (
                <Button
                  className="w-full mt-6"
                  onClick={handleCompleteCycle}
                  disabled={restarting}
                >
                  {restarting ? 'Completing...' : 'Complete Cycle & Prepare Restart'}
                </Button>
              )}
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Signed in as {user?.email}</p>
        </div>
      </div>

      {/* Start Training Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Start New Training Cycle</h3>

            <div className="bg-muted p-4 rounded-lg mb-6 max-h-64 overflow-y-auto">
              <p className="text-sm font-semibold mb-3">Default set counts by day:</p>
              <div className="space-y-2 text-sm">
                {[1, 2, 3, 4, 5, 6].map((day) => {
                  const dayExercises = exercises.filter((e) => e.dayNumber === day)
                  const dayLabel = [
                    'Push',
                    'Squat/Quad',
                    'Back/Deadlift',
                    'Upper B',
                    'Leg B',
                    'Accessory',
                  ][day - 1]

                  return (
                    <div key={day}>
                      <p className="font-semibold text-foreground">Day {day} - {dayLabel}</p>
                      <ul className="ml-2 space-y-1">
                        {dayExercises.map((ex) => (
                          <li key={ex.id} className="text-muted-foreground">
                            {ex.name}: {initialSets[ex.id]} sets
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Week 1 starts at these baseline sets. Weeks 2-5 will automatically adjust according to the progression plan.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowStartModal(false)}
                className="flex-1"
                disabled={creatingCycle}
              >
                Cancel
              </Button>
              <Button onClick={handleStartTraining} className="flex-1" disabled={creatingCycle}>
                {creatingCycle ? 'Creating...' : 'Start'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Restart Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Congratulations!</h3>

            <p className="text-muted-foreground mb-6">
              You've completed your 5-week training cycle! Ready to start a new cycle with increased volume?
            </p>

            <p className="text-sm bg-blue-500/10 border border-blue-500 text-blue-700 dark:text-blue-400 rounded p-3 mb-6">
              Your new baseline will be set to your Week 5 target sets, so you'll continue progressing from where you left off.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowRestartModal(false)}
                className="flex-1"
                disabled={restarting}
              >
                Not Now
              </Button>
              <Button
                onClick={handleRestartTraining}
                className="flex-1"
                disabled={restarting}
              >
                {restarting ? 'Starting...' : 'Start New Cycle'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
