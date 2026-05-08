/**
 * Supabase からユーザーデータを取得・更新するフック
 * 既存の User 型に変換して返す（既存コンポーネントとの互換性を保つ）
 */
import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin as supabase } from '../lib/supabase';
import type { User, CheckInRecord, CoinTransaction, ExchangeRequest, DailyReport } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getTodayString } from '../utils/dateUtils';
import { calculateNewLevel, EXP_VALUES } from '../utils/expCalculator';
import { COIN_VALUES } from '../utils/coinCalculator';

export function useUserData() {
  const { user: authUser, profile, refreshProfile } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Supabase データを既存の User 型に変換
  const buildUserFromDB = useCallback(async (userId: string): Promise<User | null> => {
    if (!profile) return null;

    // チェックイン履歴を取得
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    // コイン履歴を取得
    const { data: coinTxs } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    // 交換申請を取得
    const { data: exchangeReqs } = await supabase
      .from('exchange_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    // 日報を取得
    const { data: reportRows } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    const checkInHistory: CheckInRecord[] = (checkIns ?? []).map((r) => ({
      date: r.date,
      mood: r.mood as 1 | 2 | 3 | 4 | 5,
      checkedIn: r.checked_in,
    }));

    const coinHistory: CoinTransaction[] = (coinTxs ?? []).map((r) => ({
      id: r.id,
      date: r.date,
      type: r.type as 'earn' | 'spend',
      amount: r.amount,
      reason: r.reason,
    }));

    const exchangeRequests: ExchangeRequest[] = (exchangeReqs ?? []).map((r) => ({
      id: r.id,
      itemId: r.item_id ?? '',
      itemName: r.item_name,
      itemEmoji: r.item_emoji ?? '🎁',
      price: r.cost,
      status: r.status,
      requestedAt: r.requested_at,
      processedAt: r.processed_at,
      note: r.note,
    }));

    const dailyReports: DailyReport[] = (reportRows ?? []).map((r) => ({
      id: r.id,
      date: r.date,
      morning: r.morning ?? '',
      afternoon: r.afternoon ?? '',
      submittedAt: r.submitted_at,
    }));

    return {
      id: profile.id,
      name: profile.name,
      characterName: profile.character_name,
      selectedCharacterId: profile.selected_character_id ?? undefined,
      level: profile.level,
      exp: profile.exp,
      expToNext: profile.exp_to_next,
      streak: profile.streak,
      totalCheckIns: profile.total_check_ins,
      badges: profile.badges,
      akashiCoins: profile.akashi_coins,
      ownedCosmetics: profile.owned_cosmetics,
      equippedCosmetics: profile.equipped_cosmetics,
      checkInHistory,
      coinHistory,
      exchangeRequests,
      dailyReports,
    };
  }, [profile]);

  useEffect(() => {
    if (!authUser || !profile) {
      setLoading(false);
      return;
    }
    buildUserFromDB(authUser.id).then((u) => {
      setUserData(u);
      setLoading(false);
    });
  }, [authUser, profile, buildUserFromDB]);

  // チェックイン処理
  const checkIn = useCallback(async (mood: 1 | 2 | 3 | 4 | 5, updates: Partial<User>) => {
    if (!authUser || !userData) return;
    const today = getTodayString();

    // check_ins テーブルに追加
    await supabase.from('check_ins').upsert({
      user_id: authUser.id,
      date: today,
      mood,
      checked_in: true,
    });

    // コイン履歴を追加
    if (updates.coinHistory) {
      const newTxs = updates.coinHistory.slice(userData.coinHistory.length);
      if (newTxs.length > 0) {
        await supabase.from('coin_transactions').insert(
          newTxs.map((tx) => ({
            id: tx.id,
            user_id: authUser.id,
            date: tx.date,
            type: tx.type,
            amount: tx.amount,
            reason: tx.reason,
          }))
        );
      }
    }

    // プロフィールを更新
    await supabase.from('profiles').update({
      level: updates.level,
      exp: updates.exp,
      exp_to_next: updates.expToNext,
      streak: updates.streak,
      total_check_ins: updates.totalCheckIns,
      badges: updates.badges,
      akashi_coins: updates.akashiCoins,
      updated_at: new Date().toISOString(),
    }).eq('id', authUser.id);

    await refreshProfile();

    // ローカル状態を更新
    setUserData((prev) => prev ? { ...prev, ...updates } : null);
  }, [authUser, userData, refreshProfile]);

  // プロフィール更新（キャラ変更・コスメ等）
  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!authUser) return;

    // checkInHistory に新しいエントリがあれば check_ins テーブルに保存
    if (updates.checkInHistory) {
      const existingCount = userData?.checkInHistory.length ?? 0;
      const newEntries = updates.checkInHistory.slice(existingCount);
      for (const entry of newEntries) {
        await supabase.from('check_ins').upsert({
          user_id: authUser.id,
          date: entry.date,
          mood: entry.mood,
          checked_in: entry.checkedIn,
        });
      }
    }

    // coinHistory に新しいエントリがあれば coin_transactions テーブルに保存
    if (updates.coinHistory) {
      const existingCount = userData?.coinHistory.length ?? 0;
      const newTxs = updates.coinHistory.slice(existingCount);
      if (newTxs.length > 0) {
        await supabase.from('coin_transactions').insert(
          newTxs.map((tx) => ({
            id: tx.id,
            user_id: authUser.id,
            date: tx.date,
            type: tx.type,
            amount: tx.amount,
            reason: tx.reason,
          }))
        );
      }
    }

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.exp !== undefined) dbUpdates.exp = updates.exp;
    if (updates.expToNext !== undefined) dbUpdates.exp_to_next = updates.expToNext;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.totalCheckIns !== undefined) dbUpdates.total_check_ins = updates.totalCheckIns;
    if (updates.badges !== undefined) dbUpdates.badges = updates.badges;
    if (updates.akashiCoins !== undefined) dbUpdates.akashi_coins = updates.akashiCoins;
    if (updates.ownedCosmetics !== undefined) dbUpdates.owned_cosmetics = updates.ownedCosmetics;
    if (updates.equippedCosmetics !== undefined) dbUpdates.equipped_cosmetics = updates.equippedCosmetics;
    if (updates.selectedCharacterId !== undefined) dbUpdates.selected_character_id = updates.selectedCharacterId;
    if (updates.characterName !== undefined) dbUpdates.character_name = updates.characterName;

    await supabase.from('profiles').update(dbUpdates).eq('id', authUser.id);
    await refreshProfile();
    setUserData((prev) => prev ? { ...prev, ...updates } : null);
  }, [authUser, userData, refreshProfile]);

  // 交換申請
  const addExchangeRequest = useCallback(async (req: ExchangeRequest) => {
    if (!authUser) return;
    await supabase.from('exchange_requests').insert({
      id: req.id,
      user_id: authUser.id,
      item_id: req.itemId,
      item_name: req.itemName,
      item_emoji: req.itemEmoji,
      cost: req.price,
      status: req.status,
      requested_at: req.requestedAt,
    });
    setUserData((prev) => prev ? {
      ...prev,
      exchangeRequests: [...prev.exchangeRequests, req],
    } : null);
  }, [authUser]);

  // 日報をGoogleスプレッドシートに送信
  const sendToGoogleSheet = async (params: {
    userName: string;
    date: string;
    morningActivity: string;
    morningNote: string;
    afternoonActivity: string;
    afternoonNote: string;
    submittedAt: string;
  }) => {
    const GAS_URL = import.meta.env.VITE_GAS_WEBHOOK_URL;
    if (!GAS_URL) return;
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(params),
      });
    } catch {
      // スプシ送信失敗はサイレントに無視（アプリの動作には影響させない）
    }
  };

  // 日報提出
  const submitDailyReport = useCallback(async (morning: string, afternoon: string) => {
    if (!authUser || !userData) return;
    const today = getTodayString();
    const now = new Date().toISOString();
    const isFull = morning.trim().length > 0 && afternoon.trim().length > 0;

    // daily_reports に保存
    const { data: inserted } = await supabase
      .from('daily_reports')
      .insert({
        user_id: authUser.id,
        date: today,
        morning: morning.trim(),
        afternoon: afternoon.trim(),
        submitted_at: now,
      })
      .select()
      .single();

    if (!inserted) return;

    // EXP 計算
    const expGain = EXP_VALUES.dailyReport + (isFull ? EXP_VALUES.dailyReportFull : 0);
    const newExp = userData.exp + expGain;
    const newLevel = calculateNewLevel(newExp);
    const expToNextValue = newLevel < 5 ? [0, 100, 300, 600, 1000][newLevel] : 0;

    // コイン計算
    const coinGain = COIN_VALUES.dailyReport + (isFull ? COIN_VALUES.dailyReportFull : 0);

    // コイン履歴
    const txId = `coin-report-${Date.now()}`;
    const coinReason = isFull ? 'にっぽう提出（午前・午後）' : 'にっぽう提出';
    await supabase.from('coin_transactions').insert({
      id: txId,
      user_id: authUser.id,
      date: today,
      type: 'earn',
      amount: coinGain,
      reason: coinReason,
    });

    // バッジ判定
    const newReports = [...userData.dailyReports, {
      id: inserted.id,
      date: today,
      morning: morning.trim(),
      afternoon: afternoon.trim(),
      submittedAt: now,
    }];
    const fullReportCount = newReports.filter(
      (r) => r.morning.length > 0 && r.afternoon.length > 0
    ).length;

    const newBadges = [...userData.badges];
    if (!newBadges.includes('report-first')) newBadges.push('report-first');
    if (newReports.length >= 10 && !newBadges.includes('report-10')) newBadges.push('report-10');
    if (newReports.length >= 30 && !newBadges.includes('report-30')) newBadges.push('report-30');
    if (fullReportCount >= 5 && !newBadges.includes('report-full')) newBadges.push('report-full');

    // プロフィール更新
    await supabase.from('profiles').update({
      exp: newExp,
      level: newLevel,
      exp_to_next: expToNextValue,
      akashi_coins: userData.akashiCoins + coinGain,
      badges: newBadges,
      updated_at: now,
    }).eq('id', authUser.id);

    await refreshProfile();

    setUserData((prev) => prev ? {
      ...prev,
      exp: newExp,
      level: newLevel,
      expToNext: expToNextValue,
      akashiCoins: prev.akashiCoins + coinGain,
      badges: newBadges,
      dailyReports: newReports,
      coinHistory: [
        ...prev.coinHistory,
        { id: txId, date: today, type: 'earn', amount: coinGain, reason: coinReason },
      ],
    } : null);

    // Googleスプシに送信（プルダウンとメモを分離）
    const parseParts = (text: string) => {
      const match = text.match(/^(.+?)（(.+)）$/);
      return match ? { activity: match[1], note: match[2] } : { activity: text, note: '' };
    };
    const mParts = parseParts(morning.trim());
    const aParts = parseParts(afternoon.trim());
    await sendToGoogleSheet({
      userName: userData.name,
      date: today,
      morningActivity: mParts.activity,
      morningNote: mParts.note,
      afternoonActivity: aParts.activity,
      afternoonNote: aParts.note,
      submittedAt: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
    });

    return { expGain, coinGain, newBadges: newBadges.filter((b) => !userData.badges.includes(b)) };
  }, [authUser, userData, refreshProfile]);

  return { userData, loading, checkIn, updateUser, addExchangeRequest, setUserData, submitDailyReport };
}
