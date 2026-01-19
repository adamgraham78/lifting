-- MVP Lifting Tracker Schema
-- Simplified schema for 6-day split with 5-week cycles

-- Drop old tables (since this is a rewrite)
DROP TABLE IF EXISTS muscle_group_feedback CASCADE;
DROP TABLE IF EXISTS weekly_set_overrides CASCADE;
DROP TABLE IF EXISTS workout_sets CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS active_mesocycles CASCADE;
DROP TABLE IF EXISTS template_muscle_priorities CASCADE;
DROP TABLE IF EXISTS template_exercises CASCADE;
DROP TABLE IF EXISTS template_days CASCADE;
DROP TABLE IF EXISTS mesocycle_templates CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS muscle_groups CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Exercises Table (CSV-loaded)
-- ============================================================================
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 6),
  order_in_day INTEGER NOT NULL CHECK (order_in_day >= 1 AND order_in_day <= 5),
  equipment TEXT,
  default_sets INTEGER NOT NULL DEFAULT 3,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_number, order_in_day)
);

CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_day ON exercises(user_id, day_number);

-- Enable RLS on exercises
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Active Training Cycles Table
-- ============================================================================
CREATE TABLE active_training_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  current_week INTEGER NOT NULL CHECK (current_week >= 1 AND current_week <= 5),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  baseline_sets JSONB NOT NULL DEFAULT '{}', -- {exerciseId: setCount}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_active_training_cycles_user_id ON active_training_cycles(user_id);
CREATE INDEX idx_active_training_cycles_status ON active_training_cycles(user_id, status);

-- Enable RLS on active_training_cycles
ALTER TABLE active_training_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cycles"
  ON active_training_cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycles"
  ON active_training_cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycles"
  ON active_training_cycles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Workout Sessions Table
-- ============================================================================
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES active_training_cycles(id) ON DELETE CASCADE,
  week INTEGER NOT NULL CHECK (week >= 1 AND week <= 5),
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 6),
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cycle_id, week, day_number)
);

CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_cycle_id ON workout_sessions(cycle_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(user_id, date);

-- Enable RLS on workout_sessions
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Workout Sets Table
-- ============================================================================
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL CHECK (set_number >= 1),
  target_reps INTEGER NOT NULL,
  actual_reps INTEGER,
  weight DECIMAL(10, 2),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_sets_user_id ON workout_sets(user_id);
CREATE INDEX idx_workout_sets_session_id ON workout_sets(session_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);

-- Enable RLS on workout_sets
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sets"
  ON workout_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sets"
  ON workout_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sets"
  ON workout_sets FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Weekly Set Overrides Table
-- ============================================================================
CREATE TABLE week_set_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES active_training_cycles(id) ON DELETE CASCADE,
  week INTEGER NOT NULL CHECK (week >= 1 AND week <= 5),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets_override INTEGER NOT NULL CHECK (sets_override >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cycle_id, week, exercise_id)
);

CREATE INDEX idx_week_set_overrides_user_id ON week_set_overrides(user_id);
CREATE INDEX idx_week_set_overrides_cycle_id ON week_set_overrides(cycle_id);

-- Enable RLS on week_set_overrides
ALTER TABLE week_set_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own overrides"
  ON week_set_overrides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own overrides"
  ON week_set_overrides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own overrides"
  ON week_set_overrides FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own overrides"
  ON week_set_overrides FOR DELETE
  USING (auth.uid() = user_id);
