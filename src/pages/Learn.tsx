import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconArrowRight } from '../components/Icons';
import { FLAGS, PATTERNS } from '../data/flags';
import type { FlagKind } from '../lib/types';
import { useGame } from '../store/gameStore';

const CHECKLIST: Record<'teen' | 'adult', string[]> = {
  teen: [
    'Who really sent it? Read the full address or number, not just the name.',
    'Where does the link really go? Long-press or hover first.',
    'Is it rushing or scaring me?',
    'Is it asking for money, a code, or my login?',
    'Can I check another way, like the app, or a friend on their real number?',
  ],
  adult: [
    'Who sent it? Check the full email address or number.',
    'Is it trying to rush or scare me?',
    'Is it asking for money, a code or my password?',
    'Can I call the company or person on a number I already trust?',
    'Can I ask a friend or family member first?',
  ],
};

export default function Learn() {
  const mode = useGame((s) => s.mode);
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="font-display font-semibold text-primary-ink">Learn</p>
        <h1 className="mt-1 text-4xl font-bold sm:text-5xl">The top scam patterns</h1>
        <p className="mt-3 text-lg text-muted">
          {mode === 'adult'
            ? 'Most scams use the same few tricks. Learn them once and you will spot them everywhere.'
            : 'Scams change their costumes, but the tricks underneath barely change. Learn the six moves and you’ll see them everywhere.'}
        </p>
      </header>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PATTERNS.map((p, i) => (
          <motion.li
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.06 }}
            className="card flex flex-col p-6"
          >
            <span aria-hidden className="grid h-14 w-14 place-items-center rounded-2xl bg-scam-soft text-3xl">{p.emoji}</span>
            <h2 className="mt-4 text-2xl font-semibold">{p.title}</h2>
            <p className="mt-2 text-muted">{p.text[mode]}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.flags.map((f) => (
                <FlagChip key={f} flag={f} />
              ))}
            </div>
            <p className="mt-auto pt-5">
              <span className="block rounded-2xl bg-safe-soft p-3 text-sm font-medium text-ink">
                <span className="font-bold text-safe-ink">Do this: </span>
                {p.tip[mode]}
              </span>
            </p>
          </motion.li>
        ))}
      </ul>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]" aria-labelledby="check-h">
        <div className="card p-6 sm:p-8">
          <h2 id="check-h" className="text-3xl font-semibold">The 5-second check</h2>
          <p className="mt-2 text-muted">Before you tap, reply or pay, ask:</p>
          <ol className="mt-5 space-y-3">
            {CHECKLIST[mode].map((c, i) => (
              <li key={c} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-display font-bold text-white">{i + 1}</span>
                <span className="pt-1">{c}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card flex flex-col p-6 sm:p-8">
          <h2 className="text-3xl font-semibold">All red flags</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {(Object.keys(FLAGS) as FlagKind[]).map((f) => (
              <li key={f} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold">
                <span aria-hidden>{FLAGS[f].emoji}</span> {FLAGS[f].label}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl bg-primary-soft p-4 text-sm">
            <p className="font-bold text-primary-ink">Got scammed, or think you might have?</p>
            <p className="mt-1 text-ink">
              It happens to smart people every day, and it’s not your fault. Call your bank right away, then report it to the
              Canadian Anti-Fraud Centre at <strong>1-888-495-8501</strong> and your local police.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-14 text-center">
        <Link to="/play" className="btn-primary px-8 py-4 text-xl">
          Practice now <IconArrowRight />
        </Link>
      </div>
    </div>
  );
}

function FlagChip({ flag }: { flag: FlagKind }) {
  return (
    <span className="chip bg-surface-2 text-ink">
      <span aria-hidden>{FLAGS[flag].emoji}</span> {FLAGS[flag].label}
    </span>
  );
}
