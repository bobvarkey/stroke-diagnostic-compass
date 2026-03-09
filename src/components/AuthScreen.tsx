import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Brain, User, Lock, ArrowRight, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthScreenProps {
  onEnterDemoMode?: () => void;
  onSkipToApp?: () => void;
}

export function AuthScreen({ onEnterDemoMode, onSkipToApp }: AuthScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain a number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({ title: 'Username required', variant: 'destructive' });
      return;
    }

    if (username.trim().length > 50) {
      toast({ title: 'Username must be under 50 characters', variant: 'destructive' });
      return;
    }

    if (!password) {
      toast({ title: 'Password required', variant: 'destructive' });
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const pwdError = validatePassword(password);
      if (pwdError) {
        toast({ title: 'Weak password', description: pwdError, variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({ title: 'Passwords do not match', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const result = await signUp(username.trim(), password, username.trim());
      if (result.error) {
        toast({ title: 'Sign up failed', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Account created!', description: 'You are now signed in.' });
      }
    } else {
      const result = await signIn(username.trim(), password);
      if (result.error) {
        toast({ title: 'Sign in failed', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome!', description: `Signed in as ${username}` });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] -top-40 -right-40 animate-glow" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-accent-purple/20 blur-[100px] -bottom-32 -left-32 animate-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-accent-teal/15 blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow" style={{ animationDelay: '3s' }} />

      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="relative w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white uppercase">
            Stroke<span className="text-primary">Suite</span> ID
          </h1>
          <p className="text-slate-500 text-sm tracking-[0.3em] uppercase mt-2">
            Clinical Decision Support
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 glass-strong rounded-2xl p-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs tracking-[0.2em] uppercase">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 pl-12 bg-slate-800/50 border-2 border-slate-600/50 focus:border-primary rounded-xl text-white placeholder:text-slate-600 text-lg font-medium tracking-wide backdrop-blur-sm"
                disabled={loading}
                required
                maxLength={50}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs tracking-[0.2em] uppercase">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 pl-12 bg-slate-800/50 border-2 border-slate-600/50 focus:border-primary rounded-xl text-white placeholder:text-slate-600 text-lg font-medium tracking-wide backdrop-blur-sm"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Confirm Password (sign up only) */}
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-slate-400 text-xs tracking-[0.2em] uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 pl-12 bg-slate-800/50 border-2 border-slate-600/50 focus:border-primary rounded-xl text-white placeholder:text-slate-600 text-lg font-medium tracking-wide backdrop-blur-sm"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-slate-600 text-xs">
                Min 8 chars, uppercase, lowercase, and a number
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-primary to-accent-purple hover:opacity-90 text-white font-bold text-lg tracking-wide rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>

          {/* Toggle Sign Up/Sign In */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setPassword(''); setConfirmPassword(''); }}
              className="text-slate-400 hover:text-white text-sm transition-colors"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Demo Mode Divider */}
          {onEnterDemoMode && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-2 text-slate-500">or</span>
              </div>
            </div>
          )}

          {/* Demo Mode Button */}
          {onEnterDemoMode && (
            <Button
              type="button"
              variant="outline"
              onClick={onEnterDemoMode}
              className="w-full h-12 border-2 border-accent-teal/50 hover:border-accent-teal text-emerald-400 hover:text-emerald-300 hover:bg-accent-teal/10 font-medium tracking-wide rounded-xl transition-all duration-200"
            >
              <Play className="h-4 w-4 mr-2" />
              Try Demo Mode
            </Button>
          )}

          {/* Skip to App Button */}
          {onSkipToApp && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkipToApp}
              className="w-full h-10 text-slate-500 hover:text-slate-300 font-medium tracking-wide rounded-xl transition-all duration-200 text-sm"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Skip — Enter without login
            </Button>
          )}
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-700 text-xs">
            StrokeSuite™ Clinical Decision Support System
          </p>
        </div>
      </div>
    </div>
  );
}
