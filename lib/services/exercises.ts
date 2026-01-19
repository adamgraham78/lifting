import { supabase } from '@/lib/supabase'
import type { Exercise, ExerciseRow } from '@/types'

export async function loadExercisesFromCSV(userId: string): Promise<{ success: boolean; error?: Error }> {
  try {
    // Check if user already has exercises
    const { data: existingExercises, error: checkError } = await supabase
      .from('exercises')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (checkError) {
      return { success: false, error: checkError }
    }

    if (existingExercises && existingExercises.length > 0) {
      // User already has exercises loaded
      return { success: true }
    }

    // Fetch CSV from public directory
    const response = await fetch('/exercises.csv')
    if (!response.ok) {
      return { success: false, error: new Error('Failed to load exercises CSV') }
    }

    const csvText = await response.text()
    const lines = csvText.trim().split('\n')

    // Skip header row
    const exercisesToInsert = lines.slice(1).map((line) => {
      const [_id, name, dayNumber, orderInDay, equipment, defaultSets, notes] = line.split(',')

      return {
        user_id: userId,
        name: name?.trim(),
        day_number: parseInt(dayNumber, 10),
        order_in_day: parseInt(orderInDay, 10),
        equipment: equipment?.trim(),
        default_sets: parseInt(defaultSets, 10),
        notes: notes?.trim() || '',
      }
    })

    // Insert all exercises
    const { error: insertError } = await supabase.from('exercises').insert(exercisesToInsert)

    if (insertError) {
      return { success: false, error: insertError }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error('Failed to load exercises') }
  }
}

function convertRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    dayNumber: row.day_number as 1 | 2 | 3 | 4 | 5 | 6,
    orderInDay: row.order_in_day as 1 | 2 | 3 | 4 | 5,
    equipment: row.equipment,
    defaultSets: row.default_sets,
    notes: row.notes,
    createdAt: new Date(row.created_at),
  }
}

export async function getExercisesForDay(userId: string, dayNumber: number): Promise<Exercise[]> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('day_number', dayNumber)
      .order('order_in_day', { ascending: true })

    if (error) {
      throw error
    }

    return (data as ExerciseRow[]).map(convertRow)
  } catch (error) {
    console.error('Failed to get exercises for day:', error)
    return []
  }
}

export async function getAllExercises(userId: string): Promise<Exercise[]> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('day_number', { ascending: true })
      .order('order_in_day', { ascending: true })

    if (error) {
      throw error
    }

    return (data as ExerciseRow[]).map(convertRow)
  } catch (error) {
    console.error('Failed to get all exercises:', error)
    return []
  }
}
