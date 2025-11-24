// Exercise Database Service

import { supabase } from '@/lib/supabase'
import { Exercise, ExerciseRow, MuscleGroup } from '@/types'
import { convertExercise } from '@/lib/utils/converters'

export interface ExerciseFilters {
  primaryMuscle?: string
  equipment?: string
  movementPattern?: string
  search?: string
}

/**
 * Get all exercises with optional filtering
 */
export async function getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
  let query = supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })

  if (filters?.primaryMuscle) {
    query = query.eq('primary_muscle', filters.primaryMuscle)
  }

  if (filters?.equipment) {
    query = query.eq('equipment', filters.equipment)
  }

  if (filters?.movementPattern) {
    query = query.eq('movement_pattern', filters.movementPattern)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as ExerciseRow[]).map(convertExercise)
}

/**
 * Get a single exercise by ID
 */
export async function getExercise(id: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data ? convertExercise(data as ExerciseRow) : null
}

/**
 * Create a new exercise
 */
export async function createExercise(
  exercise: Omit<Exercise, 'id' | 'createdAt'>
): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name: exercise.name,
      primary_muscle: exercise.primaryMuscle,
      secondary_muscles: exercise.secondaryMuscles,
      equipment: exercise.equipment,
      movement_pattern: exercise.movementPattern,
      notes: exercise.notes,
    })
    .select()
    .single()

  if (error) throw error
  return convertExercise(data as ExerciseRow)
}

/**
 * Update an exercise
 */
export async function updateExercise(
  id: string,
  updates: Partial<Omit<Exercise, 'id' | 'createdAt'>>
): Promise<Exercise> {
  const updateData: any = {}

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.primaryMuscle !== undefined) updateData.primary_muscle = updates.primaryMuscle
  if (updates.secondaryMuscles !== undefined) updateData.secondary_muscles = updates.secondaryMuscles
  if (updates.equipment !== undefined) updateData.equipment = updates.equipment
  if (updates.movementPattern !== undefined) updateData.movement_pattern = updates.movementPattern
  if (updates.notes !== undefined) updateData.notes = updates.notes

  const { data, error } = await supabase
    .from('exercises')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return convertExercise(data as ExerciseRow)
}

/**
 * Delete an exercise (soft delete - just remove, history preserved in workout_sets)
 */
export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get exercise history (all sets ever logged)
 */
export async function getExerciseHistory(exerciseId: string) {
  const { data, error } = await supabase
    .from('workout_sets')
    .select(`
      *,
      session:workout_sessions(date, week)
    `)
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get exercises by muscle group
 */
export async function getExercisesByMuscleGroup(muscleGroupId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('primary_muscle', muscleGroupId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data as ExerciseRow[]).map(convertExercise)
}
