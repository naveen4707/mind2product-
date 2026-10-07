-- ==============================================================================
-- FitPlan AI - Supabase Database Schema Migration
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Profiles Table (Stores user fitness parameters, streaks, and targets)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL DEFAULT 'default_user',
  name TEXT DEFAULT 'FitPlan Athlete',
  age INTEGER DEFAULT 26,
  gender TEXT DEFAULT 'Not Specified',
  height_cm NUMERIC DEFAULT 175,
  weight_kg NUMERIC DEFAULT 72,
  goal TEXT DEFAULT 'muscle_gain',
  experience TEXT DEFAULT 'intermediate',
  activity_level TEXT DEFAULT 'moderate',
  available_time INTEGER DEFAULT 30,
  equipment TEXT DEFAULT 'dumbbells',
  location TEXT DEFAULT 'Home Gym',
  dietary_preference TEXT DEFAULT 'High Protein',
  protein_target INTEGER DEFAULT 144,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  total_workout_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Workouts Table (Stores generated workout plans)
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default_user',
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  duration INTEGER NOT NULL,
  rounds INTEGER DEFAULT 3,
  rest_period TEXT DEFAULT '45 seconds',
  experience TEXT DEFAULT 'intermediate',
  estimated_calories INTEGER DEFAULT 280,
  muscle_group TEXT DEFAULT 'Full Body',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  trainer_tip TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Workout Completions Table (Enforces consecutive day streaks and prevents duplicate entries)
CREATE TABLE IF NOT EXISTS public.workout_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default_user',
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER NOT NULL,
  exercises_completed INTEGER NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Prevent same user from recording multiple streak completions on the same date
  CONSTRAINT unique_user_workout_date UNIQUE (user_id, workout_date)
);

-- 4. Protein Entries Table (Daily macro logs with logical day resets)
CREATE TABLE IF NOT EXISTS public.protein_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default_user',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  food_name TEXT NOT NULL,
  protein_grams NUMERIC NOT NULL,
  meal_type TEXT DEFAULT 'Snack', -- 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Shake'
  time_logged TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Daily Check-ins Table (Recovery, energy, and soreness metrics)
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default_user',
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  feeling TEXT NOT NULL DEFAULT 'Good', -- 'Great', 'Good', 'Okay', 'Tired', 'Sore'
  energy_level INTEGER DEFAULT 4, -- 1 to 5
  soreness_level INTEGER DEFAULT 2, -- 1 to 5
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_checkin_date UNIQUE (user_id, checkin_date)
);

-- 6. Achievements Table (Milestones & gamification)
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default_user',
  achievement_type TEXT NOT NULL, -- 'streak_3', 'streak_7', 'first_workout', etc.
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '🏆',
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_type)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts (user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON public.workout_completions (user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_protein_user_date ON public.protein_entries (user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON public.daily_checkins (user_id, checkin_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protein_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Permissive service role and anon policies for development and gateway operations
CREATE POLICY "Allow public full access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to workouts" ON public.workouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to workout_completions" ON public.workout_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to protein_entries" ON public.protein_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to daily_checkins" ON public.daily_checkins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to achievements" ON public.achievements FOR ALL USING (true) WITH CHECK (true);
