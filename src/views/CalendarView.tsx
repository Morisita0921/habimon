import { motion } from 'framer-motion';
import type { User } from '../types';
import Calendar from '../components/Calendar';

interface CalendarViewProps {
  user: User;
}

export default function CalendarView({ user }: CalendarViewProps) {
  return (
    <motion.div
      className="px-4 py-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h1 className="text-xl font-heading font-bold text-gray-800 text-center mb-6">
        📅 カレンダー
      </h1>
      <Calendar user={user} />
    </motion.div>
  );
}
