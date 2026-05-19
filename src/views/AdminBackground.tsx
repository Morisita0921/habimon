import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Loader2, Image, Upload, Trash2 } from 'lucide-react';
import { supabaseAdmin as supabase } from '../lib/supabase';
import { useFacilitySettings } from '../hooks/useFacilitySettings';

const BUCKET = 'backgrounds';

const GRADIENT_PRESETS = [
  {
    label: 'そら（デフォルト）',
    value: 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 30%, #E8F8FF 60%, #FFF8F0 80%, #FFE8D0 100%)',
  },
  {
    label: 'ゆうぐれ',
    value: 'linear-gradient(180deg, #FF7043 0%, #FF8A65 25%, #FFCC80 55%, #FFF8E1 80%, #FFFFFF 100%)',
  },
  {
    label: 'しんりょく',
    value: 'linear-gradient(180deg, #81C784 0%, #A5D6A7 30%, #E8F5E9 60%, #F1F8E9 80%, #FFFFFF 100%)',
  },
  {
    label: 'ピンク',
    value: 'linear-gradient(180deg, #F48FB1 0%, #F8BBD9 30%, #FCE4EC 60%, #FFF8F8 80%, #FFFFFF 100%)',
  },
  {
    label: 'むらさき',
    value: 'linear-gradient(180deg, #9575CD 0%, #B39DDB 30%, #EDE7F6 60%, #F8F4FF 80%, #FFFFFF 100%)',
  },
];

type BgMode = 'gradient' | 'storage' | 'url';

interface StorageImage {
  name: string;
  url: string;
}

export default function AdminBackground() {
  const { settings, loading, updateBackground } = useFacilitySettings();
  const [mode, setMode] = useState<BgMode>('gradient');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].value);
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ストレージ関連
  const [storageImages, setStorageImages] = useState<StorageImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedStorageUrl, setSelectedStorageUrl] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      if (settings.homeBgType === 'gradient') {
        setMode('gradient');
        setSelectedGradient(settings.homeBgValue);
      } else {
        // 保存済みがStorageのURLかどうかで判定
        const isStorage = settings.homeBgValue.includes('/storage/v1/object/public/backgrounds/');
        setMode(isStorage ? 'storage' : 'url');
        if (isStorage) setSelectedStorageUrl(settings.homeBgValue);
        else setImageUrl(settings.homeBgValue);
      }
    }
  }, [loading, settings]);

  const loadStorageImages = useCallback(async () => {
    setLoadingImages(true);
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error || !data) {
      setLoadingImages(false);
      return;
    }
    const images: StorageImage[] = data
      .filter((f) => f.name !== '.emptyFolderPlaceholder' && f.name !== '')
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      }));
    setStorageImages(images);
    setLoadingImages(false);
  }, []);

  useEffect(() => {
    if (mode === 'storage') loadStorageImages();
  }, [mode, loadStorageImages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `bg_${Date.now()}.${ext}`;

    setUploading(true);
    const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      alert(`アップロード失敗: ${error.message}`);
    } else {
      const url = supabase.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
      setSelectedStorageUrl(url);
      await loadStorageImages();
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (name: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) { alert(`削除失敗: ${error.message}`); return; }
    if (selectedStorageUrl.includes(name)) setSelectedStorageUrl('');
    setDeleteTarget(null);
    await loadStorageImages();
  };

  const currentPreviewUrl =
    mode === 'gradient' ? undefined
    : mode === 'storage' ? selectedStorageUrl
    : imageUrl;

  const previewStyle: React.CSSProperties =
    mode === 'gradient'
      ? { background: selectedGradient }
      : currentPreviewUrl
        ? { backgroundImage: `url(${currentPreviewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: '#f3f4f6' };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === 'gradient') {
        await updateBackground('gradient', selectedGradient);
      } else {
        const url = mode === 'storage' ? selectedStorageUrl : imageUrl;
        await updateBackground('image', url);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const isSaveDisabled =
    saving ||
    (mode === 'url' && !imageUrl.trim()) ||
    (mode === 'storage' && !selectedStorageUrl);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-heading font-bold text-navy">ホーム背景設定</h2>
        <p className="text-xs text-gray-400 mt-0.5">🔒 開発者専用</p>
      </div>

      {/* プレビュー */}
      <div
        className="w-full h-40 rounded-2xl shadow-inner border border-gray-200 relative overflow-hidden flex items-center justify-center"
        style={previewStyle}
      >
        {mode !== 'gradient' && !currentPreviewUrl && (
          <div className="text-gray-400 flex flex-col items-center gap-1">
            <Image size={28} />
            <span className="text-xs">{mode === 'storage' ? '画像を選択してください' : 'URLを入力してプレビュー'}</span>
          </div>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white text-xs font-heading font-bold drop-shadow-md opacity-60">
          プレビュー
        </div>
      </div>

      {/* モード切替 */}
      <div className="flex gap-2">
        {([
          { key: 'gradient', label: 'グラデーション' },
          { key: 'storage', label: 'アップロード' },
          { key: 'url', label: 'URL入力' },
        ] as { key: BgMode; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-sm transition-colors ${
              mode === key
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* グラデーション選択 */}
      {mode === 'gradient' && (
        <div className="grid grid-cols-1 gap-2">
          {GRADIENT_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedGradient(p.value)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${
                selectedGradient === p.value
                  ? 'border-navy shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-14 h-10 rounded-lg shrink-0" style={{ background: p.value }} />
              <span className="text-sm font-heading font-bold text-gray-700">{p.label}</span>
              {selectedGradient === p.value && (
                <Check size={16} className="text-navy ml-auto shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ストレージアップロード */}
      {mode === 'storage' && (
        <div className="space-y-3">
          {/* アップロードボタン */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-3 border-2 border-dashed border-navy/30 rounded-xl font-heading font-bold text-sm text-navy/70 hover:border-navy/60 hover:bg-navy/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" />アップロード中...</>
            ) : (
              <><Upload size={16} />画像をアップロード</>
            )}
          </button>
          <p className="text-xs text-gray-400">
            対応形式: JPG・PNG・WebP・GIF ／ 推奨サイズ: 1080×1920px
          </p>

          {/* 画像一覧 */}
          {loadingImages ? (
            <div className="flex justify-center py-8 text-gray-300">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : storageImages.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
              <Image size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">まだ画像がありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {storageImages.map((img) => (
                <div
                  key={img.name}
                  className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedStorageUrl === img.url
                      ? 'border-navy shadow-md'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedStorageUrl(img.url)}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-28 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                  />
                  {selectedStorageUrl === img.url && (
                    <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-navy rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  {/* 削除ボタン */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(img.name); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* URL入力 */}
      {mode === 'url' && (
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">がぞうURL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy font-mono"
            placeholder="https://example.com/background.jpg"
          />
          <p className="text-xs text-gray-400 mt-1">
            ※ 公開されている画像のURLを入力してください
          </p>
        </div>
      )}

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        disabled={isSaveDisabled}
        className={`w-full py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          saved
            ? 'bg-green-500 text-white'
            : saving
              ? 'bg-navy/50 text-white'
              : 'bg-navy text-white hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {saving ? (
          <><Loader2 size={16} className="animate-spin" />保存中...</>
        ) : saved ? (
          <><Check size={16} />保存しました！</>
        ) : (
          '背景を保存する'
        )}
      </button>

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl">
            <h3 className="font-heading font-bold text-gray-800 mb-2">画像を削除しますか？</h3>
            <p className="text-xs text-gray-500 mb-4 break-all">{deleteTarget}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-heading text-sm text-gray-600"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-heading font-bold text-sm"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
