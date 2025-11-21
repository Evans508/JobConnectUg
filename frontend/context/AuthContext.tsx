
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session
    const checkSession = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email!);
        }
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    if (isSupabaseConfigured()) {
      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email!);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUser({
          id: profile.id,
          email: email,
          name: profile.full_name || email.split('@')[0],
          role: (profile.role as UserRole) || UserRole.SEEKER,
          avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          bio: profile.bio,
          skills: profile.skills,
          cvUrl: profile.cv_url
        });
      } else {
        // Fallback if profile missing but auth exists
        setUser({
          id: userId,
          email: email,
          name: email.split('@')[0],
          role: UserRole.SEEKER
        });
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        // MOCK LOGIN for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setUser({
            id: 'mock-user-id',
            email,
            name: 'Demo User',
            role: UserRole.EMPLOYER, // Defaulting to Employer for easier testing of dashboard
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        });
        setIsLoading(false);
        return;
      }

      if (!password) throw new Error("Password is required");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: UserRole, fullName: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        // MOCK SIGNUP for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser({
            id: 'mock-user-id-new',
            email,
            name: fullName,
            role: role,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        });
        setIsLoading(false);
        return;
      }

      // This will trigger the Postgres Trigger to create a user_profile row
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Signup failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
