import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Target, Trophy, TrendingUp, Users, Zap, Settings, Calendar, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { format, parseISO, startOfWeek, isWithinInterval, subDays, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface Workout {
  id: string;
  workout_date: string;
  total_duration: number;
  total_calories: number;
}

interface Goal {
  id: string;
  title: string;
  current_value: number;
  target_value: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const quickActions = [
    { icon: Dumbbell, label: 'Log Workout', color: 'cyan', onClick: () => navigate('/workout/log') },
    { icon: Target, label: 'My Goals', color: 'purple', onClick: () => navigate('/goals') },
    { icon: Trophy, label: 'Achievements', color: 'pink', onClick: () => navigate('/achievements') },
    { icon: TrendingUp, label: 'Analytics', color: 'cyan', onClick: () => navigate('/analytics') },
    { icon: Users, label: 'Leaderboard', color: 'purple', onClick: () => navigate('/leaderboard') },
    { icon: Zap, label: 'Recommendations', color: 'pink', onClick: () => navigate('/recommendations') },
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch workouts
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('id, workout_date, total_duration, total_calories')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(5);

      if (workoutError) throw workoutError;

      // Fetch active goals
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('id, title, current_value, target_value, unit, deadline, completed')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('deadline', { ascending: true })
        .limit(3);

      if (goalError) throw goalError;

      setWorkouts(workoutData || []);
      setGoals(goalData || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate this week's workout count
  const getWorkoutsThisWeek = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return workouts.filter(w => 
      isWithinInterval(parseISO(w.workout_date), { start: weekStart, end: new Date() })
    ).length;
  };

  // Calculate current streak
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

  const workoutsThisWeek = getWorkoutsThisWeek();
  const currentStreak = calculateStreak();
  const activeGoalsCount = goals.length;
  const totalWorkouts = workouts.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card border-cyan/30 animate-fade-in">
            <div className="text-4xl mb-2">💪</div>
            <p className="text-muted-foreground text-sm mb-1">Workouts This Week</p>
            <p className="text-3xl font-bold text-foreground">{workoutsThisWeek}</p>
          </Card>
          <Card className="p-6 bg-card border-purple/30 animate-fade-in">
            <div className="text-4xl mb-2">🔥</div>
            <p className="text-muted-foreground text-sm mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-foreground">{currentStreak} days</p>
          </Card>
          <Card className="p-6 bg-card border-pink/30 animate-fade-in">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-muted-foreground text-sm mb-1">Active Goals</p>
            <p className="text-3xl font-bold text-foreground">{activeGoalsCount}</p>
          </Card>
          <Card className="p-6 bg-card border-cyan/30 animate-fade-in">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-muted-foreground text-sm mb-1">Total Workouts</p>
            <p className="text-3xl font-bold text-foreground">{totalWorkouts}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="p-6 cursor-pointer transition-all hover:scale-105 border-2 hover:shadow-lg"
                onClick={action.onClick}
              >
                <action.icon className={`w-8 h-8 mb-3 mx-auto text-${action.color}`} />
                <p className="text-foreground text-sm font-medium text-center">{action.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Goals Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Active Goals</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/goals')}
            >
              View All
            </Button>
          </div>
          
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card 
                    key={goal.id} 
                    className="border-border bg-card shadow-[var(--shadow-card)] cursor-pointer transition-all hover:scale-105"
                    onClick={() => navigate('/goals')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Target className="h-5 w-5 text-cyan" />
                        {goal.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-center text-cyan font-medium">
                          {Math.round(progress)}% Complete
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                        <Calendar className="h-4 w-4" />
                        <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Overdue'}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 bg-card border-purple/30">
              <div className="text-center">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Goals</h3>
                <p className="text-muted-foreground mb-4">Create your first goal to start tracking your progress</p>
                <Button 
                  onClick={() => navigate('/goals')}
                  className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                >
                  Create Goal
                </Button>
              </div>
            </Card>
          )}
        </div>
        
        {/* Recent Workouts Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Recent Workouts</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/analytics')}
            >
              View Analytics
            </Button>
          </div>
          
          {workouts.length > 0 ? (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <Card 
                  key={workout.id} 
                  className="border-border bg-card shadow-[var(--shadow-card)] cursor-pointer transition-all hover:scale-[1.02]"
                  onClick={() => navigate('/analytics')}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {format(parseISO(workout.workout_date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{workout.total_duration} min</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>{workout.total_calories} cal</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 bg-card border-cyan/30">
              <div className="text-center">
                <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Workouts Yet</h3>
                <p className="text-muted-foreground mb-4">Start logging your workouts to track your progress</p>
                <Button 
                  onClick={() => navigate('/workout/log')}
                  className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                >
                  Log Your First Workout
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
