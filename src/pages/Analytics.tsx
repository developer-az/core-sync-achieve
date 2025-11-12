import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Clock, Flame, Zap, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval, parseISO } from 'date-fns';

interface Workout {
  id: string;
  workout_date: string;
  total_duration: number;
  total_calories: number;
}

interface Exercise {
  type: 'cardio' | 'strength' | 'flexibility';
  duration: number;
}

type TimeRange = 7 | 30 | 90 | 365;

const Analytics = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>(30);

  const fetchData = async () => {
    if (!user) return;

    try {
      const startDate = startOfDay(subDays(new Date(), timeRange));

      // Fetch workouts
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('id, workout_date, total_duration, total_calories')
        .eq('user_id', user.id)
        .gte('workout_date', startDate.toISOString())
        .order('workout_date', { ascending: true });

      if (workoutError) throw workoutError;

      // Fetch exercises for type distribution
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('type, duration, workout_id')
        .in('workout_id', workoutData?.map(w => w.id) || []);

      if (exerciseError) throw exerciseError;

      setWorkouts(workoutData || []);
      setExercises(exerciseData || []);
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, timeRange]);

  // Calculate statistics
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + w.total_duration, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.total_calories, 0);

  // Calculate streak
  const calculateStreak = () => {
    if (workouts.length === 0) return 0;

    const sortedDates = workouts
      .map(w => format(parseISO(w.workout_date), 'yyyy-MM-dd'))
      .sort()
      .reverse();

    let streak = 0;
    let currentDate = new Date();

    for (const dateStr of sortedDates) {
      const workoutDate = parseISO(dateStr);
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Prepare data for workout frequency chart
  const getFrequencyData = () => {
    const startDate = startOfDay(subDays(new Date(), timeRange));
    const endDate = startOfDay(new Date());
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const workoutCounts = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = workouts.filter(w => 
        format(parseISO(w.workout_date), 'yyyy-MM-dd') === dateStr
      ).length;

      return {
        date: format(date, timeRange <= 30 ? 'MMM dd' : 'MMM dd'),
        workouts: count,
      };
    });

    // For longer time ranges, aggregate by week
    if (timeRange > 30) {
      const weeklyData: { [key: string]: number } = {};
      workoutCounts.forEach(item => {
        const weekKey = item.date;
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + item.workouts;
      });

      return Object.entries(weeklyData).map(([date, workouts]) => ({
        date,
        workouts,
      }));
    }

    return workoutCounts;
  };

  // Prepare data for exercise type distribution
  const getExerciseTypeData = () => {
    const typeData = {
      cardio: 0,
      strength: 0,
      flexibility: 0,
    };

    exercises.forEach(exercise => {
      typeData[exercise.type] += exercise.duration || 0;
    });

    return [
      { name: 'Cardio', minutes: typeData.cardio },
      { name: 'Strength', minutes: typeData.strength },
      { name: 'Flexibility', minutes: typeData.flexibility },
    ].filter(item => item.minutes > 0);
  };

  const frequencyData = getFrequencyData();
  const exerciseTypeData = getExerciseTypeData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-cyan mr-3" />
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={timeRange === 7 ? 'default' : 'outline'}
            onClick={() => setTimeRange(7)}
            className={timeRange === 7 ? 'bg-gradient-to-r from-cyan to-purple' : ''}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === 30 ? 'default' : 'outline'}
            onClick={() => setTimeRange(30)}
            className={timeRange === 30 ? 'bg-gradient-to-r from-cyan to-purple' : ''}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 90 ? 'default' : 'outline'}
            onClick={() => setTimeRange(90)}
            className={timeRange === 90 ? 'bg-gradient-to-r from-cyan to-purple' : ''}
          >
            90 Days
          </Button>
          <Button
            variant={timeRange === 365 ? 'default' : 'outline'}
            onClick={() => setTimeRange(365)}
            className={timeRange === 365 ? 'bg-gradient-to-r from-cyan to-purple' : ''}
          >
            1 Year
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
              <Clock className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalMinutes}</div>
              <p className="text-xs text-muted-foreground">Time exercising</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              <Flame className="h-4 w-4 text-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCalories}</div>
              <p className="text-xs text-muted-foreground">Total calories</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Zap className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
              <p className="text-xs text-muted-foreground">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workout Frequency Chart */}
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan" />
                Workout Frequency
              </CardTitle>
              <CardDescription>Number of workouts per day</CardDescription>
            </CardHeader>
            <CardContent>
              {frequencyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs text-muted-foreground"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs text-muted-foreground"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="workouts" 
                      stroke="hsl(var(--cyan))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--cyan))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No workout data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercise Type Distribution Chart */}
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple" />
                Exercise Type Distribution
              </CardTitle>
              <CardDescription>Minutes by exercise type</CardDescription>
            </CardHeader>
            <CardContent>
              {exerciseTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={exerciseTypeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs text-muted-foreground"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs text-muted-foreground"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="minutes" 
                      fill="hsl(var(--purple))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No exercise data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;