// Mesocycle Template Service

import { supabase } from '@/lib/supabase'
import { MesocycleTemplate, TemplateDay, TemplateExercise, MuscleGroupPriority } from '@/types'

export interface CreateTemplateData {
  name: string
  durationWeeks: number
  daysPerWeek: number
  isSpecialization?: boolean
  specializationType?: 'arm_specialization'
  musclePriorities: {
    muscleGroupId: string
    priority: MuscleGroupPriority
  }[]
  days: {
    dayNumber: number
    name: string
    exercises: {
      exerciseId: string
      orderNum: number
      defaultSets: number
      repRangeMin: number
      repRangeMax: number
      restSeconds: number
    }[]
  }[]
}

/**
 * Create a new mesocycle template with days and exercises
 */
export async function createMesocycleTemplate(
  data: CreateTemplateData
): Promise<MesocycleTemplate> {
  // Create the template
  const { data: template, error: templateError } = await supabase
    .from('mesocycle_templates')
    .insert({
      name: data.name,
      duration_weeks: data.durationWeeks,
      days_per_week: data.daysPerWeek,
      is_specialization: data.isSpecialization || false,
      specialization_type: data.specializationType,
    })
    .select()
    .single()

  if (templateError) {
    throw new Error(`Failed to create template: ${templateError.message || JSON.stringify(templateError)}`)
  }

  // Create template days
  const dayPromises = data.days.map(async (day) => {
    const { data: templateDay, error: dayError } = await supabase
      .from('template_days')
      .insert({
        template_id: template.id,
        day_number: day.dayNumber,
        name: day.name,
      })
      .select()
      .single()

    if (dayError) {
      throw new Error(`Failed to create template day ${day.dayNumber}: ${dayError.message || JSON.stringify(dayError)}`)
    }

    // Create exercises for this day
    if (day.exercises.length > 0) {
      const { error: exercisesError } = await supabase
        .from('template_exercises')
        .insert(
          day.exercises.map((ex) => ({
            template_day_id: templateDay.id,
            exercise_id: ex.exerciseId,
            order_num: ex.orderNum,
            default_sets: ex.defaultSets,
            rep_range_min: ex.repRangeMin,
            rep_range_max: ex.repRangeMax,
            rest_seconds: ex.restSeconds,
          }))
        )

      if (exercisesError) {
        throw new Error(`Failed to create exercises for day ${day.dayNumber}: ${exercisesError.message || JSON.stringify(exercisesError)}`)
      }
    }

    return templateDay
  })

  await Promise.all(dayPromises)

  // Create muscle priorities
  if (data.musclePriorities && data.musclePriorities.length > 0) {
    const { error: prioritiesError } = await supabase
      .from('template_muscle_priorities')
      .insert(
        data.musclePriorities.map((mp) => ({
          template_id: template.id,
          muscle_group_id: mp.muscleGroupId,
          priority: mp.priority,
        }))
      )

    if (prioritiesError) {
      throw new Error(`Failed to create muscle priorities: ${prioritiesError.message || JSON.stringify(prioritiesError)}`)
    }
  }

  // Return the created template
  return {
    id: template.id,
    name: template.name,
    durationWeeks: template.duration_weeks,
    daysPerWeek: template.days_per_week,
    isSpecialization: template.is_specialization,
    specializationType: template.specialization_type,
    musclePriorities: [],
    days: [],
    createdAt: new Date(template.created_at),
  }
}

/**
 * Get all mesocycle templates
 */
export async function getMesocycleTemplates(): Promise<MesocycleTemplate[]> {
  const { data, error } = await supabase
    .from('mesocycle_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map((template) => ({
    id: template.id,
    name: template.name,
    durationWeeks: template.duration_weeks,
    daysPerWeek: template.days_per_week,
    isSpecialization: template.is_specialization,
    specializationType: template.specialization_type,
    musclePriorities: [],
    days: [],
    createdAt: new Date(template.created_at),
  }))
}

/**
 * Get a single template with all days and exercises
 */
export async function getMesocycleTemplate(
  id: string
): Promise<MesocycleTemplate | null> {
  const { data: template, error } = await supabase
    .from('mesocycle_templates')
    .select(
      `
      *,
      template_days (
        *,
        template_exercises (
          *,
          exercises (*)
        )
      ),
      template_muscle_priorities (
        *,
        muscle_groups (*)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  if (!template) return null

  return {
    id: template.id,
    name: template.name,
    durationWeeks: template.duration_weeks,
    daysPerWeek: template.days_per_week,
    isSpecialization: template.is_specialization,
    specializationType: template.specialization_type,
    musclePriorities: (template.template_muscle_priorities || []).map((mp: any) => ({
      id: mp.id,
      templateId: mp.template_id,
      muscleGroupId: mp.muscle_group_id,
      priority: mp.priority,
      muscleGroup: mp.muscle_groups
        ? {
            id: mp.muscle_groups.id,
            name: mp.muscle_groups.name,
            priority: mp.muscle_groups.priority,
            createdAt: new Date(mp.muscle_groups.created_at),
          }
        : undefined,
    })),
    days: (template.template_days || []).map((day: any) => ({
      id: day.id,
      templateId: day.template_id,
      dayNumber: day.day_number,
      name: day.name,
      exercises: (day.template_exercises || []).map((ex: any) => ({
        id: ex.id,
        templateDayId: ex.template_day_id,
        exerciseId: ex.exercise_id,
        orderNum: ex.order_num,
        defaultSets: ex.default_sets,
        repRangeMin: ex.rep_range_min,
        repRangeMax: ex.rep_range_max,
        restSeconds: ex.rest_seconds,
        exercise: ex.exercises
          ? {
              id: ex.exercises.id,
              name: ex.exercises.name,
              primaryMuscle: ex.exercises.primary_muscle,
              secondaryMuscles: ex.exercises.secondary_muscles,
              equipment: ex.exercises.equipment,
              movementPattern: ex.exercises.movement_pattern,
              notes: ex.exercises.notes,
              createdAt: new Date(ex.exercises.created_at),
            }
          : undefined,
      })),
      createdAt: new Date(day.created_at),
    })),
    createdAt: new Date(template.created_at),
  }
}

/**
 * Delete a mesocycle template
 */
export async function deleteMesocycleTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('mesocycle_templates')
    .delete()
    .eq('id', id)

  if (error) throw error
}
