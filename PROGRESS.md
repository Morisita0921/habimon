# ハビもん 開発進捗メモ

**最終更新**: 2026-04-10
**目的**: 別PC・別セッションからでも続きから作業できるようにするための進捗記録

---

## 📦 プロジェクト概要

- **アプリ名**: ハビもん（Habit + Monster）
- **用途**: B型就労支援施設向けの出席ゲーミフィケーションアプリ
- **導入先**: メタゲーム明石
- **技術スタック**: React + TypeScript + Vite + Tailwind CSS v4 + framer-motion + lucide-react + recharts
- **データ保存**: localStorage（現状、Phase D で認証＋クラウド同期予定）

---

## 🎯 完了フェーズ

### ✅ 基本機能（完了済み）
- キャラクター育成（Lv1〜Lv5）
- 出席チェックイン＋体調記録（5段階mood）
- EXP・連続出席・バッジシステム
- カレンダー表示
- 管理者ダッシュボード（KPI・月別稼働率グラフ・利用者一覧）
- 管理者ログイン（デモ用パスワード: 1234）
- 管理者ログインボタンをナビバーに追加

### ✅ UIリファイン（完了済み）
- 絵文字を SVG アイコン・Lucide アイコンに置き換え
- ステータスバーのデザイン改善
- ソシャゲ風デザインへの寄せ

### ✅ アカシコイン Phase 1（完了済み）
B型施設内独自通貨の導入。

**データモデル**（`src/types.ts`）:
```typescript
User {
  akashiCoins: number
  ownedCosmetics: string[]
  equippedCosmetics: string[]
  coinHistory: CoinTransaction[]
}
CoinTransaction { id, date, type: 'earn'|'spend', amount, reason }
Cosmetic { id, name, description, rarity, category, price, imageUrl? }
```

**コイン獲得レート**（`src/utils/coinCalculator.ts`）:
- 出席チェックイン: +100
- 体調記録: +50
- 連続ボーナス: 3日+200 / 7日+500 / 14日+1,000 / 30日+3,000

**着せ替えアイテム10種**（`src/data/cosmetics.ts`）:
- コモン4種: リボン800 / まるメガネ800 / ハートのほっぺ1,000 / マフラー1,200
- レア4種: シルクハット3,000 / きらめきマント4,000 / ちょうちょ3,500 / キャンディの杖4,500
- エピック2種: きらめき王冠10,000 / ユニコーンの角15,000

**関連ファイル**:
- `src/views/ShopView.tsx` — ショップ画面（shop/closet 2タブ）
- `src/components/CosmeticOverlay.tsx` — 装着アイテムのSVG描画
- `src/components/CosmeticPreview.tsx` — ショップ用プレビュー
- `src/components/Character.tsx` — equippedCosmetics propで重ね描画
- `src/utils/storage.ts` — migrateUser/migrateFacility（後方互換）

### ✅ コイン獲得演出ゴージャス化（完了済み）
`src/components/CheckInButton.tsx` にて実装:
- 金色放射フラッシュ背景
- 20枚の¥コインSVG放射状アニメーション（スピン）
- 16個のキラキラパーティクル（✨⭐💰🪙）
- 回転する大きなCoinsアイコン（size 72、glow付き）
- グラデーション「+XXX」テキスト（text-6xl、金色）
- 「アカシコイン GET!」サブテキスト
- 連続ボーナス時のオレンジバッジ「🔥 N日れんぞく ボーナス！」
- EXPアニメーションの1.2秒後に連続再生

**重要 prop**: `currentStreak` を `UserHome.tsx` から渡す必要あり。

### ✅ Phase A: 支援員によるコイン付与機能（完了済み）
**新規ファイル**: `src/views/AdminCoinGrant.tsx`

**UI構造**（3ステップ + 履歴サイドバー）:
1. **利用者を選ぶ** — カード式、コイン残高表示
2. **金額を選ぶ** — プリセット（+50/+100/+200/+500/+1000）＋カスタム
3. **理由を選ぶ** — プリセット8種＋カスタム入力
   - 🧹 清掃業務を丁寧に行った
   - ✨ 作業を集中して取り組めた
   - 👋 挨拶が素晴らしかった
   - 🤝 同僚を助けた
   - 🌟 新しい作業に挑戦した
   - ⏰ 時間をきちんと守った
   - 💪 難しい作業をやり遂げた
   - 😊 笑顔で取り組めた

**その他**:
- 確認モーダル（利用者・金額・理由・付与後残高）
- 成功トースト（2.5秒で消える）
- 最近の付与履歴パネル（右サイドバー、最新10件）
- 付与レコードは `[支援員] プレフィックス` 付きで `coinHistory` に記録

**統合変更**:
- `src/views/AdminDashboard.tsx` にタブ（`activeTab: 'dashboard' | 'coin-grant'`）追加
- `AdminDashboard` props に `onUpdateUser` 追加
- `src/App.tsx` から `handleUpdateUser` を渡す

**検証結果**（2026-04-10 プレビュー確認済み）:
- たけし 4,200コイン → +200付与 → 4,400コインに更新
- 利用者画面のコイン残高にも即座に反映

---

## 🔜 次フェーズ候補（優先度順）

### 【B】日報機能（カレンダー連携） — 次の本命
- チェックイン時に一言日報を記入
- カレンダー画面から過去の日報を閲覧
- 気分の推移グラフとの連動
- 支援員からのコメント機能（オプション）

### 【C】コインショップ Phase 2: 実物アイテム対応
- 実物アイテムカテゴリ（おやつ / 日用品）
- 在庫管理
- 交換申請 → 支援員承認フロー
- 引き渡し完了チェック

### 【D】多端末対応（認証機能）
- 利用者ごとの簡易ログイン（ID＋4桁PINなど）
- Firebase / Supabase でクラウド同期
- 管理者画面との分離

### その他の積み残し
- Phase A の拡張: 付与履歴をダッシュボードKPIにも反映、付与取り消し機能
- ハビもんロードマップ: 日報機能（カレンダー連携）

---

## 🛠 開発環境メモ

**起動コマンド**:
- プロジェクトルート: `F:\動画編集\Claudecode\morishita-video-agents`
- ハビもんフォルダ: `habimon/`
- 開発サーバー: `.claude/launch.json` の `habimon-dev`（port 5173）

**既知の注意点**:
- `verbatimModuleSyntax: true` のため、型のみの import は `import type` を使用する
- Unicode minus sign `U+2212` が framer-motion の rotate 値でパースエラーを起こす → ASCII ハイフン `-` を使用
- localStorage データ構造を変更した際は `src/utils/storage.ts` の migrateUser/migrateFacility を更新

**デモ用パスワード**: `1234`（管理者ログイン）

---

## 📝 別PCで再開する手順

1. `git pull` で最新を取得
2. `habimon/` で `npm install`
3. `npm run dev` または `.claude/launch.json` の `habimon-dev` を起動
4. この `PROGRESS.md` を読んで現状把握
5. 次フェーズ（多くは【B】日報機能）から着手

---

## 🎨 ブランド・デザイン方針

- ソシャゲ風の温かいトーン
- 利用者画面は青〜オレンジのグラデーション背景
- 管理者画面はネイビー基調
- アカシコイン関連は金/アンバー系
- ひらがなベースで利用者に親しみやすく
