import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { BadgeIcon } from '../components/BadgeToast';
import { IconArrowLeft, IconArrowRight, IconCheck, IconFlame, IconRefresh, IconStar, IconX } from '../components/Icons';
import { channelLabel, MessageView } from '../components/MessageView';
import { Phone } from '../components/Phone';
import { MessageSkeleton } from '../components/States';
import { SwipeCard, type SwipeHandle } from '../components/SwipeCard';
import { FLAGS, GOODS } from '../data/flags';
import { getBadge } from '../lib/badges';
import { burst, elementOrigin, vibrate } from '../lib/fx';
import { allLevelsPassed, getLevel, isLevelId, isLevelUnlocked, nextLevel } from '../lib/levels';
import { collectMarks } from '../lib/marks';
import { currentMessage, summarize } from '../lib/session';
import type { Choice, GameMessage, Mode } from '../lib/types';
import { useGame } from '../store/gameStore';

type Phase = 'incoming' | 'deciding' | 'revealed' | 'done';

const PRAISE = ['Nice catch!', 'Sharp eyes!', 'Nailed it!', 'You’re on it!', 'Spot on!'];
const COMFORT = ['Sneaky one!', 'Good try!', 'That one was tricky.', 'Now you know!'];
const pick = (list: string[], i: number) => list[i % list.length];

export default function Game() {
  const { levelId } = useParams();
  const n = Number(levelId);
  const progress = useGame((s) => s.progress);

  if (!isLevelId(n)) return <Navigate to="/play" replace />;
  if (!isLevelUnlocked(n, progress)) return <Navigate to="/play" replace />;
  return <GameRound key={n} level={n} />;
}

