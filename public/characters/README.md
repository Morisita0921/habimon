# キャラクター画像配置ガイド

## 📁 フォルダ構造

```
public/characters/
├── README.md           ← このファイル
└── metao/              ← メタオのフォルダ
    ├── first.png       ← 第一形態（Lv1-2）
    └── second.png      ← 第二形態（Lv3-5）
```

## 🖼️ 画像仕様

### 推奨フォーマット
- **形式**: PNG（透過背景）推奨。JPG でも可。SVG も対応
- **サイズ**: 正方形 512x512 px 以上推奨（キャラが中央に来るように）
- **背景**: 透過（透過できない場合は白背景でもOK）

### ファイル名
- `first.png` — 第一形態（Lv1・Lv2で表示）
- `second.png` — 第二形態（Lv3・Lv4・Lv5で表示）

## ➕ 新しいキャラクターを追加する場合

1. `public/characters/` 配下に新しいフォルダを作成
   例: `public/characters/ひつじーぬ/`
2. その中に `first.png` と `second.png` を配置
3. `src/data/characters.ts` にキャラクター情報を追加

```typescript
{
  id: 'hitsujin',
  name: 'ひつじーぬ',
  description: 'ふわふわもこもこ',
  forms: [
    { level: [1, 2], imageUrl: '/characters/hitsujin/first.png' },
    { level: [3, 4, 5], imageUrl: '/characters/hitsujin/second.png' },
  ],
}
```
