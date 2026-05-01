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
  // 通所実績バッジ
  {
    id: 'total-30',
    name: '30かいかよったよ',
    description: '通算30日出席した',
    icon: '🎯',
    condition: '通算出席30日',
  },
  {
    id: 'total-50',
    name: 'かよいびと',
    description: '通算50日出席した',
    icon: '🌈',
    condition: '通算出席50日',
  },
  // 日報バッジ
  {
    id: 'report-first',
    name: 'はじめての日報',
    description: '初めて日報を提出した',
    icon: '📋',
    condition: '日報を初めて提出',
  },
  {
    id: 'report-10',
    name: '日報10かい',
    description: '日報を10回提出した',
    icon: '📑',
    condition: '日報10回提出',
  },
  {
    id: 'report-30',
    name: '日報マスター',
    description: '日報を30回提出した',
    icon: '📚',
    condition: '日報30回提出',
  },
  {
    id: 'report-full',
    name: 'ていねいな記録',
    description: '午前・午後の両方を書いた日報を5回提出した',
    icon: '✍️',
    condition: '午前・午後の両方記入×5回',
  },
];
