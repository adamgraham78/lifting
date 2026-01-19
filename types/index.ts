// Simplified MVP types for Lifting Tracker

// Authentication
export interface User {
  id: string
  email: string
  createdAt: Date
}

// Exercises (CSV-loaded)
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

// Training Cycles (5-week fixed duration)
export interface TrainingCycle {
  id: string
  userId: string
  startDate: Date
  currentWeek: 1 | 2 | 3 | 4 | 5
  status: 'active' | 'completed' | 'abandoned'
  baselineSets: Record<string, number> // {exerciseId: setCount}
  createdAt: Date
}

// Workout Sessions
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

// Workout Sets
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

// Weekly Set Overrides
export interface WeekSetOverride {
  id: string
  userId: string
  cycleId: string
  week: 1 | 2 | 3 | 4 | 5
  exerciseId: string
  setsOverride: number
  createdAt: Date
}

// Database row types (snake_case)
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

export interface TrainingCycleRow {
  id: string
  user_id: string
  start_date: string
  current_week: number
  status: 'active' | 'completed' | 'abandoned'
  baseline_sets: Record<string, number>
  created_at: string
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

export interface WeekSetOverrideRow {
  id: string
  user_id: string
  cycle_id: string
  week: number
  exercise_id: string
  sets_override: number
  created_at: string
}
