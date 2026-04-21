import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Check, X, Sparkles, History } from 'lucide-react';
import type { Facility, User, CoinTransaction } from '../types';
import { formatCoins } from '../utils/coinCalculator';
import { getTodayString } from '../utils/dateUtils';

interface AdminCoinGrantProps {
  facility: Facility;
  onUpdateUser: (user: User) => void;
}

// プリセット金額
const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

// プリセット理由
const PRESET_REASONS = [
  { icon: '🧹', label: '清掃業務を丁寧に行った' },
  { icon: '✨', label: '作業を集中して取り組めた' },
  { icon: '👋', label: '挨拶が素晴らしかった' },
  { icon: '🤝', label: '同僚を助けた' },
  { icon: '🌟', label: '新しい作業に挑戦した' },
  { icon: '⏰', label: '時間をきちんと守った' },
  { icon: '💪', label: '難しい作業をやり遂げた' },
  { icon: '😊', label: '笑顔で取り組めた' },
];

export default function AdminCoinGrant({ facility, onUpdateUser }: AdminCoinGrantProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(facility.users[0]?.id || '');
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REASONS[0].label);
  const [customReason, setCustomReason] = useState<string>('');
  const [useCustomReason, setUseCustomReason] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastGranted, setLastGranted] = useState<{ userName: string; amount: number } | null>(null);

  const selectedUser = facility.users.find((u) => u.id === selectedUserId);

  const finalAmount = useCustomAmount ? parseInt(customAmount) || 0 : amount;
  const finalReason = useCustomReason ? customReason.trim() : selectedReason;

  const canSubmit = selectedUser && finalAmount > 0 && finalReason.length > 0;

  // 最近の付与履歴（全ユーザーの支援員付与のみ、最新10件）
  const recentGrants = useMemo(() => {
    const all: { user: User; transaction: CoinTransaction }[] = [];
    facility.users.forEach((u) => {
      u.coinHistory
        .filter((t) => t.type === 'earn' && t.reason.startsWith('[支援員] '))
        .forEach((t) => all.push({ user: u, transaction: t }));
    });
    return all.sort((a, b) => b.transaction.date.localeCompare(a.transaction.date)).slice(0, 10);
  }, [facility.users]);

  const handleGrant = () => {
    if (!canSubmit || !selectedUser) return;
    setShowConfirm(true);
  };

  const confirmGrant = () => {
    if (!selectedUser) return;

    const now = new Date();
    const dateStr = `${getTodayString()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const transaction: CoinTransaction = {
      id: `grant-${Date.now()}`,
      date: dateStr,
      type: 'earn',
      amount: finalAmount,
      reason: `[支援員] ${finalReason}`,
    };

    const updatedUser: User = {
      ...selectedUser,
      akashiCoins: selectedUser.akashiCoins + finalAmount,
      coinHistory: [...selectedUser.coinHistory, transaction],
    };

    onUpdateUser(updatedUser);
    setLastGranted({ userName: selectedUser.name, amount: finalAmount });
    setShowConfirm(false);
    setShowSuccess(true);

    // フォームリセット
    setTimeout(() => {
      setShowSuccess(false);
      setLastGranted(null);
    }, 2500);

    // 入力をリセット（利用者選択は維持）
    setCustomAmount('');
    setUseCustomAmount(false);
    setCustomReason('');
    setUseCustomReason(false);
    setAmount(100);
    setSelectedReason(PRESET_REASONS[0].label);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
          <Coins size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-navy">アカシコイン付与</h2>
          <p className="text-sm text-gray-500">がんばった利用者さんにコインをあげましょう</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左：付与フォーム（2カラム分） */}
        <div className="lg:col-span-2 space-y-4">
          {/* ステップ1：利用者選択 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <h3 className="font-heading font-bold text-navy">利用者を選ぶ</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {facility.users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedUserId === u.id
                      ? 'border-navy bg-navy/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-heading font-bold text-sm text-gray-800">{u.name}</div>
                  <div className="text-xs text-gray-500 mb-1">{u.characterName}</div>
                  <div className="flex items-center gap-1 text-xs">
                    <Coins size={12} className="text-amber-500" fill="currentColor" />
                    <span className="font-bold text-amber-700">{formatCoins(u.akashiCoins)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ステップ2：金額選択 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <h3 className="font-heading font-bold text-navy">金額を選ぶ</h3>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setAmount(amt); setUseCustomAmount(false); }}
                  className={`py-3 rounded-xl border-2 font-heading font-bold transition-all ${
                    !useCustomAmount && amount === amt
                      ? 'border-amber-500 bg-gradient-to-b from-amber-50 to-yellow-50 text-amber-700 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-amber-300'
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomAmount}
                  onChange={(e) => setUseCustomAmount(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">カスタム金額</span>
              </label>
              {useCustomAmount && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-500">+</span>
                  <input
                    type="number"
                    min="1"
                    max="99999"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="金額"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    autoFocus
                  />
                  <span className="text-sm text-gray-500">コイン</span>
                </div>
              )}
            </div>
          </div>

          {/* ステップ3：理由選択 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <h3 className="font-heading font-bold text-navy">理由を選ぶ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {PRESET_REASONS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => { setSelectedReason(r.label); setUseCustomReason(false); }}
                  className={`p-2.5 rounded-xl border-2 text-left text-sm transition-all flex items-center gap-2 ${
                    !useCustomReason && selectedReason === r.label
                      ? 'border-navy bg-navy/5 text-navy'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{r.icon}</span>
                  <span className="flex-1">{r.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-start gap-2">
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={useCustomReason}
                  onChange={(e) => setUseCustomReason(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">カスタム理由</span>
              </label>
              {useCustomReason && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="例: 清掃道具の片付けを丁寧にしてくれた"
                  maxLength={50}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* 付与ボタン */}
          <motion.button
            onClick={handleGrant}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-xl font-heading font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all ${
              canSubmit
                ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white hover:shadow-lg active:shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileTap={canSubmit ? { scale: 0.98 } : undefined}
          >
            <Sparkles size={20} />
            {selectedUser
              ? `${selectedUser.name}さんに +${formatCoins(finalAmount)} コインをあげる`
              : '利用者を選んでください'}
          </motion.button>
        </div>

        {/* 右：最近の付与履歴 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <History size={18} className="text-navy" />
              <h3 className="font-heading font-bold text-navy">最近の付与</h3>
            </div>
            {recentGrants.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                まだ付与履歴がありません
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {recentGrants.map(({ user, transaction }) => (
                  <div
                    key={transaction.id}
                    className="p-3 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 rounded-lg border border-amber-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-bold text-sm text-gray-800">{user.name}</span>
                      <span className="text-amber-700 font-bold text-sm flex items-center gap-0.5">
                        <Coins size={12} fill="currentColor" />
                        +{transaction.amount}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-0.5">
                      {transaction.reason.replace('[支援員] ', '')}
                    </div>
                    <div className="text-[10px] text-gray-400">{transaction.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 確認モーダル */}
      <AnimatePresence>
        {showConfirm && selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
            <motion.div
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Coins size={32} className="text-white" fill="currentColor" />
                </div>
                <h3 className="font-heading font-bold text-xl text-navy mb-1">コインを付与しますか？</h3>
                <p className="text-sm text-gray-500">以下の内容で付与します</p>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-4 border border-amber-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">利用者</span>
                  <span className="font-heading font-bold text-navy">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">金額</span>
                  <span className="font-heading font-bold text-amber-700 text-lg">+{formatCoins(finalAmount)} コイン</span>
                </div>
                <div className="pt-2 border-t border-amber-200">
                  <div className="text-sm text-gray-600 mb-1">理由</div>
                  <div className="text-sm text-gray-800">{finalReason}</div>
                </div>
                <div className="pt-2 mt-2 border-t border-amber-200 flex justify-between items-center">
                  <span className="text-xs text-gray-500">付与後の残高</span>
                  <span className="font-heading font-bold text-amber-700">
                    {formatCoins(selectedUser.akashiCoins + finalAmount)} コイン
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-heading font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} className="inline mr-1" />
                  キャンセル
                </button>
                <button
                  onClick={confirmGrant}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 text-white font-heading font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Check size={16} className="inline mr-1" />
                  付与する
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成功トースト */}
      <AnimatePresence>
        {showSuccess && lastGranted && (
          <motion.div
            className="fixed top-6 left-1/2 z-50"
            initial={{ opacity: 0, y: -30, x: '-50%', scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -30, x: '-50%', scale: 0.9 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-amber-300">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <div className="font-heading font-bold text-base">付与しました！</div>
                <div className="text-xs text-amber-50">
                  {lastGranted.userName}さんに +{formatCoins(lastGranted.amount)} コイン
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