function GameRound({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  const info = getLevel(level)!;
  const navigate = useNavigate();
  const mode = useGame((s) => s.mode);
  const session = useGame((s) => s.session);
  const startLevel = useGame((s) => s.startLevel);
  const choose = useGame((s) => s.choose);
  const next = useGame((s) => s.next);
  const finishLevel = useGame((s) => s.finishLevel);
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('incoming');
  const swipeRef = useRef<SwipeHandle>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const resultRefLg = useRef<HTMLHeadingElement>(null);
  const shake = useAnimationControls();

  // Start a fresh deck whenever we enter a level (or mode changes mid-level).
  useEffect(() => {
    startLevel(level);
    setPhase('incoming');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, mode]);

  const ready = session && session.level === level;
  const msg = ready ? currentMessage(session) : undefined;
  const index = ready ? session.index : 0;

  // "Buzz in" each new message.
  useEffect(() => {
    if (!msg || phase !== 'incoming') return;
    if (!reduced) {
      shake.start({ rotate: [0, -1.5, 1.5, -1.5, 1.5, 0], transition: { duration: 0.45 } });
      vibrate(60);
    }
    const t = setTimeout(() => setPhase('deciding'), reduced ? 250 : 850);
    return () => clearTimeout(t);
  }, [msg, phase, reduced, shake]);

  const lastAnswer = ready ? session.answers[index] : undefined;

  const onDecide = useCallback(
    (choice: Choice) => {
      if (phase !== 'deciding') return;
      choose(choice);
      setPhase('revealed');
    },
    [choose, phase],
  );

  // Feedback after an answer.
  useEffect(() => {
    if (phase !== 'revealed' || !lastAnswer) return;
    if (lastAnswer.correct) {
      burst(elementOrigin(phoneRef.current));
    } else if (!reduced) {
      shake.start({ x: [0, -12, 12, -9, 9, -4, 4, 0], transition: { duration: 0.5 } });
      vibrate([40, 40, 40]);
    }
    // Focus whichever result heading is visible (mobile: under the phone, desktop: side panel).
    [resultRef, resultRefLg].find((r) => r.current?.offsetParent)?.current?.focus({ preventScroll: true });
  }, [phase, lastAnswer, reduced, shake]);

  const goNext = useCallback(() => {
    if (!ready || phase !== 'revealed') return;
    window.speechSynthesis?.cancel();
    if (index >= session.deck.length - 1) {
      finishLevel();
      setPhase('done');
      return;
    }
    next();
    setPhase('incoming');
  }, [ready, phase, index, session, finishLevel, next]);

  // Keyboard: ← report, → trust, Enter/→ for next.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (phase === 'deciding') {
        if (e.key === 'ArrowLeft') { e.preventDefault(); swipeRef.current?.fling('report'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); swipeRef.current?.fling('trust'); }
      } else if (phase === 'revealed') {
        if (e.key === 'ArrowRight' || (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'A')) { e.preventDefault(); goNext(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, goNext]);

  if (!ready) return <div className="container-page py-16"><MessageSkeleton /></div>;

  if (phase === 'done') return <LevelSummary level={level} onRetry={() => { startLevel(level); setPhase('incoming'); }} onNext={(l) => navigate(`/play/${l}`)} />;

  const total = session.deck.length;

  return (
    <div className="container-page py-6 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/play" className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-muted hover:text-ink">
          <IconArrowLeft size={18} /> All levels
        </Link>
        <Hud level={level} name={info.name} points={session.points} streak={session.streak} answers={session.answers.map((a) => a.correct)} index={index} total={total} />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-12">
        <div>
          <motion.div animate={shake}>
            <Phone ref={phoneRef} time={msg?.time} label={msg ? `${channelLabel(msg.channel)} from ${msg.sender.name}` : 'Phone'}>
              <AnimatePresence>
                {phase === 'incoming' && msg && <IncomingBanner key={`b-${index}`} msg={msg} />}
              </AnimatePresence>
              {phase === 'incoming' && <MessageSkeleton />}
              {phase === 'deciding' && msg && (
                <SwipeCard key={`card-${index}`} ref={swipeRef} disabled={false} onDecide={onDecide}>
                  <MessageView msg={msg} revealed={false} mode={mode} />
                </SwipeCard>
              )}
              {phase === 'revealed' && msg && (
                <motion.div
                  key={`rev-${index}`}
                  className="flex h-full min-h-0 flex-col"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                >
                  <MessageView msg={msg} revealed mode={mode} />
                </motion.div>
              )}
            </Phone>
          </motion.div>

          <div className="mx-auto mt-5 max-w-[340px]">
            {phase !== 'revealed' ? (
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-scam" disabled={phase !== 'deciding'} onClick={() => swipeRef.current?.fling('report')}>
                  <IconArrowLeft /> Report
                </button>
                <button className="btn-safe" disabled={phase !== 'deciding'} onClick={() => swipeRef.current?.fling('trust')}>
                  Trust <IconArrowRight />
                </button>
              </div>
            ) : (
              msg && lastAnswer && (
                <div className="lg:hidden">
                  <ResultBar msg={msg} correct={lastAnswer.correct} points={lastAnswer.points} index={index} isLast={index === total - 1} onNext={goNext} headingRef={resultRef} />
                </div>
              )
            )}
            <p className="mt-3 text-center text-sm text-muted">
              {phase === 'revealed' ? <><span className="lg:hidden">Press Enter or → for the next message</span><span className="hidden lg:inline">Red flags are numbered on the message. Press Enter or → to continue.</span></> : 'Swipe the message, tap a button, or use ← → keys'}
            </p>
          </div>
        </div>

        <div aria-live="polite">
          {phase === 'revealed' && msg && lastAnswer ? (
            <>
              <div className="mb-5 hidden lg:block">
                <ResultBar msg={msg} correct={lastAnswer.correct} points={lastAnswer.points} index={index} isLast={index === total - 1} onNext={goNext} headingRef={resultRefLg} />
              </div>
              <Explanation msg={msg} mode={mode} />
            </>
          ) : (
            <HowToPanel mode={mode} />
          )}
        </div>
      </div>
    </div>
  );
}

function IncomingBanner({ msg }: { msg: GameMessage }) {
  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="absolute inset-x-2 top-0 z-20 flex items-center gap-3 rounded-2xl bg-surface/95 p-3 shadow-lift backdrop-blur"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white" aria-hidden>
        {msg.channel === 'email' ? '✉️' : msg.channel === 'voicemail' ? '📞' : msg.channel === 'popup' ? '⚠️' : '💬'}
      </span>
      <div className="min-w-0 text-left">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">{channelLabel(msg.channel)} · now</p>
        <p className="truncate text-sm font-semibold">{msg.sender.name}</p>
      </div>
    </motion.div>
  );
}

