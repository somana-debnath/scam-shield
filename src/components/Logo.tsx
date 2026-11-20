import { useId } from 'react';

/** The shield mark: a rounded shield with a check that doubles as a swipe tick. */
export function ShieldMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-g`} x1="10" y1="4" x2="54" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D64F5" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>
      <path
        d="M32 4.5c7.6 4.6 15.4 6.6 22.6 7 1.2.1 2 1 2 2.2v13.6c0 15.3-9.4 26.6-23.6 32.2a2.6 2.6 0 01-2 0C16.8 53.9 7.4 42.6 7.4 27.3V13.7c0-1.2.8-2.1 2-2.2 7.2-.4 15-2.4 22.6-7z"
        fill={`url(#${id}-g)`}
      />
      <path
        d="M32 10.5c6 3.3 12.2 5 18 5.6v11.2c0 12-7 21.3-18 26.3"
        fill="none"
        stroke="#fff"
        strokeOpacity=".18"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M21 32.5l7.5 7.5L44 24.5" fill="none" stroke="#6EE7B7" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <ShieldMark size={size} />
      <span className="font-display text-[1.35rem] font-bold leading-none tracking-tight text-ink">
        Scam<span className="text-primary-ink">Shield</span>
      </span>
    </span>
  );
}
