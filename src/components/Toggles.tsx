import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import type { Mode } from '../lib/types';
import { IconMoon, IconSun } from './Icons';

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'teen', label: 'Teen', hint: 'Quick, detailed explanations' },
  { id: 'adult', label: 'Easy read', hint: 'Larger text and simpler words, for older adults' },
];

export function ModeToggle({ compact = false }: { compact?: boolean }) {
  const mode = useGame((s) => s.mode);
  const setMode = useGame((s) => s.setMode);
  return (
    <div role="radiogroup" aria-label="Reading mode" className="relative inline-flex rounded-full bg-surface-2 p-1">
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            role="radio"
            aria-checked={active}
            title={m.hint}
            onClick={() => setMode(m.id)}
            className={`relative z-10 rounded-full px-3 py-1.5 font-display text-sm font-semibold transition-colors ${
              active ? 'text-white' : 'text-muted hover:text-ink'
            } ${compact ? '' : 'sm:px-4'}`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-soft"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function useIsDark(): boolean {
  const theme = useGame((s) => s.theme);
  if (theme === 'system') return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return theme === 'dark';
}

export function ThemeToggle() {
  const setTheme = useGame((s) => s.setTheme);
  const dark = useIsDark();
  return (
    <button
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-ink transition hover:scale-105"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.span key={dark ? 'moon' : 'sun'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
        {dark ? <IconMoon /> : <IconSun />}
      </motion.span>
    </button>
  );
}
