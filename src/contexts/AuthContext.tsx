import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isRecoveryMode: boolean;
  justVerified: boolean;
  clearJustVerified: () => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  clearRecoveryMode: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [justVerified, setJustVerified] = useState(false);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSession(session);
        setIsRecoveryMode(true);
        if (session?.user) fetchProfile(session.user.id);
        return;
      }
      // メール認証完了（確認リンクをクリックした直後）はサインアウトしてログイン画面へ
      if (event === 'SIGNED_IN' && window.location.hash.includes('type=signup')) {
        supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        setJustVerified(true);
        // URLハッシュをクリア
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
      setSession(session);
      if (session?.user) {
        // ローディング表示はしない（MainAppのアンマウント→currentViewリセットを防ぐ）
        // プロフィール未取得の場合はuseUserData内のスピナーが代わりに表示される
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
    // Admin API を使用：確認メール不要・レート制限を回避
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError || !data.user) {
      const msg = authError?.message ?? '';
      if (msg.includes('already been registered') || msg.includes('already exists') || msg.includes('already registered')) {
        return { error: 'このメールアドレスは既に登録されています' };
      }
      return { error: 'アカウントの作成に失敗しました' };
    }

    // プロフィール作成
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
    if (profileError) {
      if (profileError.code === '23503') {
        return { error: 'このメールアドレスは既に登録されています' };
      }
      return { error: 'プロフィールの作成に失敗しました' };
    }

    // 確認メール不要・すぐログイン可能
    return { error: null, needsVerification: false };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsRecoveryMode(false);
    // ログアウト時に保存していたビュー状態をクリア
    sessionStorage.removeItem('habimon_view');
    // パスワードリセットリンク等のURLハッシュをクリア
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) {
      console.error('resetPasswordForEmail error:', error.message);
      if (error.message.includes('rate limit') || error.message.includes('too many')) {
        return { error: 'メールの送信上限に達しました。1時間ほど待ってから再試行してください。' };
      }
      return { error: 'メールの送信に失敗しました。時間をおいて再試行してください。' };
    }
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: 'パスワードの更新に失敗しました' };
    // isRecoveryMode は signOut() 時にクリアする（ここでfalseにするとMainAppに飛んでしまう）
    return { error: null };
  };

  const clearRecoveryMode = () => setIsRecoveryMode(false);
  const clearJustVerified = () => setJustVerified(false);

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
      isRecoveryMode,
      justVerified,
      clearJustVerified,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      sendPasswordResetEmail,
      updatePassword,
      clearRecoveryMode,
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
