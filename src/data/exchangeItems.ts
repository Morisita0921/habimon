import type { ExchangeItem, ExchangeItemCategory } from '../types';

/**
 * 交換カタログ（仮）
 *
 * 実運用時は管理画面からの追加・編集に移行予定。
 * 画像は絵文字で仮実装。将来的に imageUrl フィールドを追加。
 */
export const EXCHANGE_ITEMS: ExchangeItem[] = [
  // お菓子
  {
    id: 'pudding',
    name: 'プリン',
    description: 'なめらかカスタードプリン',
    category: 'snack',
    price: 500,
    emoji: '🍮',
    available: true,
  },
  {
    id: 'chocolate',
    name: 'チョコレート',
    description: 'ミルクチョコレート小袋',
    category: 'snack',
    price: 400,
    emoji: '🍫',
    available: true,
  },
  {
    id: 'cookie',
    name: 'クッキー',
    description: 'バタークッキー3枚入り',
    category: 'snack',
    price: 600,
    emoji: '🍪',
    available: true,
  },
  {
    id: 'chips',
    name: 'ポテトチップス',
    description: '小袋サイズ',
    category: 'snack',
    price: 500,
    emoji: '🍟',
    available: true,
  },
  {
    id: 'ice-cream',
    name: 'アイスクリーム',
    description: 'カップアイス',
    category: 'snack',
    price: 700,
    emoji: '🍦',
    available: true,
  },
  // 飲み物
  {
    id: 'juice',
    name: 'ジュース',
    description: 'オレンジジュース 200ml',
    category: 'drink',
    price: 500,
    emoji: '🧃',
    available: true,
  },
  {
    id: 'tea',
    name: 'お茶',
    description: 'ペットボトルお茶 500ml',
    category: 'drink',
    price: 400,
    emoji: '🍵',
    available: true,
  },
  {
    id: 'coffee',
    name: 'コーヒー',
    description: '缶コーヒー',
    category: 'drink',
    price: 600,
    emoji: '☕',
    available: true,
  },
  {
    id: 'cocoa',
    name: 'ココア',
    description: 'ホットココア',
    category: 'drink',
    price: 500,
    emoji: '🍫',
    available: true,
  },
  // 日用品
  {
    id: 'tissue',
    name: 'ティッシュペーパー',
    description: 'ポケットティッシュ1個',
    category: 'daily',
    price: 300,
    emoji: '🧻',
    available: true,
  },
  {
    id: 'toothbrush',
    name: '歯ブラシ',
    description: '新品の歯ブラシ1本',
    category: 'daily',
    price: 800,
    emoji: '🪥',
    available: true,
  },
  {
    id: 'soap',
    name: 'せっけん',
    description: '手洗いせっけん',
    category: 'daily',
    price: 1000,
    emoji: '🧼',
    available: true,
  },
  {
    id: 'ballpen',
    name: 'ボールペン',
    description: '新品のボールペン1本',
    category: 'daily',
    price: 500,
    emoji: '🖊️',
    available: true,
  },
];

export const CATEGORY_LABELS: Record<ExchangeItemCategory, string> = {
  snack: 'お菓子',
  drink: '飲み物',
  daily: '日用品',
};

export const CATEGORY_ICONS: Record<ExchangeItemCategory, string> = {
  snack: '🍭',
  drink: '🥤',
  daily: '🧺',
};

export function getItemById(id: string): ExchangeItem | undefined {
  return EXCHANGE_ITEMS.find((i) => i.id === id);
}
