import type { Facility, User, CheckInRecord } from '../types';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function generateHistory(
  daysBack: number,
  pattern: 'daily' | 'weekday3' | 'irregular' | 'rare' | 'new',
): CheckInRecord[] {
  const records: CheckInRecord[] = [];
  const today = new Date();

  for (let i = daysBack; i >= 1; i--) { // i>=1 で今日を除外（チェックイン動作確認用）
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();

    // 土日はスキップ（営業日のみ）
    if (dow === 0 || dow === 6) continue;

    let checkedIn = false;
    let mood: 1 | 2 | 3 | 4 | 5 = 3;

    switch (pattern) {
      case 'daily':
        checkedIn = true;
        mood = (Math.random() > 0.3 ? 5 : 4) as 4 | 5;
        break;
      case 'weekday3':
        // 月水金のパターン
        checkedIn = dow === 1 || dow === 3 || dow === 5;
        mood = (checkedIn ? (Math.random() > 0.5 ? 4 : 3) : 3) as 3 | 4;
        break;
      case 'irregular':
        checkedIn = Math.random() > 0.4;
        mood = Math.ceil(Math.random() * 5) as 1 | 2 | 3 | 4 | 5;
        break;
      case 'rare':
        checkedIn = Math.random() > 0.75;
        mood = Math.ceil(Math.random() * 3) as 1 | 2 | 3;
        break;
      case 'new':
        // 直近5日のみ
        checkedIn = i <= 5;
        mood = (checkedIn ? 3 : 3) as 3;
        break;
    }

    if (checkedIn || pattern !== 'new' || i <= 10) {
      records.push({
        date: formatDate(d),
        mood,
        checkedIn,
      });
    }
  }

  return records;
}

function calcStreak(history: CheckInRecord[]): number {
  let streak = 0;
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  for (const r of sorted) {
    if (r.checkedIn) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calcTotalCheckIns(history: CheckInRecord[]): number {
  return history.filter((r) => r.checkedIn).length;
}

function createUser(
  id: string,
  name: string,
  characterName: string,
  level: number,
  exp: number,
  pattern: 'daily' | 'weekday3' | 'irregular' | 'rare' | 'new',
  daysBack: number,
  badges: string[],
  akashiCoins: number = 0,
  ownedCosmetics: string[] = [],
  equippedCosmetics: string[] = [],
  selectedCharacterId?: string,
): User {
  const expThresholds = [0, 100, 300, 600, 1000];
  const history = generateHistory(daysBack, pattern);
  const streak = calcStreak(history);
  const totalCheckIns = calcTotalCheckIns(history);

  return {
    id,
    name,
    characterName,
    selectedCharacterId,
    level,
    exp,
    expToNext: level < 5 ? expThresholds[level] : 0,
    streak,
    totalCheckIns,
    badges,
    checkInHistory: history,
    akashiCoins,
    ownedCosmetics,
    equippedCosmetics,
    coinHistory: [],
    exchangeRequests: [],
    dailyReports: [],
  };
}

export function createSampleData(): Facility {
  const users: User[] = [
    createUser(
      'user-1',
      'さくら',
      'もこたん',
      4,
      650,
      'daily',
      60,
      ['first-checkin', 'streak-3', 'streak-7', 'streak-14', 'streak-30', 'genki-5', 'record-master'],
      12500,
      [],
      [],
    ),
    createUser(
      'user-2',
      'たけし',
      'ぴょんきち',
      3,
      320,
      'weekday3',
      45,
      ['first-checkin', 'streak-3', 'streak-7'],
      4200,
      [],
      [],
    ),
    createUser(
      'user-3',
      'はなこ',
      'メタオ',
      2,
      295, // Lv.3 まであと5 EXP（1回チェックインで進化発動）
      'irregular',
      30,
      ['first-checkin', 'streak-3'],
      2100,
      [],
      [],
      'metao', // ← メタオを選択済みに設定
    ),
    createUser(
      'user-4',
      'ゆうた',
      'ごろにゃん',
      1,
      30,
      'rare',
      40,
      ['first-checkin'],
      650,
      [],
      [],
    ),
    createUser(
      'user-5',
      'みく',
      'きらぴか',
      1,
      25,
      'new',
      7,
      ['first-checkin'],
      350,
      [],
      [],
    ),
  ];

  return {
    name: 'ひまわり就労支援事業所',
    users,
    capacity: 20,
  };
}
