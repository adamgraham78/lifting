'use client'

import { useState, useEffect, useCallback } from 'react'
import { Exercise, MuscleGroup } from '@/types'
import { getExercises, ExerciseFilters } from '@/lib/services/exercises'
import { getMuscleGroups } from '@/lib/services/muscle-groups'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dumbbell, Plus, Search } from 'lucide-react'

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ExerciseFilters>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [exercisesData, muscleGroupsData] = await Promise.all([
        getExercises(filters),
        getMuscleGroups(),
      ])
      setExercises(exercisesData)
      setMuscleGroups(muscleGroupsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getMuscleGroupName = (id: string) => {
    return muscleGroups.find(mg => mg.id === id)?.name || 'Unknown'
  }

  const equipmentOptions = [
    { value: '', label: 'All Equipment' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'dumbbell', label: 'Dumbbell' },
    { value: 'cable', label: 'Cable' },
    { value: 'machine', label: 'Machine' },
    { value: 'bodyweight', label: 'Bodyweight' },
  ]

  const muscleOptions = [
    { value: '', label: 'All Muscles' },
    ...muscleGroups.map(mg => ({ value: mg.id, label: mg.name.toUpperCase() })),
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-display text-accent mb-2">EXERCISE LIBRARY</h1>
            <p className="text-foreground-secondary">
              {exercises.length} exercises available
            </p>
          </div>
          <Button variant="primary" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Exercise
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                placeholder="Search exercises..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary" />
            </div>
            <Select
              options={muscleOptions}
              value={filters.primaryMuscle || ''}
              onChange={(e) => setFilters({ ...filters, primaryMuscle: e.target.value || undefined })}
            />
            <Select
              options={equipmentOptions}
              value={filters.equipment || ''}
              onChange={(e) => setFilters({ ...filters, equipment: e.target.value || undefined })}
            />
          </div>
        </Card>

        {/* Exercise List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground-secondary">Loading exercises...</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">No exercises found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map(exercise => (
              <Card key={exercise.id} hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-accent uppercase font-medium">
                      {getMuscleGroupName(exercise.primaryMuscle)}
                    </p>
                  </div>
                  <div className="text-xs text-foreground-tertiary bg-background-tertiary px-2 py-1 rounded">
                    {exercise.equipment}
                  </div>
                </div>

                {exercise.secondaryMuscles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-foreground-tertiary mb-1">Secondary:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondaryMuscles.map(muscleId => (
                        <span
                          key={muscleId}
                          className="text-xs bg-background text-foreground-secondary px-2 py-0.5 rounded"
                        >
                          {getMuscleGroupName(muscleId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {exercise.notes && (
                  <p className="text-sm text-foreground-secondary line-clamp-2">
                    {exercise.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
