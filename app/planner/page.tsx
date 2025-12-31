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

interface ExerciseCard {
  id: string
  muscleGroupId: string
  exercises: DayExercise[]
}

interface Day {
  dayNumber: number
  name: string
  exerciseCards: ExerciseCard[]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // Load exercises when moving to schedule step
  useEffect(() => {
    if (step === 'schedule' && availableExercises.length === 0) {
      loadExercises()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // Initialize days when moving to schedule step
  useEffect(() => {
    if (step === 'schedule' && days.length === 0) {
      const initialDays: Day[] = []
      for (let i = 1; i <= customConfig.daysPerWeek; i++) {
        initialDays.push({
          dayNumber: i,
          name: `Day ${i}`,
          exerciseCards: [],
        })
      }
      setDays(initialDays)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const addCardToDay = (dayNumber: number) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exerciseCards: [
                ...day.exerciseCards,
                {
                  id: `card-${Date.now()}-${Math.random()}`,
                  muscleGroupId: '',
                  exercises: [],
                },
              ],
            }
          : day
      )
    )
  }

  const removeCardFromDay = (dayNumber: number, cardId: string) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exerciseCards: day.exerciseCards.filter(card => card.id !== cardId),
            }
          : day
      )
    )
  }

  const updateCardMuscleGroup = (dayNumber: number, cardId: string, muscleGroupId: string) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exerciseCards: day.exerciseCards.map(card =>
                card.id === cardId
                  ? { ...card, muscleGroupId, exercises: [] } // Clear exercises when muscle group changes
                  : card
              ),
            }
          : day
      )
    )
  }

  const addExerciseToCard = (dayNumber: number, cardId: string, exerciseId: string) => {
    const exercise = availableExercises.find(e => e.id === exerciseId)
    if (!exercise) return

    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exerciseCards: day.exerciseCards.map(card =>
                card.id === cardId
                  ? {
                      ...card,
                      exercises: [
                        ...card.exercises,
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
                  : card
              ),
            }
          : day
      )
    )
  }

  const removeExerciseFromCard = (dayNumber: number, cardId: string, exerciseId: string) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exerciseCards: day.exerciseCards.map(card =>
                card.id === cardId
                  ? {
                      ...card,
                      exercises: card.exercises.filter(e => e.exerciseId !== exerciseId),
                    }
                  : card
              ),
            }
          : day
      )
    )
  }

  const updateExerciseSets = (dayNumber: number, cardId: string, exerciseId: string, sets: number) => {
    setDays(prevDays =>
      prevDays.map(day =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              exerciseCards: day.exerciseCards.map(card =>
                card.id === cardId
                  ? {
                      ...card,
                      exercises: card.exercises.map(e =>
                        e.exerciseId === exerciseId ? { ...e, sets: Math.max(1, sets) } : e
                      ),
                    }
                  : card
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
      // Flatten all exercises from all cards across all days
      const templateData: CreateTemplateData = {
        name: customConfig.name,
        durationWeeks: customConfig.durationWeeks,
        daysPerWeek: customConfig.daysPerWeek,
        musclePriorities: Array.from(musclePriorities.entries()).map(([muscleGroupId, priority]) => ({
          muscleGroupId,
          priority,
        })),
        days: days.map(day => {
          let orderNum = 1
          const allExercises = day.exerciseCards.flatMap(card =>
            card.exercises.map(ex => ({
              exerciseId: ex.exerciseId,
              orderNum: orderNum++,
              defaultSets: ex.sets,
              repRangeMin: ex.repRangeMin,
              repRangeMax: ex.repRangeMax,
              restSeconds: ex.restSeconds,
            }))
          )
          return {
            dayNumber: day.dayNumber,
            name: day.name,
            exercises: allExercises,
          }
        }),
      }

      await createMesocycleTemplate(templateData)
      alert('Template created successfully!')
      router.push('/')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to save template:', errorMessage, error)
      alert(`Failed to save template: ${errorMessage}. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  const availableExercisesForCard = (dayNumber: number, cardId: string) => {
    const currentDay = days.find(d => d.dayNumber === dayNumber)
    if (!currentDay) return []

    const card = currentDay.exerciseCards.find(c => c.id === cardId)
    if (!card || !card.muscleGroupId) return []

    // Filter exercises by the muscle group assigned to this card
    const muscleGroupFiltered = availableExercises.filter(ex =>
      ex.primaryMuscle === card.muscleGroupId
    )

    // Exclude exercises already added to this card
    return muscleGroupFiltered.filter(ex =>
      !card.exercises.some(e => e.exerciseId === ex.id)
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-accent mb-2">Mesocycle Planner</h1>
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
                        <h3 className="text-lg font-bold text-foreground">
                          {muscle.name}
                        </h3>
                        <p className="text-sm text-foreground-tertiary">
                          Current priority: <span className="text-accent font-medium">{(musclePriorities.get(muscle.id) || 'medium').charAt(0).toUpperCase() + (musclePriorities.get(muscle.id) || 'medium').slice(1)}</span>
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
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
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

            {/* All days content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {days.map((day) => {
                const totalExercises = day.exerciseCards.reduce((sum, card) => sum + card.exercises.length, 0)
                return (
                  <div key={day.dayNumber} className="border-2 border-foreground-tertiary rounded-lg p-6 flex flex-col">
                    {/* Day header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-accent">
                          {day.name} ({totalExercises} {totalExercises === 1 ? 'exercise' : 'exercises'})
                        </h3>
                      </div>

                      {/* Day name input */}
                      <Card className="mb-4">
                        <Input
                          label="Day Name"
                          value={day.name}
                          onChange={(e) => updateDayName(day.dayNumber, e.target.value)}
                          placeholder="e.g., Push Day, Leg Day"
                        />
                      </Card>
                    </div>

                    {/* Exercise cards */}
                    <div className="space-y-4">
                      {day.exerciseCards.map((card, cardIdx) => {
                        const muscle = muscleGroups.find(m => m.id === card.muscleGroupId)
                        return (
                          <Card key={card.id}>
                            <div className="space-y-4">
                              {/* Card header with muscle group selector and delete button */}
                              <div className="flex items-center justify-between">
                                <div className="flex-1 mr-4">
                                  {!card.muscleGroupId ? (
                                    <Select
                                      label="Muscle Group"
                                      options={[
                                        { value: '', label: 'Select muscle group...' },
                                        ...muscleGroups.map(mg => ({
                                          value: mg.id,
                                          label: mg.name,
                                        }))
                                      ]}
                                      value={card.muscleGroupId}
                                      onChange={(e) => updateCardMuscleGroup(day.dayNumber, card.id, e.target.value)}
                                    />
                                  ) : (
                                    <div>
                                      <label className="text-sm text-foreground-secondary mb-1 block">Muscle Group</label>
                                      <div className="flex items-center justify-between bg-background-secondary border border-foreground-tertiary rounded-lg px-4 py-2">
                                        <span className="font-bold text-accent">
                                          {muscleGroups.find(m => m.id === card.muscleGroupId)?.name}
                                        </span>
                                        {card.exercises.length === 0 && (
                                          <button
                                            onClick={() => updateCardMuscleGroup(day.dayNumber, card.id, '')}
                                            className="text-xs text-foreground-tertiary hover:text-accent transition-colors"
                                          >
                                            Change
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeCardFromDay(day.dayNumber, card.id)}
                                  className="text-foreground-tertiary hover:text-error transition-colors mt-6"
                                  title="Delete this card"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Exercise selection dropdown - only show after muscle group is selected */}
                              {card.muscleGroupId && (
                                <div className="pt-2 border-t border-foreground-tertiary">
                                  <Select
                                    label="Add Exercise"
                                    options={[
                                      { value: '', label: 'Select exercise...' },
                                      ...availableExercisesForCard(day.dayNumber, card.id).map(ex => ({
                                        value: ex.id,
                                        label: ex.name,
                                      }))
                                    ]}
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        addExerciseToCard(day.dayNumber, card.id, e.target.value)
                                      }
                                    }}
                                  />
                                </div>
                              )}

                              {/* List of exercises in this card */}
                              {card.exercises.length > 0 && (
                                <div className="space-y-3 pt-2 border-t border-foreground-tertiary">
                                  <div className="text-sm font-medium text-foreground-secondary">
                                    {muscle?.name} Exercises ({card.exercises.length})
                                  </div>
                                  {card.exercises.map((ex, idx) => (
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
                                          onClick={() => removeExerciseFromCard(day.dayNumber, card.id, ex.exerciseId)}
                                          className="text-foreground-tertiary hover:text-error transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <label className="text-xs text-foreground-secondary">Sets:</label>
                                        <div className="flex items-center space-x-1">
                                          <button
                                            onClick={() => updateExerciseSets(day.dayNumber, card.id, ex.exerciseId, ex.sets - 1)}
                                            className="w-6 h-6 rounded bg-background-tertiary hover:bg-accent hover:text-background transition-colors flex items-center justify-center"
                                          >
                                            -
                                          </button>
                                          <span className="w-8 text-center font-medium text-foreground">
                                            {ex.sets}
                                          </span>
                                          <button
                                            onClick={() => updateExerciseSets(day.dayNumber, card.id, ex.exerciseId, ex.sets + 1)}
                                            className="w-6 h-6 rounded bg-background-tertiary hover:bg-accent hover:text-background transition-colors flex items-center justify-center"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {!card.muscleGroupId && (
                                <div className="text-center py-4 text-foreground-secondary text-sm">
                                  Select a muscle group to see available exercises
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}

                      {/* Add new card button */}
                      <button
                        onClick={() => addCardToDay(day.dayNumber)}
                        className="w-full border-2 border-dashed border-foreground-tertiary hover:border-accent hover:bg-background-secondary rounded-lg p-6 transition-colors group"
                      >
                        <div className="flex items-center justify-center space-x-2 text-foreground-secondary group-hover:text-accent">
                          <Plus className="w-5 h-5" />
                          <span className="font-medium">Add Muscle Group Card</span>
                        </div>
                      </button>

                      {day.exerciseCards.length === 0 && (
                        <div className="text-center py-12 text-foreground-secondary">
                          No exercise cards yet. Click &quot;Add Muscle Group Card&quot; to get started.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

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
                disabled={saving || days.every(d => d.exerciseCards.every(card => card.exercises.length === 0))}
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
