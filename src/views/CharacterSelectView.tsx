import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowLeft } from 'lucide-react';
import type { User } from '../types';
import { CHARACTERS, getCharacterById } from '../data/characters';

interface CharacterSelectViewProps {
  user: User;
  onSelect: (characterId: string) => void;
  onBack?: () => void;
  isFirstTime?: boolean;
}

export default function CharacterSelectView({ user, onSelect, onBack, isFirstTime = false }: CharacterSelectViewProps) {
  const [focusedId, setFocusedId] = useState<string>(user.selectedCharacterId || CHARACTERS[0]?.id || '');
  const [showConfirm, setShowConfirm] = useState(false);

  const focused = getCharacterById(focusedId);

  const handleSelect = () => {
    if (!focused) return;
    setShowConfirm(true);
  };

  const confirmSelect = () => {
    if (!focused) return;
    onSelect(focused.id);
    setShowConfirm(false);
  };

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 30%, #E8F8FF 60%, #FFF8F0 80%, #FFE8D0 100%)',
      }}
    >
      {/* ヘッダー */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center gap-3">
        {onBack && !isFirstTime && (
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
            aria-label="戻る"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="font-heading font-bold text-xl text-white drop-shadow-md">
            {isFirstTime ? 'ようこそ、ハビもんへ！' : 'キャラクターをえらぶ'}
          </h1>
          <p className="text-sm text-white/90 drop-shadow">
            {isFirstTime
              ? `${user.name}さん、パートナーを選んでね`
              : '育てたいキャラをえらんでください'}
          </p>
        </div>
      </div>

      {/* 選択中キャラのプレビュー */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        {focused && (
          <motion.div
            key={focused.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 18 }}
            className="flex flex-col items-center"
          >
            {/* キャラ画像プレビュー */}
            <div className="relative">
              {/* 足元のキラキラ */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-56 h-8 rounded-full opacity-40"
                style={{
                  background: 'radial-gradient(ellipse, rgba(255,220,150,0.8) 0%, transparent 70%)',
                }}
              />
              <motion.img
                src={focused.forms[0].imageUrl}
                alt={focused.name}
                className="w-56 h-56 object-contain drop-shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                onError={(e) => {
                  // 画像が無い場合はプレースホルダ表示
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML += `
                    <div class="w-56 h-56 rounded-full bg-white/40 border-4 border-dashed border-white/80 flex flex-col items-center justify-center text-white font-heading text-center p-4">
                      <div class="text-5xl mb-2">✨</div>
                      <div class="text-xs">画像を配置してください</div>
                      <div class="text-[10px] opacity-80 mt-1">${focused.forms[0].imageUrl}</div>
                    </div>
                  `;
                }}
              />
            </div>

            {/* キャラ名・説明 */}
            <div className="mt-6 text-center">
              <h2 className="font-heading font-black text-3xl text-white drop-shadow-lg mb-1">
                {focused.name}
              </h2>
              <p className="text-sm text-white/95 drop-shadow">{focused.description}</p>
              <p className="text-xs text-white/80 mt-2 drop-shadow">
                {focused.forms.length}段階に進化します
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 選択肢（下部カード） */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-t-3xl p-4 pb-24 shadow-2xl border-t border-white">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setFocusedId(c.id)}
              className={`relative p-2 rounded-2xl border-2 transition-all ${
                focusedId === c.id
                  ? 'border-orange-400 bg-gradient-to-b from-orange-50 to-amber-50 shadow-md scale-105'
                  : 'border-gray-200 bg-white/50 hover:border-gray-300'
              }`}
            >
              <div className="aspect-square flex items-center justify-center">
                <img
                  src={c.thumbnail || c.forms[0].imageUrl}
                  alt={c.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="text-3xl">✨</div>';
                  }}
                />
              </div>
              <div className="text-xs font-heading font-bold text-center mt-1 text-gray-700">
                {c.name}
              </div>
              {user.selectedCharacterId === c.id && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
          {/* 追加予定プレースホルダ */}
          {CHARACTERS.length < 3 &&
            Array.from({ length: 3 - CHARACTERS.length }).map((_, i) => (
              <div
                key={`ph-${i}`}
                className="p-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center text-gray-400"
              >
                <div className="text-2xl opacity-50">+</div>
                <div className="text-[10px] font-heading">ちかぢか</div>
              </div>
            ))}
        </div>

        <motion.button
          onClick={handleSelect}
          disabled={!focused}
          className={`w-full py-4 rounded-2xl font-heading font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all ${
            focused
              ? 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 text-white border-2 border-orange-300'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileTap={focused ? { scale: 0.97 } : undefined}
          whileHover={focused ? { scale: 1.02 } : undefined}
        >
          <Sparkles size={22} />
          {focused ? `${focused.name}にきめる！` : 'キャラをえらんでね'}
        </motion.button>
      </div>

      {/* 確認モーダル */}
      <AnimatePresence>
        {showConfirm && focused && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
            <motion.div
              className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                  <img
                    src={focused.forms[0].imageUrl}
                    alt={focused.name}
                    className="max-w-full max-h-full object-contain drop-shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="text-6xl">✨</div>';
                    }}
                  />
                </div>
                <h3 className="font-heading font-black text-2xl text-gray-800 mb-2">
                  {focused.name}でいい？
                </h3>
                <p className="text-sm text-gray-600">
                  {user.name}さんのパートナーとして一緒に育ちます
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-heading font-bold text-gray-600"
                >
                  えらびなおす
                </button>
                <button
                  onClick={confirmSelect}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-b from-orange-400 to-orange-600 text-white font-heading font-bold shadow-md"
                >
                  けってい！
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
