import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError('メールアドレスまたはパスワードが違います');
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

        {/* ログインフォーム */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-heading font-bold text-navy mb-5 text-center">ログイン</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="パスワードを入力"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <motion.p
                className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-main text-white rounded-xl font-heading font-bold text-base min-h-12 hover:bg-main-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/70 text-xs mt-6">
          パスワードを忘れた場合はスタッフにお問い合わせください
        </p>
      </motion.div>
    </div>
  );
}
