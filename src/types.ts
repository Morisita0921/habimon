export interface CheckInRecord {
  date: string; // YYYY-MM-DD
  mood: 1 | 2 | 3 | 4 | 5;
  checkedIn: boolean;
}

export interface User {
  id: string;
  name: string;
  characterName: string;
  characterImages?: CharacterImages; // カスタム画像（事業所設定用）
  selectedCharacterId?: string; // 選択中のキャラクターID（character registry 参照）
  level: number; // 1-5
  exp: number;
  expToNext: number;
  streak: number;
  totalCheckIns: number;
  badges: string[];
  checkInHistory: CheckInRecord[];
  // アカシコイン関連
  akashiCoins: number;
  ownedCosmetics: string[];      // 所持アイテムID（レガシー・非表示）
  equippedCosmetics: string[];   // 装着中アイテムID（レガシー・非表示）
  coinHistory: CoinTransaction[];
  // 物品交換申請
  exchangeRequests: ExchangeRequest[];
  // 日報
  dailyReports: DailyReport[];
}

// 物品交換カタログのアイテム
export type ExchangeItemCategory = 'snack' | 'drink' | 'daily';

export interface ExchangeItem {
  id: string;
  name: string;
  description: string;
  category: ExchangeItemCategory;
  price: number;
  emoji: string; // 商品ビジュアル（絵文字）
  available: boolean;
}

// 申請のステータス
export type ExchangeRequestStatus = 'pending' | 'approved' | 'delivered' | 'rejected';

// 物品交換申請レコード
export interface ExchangeRequest {
  id: string;
  itemId: string;
  itemName: string;      // スナップショット（カタログ削除時の保険）
  itemEmoji: string;
  price: number;          // スナップショット
  status: ExchangeRequestStatus;
  requestedAt: string;    // YYYY-MM-DD HH:mm
  processedAt?: string;   // 承認/却下/受取の日時
  note?: string;          // 支援員メモ
}

// キャラクターレジストリ（画像ベース）
export interface CharacterDefinition {
  id: string;
  name: string;
  description: string;
  // 形態ごとの画像（レベル範囲でマッピング）
  forms: CharacterForm[];
  // ショップ等で使う小さなアイコン（先頭形態の画像を流用してもよい）
  thumbnail?: string;
}

export interface CharacterForm {
  levels: number[]; // このフォームが有効なレベル（例: [1, 2]）
  imageUrl: string; // 画像のパス（public 配下の絶対パス）
  label?: string; // 「第一形態」などの表示用ラベル
}

export interface CoinTransaction {
  id: string;
  date: string; // YYYY-MM-DD HH:mm
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
}

export type CosmeticRarity = 'common' | 'rare' | 'epic';
export type CosmeticCategory = 'head' | 'face' | 'body' | 'accessory';

export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  rarity: CosmeticRarity;
  category: CosmeticCategory;
  price: number;
  // 将来の画像差し替え対応用
  imageUrl?: string;
}

// レベルごとのキャラクター画像URL（事業所がアップロード）
export interface CharacterImages {
  lv1?: string; // 画像URL or Base64
  lv2?: string;
  lv3?: string;
  lv4?: string;
  lv5?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export interface Facility {
  name: string;
  users: User[];
  capacity: number;
  adminPassword?: string; // 管理者パスワード（プロトタイプ用）
}

export type ViewType = 'home' | 'calendar' | 'achievement' | 'shop' | 'admin' | 'parent' | 'character-select' | 'report';

// 日報
export interface DailyReport {
  id: string;
  date: string;       // YYYY-MM-DD
  morning: string;    // 午前の活動
  afternoon: string;  // 午後の活動
  submittedAt: string;
}

// Supabase profiles テーブルの型
export interface Profile {
  id: string;
  name: string;
  character_name: string;
  selected_character_id: string | null;
  level: number;
  exp: number;
  exp_to_next: number;
  streak: number;
  total_check_ins: number;
  badges: string[];
  akashi_coins: number;
  owned_cosmetics: string[];
  equipped_cosmetics: string[];
  is_admin: boolean;
  facility_name: string;
  created_at: string;
  updated_at: string;
}
