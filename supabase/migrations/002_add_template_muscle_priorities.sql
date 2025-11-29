-- Add muscle priorities to mesocycle templates
-- Migration for moving muscle priorities from global settings to per-template

-- ============================================================================
-- Template Muscle Priorities Table
-- ============================================================================
CREATE TABLE template_muscle_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES mesocycle_templates(id) ON DELETE CASCADE,
  muscle_group_id UUID REFERENCES muscle_groups(id),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, muscle_group_id)
);

-- Index for quick lookups by template
CREATE INDEX idx_template_muscle_priorities_template ON template_muscle_priorities(template_id);
