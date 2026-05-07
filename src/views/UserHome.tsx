import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Coins, Sparkles } from 'lucide-react';
import type { User, CoinTransaction } from '../types';
import Character from '../components/Character';
import CheckInButton from '../components/CheckInButton';
import ExpBar from '../components/ExpBar';
import Confetti from '../components/Confetti';
import LevelUpModal from '../components/LevelUpModal';
import EvolutionModal from '../components/EvolutionModal';
import { getTodayString } from '../utils/dateUtils';
import { calculateCheckInExp, calculateNewLevel, EXP_VALUES } from '../utils/expCalculator';
import { calculateCheckInCoins, formatCoins } from '../utils/coinCalculator';
import { getCharacterById, getCharacterFormForLevel, isEvolutionLevel } from '../data/characters';
import { useOpeningSchedule } from '../hooks/useOpeningSchedule';

interface UserHomeProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onReset: () => void;
  onOpenCharacterSelect?: () => void;
}

export default function UserHome({ user, onUpdateUser, onReset, onOpenCharacterSelect }: UserHomeProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ show: boolean; level: number; formLabel?: string }>({ show: false, level: 0 });
  const [evolutionInfo, setEvolutionInfo] = useState<{
    show: boolean;
    fromUrl: string;
    toUrl: string;
    fromLabel?: string;
    toLabel?: string;
    pendingLevel?: number; // 進化完了後に反映するレベル
    pendingExpToNext?: number;
  }>({ show: false, fromUrl: '', toUrl: '' });

  const selectedCharacter = getCharacterById(user.selectedCharacterId);
  const { isOpenDay } = useOpeningSchedule();

  const today = getTodayString();
  const alreadyCheckedIn = user.checkInHistory.some(
    (r) => r.date === today && r.checkedIn
  );
  const currentHour = new Date().getHours();
  const canCheckInByTime = currentHour >= 9;
  const isClosedDay = !isOpenDay(today);

  const handleCheckIn = useCallback((mood: 1 | 2 | 3 | 4 | 5) => {
    const expGain = calculateCheckInExp(user.streak) + EXP_VALUES.moodRecord;
    const newExp = user.exp + expGain;
    const newLevel = calculateNewLevel(newExp);
    const newStreak = user.streak + 1;

    const newBadges = [...user.badges];
    if (!newBadges.includes('first-checkin')) newBadges.push('first-checkin');
    if (newStreak >= 3 && !newBadges.includes('streak-3')) newBadges.push('streak-3');
    if (newStreak >= 7 && !newBadges.includes('streak-7')) newBadges.push('streak-7');
    if (newStreak >= 14 && !newBadges.includes('streak-14')) newBadges.push('streak-14');
    if (newStreak >= 30 && !newBadges.includes('streak-30')) newBadges.push('streak-30');

    const mood5Count = user.checkInHistory.filter((r) => r.mood === 5).length + (mood === 5 ? 1 : 0);
    if (mood5Count >= 5 && !newBadges.includes('genki-5')) newBadges.push('genki-5');

    const moodRecordCount = user.checkInHistory.filter((r) => r.checkedIn).length + 1;
    if (moodRecordCount >= 20 && !newBadges.includes('record-master')) newBadges.push('record-master');

    // アカシコイン計算
    const coinGain = calculateCheckInCoins(newStreak);
    const newTransactions: CoinTransaction[] = [
      {
        id: `coin-${Date.now()}-1`,
        date: today,
        type: 'earn',
        amount: coinGain.checkIn,
        reason: 'しゅっせきチェックイン',
      },
      {
        id: `coin-${Date.now()}-2`,
        date: today,
        type: 'earn',
        amount: coinGain.moodRecord,
        reason: 'たいちょうきろく',
      },
    ];
    if (coinGain.streakBonus > 0) {
      newTransactions.push({
        id: `coin-${Date.now()}-3`,
        date: today,
        type: 'earn',
        amount: coinGain.streakBonus,
        reason: `${coinGain.streakBonusDays}にちれんぞくボーナス`,
      });
    }

    // 進化判定
    const isLevelUp = newLevel > user.level;
    const evolves =
      isLevelUp &&
      selectedCharacter &&
      isEvolutionLevel(selectedCharacter, user.level, newLevel);

    const expToNextValue = newLevel < 5 ? [0, 100, 300, 600, 1000][newLevel] : 0;

    // 進化する場合: レベルだけ据え置き、他は即座に反映（演出中に第二形態が見えないように）
    // 進化しない場合: 通常通り全て反映
    const updatedUser: User = {
      ...user,
      exp: newExp,
      level: evolves ? user.level : newLevel,
      streak: newStreak,
      totalCheckIns: user.totalCheckIns + 1,
      badges: newBadges,
      expToNext: evolves ? user.expToNext : expToNextValue,
      checkInHistory: [
        ...user.checkInHistory,
        { date: today, mood, checkedIn: true },
      ],
      akashiCoins: user.akashiCoins + coinGain.total,
      coinHistory: [...user.coinHistory, ...newTransactions],
    };

    setShowConfetti(true);

    if (isLevelUp) {
      if (evolves) {
        const fromForm = getCharacterFormForLevel(selectedCharacter, user.level);
        const toForm = getCharacterFormForLevel(selectedCharacter, newLevel);
        if (fromForm && toForm) {
          // 進化演出を予約（演出が出るまでキャラはまだ第一形態のまま）
          setTimeout(() => {
            setEvolutionInfo({
              show: true,
              fromUrl: fromForm.imageUrl,
              toUrl: toForm.imageUrl,
              fromLabel: fromForm.label,
              toLabel: toForm.label,
              pendingLevel: newLevel,
              pendingExpToNext: expToNextValue,
            });
          }, 1500);
        } else {
          setTimeout(() => setLevelUpInfo({ show: true, level: newLevel }), 1500);
        }
      } else {
        setTimeout(() => setLevelUpInfo({ show: true, level: newLevel }), 1500);
      }
    }

    onUpdateUser(updatedUser);
  }, [user, today, onUpdateUser, selectedCharacter]);

  const handleEvolutionClose = useCallback(() => {
    const { pendingLevel, pendingExpToNext, toLabel } = evolutionInfo;
    setEvolutionInfo({ show: false, fromUrl: '', toUrl: '' });
    // このタイミングでレベルを反映（背景キャラが第二形態に切り替わる）
    if (pendingLevel !== undefined) {
      onUpdateUser({
        ...user,
        level: pendingLevel,
        expToNext: pendingExpToNext ?? user.expToNext,
      });
      setTimeout(
        () => setLevelUpInfo({ show: true, level: pendingLevel, formLabel: toLabel }),
        300
      );
    }
  }, [evolutionInfo, user, onUpdateUser]);

  return (
    <div className="relative flex flex-col min-h-[100dvh] overflow-hidden">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <LevelUpModal
        show={levelUpInfo.show}
        newLevel={levelUpInfo.level}
        onClose={() => setLevelUpInfo({ show: false, level: 0 })}
        selectedCharacterId={user.selectedCharacterId}
        equippedCosmetics={user.equippedCosmetics}
        formLabel={levelUpInfo.formLabel}
      />
      <EvolutionModal
        show={evolutionInfo.show}
        fromImageUrl={evolutionInfo.fromUrl}
        toImageUrl={evolutionInfo.toUrl}
        characterName={selectedCharacter?.name || user.characterName}
        fromLabel={evolutionInfo.fromLabel}
        toLabel={evolutionInfo.toLabel}
        onClose={handleEvolutionClose}
      />

      {/* === 背景グラデーション === */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 30%, #E8F8FF 60%, #FFF8F0 80%, #FFE8D0 100%)',
        }}
      />
      {/* 雲の演出 */}
      <div className="absolute top-8 left-4 w-24 h-10 bg-white/40 rounded-full blur-sm animate-float" />
      <div className="absolute top-16 right-8 w-32 h-12 bg-white/30 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-28 left-1/4 w-20 h-8 bg-white/25 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }} />

      {/* === ヘッダーステータスバー === */}
      <div className="relative z-10 px-3 pt-2 pb-1">
        {/* 1段目：レベル・名前 + リセット */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-b from-amber-400 to-amber-600 text-white rounded-lg px-2.5 py-1 text-sm font-bold shadow-md border border-amber-300">
              Lv.{user.level}
            </div>
            <span className="font-heading font-bold text-white text-base drop-shadow-md">
              {selectedCharacter?.name || user.characterName}
            </span>
            {onOpenCharacterSelect && (
              <button
                onClick={onOpenCharacterSelect}
                className="w-6 h-6 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm text-white/80 hover:text-white transition-colors"
                aria-label="キャラクター選択"
                title="キャラクターを変更"
              >
                <Sparkles size={12} />
              </button>
            )}
          </div>
          <button
            onClick={() => { if (confirm('データをリセットしますか？')) onReset(); }}
            className="bg-black/20 rounded-full w-7 h-7 flex items-center justify-center backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/30 transition-colors"
            aria-label="データリセット"
            title="データリセット"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
        </div>

        {/* 2段目：EXPバー + コイン */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <ExpBar user={user} />
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/50 to-yellow-500/50 rounded-full px-4 py-1.5 backdrop-blur-sm border border-yellow-300/40 shadow-md">
            <Coins size={22} className="text-yellow-200" fill="currentColor" />
            <span className="text-white text-lg font-bold drop-shadow-sm">{formatCoins(user.akashiCoins)}</span>
          </div>
        </div>

        {/* 3段目：連続出席日数 */}
        <div className="mt-2 flex justify-center">
          <div className="flex items-center gap-1">
            <Flame size={26} className="text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.7)]" fill="currentColor" />
            <span
              className="text-lg font-heading font-black tracking-wide"
              style={{
                background: 'linear-gradient(180deg, #FFF7CC 0%, #FFD700 40%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4)) drop-shadow(0 0 8px rgba(255,200,50,0.4))',
              }}
            >
              れんぞく出席 {user.streak}日
            </span>
          </div>
        </div>
      </div>

      {/* === メインキャラクターエリア === */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4 -mt-2">
        {/* キャラクター（大きく表示！） */}
        <motion.div
          className="relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 12 }}
        >
          {/* キャラの足元に光の円 */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,200,100,0.6) 0%, transparent 70%)',
            }}
          />
          <Character
            level={user.level}
            size={280}
            images={user.characterImages}
            equippedCosmetics={user.equippedCosmetics}
            selectedCharacterId={user.selectedCharacterId}
          />
        </motion.div>

        {/* チェックインボタン（キャラの足元） */}
        <div className="flex justify-center mt-2 z-10">
          <CheckInButton
            alreadyCheckedIn={alreadyCheckedIn}
            canCheckInByTime={canCheckInByTime}
            isClosedDay={isClosedDay}
            currentStreak={user.streak}
            onCheckIn={handleCheckIn}
          />
        </div>
      </div>

      {/* === 下部ステータスエリア === */}
      <div className="relative z-10 pb-20 px-4">

        {/* ステータスカード（横並び） */}
        <motion.div
          className="grid grid-cols-3 gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 text-center shadow-sm border border-white/50">
            <div className="text-xl font-heading font-bold text-main">{user.totalCheckIns}</div>
            <div className="text-[10px] text-gray-500">かよった日</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 text-center shadow-sm border border-white/50">
            <div className="text-xl font-heading font-bold text-sub">{user.streak}日</div>
            <div className="text-[10px] text-gray-500">れんぞく</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 text-center shadow-sm border border-white/50">
            <div className="text-xl font-heading font-bold text-amber-500">{user.badges.length}</div>
            <div className="text-[10px] text-gray-500">バッジ</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
