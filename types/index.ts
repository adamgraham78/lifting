// Types for Lifting Tracker

// Authentication
export interface User {
  id: string
  email: string
  createdAt: Date
}

// Muscle Group Priority
export type MuscleGroupPriority = 'high' | 'medium' | 'low'

// Feedback Types
export type JointPain = 'none' | 'medium' | 'high'
export type Pump = 'none' | 'ok' | 'amazing'
export type Workload = 'easy' | 'medium' | 'hard' | 'too_much'

// Auto-Regulation Types
export interface AutoRegulationInput {
  priority: MuscleGroupPriority
  jointPain: JointPain
  pump: Pump
  workload: Workload
}

export interface AutoRegulationResult {
  setAdjustment: number
  reasoning: string
}

// Muscle Groups
export interface MuscleGroup {
  id: string
  name: string
  priority: MuscleGroupPriority
  createdAt: Date
}

export interface MuscleGroupRow {
  id: string
  name: string
  priority: MuscleGroupPriority
  created_at: string
}

// Exercises (MVP - CSV-loaded, user-specific)
export interface Exercise {
  id: string
  userId: string
  name: string
  dayNumber: 1 | 2 | 3 | 4 | 5 | 6
  orderInDay: 1 | 2 | 3 | 4 | 5
  equipment: string
  defaultSets: number
  notes: string
  createdAt: Date
}

export interface ExerciseRow {
  id: string
  user_id: string
  name: string
  day_number: number
  order_in_day: number
  equipment: string
  default_sets: number
  notes: string
  created_at: string
}

// Library Exercises (advanced - for exercise library feature)
export interface LibraryExercise {
  id: string
  name: string
  primaryMuscle: string
  secondaryMuscles: string[]
  equipment: string
  movementPattern: string
  notes: string | null
  createdAt: Date
}

export interface LibraryExerciseRow {
  id: string
  name: string
  primary_muscle: string
  secondary_muscles: string[]
  equipment: string
  movement_pattern: string
  notes: string | null
  created_at: string
}

// Mesocycle Templates
export interface MesocycleTemplate {
  id: string
  name: string
  durationWeeks: number
  daysPerWeek: number
  isSpecialization: boolean
  specializationType?: 'arm_specialization'
  musclePriorities: { muscleGroupId: string; priority: MuscleGroupPriority }[]
  days: TemplateDay[]
  createdAt: Date
}

export interface MesocycleTemplateRow {
  id: string
  name: string
  duration_weeks: number
  days_per_week: number
  is_specialization: boolean
  specialization_type: string | null
  created_at: string
}

// Template Days
export interface TemplateDay {
  id: string
  templateId: string
  dayNumber: number
  name: string
  exercises: TemplateExercise[]
  createdAt: Date
}

export interface TemplateDayRow {
  id: string
  template_id: string
  day_number: number
  name: string
  created_at: string
}

// Template Exercises
export interface TemplateExercise {
  id: string
  templateDayId: string
  exerciseId: string
  orderNum: number
  defaultSets: number
  repRangeMin: number
  repRangeMax: number
  restSeconds: number
}

export interface TemplateExerciseRow {
  id: string
  template_day_id: string
  exercise_id: string
  order_num: number
  default_sets: number
  rep_range_min: number
  rep_range_max: number
  rest_seconds: number
}

// Active Mesocycles
export interface ActiveMesocycle {
  id: string
  templateId: string
  startDate: Date
  currentWeek: number
  status: 'active' | 'completed' | 'abandoned'
  specializationMesoNumber?: number
  createdAt: Date
}

export interface ActiveMesocycleRow {
  id: string
  template_id: string
  start_date: string
  current_week: number
  status: 'active' | 'completed' | 'abandoned'
  specialization_meso_number: number | null
  created_at: string
}

