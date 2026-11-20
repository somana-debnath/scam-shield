import confetti from 'canvas-confetti';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const COLORS = ['#4F46E5', '#34D399', '#FF7A66', '#FBBF24', '#A5B4FC'];

/** A short celebratory burst from a point on screen (0..1 coordinates). */
export function burst(origin: { x: number; y: number } = { x: 0.5, y: 0.5 }, big = false) {
  if (prefersReducedMotion()) return;
  confetti({
    particleCount: big ? 140 : 70,
    spread: big ? 100 : 70,
    startVelocity: big ? 45 : 32,
    ticks: 160,
    scalar: 0.9,
    origin,
    colors: COLORS,
    disableForReducedMotion: true,
    zIndex: 60,
  });
}

export function elementOrigin(el: Element | null): { x: number; y: number } {
  if (!el) return { x: 0.5, y: 0.5 };
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 3) / window.innerHeight };
}

export function vibrate(pattern: number | number[]) {
  try {
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ua && !ua.hasBeenActive) return;
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}
