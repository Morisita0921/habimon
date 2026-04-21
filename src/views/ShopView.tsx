import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Check, X, Clock, Package, ShoppingBag, History } from 'lucide-react';
import type { User, ExchangeItem, ExchangeRequest, ExchangeItemCategory } from '../types';
import {
  EXCHANGE_ITEMS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '../data/exchangeItems';
import { formatCoins } from '../utils/coinCalculator';
import { getTodayString } from '../utils/dateUtils';

interface ShopViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

type ShopTab = 'catalog' | 'my-requests';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: '申請中', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '⏳' },
  approved: { label: '承認ずみ（受取まち）', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: '✅' },
  delivered: { label: '受取ずみ', color: 'bg-green-100 text-green-700 border-green-300', icon: '🎁' },
  rejected: { label: 'きゃっか', color: 'bg-gray-200 text-gray-600 border-gray-300', icon: '❌' },
};

export default function ShopView({ user, onUpdateUser }: ShopViewProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('catalog');
  const [activeCategory, setActiveCategory] = useState<ExchangeItemCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<ExchangeItem | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // 申請中の件数（申請中 or 承認ずみ）
  const pendingCount = useMemo(
    () => user.exchangeRequests.filter((r) => r.status === 'pending' || r.status === 'approved').length,
    [user.exchangeRequests]
  );

  // カテゴリフィルタ
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return EXCHANGE_ITEMS.filter((i) => i.available);
    return EXCHANGE_ITEMS.filter((i) => i.available && i.category === activeCategory);
  }, [activeCategory]);

  // 自分の申請履歴（新しい順）
  const myRequests = useMemo(() => {
    return [...user.exchangeRequests].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  }, [user.exchangeRequests]);

  const handleRequest = () => {
    if (!selectedItem) return;

    const now = new Date();
    const dateStr = `${getTodayString()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newRequest: ExchangeRequest = {
      id: `req-${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemEmoji: selectedItem.emoji,
      price: selectedItem.price,
      status: 'pending',
      requestedAt: dateStr,
    };

    // コインは受取時に消費するので、ここでは減らさない
    const updated: User = {
      ...user,
      exchangeRequests: [...user.exchangeRequests, newRequest],
    };
    onUpdateUser(updated);
    setSelectedItem(null);
    setSuccessInfo(`${selectedItem.name}を もうしこみました！`);
    setTimeout(() => setSuccessInfo(null), 2500);
  };

  // 残高チェック
  const hasEnoughCoins = (price: number) => user.akashiCoins >= price;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-amber-50 via-yellow-50 to-white pb-24">
      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-amber-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} className="text-amber-600" />
            <h1 className="font-heading font-bold text-lg text-amber-700">アカシこうかん</h1>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full px-3 py-1 border border-amber-200">
            <Coins size={16} className="text-amber-600" fill="currentColor" />
            <span className="font-bold text-amber-800 text-sm">{formatCoins(user.akashiCoins)}</span>
          </div>
        </div>
        {/* タブ切替 */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2 rounded-lg font-heading font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white/50 text-gray-500 hover:bg-white'
            }`}
          >
            <Package size={16} />
            カタログ
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex-1 py-2 rounded-lg font-heading font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'my-requests'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white/50 text-gray-500 hover:bg-white'
            }`}
          >
            <History size={16} />
            マイもうしこみ
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* カタログタブ */}
      {activeTab === 'catalog' && (
        <div className="px-3 pt-3">
          {/* カテゴリフィルタ */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-heading font-bold border transition-colors ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              ぜんぶ
            </button>
            {(Object.keys(CATEGORY_LABELS) as ExchangeItemCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-heading font-bold border transition-colors flex items-center gap-1 ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* アイテムグリッド */}
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const affordable = hasEnoughCoins(item.price);
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  disabled={!item.available}
                  className={`relative bg-white rounded-2xl p-3 shadow-sm border-2 text-left transition-all ${
                    affordable ? 'border-amber-200 hover:border-amber-400 hover:shadow-md' : 'border-gray-200 opacity-60'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-amber-50 to-yellow-50 rounded-xl mb-2">
                    <span className="text-6xl" role="img" aria-label={item.name}>
                      {item.emoji}
                    </span>
                  </div>
                  <div className="font-heading font-bold text-sm text-gray-800 mb-0.5">{item.name}</div>
                  <div className="text-[11px] text-gray-500 mb-2 line-clamp-1">{item.description}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-700 font-bold text-sm">
                      <Coins size={12} fill="currentColor" />
                      {formatCoins(item.price)}
                    </div>
                    {!affordable && <span className="text-[10px] text-red-500 font-bold">コインふそく</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* 申請履歴タブ */}
      {activeTab === 'my-requests' && (
        <div className="px-3 pt-3">
          {myRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-heading text-sm">まだ もうしこみが ありません</p>
              <p className="text-xs mt-1">カタログから えらんでみよう！</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myRequests.map((req) => {
                const status = STATUS_LABELS[req.status];
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3"
                  >
                    <div className="w-14 h-14 shrink-0 bg-gradient-to-b from-amber-50 to-yellow-50 rounded-lg flex items-center justify-center text-3xl">
                      {req.itemEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-sm text-gray-800 truncate">{req.itemName}</div>
                      <div className="flex items-center gap-1 text-amber-700 font-bold text-xs">
                        <Coins size={10} fill="currentColor" />
                        {formatCoins(req.price)}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        もうしこみ: {req.requestedAt}
                        {req.processedAt && <> / しょり: {req.processedAt}</>}
                      </div>
                    </div>
                    <div className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 申請確認モーダル */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
            <motion.div
              className="relative bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-b from-amber-50 to-yellow-50 rounded-2xl flex items-center justify-center text-6xl mb-3">
                  {selectedItem.emoji}
                </div>
                <h3 className="font-heading font-black text-xl text-gray-800">{selectedItem.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedItem.description}</p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 mb-4 border border-amber-200">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">いま もっているコイン</span>
                  <span className="font-bold text-gray-800">{formatCoins(user.akashiCoins)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">ひつような コイン</span>
                  <span className="font-bold text-amber-700">{formatCoins(selectedItem.price)}</span>
                </div>
                <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between text-sm">
                  <span className="text-gray-600">うけとりごの のこり</span>
                  <span className={`font-bold ${hasEnoughCoins(selectedItem.price) ? 'text-green-600' : 'text-red-500'}`}>
                    {formatCoins(user.akashiCoins - selectedItem.price)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 text-center mb-4 flex items-center justify-center gap-1">
                <Clock size={11} />
                コインは「うけとり かんりょう」で ひかれます
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-heading font-bold text-gray-600 hover:bg-gray-50"
                >
                  <X size={16} className="inline mr-1" />
                  やめる
                </button>
                <button
                  onClick={handleRequest}
                  disabled={!hasEnoughCoins(selectedItem.price)}
                  className={`flex-1 py-3 rounded-xl font-heading font-bold shadow-md transition-all ${
                    hasEnoughCoins(selectedItem.price)
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check size={16} className="inline mr-1" />
                  もうしこむ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成功トースト */}
      <AnimatePresence>
        {successInfo && (
          <motion.div
            className="fixed top-20 left-1/2 z-[70]"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border-2 border-amber-300">
              <Check size={18} strokeWidth={3} />
              <span className="font-heading font-bold text-sm">{successInfo}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
