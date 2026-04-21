// アカシコイン獲得計算ユーティリティ

export const COIN_VALUES = {
  checkIn: 100,
  moodRecord: 50,
} as const;

export const STREAK_BONUSES: { days: number; coins: number }[] = [
  { days: 3, coins: 200 },
  { days: 7, coins: 500 },
  { days: 14, coins: 1000 },
  { days: 30, coins: 3000 },
];

export interface CoinGainBreakdown {
  checkIn: number;
  moodRecord: number;
  streakBonus: number;
  streakBonusDays?: number;
  total: number;
}

/**
 * チェックイン時に獲得するコインを計算する
 * @param newStreak チェックイン後の連続日数
 */
export function calculateCheckInCoins(newStreak: number): CoinGainBreakdown {
  const checkIn = COIN_VALUES.checkIn;
  const moodRecord = COIN_VALUES.moodRecord;

  // この出席で達成した連続ボーナスがあるか
  const matched = STREAK_BONUSES.find((b) => b.days === newStreak);
  const streakBonus = matched?.coins ?? 0;

  return {
    checkIn,
    moodRecord,
    streakBonus,
    streakBonusDays: matched?.days,
    total: checkIn + moodRecord + streakBonus,
  };
}

export function formatCoins(amount: number): string {
  return amount.toLocaleString('ja-JP');
}
