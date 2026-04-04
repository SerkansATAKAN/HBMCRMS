import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '@/types';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  currentUser: User | null;
  isLoading: boolean;
  /** URL'de davet/şifre sıfırlama token'ı var, yeni şifre girilmesi gerekiyor */
  needsPasswordSet: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setNewPassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    avatar: row.avatar ?? undefined,
    isActive: row.is_active,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPasswordSet, setNeedsPasswordSet] = useState(false);

  const loadProfile = async (email: string) => {
    try {
      const { data } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      if (data) setCurrentUser(mapUser(data));
    } catch {
      // profil yüklenemedi, currentUser null kalır
    }
  };

  useEffect(() => {
    // Davet / şifre sıfırlama token'ı URL hash'inde var mı?
    const hash = window.location.hash;
    if (hash.includes('type=invite') || hash.includes('type=recovery')) {
      setNeedsPasswordSet(true);
    }

    // Mevcut oturumu al
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        if (session?.user?.email) {
          await loadProfile(session.user.email);
        }
      })
      .catch(() => { /* session okunamadı */ })
      .finally(() => setIsLoading(false));

    // Auth değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        setNeedsPasswordSet(true);
      }

      if (session?.user?.email) {
        await loadProfile(session.user.email);
      } else if (!session) {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setNeedsPasswordSet(false);
  };

  const setNewPassword = async (password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      setNeedsPasswordSet(false);
      // Hash'i URL'den temizle
      window.history.replaceState(null, '', window.location.pathname);
    }
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider value={{ session, currentUser, isLoading, needsPasswordSet, signIn, signOut, setNewPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
