import { useEffect } from 'react';
import { useGame } from '../store/gameStore';

/** Keeps <html> classes in sync with theme + reading mode. */
export function useAppEffects() {
  const theme = useGame((s) => s.theme);
  const mode = useGame((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      root.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0E0D1E' : '#4F46E5');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('mode-adult', mode === 'adult');
  }, [mode]);
}
