import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'framer-motion';
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from 'react';
import type { Choice } from '../lib/types';

export interface SwipeHandle {
  fling: (choice: Choice) => void;
}

interface Props {
  children: ReactNode;
  disabled: boolean;
  onDecide: (choice: Choice) => void;
}

const THRESHOLD = 110;
const VELOCITY = 600;

/**
 * Drag left to report, right to trust. Uses spring physics both for the
 * snap-back and the fling, and tilts with the drag like a real card.
 */
export const SwipeCard = forwardRef<SwipeHandle, Props>(function SwipeCard({ children, disabled, onDecide }, ref) {
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const rotate = useTransform(x, [-240, 0, 240], [-14, 0, 14]);
  const trustOpacity = useTransform(x, [20, THRESHOLD], [0, 1]);
  const reportOpacity = useTransform(x, [-THRESHOLD, -20], [1, 0]);
  const busy = useRef(false);

  const fling = (choice: Choice, velocity = 0) => {
    if (busy.current || disabled) return;
    busy.current = true;
    const target = (choice === 'trust' ? 1 : -1) * 520;
    if (reduced) {
      x.set(0);
      busy.current = false;
      onDecide(choice);
      return;
    }
    animate(x, target, {
      type: 'spring',
      stiffness: 220,
      damping: 26,
      velocity,
      restDelta: 5,
      onComplete: () => {
        busy.current = false;
        onDecide(choice);
      },
    });
  };

  useImperativeHandle(ref, () => ({ fling: (c: Choice) => fling(c) }));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > THRESHOLD || velocity.x > VELOCITY) fling('trust', velocity.x);
    else if (offset.x < -THRESHOLD || velocity.x < -VELOCITY) fling('report', velocity.x);
    else animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
  };

  return (
    <motion.div
      className="relative flex h-full min-h-0 cursor-grab touch-pan-y flex-col active:cursor-grabbing"
      style={{ x, rotate }}
      drag={disabled ? false : 'x'}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      initial={{ scale: 0.92, opacity: 0, y: 24 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      {children}
      <motion.div
        aria-hidden
        style={{ opacity: trustOpacity }}
        className="pointer-events-none absolute left-5 top-16 -rotate-12 rounded-2xl border-4 border-safe px-4 py-1 font-display text-3xl font-bold uppercase text-safe-ink bg-surface/80"
      >
        Trust
      </motion.div>
      <motion.div
        aria-hidden
        style={{ opacity: reportOpacity }}
        className="pointer-events-none absolute right-5 top-16 rotate-12 rounded-2xl border-4 border-scam px-4 py-1 font-display text-3xl font-bold uppercase text-scam-ink bg-surface/80"
      >
        Report
      </motion.div>
    </motion.div>
  );
});
