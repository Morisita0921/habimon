import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Loader2, ImageOff, Upload, Monitor } from 'lucide-react';
import { supabaseAdmin as supabase } from '../lib/supabase';
import { useCharacters } from '../hooks/useCharacters';
import type { CharacterRecord } from '../hooks/useCharacters';

const BUCKET = 'characters';

interface FormValue {
  name: string;
  description: string;
  form1ImageUrl: string;
  form2ImageUrl: string;
  form3ImageUrl: string;
}

const EMPTY_FORM: FormValue = { name: '', description: '', form1ImageUrl: '', form2ImageUrl: '', form3ImageUrl: '' };

function ImagePreview({ url, label }: { url: string; label: string }) {
  const [error, setError] = useState(false);
  if (!url) return (
    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
      <ImageOff size={20} />
    </div>
  );
  return error ? (
    <div className="w-16 h-16 bg-red-50 rounded-lg flex flex-col items-center justify-center text-red-300 text-[10px] gap-1">
      <ImageOff size={16} />
      <span>{label}</span>
    </div>
  ) : (
    <img
      src={url}
      alt={label}
      className="w-16 h-16 object-contain rounded-lg bg-gray-50 border border-gray-100"
      onError={() => setError(true)}
    />
  );
}

// 画像URL入力 + アップロードボタン一体型フィールド
function ImageUploadField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const filename = `char_${Date.now()}.${ext}`;
    setUploading(true);
    const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      alert(`アップロード失敗: ${error.message}`);
    } else {
      const url = supabase.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
      onChange(url);
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-navy font-mono"
          placeholder={placeholder}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 bg-navy/10 text-navy rounded-lg hover:bg-navy/20 transition-colors disabled:opacity-50 flex items-center gap-1 text-xs font-bold shrink-0"
          title="画像をアップロード"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? '中...' : 'UP'}
        </button>
      </div>
      <div className="mt-1">
        <ImagePreview url={value} label={label} />
      </div>
    </div>
  );
}

