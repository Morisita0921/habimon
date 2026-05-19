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

    // 全日報
    const { data: allDailyReports } = await supabase
      .from('daily_reports')
      .select('*')
      .in('user_id', userIds)
      .order('date', { ascending: false });

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
        dailyReports: (allDailyReports ?? [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => ({
            id: r.id,
            date: r.date,
            morning: r.morning ?? '',
            afternoon: r.afternoon ?? '',
            submittedAt: r.submitted_at,
          })),
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

  // ユーザー更新（管理者からのコイン付与など）
  const updateUser = useCallback(async (updatedUser: User) => {
    // プロフィール更新
    await supabase.from('profiles').update({
      akashi_coins: updatedUser.akashiCoins,
      updated_at: new Date().toISOString(),
    }).eq('id', updatedUser.id);

    // コイン履歴の差分追加
    const existing = facilityData?.users.find((u) => u.id === updatedUser.id);
    if (existing) {
      const newTxs = updatedUser.coinHistory.slice(existing.coinHistory.length);
      if (newTxs.length > 0) {
        await supabase.from('coin_transactions').insert(
          newTxs.map((tx) => ({
            id: crypto.randomUUID(),
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

  // 交換申請のステータス更新（approve / reject / deliver 専用）
  const processExchangeRequest = useCallback(async (
    userId: string,
    requestId: string,
    newStatus: ExchangeRequest['status'],
    processedAt: string,
    coinDelta?: number,
    coinReason?: string,
  ) => {
    // 1. exchange_requests のステータスを更新
    const { error: reqError } = await supabase
      .from('exchange_requests')
      .update({ status: newStatus, processed_at: processedAt })
      .eq('id', requestId);
    if (reqError) throw new Error(`申請更新エラー: ${reqError.message}`);

    // 2. コイン消費がある場合（受取完了）
    if (coinDelta !== undefined && coinReason !== undefined) {
      const target = facilityData?.users.find((u) => u.id === userId);
      if (!target) throw new Error('ユーザーが見つかりません');

      const newCoins = target.akashiCoins + coinDelta;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ akashi_coins: newCoins, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (profileError) throw new Error(`コイン更新エラー: ${profileError.message}`);

      const { error: txError } = await supabase
        .from('coin_transactions')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          date: processedAt.slice(0, 10),
          type: coinDelta < 0 ? 'spend' : 'earn',
          amount: Math.abs(coinDelta),
          reason: coinReason,
        });
      if (txError) throw new Error(`コイン履歴エラー: ${txError.message}`);

      // ローカル状態を更新
      setFacilityData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) => {
            if (u.id !== userId) return u;
            return {
              ...u,
              akashiCoins: newCoins,
              coinHistory: [
                ...u.coinHistory,
                {
                  id: crypto.randomUUID(),
                  date: processedAt.slice(0, 10),
                  type: (coinDelta < 0 ? 'spend' : 'earn') as 'spend' | 'earn',
                  amount: Math.abs(coinDelta),
                  reason: coinReason,
                },
              ],
              exchangeRequests: u.exchangeRequests.map((r) =>
                r.id === requestId ? { ...r, status: newStatus, processedAt } : r
              ),
            };
          }),
        };
      });
    } else {
      // ローカル状態を更新（ステータスのみ）
      setFacilityData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) => {
            if (u.id !== userId) return u;
            return {
              ...u,
              exchangeRequests: u.exchangeRequests.map((r) =>
                r.id === requestId ? { ...r, status: newStatus, processedAt } : r
              ),
            };
          }),
        };
      });
    }
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

  // ユーザー削除（auth + 関連データ）
  const deleteUser = useCallback(async (userId: string) => {
    // Supabase auth ユーザー削除（カスケードで関連テーブルも削除される場合あり）
    await supabase.auth.admin.deleteUser(userId);
    // プロフィール削除（カスケード未設定の場合の保険）
    await supabase.from('daily_reports').delete().eq('user_id', userId);
    await supabase.from('coin_transactions').delete().eq('user_id', userId);
    await supabase.from('exchange_requests').delete().eq('user_id', userId);
    await supabase.from('check_ins').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);

    setFacilityData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
      };
    });
  }, []);

  return { facilityData, loading, updateUser, processExchangeRequest, toggleAdmin, updateUserName, deleteUser, refresh: fetchAllData };
}
