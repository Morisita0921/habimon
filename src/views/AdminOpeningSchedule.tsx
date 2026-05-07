import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatDate,
  parseDate,
  isWeekday,
} from '../utils/dateUtils';
import { useOpeningSchedule } from '../hooks/useOpeningSchedule';

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export default function AdminOpeningSchedule() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const { specialDates, loading, toggleOverride } = useOpeningSchedule();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = formatDate(today);

  const goToPrevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };
  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const getDayStatus = (dateStr: string) => {
    const override = specialDates[dateStr];
    if (override === 'open') return 'override-open';
    if (override === 'closed') return 'override-closed';
    return isWeekday(parseDate(dateStr)) ? 'default-open' : 'default-closed';
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-heading font-bold text-navy w-32 text-center">
            {year}年{month}月
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="text-sm text-navy border border-navy/30 rounded-lg px-3 py-1.5 hover:bg-navy/5 transition-colors font-heading"
        >
          今月
        </button>
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200" />
          通常開所（平日）
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400" />
          特別開所（土日を開所）
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
          通常休み（土日）
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-50 border-2 border-red-300" />
          臨時休所（平日を休みに）
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`py-2 text-center text-xs font-heading font-bold ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 日付セル */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-14 border-b border-r border-gray-50 last:border-r-0"
                />
              );
            }

            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = getDayStatus(dateStr);
            const isToday = dateStr === todayStr;
            const dow = (firstDay + day - 1) % 7;

            const styles: Record<typeof status, { bg: string; border: string; text: string }> = {
              'default-open': {
                bg: 'bg-blue-50 hover:bg-blue-100',
                border: 'border-b border-r border-gray-50',
                text: dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-700',
              },
              'override-open': {
                bg: 'bg-green-100 hover:bg-green-200',
                border: 'border-b border-r border-gray-50 ring-2 ring-inset ring-green-400',
                text: 'text-green-700 font-bold',
              },
              'default-closed': {
                bg: 'bg-gray-50 hover:bg-gray-100',
                border: 'border-b border-r border-gray-50',
                text: dow === 0 ? 'text-red-300' : 'text-gray-300',
              },
              'override-closed': {
                bg: 'bg-red-50 hover:bg-red-100',
                border: 'border-b border-r border-gray-50 ring-2 ring-inset ring-red-300',
                text: 'text-red-400 line-through',
              },
            };

            const s = styles[status];

            const tooltip =
              status === 'default-open' ? 'クリック → 臨時休所に変更' :
              status === 'override-closed' ? 'クリック → 通常開所に戻す' :
              status === 'default-closed' ? 'クリック → 特別開所に設定' :
              'クリック → 通常休みに戻す';

            return (
              <button
                key={dateStr}
                onClick={() => toggleOverride(dateStr)}
                title={tooltip}
                className={`
                  h-14 flex flex-col items-center justify-center gap-0.5
                  transition-colors cursor-pointer relative
                  ${s.bg} ${s.border}
                `}
              >
                {isToday && (
                  <div className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full" />
                )}
                <span
                  className={`text-sm font-heading leading-none ${s.text} ${isToday ? 'underline underline-offset-2 decoration-orange-400' : ''}`}
                >
                  {day}
                </span>
                {status === 'override-open' && (
                  <span className="text-[9px] text-green-600 leading-none font-heading">特別</span>
                )}
                {status === 'override-closed' && (
                  <span className="text-[9px] text-red-400 leading-none font-heading">臨休</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center font-heading">
        日付をタップすると開所・休所を切り替えられます
      </p>
    </div>
  );
}
