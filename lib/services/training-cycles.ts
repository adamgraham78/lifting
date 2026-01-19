import { supabase } from '@/lib/supabase'
import type { TrainingCycle, TrainingCycleRow, WeekSetOverride } from '@/types'

function convertRow(row: TrainingCycleRow): TrainingCycle {
  return {
    id: row.id,
    userId: row.user_id,
    startDate: new Date(row.start_date),
    currentWeek: row.current_week as 1 | 2 | 3 | 4 | 5,
    status: row.status,
    baselineSets: row.baseline_sets,
    createdAt: new Date(row.created_at),
  }
}

export async function createTrainingCycle(
  userId: string,
  baselineSets: Record<string, number>
): Promise<TrainingCycle> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('active_training_cycles')
    .insert({
      user_id: userId,
      start_date: today,
      current_week: 1,
      status: 'active',
      baseline_sets: baselineSets,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return convertRow(data as TrainingCycleRow)
}

export async function getCurrentCycle(userId: string): Promise<TrainingCycle | null> {
  const { data, error } = await supabase
    .from('active_training_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return convertRow(data as TrainingCycleRow)
}

export async function getCycleById(cycleId: string): Promise<TrainingCycle> {
  const { data, error } = await supabase
    .from('active_training_cycles')
    .select('*')
    .eq('id', cycleId)
    .single()

  if (error) {
    throw error
  }

  return convertRow(data as TrainingCycleRow)
}

/**
 * Calculate target sets for an exercise in a given week
 * Week progression: W1=baseline, W2=+1, W3=+2, W4=-1 (deload), W5=+2
 */
export function calculateTargetSets(
  baselineSets: number,
  week: 1 | 2 | 3 | 4 | 5,
  override?: number
): number {
  // Override takes precedence
  if (override !== undefined) {
    return Math.max(1, override)
  }

  const progressionMap: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0, // baseline
    2: 1, // +1
    3: 2, // +2
    4: -1, // deload
    5: 2, // +2 final
  }

  const adjustment = progressionMap[week]
  return Math.max(1, baselineSets + adjustment)
}

/**
 * Get target sets for a specific exercise in a week, accounting for overrides
 */
export async function getWeekTargetSets(
  cycleId: string,
  week: 1 | 2 | 3 | 4 | 5,
  exerciseId: string,
  baselineSets: number
): Promise<number> {
  // Check for override first
  const { data: overrides, error: overrideError } = await supabase
    .from('week_set_overrides')
    .select('sets_override')
    .eq('cycle_id', cycleId)
    .eq('week', week)
    .eq('exercise_id', exerciseId)
    .single()

  if (overrideError && overrideError.code !== 'PGRST116') {
    throw overrideError
  }

  const override = overrides?.sets_override

  return calculateTargetSets(baselineSets, week, override)
}

export async function incrementWeek(cycleId: string): Promise<TrainingCycle> {
  const cycle = await getCycleById(cycleId)

  if (cycle.currentWeek >= 5) {
    throw new Error('Cannot increment week beyond 5')
  }

  const { data, error } = await supabase
    .from('active_training_cycles')
    .update({
      current_week: cycle.currentWeek + 1,
    })
    .eq('id', cycleId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return convertRow(data as TrainingCycleRow)
}

export async function completeCycle(cycleId: string): Promise<TrainingCycle> {
  const { data, error } = await supabase
    .from('active_training_cycles')
    .update({
      status: 'completed',
    })
    .eq('id', cycleId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return convertRow(data as TrainingCycleRow)
}

/**
 * Get the final baseline sets from the previous cycle (week 5 targets)
 */
export async function getPreviousCycleBaseline(
  userId: string,
  cycleId: string
): Promise<Record<string, number>> {
  // Get the completed cycle
  const { data: cycle, error: cycleError } = await supabase
    .from('active_training_cycles')
    .select('*')
    .eq('id', cycleId)
    .single()

  if (cycleError) {
    throw cycleError
  }

  const cycleData = cycle as TrainingCycleRow

  // Get all exercises for this user
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('id, default_sets')
    .eq('user_id', userId)

  if (exercisesError) {
    throw exercisesError
  }

  // For week 5, calculate final targets
  const newBaseline: Record<string, number> = {}

  for (const ex of exercises || []) {
    const week5Target = calculateTargetSets(cycleData.baseline_sets[ex.id] || ex.default_sets, 5)
    newBaseline[ex.id] = week5Target
  }

  return newBaseline
}

export async function restartCycle(
  userId: string,
  previousCycleId: string
): Promise<TrainingCycle> {
  const previousCycle = await getCycleById(previousCycleId)

  // Get new baseline from previous cycle's week 5
  const newBaseline = await getPreviousCycleBaseline(userId, previousCycleId)

  // Create new cycle with updated baseline
  return createTrainingCycle(userId, newBaseline)
}

export async function setWeekOverride(
  cycleId: string,
  userId: string,
  week: 1 | 2 | 3 | 4 | 5,
  exerciseId: string,
  sets: number
): Promise<WeekSetOverride> {
  const { data, error } = await supabase
    .from('week_set_overrides')
    .upsert(
      {
        cycle_id: cycleId,
        user_id: userId,
        week,
        exercise_id: exerciseId,
        sets_override: Math.max(1, sets),
      },
      { onConflict: 'cycle_id,week,exercise_id' }
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    userId: data.user_id,
    cycleId: data.cycle_id,
    week: data.week as 1 | 2 | 3 | 4 | 5,
    exerciseId: data.exercise_id,
    setsOverride: data.sets_override,
    createdAt: new Date(data.created_at),
  }
}

export async function removeWeekOverride(
  cycleId: string,
  week: 1 | 2 | 3 | 4 | 5,
  exerciseId: string
): Promise<void> {
  const { error } = await supabase
    .from('week_set_overrides')
    .delete()
    .eq('cycle_id', cycleId)
    .eq('week', week)
    .eq('exercise_id', exerciseId)

  if (error) {
    throw error
  }
}
