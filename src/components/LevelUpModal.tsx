import { motion, AnimatePresence } from 'framer-motion';
import Character from './Character';

interface LevelUpModalProps {
  show: boolean;
  newLevel: number;
  onClose: () => void;
  selectedCharacterId?: string;
  equippedCosmetics?: string[];
  formLabel?: string; // 進化後のフォームラベル（例: "第二形態"）。指定時はこちらを表示
}

export default function LevelUpModal({ show, newLevel, onClose, selectedCharacterId, equippedCosmetics, formLabel }: LevelUpModalProps) {
  const levelNames = ['', 'タマゴ', 'こども', 'せいちょう', 'しんか', 'さいしゅう'];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景 */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* 光のエフェクト */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: 2 }}
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
            }}
          />

          {/* モーダル本体 */}
          <motion.div
            className="relative bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{ animation: 'level-up-glow 2s ease-in-out 3' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-3xl font-heading font-bold text-gold mb-2">
                レベルアップ！
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-gray-500 mb-4 text-lg">
                {formLabel
                  ? `Lv.${newLevel} ${formLabel}に進化した！`
                  : `Lv.${newLevel} 「${levelNames[newLevel]}」に進化！`}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              <Character
                level={newLevel}
                size={180}
                animate={true}
                selectedCharacterId={selectedCharacterId}
                equippedCosmetics={equippedCosmetics}
              />
            </motion.div>

            <motion.button
              className="mt-6 px-8 py-3 bg-main text-white rounded-full font-heading font-bold text-lg
                         hover:bg-main-dark active:scale-95 transition-all min-h-12 min-w-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
              aria-label="閉じる"
            >
              やったー！
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
