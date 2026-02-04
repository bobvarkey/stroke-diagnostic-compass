import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Brain, User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const clinicalRoles = [
  { id: 'neurologist', label: 'Neurologist' },
  { id: 'resident', label: 'Resident' },
  { id: 'stroke_nurse', label: 'Stroke Nurse' },
  { id: 'er_physician', label: 'ER Physician' },
  { id: 'radiologist', label: 'Radiologist' },
  { id: 'pharmacist', label: 'Pharmacist' },
];

export function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('neurologist');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({ title: 'Error', description: 'Please enter your credential name', variant: 'destructive' });
      return;
    }
    if (!password.trim() || password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    
    // Try to sign in first
    const signInResult = await signIn(username, password);
    
    if (signInResult.error) {
      // If sign in fails, try to create account
      if (signInResult.error.includes('Invalid login credentials')) {
        const signUpResult = await signUp(username, password, username);
        if (signUpResult.error) {
          toast({ title: 'Authentication Failed', description: signUpResult.error, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome!', description: 'Account created and session established' });
        }
      } else {
        toast({ title: 'Authentication Failed', description: signInResult.error, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Session Established', description: `Welcome back, ${username}` });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="relative w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white uppercase">
            Stroke<span className="text-red-500">Suite</span> ID
          </h1>
          <p className="text-slate-500 text-sm tracking-[0.3em] uppercase mt-2">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credential Name */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs tracking-[0.2em] uppercase">
              Credential Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 pl-12 bg-slate-900/50 border-2 border-red-500/50 focus:border-red-500 rounded-xl text-white placeholder:text-slate-600 text-lg font-medium tracking-wide"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs tracking-[0.2em] uppercase">
              Access Code
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 px-4 bg-slate-900/50 border-2 border-slate-700 focus:border-red-500 rounded-xl text-white placeholder:text-slate-600 text-lg"
              disabled={loading}
            />
          </div>

          {/* Clinical Role Selection */}
          <div className="space-y-3">
            <label className="text-slate-400 text-xs tracking-[0.2em] uppercase">
              Assigned Clinical Role
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
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Establish Session
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>

          <p className="text-center text-slate-600 text-xs">
            New users will be automatically registered
          </p>
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
