import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!error && !!data);
  };

  const setupEncryptedProfile = async (userId: string, email?: string | null) => {
    if (!email) return;
    await supabase.functions.invoke('process-signup', {
      body: { userId, email },
    });
  };

  const fetchProfile = async (userId: string, email?: string | null) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-profile', {
        body: { userId },
      });

      if (error) throw error;

      if (data?.needsSetup) {
        await setupEncryptedProfile(userId, email);
        const { data: retryData, error: retryError } = await supabase.functions.invoke('get-profile', {
          body: { userId },
        });
        if (retryError) throw retryError;
        if (retryData?.profile) {
          setProfile(retryData.profile as Profile);
        }
        return;
      }

      if (data?.profile) {
        setProfile(data.profile as Profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const ensureProfile = async (user: { id: string; email?: string }) => {
    const { data, error } = await supabase.functions.invoke('get-profile', {
      body: { userId: user.id },
    });

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data?.needsSetup) {
      await setupEncryptedProfile(user.id, user.email);
      const { data: newData } = await supabase.functions.invoke('get-profile', {
        body: { userId: user.id },
      });
      if (newData?.profile) {
        setProfile(newData.profile as Profile);
      }
      return;
    }

    if (data?.profile) {
      setProfile(data.profile as Profile);
    }
  };

  useEffect(() => {
    const restoreMobileCheckoutSession = async () => {
      if (typeof window === 'undefined' || !window.location.hash) return null;

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      if (hashParams.get('type') !== 'mobile_checkout') return null;

      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      if (!access_token || !refresh_token) return null;

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Mobile checkout session restore failed:', error);
        return null;
      }

      window.history.replaceState(
        null,
        document.title,
        `${window.location.pathname}${window.location.search}`
      );

      return data.session;
    };

    const initSession = async () => {
      const restoredSession = await restoreMobileCheckoutSession();
      const currentSession = restoredSession ?? (await supabase.auth.getSession()).data.session;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.email);
        checkAdminRole(currentSession.user.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Use ensureProfile to auto-create profile for new Google OAuth users
        ensureProfile(session.user);
        checkAdminRole(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('signin', {
        body: { email, password },
      });

      if (error || !data.success) {
        throw new Error(error?.message || data?.error || 'Signin failed');
      }

      const { error: sessionError } = await supabase.auth.setSession(data.session);
      if (sessionError) throw sessionError;

      setProfile(data.profile);
      if (data.session?.user?.id) {
        await checkAdminRole(data.session.user.id);
      }
      return { error: null };
    } catch (err: any) {
      console.error('Signin error:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (data.user && !error) {
      try {
        await supabase.functions.invoke('process-signup', {
          body: { userId: data.user.id, email: data.user.email },
        });
        // After signup and processing, fetch the profile
        fetchProfile(data.user.id, data.user.email);
      } catch (err) {
        console.error('Failed to process signup profile:', err);
      }
    }

    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear all Supabase auth artifacts from storage
    const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-'));
    keys.forEach(k => localStorage.removeItem(k));
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, signIn, signUp, signInWithGoogle, signOut }}>
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
