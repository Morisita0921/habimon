import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvolutionModalProps {
  show: boolean;
  fromImageUrl: string;
  toImageUrl: string;
  characterName: string;
  fromLabel?: string;
  toLabel?: string;
  onClose: () => void;
}

/**
 * 進化演出モーダル
 * フェーズ:
 *  0: フェードイン＋「しんか！」表示
 *  1: 白フラッシュ＋キャラがシルエット化
 *  2: シルエットが震える
 *  3: 爆発的な光とともにキャラが切り替わる
 *  4: 新しいキャラ登場＋完了メッセージ
 */
export default function EvolutionModal({
  show,
  fromImageUrl,
  toImageUrl,
  characterName,
  fromLabel,
  toLabel,
  onClose,
}: EvolutionModalProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    if (!show) {
      setPhase(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 1200));
    timers.push(setTimeout(() => setPhase(2), 2200));
    timers.push(setTimeout(() => setPhase(3), 4200));
    timers.push(setTimeout(() => setPhase(4), 4800));
    return () => timers.forEach(clearTimeout);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* 背景 */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at center, rgba(30, 30, 80, 0.95) 0%, rgba(10, 10, 40, 0.98) 60%, rgba(0, 0, 20, 1) 100%)',
            }}
          />

          {/* 放射状の光線（phase >= 2） */}
          {phase >= 2 && phase < 4 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  className="absolute origin-center"
                  style={{
                    width: 6,
                    height: 600,
                    background:
                      'linear-gradient(to bottom, rgba(255,255,200,0.9), rgba(255,215,100,0.6), transparent)',
                    transform: `rotate(${i * 22.5}deg)`,
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{
                    scaleY: [0, 1, 1.2, 1],
                    opacity: [0, 0.8, 1, 0.6],
                    rotate: [i * 22.5, i * 22.5 + 360],
                  }}
                  transition={{ duration: 2, delay: i * 0.03, repeat: Infinity, ease: 'linear' }}
                />
              ))}
            </div>
          )}

          {/* 白フラッシュ（phase 3） */}
          {phase === 3 && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0.6] }}
              transition={{ duration: 0.6, times: [0, 0.2, 0.4, 1] }}
            />
          )}

          {/* 「しんか！」テキスト（phase 0） */}
          {phase === 0 && (
            <motion.div
              className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center"
              initial={{ opacity: 0, y: -30, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <div
                className="font-heading font-black text-5xl md:text-7xl"
                style={{
                  background:
                    'linear-gradient(180deg, #FFF7CC 0%, #FFD700 40%, #FFA500 80%, #FF6F00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter:
                    'drop-shadow(0 0 20px rgba(255,215,0,0.9)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                }}
              >
                しんか！
              </div>
              <div className="text-white/80 font-heading text-sm mt-2 drop-shadow">
                {characterName}が しんかしようとしている！
              </div>
            </motion.div>
          )}

          {/* キャラクター表示エリア */}
          <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
            {/* 後ろのグローオーラ */}
            {phase >= 1 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,230,120,0.9) 0%, rgba(255,180,50,0.5) 40%, transparent 80%)',
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: phase === 3 ? [1.5, 2.5, 1.5] : [1, 1.3, 1],
                  opacity: phase === 3 ? [0.8, 1, 0.8] : [0.6, 1, 0.6],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* 変身前のキャラ（phase < 3） */}
            {phase < 3 && (
              <motion.div
                key="from"
                className="relative w-64 h-64 flex items-center justify-center"
                animate={
                  phase === 2
                    ? {
                        x: [-5, 5, -5, 5, -3, 3, 0],
                        y: [-3, 3, -3, 3, -2, 2, 0],
                        scale: [1, 1.05, 1, 1.05, 1.1, 1.05, 1.1],
                      }
                    : phase === 1
                    ? { scale: [1, 1.05, 1] }
                    : { y: [0, -8, 0] }
                }
                transition={
                  phase === 2
                    ? { duration: 0.4, repeat: Infinity }
                    : phase === 1
                    ? { duration: 1.5, repeat: Infinity }
                    : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <img
                  src={fromImageUrl}
                  alt={fromLabel || '進化前'}
                  className="w-full h-full object-contain"
                  style={{
                    filter:
                      phase >= 1
                        ? 'brightness(0) drop-shadow(0 0 30px rgba(255,215,0,1))'
                        : 'drop-shadow(0 0 10px rgba(255,215,0,0.6))',
                    transition: 'filter 0.8s ease-in-out',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML +=
                      '<div class="text-8xl">✨</div>';
                  }}
                />
              </motion.div>
            )}

            {/* 変身後のキャラ（phase >= 3） */}
            {phase >= 3 && (
              <motion.div
                key="to"
                className="relative w-64 h-64 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{
                  scale: phase === 3 ? [0, 1.4, 1.1] : [1, 1.05, 1],
                  rotate: phase === 3 ? [-180, 10, 0] : 0,
                  opacity: 1,
                  y: phase === 4 ? [0, -8, 0] : 0,
                }}
                transition={
                  phase === 3
                    ? { duration: 0.8, type: 'spring', damping: 10 }
                    : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <img
                  src={toImageUrl}
                  alt={toLabel || '進化後'}
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(255,215,0,1)) drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML +=
                      '<div class="text-8xl">✨</div>';
                  }}
                />
              </motion.div>
            )}

            {/* キラキラパーティクル（全フェーズ） */}
            {phase >= 1 && phase < 4 && (
              <>
                {[...Array(20)].map((_, i) => {
                  const angle = (i / 20) * Math.PI * 2;
                  const distance = 120 + Math.random() * 80;
                  return (
                    <motion.div
                      key={`sparkle-${i}`}
                      className="absolute text-2xl pointer-events-none"
                      style={{ textShadow: '0 0 8px rgba(255,215,0,0.9)' }}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.2, 1, 0.5],
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance,
                      }}
                      transition={{
                        duration: 1.8,
                        delay: i * 0.08,
                        repeat: Infinity,
                        repeatDelay: 0.3,
                      }}
                    >
                      {['✨', '⭐', '💫', '🌟'][i % 4]}
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>

          {/* 完了メッセージ（phase 4） */}
          {phase === 4 && (
            <motion.div
              className="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-center px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', damping: 12 }}
            >
              <div
                className="font-heading font-black text-4xl md:text-5xl mb-2"
                style={{
                  background:
                    'linear-gradient(180deg, #FFF7CC 0%, #FFD700 40%, #FFA500 80%, #FF6F00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.9))',
                }}
              >
                おめでとう！
              </div>
              <div className="text-white font-heading font-bold text-xl drop-shadow mb-4">
                {characterName}は {toLabel || '新しい姿'} に しんかした！
              </div>
              <motion.button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-b from-amber-400 to-amber-600 text-white font-heading font-bold rounded-full shadow-xl border-2 border-amber-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                つづける
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
