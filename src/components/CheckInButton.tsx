import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronUp, Coins } from 'lucide-react';
import { calculateCheckInCoins, formatCoins } from '../utils/coinCalculator';

interface CheckInButtonProps {
  alreadyCheckedIn: boolean;
  canCheckInByTime: boolean;
  isClosedDay: boolean;
  currentStreak: number;
  onCheckIn: (mood: 1 | 2 | 3 | 4 | 5) => void;
}

const MOOD_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string; color: string; bgFrom: string; bgTo: string; face: React.ReactNode }[] = [
  {
    value: 1, label: 'つらい',
    color: '#6B8EAE', bgFrom: '#D6E5F0', bgTo: '#B8D0E4',
    face: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <circle cx="24" cy="24" r="22" fill="url(#mood1)" stroke="#6B8EAE" strokeWidth="2"/>
        <defs><linearGradient id="mood1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D6E5F0"/><stop offset="100%" stopColor="#A8C4D8"/></linearGradient></defs>
        <circle cx="16" cy="20" r="2.5" fill="#4A6E8A"/>
        <circle cx="32" cy="20" r="2.5" fill="#4A6E8A"/>
        <path d="M16 34 Q24 28 32 34" fill="none" stroke="#4A6E8A" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M14 15 L20 17" fill="none" stroke="#4A6E8A" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M34 15 L28 17" fill="none" stroke="#4A6E8A" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 2, label: 'すこし\nつらい',
    color: '#8B9DC3', bgFrom: '#E0E6F0', bgTo: '#C8D2E4',
    face: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <circle cx="24" cy="24" r="22" fill="url(#mood2)" stroke="#8B9DC3" strokeWidth="2"/>
        <defs><linearGradient id="mood2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E0E6F0"/><stop offset="100%" stopColor="#C0CCE0"/></linearGradient></defs>
        <circle cx="16" cy="21" r="2.5" fill="#5A6E8A"/>
        <circle cx="32" cy="21" r="2.5" fill="#5A6E8A"/>
        <path d="M17 33 Q24 30 31 33" fill="none" stroke="#5A6E8A" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 3, label: 'ふつう',
    color: '#A0B080', bgFrom: '#EAF0E0', bgTo: '#D4E0C8',
    face: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <circle cx="24" cy="24" r="22" fill="url(#mood3)" stroke="#A0B080" strokeWidth="2"/>
        <defs><linearGradient id="mood3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EAF0E0"/><stop offset="100%" stopColor="#D0DCC0"/></linearGradient></defs>
        <circle cx="16" cy="21" r="2.5" fill="#5A6E4A"/>
        <circle cx="32" cy="21" r="2.5" fill="#5A6E4A"/>
        <path d="M17 32 L31 32" fill="none" stroke="#5A6E4A" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 4, label: 'げんき',
    color: '#E8A040', bgFrom: '#FFF3E0', bgTo: '#FFE4B8',
    face: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <circle cx="24" cy="24" r="22" fill="url(#mood4)" stroke="#E8A040" strokeWidth="2"/>
        <defs><linearGradient id="mood4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFF3E0"/><stop offset="100%" stopColor="#FFE0B0"/></linearGradient></defs>
        <circle cx="16" cy="20" r="2.5" fill="#8B6020"/>
        <circle cx="32" cy="20" r="2.5" fill="#8B6020"/>
        <path d="M16 30 Q24 36 32 30" fill="none" stroke="#8B6020" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 5, label: 'とても\nげんき',
    color: '#E86040', bgFrom: '#FFF0E8', bgTo: '#FFD8C8',
    face: (
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <circle cx="24" cy="24" r="22" fill="url(#mood5)" stroke="#E86040" strokeWidth="2"/>
        <defs><linearGradient id="mood5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFF0E8"/><stop offset="100%" stopColor="#FFD0B8"/></linearGradient></defs>
        <path d="M12 19 Q16 16 20 19" fill="none" stroke="#8B4020" strokeWidth="2" strokeLinecap="round"/>
        <path d="M28 19 Q32 16 36 19" fill="none" stroke="#8B4020" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 29 Q24 38 34 29" fill="#FFAA80" stroke="#8B4020" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function CheckInButton({ alreadyCheckedIn, canCheckInByTime, isClosedDay, currentStreak, onCheckIn }: CheckInButtonProps) {
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [expGained, setExpGained] = useState<number | null>(null);
  const [coinsGained, setCoinsGained] = useState<number | null>(null);
  const [coinBonusDays, setCoinBonusDays] = useState<number | null>(null);

  const isDisabled = alreadyCheckedIn || !canCheckInByTime || isClosedDay;

  const handleCheckInClick = () => {
    if (isDisabled) return;
    setShowMoodPicker(true);
  };

  const handleMoodSelect = (mood: 1 | 2 | 3 | 4 | 5) => {
    setShowMoodPicker(false);
    onCheckIn(mood);
    setExpGained(20);

    // コイン獲得を計算してアニメーション表示
    const coinGain = calculateCheckInCoins(currentStreak + 1);
    // EXPアニメーションが終わってからコイン演出を出す
    setTimeout(() => {
      setCoinsGained(coinGain.total);
      setCoinBonusDays(coinGain.streakBonusDays ?? null);
    }, 1200);

    setTimeout(() => setExpGained(null), 2500);
    setTimeout(() => {
      setCoinsGained(null);
      setCoinBonusDays(null);
    }, 4500);
  };

  return (
    <div className="relative">
      {/* EXP加算アニメーション（ゴージャス版） */}
      <AnimatePresence>
        {expGained !== null && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 背景フラッシュ */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.6 }}
              style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)' }}
            />

            {/* 放射状の光線 */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute w-1 h-32 origin-bottom"
                style={{
                  background: 'linear-gradient(to top, rgba(255,215,0,0.6), transparent)',
                  transform: `rotate(${i * 45}deg)`,
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 1.2, delay: 0.1 }}
              />
            ))}

            {/* キラキラパーティクル */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = 80 + Math.random() * 60;
              return (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute text-2xl"
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 0.8, 0],
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                  }}
                  transition={{ duration: 1.4, delay: 0.2 + i * 0.05 }}
                >
                  {['✦', '✧', '⭐', '💫'][i % 4]}
                </motion.div>
              );
            })}

            {/* メインEXPテキスト */}
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: [0, 1.4, 1.1], rotate: [-10, 5, 0] }}
              transition={{ duration: 0.6, type: 'spring', damping: 8 }}
            >
              {/* グロー効果 */}
              <motion.div
                className="absolute inset-0 blur-2xl rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,165,0,0.3) 50%, transparent 80%)' }}
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 2, 1.5] }}
                transition={{ duration: 1 }}
              />

              {/* EXPテキスト本体 */}
              <motion.div
                className="relative font-heading font-black text-5xl tracking-tight"
                style={{
                  background: 'linear-gradient(180deg, #FFF7CC 0%, #FFD700 30%, #FFA500 70%, #FF8C00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: 1 }}
              >
                +{expGained} EXP!
              </motion.div>

              {/* サブテキスト */}
              <motion.div
                className="relative font-heading font-bold text-lg text-amber-200 mt-1"
                style={{
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Great!
              </motion.div>
            </motion.div>

            {/* 全体フェードアウト */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 1.8, duration: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* コイン獲得アニメーション（超ゴージャス版） */}
      <AnimatePresence>
        {coinsGained !== null && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 背景のゴールドフラッシュ（EXPより強め） */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.8 }}
              style={{ background: 'radial-gradient(circle, rgba(255,200,0,0.6) 0%, rgba(255,160,0,0.2) 40%, transparent 80%)' }}
            />

            {/* スピンするコインの雨（中央から放射） */}
            {[...Array(20)].map((_, i) => {
              const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.3;
              const distance = 120 + Math.random() * 180;
              const delay = Math.random() * 0.4;
              const size = 24 + Math.random() * 20;
              return (
                <motion.div
                  key={`coin-${i}`}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 1, 0.6],
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    rotate: 720,
                  }}
                  transition={{ duration: 1.8, delay, ease: 'easeOut' }}
                >
                  {/* コインSVG（立体的） */}
                  <svg width={size} height={size} viewBox="0 0 40 40">
                    <defs>
                      <radialGradient id={`coinGrad${i}`} cx="35%" cy="35%">
                        <stop offset="0%" stopColor="#FFF7CC" />
                        <stop offset="40%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#B8860B" />
                      </radialGradient>
                    </defs>
                    <circle cx="20" cy="20" r="18" fill={`url(#coinGrad${i})`} stroke="#8B6914" strokeWidth="1.5" />
                    <circle cx="20" cy="20" r="14" fill="none" stroke="#FFE55C" strokeWidth="1" opacity="0.8" />
                    <text x="20" y="27" textAnchor="middle" fontSize="16" fontWeight="900" fill="#8B6914">¥</text>
                  </svg>
                </motion.div>
              );
            })}

            {/* キラキラ星パーティクル */}
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const distance = 80 + Math.random() * 100;
              return (
                <motion.div
                  key={`star-${i}`}
                  className="absolute text-3xl"
                  style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,0.8)' }}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.4, 1, 0.5],
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                  }}
                  transition={{ duration: 1.6, delay: 0.2 + i * 0.04 }}
                >
                  {['✨', '⭐', '💰', '🪙'][i % 4]}
                </motion.div>
              );
            })}

            {/* メインのコイン獲得テキスト */}
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ scale: 0, rotate: -15, y: 20 }}
              animate={{ scale: [0, 1.5, 1.15], rotate: [-15, 8, 0], y: [20, -5, 0] }}
              transition={{ duration: 0.7, type: 'spring', damping: 9 }}
            >
              {/* 後ろの大きなグロー */}
              <motion.div
                className="absolute inset-0 blur-3xl rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,140,0,0.4) 40%, transparent 80%)',
                  width: 300,
                  height: 300,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.8, 1.4], opacity: [0, 1, 0.6] }}
                transition={{ duration: 1.2 }}
              />

              {/* 大きなコインアイコン */}
              <motion.div
                className="relative mb-1"
                animate={{ rotateY: [0, 360, 720] }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              >
                <div className="relative">
                  <Coins
                    size={72}
                    className="text-yellow-300"
                    fill="currentColor"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,1)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                  />
                </div>
              </motion.div>

              {/* +XXX コイン! テキスト */}
              <motion.div
                className="relative font-heading font-black text-6xl tracking-tight whitespace-nowrap"
                style={{
                  background: 'linear-gradient(180deg, #FFFBE0 0%, #FFD700 25%, #FFA500 60%, #FF6F00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.9)) drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.8, repeat: 1 }}
              >
                +{formatCoins(coinsGained)}
              </motion.div>

              {/* "コイン GET!" サブテキスト */}
              <motion.div
                className="relative font-heading font-black text-2xl mt-1"
                style={{
                  background: 'linear-gradient(180deg, #FFEB99 0%, #FFB300 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 8px rgba(255,180,0,0.8)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                }}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', damping: 10 }}
              >
                アカシコイン GET!
              </motion.div>

              {/* 連続ボーナス時の追加表示 */}
              {coinBonusDays !== null && (
                <motion.div
                  className="relative mt-2 px-4 py-1 rounded-full font-heading font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #FF6F00 0%, #FFB300 100%)',
                    color: 'white',
                    boxShadow: '0 0 20px rgba(255,140,0,0.8)',
                    border: '2px solid #FFE082',
                  }}
                  initial={{ opacity: 0, scale: 0, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.7, type: 'spring', damping: 8 }}
                >
                  🔥 {coinBonusDays}日れんぞく ボーナス！
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 休所日メッセージ */}
      {!alreadyCheckedIn && isClosedDay && (
        <motion.p
          className="text-center text-sm text-gray-400 mb-2 font-heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🏠 きょうは おやすみです
        </motion.p>
      )}

      {/* 9時前のメッセージ */}
      {!alreadyCheckedIn && !isClosedDay && !canCheckInByTime && (
        <motion.p
          className="text-center text-sm text-gray-400 mb-2 font-heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🕘 ごぜん 9じ から チェックインできます
        </motion.p>
      )}

      {/* チェックインボタン（ソシャゲ風の装飾ボタン） */}
      <motion.button
        className={`
          relative px-10 py-4 rounded-2xl font-heading font-bold text-lg
          shadow-lg transition-all min-h-14
          ${isDisabled
            ? 'bg-gray-300/80 text-gray-500 cursor-not-allowed border-2 border-gray-400/50'
            : 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 text-white border-2 border-orange-300 hover:shadow-xl active:shadow-md'
          }
        `}
        onClick={handleCheckInClick}
        disabled={isDisabled}
        whileTap={!isDisabled ? { scale: 0.95 } : undefined}
        whileHover={!isDisabled ? { scale: 1.05 } : undefined}
        aria-label={alreadyCheckedIn ? '本日チェックイン済み' : isClosedDay ? '本日は休所日です' : !canCheckInByTime ? '9時からチェックインできます' : 'チェックイン'}
      >
        {/* ボタン内のハイライト */}
        {!isDisabled && (
          <div className="absolute inset-x-2 top-1 h-1/3 bg-white/20 rounded-t-xl pointer-events-none" />
        )}
        {alreadyCheckedIn ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={16} className="text-white" strokeWidth={3} />
            </div>
            <span>チェックインずみ</span>
          </div>
        ) : isClosedDay ? (
          <div className="flex items-center gap-2.5">
            <span>🏠</span>
            <span>きょうは おやすみ</span>
          </div>
        ) : !canCheckInByTime ? (
          <div className="flex items-center gap-2.5">
            <span>🕘</span>
            <span>9じから チェックイン</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <ChevronUp size={24} className="text-white/90" strokeWidth={3} />
            <span>チェックイン！</span>
          </div>
        )}
      </motion.button>

      {/* 体調選択パネル */}
      <AnimatePresence>
        {showMoodPicker && (
          <>
            {/* オーバーレイ */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoodPicker(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-white/50">
                <p className="font-heading font-bold text-gray-700 mb-5 text-center text-lg">
                  きょうの たいちょうは？
                </p>
                <div className="flex justify-center gap-2.5 mb-2">
                  {MOOD_OPTIONS.map((m, idx) => (
                    <motion.button
                      key={m.value}
                      className="flex flex-col items-center rounded-2xl transition-all min-w-14 p-2"
                      style={{ background: `linear-gradient(180deg, ${m.bgFrom}, ${m.bgTo})`, border: `2px solid ${m.color}30` }}
                      onClick={() => handleMoodSelect(m.value)}
                      aria-label={m.label.replace('\n', '')}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      whileHover={{ scale: 1.08, boxShadow: `0 4px 16px ${m.color}40` }}
                      whileTap={{ scale: 0.92 }}
                    >
                      <div className="mb-1.5">{m.face}</div>
                      <span className="text-[10px] font-heading font-bold leading-tight text-center whitespace-pre-line" style={{ color: m.color }}>
                        {m.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
