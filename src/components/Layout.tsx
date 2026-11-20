import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppEffects } from '../hooks/useAppEffects';
import { BadgeToasts } from './BadgeToast';
import { IconMenu, IconX } from './Icons';
import { Logo } from './Logo';
import { ModeToggle, ThemeToggle } from './Toggles';

const NAV = [
  { to: '/play', label: 'Play' },
  { to: '/learn', label: 'Learn' },
  { to: '/certificate', label: 'Certificate' },
];

export function Layout() {
  useAppEffects();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-lg">
        <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Main">
          <Link to="/" aria-label="Scam Shield home" className="shrink-0 rounded-xl">
            <Logo />
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 font-display font-semibold transition-colors ${
                    isActive ? 'bg-primary-soft text-primary-ink' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ModeToggle />
            </div>
            <ThemeToggle />
            <button
              className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 md:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <IconX /> : <IconMenu />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-line/60 md:hidden"
            >
              <div className="container-page flex flex-col gap-1 py-3">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    className={({ isActive }) =>
                      `rounded-2xl px-4 py-3 font-display text-lg font-semibold ${isActive ? 'bg-primary-soft text-primary-ink' : 'text-ink'}`
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
                <div className="px-2 pt-2 sm:hidden">
                  <p className="mb-2 text-sm font-medium text-muted">Reading mode</p>
                  <ModeToggle compact />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-line/60">
        <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo size={26} />
            <p className="mt-2 max-w-sm text-sm text-muted">
              Every company, bank and app in Scam Shield is fictional. Got a real suspicious message? Report it to the
              Canadian Anti-Fraud Centre at 1-888-495-8501.
            </p>
          </div>
          <div className="flex gap-6 text-sm font-semibold text-muted">
            <Link to="/play" className="hover:text-ink">Play</Link>
            <Link to="/learn" className="hover:text-ink">Learn</Link>
            <Link to="/certificate" className="hover:text-ink">Certificate</Link>
          </div>
        </div>
      </footer>
      <BadgeToasts />
    </div>
  );
}
