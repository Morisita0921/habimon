import { motion } from 'framer-motion';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <motion.div
      className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-main-light/20"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <span className="text-2xl" role="img" aria-label="連続出席">🔥</span>
      <div className="text-left">
        <div className="text-xs text-gray-500">れんぞく</div>
        <div className="font-heading font-bold text-lg text-main-dark leading-tight">
          {streak}日
        </div>
      </div>
    </motion.div>
  );
}
