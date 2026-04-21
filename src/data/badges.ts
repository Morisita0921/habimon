import type { Badge } from '../types';

export const BADGES: Badge[] = [
  {
    id: 'first-checkin',
    name: 'はじめの一歩',
    description: '初めてチェックインした',
    icon: '🐣',
    condition: '初チェックイン',
  },
  {
    id: 'streak-3',
    name: '3日れんぞく',
    description: '3日連続で出席した',
    icon: '⭐',
    condition: '3日連続出席',
  },
  {
    id: 'streak-7',
    name: '1しゅうかん',
    description: '7日連続で出席した',
    icon: '🌟',
    condition: '7日連続出席',
  },
  {
    id: 'streak-14',
    name: '2しゅうかん',
    description: '14日連続で出席した',
    icon: '💫',
    condition: '14日連続出席',
  },
  {
    id: 'streak-30',
    name: '1かげつ',
    description: '30日連続で出席した',
    icon: '🏆',
    condition: '30日連続出席',
  },
  {
    id: 'perfect-month',
    name: 'かいきんしょう',
    description: '月の営業日すべてに出席した',
    icon: '👑',
    condition: '月の営業日全出席',
  },
  {
    id: 'genki-5',
    name: 'げんきいっぱい',
    description: '体調「とてもげんき」を5回記録した',
    icon: '💪',
    condition: '体調5を5回記録',
  },
  {
    id: 'record-master',
    name: 'きろくマスター',
    description: '体調記録を20回つけた',
    icon: '📝',
    condition: '体調記録を20回',
  },
];
