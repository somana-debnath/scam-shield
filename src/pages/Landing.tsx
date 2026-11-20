import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconArrowRight, IconChat, IconCheck, IconMail, IconVoicemail, IconWindow } from '../components/Icons';
import { MessageView } from '../components/MessageView';
import { Phone } from '../components/Phone';
import { MESSAGES } from '../data/messages';
import { useGame } from '../store/gameStore';

const DEMO_IDS = ['l2-parcel-fee-sms', 'l1-pharmacy-sms', 'l1-bank-locked-email'];
const DEMO = DEMO_IDS.map((id) => MESSAGES.find((m) => m.id === id)!);

type Stage = 'arrive' | 'swipe' | 'reveal';

/** Self-playing preview: a message buzzes in, gets swiped, then shows its red flags. */
function HeroPhone() {
  const reduced = useReducedMotion();
  const mode = useGame((s) => s.mode);
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<Stage>('arrive');
  const msg = DEMO[i];
  const dir = msg.verdict === 'scam' ? -1 : 1;

  useEffect(() => {
    if (reduced) {
      setStage('reveal');
      const t = setTimeout(() => setI((n) => (n + 1) % DEMO.length), 6000);
      return () => clearTimeout(t);
    }
    const durations: Record<Stage, number> = { arrive: 2200, swipe: 700, reveal: 2800 };
    const t = setTimeout(() => {
      if (stage === 'arrive') setStage('swipe');
      else if (stage === 'swipe') setStage('reveal');
      else {
        setStage('arrive');
        setI((n) => (n + 1) % DEMO.length);
      }
    }, durations[stage]);
    return () => clearTimeout(t);
  }, [stage, reduced, i]);

  return (
    <div className="relative" aria-hidden="true">
      <motion.div
        key={i}
        animate={reduced ? {} : { rotate: [0, -2, 2, -2, 2, 0] }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Phone time={msg.time} label="Preview of the game">
          <AnimatePresence mode="wait">
            {stage !== 'reveal' ? (
              <motion.div
                key={`card-${i}`}
                className="relative flex h-full min-h-0 flex-col"
                initial={{ y: -40, opacity: 0, scale: 0.95 }}
                animate={stage === 'swipe' ? { x: dir * 420, rotate: dir * 14, opacity: 0.6 } : { y: 0, x: 0, opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              >
                <MessageView msg={msg} revealed={false} mode={mode} />
                {stage === 'swipe' && (
                  <span
                    className={`absolute top-16 rounded-2xl border-4 bg-surface/80 px-4 py-1 font-display text-3xl font-bold uppercase ${
                      dir < 0 ? 'right-5 rotate-12 border-scam text-scam-ink' : 'left-5 -rotate-12 border-safe text-safe-ink'
                    }`}
                  >
                    {dir < 0 ? 'Report' : 'Trust'}
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div key={`rev-${i}`} className="flex h-full min-h-0 flex-col" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <MessageView msg={msg} revealed mode={mode} />
              </motion.div>
            )}
          </AnimatePresence>
        </Phone>
      </motion.div>

      {/* floating feedback chips */}
      <AnimatePresence>
        {stage === 'reveal' && (
          <motion.div
            key={`chip-${i}`}
            initial={{ scale: 0.4, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14 }}
            className={`absolute -right-2 top-24 flex items-center gap-2 rounded-2xl px-4 py-2.5 font-display text-lg font-semibold shadow-lift sm:-right-10 ${
              msg.verdict === 'scam' ? 'bg-scam text-scam-on' : 'bg-safe text-safe-on'
            }`}
          >
            {msg.verdict === 'scam' ? '🚩 Scam caught!' : <><IconCheck size={18} /> Legit!</>}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="absolute -left-4 bottom-24 hidden rounded-2xl bg-surface px-4 py-3 shadow-lift sm:-left-14 sm:block"
        animate={reduced ? {} : { y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Streak</p>
        <p className="font-display text-2xl font-bold">🔥 5 in a row</p>
      </motion.div>
    </div>
  );
}

const STEPS = [
  { emoji: '📳', title: 'A message buzzes in', text: 'Texts, emails, voicemails and pop-ups, just like the ones on your real phone.' },
  { emoji: '👆', title: 'Swipe to decide', text: 'Right to trust, left to report. Or use the buttons or your arrow keys.' },
  { emoji: '🔍', title: 'See every red flag', text: 'The message lights up with each clue you could have spotted, explained in plain words.' },
];

const FEATURES = [
  { Icon: IconChat, title: 'Real-world formats', text: 'Texts, emails, voicemails with real audio, and browser pop-ups.' },
  { Icon: IconWindow, title: '5 levels', text: 'From shouty prize texts to polite, perfect-grammar lookalikes.' },
  { Icon: IconVoicemail, title: 'Hear the voicemail', text: 'Phone scams read aloud with text-to-speech, transcript included.' },
  { Icon: IconMail, title: 'Badges & streaks', text: 'Earn Link Detective, Voice Vigilante and more as you go.' },
];

export default function Landing() {
  const setMode = useGame((s) => s.setMode);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-safe/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-scam/15 blur-3xl" />
        </div>
        <div className="container-page grid items-center gap-12 py-12 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="chip bg-surface text-ink shadow-soft">
              <span className="h-2 w-2 rounded-full bg-safe" aria-hidden /> Free · No sign-up · 5 minutes a level
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl"
            >
              Spot the scam <span className="relative whitespace-nowrap text-primary-ink">before it<svg aria-hidden viewBox="0 0 300 20" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none"><path d="M4 14C70 4 200 2 296 12" stroke="rgb(var(--safe))" strokeWidth="7" fill="none" strokeLinecap="round" /></svg></span>{' '}
              spots you.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
              Scam Shield is a quick, swipeable game that trains your eye for fake texts, emails, voicemails and pop-ups. Practise on
              harmless fakes so you can sail past the real ones.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/play" className="btn-primary px-8 py-4 text-xl">
                Play now <IconArrowRight />
              </Link>
              <Link to="/learn" className="btn-ghost px-6 py-4">
                Learn the red flags
              </Link>
            </motion.div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
              <li className="flex items-center gap-1.5"><IconCheck size={16} className="text-safe-ink" /> Made for teens and older adults</li>
              <li className="flex items-center gap-1.5"><IconCheck size={16} className="text-safe-ink" /> 100% fictional brands</li>
              <li className="flex items-center gap-1.5"><IconCheck size={16} className="text-safe-ink" /> Works on any phone</li>
            </ul>
          </div>
          <div className="mx-auto w-full max-w-[340px] lg:mr-8">
            <HeroPhone />
          </div>
        </div>
      </section>

      {/* STAT BAND */}
      <section className="container-page" aria-label="Why it matters">
        <div className="card grid gap-6 bg-ink p-8 text-bg sm:grid-cols-3 sm:p-10 dark:bg-surface dark:text-ink">
          <div className="sm:col-span-1">
            <p className="font-display text-5xl font-bold text-safe sm:text-6xl">$704M</p>
            <p className="mt-1 font-semibold">lost to fraud by Canadians in 2025, a new record.</p>
          </div>
          <div>
            <p className="font-display text-5xl font-bold text-scam sm:text-6xl">5–10%</p>
            <p className="mt-1 font-semibold">of fraud is ever reported, so the real number is far higher.</p>
          </div>
          <div className="flex flex-col justify-center">
            <p className="opacity-80">
              Scams target everyone, from teens gaming online to grandparents answering the phone. The best defence is
              practice.
            </p>
            <a
              className="mt-2 text-sm font-semibold underline underline-offset-4 opacity-80 hover:opacity-100"
              href="https://antifraudcentre-centreantifraude.ca/news-nouvelles/2026/2026-03-06-eng.htm"
              target="_blank"
              rel="noreferrer"
            >
              Source: Canadian Anti-Fraud Centre
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-page mt-24" aria-labelledby="how-h">
        <div className="text-center">
          <p className="font-display font-semibold text-primary-ink">How it works</p>
          <h2 id="how-h" className="mt-1 text-4xl font-bold sm:text-5xl">Three steps. Zero lectures.</h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1 }}
              className="card relative p-7"
            >
              <span className="absolute right-6 top-6 font-display text-6xl font-bold text-primary/10" aria-hidden>{i + 1}</span>
              <span aria-hidden className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-3xl">{s.emoji}</span>
              <h3 className="mt-5 text-2xl font-semibold">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </motion.li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
          <span className="chip bg-scam-soft text-scam-ink"><IconArrowLeft size={16} /> Report</span>
          <span className="text-muted">or</span>
          <span className="chip bg-safe-soft text-safe-ink">Trust <IconArrowRight size={16} /></span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page mt-24" aria-labelledby="feat-h">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="font-display font-semibold text-primary-ink">Built to stick</p>
            <h2 id="feat-h" className="mt-1 text-4xl font-bold sm:text-5xl">Learn by doing, not by reading a pamphlet.</h2>
            <p className="mt-4 text-lg text-muted">
              Every message is annotated after you answer, so a wrong guess is just as useful as a right one. And not
              everything is a scam: learning to trust the real ones matters too.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ Icon, title, text }) => (
              <li key={title} className="card p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white"><Icon /></span>
                <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                <p className="mt-1 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MODES */}
      <section className="container-page mt-24" aria-labelledby="modes-h">
        <div className="text-center">
          <p className="font-display font-semibold text-primary-ink">Two ways to play</p>
          <h2 id="modes-h" className="mt-1 text-4xl font-bold sm:text-5xl">Made for every generation</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card p-7">
            <p className="text-4xl" aria-hidden>🎮</p>
            <h3 className="mt-3 text-2xl font-semibold">Teen mode</h3>
            <p className="mt-2 text-muted">Game-account phishing, hacked friends, creator-program cons and fake job offers, with detailed explanations.</p>
            <Link to="/play" onClick={() => setMode('teen')} className="btn-ghost mt-5">Play in Teen mode</Link>
          </div>
          <div className="card p-7">
            <p className="text-4xl" aria-hidden>☕</p>
            <h3 className="mt-3 text-2xl font-semibold">Easy read</h3>
            <p className="mt-2 text-muted">Larger text, simpler words and slower voicemails. Covers grandparent scams, fake tax calls and tech-support pop-ups.</p>
            <Link to="/play" onClick={() => setMode('adult')} className="btn-ghost mt-5">Play in Easy read</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-24">
        <div className="relative overflow-hidden rounded-5xl bg-primary px-6 py-14 text-center text-white shadow-lift sm:px-12">
          <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-safe/30" />
          <h2 className="relative text-4xl font-bold sm:text-5xl">Ready to become scam-proof?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-lg text-white/90">Five levels. About 25 minutes. A certificate at the end you can share with the people you love.</p>
          <Link to="/play" className="btn relative mt-8 bg-white px-8 py-4 text-xl text-primary-ink shadow-soft hover:-translate-y-0.5">
            Play now <IconArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
