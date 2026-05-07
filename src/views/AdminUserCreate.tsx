import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabase';

interface Props {
  onCreated: () => void;
}

export default function AdminUserCreate({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successName, setSuccessName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('名前・メールアドレス・パスワードは必須です');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !data.user) {
      const msg = authError?.message ?? '';
      if (msg.includes('already been registered') || msg.includes('already exists')) {
        setError('このメールアドレスは既に登録されています');
      } else if (msg.includes('invalid') && msg.includes('email')) {
        setError('メールアドレスの形式が正しくありません');
      } else if (msg.includes('password')) {
        setError('パスワードは6文字以上にしてください');
      } else {
        setError('アカウントの作成に失敗しました: ' + msg);
      }
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      name,
      character_name: characterName || `${name}のもん`,
      level: 1,
      exp: 0,
      exp_to_next: 100,
      streak: 0,
      total_check_ins: 0,
      badges: [],
      akashi_coins: 0,
      owned_cosmetics: [],
      equipped_cosmetics: [],
      is_admin: isAdmin,
      facility_name: 'メタゲーム明石',
    });

    if (profileError) {
      setError('プロフィールの作成に失敗しました: ' + profileError.message);
      setLoading(false);
      return;
    }

    setSuccessName(name);
    setName('');
    setEmail('');
    setPassword('');
    setCharacterName('');
    setIsAdmin(false);
    setLoading(false);
    onCreated();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pt-0">
      <div className="max-w-md mx-auto">
        {successName && (
          <motion.div
            className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle size={20} className="flex-shrink-0" />
            <span className="font-heading font-bold">{successName} さんのアカウントを作成しました</span>
          </motion.div>
        )}

        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-navy/10 rounded-xl flex items-center justify-center">
              <UserPlus size={20} className="text-navy" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-navy text-lg">メンバーを追加</h2>
              <p className="text-xs text-gray-400">新しい利用者のアカウントを作成します</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                名前 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); setSuccessName(''); }}
                placeholder="山田 太郎"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy focus:outline-none text-sm min-h-12 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); setSuccessName(''); }}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy focus:outline-none text-sm min-h-12 transition-colors"
                autoComplete="off"
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
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); setSuccessName(''); }}
                  placeholder="初期パスワードを設定"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-navy focus:outline-none text-sm min-h-12 transition-colors"
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
                キャラクター名
                <span className="text-gray-400 font-normal ml-1">（任意・省略可）</span>
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => { setCharacterName(e.target.value); setSuccessName(''); }}
                placeholder={name ? `${name}のもん` : 'はびちゃん'}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy focus:outline-none text-sm min-h-12 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    isAdmin ? 'bg-navy' : 'bg-gray-300'
                  }`}
                  onClick={() => { setIsAdmin(!isAdmin); setSuccessName(''); }}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      isAdmin ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  管理者権限を付与する
                </span>
              </label>
              {isAdmin && (
                <p className="text-xs text-amber-600 mt-1.5 ml-15">
                  管理者はダッシュボード・コイン付与・開所日管理などにアクセスできます
                </p>
              )}
            </div>

            {error && (
              <motion.p
                className="text-red-500 text-sm bg-red-50 rounded-lg py-2 px-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy text-white rounded-xl font-heading font-bold text-base min-h-12 hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md mt-2"
            >
              {loading ? 'アカウント作成中...' : 'アカウントを作成'}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-4">
          作成したアカウントでメールアドレスとパスワードを使ってログインできます
        </p>
      </div>
    </div>
  );
}
