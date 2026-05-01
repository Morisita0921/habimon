import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, TrendingUp, Flame, BarChart3, Coins, Gift, UserPlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getTodayString, getBusinessDaysInMonth } from '../utils/dateUtils';
import { useAdminData } from '../hooks/useAdminData';
import AdminCoinGrant from './AdminCoinGrant';
import AdminExchangeRequests from './AdminExchangeRequests';
import AdminUserCreate from './AdminUserCreate';

type AdminTab = 'dashboard' | 'coin-grant' | 'exchange' | 'user-create';

export default function AdminDashboard() {
  const { facilityData: facility, loading, updateUser: onUpdateUser, refresh: fetchAllData } = useAdminData();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const today = new Date();
  const todayStr = getTodayString();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const users = facility?.users ?? [];
  const businessDays = getBusinessDaysInMonth(currentYear, currentMonth);

  const todayAttendees = useMemo(() =>
    users.filter((u) => u.checkInHistory.some((r) => r.date === todayStr && r.checkedIn)).length,
  [users, todayStr]);

  const monthlyRate = useMemo(() => {
    if (users.length === 0 || businessDays === 0) return 0;
    const totalPossible = users.length * businessDays;
    const totalAttended = users.reduce((sum, u) => {
      return sum + u.checkInHistory.filter((r) => {
        const d = new Date(r.date);
        return r.checkedIn && d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
      }).length;
    }, 0);
    return Math.round((totalAttended / totalPossible) * 100);
  }, [users, businessDays, currentYear, currentMonth]);

  const avgStreak = useMemo(() => {
    if (users.length === 0) return 0;
    return Math.round(users.reduce((sum, u) => sum + u.streak, 0) / users.length);
  }, [users]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const bd = getBusinessDaysInMonth(y, m);
      const totalPossible = users.length * bd;
      const totalAttended = users.reduce((sum, u) => {
        return sum + u.checkInHistory.filter((r) => {
          const rd = new Date(r.date);
          return r.checkedIn && rd.getFullYear() === y && rd.getMonth() + 1 === m;
        }).length;
      }, 0);
      data.push({
        month: `${m}月`,
        rate: totalPossible > 0 ? Math.round((totalAttended / totalPossible) * 100) : 0,
      });
    }
    return data;
  }, [users, currentYear, currentMonth]);

  const userStats = useMemo(() => {
    return users.map((u) => {
      const monthCheckIns = u.checkInHistory.filter((r) => {
        const d = new Date(r.date);
        return r.checkedIn && d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
      }).length;
      const rate = businessDays > 0 ? Math.round((monthCheckIns / businessDays) * 100) : 0;
      const lastCheckIn = u.checkInHistory
        .filter((r) => r.checkedIn)
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.date || '−';
      const recentMoods = u.checkInHistory
        .filter((r) => r.checkedIn)
        .slice(-5)
        .map((r) => r.mood);
      const avgMood = recentMoods.length > 0
        ? Math.round(recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length)
        : 0;
      return { user: u, monthCheckIns, rate, lastCheckIn, avgMood };
    }).sort((a, b) => b.rate - a.rate);
  }, [users, currentYear, currentMonth, businessDays]);

  if (loading || !facility) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">📊</div>
          <p className="text-gray-500">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  const getMoodIcon = (mood: number) => ['−', '😢', '😟', '😐', '😊', '😄'][mood] || '−';

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* ヘッダー */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4 md:pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-navy">{facility.name}</h1>
            <p className="text-sm text-gray-500">管理者ダッシュボード</p>
          </div>
          <div className="text-sm text-gray-500 mt-2 md:mt-0">
            {currentYear}年{currentMonth}月{today.getDate()}日
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-3 font-heading font-bold text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'dashboard'
                ? 'text-navy border-navy'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <BarChart3 size={18} />
            ダッシュボード
          </button>
          <button
            onClick={() => setActiveTab('coin-grant')}
            className={`flex items-center gap-2 px-4 py-3 font-heading font-bold text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'coin-grant'
                ? 'text-amber-600 border-amber-500'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <Coins size={18} />
            コイン付与
          </button>
          <button
            onClick={() => setActiveTab('exchange')}
            className={`flex items-center gap-2 px-4 py-3 font-heading font-bold text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'exchange'
                ? 'text-green-600 border-green-500'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <Gift size={18} />
            申請管理
            {(() => {
              const pending = facility.users.reduce(
                (sum, u) => sum + u.exchangeRequests.filter((r) => r.status === 'pending').length,
                0
              );
              return pending > 0 ? (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white rounded-full text-xs">
                  {pending}
                </span>
              ) : null;
            })()}
          </button>
          <button
            onClick={() => setActiveTab('user-create')}
            className={`flex items-center gap-2 px-4 py-3 font-heading font-bold text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'user-create'
                ? 'text-navy border-navy'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <UserPlus size={18} />
            メンバー追加
          </button>
        </div>
      </div>

      {/* コイン付与タブ */}
      {activeTab === 'coin-grant' && (
        <AdminCoinGrant facility={facility} onUpdateUser={onUpdateUser} />
      )}

      {/* 申請管理タブ */}
      {activeTab === 'exchange' && (
        <AdminExchangeRequests facility={facility} onUpdateUser={onUpdateUser} />
      )}

      {/* メンバー追加タブ */}
      {activeTab === 'user-create' && (
        <AdminUserCreate onCreated={fetchAllData} />
      )}

      {/* ダッシュボードタブ */}
      {activeTab === 'dashboard' && (
      <div className="max-w-5xl mx-auto p-4 md:p-8 pt-0 md:pt-0">
        {/* KPIカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">本日の出席</span>
            </div>
            <div className="text-3xl font-bold text-navy">
              {todayAttendees} <span className="text-lg text-gray-400">/ {facility.users.length}</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <span className="text-sm text-gray-500">今月の稼働率</span>
            </div>
            <div className="text-3xl font-bold text-navy">{monthlyRate}%</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Flame size={20} className="text-orange-500" />
              </div>
              <span className="text-sm text-gray-500">平均連続出席</span>
            </div>
            <div className="text-3xl font-bold text-navy">{avgStreak}日</div>
          </motion.div>
        </div>

        {/* 月別稼働率グラフ */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-heading font-bold text-navy mb-4">月別稼働率の推移</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value) => [`${value}%`, '稼働率']} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#1E3A5F"
                  strokeWidth={3}
                  dot={{ fill: '#1E3A5F', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 利用者一覧 */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-heading font-bold text-navy">利用者一覧</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">名前</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">レベル</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">今月出席</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">出席率</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">最終出席日</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">体調傾向</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map(({ user: u, monthCheckIns, rate, lastCheckIn, avgMood }) => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {rate < 50 && (
                          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" aria-label="出席率が低いです" />
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.characterName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-main/10 text-main-dark rounded-full text-xs font-bold">
                        Lv.{u.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{monthCheckIns}日</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${rate >= 80 ? 'text-sub-dark' : rate >= 50 ? 'text-main-dark' : 'text-red-500'}`}>
                        {rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{lastCheckIn}</td>
                    <td className="px-4 py-3 text-center text-xl">{getMoodIcon(avgMood)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      )}
    </div>
  );
}
