import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Coins, Package, Gift, AlertTriangle } from 'lucide-react';
import type { Facility, User, CoinTransaction, ExchangeRequest, ExchangeRequestStatus } from '../types';
import { formatCoins } from '../utils/coinCalculator';
import { getTodayString } from '../utils/dateUtils';

interface AdminExchangeRequestsProps {
  facility: Facility;
  onUpdateUser: (user: User) => void;
}

type FilterStatus = 'all' | ExchangeRequestStatus;

const STATUS_INFO: Record<ExchangeRequestStatus, { label: string; color: string; icon: string }> = {
  pending: { label: '申請中', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '⏳' },
  approved: { label: '承認済（受取待ち）', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: '✅' },
  delivered: { label: '受取完了', color: 'bg-green-100 text-green-700 border-green-300', icon: '🎁' },
  rejected: { label: '却下', color: 'bg-gray-200 text-gray-600 border-gray-300', icon: '❌' },
};

export default function AdminExchangeRequests({ facility, onUpdateUser }: AdminExchangeRequestsProps) {
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [confirmAction, setConfirmAction] = useState<
    | { type: 'approve' | 'reject' | 'deliver'; userId: string; requestId: string }
    | null
  >(null);

  // 全申請をフラット化（ユーザー情報付き）
  const allRequests = useMemo(() => {
    const items: { user: User; request: ExchangeRequest }[] = [];
    facility.users.forEach((u) => {
      u.exchangeRequests.forEach((r) => items.push({ user: u, request: r }));
    });
    return items.sort((a, b) => b.request.requestedAt.localeCompare(a.request.requestedAt));
  }, [facility.users]);

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return allRequests;
    return allRequests.filter(({ request }) => request.status === filter);
  }, [allRequests, filter]);

  // 各ステータスの件数
  const statusCounts = useMemo(() => {
    const counts: Record<ExchangeRequestStatus, number> = {
      pending: 0,
      approved: 0,
      delivered: 0,
      rejected: 0,
    };
    allRequests.forEach(({ request }) => {
      counts[request.status]++;
    });
    return counts;
  }, [allRequests]);

  // 現在時刻の文字列
  const nowString = () => {
    const now = new Date();
    return `${getTodayString()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const updateRequest = (
    userId: string,
    requestId: string,
    updater: (r: ExchangeRequest) => ExchangeRequest,
    coinDelta: number = 0,
    coinReason?: string
  ) => {
    const target = facility.users.find((u) => u.id === userId);
    if (!target) return;
    const updatedRequests = target.exchangeRequests.map((r) =>
      r.id === requestId ? updater(r) : r
    );
    const newCoinHistory = [...target.coinHistory];
    if (coinDelta !== 0 && coinReason) {
      const tx: CoinTransaction = {
        id: `exchange-${Date.now()}`,
        date: nowString(),
        type: coinDelta < 0 ? 'spend' : 'earn',
        amount: Math.abs(coinDelta),
        reason: coinReason,
      };
      newCoinHistory.push(tx);
    }
    const updatedUser: User = {
      ...target,
      exchangeRequests: updatedRequests,
      akashiCoins: target.akashiCoins + coinDelta,
      coinHistory: newCoinHistory,
    };
    onUpdateUser(updatedUser);
  };

  const handleApprove = (userId: string, requestId: string) => {
    updateRequest(userId, requestId, (r) => ({
      ...r,
      status: 'approved',
      processedAt: nowString(),
    }));
    setConfirmAction(null);
  };

  const handleReject = (userId: string, requestId: string) => {
    updateRequest(userId, requestId, (r) => ({
      ...r,
      status: 'rejected',
      processedAt: nowString(),
    }));
    setConfirmAction(null);
  };

  const handleDeliver = (userId: string, requestId: string) => {
    const target = facility.users.find((u) => u.id === userId);
    const req = target?.exchangeRequests.find((r) => r.id === requestId);
    if (!target || !req) return;

    // 残高チェック
    if (target.akashiCoins < req.price) {
      alert(`${target.name}さんのコイン残高が不足しています（${formatCoins(target.akashiCoins)} / ${formatCoins(req.price)}）`);
      return;
    }

    updateRequest(
      userId,
      requestId,
      (r) => ({ ...r, status: 'delivered', processedAt: nowString() }),
      -req.price,
      `交換: ${req.itemName}`
    );
    setConfirmAction(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
          <Gift size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-navy">交換申請の管理</h2>
          <p className="text-sm text-gray-500">利用者さんからの交換リクエストを処理します</p>
        </div>
      </div>

      {/* ステータスフィルタ（件数付き） */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-heading font-bold border transition-colors ${
            filter === 'all' ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          すべて（{allRequests.length}）
        </button>
        {(['pending', 'approved', 'delivered', 'rejected'] as ExchangeRequestStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-heading font-bold border transition-colors flex items-center gap-1 ${
              filter === s ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <span>{STATUS_INFO[s].icon}</span>
            {STATUS_INFO[s].label}
            <span
              className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs ${
                filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {statusCounts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* 申請一覧 */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 font-heading">
            {filter === 'pending' ? '処理が必要な申請はありません' : '該当する申請がありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRequests.map(({ user, request }) => {
            const status = STATUS_INFO[request.status];
            const insufficientCoins = user.akashiCoins < request.price;
            return (
              <motion.div
                key={request.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  {/* 商品アイコン */}
                  <div className="w-16 h-16 shrink-0 bg-gradient-to-b from-amber-50 to-yellow-50 rounded-lg flex items-center justify-center text-4xl">
                    {request.itemEmoji}
                  </div>
                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="font-heading font-bold text-gray-800">{request.itemName}</div>
                        <div className="flex items-center gap-1 text-amber-700 font-bold text-sm">
                          <Coins size={12} fill="currentColor" />
                          {formatCoins(request.price)}
                        </div>
                      </div>
                      <div className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                        {status.icon} {status.label}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-bold text-gray-700">{user.name}</span> さん
                      （残高: <span className={insufficientCoins ? 'text-red-500 font-bold' : ''}>{formatCoins(user.akashiCoins)}</span>）
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      申請: {request.requestedAt}
                      {request.processedAt && <> / 処理: {request.processedAt}</>}
                    </div>

                    {/* 残高不足警告 */}
                    {insufficientCoins && request.status !== 'delivered' && request.status !== 'rejected' && (
                      <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        残高不足です（あと {formatCoins(request.price - user.akashiCoins)} 必要）
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setConfirmAction({ type: 'approve', userId: user.id, requestId: request.id })}
                            className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-heading font-bold hover:bg-amber-600 flex items-center gap-1"
                          >
                            <Check size={14} />
                            承認
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'reject', userId: user.id, requestId: request.id })}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-heading font-bold hover:bg-gray-50 flex items-center gap-1"
                          >
                            <X size={14} />
                            却下
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <>
                          <button
                            onClick={() => setConfirmAction({ type: 'deliver', userId: user.id, requestId: request.id })}
                            disabled={insufficientCoins}
                            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold flex items-center gap-1 ${
                              insufficientCoins
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            <Gift size={14} />
                            受取完了（-{formatCoins(request.price)}）
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 確認モーダル */}
      <AnimatePresence>
        {confirmAction && (() => {
          const user = facility.users.find((u) => u.id === confirmAction.userId);
          const req = user?.exchangeRequests.find((r) => r.id === confirmAction.requestId);
          if (!user || !req) return null;
          const actionLabel = {
            approve: '承認',
            reject: '却下',
            deliver: '受取完了',
          }[confirmAction.type];
          const description = {
            approve: 'この申請を承認して、受取待ちにします。',
            reject: 'この申請を却下します。コインは消費されません。',
            deliver: `${user.name}さんに ${req.itemName} をお渡しし、コイン ${formatCoins(req.price)} を消費します。`,
          }[confirmAction.type];
          const confirmColor = {
            approve: 'bg-amber-500 hover:bg-amber-600',
            reject: 'bg-gray-500 hover:bg-gray-600',
            deliver: 'bg-green-500 hover:bg-green-600',
          }[confirmAction.type];
          const handler = {
            approve: () => handleApprove(confirmAction.userId, confirmAction.requestId),
            reject: () => handleReject(confirmAction.userId, confirmAction.requestId),
            deliver: () => handleDeliver(confirmAction.userId, confirmAction.requestId),
          }[confirmAction.type];
          return (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmAction(null)} />
              <motion.div
                className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-b from-amber-50 to-yellow-50 rounded-2xl flex items-center justify-center text-4xl mb-3">
                    {req.itemEmoji}
                  </div>
                  <h3 className="font-heading font-black text-xl text-gray-800">{actionLabel}しますか？</h3>
                  <p className="text-sm text-gray-600 mt-2">{description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-heading font-bold text-gray-600 hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handler}
                    className={`flex-1 py-3 rounded-xl text-white font-heading font-bold shadow-md transition-colors ${confirmColor}`}
                  >
                    {actionLabel}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
