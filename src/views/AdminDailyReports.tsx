import { useMemo, useState } from 'react';
import { ClipboardList, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import type { AdminFacilityData } from '../hooks/useAdminData';
import { getTodayString } from '../utils/dateUtils';

interface AdminDailyReportsProps {
  facility: AdminFacilityData;
}

export default function AdminDailyReports({ facility }: AdminDailyReportsProps) {
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // 日付一覧（日報が存在する日）
  const availableDates = useMemo(() => {
    const dateSet = new Set<string>();
    facility.users.forEach((u) => u.dailyReports.forEach((r) => dateSet.add(r.date)));
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }, [facility.users]);

  // 選択日の全ユーザー日報
  const reportsByUser = useMemo(() => {
    return facility.users
      .map((u) => ({
        user: u,
        report: u.dailyReports.find((r) => r.date === selectedDate) ?? null,
      }))
      .sort((a, b) => {
        // 日報あり → 上、なし → 下
        if (a.report && !b.report) return -1;
        if (!a.report && b.report) return 1;
        return a.user.name.localeCompare(b.user.name, 'ja');
      });
  }, [facility.users, selectedDate]);

  const submittedCount = reportsByUser.filter(({ report }) => report !== null).length;
  const totalCount = reportsByUser.length;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 pt-0">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
          <ClipboardList size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-navy">日報管理</h2>
          <p className="text-sm text-gray-500">利用者さんの日報をまとめて確認できます</p>
        </div>
      </div>

      {/* 日付選択 */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-bold text-gray-600 shrink-0">日付：</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy bg-white"
        >
          {/* 今日が一覧にない場合も表示 */}
          {!availableDates.includes(today) && (
            <option value={today}>{today}（本日・未提出）</option>
          )}
          {availableDates.map((d) => (
            <option key={d} value={d}>{d}{d === today ? '（本日）' : ''}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          提出 <span className="font-bold text-teal-600">{submittedCount}</span> / {totalCount} 名
        </span>
      </div>

      {/* 提出率バー */}
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-500"
          style={{ width: totalCount > 0 ? `${Math.round((submittedCount / totalCount) * 100)}%` : '0%' }}
        />
      </div>

      {/* 日報一覧 */}
      <div className="space-y-2">
        {reportsByUser.map(({ user, report }) => (
          <div
            key={user.id}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
              report ? 'border-gray-100' : 'border-gray-100 opacity-60'
            }`}
          >
            {/* ユーザー行 */}
            <button
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
              onClick={() => report && setExpandedUser(expandedUser === user.id ? null : user.id)}
              disabled={!report}
            >
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${report ? 'bg-teal-400' : 'bg-gray-200'}`} />
              <span className="font-heading font-bold text-gray-800 flex-1">{user.name}</span>
              {report ? (
                <>
                  <span className="text-xs text-gray-400">{report.submittedAt.slice(11, 16)} 提出</span>
                  <span className="text-gray-300 ml-1">
                    {expandedUser === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-300">未提出</span>
              )}
            </button>

            {/* 詳細（展開時） */}
            {report && expandedUser === user.id && (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-50">
                <div className="flex items-start gap-2 mt-3">
                  <div className="flex items-center gap-1 text-amber-500 shrink-0 w-12 pt-0.5">
                    <Sun size={14} />
                    <span className="text-xs font-bold">午前</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">
                    {report.morning || <span className="text-gray-300">記入なし</span>}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-1 text-orange-400 shrink-0 w-12 pt-0.5">
                    <Moon size={14} />
                    <span className="text-xs font-bold">午後</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">
                    {report.afternoon || <span className="text-gray-300">記入なし</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
