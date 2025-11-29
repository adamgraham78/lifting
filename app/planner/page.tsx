'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Calendar, Dumbbell, ArrowRight, Zap, Check, Plus, X, Trash2, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getExercises } from '@/lib/services/exercises'
import { createMesocycleTemplate, CreateTemplateData } from '@/lib/services/mesocycle-templates'
import { getMuscleGroups } from '@/lib/services/muscle-groups'
import { Exercise, MuscleGroup, MuscleGroupPriority } from '@/types'

// Starter templates
const starterTemplates = [
  {
    id: 'ppl',
    name: 'Push/Pull/Legs',
    description: 'Classic 6-day split for maximum volume and frequency',
    daysPerWeek: 6,
    durationWeeks: 6,
    level: 'Intermediate',
    focus: 'Hypertrophy',
  },
  {
    id: 'upper-lower',
    name: 'Upper/Lower Split',
    description: '4-day split balancing upper and lower body training',
    daysPerWeek: 4,
    durationWeeks: 6,
    level: 'Beginner',
    focus: 'Balanced',
  },
  {
    id: 'full-body',
    name: 'Full Body 3-Day',
    description: 'Time-efficient full body workouts for busy schedules',
    daysPerWeek: 3,
    durationWeeks: 6,
    level: 'Beginner',
    focus: 'Strength',
  },
  {
    id: 'big-arms',
    name: 'Big Arms Specialization',
    description: '5-day arm specialization with maintenance for other muscles',
    daysPerWeek: 5,
    durationWeeks: 6,
    level: 'Advanced',
    focus: 'Arms',
    isSpecialization: true,
  },
]

type PlannerStep = 'config' | 'priorities' | 'schedule'

interface DayExercise {
  exerciseId: string
  exercise: Exercise
  sets: number
  repRangeMin: number
  repRangeMax: number
  restSeconds: number
}

interface Day {
  dayNumber: number
  name: string
  muscleGroupIds: string[]
  exercises: DayExercise[]
}

