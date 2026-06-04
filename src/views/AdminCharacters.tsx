import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Loader2, ImageOff, Upload } from 'lucide-react';
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
