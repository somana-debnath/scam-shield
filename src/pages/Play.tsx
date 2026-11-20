import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BadgeIcon } from '../components/BadgeToast';
import { IconArrowRight, IconLock, IconStar } from '../components/Icons';
import { ModeToggle } from '../components/Toggles';
import { BADGES } from '../lib/badges';
import { allLevelsPassed, isLevelUnlocked, LEVELS } from '../lib/levels';
import { rankFor, scamProofScore } from '../lib/scoring';
import { useGame } from '../store/gameStore';

export default function Play() {
  const progress = useGame((s) => s.progress);
  const owned = useGame((s) => s.badges);
  const mode = useGame((s) => s.mode);
  const stats = useGame((s) => s.stats);
  const resetAll = useGame((s) => s.resetAll);
  const score = scamProofScore(progress);
  const rank = rankFor(score);
  const started = stats.totalAnswered > 0;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display font-semibold text-primary-ink">{started ? 'Welcome back!' : 'Ready when you are'}</p>
          <h1 className="mt-1 text-4xl font-bold sm:text-5xl">Choose your level</h1>
          <p className="mt-3 max-w-xl text-lg text-muted">
            {mode === 'adult'
              ? 'Start with Level 1. Each level gets a little harder. Take your time.'
              : 'Five levels, from shouty prize texts to near-perfect fakes. Pass one to unlock the next.'}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="text-sm font-medium text-muted">Reading mode</span>
          <ModeToggle />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ol className="grid gap-4 sm:grid-cols-2">
          {LEVELS.map((l, i) => {
            const unlocked = isLevelUnlocked(l.id, progress);
            const best = progress[l.id];
            return (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={l.id === 5 ? 'sm:col-span-2' : ''}
              >
                {unlocked ? (
                  <Link
                    to={`/play/${l.id}`}
                    className="card group flex h-full items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-lift"
                  >
                    <LevelBody l={l} mode={mode} best={best} />
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white transition group-hover:translate-x-1">
                      <IconArrowRight />
                    </span>
                  </Link>
                ) : (
                  <div className="card flex h-full items-center gap-4 p-5 opacity-70" aria-disabled="true">
                    <LevelBody l={l} mode={mode} best={best} />
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-muted" aria-label="Locked">
                      <IconLock />
                    </span>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ol>

        <aside className="space-y-6">
          <section className="card p-6" aria-labelledby="score-h">
            <h2 id="score-h" className="text-sm font-bold uppercase tracking-wider text-muted">Scam-proof score</h2>
            <div className="mt-3 flex items-center gap-4">
              <ScoreRing value={score} />
              <div>
                <p className="font-display text-2xl font-bold">{rank.title}</p>
                <p className="text-sm text-muted">
                  {score === 0 ? 'Play a level to start your score.' : score >= 90 ? 'Scammers hate this one trick: you.' : 'Master harder levels to climb.'}
                </p>
              </div>
            </div>
            {allLevelsPassed(progress) && (
              <Link to="/certificate" className="btn-primary mt-5 w-full">🎓 Get your certificate</Link>
            )}
          </section>

          <section className="card p-6" aria-labelledby="badges-h">
            <h2 id="badges-h" className="text-sm font-bold uppercase tracking-wider text-muted">
              Badges · {owned.length}/{BADGES.length}
            </h2>
            {owned.length === 0 && (
              <p className="mt-2 text-sm text-muted">No badges yet. Your first one is a single swipe away. 🎣</p>
            )}
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {BADGES.map((b) => {
                const has = owned.includes(b.id);
                return (
                  <li key={b.id} title={`${b.name}: ${b.description}`} className="flex justify-center">
                    <BadgeIcon id={b.id} size="sm" locked={!has} />
                  </li>
                );
              })}
            </ul>
          </section>

          {started && (
            <button
              className="text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
              onClick={() => {
                if (window.confirm('Reset all progress and badges? This cannot be undone.')) resetAll();
              }}
            >
              Reset progress
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

function LevelBody({ l, mode, best }: { l: (typeof LEVELS)[number]; mode: 'teen' | 'adult'; best?: { stars: number; passed: boolean } }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-3xl">{l.emoji}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Level {l.id}</p>
        <h2 className="text-xl font-semibold leading-tight">{l.name}</h2>
        <p className="mt-0.5 text-sm text-muted">{l.tagline[mode]}</p>
        {best && (
          <p className="mt-1.5 flex items-center gap-0.5" aria-label={`Best: ${best.stars} of 3 stars`}>
            {[1, 2, 3].map((i) => (
              <IconStar key={i} size={16} fill="currentColor" strokeWidth={1.5} className={i <= best.stars ? 'text-sun' : 'text-line'} />
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`Scam-proof score ${value} out of 100`}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="9" className="stroke-surface-2" />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-2xl font-bold">{value}</span>
    </div>
  );
}