export default function PlannerPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'template' | 'custom'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [step, setStep] = useState<PlannerStep>('config')
  const [customConfig, setCustomConfig] = useState({
    name: '',
    daysPerWeek: 4,
    durationWeeks: 6,
  })

  // Muscle priority state
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [musclePriorities, setMusclePriorities] = useState<Map<string, MuscleGroupPriority>>(new Map())

  // Exercise and schedule state
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)

  // Schedule state
  const [days, setDays] = useState<Day[]>([])
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [saving, setSaving] = useState(false)

  // Load muscle groups when moving to priorities step
  useEffect(() => {
    if (step === 'priorities' && muscleGroups.length === 0) {
      loadMuscleGroups()
    }
  }, [step])

  // Load exercises when moving to schedule step
  useEffect(() => {
    if (step === 'schedule' && availableExercises.length === 0) {
      loadExercises()
    }
  }, [step])

  // Initialize days when moving to schedule step
  useEffect(() => {
    if (step === 'schedule' && days.length === 0) {
      const initialDays: Day[] = []
      for (let i = 1; i <= customConfig.daysPerWeek; i++) {
        initialDays.push({
          dayNumber: i,
          name: `Day ${i}`,
          muscleGroupIds: [],
          exercises: [],
        })
      }
      setDays(initialDays)
    }
  }, [step, customConfig.daysPerWeek])

  const loadMuscleGroups = async () => {
    setLoading(true)
    try {
      const groups = await getMuscleGroups()
      setMuscleGroups(groups)
      // Initialize all to medium priority
      const priorities = new Map<string, MuscleGroupPriority>()
      groups.forEach(group => priorities.set(group.id, 'medium'))
      setMusclePriorities(priorities)
    } catch (error) {
      console.error('Failed to load muscle groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadExercises = async () => {
    setLoading(true)
    try {
      const exercises = await getExercises()
      setAvailableExercises(exercises)
    } catch (error) {
      console.error('Failed to load exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleStartTemplate = () => {
    if (selectedTemplate) {
      alert(`Starting ${starterTemplates.find(t => t.id === selectedTemplate)?.name}! (Template builder coming soon)`)
    }
  }

  const handleConfigNext = () => {
    if (customConfig.name.trim()) {
      setStep('priorities')
    }
  }

  const handlePrioritiesNext = () => {
    setStep('schedule')
  }

  const handlePriorityChange = (muscleGroupId: string, priority: MuscleGroupPriority) => {
    setMusclePriorities(prev => new Map(prev).set(muscleGroupId, priority))
  }

  const addMuscleGroupToDay = (dayNumber: number, muscleGroupId: string) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber && !day.muscleGroupIds.includes(muscleGroupId)
          ? { ...day, muscleGroupIds: [...day.muscleGroupIds, muscleGroupId] }
          : day
      )
    )
  }

  const removeMuscleGroupFromDay = (dayNumber: number, muscleGroupId: string) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? { ...day, muscleGroupIds: day.muscleGroupIds.filter(id => id !== muscleGroupId) }
          : day
      )
    )
  }

  const addExerciseToDay = (dayNumber: number, exerciseId: string) => {
    const exercise = availableExercises.find(e => e.id === exerciseId)
    if (!exercise) return

    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                {
                  exerciseId,
                  exercise,
                  sets: 3,
                  repRangeMin: 8,
                  repRangeMax: 12,
                  restSeconds: 90,
                },
              ],
            }
          : day
      )
    )
  }

  const removeExerciseFromDay = (dayNumber: number, exerciseId: string) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exercises: day.exercises.filter(e => e.exerciseId !== exerciseId),
            }
          : day
      )
    )
  }

  const updateExerciseSets = (dayNumber: number, exerciseId: string, sets: number) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exercises: day.exercises.map(e =>
                e.exerciseId === exerciseId ? { ...e, sets: Math.max(1, sets) } : e
              ),
            }
          : day
      )
    )
  }

  const updateDayName = (dayNumber: number, name: string) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber ? { ...day, name } : day
      )
    )
  }

  const handleSaveTemplate = async () => {
    setSaving(true)
    try {
      const templateData: CreateTemplateData = {
        name: customConfig.name,
        durationWeeks: customConfig.durationWeeks,
        daysPerWeek: customConfig.daysPerWeek,
        musclePriorities: Array.from(musclePriorities.entries()).map(([muscleGroupId, priority]) => ({
          muscleGroupId,
          priority,
        })),
        days: days.map(day => ({
          dayNumber: day.dayNumber,
          name: day.name,
          exercises: day.exercises.map((ex, idx) => ({
            exerciseId: ex.exerciseId,
            orderNum: idx + 1,
            defaultSets: ex.sets,
            repRangeMin: ex.repRangeMin,
            repRangeMax: ex.repRangeMax,
            restSeconds: ex.restSeconds,
          })),
        })),
      }

      await createMesocycleTemplate(templateData)
      alert('Template created successfully!')
      router.push('/')
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const availableExercisesForDay = () => {
    const currentDay = days.find(d => d.dayNumber === selectedDay)
    if (!currentDay) return []

    // Filter exercises by muscle groups assigned to this day
    const muscleGroupFiltered = currentDay.muscleGroupIds.length > 0
      ? availableExercises.filter(ex =>
          currentDay.muscleGroupIds.includes(ex.primaryMuscle)
        )
      : availableExercises

    // Exclude exercises already added to this day
    return muscleGroupFiltered.filter(ex =>
      !currentDay.exercises.some(e => e.exerciseId === ex.id)
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-accent mb-2">MESOCYCLE PLANNER</h1>
          <p className="text-foreground-secondary">
            {mode === 'custom' && step === 'config' && 'Create a new training program'}
            {mode === 'custom' && step === 'priorities' && 'Set muscle group priorities for auto-regulation'}
            {mode === 'custom' && step === 'schedule' && 'Plan your weekly training schedule'}
            {mode === 'template' && 'Choose from starter templates'}
          </p>
        </div>

        {/* Step indicator for custom mode */}
        {mode === 'custom' && (
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className={`flex items-center ${step === 'config' ? 'text-accent' : 'text-foreground-tertiary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step !== 'config' ? 'bg-accent text-background' : 'border-2 border-current'
              }`}>
                {step !== 'config' ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 font-medium text-sm">Config</span>
            </div>
            <div className="w-12 h-0.5 bg-foreground-tertiary" />
            <div className={`flex items-center ${step === 'priorities' ? 'text-accent' : 'text-foreground-tertiary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'schedule' ? 'bg-accent text-background' : step === 'priorities' ? 'border-2 border-current' : 'border-2 border-current'
              }`}>
                {step === 'schedule' ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className="ml-2 font-medium text-sm">Priorities</span>
            </div>
            <div className="w-12 h-0.5 bg-foreground-tertiary" />
            <div className={`flex items-center ${step === 'schedule' ? 'text-accent' : 'text-foreground-tertiary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'schedule' ? 'border-2 border-current' : 'border-2 border-current'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium text-sm">Weekly Plan</span>
            </div>
          </div>
        )}

        {/* Mode Selection - only show on config step */}
        {step === 'config' && (
          <div className="flex space-x-4 mb-8">
            <Button
              variant={mode === 'template' ? 'primary' : 'secondary'}
              onClick={() => setMode('template')}
              size="lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Use Template
            </Button>
            <Button
              variant={mode === 'custom' ? 'primary' : 'secondary'}
              onClick={() => setMode('custom')}
              size="lg"
            >
              <Dumbbell className="w-5 h-5 mr-2" />
              Custom Program
            </Button>
          </div>
        )}

        {/* Template Mode */}
        {mode === 'template' && step === 'config' && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Choose a Starter Template
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {starterTemplates.map(template => (
                <Card
                  key={template.id}
                  hover
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-accent border-accent'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {template.name}
                        {template.isSpecialization && (
                          <Zap className="inline-block w-5 h-5 ml-2 text-accent" />
                        )}
                      </h3>
                      <p className="text-sm text-foreground-secondary">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-foreground-tertiary">
                    <div>
                      <div className="text-xs text-foreground-tertiary mb-1">
                        Days/Week
                      </div>
                      <div className="text-lg font-bold text-accent">
                        {template.daysPerWeek}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground-tertiary mb-1">
                        Duration
                      </div>
                      <div className="text-lg font-bold text-accent">
                        {template.durationWeeks} weeks
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground-tertiary mb-1">
                        Level
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {template.level}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground-tertiary mb-1">
                        Focus
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {template.focus}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedTemplate && (
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartTemplate}
                >
                  Start This Program
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Custom Mode - Configuration Step */}
        {mode === 'custom' && step === 'config' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Create Custom Program
            </h2>
            <Card>
              <div className="space-y-6">
                <Input
                  label="Program Name"
                  placeholder="e.g., Summer Cut Program"
                  value={customConfig.name}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, name: e.target.value })
                  }
                />

                <Select
                  label="Training Days Per Week"
                  options={[
                    { value: '3', label: '3 Days' },
                    { value: '4', label: '4 Days' },
                    { value: '5', label: '5 Days' },
                    { value: '6', label: '6 Days' },
                  ]}
                  value={customConfig.daysPerWeek.toString()}
                  onChange={(e) =>
                    setCustomConfig({
                      ...customConfig,
                      daysPerWeek: parseInt(e.target.value),
                    })
                  }
                />

                <Select
                  label="Duration (Weeks)"
                  options={[
                    { value: '4', label: '4 Weeks' },
                    { value: '5', label: '5 Weeks' },
                    { value: '6', label: '6 Weeks' },
                    { value: '7', label: '7 Weeks' },
                    { value: '8', label: '8 Weeks' },
                  ]}
                  value={customConfig.durationWeeks.toString()}
                  onChange={(e) =>
                    setCustomConfig({
                      ...customConfig,
                      durationWeeks: parseInt(e.target.value),
                    })
                  }
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleConfigNext}
                    disabled={!customConfig.name.trim()}
                  >
                    Continue to Muscle Priorities
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Custom Mode - Muscle Priorities Step */}
        {mode === 'custom' && step === 'priorities' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Set Muscle Group Priorities
              </h2>
              <Button
                variant="secondary"
                onClick={() => setStep('config')}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </Button>
            </div>

            {/* Info card about priorities */}
            <Card className="mb-6 bg-background-tertiary border-accent">
              <div className="flex items-start space-x-3">
                <div className="text-accent text-2xl">ℹ️</div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">How Muscle Priority Affects Auto-Regulation</h3>
                  <ul className="space-y-1 text-sm text-foreground-secondary">
                    <li><span className="text-accent font-medium">HIGH:</span> Aggressive volume increases when tolerated, adds sets with good pump or easy workload</li>
                    <li><span className="text-accent font-medium">MEDIUM:</span> Conservative increases, only adds volume if clearly under-stimulated</li>
                    <li><span className="text-accent font-medium">LOW:</span> Maintenance only, never increases volume, only reduces if needed</li>
                  </ul>
                </div>
              </div>
            </Card>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-foreground-secondary">Loading muscle groups...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {muscleGroups.map(muscle => (
                  <Card key={muscle.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground uppercase">
                          {muscle.name}
                        </h3>
                        <p className="text-sm text-foreground-tertiary">
                          Current priority: <span className="text-accent font-medium uppercase">{musclePriorities.get(muscle.id) || 'medium'}</span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {(['high', 'medium', 'low'] as MuscleGroupPriority[]).map(priority => (
                          <button
                            key={priority}
                            onClick={() => handlePriorityChange(muscle.id, priority)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              musclePriorities.get(muscle.id) === priority
                                ? 'bg-accent text-white'
                                : 'bg-background-tertiary text-foreground-secondary hover:bg-background hover:text-foreground'
                            }`}
                          >
                            {priority.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setStep('config')}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handlePrioritiesNext}
              >
                Continue to Weekly Plan
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Custom Mode - Weekly Planning Step */}
        {mode === 'custom' && step === 'schedule' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Plan Your Training Schedule
              </h2>
              <Button
                variant="secondary"
                onClick={() => setStep('priorities')}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </Button>
            </div>

            {/* Day tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {days.map(day => (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDay(day.dayNumber)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedDay === day.dayNumber
                      ? 'bg-accent text-background'
                      : 'bg-background-secondary text-foreground hover:bg-background-tertiary'
                  }`}
                >
                  {day.name} ({day.exercises.length})
                </button>
              ))}
            </div>

            {/* Selected day content */}
            {days.find(d => d.dayNumber === selectedDay) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Day exercises */}
                <div className="lg:col-span-2">
                  <Card>
                    <div className="mb-4">
                      <Input
                        label="Day Name"
                        value={days.find(d => d.dayNumber === selectedDay)?.name || ''}
                        onChange={(e) => updateDayName(selectedDay, e.target.value)}
                        placeholder="e.g., Push Day, Leg Day"
                      />
                    </div>

                    {/* Muscle Groups Section */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Muscle Groups for This Day
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {days.find(d => d.dayNumber === selectedDay)?.muscleGroupIds.map(mgId => {
                          const muscle = muscleGroups.find(m => m.id === mgId)
                          return (
                            <div
                              key={mgId}
                              className="flex items-center space-x-2 bg-accent text-background px-3 py-1 rounded-full"
                            >
                              <span className="text-sm font-medium">{muscle?.name.toUpperCase()}</span>
                              <button
                                onClick={() => removeMuscleGroupFromDay(selectedDay, mgId)}
                                className="hover:bg-background hover:text-accent rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )
                        })}
                        {days.find(d => d.dayNumber === selectedDay)?.muscleGroupIds.length === 0 && (
                          <span className="text-sm text-foreground-secondary">No muscle groups assigned</span>
                        )}
                      </div>
                      <Select
                        options={[
                          { value: '', label: 'Add muscle group...' },
                          ...muscleGroups
                            .filter(mg => !days.find(d => d.dayNumber === selectedDay)?.muscleGroupIds.includes(mg.id))
                            .map(mg => ({
                              value: mg.id,
                              label: mg.name.toUpperCase(),
                            }))
                        ]}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            addMuscleGroupToDay(selectedDay, e.target.value)
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-medium text-foreground-secondary mb-2">
                        Exercises ({days.find(d => d.dayNumber === selectedDay)?.exercises.length || 0})
                      </div>
                      {days.find(d => d.dayNumber === selectedDay)?.exercises.map((ex, idx) => (
                        <div
                          key={ex.exerciseId}
                          className="bg-background-secondary rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="font-medium text-foreground">
                                {idx + 1}. {ex.exercise.name}
                              </div>
                              <div className="text-xs text-foreground-secondary mt-1">
                                {ex.exercise.equipment} • {ex.exercise.movementPattern}
                              </div>
                            </div>
                            <button
                              onClick={() => removeExerciseFromDay(selectedDay, ex.exerciseId)}
                              className="text-foreground-tertiary hover:text-error transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <label className="text-xs text-foreground-secondary">Sets:</label>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => updateExerciseSets(selectedDay, ex.exerciseId, ex.sets - 1)}
                                  className="w-6 h-6 rounded bg-background-tertiary hover:bg-accent hover:text-background transition-colors flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-medium text-foreground">
                                  {ex.sets}
                                </span>
                                <button
                                  onClick={() => updateExerciseSets(selectedDay, ex.exerciseId, ex.sets + 1)}
                                  className="w-6 h-6 rounded bg-background-tertiary hover:bg-accent hover:text-background transition-colors flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-foreground-secondary">
                              {ex.repRangeMin}-{ex.repRangeMax} reps • {ex.restSeconds}s rest
                            </div>
                          </div>
                        </div>
                      ))}

                      {days.find(d => d.dayNumber === selectedDay)?.exercises.length === 0 && (
                        <div className="text-center py-8 text-foreground-secondary">
                          No exercises added yet. Select from the available exercises on the right.
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right: Available exercises */}
                <div>
                  <Card>
                    <h3 className="font-bold text-foreground mb-4">Available Exercises</h3>
                    {days.find(d => d.dayNumber === selectedDay)?.muscleGroupIds.length === 0 ? (
                      <div className="text-center py-8 text-foreground-secondary text-sm">
                        <p className="mb-2">No muscle groups assigned to this day.</p>
                        <p>Add muscle groups above to see available exercises.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {availableExercisesForDay().map(exercise => (
                          <button
                            key={exercise.id}
                            onClick={() => addExerciseToDay(selectedDay, exercise.id)}
                            className="w-full text-left p-3 bg-background-secondary hover:bg-background-tertiary rounded-lg transition-colors group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-foreground text-sm">
                                  {exercise.name}
                                </div>
                                <div className="text-xs text-foreground-secondary mt-1">
                                  {exercise.equipment}
                                </div>
                              </div>
                              <Plus className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                        {availableExercisesForDay().length === 0 && (
                          <div className="text-center py-4 text-foreground-secondary text-sm">
                            All exercises for these muscle groups have been assigned
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setStep('priorities')}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSaveTemplate}
                disabled={saving || days.every(d => d.exercises.length === 0)}
              >
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
