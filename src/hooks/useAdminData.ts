/**
 * 管理者用データ取得フック
 * 全ユーザーのプロフィール・チェックイン情報をSupabaseから取得
 */
import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin as supabase } from '../lib/supabase';
import type { User, CheckInRecord, CoinTransaction, ExchangeRequest } from '../types';

export interface AdminFacilityData {
  name: string;
  users: User[];
  capacity: number;
}

export function useAdminData() {
  const [facilityData, setFacilityData] = useState<AdminFacilityData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setLoading(true);

    // 全プロフィール取得（管理者含む）
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (!profiles) {
      setLoading(false);
      return;
    }

    const userIds = profiles.map((p) => p.id);

    // 全チェックイン履歴
    const { data: allCheckIns } = await supabase
      .from('check_ins')
      .select('*')
      .in('user_id', userIds);

    // 全コイン履歴
    const { data: allCoinTxs } = await supabase
      .from('coin_transactions')
      .select('*')
      .in('user_id', userIds);

    // 全交換申請
    const { data: allExchangeReqs } = await supabase
      .from('exchange_requests')
      .select('*')
      .in('user_id', userIds);

    const users: User[] = profiles.map((profile) => {
      const checkInHistory: CheckInRecord[] = (allCheckIns ?? [])
        .filter((r) => r.user_id === profile.id)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({
          date: r.date,
          mood: r.mood as 1 | 2 | 3 | 4 | 5,
          checkedIn: r.checked_in,
        }));

      const coinHistory: CoinTransaction[] = (allCoinTxs ?? [])
        .filter((r) => r.user_id === profile.id)
        .map((r) => ({
          id: r.id,
          date: r.date,
          type: r.type as 'earn' | 'spend',
          amount: r.amount,
          reason: r.reason,
        }));

      const exchangeRequests: ExchangeRequest[] = (allExchangeReqs ?? [])
        .filter((r) => r.user_id === profile.id)
        .map((r) => ({
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
        badges: profile.badges ?? [],
        akashiCoins: profile.akashi_coins,
        ownedCosmetics: profile.owned_cosmetics ?? [],
        equippedCosmetics: profile.equipped_cosmetics ?? [],
        checkInHistory,
        coinHistory,
        exchangeRequests,
        dailyReports: [],
        isAdmin: profile.is_admin ?? false,
      };
    });

    setFacilityData({
      name: profiles[0]?.facility_name ?? 'メタゲーム明石',
      users,
      capacity: 20,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ユーザー更新（管理者からのコイン付与・申請管理など）
  const updateUser = useCallback(async (updatedUser: User) => {
    // プロフィール更新
    await supabase.from('profiles').update({
      akashi_coins: updatedUser.akashiCoins,
      updated_at: new Date().toISOString(),
    }).eq('id', updatedUser.id);

    // 交換申請の状態更新
    for (const req of updatedUser.exchangeRequests) {
      await supabase.from('exchange_requests').update({
        status: req.status,
        processed_at: req.processedAt ?? null,
        note: req.note ?? null,
      }).eq('id', req.id);
    }

    // コイン履歴の差分追加
    const existing = facilityData?.users.find((u) => u.id === updatedUser.id);
    if (existing) {
      const newTxs = updatedUser.coinHistory.slice(existing.coinHistory.length);
      if (newTxs.length > 0) {
        await supabase.from('coin_transactions').insert(
          newTxs.map((tx) => ({
            id: tx.id,
            user_id: updatedUser.id,
            date: tx.date,
            type: tx.type,
            amount: tx.amount,
            reason: tx.reason,
          }))
        );
      }
    }

    // ローカル状態を更新
    setFacilityData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map((u) => u.id === updatedUser.id ? updatedUser : u),
      };
    });
  }, [facilityData]);

  // 管理者権限トグル
  const toggleAdmin = useCallback(async (userId: string, newIsAdmin: boolean) => {
    await supabase.from('profiles').update({
      is_admin: newIsAdmin,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    setFacilityData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, isAdmin: newIsAdmin } : u
        ),
      };
    });
  }, []);

  // ユーザー名変更
  const updateUserName = useCallback(async (userId: string, newName: string) => {
    await supabase.from('profiles').update({
      name: newName,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    setFacilityData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, name: newName } : u
        ),
      };
    });
  }, []);

  return { facilityData, loading, updateUser, toggleAdmin, updateUserName, refresh: fetchAllData };
}
