import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type ExerciseType = 'cardio' | 'strength' | 'flexibility';

interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets?: number;
  reps?: number;
  duration?: number;
  weight?: number;
}

const WorkoutLog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: crypto.randomUUID(), name: '', type: 'strength', sets: 0, reps: 0, duration: 0, weight: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addExercise = () => {
    setExercises([...exercises, {
      id: crypto.randomUUID(),
      name: '',
      type: 'strength',
      sets: 0,
      reps: 0,
      duration: 0,
      weight: 0
    }]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter(ex => ex.id !== id));
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const calculateCalories = (exercise: Exercise): number => {
    // Simple calorie estimation based on exercise type
    const duration = exercise.duration || 0;
    const sets = exercise.sets || 0;
    const reps = exercise.reps || 0;
    
    switch (exercise.type) {
      case 'cardio':
        return Math.round(duration * 8); // ~8 cal/min
      case 'strength':
        return Math.round((sets * reps) * 0.5); // rough estimate
      case 'flexibility':
        return Math.round(duration * 3); // ~3 cal/min
      default:
        return 0;
    }
  };

  const calculateTotalDuration = (): number => {
    return exercises.reduce((total, ex) => total + (ex.duration || 0), 0);
  };

  const calculateTotalCalories = (): number => {
    return exercises.reduce((total, ex) => total + calculateCalories(ex), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to log workouts');
      return;
    }

    // Validate exercises
    const validExercises = exercises.filter(ex => ex.name.trim() !== '');
    if (validExercises.length === 0) {
      toast.error('Please add at least one exercise with a name');
      return;
    }

    setIsLoading(true);
    try {
      const totalDuration = calculateTotalDuration();
      const totalCalories = calculateTotalCalories();

      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          total_duration: totalDuration,
          total_calories: totalCalories,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create exercises
      const exercisesData = validExercises.map(ex => ({
        workout_id: workout.id,
        name: ex.name,
        type: ex.type,
        sets: ex.sets || null,
        reps: ex.reps || null,
        duration: ex.duration || null,
        weight: ex.weight || null,
        calories_burned: calculateCalories(ex),
      }));

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      toast.success('Workout logged successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error logging workout:', error);
      toast.error(error.message || 'Failed to log workout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Dumbbell className="h-8 w-8 text-cyan mr-3" />
          <h1 className="text-3xl font-bold text-foreground">Log Workout</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercises */}
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>Add the exercises you completed in this workout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exercises.map((exercise, index) => (
                <div key={exercise.id} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Exercise {index + 1}</span>
                    {exercises.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(exercise.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${exercise.id}`}>Exercise Name *</Label>
                      <Input
                        id={`name-${exercise.id}`}
                        value={exercise.name}
                        onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                        placeholder="e.g., Bench Press, Running"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`type-${exercise.id}`}>Type *</Label>
                      <Select
                        value={exercise.type}
                        onValueChange={(value) => updateExercise(exercise.id, 'type', value as ExerciseType)}
                      >
                        <SelectTrigger id={`type-${exercise.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="flexibility">Flexibility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {exercise.type === 'strength' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
                          <Input
                            id={`sets-${exercise.id}`}
                            type="number"
                            min="0"
                            value={exercise.sets || ''}
                            onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                          <Input
                            id={`reps-${exercise.id}`}
                            type="number"
                            min="0"
                            value={exercise.reps || ''}
                            onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`weight-${exercise.id}`}>Weight (lbs)</Label>
                          <Input
                            id={`weight-${exercise.id}`}
                            type="number"
                            min="0"
                            step="0.5"
                            value={exercise.weight || ''}
                            onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`duration-${exercise.id}`}>Duration (minutes)</Label>
                      <Input
                        id={`duration-${exercise.id}`}
                        type="number"
                        min="0"
                        value={exercise.duration || ''}
                        onChange={(e) => updateExercise(exercise.id, 'duration', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Est. Calories</Label>
                      <div className="h-10 flex items-center px-3 bg-muted rounded-md text-foreground font-medium">
                        {calculateCalories(exercise)} cal
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addExercise}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </CardContent>
          </Card>

          {/* Workout Summary */}
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Workout Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Total Duration</Label>
                <p className="text-2xl font-bold text-foreground">{calculateTotalDuration()} min</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Calories</Label>
                <p className="text-2xl font-bold text-cyan">{calculateTotalCalories()} cal</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Optional notes about this workout</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you feel? Any observations?"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-cyan to-purple hover:opacity-90"
            >
              {isLoading ? 'Saving...' : 'Save Workout'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutLog;