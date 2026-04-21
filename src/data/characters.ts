import type { CharacterDefinition, CharacterForm } from '../types';

/**
 * キャラクターレジストリ
 *
 * 新しいキャラクターを追加する場合:
 * 1. public/characters/<id>/ フォルダに画像を配置
 *    - first.png  (第一形態)
 *    - second.png (第二形態)
 * 2. このファイルに CharacterDefinition を追加
 */
export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'metao',
    name: 'メタオ',
    description: 'メタゲーム明石のマスコット',
    thumbnail: '/characters/metao/first.png',
    forms: [
      {
        levels: [1, 2],
        imageUrl: '/characters/metao/first.png',
        label: '第一形態',
      },
      {
        levels: [3, 4, 5],
        imageUrl: '/characters/metao/second.png',
        label: '第二形態',
      },
    ],
  },
];

/**
 * ID からキャラクター定義を取得
 */
export function getCharacterById(id: string | undefined): CharacterDefinition | undefined {
  if (!id) return undefined;
  return CHARACTERS.find((c) => c.id === id);
}

/**
 * 指定レベルで表示すべき画像URLを取得
 */
export function getCharacterImageForLevel(
  character: CharacterDefinition,
  level: number
): string | undefined {
  const form = character.forms.find((f) => f.levels.includes(level));
  return form?.imageUrl;
}

/**
 * 指定レベルのフォーム情報を取得
 */
export function getCharacterFormForLevel(
  character: CharacterDefinition,
  level: number
): CharacterForm | undefined {
  return character.forms.find((f) => f.levels.includes(level));
}

/**
 * 指定レベルで進化するかを判定
 * prevLevel → nextLevel で別フォームに変わる場合 true
 */
export function isEvolutionLevel(
  character: CharacterDefinition,
  prevLevel: number,
  nextLevel: number
): boolean {
  const prevForm = getCharacterFormForLevel(character, prevLevel);
  const nextForm = getCharacterFormForLevel(character, nextLevel);
  if (!prevForm || !nextForm) return false;
  return prevForm.imageUrl !== nextForm.imageUrl;
}