// ===== ホーム画面実寸プレビューモーダル =====
function HomePreviewModal({ char, onClose }: { char: CharacterRecord; onClose: () => void }) {
  const forms = [
    { label: '第一形態', levelLabel: 'Lv.1〜2', lv: 1, url: char.form1ImageUrl },
    { label: '第二形態', levelLabel: 'Lv.3〜4', lv: 3, url: char.form2ImageUrl },
    ...(char.form3ImageUrl ? [{ label: '第三形態', levelLabel: 'Lv.5', lv: 5, url: char.form3ImageUrl }] : []),
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = forms[activeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* 実際のアプリと同じ max-w-lg コンテナ */}
      <div className="relative w-full max-w-lg h-full flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 40%, #E8F8FF 70%, #FFF8F0 100%)' }}
      >
        {/* 雲 */}
        <div className="absolute top-8 left-4 w-24 h-10 bg-white/40 rounded-full blur-sm" />
        <div className="absolute top-16 right-8 w-32 h-12 bg-white/30 rounded-full blur-sm" />
        <div className="absolute top-28 left-1/4 w-20 h-8 bg-white/25 rounded-full blur-sm" />

        {/* ===ヘッダー（実際と同じ構成）=== */}
        <div className="relative z-10 px-3 pt-3 pb-1">
          {/* 1段目 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-b from-amber-400 to-amber-600 text-white rounded-lg px-2.5 py-1 text-sm font-bold shadow-md border border-amber-300">
                Lv.{active.lv}
              </div>
              <span className="font-heading font-bold text-white text-base drop-shadow-md">{char.name}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-white/70 font-heading bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                👤 プレビュー
              </span>
            </div>
          </div>
          {/* 2段目：EXPバー風 + コイン */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="flex-1 bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-white/30">
              <div className="h-full rounded-full bg-gradient-to-r from-main to-sub" style={{ width: '45%' }} />
            </div>
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/50 to-yellow-500/50 rounded-full px-4 py-1.5 backdrop-blur-sm border border-yellow-300/40 shadow-md">
              <span className="text-yellow-200 text-base">🪙</span>
              <span className="text-white text-lg font-bold drop-shadow-sm">1,200</span>
            </div>
          </div>
          {/* 3段目：連続出席 */}
          <div className="mt-2 flex justify-center">
            <div className="flex items-center gap-1">
              <span className="text-orange-400 text-2xl">🔥</span>
              <span className="text-lg font-heading font-black tracking-wide"
                style={{
                  background: 'linear-gradient(180deg, #FFF7CC 0%, #FFD700 40%, #FF8C00 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                }}>
                れんぞく出席 7日
              </span>
            </div>
          </div>
        </div>

        {/* ===キャラクターエリア=== */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-4 -mt-2">
          <div className="relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full opacity-30"
              style={{ background: 'radial-gradient(ellipse, rgba(255,200,100,0.6) 0%, transparent 70%)' }} />
            {active.url ? (
              <img
                src={active.url}
                alt={active.label}
                className="object-contain drop-shadow-2xl"
                style={{ width: 280, height: 280, animation: 'charFloat 2s ease-in-out infinite' }}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center">
                <ImageOff size={80} className="text-white/40" />
              </div>
            )}
          </div>
          {/* チェックインボタン風 */}
          <div className="mt-4 px-8 py-4 bg-white/30 backdrop-blur-sm rounded-2xl border-2 border-white/50 text-white font-heading font-bold text-base shadow-lg">
            ✅ チェックイン済み
          </div>
        </div>

        {/* ===下部ステータス=== */}
        <div className="relative z-10 px-4 pb-20">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '総出席日数', value: '42日', icon: '📅' },
              { label: 'バッジ', value: '5個', icon: '🏅' },
              { label: 'アカシコイン', value: '1,200', icon: '🪙' },
            ].map((s) => (
              <div key={s.label} className="bg-white/25 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/30">
                <div className="text-xl mb-0.5">{s.icon}</div>
                <div className="text-white font-bold text-sm drop-shadow-sm">{s.value}</div>
                <div className="text-white/70 text-[10px] font-heading">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===ボトムナビ（ダミー）=== */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-20">
          <div className="flex">
            {['ホーム', 'カレンダー', 'にっぽう', 'じっせき', 'ショップ'].map((label, i) => (
              <div key={label} className={`flex-1 flex flex-col items-center py-2 pt-3 ${i === 0 ? 'text-main' : 'text-gray-300'}`}>
                <div className="w-5 h-5 bg-current rounded opacity-50" />
                <span className="text-xs mt-1 font-heading">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===オーバーレイUI（形態切替 + 閉じる）=== */}
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white shadow-lg"
        >
          <X size={18} />
        </button>

        {/* 形態切り替えタブ（右下固定） */}
        <div className="absolute bottom-20 left-0 right-0 z-30 flex justify-center gap-2 pb-2">
          {forms.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-md transition-all ${
                activeIndex === i
                  ? 'bg-white text-navy scale-105'
                  : 'bg-black/30 text-white hover:bg-black/50'
              }`}
            >
              {f.label}<span className="ml-1 opacity-70">{f.levelLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes charFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

interface CharacterFormProps {
  initial: FormValue;
  onSubmit: (v: FormValue) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

function CharacterForm({ initial, onSubmit, onCancel, submitLabel }: CharacterFormProps) {
  const [form, setForm] = useState<FormValue>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FormValue, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('なまえは ひっすです'); return; }
    if (!form.form1ImageUrl.trim()) { setError('だいいちけいたいの がぞうは ひっすです'); return; }
    if (!form.form2ImageUrl.trim()) { setError('だいにけいたいの がぞうは ひっすです'); return; }
    // form3は任意
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">なまえ *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-navy"
          placeholder="例: メタオ"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">せつめい</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-navy"
          placeholder="例: みんなのパートナー"
        />
      </div>
      <ImageUploadField
        label="だいいちけいたい がぞう (Lv1-2) *"
        value={form.form1ImageUrl}
        onChange={(v) => set('form1ImageUrl', v)}
        placeholder="/characters/example/first.png"
      />
      <ImageUploadField
        label="だいにけいたい がぞう (Lv3-4) *"
        value={form.form2ImageUrl}
        onChange={(v) => set('form2ImageUrl', v)}
        placeholder="/characters/example/second.png"
      />
      <ImageUploadField
        label="だいさんけいたい がぞう (Lv5) ※任意"
        value={form.form3ImageUrl}
        onChange={(v) => set('form3ImageUrl', v)}
        placeholder="/characters/example/third.png"
      />

      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-heading font-bold text-sm"
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 py-2 rounded-xl bg-navy text-white font-heading font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function AdminCharacters() {
  const { characters, loading, addCharacter, updateCharacter, toggleAvailable, deleteCharacter } = useCharacters();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<CharacterRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CharacterRecord | null>(null);
  const [previewTarget, setPreviewTarget] = useState<CharacterRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (form: FormValue) => {
    await addCharacter({
      name: form.name,
      description: form.description,
      form1ImageUrl: form.form1ImageUrl,
      form2ImageUrl: form.form2ImageUrl,
      form3ImageUrl: form.form3ImageUrl || undefined,
    });
    setShowAdd(false);
  };

  const handleEdit = async (form: FormValue) => {
    if (!editTarget) return;
    await updateCharacter(editTarget.id, {
      name: form.name,
      description: form.description,
      form1ImageUrl: form.form1ImageUrl,
      form2ImageUrl: form.form2ImageUrl,
      form3ImageUrl: form.form3ImageUrl,
    });
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCharacter(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-heading font-bold text-navy">キャラクター管理</h2>
          <p className="text-xs text-gray-400 mt-0.5">🔒 開発者専用</p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-xl font-heading font-bold text-sm shadow-sm hover:bg-navy/90"
          >
            <Plus size={16} />
            キャラを追加
          </button>
        )}
      </div>

      {/* 追加フォーム */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-4 border-2 border-navy/20 shadow-sm">
          <h3 className="font-heading font-bold text-sm text-navy mb-3">新しいキャラクターを追加</h3>
          <CharacterForm
            initial={EMPTY_FORM}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            submitLabel="追加する"
          />
        </div>
      )}

      {/* キャラ一覧 */}
      {characters.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">✨</div>
          <p className="font-heading text-sm">まだキャラクターがいません</p>
          <p className="text-xs mt-1">「キャラを追加」から登録してください</p>
        </div>
      )}

      <div className="space-y-3">
        {characters.map((char) => (
          <div key={char.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {editTarget?.id === char.id ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-sm text-navy">キャラクターを編集</h3>
                  <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <CharacterForm
                  initial={{
                    name: char.name,
                    description: char.description,
                    form1ImageUrl: char.form1ImageUrl,
                    form2ImageUrl: char.form2ImageUrl,
                    form3ImageUrl: char.form3ImageUrl,
                  }}
                  onSubmit={handleEdit}
                  onCancel={() => setEditTarget(null)}
                  submitLabel="更新する"
                />
              </div>
            ) : (
              <div className="p-3 flex items-center gap-3">
                <ImagePreview url={char.thumbnail || char.form1ImageUrl} label={char.name} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-gray-800">{char.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      char.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {char.available ? '公開中' : '非公開'}
                    </span>
                  </div>
                  {char.description && (
                    <p className="text-xs text-gray-500 truncate">{char.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <ImagePreview url={char.form1ImageUrl} label="第一形態" />
                    <span className="text-gray-300 text-xs">→</span>
                    <ImagePreview url={char.form2ImageUrl} label="第二形態" />
                    {char.form3ImageUrl && (
                      <>
                        <span className="text-gray-300 text-xs">→</span>
                        <ImagePreview url={char.form3ImageUrl} label="第三形態" />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewTarget(char)}
                    className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                    title="ホーム画面でプレビュー"
                  >
                    <Monitor size={16} />
                  </button>
                  <button
                    onClick={() => toggleAvailable(char.id, !char.available)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      char.available
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={char.available ? '非公開にする' : '公開する'}
                  >
                    {char.available ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => setEditTarget(char)}
                    className="p-1.5 text-navy/60 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(char)}
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

      {/* ホーム画面プレビューモーダル */}
      {previewTarget && (
        <HomePreviewModal char={previewTarget} onClose={() => setPreviewTarget(null)} />
      )}

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="font-heading font-bold text-gray-800">キャラクターを削除</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-bold text-red-600">{deleteTarget.name}</span> を削除しますか？
              </p>
              <p className="text-xs text-gray-400 mt-2">このキャラクターを選択中のユーザーには影響しません</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-heading font-bold text-sm text-gray-600"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-heading font-bold text-sm disabled:opacity-50"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
