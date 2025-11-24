// Utility functions to convert between database rows and TypeScript models

import {
  MuscleGroup,
  MuscleGroupRow,
  Exercise,
  ExerciseRow,
  MesocycleTemplate,
  MesocycleTemplateRow,
  TemplateDay,
  TemplateDayRow,
  TemplateExercise,
  TemplateExerciseRow,
  ActiveMesocycle,
  ActiveMesocycleRow,
  WorkoutSession,
  WorkoutSessionRow,
  WorkoutSet,
  WorkoutSetRow,
  MuscleGroupFeedback,
  MuscleFeedbackRow,
  WeeklySetOverride,
  WeeklySetOverrideRow,
} from '@/types'

export const convertMuscleGroup = (row: MuscleGroupRow): MuscleGroup => ({
  id: row.id,
  name: row.name,
  priority: row.priority,
  createdAt: new Date(row.created_at),
})

export const convertExercise = (row: ExerciseRow): Exercise => ({
  id: row.id,
  name: row.name,
  primaryMuscle: row.primary_muscle,
  secondaryMuscles: row.secondary_muscles,
  equipment: row.equipment,
  movementPattern: row.movement_pattern,
  notes: row.notes,
  createdAt: new Date(row.created_at),
})

export const convertMesocycleTemplate = (row: MesocycleTemplateRow): MesocycleTemplate => ({
  id: row.id,
  name: row.name,
  durationWeeks: row.duration_weeks,
  daysPerWeek: row.days_per_week,
  isSpecialization: row.is_specialization,
  specializationType: row.specialization_type as 'arm_specialization' | undefined,
  days: [],
  createdAt: new Date(row.created_at),
})

export const convertTemplateDay = (row: TemplateDayRow): TemplateDay => ({
  id: row.id,
  templateId: row.template_id,
  dayNumber: row.day_number,
  name: row.name,
  exercises: [],
  createdAt: new Date(row.created_at),
})

export const convertTemplateExercise = (row: TemplateExerciseRow): TemplateExercise => ({
  id: row.id,
  templateDayId: row.template_day_id,
  exerciseId: row.exercise_id,
  orderNum: row.order_num,
  defaultSets: row.default_sets,
  repRangeMin: row.rep_range_min,
  repRangeMax: row.rep_range_max,
  restSeconds: row.rest_seconds,
})

export const convertActiveMesocycle = (row: ActiveMesocycleRow): ActiveMesocycle => ({
  id: row.id,
  templateId: row.template_id,
  startDate: new Date(row.start_date),
  currentWeek: row.current_week,
  status: row.status,
  specializationMesoNumber: row.specialization_meso_number ?? undefined,
  createdAt: new Date(row.created_at),
})

export const convertWorkoutSession = (row: WorkoutSessionRow): WorkoutSession => ({
  id: row.id,
  mesocycleId: row.mesocycle_id,
  week: row.week,
  dayNumber: row.day_number,
  date: new Date(row.date),
  status: row.status,
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  createdAt: new Date(row.created_at),
})

export const convertWorkoutSet = (row: WorkoutSetRow): WorkoutSet => ({
  id: row.id,
  sessionId: row.session_id,
  exerciseId: row.exercise_id,
  setNumber: row.set_number,
  targetReps: row.target_reps,
  actualReps: row.actual_reps ?? undefined,
  weight: row.weight ?? undefined,
  rpe: row.rpe ?? undefined,
  notes: row.notes ?? undefined,
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  createdAt: new Date(row.created_at),
})

export const convertMuscleFeedback = (row: MuscleFeedbackRow): MuscleGroupFeedback => ({
  id: row.id,
  sessionId: row.session_id,
  muscleGroupId: row.muscle_group_id,
  jointPain: row.joint_pain,
  pump: row.pump,
  workload: row.workload,
  setAdjustment: row.set_adjustment,
  createdAt: new Date(row.created_at),
})

export const convertWeeklySetOverride = (row: WeeklySetOverrideRow): WeeklySetOverride => ({
  id: row.id,
  mesocycleId: row.mesocycle_id,
  week: row.week,
  exerciseId: row.exercise_id,
  setsOverride: row.sets_override,
  createdAt: new Date(row.created_at),
})