function Hud({ level, name, points, streak, answers, index, total }: { level: number; name: string; points: number; streak: number; answers: boolean[]; index: number; total: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <span className="chip bg-primary-soft text-primary-ink">Level {level} · {name}</span>
      <ol className="flex items-center gap-1.5" aria-label={`Message ${index + 1} of ${total}`}>
        {Array.from({ length: total }).map((_, i) => {
          const a = answers[i];
          const cls = a === undefined ? (i === index ? 'bg-primary ring-4 ring-primary/20' : 'bg-line') : a ? 'bg-safe' : 'bg-scam';
          return <li key={i} className={`h-2.5 w-2.5 rounded-full transition-colors ${cls}`} aria-label={a === undefined ? 'not answered' : a ? 'correct' : 'missed'} />;
        })}
      </ol>
      <span className="chip bg-surface text-ink shadow-soft" aria-label={`${points} points`}>
        <IconStar size={16} className="text-sun" /> <AnimatedNumber value={points} />
      </span>
      <AnimatePresence>
        {streak >= 2 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="chip bg-sun-soft text-ink"
            aria-label={`Streak of ${streak}`}
          >
            <IconFlame size={16} className="text-[#F97316]" /> {streak} streak
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span key={value} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="tabular-nums">
      {value.toLocaleString()}
    </motion.span>
  );
}

function ResultBar({ msg, correct, points, index, isLast, onNext, headingRef }: { msg: GameMessage; correct: boolean; points: number; index: number; isLast: boolean; onNext: () => void; headingRef: React.RefObject<HTMLHeadingElement> }) {
  const isScam = msg.verdict === 'scam';
  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`rounded-3xl p-4 lg:flex lg:items-center lg:gap-4 lg:p-5 ${correct ? 'bg-safe-soft' : 'bg-scam-soft'}`}
    >
      <div className="flex flex-1 items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${correct ? 'bg-safe text-safe-on' : 'bg-scam text-scam-on'}`} aria-hidden>
          {correct ? <IconCheck /> : <IconX />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold leading-tight outline-none">
            {correct ? pick(PRAISE, index) : pick(COMFORT, index)}
          </h2>
          <p className="text-sm font-medium text-ink/80">
            This was {isScam ? 'a scam' : 'legit'}.{correct && points > 0 ? ` +${points} points` : ''}
          </p>
        </div>
      </div>
      <button className="btn-primary mt-3 w-full lg:mt-0 lg:w-auto" onClick={onNext}>
        {isLast ? 'See my results' : 'Next message'} <IconArrowRight />
      </button>
    </motion.div>
  );
}

