import { motion } from 'framer-motion';
import type { User } from '../types';
import { getExpProgress } from '../utils/expCalculator';

interface ExpBarProps {
  user: User;
}

export default function ExpBar({ user }: ExpBarProps) {
  const { current, needed, percent } = getExpProgress(user);
  const isMaxLevel = user.level >= 5;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/90 font-bold drop-shadow-sm">EXP</span>
        <div
          className="flex-1 h-5 bg-black/20 rounded-full overflow-hidden border border-white/30"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`経験値 ${percent}%`}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isMaxLevel
                ? 'linear-gradient(90deg, #FFD700, #FFA000, #FFD700)'
                : 'linear-gradient(90deg, #4FC3F7, #29B6F6, #81D4FA)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-sm text-white font-bold drop-shadow-sm whitespace-nowrap">
          {isMaxLevel ? 'MAX' : `${current}/${needed}`}
        </span>
      </div>
    </div>
  );
}
