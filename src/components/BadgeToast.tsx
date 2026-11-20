import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { getBadge, type BadgeId } from '../lib/badges';
import { useGame } from '../store/gameStore';

export function BadgeToasts() {
  const queue = useGame((s) => s.toastQueue);
  const dismiss = useGame((s) => s.dismissToast);
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 3200);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence mode="wait">
        {current && (
          <motion.button
            key={current}
            onClick={dismiss}
            initial={{ y: 80, scale: 0.6, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16 }}
            className="pointer-events-auto flex items-center gap-3 rounded-3xl border border-line bg-surface py-3 pl-3 pr-5 text-left shadow-lift"
          >
            <BadgeIcon id={current} size="md" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider text-primary-ink">Badge unlocked!</span>
              <span className="block font-display text-lg font-semibold">{getBadge(current).name}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BadgeIcon({ id, size = 'md', locked = false }: { id: BadgeId; size?: 'sm' | 'md' | 'lg'; locked?: boolean }) {
  const b = getBadge(id);
  const dims = size === 'lg' ? 'h-16 w-16 text-3xl' : size === 'md' ? 'h-12 w-12 text-2xl' : 'h-10 w-10 text-xl';
  return (
    <motion.span
      initial={locked ? false : { scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.1 }}
      className={`grid shrink-0 place-items-center rounded-2xl ${dims} ${
        locked ? 'bg-surface-2 grayscale opacity-50' : 'bg-gradient-to-br from-sun-soft to-primary-soft shadow-soft'
      }`}
      role="img"
      aria-label={`${b.name} badge${locked ? ' (locked)' : ''}`}
    >
      {b.emoji}
    </motion.span>
  );
}
