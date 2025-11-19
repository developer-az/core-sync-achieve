import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Moon, Sun, Edit2, Check, X, Crown, Link2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TokenManagement } from '@/components/TokenManagement';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { fetchTasks, checkApiHealth } from '@/lib/expressApi';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // Express API Demo state
  const [tasks, setTasks] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  
  const [profile, setProfile] = useState({
    username: '',
    fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    fitnessGoals: '',
    avatarUrl: '',
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProfile({
            username: data.username || '',
            fitnessLevel: data.fitness_level || 'beginner',
            fitnessGoals: data.fitness_goals || '',
            avatarUrl: data.avatar_url || '',
          });
          setTempUsername(data.username || '');
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      }
    };

    fetchProfile();
  }, [user]);

  // Check Express API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await checkApiHealth();
        setApiHealthy(true);
        console.log('Express API is healthy:', response);
      } catch (error) {
        setApiHealthy(false);
        console.error('Express API health check failed:', error);
      }
    };

    checkHealth();
  }, []);

  const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
      return 'Username is required';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 16) {
      return 'Username cannot exceed 16 characters';
    }
    // Only allow letters and spaces
    const usernameRegex = /^[a-zA-Z\s]+$/;
    if (!usernameRegex.test(username)) {
      return 'Username can only contain letters and spaces';
    }
    return null;
  };

  const handleUsernameEdit = () => {
    setTempUsername(profile.username);
    setIsEditingUsername(true);
  };

  const handleUsernameSave = async () => {
    const validationError = validateUsername(tempUsername);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: tempUsername.trim() })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, username: tempUsername.trim() });
      setIsEditingUsername(false);
      toast.success('Username updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameCancel = () => {
    setTempUsername(profile.username);
    setIsEditingUsername(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          fitness_level: profile.fitnessLevel,
          fitness_goals: profile.fitnessGoals,
          avatar_url: profile.avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTasks = async () => {
    setApiLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
      toast.success('Tasks fetched successfully from Express API!');
    } catch (error) {
      toast.error('Failed to fetch tasks from Express API');
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Appearance */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="gap-2"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Information */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="username">Username</Label>
                  {!isEditingUsername && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUsernameEdit}
                      className="h-8 gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                  )}
                </div>
                
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="username"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      placeholder="Enter username"
                      maxLength={16}
                      className="flex-1"
                      disabled={loading}
                    />
                    <Button
                      size="sm"
                      onClick={handleUsernameSave}
                      disabled={loading}
                      className="gap-1"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleUsernameCancel}
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 px-3 py-2 bg-muted rounded-md border border-border">
                    <p className="text-foreground">{profile.username || 'No username set'}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Only letters and spaces allowed, max 16 characters
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-2 opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="fitnessLevel">Fitness Level</Label>
                <Select
                  value={profile.fitnessLevel}
                  onValueChange={(value: any) => setProfile({ ...profile, fitnessLevel: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Fitness Athlete)</SelectItem>
                    <SelectItem value="advanced">Advanced (Fitness Boss)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Your fitness level helps personalize recommendations
                </p>
              </div>

              <div>
                <Label htmlFor="goals">Fitness Goals</Label>
                <Textarea
                  id="goals"
                  value={profile.fitnessGoals}
                  onChange={(e) => setProfile({ ...profile, fitnessGoals: e.target.value })}
                  placeholder="What are your fitness goals?"
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </Card>

          {/* API Tokens */}
          <TokenManagement />

          {/* Subscription Management */}
          <Card className="p-6 border-purple/30 bg-gradient-to-br from-cyan/5 to-purple/5">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-6 w-6 text-purple" />
              <h2 className="text-2xl font-semibold text-foreground">Subscription</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
                <div>
                  <Label className="text-base font-semibold">Current Plan</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.fitnessLevel === 'beginner' && 'Beginner - $10/month'}
                    {profile.fitnessLevel === 'intermediate' && 'Fitness Athlete - $30/month'}
                    {profile.fitnessLevel === 'advanced' && 'Fitness Boss - $50/month'}
                  </p>
                  <p className="text-xs text-cyan mt-1">Free trial active</p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                >
                  Upgrade Plan
                </Button>
              </div>
              
              <div className="p-4 bg-card/30 rounded-lg border border-border/50">
                <h3 className="font-medium text-foreground mb-2">What's Included in Your Plan:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan" />
                    AI-powered workout recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan" />
                    Progress tracking and analytics
                  </li>
                  {(profile.fitnessLevel === 'intermediate' || profile.fitnessLevel === 'advanced') && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan" />
                        Computer vision tracking with camera
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan" />
                        Advanced analytics dashboard
                      </li>
                    </>
                  )}
                  {profile.fitnessLevel === 'advanced' && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan" />
                        Premium camera + tripod kit
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan" />
                        Form analysis (Coming Soon)
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </Card>

          {/* Express API Integration Demo (WEB103 Final) */}
          <Card className="p-6 border-cyan/30 bg-gradient-to-br from-cyan/5 to-purple/5">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="h-6 w-6 text-cyan" />
              <h2 className="text-2xl font-semibold text-foreground">Express API Demo</h2>
              <span className="text-xs bg-purple/20 text-purple px-2 py-1 rounded-full">WEB103 Final</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-card/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">API Base URL</Label>
                  {apiHealthy !== null && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apiHealthy 
                        ? 'bg-cyan/20 text-cyan' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {apiHealthy ? '✓ Connected' : '✗ Offline'}
                    </span>
                  )}
                </div>
                <code className="text-xs text-muted-foreground break-all">
                  {import.meta.env.VITE_API_BASE_URL || 'Not configured'}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleFetchTasks}
                  disabled={apiLoading || !apiHealthy}
                  className="flex-1 bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {apiLoading ? 'Fetching...' : 'Fetch Tasks from Express API'}
                </Button>
              </div>

              {tasks.length > 0 && (
                <div className="p-4 bg-card/30 rounded-lg border border-border/50">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan" />
                    Tasks Retrieved from Express API:
                  </h3>
                  <div className="space-y-3">
                    {tasks.map((task: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-4 bg-background/50 rounded-lg border border-border/30 hover:border-cyan/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-foreground font-semibold">
                            {task.title || task.name || task.exercise || `Workout ${index + 1}`}
                          </p>
                          {task.id && (
                            <code className="text-xs text-cyan/70 px-2 py-0.5 bg-cyan/10 rounded">
                              ID: {task.id}
                            </code>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {task.reps && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground">Reps:</span>
                              <span className="text-foreground font-medium">{task.reps}</span>
                            </div>
                          )}
                          {task.sets && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground">Sets:</span>
                              <span className="text-foreground font-medium">{task.sets}</span>
                            </div>
                          )}
                          {task.duration && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="text-foreground font-medium">{task.duration}</span>
                            </div>
                          )}
                          {task.time && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground">Time:</span>
                              <span className="text-foreground font-medium">{task.time}</span>
                            </div>
                          )}
                          {task.type && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground">Type:</span>
                              <span className="text-cyan font-medium capitalize">{task.type}</span>
                            </div>
                          )}
                          {task.weight && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground">Weight:</span>
                              <span className="text-foreground font-medium">{task.weight}</span>
                            </div>
                          )}
                          {task.calories && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground">Calories:</span>
                              <span className="text-purple font-medium">{task.calories}</span>
                            </div>
                          )}
                          {task.date && (
                            <div className="flex items-center gap-1.5 text-xs col-span-2">
                              <span className="text-muted-foreground">Date:</span>
                              <span className="text-foreground font-medium">{task.date}</span>
                            </div>
                          )}
                        </div>
                        
                        {task.notes && (
                          <p className="text-xs text-muted-foreground italic mt-2 pt-2 border-t border-border/50">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Check browser console for full API response details
                  </p>
                </div>
              )}

              <div className="p-3 bg-muted/50 rounded-lg border border-border/30">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Demo Purpose:</strong> This section demonstrates 
                  the integration between the React frontend and Express.js backend API hosted on Render, 
                  fulfilling the RESTful API requirement for WEB103 final project.
                </p>
              </div>
            </div>
          </Card>

          <SubscriptionModal 
            open={showSubscriptionModal}
            onOpenChange={setShowSubscriptionModal}
          />
        </div>
      </main>
    </div>
  );
};

export default Settings;
