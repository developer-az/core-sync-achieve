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
import { ArrowLeft, Moon, Sun, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TokenManagement } from '@/components/TokenManagement';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  
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

  const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
      return 'Username is required';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 12) {
      return 'Username cannot exceed 12 characters';
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
                      maxLength={12}
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
                  Only letters and spaces allowed, max 12 characters
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

          {/* Subscription Info (Placeholder) */}
          <Card className="p-6 border-purple/30">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Subscription</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Current Plan</Label>
                  <p className="text-sm text-muted-foreground">Free Trial</p>
                </div>
                <Button variant="outline" size="sm">
                  Upgrade Plan
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Subscription management coming soon
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