// Workout Sessions (MVP format - with userId and cycleId)
export interface WorkoutSession {
  id: string
  userId: string
  cycleId: string
  week: 1 | 2 | 3 | 4 | 5
  dayNumber: 1 | 2 | 3 | 4 | 5 | 6
  date: Date
  status: 'planned' | 'in_progress' | 'completed'
  completedAt?: Date
  createdAt: Date
}

export interface WorkoutSessionRow {
  id: string
  user_id: string
  cycle_id: string
  week: number
  day_number: number
  date: string
  status: 'planned' | 'in_progress' | 'completed'
  completed_at?: string
  created_at: string
}

// Workout Sets (MVP format - with userId)
export interface WorkoutSet {
  id: string
  userId: string
  sessionId: string
  exerciseId: string
  setNumber: number
  targetReps: number
  actualReps?: number
  weight?: number
  notes?: string
  completedAt?: Date
  createdAt: Date
}

export interface WorkoutSetRow {
  id: string
  user_id: string
  session_id: string
  exercise_id: string
  set_number: number
  target_reps: number
  actual_reps?: number
  weight?: number
  notes?: string
  completed_at?: string
  created_at: string
}

// Advanced Workout Session (for mesocycle-based system)
export interface AdvancedWorkoutSession {
  id: string
  mesocycleId: string
  week: number
  dayNumber: number
  date: Date
  status: 'planned' | 'in_progress' | 'completed'
  completedAt?: Date
  createdAt: Date
}

export interface AdvancedWorkoutSessionRow {
  id: string
  mesocycle_id: string
  week: number
  day_number: number
  date: string
  status: 'planned' | 'in_progress' | 'completed'
  completed_at: string | null
  created_at: string
}

// Advanced Workout Set (for mesocycle-based system with rpe)
export interface AdvancedWorkoutSet {
  id: string
  sessionId: string
  exerciseId: string
  setNumber: number
  targetReps: number
  actualReps?: number
  weight?: number
  rpe?: number
  notes?: string
  completedAt?: Date
  createdAt: Date
}

export interface AdvancedWorkoutSetRow {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  target_reps: number
  actual_reps: number | null
  weight: number | null
  rpe: number | null
  notes: string | null
  completed_at: string | null
  created_at: string
}

// Muscle Group Feedback
export interface MuscleGroupFeedback {
  id: string
  sessionId: string
  muscleGroupId: string
  jointPain: number
  pump: number
  workload: number
  setAdjustment: number
  createdAt: Date
}

export interface MuscleFeedbackRow {
  id: string
  session_id: string
  muscle_group_id: string
  joint_pain: number
  pump: number
  workload: number
  set_adjustment: number
  created_at: string
}

// Weekly Set Overrides
export interface WeeklySetOverride {
  id: string
  mesocycleId: string
  week: number
  exerciseId: string
  setsOverride: number
  createdAt: Date
}

export interface WeeklySetOverrideRow {
  id: string
  mesocycle_id: string
  week: number
  exercise_id: string
  sets_override: number
  created_at: string
}

// =============================================================================
// MVP Types (for simplified 5-week cycle system)
// =============================================================================

// Training Cycles (5-week fixed duration)
export interface TrainingCycle {
  id: string
  userId: string
  startDate: Date
  currentWeek: 1 | 2 | 3 | 4 | 5
  status: 'active' | 'completed' | 'abandoned'
  baselineSets: Record<string, number>
  createdAt: Date
}

export interface TrainingCycleRow {
  id: string
  user_id: string
  start_date: string
  current_week: number
  status: 'active' | 'completed' | 'abandoned'
  baseline_sets: Record<string, number>
  created_at: string
}

// MVP Week Set Override
export interface WeekSetOverride {
  id: string
  userId: string
  cycleId: string
  week: 1 | 2 | 3 | 4 | 5
  exerciseId: string
  setsOverride: number
  createdAt: Date
}

export interface WeekSetOverrideRow {
  id: string
  user_id: string
  cycle_id: string
  week: number
  exercise_id: string
  sets_override: number
  created_at: string
}
