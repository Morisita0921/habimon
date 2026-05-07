import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Coins, Star, CalendarOff } from 'lucide-react';
import type { User } from '../types';
import { getTodayString } from '../utils/dateUtils';
import { useOpeningSchedule } from '../hooks/useOpeningSchedule';

interface DailyReportViewProps {
  user: User;
  onSubmit: (morning: string, afternoon: string) => Promise<
    { expGain: number; coinGain: number; newBadges: string[] } | undefined
  >;
}

const ACTIVITY_OPTIONS = [
  '動画編集',
  '画像編集',
  'e-スポーツ',
  'PC取り扱い練習',
  '軽作業',
  '手芸',
] as const;

export default function DailyReportView({ user, onSubmit }: DailyReportViewProps) {
  const today = getTodayString();
  const { isOpenDay, loading: scheduleLoading } = useOpeningSchedule();
  const isClosedDay = !scheduleLoading && !isOpenDay(today);
  const todayReport = user.dailyReports.find((r) => r.date === today);
  const alreadySubmitted = !!todayReport;

  const [morningActivity, setMorningActivity] = useState('');
  const [morningNote, setMorningNote] = useState('');
  const [afternoonActivity, setAfternoonActivity] = useState('');
  const [afternoonNote, setAfternoonNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reward, setReward] = useState<{ expGain: number; coinGain: number; newBadges: string[] } | null>(null);

  const morningText = morningActivity + (morningNote ? `（${morningNote}）` : '');
  const afternoonText = afternoonActivity + (afternoonNote ? `（${afternoonNote}）` : '');
  const morningComplete = morningActivity.length > 0 && morningNote.trim().length > 0;
  const afternoonComplete = afternoonActivity.length > 0 && afternoonNote.trim().length > 0;
  const isFull = morningComplete && afternoonComplete;
  const canSubmit = morningComplete || afternoonComplete;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const result = await onSubmit(morningText, afternoonText);
    if (result) setReward(result);
    setSubmitting(false);
  };

  // 過去の日報（直近5件）
  const recentReports = [...user.dailyReports]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <motion.div
      className="px-4 py-6 pb-24"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h1 className="text-xl font-heading font-bold text-gray-800 text-center mb-1">
        📋 にっぽう
      </h1>
      <p className="text-xs text-gray-400 text-center mb-5">今日の活動を記録しよう</p>

      {/* ===== 報酬ポップアップ ===== */}
      <AnimatePresence>
        {reward && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setReward(null)} />
            <motion.div
              className="relative bg-white rounded-3xl p-8 mx-6 max-w-sm w-full shadow-2xl text-center"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
            >
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="font-heading font-bold text-xl text-gray-800 mb-4">
                日報を提出したよ！
              </h2>
              <div className="flex justify-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 bg-amber-50 rounded-xl px-4 py-2 border border-amber-200">
                  <Star size={18} className="text-amber-500" fill="currentColor" />
                  <span className="font-bold text-amber-700">+{reward.expGain} EXP</span>
                </div>
                <div className="flex items-center gap-1.5 bg-yellow-50 rounded-xl px-4 py-2 border border-yellow-200">
                  <Coins size={18} className="text-yellow-600" fill="currentColor" />
                  <span className="font-bold text-yellow-700">+{reward.coinGain}</span>
                </div>
              </div>
              {reward.newBadges.length > 0 && (
                <div className="bg-gold/10 rounded-xl p-3 mb-4">
                  <p className="text-sm font-bold text-amber-700 mb-1">🏅 新しいバッジ！</p>
                  {reward.newBadges.map((b) => (
                    <p key={b} className="text-xs text-amber-600">{b}</p>
                  ))}
                </div>
              )}
              <button
                onClick={() => setReward(null)}
                className="w-full py-3 bg-gradient-to-r from-main to-sub text-white font-heading font-bold rounded-xl shadow-md min-h-12"
              >
                とじる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 休所日メッセージ ===== */}
      {isClosedDay && !alreadySubmitted && (
        <motion.div
          className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 mb-6 text-center"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <CalendarOff size={40} className="text-gray-400 mx-auto mb-2" />
          <p className="font-heading font-bold text-gray-500 text-base mb-1">
            今日は休所日です
          </p>
          <p className="text-xs text-gray-400">
            開所日にまた日報を書いてね！
          </p>
        </motion.div>
      )}

      {/* ===== 本日の日報入力エリア ===== */}
      {isClosedDay && !alreadySubmitted ? null : alreadySubmitted ? (
        <motion.div
          className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 mb-6 text-center"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
          <p className="font-heading font-bold text-green-700 text-base mb-3">
            今日の日報を提出済みです ✨
          </p>
          <div className="text-left space-y-3">
            {todayReport!.morning && (
              <div className="bg-white rounded-xl p-3 border border-green-100">
                <p className="text-xs text-gray-400 font-bold mb-1">☀️ 午前</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{todayReport!.morning}</p>
              </div>
            )}
            {todayReport!.afternoon && (
              <div className="bg-white rounded-xl p-3 border border-green-100">
                <p className="text-xs text-gray-400 font-bold mb-1">🌙 午後</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{todayReport!.afternoon}</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <p className="text-sm font-bold text-gray-600 mb-4">📅 {today} の日報</p>

          {/* 午前 */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              ☀️ 午前にやったこと
            </label>
            <select
              value={morningActivity}
              onChange={(e) => setMorningActivity(e.target.value)}
              className={`w-full rounded-xl border border-gray-200 p-3 text-sm bg-white focus:outline-none focus:border-main focus:ring-1 focus:ring-main/30 ${
                morningActivity ? 'text-gray-700' : 'text-gray-300'
              }`}
            >
              <option value="">選んでください</option>
              {ACTIVITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              type="text"
              value={morningNote}
              onChange={(e) => setMorningNote(e.target.value)}
              placeholder="メモ（自由記述）"
              className="w-full mt-2 rounded-xl border border-gray-200 p-3 text-sm text-gray-700 focus:outline-none focus:border-main focus:ring-1 focus:ring-main/30 placeholder:text-gray-300"
            />
          </div>

          {/* 午後 */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              🌙 午後にやったこと
            </label>
            <select
              value={afternoonActivity}
              onChange={(e) => setAfternoonActivity(e.target.value)}
              className={`w-full rounded-xl border border-gray-200 p-3 text-sm bg-white focus:outline-none focus:border-main focus:ring-1 focus:ring-main/30 ${
                afternoonActivity ? 'text-gray-700' : 'text-gray-300'
              }`}
            >
              <option value="">選んでください</option>
              {ACTIVITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              type="text"
              value={afternoonNote}
              onChange={(e) => setAfternoonNote(e.target.value)}
              placeholder="メモ（自由記述）"
              className="w-full mt-2 rounded-xl border border-gray-200 p-3 text-sm text-gray-700 focus:outline-none focus:border-main focus:ring-1 focus:ring-main/30 placeholder:text-gray-300"
            />
          </div>

          {/* 報酬プレビュー */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <span>もらえる報酬：</span>
            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
              <Star size={12} /> {isFull ? '25' : '15'} EXP
            </span>
            <span className="flex items-center gap-0.5 text-yellow-600 font-bold">
              <Coins size={12} /> {isFull ? '130' : '80'} コイン
            </span>
            {isFull && (
              <span className="text-green-600 font-bold">（両方ボーナス！）</span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full py-3.5 rounded-xl font-heading font-bold text-white shadow-md min-h-12 transition-all ${
              canSubmit && !submitting
                ? 'bg-gradient-to-r from-main to-sub hover:opacity-90 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? '送信中…' : '日報を提出する 📤'}
          </button>
        </div>
      )}

      {/* ===== 過去の日報 ===== */}
      {recentReports.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 mb-3">📜 最近の日報</h2>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <p className="text-xs font-bold text-gray-400 mb-2">{report.date}</p>
                <div className="space-y-2">
                  {report.morning && (
                    <div>
                      <span className="text-xs text-gray-400">☀️ 午前</span>
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{report.morning}</p>
                    </div>
                  )}
                  {report.afternoon && (
                    <div>
                      <span className="text-xs text-gray-400">🌙 午後</span>
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{report.afternoon}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 提出回数サマリ ===== */}
      <div className="mt-5 bg-amber-50 rounded-xl p-4 border border-amber-100 text-center">
        <p className="text-xs text-amber-600 font-bold">
          これまでの日報：<span className="text-lg">{user.dailyReports.length}</span> 回
        </p>
      </div>
    </motion.div>
  );
}
