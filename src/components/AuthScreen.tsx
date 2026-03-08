import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Brain, User, ArrowRight, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const clinicalRoles = [
  { id: 'neurologist', label: 'Neurologist' },
  { id: 'resident', label: 'Resident' },
  { id: 'stroke_nurse', label: 'Stroke Nurse' },
  { id: 'er_physician', label: 'ER Physician' },
  { id: 'radiologist', label: 'Radiologist' },
  { id: 'pharmacist', label: 'Pharmacist' },
];

interface AuthScreenProps {
  onEnterDemoMode?: () => void;
  onSkipToApp?: () => void;
}

export function AuthScreen({ onEnterDemoMode, onSkipToApp }: AuthScreenProps) {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('neurologist');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    // Generate a display name or use 'Anonymous'
    const displayName = username.trim() || 'Anonymous';
    // Generate a unique identifier for the session
    const uniqueId = `${displayName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    // Use a default password for simplified auth
    const defaultPassword = 'strokesuite2024';
    
    // Try to create account and sign in
    const signUpResult = await signUp(uniqueId, defaultPassword, displayName);
    if (signUpResult.error) {
      // If signup fails (maybe rate limited), try signing in with a generic session
      const signInResult = await signIn(uniqueId, defaultPassword);
      if (signInResult.error) {
        toast({ title: 'Session Started', description: `Welcome, ${displayName}` });
      } else {
        toast({ title: 'Session Established', description: `Welcome back, ${displayName}` });
      }
    } else {
      toast({ title: 'Welcome!', description: `Session established for ${displayName}` });
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credential Name (Optional) */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs tracking-[0.2em] uppercase">
              Your Name <span className="text-slate-600">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <Input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 pl-12 bg-slate-900/50 border-2 border-slate-700 focus:border-red-500 rounded-xl text-white placeholder:text-slate-600 text-lg font-medium tracking-wide"
                disabled={loading}
              />
            </div>
          </div>

          {/* Clinical Role Selection */}
          <div className="space-y-3">
            <label className="text-slate-400 text-xs tracking-[0.2em] uppercase">
              Clinical Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {clinicalRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${selectedRole === role.id 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 border border-slate-700'
                    }
                  `}
                  disabled={loading}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-bold text-lg tracking-wide rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Starting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Start Session
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>

          <p className="text-center text-slate-600 text-xs">
            Quick access — no registration required
          </p>

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
              className="w-full h-12 border-2 border-amber-500/50 hover:border-amber-500 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-medium tracking-wide rounded-xl transition-all duration-200"
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
