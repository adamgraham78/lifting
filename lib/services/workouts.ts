import { supabase } from '@/lib/supabase'
import type { WorkoutSession, WorkoutSessionRow, WorkoutSet, WorkoutSetRow } from '@/types'

function convertSessionRow(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    userId: row.user_id,
    cycleId: row.cycle_id,
    week: row.week as 1 | 2 | 3 | 4 | 5,
    dayNumber: row.day_number as 1 | 2 | 3 | 4 | 5 | 6,
    date: new Date(row.date),
    status: row.status,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    createdAt: new Date(row.created_at),
  }
}

function convertSetRow(row: WorkoutSetRow): WorkoutSet {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    targetReps: row.target_reps,
    actualReps: row.actual_reps || undefined,
    weight: row.weight ? Number(row.weight) : undefined,
    notes: row.notes,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    createdAt: new Date(row.created_at),
  }
}

/**
 * Create or get today's workout session for a given cycle/week/day
 */
export async function createOrGetWorkoutSession(
  userId: string,
  cycleId: string,
  week: 1 | 2 | 3 | 4 | 5,
  dayNumber: 1 | 2 | 3 | 4 | 5 | 6
): Promise<WorkoutSession> {
  const today = new Date().toISOString().split('T')[0]

  // Check if session already exists
  const { data: existing, error: checkError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('cycle_id', cycleId)
    .eq('week', week)
    .eq('day_number', dayNumber)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError
  }

  if (existing) {
    return convertSessionRow(existing as WorkoutSessionRow)
  }

  // Create new session
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      cycle_id: cycleId,
      week,
      day_number: dayNumber,
      date: today,
      status: 'planned',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return convertSessionRow(data as WorkoutSessionRow)
}

export async function getWorkoutSession(sessionId: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    throw error
  }

  return convertSessionRow(data as WorkoutSessionRow)
}

/**
 * Get all sessions for a cycle
 */
export async function getCycleSessions(cycleId: string): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('week', { ascending: true })
    .order('day_number', { ascending: true })

  if (error) {
    throw error
  }

  return (data as WorkoutSessionRow[]).map(convertSessionRow)
}

/**
 * Get sessions for a specific week
 */
export async function getWeekSessions(
  cycleId: string,
  week: 1 | 2 | 3 | 4 | 5
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('cycle_id', cycleId)
    .eq('week', week)
    .order('day_number', { ascending: true })

  if (error) {
    throw error
  }

  return (data as WorkoutSessionRow[]).map(convertSessionRow)
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'planned' | 'in_progress' | 'completed'
): Promise<WorkoutSession> {
  const updateData: any = {
    status,
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return convertSessionRow(data as WorkoutSessionRow)
}

/**
 * Get all sets for a workout session
 */
export async function getWorkoutSets(sessionId: string): Promise<WorkoutSet[]> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('*')
    .eq('session_id', sessionId)
    .order('set_number', { ascending: true })

  if (error) {
    throw error
  }

  return (data as WorkoutSetRow[]).map(convertSetRow)
}

/**
 * Create workout sets for a session based on target reps
 */
export async function createWorkoutSets(
  userId: string,
  sessionId: string,
  exerciseId: string,
  targetReps: number,
  targetSets: number
): Promise<WorkoutSet[]> {
  const setsToInsert = Array.from({ length: targetSets }, (_, i) => ({
    user_id: userId,
    session_id: sessionId,
    exercise_id: exerciseId,
    set_number: i + 1,
    target_reps: targetReps,
  }))

  const { data, error } = await supabase
    .from('workout_sets')
    .insert(setsToInsert)
    .select()

  if (error) {
    throw error
  }

  return (data as WorkoutSetRow[]).map(convertSetRow)
}

/**
 * Log a completed set with actual reps and weight
 */
export async function logWorkoutSet(
  setId: string,
  actualReps: number,
  weight?: number
): Promise<WorkoutSet> {
  const { data, error } = await supabase
    .from('workout_sets')
    .update({
      actual_reps: actualReps,
      weight: weight || null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', setId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return convertSetRow(data as WorkoutSetRow)
}

/**
 * Update a set's notes
 */
export async function updateSetNotes(setId: string, notes: string): Promise<WorkoutSet> {
  const { data, error } = await supabase
    .from('workout_sets')
    .update({ notes: notes || null })
    .eq('id', setId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return convertSetRow(data as WorkoutSetRow)
}

/**
 * Get completed sets for an exercise in a cycle
 */
export async function getExerciseProgressInCycle(
  exerciseId: string,
  cycleId: string
): Promise<WorkoutSet[]> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq(
      'session_id',
      supabase
        .from('workout_sessions')
        .select('id')
        .eq('cycle_id', cycleId)
    )
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data as WorkoutSetRow[]).map(convertSetRow)
}

/**
 * Get progress for a specific week's exercises
 */
export async function getWeekProgress(
  cycleId: string,
  week: 1 | 2 | 3 | 4 | 5
): Promise<Record<string, WorkoutSet[]>> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select(
      `
      *,
      session:workout_sessions!inner(*)
    `
    )
    .eq('session.cycle_id', cycleId)
    .eq('session.week', week)

  if (error) {
    throw error
  }

  // Group by exercise
  const grouped: Record<string, WorkoutSet[]> = {}

  ;(data as any[]).forEach((row) => {
    const set = convertSetRow(row)
    if (!grouped[set.exerciseId]) {
      grouped[set.exerciseId] = []
    }
    grouped[set.exerciseId].push(set)
  })

  return grouped
}
