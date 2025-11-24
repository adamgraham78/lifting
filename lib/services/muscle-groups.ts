// Muscle Groups Service

import { supabase } from '@/lib/supabase'
import { MuscleGroup, MuscleGroupRow, MuscleGroupPriority } from '@/types'
import { convertMuscleGroup } from '@/lib/utils/converters'

/**
 * Get all muscle groups
 */
export async function getMuscleGroups(): Promise<MuscleGroup[]> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data as MuscleGroupRow[]).map(convertMuscleGroup)
}

/**
 * Get a single muscle group by ID
 */
export async function getMuscleGroup(id: string): Promise<MuscleGroup | null> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data ? convertMuscleGroup(data as MuscleGroupRow) : null
}

/**
 * Update muscle group priority
 */
export async function updateMuscleGroupPriority(
  id: string,
  priority: MuscleGroupPriority
): Promise<MuscleGroup> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .update({ priority })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return convertMuscleGroup(data as MuscleGroupRow)
}

/**
 * Get muscle groups grouped by priority
 */
export async function getMuscleGroupsByPriority(): Promise<{
  high: MuscleGroup[]
  medium: MuscleGroup[]
  low: MuscleGroup[]
}> {
  const muscleGroups = await getMuscleGroups()

  return {
    high: muscleGroups.filter(mg => mg.priority === 'high'),
    medium: muscleGroups.filter(mg => mg.priority === 'medium'),
    low: muscleGroups.filter(mg => mg.priority === 'low'),
  }
}
