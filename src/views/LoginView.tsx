import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseAdmin } from '../lib/supabase';

type Mode = 'login' | 'register' | 'verify';

const MAX_ATTEMPTS = 5;          // 最大失敗回数
const LOCK_MINUTES = 10;         // ロック時間（分）
const LOCK_DURATION_MS = LOCK_MINUTES * 60 * 1000;
const STORAGE_KEY = 'login_lock';

interface LockState { attempts: number; lockedUntil: number | null; }

function getLockState(): LockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { attempts: 0, lockedUntil: null };
}
function saveLockState(state: LockState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function clearLockState() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function LoginView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  // ログイン
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 新規登録
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCode, setRegCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ロック状態
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);

  const calcSecondsLeft = useCallback(() => {
    const { lockedUntil } = getLockState();
    if (!lockedUntil) return 0;
    return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  }, []);

  useEffect(() => {
    const secs = calcSecondsLeft();
    setLockSecondsLeft(secs);
    if (secs <= 0) return;
    const timer = setInterval(() => {
      const s = calcSecondsLeft();
      setLockSecondsLeft(s);
      if (s <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [calcSecondsLeft]);

  const isLocked = lockSecondsLeft > 0;
  const lockMins = Math.floor(lockSecondsLeft / 60);
  const lockSecs = lockSecondsLeft % 60;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (!loginEmail || !loginPassword) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      const state = getLockState();
      const newAttempts = state.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCK_DURATION_MS;
        saveLockState({ attempts: newAttempts, lockedUntil });
        setLockSecondsLeft(LOCK_MINUTES * 60);
        setError(`ログインに${MAX_ATTEMPTS}回失敗しました。${LOCK_MINUTES}分後に再試行してください。`);
      } else {
        saveLockState({ attempts: newAttempts, lockedUntil: null });
        setError(`メールアドレスまたはパスワードが違います（あと${MAX_ATTEMPTS - newAttempts}回失敗するとロックされます）`);
      }
    } else {
      clearLockState();
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail || !regPassword || !regCode) {
      setError('すべての項目を入力してください');
      return;
    }
    if (regPassword.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }
    setLoading(true);
    setError('');

    // 施設コードを確認
    const { data: rows } = await supabaseAdmin
      .from('facility_settings')
      .select('value')
      .eq('key', 'registration_code')
      .single();

    const storedCode = rows?.value ?? '';
    if (!storedCode) {
      setError('現在、自己登録は受け付けていません。スタッフにお問い合わせください。');
      setLoading(false);
      return;
    }
    if (regCode.trim() !== storedCode) {
      setError('施設コードが違います。スタッフに確認してください。');
      setLoading(false);
      return;
    }

    const { error, needsVerification } = await signUp(regName.trim(), regEmail, regPassword);
    if (error) {
      setError(error);
    } else if (needsVerification) {
      setVerifyEmail(regEmail);
      setMode('verify');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 40%, #E8F8FF 70%, #FFF8F0 100%)',
      }}
    >
      {/* 雲の演出 */}
      <div className="absolute top-8 left-4 w-24 h-10 bg-white/40 rounded-full blur-sm" />
      <div className="absolute top-16 right-8 w-32 h-12 bg-white/30 rounded-full blur-sm" />

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🐾</div>
          <h1 className="text-3xl font-heading font-bold text-white drop-shadow-md">ハビもん</h1>
          <p className="text-white/80 text-sm mt-1">メタゲーム明石</p>
        </div>

        {/* タブ切り替え（verify 時は非表示） */}
        {mode !== 'verify' && (
          <div className="flex bg-white/30 backdrop-blur-sm rounded-2xl p-1 mb-4">
            {(['login', 'register'] as ('login' | 'register')[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-heading font-bold transition-all ${
                  mode === m
                    ? 'bg-white text-navy shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {m === 'login' ? 'ログイン' : '新規登録'}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'verify' ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-blue-500" />
              </div>
              <h2 className="text-lg font-heading font-bold text-navy mb-2">
                メールを確認してください
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                以下のアドレスに確認メールを送りました
              </p>
              <p className="text-sm font-bold text-blue-600 bg-blue-50 rounded-xl px-4 py-2 mb-4 break-all">
                {verifyEmail}
              </p>
              <p className="text-xs text-gray-400 mb-6">
                メール内の「メールアドレスを確認する」ボタンを押すと、アカウントが有効化されます。その後ログインしてください。
              </p>
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="w-full py-3 bg-main text-white rounded-xl font-heading font-bold text-base min-h-12 hover:bg-main-dark transition-colors shadow-md"
              >
                ログイン画面へ
              </button>
              <p className="text-xs text-gray-400 mt-3">
                メールが届かない場合はスタッフにお問い合わせください
              </p>
            </motion.div>
          ) : mode === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-heading font-bold text-navy mb-5 text-center">ログイン</h2>

              {/* ロック中バナー */}
              {isLocked && (
                <motion.div
                  className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 mb-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Lock size={20} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-600">ログインがロックされています</p>
                    <p className="text-xs text-red-400">
                      解除まで：{lockMins}分{String(lockSecs).padStart(2, '0')}秒
                    </p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setError(''); }}
                    placeholder="example@email.com"
                    disabled={isLocked}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors disabled:opacity-50 disabled:bg-gray-50"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">パスワード</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setError(''); }}
                    placeholder="パスワードを入力"
                    disabled={isLocked}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors disabled:opacity-50 disabled:bg-gray-50"
                    autoComplete="current-password"
                  />
                </div>
                {error && !isLocked && (
                  <motion.p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.p>
                )}
                <button
                  type="submit"
                  disabled={loading || isLocked}
                  className="w-full py-3 bg-main text-white rounded-xl font-heading font-bold text-base min-h-12 hover:bg-main-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                  {isLocked ? `🔒 ${lockMins}分${String(lockSecs).padStart(2, '0')}秒 後に解除` : loading ? 'ログイン中...' : 'ログイン'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-heading font-bold text-navy mb-5 text-center">アカウントを作成</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    なまえ <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => { setRegName(e.target.value); setError(''); }}
                    placeholder="山田 太郎"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    メールアドレス <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => { setRegEmail(e.target.value); setError(''); }}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    パスワード <span className="text-red-400">*</span>
                    <span className="text-gray-400 font-normal ml-1">（6文字以上）</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setError(''); }}
                      placeholder="パスワードを設定"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    施設コード <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={regCode}
                    onChange={(e) => { setRegCode(e.target.value); setError(''); }}
                    placeholder="スタッフから聞いたコードを入力"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-400 mt-1">施設コードはスタッフにお問い合わせください</p>
                </div>
                {error && (
                  <motion.p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-main text-white rounded-xl font-heading font-bold text-base min-h-12 hover:bg-main-dark transition-colors disabled:opacity-60 shadow-md"
                >
                  {loading ? '登録中...' : 'アカウントを作成'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {mode !== 'verify' && (
          <p className="text-center text-white/70 text-xs mt-6">
            {mode === 'login'
              ? 'パスワードを忘れた場合はスタッフにお問い合わせください'
              : 'すでにアカウントをお持ちの方はログインタブへ'}
          </p>
        )}
      </motion.div>
    </div>
  );
}
