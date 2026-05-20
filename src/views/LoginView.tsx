import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseAdmin } from '../lib/supabase';

type Mode = 'login' | 'register';

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) setError('メールアドレスまたはパスワードが違います');
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

    const { error } = await signUp(regName.trim(), regEmail, regPassword);
    if (error) setError(error);
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

        {/* タブ切り替え */}
        <div className="flex bg-white/30 backdrop-blur-sm rounded-2xl p-1 mb-4">
          {(['login', 'register'] as Mode[]).map((m) => (
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

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-heading font-bold text-navy mb-5 text-center">ログイン</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setError(''); }}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
                    autoComplete="current-password"
                  />
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
                  {loading ? 'ログイン中...' : 'ログイン'}
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

        <p className="text-center text-white/70 text-xs mt-6">
          {mode === 'login'
            ? 'パスワードを忘れた場合はスタッフにお問い合わせください'
            : 'すでにアカウントをお持ちの方はログインタブへ'}
        </p>
      </motion.div>
    </div>
  );
}
