-- Create enum for exercise types
CREATE TYPE exercise_type AS ENUM ('cardio', 'strength', 'flexibility');

-- Create workouts table
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  total_calories INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table (individual exercises within a workout)
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type exercise_type NOT NULL,
  sets INTEGER,
  reps INTEGER,
  duration INTEGER, -- in minutes
  weight DECIMAL(10, 2), -- in lbs or kg
  calories_burned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS policies for workouts
CREATE POLICY "Users can view their own workouts"
  ON public.workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON public.workouts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for exercises (check via workout ownership)
CREATE POLICY "Users can view exercises from their workouts"
  ON public.exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exercises for their workouts"
  ON public.exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises from their workouts"
  ON public.exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises from their workouts"
  ON public.exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Create trigger for workouts updated_at
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_date ON public.workouts(workout_date DESC);
CREATE INDEX idx_exercises_workout_id ON public.exercises(workout_id);