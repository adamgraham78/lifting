// Core Data Models for Lifting Tracker

export type MuscleGroupPriority = 'low' | 'medium' | 'high'

export interface MuscleGroup {
  id: string
  name: string
  priority: MuscleGroupPriority
  createdAt: Date
}

export type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'
export type MovementPattern = 'push' | 'pull' | 'hinge' | 'squat' | 'isolation'

export interface Exercise {
  id: string
  name: string
  primaryMuscle: string  // muscle group id
  secondaryMuscles: string[]  // muscle group ids
  equipment: Equipment
  movementPattern: MovementPattern
  notes: string
  createdAt: Date
}

export interface TemplateMuscleGroupPriority {
  id: string
  templateId: string
  muscleGroupId: string
  priority: MuscleGroupPriority
  muscleGroup?: MuscleGroup  // populated via join
}

export interface MesocycleTemplate {
  id: string
  name: string
  durationWeeks: number  // 4-8 weeks
  daysPerWeek: number
  isSpecialization: boolean
  specializationType?: 'arm_specialization'
  musclePriorities: TemplateMuscleGroupPriority[]
  days: TemplateDay[]
  createdAt: Date
}

export interface TemplateDay {
  id: string
  templateId: string
  dayNumber: number  // 1, 2, 3, etc.
  name: string  // "Push", "Pull", "Legs", etc.
  exercises: TemplateExercise[]
  createdAt: Date
}

export interface TemplateExercise {
  id: string
  templateDayId: string
  exerciseId: string
  orderNum: number
  defaultSets: number
  repRangeMin: number
  repRangeMax: number
  restSeconds: number
  exercise?: Exercise  // populated via join
}

export type MesocycleStatus = 'active' | 'completed' | 'abandoned'

export interface ActiveMesocycle {
  id: string
  templateId: string
  startDate: Date
  currentWeek: number
  status: MesocycleStatus
  specializationMesoNumber?: number  // 1, 2, or 3 for Big Arms
  template?: MesocycleTemplate  // populated via join
  createdAt: Date
}

export type WorkoutStatus = 'planned' | 'in_progress' | 'completed'

export interface WorkoutSession {
  id: string
  mesocycleId: string
  week: number
  dayNumber: number
  date: Date
  status: WorkoutStatus
  completedAt?: Date
  createdAt: Date
}

export interface WorkoutSet {
  id: string
  sessionId: string
  exerciseId: string
  setNumber: number
  targetReps: number
  actualReps?: number
  weight?: number
  rpe?: number  // 1-10 scale
  notes?: string
  completedAt?: Date
  createdAt: Date
  exercise?: Exercise  // populated via join
}

export type JointPain = 'none' | 'low' | 'medium' | 'high'
export type Pump = 'none' | 'ok' | 'amazing'
export type Workload = 'easy' | 'medium' | 'hard' | 'too_much'

export interface MuscleGroupFeedback {
  id: string
  sessionId: string
  muscleGroupId: string
  jointPain: JointPain
  pump: Pump
  workload: Workload
  setAdjustment: number  // -2, -1, 0, +1, +2
  createdAt: Date
  muscleGroup?: MuscleGroup  // populated via join
}

export interface WeeklySetOverride {
  id: string
  mesocycleId: string
  week: number
  exerciseId: string
  setsOverride: number
  createdAt: Date
}

// Auto-regulation calculation input
export interface AutoRegulationInput {
  muscleGroupId: string
  priority: MuscleGroupPriority
  jointPain: JointPain
  pump: Pump
  workload: Workload
}

// Auto-regulation calculation output
export interface AutoRegulationResult {
  setAdjustment: number  // -2, -1, 0, +1, +2
  reasoning: string
}

// Big Arms Specialization specific types
export interface SpecializationConfig {
  name: string
  type: 'arm_specialization'
  totalMesocycles: number
  currentMesocycle: number
  specializedMuscles: SpecializedMuscle[]
  maintenanceMuscles: MaintenanceMuscle[]
  volumeProgression: VolumeProgressionConfig[]
}

export interface SpecializedMuscle {
  muscleGroup: string
  exercisesByRepRange: {
    heavy: string  // exerciseId for 5-10 rep day
    moderate: string  // exerciseId for 10-20 rep day
    light: string  // exerciseId for 20-30 rep day
  }
}

export interface MaintenanceMuscle {
  muscleGroup: string
  exerciseId: string
  setsPerSession: number  // Fixed at 2
}

export interface VolumeProgressionConfig {
  mesocycle: number
  startingSetsPerMuscle: number
  endingSetsPerMuscle: number
}

// Database row types (snake_case from Supabase)
export interface MuscleGroupRow {
  id: string
  name: string
  priority: MuscleGroupPriority
  created_at: string
}

export interface ExerciseRow {
  id: string
  name: string
  primary_muscle: string
  secondary_muscles: string[]
  equipment: Equipment
  movement_pattern: MovementPattern
  notes: string
  created_at: string
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

export interface TemplateMuscleGroupPriorityRow {
  id: string
  template_id: string
  muscle_group_id: string
  priority: MuscleGroupPriority
  created_at: string
}

export interface TemplateDayRow {
  id: string
  template_id: string
  day_number: number
  name: string
  created_at: string
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
  created_at: string
}

export interface ActiveMesocycleRow {
  id: string
  template_id: string
  start_date: string
  current_week: number
  status: MesocycleStatus
  specialization_meso_number: number | null
  created_at: string
}

export interface WorkoutSessionRow {
  id: string
  mesocycle_id: string
  week: number
  day_number: number
  date: string
  status: WorkoutStatus
  completed_at: string | null
  created_at: string
}

export interface WorkoutSetRow {
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

export interface MuscleFeedbackRow {
  id: string
  session_id: string
  muscle_group_id: string
  joint_pain: JointPain
  pump: Pump
  workload: Workload
  set_adjustment: number
  created_at: string
}

export interface WeeklySetOverrideRow {
  id: string
  mesocycle_id: string
  week: number
  exercise_id: string
  sets_override: number
  created_at: string
}
