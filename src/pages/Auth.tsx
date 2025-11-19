import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(mode === 'reset');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp, signIn, user, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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

  const validateForm = () => {
    if (!email || !password) {
      return 'Email and password are required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (isSignUp) {
      const usernameError = validateUsername(username);
      if (usernameError) {
        return usernameError;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      if (!email) {
        return;
      }
      setIsLoading(true);
      try {
        await resetPassword(email);
        setIsForgotPassword(false);
        setEmail('');
      } catch (error) {
        // Error handling is done in the hook
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isResetPassword) {
      if (!password || password.length < 6) {
        return;
      }
      if (password !== confirmPassword) {
        return;
      }
      setIsLoading(true);
      try {
        await updatePassword(password);
      } catch (error) {
        // Error handling is done in the hook
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, username, fitnessLevel);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Dumbbell className="h-12 w-12 text-cyan" />
          <span className="ml-3 text-3xl font-bold text-foreground">CoreSync</span>
        </div>

        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isForgotPassword 
                ? 'Reset Password' 
                : isResetPassword 
                ? 'Set New Password'
                : isSignUp 
                ? 'Create Account' 
                : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {isForgotPassword 
                ? 'Enter your email to receive a reset link'
                : isResetPassword
                ? 'Enter your new password'
                : isSignUp 
                ? 'Start your fitness journey today' 
                : 'Sign in to track your progress'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isForgotPassword && !isResetPassword && isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={isSignUp}
                    maxLength={16}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Only letters and spaces, 3-16 characters
                  </p>
                </div>
              )}

              {!isResetPassword && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">{isResetPassword ? 'New Password' : 'Password'}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={isResetPassword ? 'Enter new password' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              )}

              {isResetPassword && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              )}

              {!isForgotPassword && !isResetPassword && isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fitnessLevel">Fitness Level</Label>
                  <Select value={fitnessLevel} onValueChange={setFitnessLevel} disabled={isLoading}>
                    <SelectTrigger id="fitnessLevel" disabled={isLoading}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - $10/month</SelectItem>
                      <SelectItem value="intermediate">Fitness Athlete - $30 upfront + $30/month</SelectItem>
                      <SelectItem value="advanced">Fitness Boss - $100 upfront + $50/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Processing...
                  </>
                ) : (
                  isForgotPassword 
                    ? 'Send Reset Link'
                    : isResetPassword
                    ? 'Update Password'
                    : isSignUp 
                    ? 'Sign Up' 
                    : 'Sign In'
                )}
              </Button>
            </form>

            {!isResetPassword && (
              <>
                {!isForgotPassword && !isSignUp && (
                  <div className="mt-4 text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-cyan hover:text-cyan/80 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <div className="mt-6 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setIsForgotPassword(false);
                    }}
                    className="text-cyan hover:text-cyan/80 transition-colors"
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign In' 
                      : isForgotPassword
                      ? 'Back to Sign In'
                      : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;