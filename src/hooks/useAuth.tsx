import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
}

interface UserRole {
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signUp: (username: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile and role
        setTimeout(async () => {
          await fetchProfileAndRole(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileAndRole = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (roleData) {
        setIsAdmin((roleData as UserRole).role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching profile/role:', error);
    }
  };

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    // Convert username to email format for Supabase auth
    const email = `${username.toLowerCase()}@strokesuite.local`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const signUp = async (username: string, password: string, displayName?: string): Promise<{ error: string | null }> => {
    // Check if username already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingProfile) {
      return { error: 'Username already taken' };
    }

    // Convert username to email format for Supabase auth
    const email = `${username.toLowerCase()}@strokesuite.local`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || username,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Update profile with proper username
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ username: username.toLowerCase(), display_name: displayName || username })
        .eq('user_id', data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
