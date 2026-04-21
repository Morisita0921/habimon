import { motion } from 'framer-motion';
import { BADGES } from '../data/badges';

interface BadgeListProps {
  earnedBadges: string[];
}

export default function BadgeList({ earnedBadges }: BadgeListProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
      {BADGES.map((badge, index) => {
        const earned = earnedBadges.includes(badge.id);
        return (
          <motion.div
            key={badge.id}
            className={`
              p-4 rounded-2xl border-2 text-center transition-all
              ${earned
                ? 'bg-white border-gold shadow-sm'
                : 'bg-gray-50 border-gray-200 opacity-50'
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: earned ? 1 : 0.5, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={`text-4xl mb-2 ${!earned ? 'grayscale' : ''}`}>
              {badge.icon}
            </div>
            <h3 className="font-heading font-bold text-sm text-gray-800 mb-1">
              {badge.name}
            </h3>
            <p className="text-xs text-gray-500">
              {badge.condition}
            </p>
            {earned && (
              <div className="mt-2 text-xs text-gold font-bold">
                ✨ 取得済み
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
