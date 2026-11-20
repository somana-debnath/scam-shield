import { forwardRef, type ReactNode } from 'react';
import { IconBattery, IconSignal } from './Icons';

interface PhoneProps {
  children: ReactNode;
  time?: string;
  className?: string;
  /** Screen-reader description of what's on screen. */
  label?: string;
}

/** A device frame with a status bar and a dynamic-island notch. */
export const Phone = forwardRef<HTMLDivElement, PhoneProps>(function Phone({ children, time = '9:41', className = '', label }, ref) {
  return (
    <div
      ref={ref}
      role="region"
      aria-label={label ?? 'Phone screen'}
      className={`relative mx-auto w-full max-w-[340px] rounded-[3rem] bg-[#16142b] p-3 shadow-phone ring-1 ring-black/10 dark:bg-[#05040d] dark:ring-white/10 ${className}`}
    >
      {/* side buttons */}
      <span aria-hidden className="absolute -left-[3px] top-28 h-12 w-[3px] rounded-l bg-[#16142b] dark:bg-[#05040d]" />
      <span aria-hidden className="absolute -right-[3px] top-36 h-16 w-[3px] rounded-r bg-[#16142b] dark:bg-[#05040d]" />
      <div className="relative flex h-[min(620px,calc(100svh-13rem))] min-h-[480px] flex-col overflow-hidden rounded-[2.4rem] bg-bg">
        <div aria-hidden className="relative z-30 flex h-11 shrink-0 items-center justify-between px-7 pt-1 text-[13px] font-semibold text-ink">
          <span>{time}</span>
          <span className="absolute left-1/2 top-2 h-7 w-24 -translate-x-1/2 rounded-full bg-[#16142b] dark:bg-black" />
          <span className="flex items-center gap-1">
            <IconSignal size={15} />
            <IconBattery size={20} />
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        <div aria-hidden className="mx-auto mb-2 mt-1 h-1.5 w-28 shrink-0 rounded-full bg-ink/25" />
      </div>
    </div>
  );
});