function Explanation({ msg, mode }: { msg: GameMessage; mode: Mode }) {
  const marks = collectMarks(msg);
  const reds = marks.filter((m) => m.flag);
  const greens = marks.filter((m) => m.good);
  return (
    <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 sm:p-8">
      <p className={`chip mb-3 ${msg.verdict === 'scam' ? 'bg-scam-soft text-scam-ink' : 'bg-safe-soft text-safe-ink'}`}>
        {msg.verdict === 'scam' ? `🚩 ${reds.length} red flag${reds.length === 1 ? '' : 's'}` : `✅ ${greens.length} sign${greens.length === 1 ? '' : 's'} it’s real`}
      </p>
      <h2 className="text-2xl font-semibold sm:text-3xl">{msg.lesson[mode]}</h2>
      <ol className="mt-6 space-y-3">
        {marks.map((m) => {
          const bad = Boolean(m.flag);
          const title = bad ? `${FLAGS[m.flag!].emoji} ${FLAGS[m.flag!].label}` : `✅ ${GOODS[m.good!].label}`;
          const text = m.note ?? (bad ? FLAGS[m.flag!].text[mode] : GOODS[m.good!].text[mode]);
          return (
            <motion.li
              key={m.n}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + m.n * 0.08 }}
              className="flex gap-3 rounded-2xl bg-surface-2/70 p-3"
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${bad ? 'bg-scam text-scam-on' : 'bg-safe text-safe-on'}`}>{m.n}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-muted">{text}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
      {msg.verdict === 'scam' && (
        <p className="mt-5 text-sm text-muted">
          {mode === 'adult'
            ? 'Got a message like this for real? Do not reply. Delete it and tell someone you trust.'
            : 'Got one like this for real? Don’t reply or tap. Block, delete and report it.'}
        </p>
      )}
    </motion.section>
  );
}

function HowToPanel({ mode }: { mode: Mode }) {
  return (
    <section className="card hidden p-8 lg:block">
      <h2 className="text-2xl font-semibold">Scam or legit? Your call.</h2>
      <p className="mt-2 text-muted">
        {mode === 'adult'
          ? 'Read the message carefully. Look at who sent it and what it asks you to do.'
          : 'Check the sender, the link and what it’s asking you to do. Then trust your gut.'}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-scam-soft p-4">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-scam-ink"><IconArrowLeft /> Report</p>
          <p className="mt-1 text-sm text-ink/80">Swipe left or press ← if it’s a scam.</p>
        </div>
        <div className="rounded-2xl bg-safe-soft p-4">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-safe-ink">Trust <IconArrowRight /></p>
          <p className="mt-1 text-sm text-ink/80">Swipe right or press → if it’s real.</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted">💡 Yellow notes on the phone tell you what you already know, like “You just tried to log in.”</p>
    </section>
  );
}

function LevelSummary({ level, onRetry, onNext }: { level: 1 | 2 | 3 | 4 | 5; onRetry: () => void; onNext: (l: number) => void }) {
  const session = useGame((s) => s.session)!;
  const progress = useGame((s) => s.progress);
  const sessionBadges = useGame((s) => s.sessionBadges);
  const mode = useGame((s) => s.mode);
  const sum = summarize(session);
  const nxt = nextLevel(level);
  const finishedAll = allLevelsPassed(progress);

  useEffect(() => {
    if (sum.passed) burst({ x: 0.5, y: 0.35 }, true);
  }, [sum.passed]);

  return (
    <div className="container-page py-10 sm:py-16">
      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="card mx-auto max-w-xl p-8 text-center sm:p-10"
        aria-labelledby="summary-title"
      >
        <div className="flex justify-center gap-2" role="img" aria-label={`${sum.stars} of 3 stars`}>
          {[1, 2, 3].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.2 + i * 0.15 }}
              className={i <= sum.stars ? 'text-sun' : 'text-line'}
            >
              <IconStar size={52} fill="currentColor" strokeWidth={1.5} />
            </motion.span>
          ))}
        </div>
        <h1 id="summary-title" className="mt-4 text-3xl font-bold sm:text-4xl">
          {sum.accuracy === 1 ? 'Flawless!' : sum.passed ? `Level ${level} cleared!` : 'So close!'}
        </h1>
        <p className="mt-2 text-muted">
          {sum.passed
            ? mode === 'adult' ? 'Well done. You are getting very good at this.' : 'Your scam radar is getting seriously good.'
            : mode === 'adult' ? 'You need 5 right answers to move on. Try again. Every try teaches you more.' : 'You need about 70% to unlock the next level. Every miss is a lesson; run it back!'}
        </p>

        <dl className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Correct" value={`${sum.correct}/${sum.total}`} />
          <Stat label="Points" value={sum.points.toLocaleString()} />
          <Stat label="Best streak" value={String(session.bestStreak)} />
        </dl>

        {sessionBadges.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-bold uppercase tracking-wider text-primary-ink">New badges</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-4">
              {sessionBadges.map((b) => (
                <li key={b} className="flex w-24 flex-col items-center gap-1 text-sm font-semibold">
                  <BadgeIcon id={b} size="lg" />
                  {getBadge(b).name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {sum.passed && nxt && (
            <button className="btn-primary" onClick={() => onNext(nxt)}>
              Level {nxt} <IconArrowRight />
            </button>
          )}
          {sum.passed && !nxt && finishedAll && (
            <Link className="btn-primary" to="/certificate">🎓 Get my certificate</Link>
          )}
          <button className={sum.passed ? 'btn-ghost' : 'btn-primary'} onClick={onRetry}>
            <IconRefresh /> {sum.passed ? 'Replay' : 'Try again'}
          </button>
          <Link className="btn-ghost" to="/play">All levels</Link>
        </div>
      </motion.section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
    </div>
  );
}
