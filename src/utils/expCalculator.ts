import type { User } from '../types';

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000];

export const EXP_VALUES = {
  checkIn: 20,
  streak3: 10,
  streak7: 30,
  streak14: 50,
  moodRecord: 5,
  monthlyGoal: 100,
};

export function calculateCheckInExp(currentStreak: number): number {
  let exp = EXP_VALUES.checkIn;
  const newStreak = currentStreak + 1;

  if (newStreak % 3 === 0) exp += EXP_VALUES.streak3;
  if (newStreak % 7 === 0) exp += EXP_VALUES.streak7;
  if (newStreak % 14 === 0) exp += EXP_VALUES.streak14;

  return exp;
}

export function getExpForLevel(level: number): number {
  if (level < 1) return 0;
  if (level > 5) return LEVEL_THRESHOLDS[4];
  return LEVEL_THRESHOLDS[level - 1];
}

export function getExpToNextLevel(level: number): number {
  if (level >= 5) return 0;
  return LEVEL_THRESHOLDS[level];
}

export function calculateNewLevel(totalExp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalExp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getExpProgress(user: User): { current: number; needed: number; percent: number } {
  if (user.level >= 5) {
    return { current: user.exp, needed: LEVEL_THRESHOLDS[4], percent: 100 };
  }
  const currentLevelExp = LEVEL_THRESHOLDS[user.level - 1];
  const nextLevelExp = LEVEL_THRESHOLDS[user.level];
  const current = user.exp - currentLevelExp;
  const needed = nextLevelExp - currentLevelExp;
  const percent = Math.min(100, Math.round((current / needed) * 100));
  return { current, needed, percent };
}
