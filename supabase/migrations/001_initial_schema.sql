-- Lifting Tracker Database Schema
-- Initial Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Muscle Groups Table
-- ============================================================================
CREATE TABLE muscle_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Exercises Table
-- ============================================================================
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  primary_muscle UUID REFERENCES muscle_groups(id),
  secondary_muscles UUID[] DEFAULT '{}',
  equipment TEXT,
  movement_pattern TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Mesocycle Templates
-- ============================================================================
CREATE TABLE mesocycle_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_weeks INT CHECK (duration_weeks BETWEEN 4 AND 8),
  days_per_week INT,
  is_specialization BOOLEAN DEFAULT FALSE,
  specialization_type TEXT,  -- 'arm_specialization', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Template Days
-- ============================================================================
CREATE TABLE template_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES mesocycle_templates(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Template Exercises (assigned to template days)
-- ============================================================================
CREATE TABLE template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_day_id UUID REFERENCES template_days(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  order_num INT,
  default_sets INT,
  rep_range_min INT,
  rep_range_max INT,
  rest_seconds INT DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Active Mesocycles (running programs)
-- ============================================================================
CREATE TABLE active_mesocycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES mesocycle_templates(id),
  start_date DATE NOT NULL,
  current_week INT DEFAULT 1,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  -- For specialization programs
  specialization_meso_number INT,  -- 1, 2, or 3 for Big Arms
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Workout Sessions
-- ============================================================================
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_id UUID REFERENCES active_mesocycles(id) ON DELETE CASCADE,
  week INT NOT NULL,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed')) DEFAULT 'planned',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Workout Sets (individual sets logged)
-- ============================================================================
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  set_number INT NOT NULL,
  target_reps INT,
  actual_reps INT,
  weight DECIMAL(6,2),
  rpe DECIMAL(3,1),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Muscle Group Feedback (for auto-regulation)
-- ============================================================================
CREATE TABLE muscle_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  muscle_group_id UUID REFERENCES muscle_groups(id),
  joint_pain TEXT CHECK (joint_pain IN ('none', 'low', 'medium', 'high')),
  pump TEXT CHECK (pump IN ('none', 'ok', 'amazing')),
  workload TEXT CHECK (workload IN ('easy', 'medium', 'hard', 'too_much')),
  set_adjustment INT DEFAULT 0,  -- calculated: -2 to +2
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Weekly Set Overrides (manual adjustments before a week starts)
-- ============================================================================
CREATE TABLE weekly_set_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mesocycle_id UUID REFERENCES active_mesocycles(id) ON DELETE CASCADE,
  week INT NOT NULL,
  exercise_id UUID REFERENCES exercises(id),
  sets_override INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mesocycle_id, week, exercise_id)
);

-- ============================================================================
-- Indexes for common queries
-- ============================================================================
CREATE INDEX idx_workout_sets_session ON workout_sets(session_id);
CREATE INDEX idx_workout_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX idx_sessions_mesocycle ON workout_sessions(mesocycle_id);
CREATE INDEX idx_feedback_session ON muscle_feedback(session_id);
CREATE INDEX idx_template_exercises_day ON template_exercises(template_day_id);
CREATE INDEX idx_template_days_template ON template_days(template_id);
CREATE INDEX idx_exercises_primary_muscle ON exercises(primary_muscle);
