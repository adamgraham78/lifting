// Auto-Regulation Algorithm
// Calculates set adjustments based on user feedback and muscle group priority

import {
  AutoRegulationInput,
  AutoRegulationResult,
  MuscleGroupPriority,
  JointPain,
  Pump,
  Workload,
} from '@/types'

/**
 * Calculate set adjustment for next week based on feedback
 *
 * Priority: HIGH
 * ├── jointPain: "high" → -2 sets
 * ├── jointPain: "medium" → -1 set
 * ├── workload: "too_much" → -1 set
 * ├── workload: "hard" AND pump: "amazing" → +1 set
 * ├── workload: "medium" AND pump: "amazing" → +1 set
 * ├── workload: "easy" AND pump: "ok" or "amazing" → +1 set
 * ├── pump: "none" → +1 set (need more stimulus)
 * └── else → 0 sets
 *
 * Priority: MEDIUM
 * ├── jointPain: "high" → -2 sets
 * ├── jointPain: "medium" → -1 set
 * ├── workload: "too_much" → -1 set
 * ├── pump: "none" AND workload: "easy" or "medium" → +1 set
 * └── else → 0 sets (only increase if clearly under-stimulated)
 *
 * Priority: LOW
 * ├── jointPain: "high" → -2 sets
 * ├── jointPain: "medium" → -1 set
 * ├── workload: "too_much" → -1 set
 * └── else → 0 sets (maintenance only, never increase)
 */
export function calculateSetAdjustment(input: AutoRegulationInput): AutoRegulationResult {
  const { priority, jointPain, pump, workload } = input

  // Joint pain always takes priority
  if (jointPain === 'high') {
    return {
      setAdjustment: -2,
      reasoning: 'High joint pain - significant volume reduction needed',
    }
  }

  if (jointPain === 'medium') {
    return {
      setAdjustment: -1,
      reasoning: 'Medium joint pain - reducing volume for recovery',
    }
  }

  // Workload too much - reduce regardless of priority
  if (workload === 'too_much') {
    return {
      setAdjustment: -1,
      reasoning: 'Workload too high - backing off for recovery',
    }
  }

  // HIGH PRIORITY MUSCLE GROUP
  if (priority === 'high') {
    // Productive hard work with great pump
    if (workload === 'hard' && pump === 'amazing') {
      return {
        setAdjustment: 1,
        reasoning: 'Hard work with great pump - adding volume while recovering well',
      }
    }

    // Moderate work with great pump - room to add
    if (workload === 'medium' && pump === 'amazing') {
      return {
        setAdjustment: 1,
        reasoning: 'Moderate workload with amazing pump - increasing volume',
      }
    }

    // Easy work with good response - definitely add
    if (workload === 'easy' && (pump === 'ok' || pump === 'amazing')) {
      return {
        setAdjustment: 1,
        reasoning: 'Easy workload with good response - increasing stimulus',
      }
    }

    // No pump means not enough stimulus
    if (pump === 'none') {
      return {
        setAdjustment: 1,
        reasoning: 'No pump detected - need more volume for stimulus',
      }
    }

    // Otherwise maintain
    return {
      setAdjustment: 0,
      reasoning: 'Maintaining current volume - good balance',
    }
  }

  // MEDIUM PRIORITY MUSCLE GROUP
  if (priority === 'medium') {
    // Only add if clearly under-stimulated
    if (pump === 'none' && (workload === 'easy' || workload === 'medium')) {
      return {
        setAdjustment: 1,
        reasoning: 'No pump with manageable workload - adding volume',
      }
    }

    // Otherwise maintain
    return {
      setAdjustment: 0,
      reasoning: 'Medium priority - maintaining current volume',
    }
  }

  // LOW PRIORITY MUSCLE GROUP (maintenance)
  // Never increase, only maintain or decrease
  return {
    setAdjustment: 0,
    reasoning: 'Low priority maintenance - keeping volume stable',
  }
}

/**
 * Calculate deload week volume
 * The final week of each mesocycle is automatically a deload
 * @param normalSets - Sets from previous week
 * @returns Deload sets (50% of normal)
 */
export function calculateDeloadSets(normalSets: number): number {
  return Math.ceil(normalSets * 0.5)
}

/**
 * Check if current week is a deload week
 * @param currentWeek - Current week number (1-indexed)
 * @param totalWeeks - Total weeks in mesocycle
 * @returns true if deload week
 */
export function isDeloadWeek(currentWeek: number, totalWeeks: number): boolean {
  return currentWeek === totalWeeks
}

/**
 * Apply set adjustment to exercise
 * Ensures minimum of 1 set per exercise
 * @param currentSets - Current number of sets
 * @param adjustment - Adjustment from auto-regulation (-2 to +2)
 * @returns New set count
 */
export function applySetsAdjustment(currentSets: number, adjustment: number): number {
  const newSets = currentSets + adjustment
  return Math.max(1, newSets)  // Minimum 1 set
}

/**
 * Calculate total weekly sets for a muscle group
 * @param exerciseSets - Array of set counts for each exercise targeting this muscle
 * @returns Total weekly volume
 */
export function calculateWeeklyVolume(exerciseSets: number[]): number {
  return exerciseSets.reduce((sum, sets) => sum + sets, 0)
}

/**
 * Distribute set adjustment across exercises for a muscle group
 * Prioritizes adjusting exercises with more sets
 * @param exercises - Array of { exerciseId, currentSets }
 * @param totalAdjustment - Total sets to add/remove
 * @returns Array of { exerciseId, newSets }
 */
export function distributeSetAdjustment(
  exercises: Array<{ exerciseId: string; currentSets: number }>,
  totalAdjustment: number
): Array<{ exerciseId: string; newSets: number }> {
  if (exercises.length === 0) return []
  if (totalAdjustment === 0) {
    return exercises.map(ex => ({ exerciseId: ex.exerciseId, newSets: ex.currentSets }))
  }

  // Sort by current sets (highest first for adding, lowest first for removing)
  const sorted = [...exercises].sort((a, b) => {
    return totalAdjustment > 0 ? b.currentSets - a.currentSets : a.currentSets - b.currentSets
  })

  const result = sorted.map(ex => ({ ...ex, newSets: ex.currentSets }))
  let remaining = Math.abs(totalAdjustment)

  // Distribute adjustment one set at a time
  while (remaining > 0) {
    for (const ex of result) {
      if (remaining === 0) break

      if (totalAdjustment > 0) {
        // Adding sets
        ex.newSets += 1
      } else {
        // Removing sets (but keep minimum 1)
        if (ex.newSets > 1) {
          ex.newSets -= 1
        }
      }
      remaining -= 1
    }
  }

  // Return in original order
  return exercises.map(ex => {
    const updated = result.find(r => r.exerciseId === ex.exerciseId)
    return { exerciseId: ex.exerciseId, newSets: updated?.newSets ?? ex.currentSets }
  })
}
