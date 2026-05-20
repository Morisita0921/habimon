import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (name: string, email: string, password: string) => {
    // supabase.auth.signUp() を使うことで確認メールが自動送信される
    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError || !data.user) {
      const msg = authError?.message ?? '';
      if (msg.includes('already been registered') || msg.includes('already exists') || msg.includes('already registered')) {
        return { error: 'このメールアドレスは既に登録されています' };
      }
      return { error: 'アカウントの作成に失敗しました' };
    }

    // プロフィールを先に作成しておく（メール確認前でも作成）
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      name,
      character_name: `${name}のもん`,
      level: 1,
      exp: 0,
      exp_to_next: 100,
      streak: 0,
      total_check_ins: 0,
      badges: [],
      akashi_coins: 0,
      owned_cosmetics: [],
      equipped_cosmetics: [],
      is_admin: false,
      facility_name: 'メタゲーム明石',
    });
    if (profileError) return { error: 'プロフィールの作成に失敗しました' };

    // メール確認が必要なため自動ログインしない
    return { error: null, needsVerification: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
