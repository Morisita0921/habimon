import { motion } from 'framer-motion';
import type { User } from '../types';
import BadgeList from '../components/BadgeList';
import { BADGES } from '../data/badges';

interface AchievementViewProps {
  user: User;
}

export default function AchievementView({ user }: AchievementViewProps) {
  const earnedCount = user.badges.length;
  const totalCount = BADGES.length;

  return (
    <motion.div
      className="px-4 py-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h1 className="text-xl font-heading font-bold text-gray-800 text-center mb-2">
        🏅 じっせき
      </h1>

      <div className="text-center mb-6">
        <span className="text-sm text-gray-500">
          {earnedCount} / {totalCount} バッジ獲得
        </span>
        <div className="w-48 mx-auto h-2 bg-cream-dark rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold to-main"
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <BadgeList earnedBadges={user.badges} />
    </motion.div>
  );
}
