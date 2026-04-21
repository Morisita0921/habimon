import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { User } from '../types';
import Character from '../components/Character';
import Calendar from '../components/Calendar';

interface ParentViewProps {
  user: User;
}

export default function ParentView({ user }: ParentViewProps) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const monthCheckIns = user.checkInHistory.filter((r) => {
    const d = new Date(r.date);
    return r.checkedIn && d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
  }).length;

  const recentMoods = useMemo(() => {
    return user.checkInHistory
      .filter((r) => r.checkedIn)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);
  }, [user.checkInHistory]);

  const getMoodIcon = (mood: number) => {
    const icons = ['', '😢', '😟', '😐', '😊', '😄'];
    return icons[mood] || '😐';
  };

  const getMoodLabel = (mood: number) => {
    const labels = ['', 'つらい', 'すこしつらい', 'ふつう', 'げんき', 'とてもげんき'];
    return labels[mood] || 'ふつう';
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto p-4 py-8">
        {/* ヘッダー */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-heading font-bold text-gray-800">
            {user.name}さんの ようす
          </h1>
          <p className="text-sm text-gray-500 mt-1">保護者・支援者ビュー</p>
        </motion.div>

        {/* キャラクター */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Character level={user.level} size={150} />
          <h2 className="font-heading font-bold text-lg text-gray-800 mt-2">{user.characterName}</h2>
          <p className="text-sm text-gray-500">Lv.{user.level}</p>
        </motion.div>

        {/* 出席状況サマリー */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-heading font-bold text-gray-800 mb-3">📊 出席状況</h2>
          <p className="text-gray-700 leading-relaxed">
            今月は<span className="font-bold text-main text-lg"> {monthCheckIns}日 </span>出席しました。
            {user.streak > 0 && (
              <>連続<span className="font-bold text-sub text-lg"> {user.streak}日 </span>出席中です！</>
            )}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-cream rounded-xl p-3 text-center">
              <div className="text-2xl font-heading font-bold text-main">{user.totalCheckIns}</div>
              <div className="text-xs text-gray-500">累計通所日数</div>
            </div>
            <div className="bg-cream rounded-xl p-3 text-center">
              <div className="text-2xl font-heading font-bold text-sub">{user.streak}</div>
              <div className="text-xs text-gray-500">連続出席日数</div>
            </div>
          </div>
        </motion.div>

        {/* カレンダー */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Calendar user={user} />
        </motion.div>

        {/* 体調の推移 */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-heading font-bold text-gray-800 mb-3">💛 体調のきろく（直近）</h2>
          {recentMoods.length > 0 ? (
            <div className="space-y-2">
              {recentMoods.map((record, i) => (
                <div key={i} className="flex items-center gap-3 py-1 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 w-24">{record.date}</span>
                  <span className="text-xl">{getMoodIcon(record.mood)}</span>
                  <span className="text-sm text-gray-600">{getMoodLabel(record.mood)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">まだ記録がありません</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
