/**
 * Supabase からユーザーデータを取得・更新するフック
 * 既存の User 型に変換して返す（既存コンポーネントとの互換性を保つ）
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, CheckInRecord, CoinTransaction, ExchangeRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getTodayString } from '../utils/dateUtils';

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
  }, [authUser, refreshProfile]);

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

  return { userData, loading, checkIn, updateUser, addExchangeRequest, setUserData };
}
