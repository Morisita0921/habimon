import { useState, useEffect } from 'react';
import { Check, Loader2, Image } from 'lucide-react';
import { useFacilitySettings } from '../hooks/useFacilitySettings';

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

export default function AdminBackground() {
  const { settings, loading, updateBackground } = useFacilitySettings();
  const [mode, setMode] = useState<'gradient' | 'image'>('gradient');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].value);
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      setMode(settings.homeBgType);
      if (settings.homeBgType === 'gradient') {
        setSelectedGradient(settings.homeBgValue);
      } else {
        setImageUrl(settings.homeBgValue);
      }
    }
  }, [loading, settings]);

  const previewStyle =
    mode === 'gradient'
      ? { background: selectedGradient }
      : imageUrl
        ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: '#f3f4f6' };

  const handleSave = async () => {
    setSaving(true);
    try {
      const value = mode === 'gradient' ? selectedGradient : imageUrl;
      await updateBackground(mode, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
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
      <div>
        <h2 className="text-lg font-heading font-bold text-navy">ホーム背景設定</h2>
        <p className="text-xs text-gray-400 mt-0.5">🔒 開発者専用</p>
      </div>

      {/* プレビュー */}
      <div
        className="w-full h-40 rounded-2xl shadow-inner border border-gray-200 relative overflow-hidden flex items-center justify-center"
        style={previewStyle}
      >
        {mode === 'image' && !imageUrl && (
          <div className="text-gray-400 flex flex-col items-center gap-1">
            <Image size={28} />
            <span className="text-xs">URLを入力してプレビュー</span>
          </div>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white text-xs font-heading font-bold drop-shadow-md opacity-60">
          プレビュー
        </div>
      </div>

      {/* モード切替 */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('gradient')}
          className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-sm transition-colors ${
            mode === 'gradient'
              ? 'bg-navy text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          グラデーション
        </button>
        <button
          onClick={() => setMode('image')}
          className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-sm transition-colors ${
            mode === 'image'
              ? 'bg-navy text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          画像URL
        </button>
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
              <div
                className="w-14 h-10 rounded-lg shrink-0"
                style={{ background: p.value }}
              />
              <span className="text-sm font-heading font-bold text-gray-700">{p.label}</span>
              {selectedGradient === p.value && (
                <Check size={16} className="text-navy ml-auto shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* 画像URL入力 */}
      {mode === 'image' && (
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
        disabled={saving || (mode === 'image' && !imageUrl.trim())}
        className={`w-full py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          saved
            ? 'bg-green-500 text-white'
            : saving
              ? 'bg-navy/50 text-white'
              : 'bg-navy text-white hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {saving ? (
          <><Loader2 size={16} className="animate-spin" /> 保存中...</>
        ) : saved ? (
          <><Check size={16} /> 保存しました！</>
        ) : (
          '背景を保存する'
        )}
      </button>
    </div>
  );
}
