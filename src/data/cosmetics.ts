import type { Cosmetic } from '../types';

// アカシコイン用 着せ替えアイテム10種
export const COSMETICS: Cosmetic[] = [
  // === コモン（4種） ===
  {
    id: 'ribbon',
    name: 'リボン',
    description: 'あたまにつけるかわいいリボン',
    rarity: 'common',
    category: 'head',
    price: 800,
  },
  {
    id: 'glasses',
    name: 'まるメガネ',
    description: 'ちてきな ふんいきのメガネ',
    rarity: 'common',
    category: 'face',
    price: 800,
  },
  {
    id: 'heart-cheeks',
    name: 'ハートのほっぺ',
    description: 'ほっぺが ハートに なる',
    rarity: 'common',
    category: 'face',
    price: 1000,
  },
  {
    id: 'scarf',
    name: 'マフラー',
    description: 'あったかそうな マフラー',
    rarity: 'common',
    category: 'body',
    price: 1200,
  },
  // === レア（4種） ===
  {
    id: 'top-hat',
    name: 'シルクハット',
    description: 'おしゃれな くろい ハット',
    rarity: 'rare',
    category: 'head',
    price: 3000,
  },
  {
    id: 'sparkle-cape',
    name: 'きらめきマント',
    description: 'キラキラ ひかる マント',
    rarity: 'rare',
    category: 'body',
    price: 4000,
  },
  {
    id: 'butterfly',
    name: 'ちょうちょ',
    description: 'あたまに とまる ちょうちょ',
    rarity: 'rare',
    category: 'head',
    price: 3500,
  },
  {
    id: 'candy-wand',
    name: 'キャンディの杖',
    description: 'もっているだけで あまい',
    rarity: 'rare',
    category: 'accessory',
    price: 4500,
  },
  // === エピック（2種） ===
  {
    id: 'royal-crown',
    name: 'きらめき王冠',
    description: 'ほうせきが かがやく きらめき王冠',
    rarity: 'epic',
    category: 'head',
    price: 10000,
  },
  {
    id: 'unicorn-horn',
    name: 'ユニコーンの角',
    description: 'でんせつの キャラの しょうちょう',
    rarity: 'epic',
    category: 'head',
    price: 15000,
  },
];

export function getCosmetic(id: string): Cosmetic | undefined {
  return COSMETICS.find((c) => c.id === id);
}

export const RARITY_LABELS: Record<string, string> = {
  common: 'コモン',
  rare: 'レア',
  epic: 'エピック',
};

export const RARITY_COLORS: Record<string, { from: string; to: string; border: string; text: string }> = {
  common: { from: '#E0F2FE', to: '#BAE6FD', border: '#7DD3FC', text: '#0369A1' },
  rare: { from: '#F3E8FF', to: '#E9D5FF', border: '#C084FC', text: '#7E22CE' },
  epic: { from: '#FEF3C7', to: '#FDE68A', border: '#FBBF24', text: '#B45309' },
};
