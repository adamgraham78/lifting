-- Seed Data for Lifting Tracker
-- Run this after the initial migration

-- ============================================================================
-- Muscle Groups
-- ============================================================================
INSERT INTO muscle_groups (name, priority) VALUES
  ('chest', 'high'),
  ('back', 'high'),
  ('shoulders', 'medium'),
  ('biceps', 'medium'),
  ('triceps', 'medium'),
  ('quads', 'high'),
  ('hamstrings', 'medium'),
  ('glutes', 'medium'),
  ('calves', 'low'),
  ('abs', 'low'),
  ('forearms', 'low');

-- ============================================================================
-- Exercises - Get muscle group IDs first
-- ============================================================================
DO $$
DECLARE
  chest_id UUID;
  back_id UUID;
  shoulders_id UUID;
  biceps_id UUID;
  triceps_id UUID;
  quads_id UUID;
  hamstrings_id UUID;
  glutes_id UUID;
  calves_id UUID;
  abs_id UUID;
  forearms_id UUID;
BEGIN
  -- Get muscle group IDs
  SELECT id INTO chest_id FROM muscle_groups WHERE name = 'chest';
  SELECT id INTO back_id FROM muscle_groups WHERE name = 'back';
  SELECT id INTO shoulders_id FROM muscle_groups WHERE name = 'shoulders';
  SELECT id INTO biceps_id FROM muscle_groups WHERE name = 'biceps';
  SELECT id INTO triceps_id FROM muscle_groups WHERE name = 'triceps';
  SELECT id INTO quads_id FROM muscle_groups WHERE name = 'quads';
  SELECT id INTO hamstrings_id FROM muscle_groups WHERE name = 'hamstrings';
  SELECT id INTO glutes_id FROM muscle_groups WHERE name = 'glutes';
  SELECT id INTO calves_id FROM muscle_groups WHERE name = 'calves';
  SELECT id INTO abs_id FROM muscle_groups WHERE name = 'abs';
  SELECT id INTO forearms_id FROM muscle_groups WHERE name = 'forearms';

  -- CHEST EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Barbell Bench Press', chest_id, ARRAY[shoulders_id, triceps_id], 'barbell', 'push', 'King of chest exercises'),
    ('Incline Barbell Bench Press', chest_id, ARRAY[shoulders_id, triceps_id], 'barbell', 'push', 'Upper chest emphasis'),
    ('Dumbbell Bench Press', chest_id, ARRAY[shoulders_id, triceps_id], 'dumbbell', 'push', 'Greater ROM than barbell'),
    ('Incline Dumbbell Press', chest_id, ARRAY[shoulders_id, triceps_id], 'dumbbell', 'push', 'Upper chest focus'),
    ('Dumbbell Fly', chest_id, ARRAY[shoulders_id], 'dumbbell', 'isolation', 'Stretch-focused movement'),
    ('Cable Fly', chest_id, ARRAY[shoulders_id], 'cable', 'isolation', 'Constant tension'),
    ('Machine Chest Press', chest_id, ARRAY[shoulders_id, triceps_id], 'machine', 'push', 'Stable and safe'),
    ('Dips (Chest)', chest_id, ARRAY[shoulders_id, triceps_id], 'bodyweight', 'push', 'Lean forward for chest emphasis');

  -- BACK EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Barbell Row', back_id, ARRAY[biceps_id, forearms_id], 'barbell', 'pull', 'Mass builder'),
    ('Dumbbell Row', back_id, ARRAY[biceps_id, forearms_id], 'dumbbell', 'pull', 'Unilateral work'),
    ('T-Bar Row', back_id, ARRAY[biceps_id, forearms_id], 'barbell', 'pull', 'Mid-back focus'),
    ('Pull-ups', back_id, ARRAY[biceps_id, forearms_id], 'bodyweight', 'pull', 'Lat width'),
    ('Lat Pulldown', back_id, ARRAY[biceps_id, forearms_id], 'cable', 'pull', 'Vertical pulling'),
    ('Seated Cable Row', back_id, ARRAY[biceps_id, forearms_id], 'cable', 'pull', 'Mid-back thickness'),
    ('Chest-Supported Row', back_id, ARRAY[biceps_id, forearms_id], 'machine', 'pull', 'Eliminates lower back stress'),
    ('Face Pulls', back_id, ARRAY[shoulders_id], 'cable', 'pull', 'Rear delt and upper back');

  -- SHOULDER EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Overhead Press', shoulders_id, ARRAY[triceps_id], 'barbell', 'push', 'Front delt mass builder'),
    ('Dumbbell Shoulder Press', shoulders_id, ARRAY[triceps_id], 'dumbbell', 'push', 'Greater ROM'),
    ('Lateral Raise', shoulders_id, '{}', 'dumbbell', 'isolation', 'Side delt focus'),
    ('Cable Lateral Raise', shoulders_id, '{}', 'cable', 'isolation', 'Constant tension on delts'),
    ('Rear Delt Fly', shoulders_id, ARRAY[back_id], 'dumbbell', 'isolation', 'Rear delt focus'),
    ('Machine Shoulder Press', shoulders_id, ARRAY[triceps_id], 'machine', 'push', 'Stable pressing'),
    ('Arnold Press', shoulders_id, ARRAY[triceps_id], 'dumbbell', 'push', 'Full delt activation'),
    ('Front Raise', shoulders_id, '{}', 'dumbbell', 'isolation', 'Front delt isolation');

  -- BICEPS EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Barbell Curl', biceps_id, ARRAY[forearms_id], 'barbell', 'isolation', 'Classic mass builder'),
    ('EZ-Bar Curl', biceps_id, ARRAY[forearms_id], 'barbell', 'isolation', 'Joint-friendly'),
    ('Dumbbell Curl', biceps_id, ARRAY[forearms_id], 'dumbbell', 'isolation', 'Supination at top'),
    ('Hammer Curl', biceps_id, ARRAY[forearms_id], 'dumbbell', 'isolation', 'Brachialis focus'),
    ('Preacher Curl', biceps_id, ARRAY[forearms_id], 'barbell', 'isolation', 'Strict form'),
    ('Cable Curl', biceps_id, ARRAY[forearms_id], 'cable', 'isolation', 'Constant tension'),
    ('Incline Dumbbell Curl', biceps_id, ARRAY[forearms_id], 'dumbbell', 'isolation', 'Long head stretch'),
    ('Concentration Curl', biceps_id, ARRAY[forearms_id], 'dumbbell', 'isolation', 'Peak contraction');

  -- TRICEPS EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Close-Grip Bench Press', triceps_id, ARRAY[chest_id, shoulders_id], 'barbell', 'push', 'Heavy loading'),
    ('Dips (Triceps)', triceps_id, ARRAY[chest_id, shoulders_id], 'bodyweight', 'push', 'Stay upright'),
    ('Skull Crushers', triceps_id, '{}', 'barbell', 'isolation', 'Long head focus'),
    ('Overhead Triceps Extension', triceps_id, '{}', 'dumbbell', 'isolation', 'Long head stretch'),
    ('Cable Pushdown', triceps_id, '{}', 'cable', 'isolation', 'Lateral head focus'),
    ('Cable Overhead Extension', triceps_id, '{}', 'cable', 'isolation', 'Long head focus'),
    ('Dumbbell Kickback', triceps_id, '{}', 'dumbbell', 'isolation', 'Peak contraction'),
    ('Diamond Push-ups', triceps_id, ARRAY[chest_id], 'bodyweight', 'push', 'Bodyweight option');

  -- QUAD EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Barbell Back Squat', quads_id, ARRAY[glutes_id, hamstrings_id], 'barbell', 'squat', 'King of leg exercises'),
    ('Front Squat', quads_id, ARRAY[glutes_id], 'barbell', 'squat', 'Quad emphasis'),
    ('Leg Press', quads_id, ARRAY[glutes_id, hamstrings_id], 'machine', 'squat', 'High load, low fatigue'),
    ('Bulgarian Split Squat', quads_id, ARRAY[glutes_id], 'dumbbell', 'squat', 'Unilateral work'),
    ('Leg Extension', quads_id, '{}', 'machine', 'isolation', 'Quad isolation'),
    ('Hack Squat', quads_id, ARRAY[glutes_id], 'machine', 'squat', 'Quad focus'),
    ('Walking Lunges', quads_id, ARRAY[glutes_id, hamstrings_id], 'dumbbell', 'squat', 'Functional strength'),
    ('Goblet Squat', quads_id, ARRAY[glutes_id], 'dumbbell', 'squat', 'Beginner friendly');

  -- HAMSTRING EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Romanian Deadlift', hamstrings_id, ARRAY[glutes_id, back_id], 'barbell', 'hinge', 'Hip hinge pattern'),
    ('Leg Curl', hamstrings_id, '{}', 'machine', 'isolation', 'Hamstring isolation'),
    ('Stiff-Leg Deadlift', hamstrings_id, ARRAY[glutes_id, back_id], 'barbell', 'hinge', 'Hamstring stretch'),
    ('Nordic Hamstring Curl', hamstrings_id, '{}', 'bodyweight', 'isolation', 'Eccentric strength'),
    ('Glute-Ham Raise', hamstrings_id, ARRAY[glutes_id], 'bodyweight', 'isolation', 'Full hamstring'),
    ('Single-Leg Deadlift', hamstrings_id, ARRAY[glutes_id], 'dumbbell', 'hinge', 'Balance and unilateral'),
    ('Dumbbell RDL', hamstrings_id, ARRAY[glutes_id], 'dumbbell', 'hinge', 'Lighter alternative'),
    ('Cable Pull-Through', hamstrings_id, ARRAY[glutes_id], 'cable', 'hinge', 'Hip hinge pattern');

  -- GLUTE EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Hip Thrust', glutes_id, ARRAY[hamstrings_id], 'barbell', 'hinge', 'Glute builder'),
    ('Glute Bridge', glutes_id, ARRAY[hamstrings_id], 'bodyweight', 'hinge', 'Bodyweight option'),
    ('Bulgarian Split Squat', glutes_id, ARRAY[quads_id], 'dumbbell', 'squat', 'Unilateral work'),
    ('Cable Kickback', glutes_id, '{}', 'cable', 'isolation', 'Glute isolation'),
    ('Step-ups', glutes_id, ARRAY[quads_id], 'dumbbell', 'squat', 'Unilateral functional'),
    ('Smith Machine Hip Thrust', glutes_id, ARRAY[hamstrings_id], 'machine', 'hinge', 'Controlled movement');

  -- CALF EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Standing Calf Raise', calves_id, '{}', 'machine', 'isolation', 'Gastrocnemius focus'),
    ('Seated Calf Raise', calves_id, '{}', 'machine', 'isolation', 'Soleus focus'),
    ('Calf Press on Leg Press', calves_id, '{}', 'machine', 'isolation', 'Heavy loading'),
    ('Dumbbell Calf Raise', calves_id, '{}', 'dumbbell', 'isolation', 'Anywhere option');

  -- ABS EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Cable Crunch', abs_id, '{}', 'cable', 'isolation', 'Weighted ab work'),
    ('Hanging Leg Raise', abs_id, '{}', 'bodyweight', 'isolation', 'Lower ab focus'),
    ('Plank', abs_id, '{}', 'bodyweight', 'isolation', 'Isometric core'),
    ('Ab Wheel', abs_id, '{}', 'bodyweight', 'isolation', 'Full core activation'),
    ('Russian Twist', abs_id, '{}', 'bodyweight', 'isolation', 'Obliques'),
    ('Bicycle Crunch', abs_id, '{}', 'bodyweight', 'isolation', 'Full ab activation');

  -- FOREARM EXERCISES
  INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, movement_pattern, notes) VALUES
    ('Wrist Curl (Barbell)', forearms_id, '{}', 'barbell', 'isolation', 'Flexor development'),
    ('Reverse Wrist Curl', forearms_id, '{}', 'barbell', 'isolation', 'Extensor development'),
    ('Wrist Curl (Dumbbell)', forearms_id, '{}', 'dumbbell', 'isolation', 'Unilateral work'),
    ('Reverse Curl', forearms_id, ARRAY[biceps_id], 'barbell', 'isolation', 'Brachioradialis focus'),
    ('Farmer''s Walk', forearms_id, '{}', 'dumbbell', 'isolation', 'Grip strength'),
    ('Hammer Curl', forearms_id, ARRAY[biceps_id], 'dumbbell', 'isolation', 'Brachioradialis and biceps');

END $$;
