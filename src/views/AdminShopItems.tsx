import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useExchangeItems } from '../hooks/useExchangeItems';
import type { ExchangeItem, ExchangeItemCategory } from '../types';

const CATEGORY_LABELS: Record<ExchangeItemCategory, string> = {
  snack: 'お菓子',
  drink: '飲み物',
  daily: '日用品',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'snack' as ExchangeItemCategory,
  price: 300,
  emoji: '🎁',
};

type EditState = {
  id: string;
  name: string;
  description: string;
  category: ExchangeItemCategory;
  price: number;
  emoji: string;
};

export default function AdminShopItems() {
  const { items, loading, addItem, updateItem, deleteItem } = useExchangeItems();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExchangeItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.emoji.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addItem({ ...form, name: form.name.trim(), description: form.description.trim(), available: true });
      setForm({ ...EMPTY_FORM });
      setShowAddForm(false);
    } catch (e) {
      setError((e as Error).message);
    }
    setSaving(false);
  };

  const startEdit = (item: ExchangeItem) => {
    setEditState({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      emoji: item.emoji,
    });
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    setSaving(true);
    setError(null);
    try {
      await updateItem(editState.id, {
        name: editState.name.trim(),
        description: editState.description.trim(),
        category: editState.category,
        price: editState.price,
        emoji: editState.emoji,
      });
      setEditState(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setSaving(false);
  };

  const handleToggle = async (item: ExchangeItem) => {
    try {
      await updateItem(item.id, { available: !item.available });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteItem(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">商品のラインナップ・価格を管理します</p>
        <button
          onClick={() => { setShowAddForm(true); setEditState(null); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg font-heading font-bold text-sm hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          商品を追加
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 追加フォーム */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <h3 className="font-heading font-bold text-sm text-amber-800 mb-3">新しい商品を追加</h3>
          <ItemForm
            value={form}
            onChange={setForm}
            onSave={handleAdd}
            onCancel={() => { setShowAddForm(false); setForm({ ...EMPTY_FORM }); }}
            saving={saving}
          />
        </div>
      )}

      {/* 商品一覧 */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            商品がありません。「商品を追加」から登録してください。
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border p-4 transition-opacity ${item.available ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
          >
            {editState?.id === item.id ? (
              <ItemForm
                value={editState}
                onChange={(v) => setEditState({ ...editState, ...v })}
                onSave={handleSaveEdit}
                onCancel={() => setEditState(null)}
                saving={saving}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 shrink-0 bg-amber-50 rounded-lg flex items-center justify-center text-2xl">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-gray-800">{item.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 truncate">{item.description}</div>
                  <div className="text-sm font-bold text-amber-700 mt-0.5">🪙 {item.price.toLocaleString()} コイン</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`p-1.5 rounded-lg transition-colors ${item.available ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                    title={item.available ? '販売停止にする' : '販売再開する'}
                  >
                    {item.available ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{deleteTarget.emoji}</div>
              <h3 className="font-heading font-bold text-lg text-gray-800">商品を削除しますか？</h3>
              <p className="text-sm text-gray-500 mt-1">
                「<span className="font-bold text-red-600">{deleteTarget.name}</span>」をカタログから削除します。
              </p>
              <p className="text-xs text-gray-400 mt-1">申請済みの履歴データには影響しません。</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-heading text-gray-600 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-heading font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- 共通フォームコンポーネント ----

type FormValue = {
  name: string;
  description: string;
  category: ExchangeItemCategory;
  price: number;
  emoji: string;
};

function ItemForm({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  value: FormValue;
  onChange: (v: FormValue) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const set = (patch: Partial<FormValue>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="w-16">
          <label className="block text-xs text-gray-500 mb-1">絵文字</label>
          <input
            type="text"
            value={value.emoji}
            onChange={(e) => set({ emoji: e.target.value })}
            className="w-full px-2 py-2 border border-gray-200 rounded-lg text-center text-xl focus:outline-none focus:border-amber-400"
            maxLength={2}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">商品名 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="例：プリン"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">説明</label>
        <input
          type="text"
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="例：なめらかカスタードプリン"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
          <select
            value={value.category}
            onChange={(e) => set({ category: e.target.value as ExchangeItemCategory })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white"
          >
            <option value="snack">お菓子</option>
            <option value="drink">飲み物</option>
            <option value="daily">日用品</option>
          </select>
        </div>
        <div className="w-32">
          <label className="block text-xs text-gray-500 mb-1">価格（コイン）</label>
          <input
            type="number"
            value={value.price}
            onChange={(e) => set({ price: Math.max(1, parseInt(e.target.value) || 0) })}
            min={1}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 border-2 border-gray-200 rounded-lg font-heading text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
        >
          <X size={14} /> キャンセル
        </button>
        <button
          onClick={onSave}
          disabled={saving || !value.name.trim()}
          className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-heading font-bold text-sm hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          保存
        </button>
      </div>
    </div>
  );
}
