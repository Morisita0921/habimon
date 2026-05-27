import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPasswordView() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }
    if (password !== confirm) {
      setError('パスワードが一致していません');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await updatePassword(password);
    if (error) {
      setError(error);
    } else {
      setDone(true);
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
      <div className="absolute top-8 left-4 w-24 h-10 bg-white/40 rounded-full blur-sm" />
      <div className="absolute top-16 right-8 w-32 h-12 bg-white/30 rounded-full blur-sm" />

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🐾</div>
          <h1 className="text-3xl font-heading font-bold text-white drop-shadow-md">ハビもん</h1>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          {done ? (
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-lg font-heading font-bold text-navy mb-2">
                パスワードを変更しました！
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                新しいパスワードでログインできます
              </p>
              <button
                onClick={() => signOut()}
                className="w-full py-3 bg-main text-white rounded-xl font-heading font-bold text-base min-h-12 hover:bg-main-dark transition-colors shadow-md"
              >
                ログイン画面へ
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-lg font-heading font-bold text-navy mb-2 text-center">
                新しいパスワードを設定
              </h2>
              <p className="text-xs text-gray-500 text-center mb-5">
                新しいパスワードを入力してください
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    新しいパスワード <span className="text-gray-400 font-normal">（6文字以上）</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="新しいパスワード"
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
                    パスワードの確認
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    placeholder="もう一度入力"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-main focus:outline-none text-sm min-h-12 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
                {error && (
                  <motion.p
                    className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-main text-white rounded-xl font-heading font-bold text-base min-h-12 hover:bg-main-dark transition-colors disabled:opacity-60 shadow-md"
                >
                  {loading ? '更新中...' : 'パスワードを変更する'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
