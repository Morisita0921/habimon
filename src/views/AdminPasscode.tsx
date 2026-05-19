import { useState, useEffect } from 'react';
import { Lock, LockOpen, Check, Loader2, Delete } from 'lucide-react';
import { useFacilitySettings } from '../hooks/useFacilitySettings';

export default function AdminPasscode() {
  const { settings, loading, updatePasscode } = useFacilitySettings();
  const [digits, setDigits] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      setDigits(settings.checkinPasscode);
    }
  }, [loading, settings.checkinPasscode]);

  const handleKey = (key: string) => {
    setError('');
    if (key === 'back') {
      setDigits((d) => d.slice(0, -1));
    } else if (digits.length < 4) {
      setDigits((d) => d + key);
    }
  };

  const handleSave = async () => {
    if (digits.length !== 4 && digits.length !== 0) {
      setError('4ケタ で にゅうりょく してください');
      return;
    }
    setSaving(true);
    try {
      await updatePasscode(digits);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('ほぞんに しっぱいしました');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await updatePasscode('');
      setDigits('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('しっぱいしました');
    } finally {
      setSaving(false);
    }
  };

  const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'back'],
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  const isEnabled = settings.checkinPasscode !== '';

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-heading font-bold text-navy">チェックインパスコード</h2>
        <p className="text-sm text-gray-500 mt-1">
          設定すると、チェックイン時に4桁のパスコード入力が必要になります。
          当日出所している利用者だけが知れるように運用してください。
        </p>
      </div>

      {/* 現在の状態 */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${
        isEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        {isEnabled
          ? <Lock size={22} className="text-green-600 shrink-0" />
          : <LockOpen size={22} className="text-gray-400 shrink-0" />
        }
        <div>
          <div className={`font-heading font-bold text-sm ${isEnabled ? 'text-green-700' : 'text-gray-500'}`}>
            {isEnabled ? `パスコード設定中：${settings.checkinPasscode}` : 'パスコードなし（設定されていません）'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {isEnabled
              ? '利用者がチェックイン時にこのコードを入力します'
              : 'パスコードなしでチェックインできます'}
          </div>
        </div>
      </div>

      {/* テンキー */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-2">新しいパスコードを入力</label>

        {/* 4ケタ表示 */}
        <div className="flex justify-center gap-4 mb-5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-heading font-black transition-all ${
                digits[i] !== undefined
                  ? 'bg-navy text-white border-navy shadow-md'
                  : 'bg-gray-50 border-gray-200 text-gray-300'
              }`}
            >
              {digits[i] ?? '●'}
            </div>
          ))}
        </div>

        {/* キーパッド */}
        <div className="grid gap-2">
          {KEYS.map((row, ri) => (
            <div key={ri} className="grid grid-cols-3 gap-2">
              {row.map((key, ci) => {
                if (key === '') return <div key={ci} />;
                if (key === 'back') return (
                  <button
                    key={ci}
                    onClick={() => handleKey('back')}
                    className="h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <Delete size={22} />
                  </button>
                );
                return (
                  <button
                    key={ci}
                    onClick={() => handleKey(key)}
                    className="h-14 rounded-2xl bg-white border-2 border-gray-200 hover:border-navy hover:bg-navy/5 active:bg-navy/10 font-heading font-bold text-xl text-gray-800 transition-colors shadow-sm"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

      {/* ボタン */}
      <div className="flex gap-2">
        {isEnabled && (
          <button
            onClick={handleClear}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-500 font-heading font-bold text-sm hover:bg-red-50 disabled:opacity-50"
          >
            パスコードを削除
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || digits.length !== 4}
          className={`flex-1 py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-navy text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy/90'
          }`}
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" />保存中...</>
          ) : saved ? (
            <><Check size={16} />保存しました！</>
          ) : (
            'パスコードを保存'
          )}
        </button>
      </div>
    </div>
  );
}
