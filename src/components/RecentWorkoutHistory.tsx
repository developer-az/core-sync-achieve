import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Flame, Calendar, Dumbbell, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Workout {
  id: string;
  workout_date: string;
  total_duration: number;
  total_calories: number;
  notes: string | null;
  exercises: {
    name: string;
    type: string;
    sets: number | null;
    reps: number | null;
    duration: number | null;
  }[];
}

export const RecentWorkoutHistory = ({ userId }: { userId: string }) => {
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentWorkouts();
  }, [userId]);

  const fetchRecentWorkouts = async () => {
    try {
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select(`
          id,
          workout_date,
          total_duration,
          total_calories,
          notes,
          exercises (
            name,
            type,
            sets,
            reps,
            duration
          )
        `)
        .eq('user_id', userId)
        .order('workout_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentWorkouts(workouts || []);
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;

      toast.success('Workout deleted successfully');
      // Refresh the list
      await fetchRecentWorkouts();
    } catch (error: any) {
      console.error('Error deleting workout:', error);
      toast.error(error.message || 'Failed to delete workout');
    }
  };

  // Round up duration (20 seconds = 1 minute)
  const roundUpDuration = (seconds: number): number => {
    return Math.ceil(seconds / 60);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-cyan/20 text-cyan border-cyan/30';
      case 'cardio':
        return 'bg-purple/20 text-purple border-purple/30';
      case 'flexibility':
        return 'bg-pink/20 text-pink border-pink/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card shadow-[var(--shadow-card)] animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentWorkouts.length === 0) {
    return (
      <Card className="border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-cyan" />
            Recent Workout History
          </CardTitle>
          <CardDescription>Your last 10 workouts will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No workouts logged yet. Start by logging your first workout!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-cyan" />
          Recent Workout History
        </CardTitle>
        <CardDescription>Your last {recentWorkouts.length} workout{recentWorkouts.length !== 1 ? 's' : ''}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentWorkouts.map((workout) => (
          <div
            key={workout.id}
            className="p-4 rounded-lg border border-border bg-gradient-to-br from-background/50 to-muted/20 hover:border-cyan/50 transition-all"
          >
            {/* Header: Date and Stats */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {format(new Date(workout.workout_date), 'MMM dd, yyyy')}
                </span>
                <span className="text-xs">
                  {format(new Date(workout.workout_date), 'h:mm a')}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4 text-cyan" />
                  <span className="font-semibold text-foreground">
                    {roundUpDuration(workout.total_duration)} min
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Flame className="h-4 w-4 text-pink" />
                  <span className="font-semibold text-foreground">
                    {workout.total_calories} cal
                  </span>
                </div>
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-2">
              {workout.exercises.map((exercise, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-background/60 border border-border/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline" className={getTypeColor(exercise.type)}>
                      {exercise.type}
                    </Badge>
                    <span className="font-medium text-foreground">{exercise.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {exercise.sets && exercise.reps && (
                      <span className="font-medium">
                        {exercise.sets} × {exercise.reps} reps
                      </span>
                    )}
                    {exercise.duration && (
                      <span className="font-medium">
                        {roundUpDuration(exercise.duration)} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {workout.notes && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-sm text-muted-foreground italic">
                  "{workout.notes}"
                </p>
              </div>
            )}

            {/* Delete Button */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteWorkout(workout.id)}
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
