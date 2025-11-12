import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingUp, Clock, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardCard } from '@/components/LeaderboardCard';
import { subDays, startOfDay } from 'date-fns';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  total_workouts: number;
  total_minutes: number;
  total_calories: number;
}

type TimePeriod = 'week' | 'month' | 'all';
type MetricType = 'workouts' | 'minutes' | 'calories';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [currentUserRank, setCurrentUserRank] = useState<{ [key in MetricType]: number }>({
    workouts: 0,
    minutes: 0,
    calories: 0,
  });

  const fetchLeaderboard = async () => {
    if (!user) return;

    try {
      let startDate: Date | null = null;

      switch (timePeriod) {
        case 'week':
          startDate = startOfDay(subDays(new Date(), 7));
          break;
        case 'month':
          startDate = startOfDay(subDays(new Date(), 30));
          break;
        case 'all':
          startDate = null;
          break;
      }

      // Build the query
      let query = supabase
        .from('workouts')
        .select(`
          user_id,
          total_duration,
          total_calories,
          profiles!inner(username, avatar_url)
        `);

      if (startDate) {
        query = query.gte('workout_date', startDate.toISOString());
      }

      const { data: workouts, error } = await query;

      if (error) throw error;

      // Aggregate data by user
      const userStats = new Map<string, LeaderboardEntry>();

      workouts?.forEach((workout: any) => {
        const userId = workout.user_id;
        const existing = userStats.get(userId);

        if (existing) {
          existing.total_workouts += 1;
          existing.total_minutes += workout.total_duration;
          existing.total_calories += workout.total_calories;
        } else {
          userStats.set(userId, {
            user_id: userId,
            username: workout.profiles.username,
            avatar_url: workout.profiles.avatar_url,
            total_workouts: 1,
            total_minutes: workout.total_duration,
            total_calories: workout.total_calories,
          });
        }
      });

      const leaderboard = Array.from(userStats.values());
      setLeaderboardData(leaderboard);

      // Calculate current user's rank for each metric
      const sortedByWorkouts = [...leaderboard].sort((a, b) => b.total_workouts - a.total_workouts);
      const sortedByMinutes = [...leaderboard].sort((a, b) => b.total_minutes - a.total_minutes);
      const sortedByCalories = [...leaderboard].sort((a, b) => b.total_calories - a.total_calories);

      setCurrentUserRank({
        workouts: sortedByWorkouts.findIndex(entry => entry.user_id === user.id) + 1,
        minutes: sortedByMinutes.findIndex(entry => entry.user_id === user.id) + 1,
        calories: sortedByCalories.findIndex(entry => entry.user_id === user.id) + 1,
      });

    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user, timePeriod]);

  const getSortedLeaderboard = (metric: MetricType): LeaderboardEntry[] => {
    switch (metric) {
      case 'workouts':
        return [...leaderboardData].sort((a, b) => b.total_workouts - a.total_workouts);
      case 'minutes':
        return [...leaderboardData].sort((a, b) => b.total_minutes - a.total_minutes);
      case 'calories':
        return [...leaderboardData].sort((a, b) => b.total_calories - a.total_calories);
    }
  };

  const getMetricValue = (entry: LeaderboardEntry, metric: MetricType): number => {
    switch (metric) {
      case 'workouts':
        return entry.total_workouts;
      case 'minutes':
        return entry.total_minutes;
      case 'calories':
        return entry.total_calories;
    }
  };

  const getMetricUnit = (metric: MetricType): string => {
    switch (metric) {
      case 'workouts':
        return 'workouts';
      case 'minutes':
        return 'minutes';
      case 'calories':
        return 'calories';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-cyan mr-3" />
            <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={timePeriod === 'week' ? 'default' : 'outline'}
            onClick={() => setTimePeriod('week')}
            className={timePeriod === 'week' ? 'bg-gradient-to-r from-cyan to-purple' : ''}
          >
            This Week
          </Button>
          <Button
            variant={timePeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setTimePeriod('month')}
            className={timePeriod === 'month' ? 'bg-gradient-to-r from-cyan to-purple' : ''}
          >
            This Month
          </Button>
          <Button
            variant={timePeriod === 'all' ? 'default' : 'outline'}
            onClick={() => setTimePeriod('all')}
            className={timePeriod === 'all' ? 'bg-gradient-to-r from-cyan to-purple' : ''}
          >
            All Time
          </Button>
        </div>

        {/* Your Rank Card */}
        {currentUserRank.workouts > 0 && (
          <Card className="border-border bg-gradient-to-r from-cyan/10 to-purple/10 shadow-[var(--shadow-card)] mb-8">
            <CardHeader>
              <CardTitle>Your Rankings</CardTitle>
              <CardDescription>Your position on the leaderboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 text-cyan mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">#{currentUserRank.workouts}</p>
                  <p className="text-sm text-muted-foreground">Workouts</p>
                </div>
                <div className="text-center">
                  <Clock className="h-6 w-6 text-purple mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">#{currentUserRank.minutes}</p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
                <div className="text-center">
                  <Flame className="h-6 w-6 text-cyan mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">#{currentUserRank.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="minutes" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Minutes
            </TabsTrigger>
            <TabsTrigger value="calories" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Calories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-4 animate-fade-in">
            {getSortedLeaderboard('workouts').length > 0 ? (
              getSortedLeaderboard('workouts').map((entry, index) => (
                <LeaderboardCard
                  key={entry.user_id}
                  rank={index + 1}
                  username={entry.username}
                  avatarUrl={entry.avatar_url}
                  value={getMetricValue(entry, 'workouts')}
                  unit={getMetricUnit('workouts')}
                  isCurrentUser={entry.user_id === user?.id}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No data yet</h3>
                <p className="text-muted-foreground">
                  Complete workouts to appear on the leaderboard
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="minutes" className="space-y-4 animate-fade-in">
            {getSortedLeaderboard('minutes').length > 0 ? (
              getSortedLeaderboard('minutes').map((entry, index) => (
                <LeaderboardCard
                  key={entry.user_id}
                  rank={index + 1}
                  username={entry.username}
                  avatarUrl={entry.avatar_url}
                  value={getMetricValue(entry, 'minutes')}
                  unit={getMetricUnit('minutes')}
                  isCurrentUser={entry.user_id === user?.id}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No data yet</h3>
                <p className="text-muted-foreground">
                  Complete workouts to appear on the leaderboard
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calories" className="space-y-4 animate-fade-in">
            {getSortedLeaderboard('calories').length > 0 ? (
              getSortedLeaderboard('calories').map((entry, index) => (
                <LeaderboardCard
                  key={entry.user_id}
                  rank={index + 1}
                  username={entry.username}
                  avatarUrl={entry.avatar_url}
                  value={getMetricValue(entry, 'calories')}
                  unit={getMetricUnit('calories')}
                  isCurrentUser={entry.user_id === user?.id}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No data yet</h3>
                <p className="text-muted-foreground">
                  Complete workouts to appear on the leaderboard
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;