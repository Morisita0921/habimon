import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { User, CheckInRecord } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, getMonthLabel, getBusinessDaysInMonth, formatDate } from '../utils/dateUtils';

interface CalendarProps {
  user: User;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export default function Calendar({ user }: CalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const businessDays = getBusinessDaysInMonth(year, month);

  const recordMap = new Map<string, CheckInRecord>();
  user.checkInHistory.forEach((r) => recordMap.set(r.date, r));

  const checkedInDays = user.checkInHistory.filter((r) => {
    const d = new Date(r.date);
    return r.checkedIn && d.getFullYear() === year && d.getMonth() + 1 === month;
  }).length;

  const attendanceRate = businessDays > 0 ? Math.round((checkedInDays / businessDays) * 100) : 0;

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  const getMoodIcon = (mood: number) => {
    const icons = ['', '😢', '😟', '😐', '😊', '😄'];
    return icons[mood] || '😐';
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-cream-dark transition-colors min-h-12 min-w-12 flex items-center justify-center"
          aria-label="前の月"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-heading font-bold text-gray-800">
          {getMonthLabel(year, month)}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-cream-dark transition-colors min-h-12 min-w-12 flex items-center justify-center"
          aria-label="次の月"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 出席率 */}
      <motion.div
        className="mb-4 bg-white rounded-2xl p-4 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">今月の出席率</span>
          <span className="font-heading font-bold text-lg text-main-dark">{attendanceRate}%</span>
        </div>
        <div className="w-full h-3 bg-cream-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sub to-sub-light"
            initial={{ width: 0 }}
            animate={{ width: `${attendanceRate}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {checkedInDays}日 / {businessDays}日（営業日）
        </p>
      </motion.div>

      {/* 月間目標 */}
      <div className="mb-4 bg-gold-light/30 rounded-xl p-3 text-center">
        <span className="text-sm font-heading text-gray-700">
          🎯 今月の目標：月{Math.ceil(businessDays * 0.7)}日通所でボーナスEXP！
        </span>
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-2xl p-3 shadow-sm">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`text-center text-xs font-bold py-1 ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;

            const dateStr = formatDate(new Date(year, month - 1, day));
            const record = recordMap.get(dateStr);
            const date = new Date(year, month - 1, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = dateStr === formatDate(today);
            const isCheckedIn = record?.checkedIn;

            return (
              <div
                key={day}
                className={`
                  relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                  ${isWeekend ? 'bg-gray-100 text-gray-400' : ''}
                  ${isToday ? 'ring-2 ring-main' : ''}
                  ${isCheckedIn ? 'bg-sub/10' : ''}
                `}
              >
                <span className={`text-xs ${isToday ? 'font-bold text-main' : ''}`}>{day}</span>
                {isCheckedIn && record && (
                  <span className="text-base leading-none">{getMoodIcon(record.mood)}</span>
                )}
                {isWeekend && !isCheckedIn && (
                  <span className="text-[10px] text-gray-300">−</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
