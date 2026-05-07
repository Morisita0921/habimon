import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin as supabase } from '../lib/supabase';
import { isWeekday, parseDate, isOpenDay, type OpeningOverride } from '../utils/dateUtils';

export type { OpeningOverride };

export function useOpeningSchedule() {
  const [specialDates, setSpecialDates] = useState<Record<string, OpeningOverride>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('opening_schedule')
      .select('date, status')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, OpeningOverride> = {};
          for (const row of data) {
            map[row.date] = row.status as OpeningOverride;
          }
          setSpecialDates(map);
        }
        setLoading(false);
      });
  }, []);

  const checkIsOpenDay = useCallback(
    (dateStr: string) => isOpenDay(dateStr, specialDates),
    [specialDates]
  );

  // Admin: 日付をクリックしてオーバーライドをトグル
  const toggleOverride = useCallback(async (dateStr: string) => {
    const date = parseDate(dateStr);
    const defaultOpen = isWeekday(date);
    const currentOverride = specialDates[dateStr];

    if (currentOverride !== undefined) {
      // オーバーライドを削除 → デフォルトに戻す
      await supabase.from('opening_schedule').delete().eq('date', dateStr);
      setSpecialDates((prev) => {
        const next = { ...prev };
        delete next[dateStr];
        return next;
      });
    } else {
      // デフォルトの逆を設定
      const newStatus: OpeningOverride = defaultOpen ? 'closed' : 'open';
      await supabase
        .from('opening_schedule')
        .upsert({ date: dateStr, status: newStatus, updated_at: new Date().toISOString() });
      setSpecialDates((prev) => ({ ...prev, [dateStr]: newStatus }));
    }
  }, [specialDates]);

  return { specialDates, loading, isOpenDay: checkIsOpenDay, toggleOverride };
}
