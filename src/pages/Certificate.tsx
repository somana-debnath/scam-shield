import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowRight, IconDownload, IconShare } from '../components/Icons';
import { EmptyState, Skeleton } from '../components/States';
import { getBadge } from '../lib/badges';
import { canvasToBlob, drawCertificate, fileNameFor, loadCertificateFonts } from '../lib/certificate';
import { burst } from '../lib/fx';
import { allLevelsPassed, LEVELS, levelsPassedCount } from '../lib/levels';
import { rankFor, scamProofScore } from '../lib/scoring';
import { useGame } from '../store/gameStore';

export default function Certificate() {
  const progress = useGame((s) => s.progress);
  const done = allLevelsPassed(progress);
  const passed = levelsPassedCount(progress);

  if (!done) {
    return (
      <div className="container-page py-16">
        <EmptyState
          emoji="🎓"
          title="Your certificate is waiting"
          action={
            <Link to="/play" className="btn-primary">
              {passed === 0 ? 'Start Level 1' : 'Keep going'} <IconArrowRight />
            </Link>
          }
        >
          <p>Pass all {LEVELS.length} levels to unlock a certificate you can download and share.</p>
          <div className="mx-auto mt-5 w-64">
            <div className="h-3 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={passed} aria-valuemin={0} aria-valuemax={LEVELS.length} aria-label="Levels passed">
              <motion.div className="h-full rounded-full bg-safe" initial={{ width: 0 }} animate={{ width: `${(passed / LEVELS.length) * 100}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{passed} of {LEVELS.length} levels passed{passed > 0 ? '. Nice work so far!' : ''}</p>
          </div>
        </EmptyState>
      </div>
    );
  }
  return <CertificateBuilder />;
}

function CertificateBuilder() {
  const progress = useGame((s) => s.progress);
  const badges = useGame((s) => s.badges);
  const name = useGame((s) => s.playerName);
  const setName = useGame((s) => s.setPlayerName);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [status, setStatus] = useState('');
  const score = scamProofScore(progress);
  const rank = rankFor(score).title;

  useEffect(() => {
    loadCertificateFonts().then(() => setFontsReady(true));
    burst({ x: 0.5, y: 0.3 }, true);
  }, []);

  useEffect(() => {
    if (!fontsReady || !canvasRef.current) return;
    drawCertificate(canvasRef.current, {
      name,
      score,
      rank,
      date: new Date(),
      badges: badges.map((b) => getBadge(b).emoji),
      levels: LEVELS.length,
    });
  }, [fontsReady, name, score, rank, badges]);

  const download = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileNameFor(name);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Downloaded! Go show it off. 🎉');
  };

  const share = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current);
    if (!blob) return;
    const file = new File([blob], fileNameFor(name), { type: 'image/png' });
    const text = `I scored ${score}/100 on Scam Shield and earned the rank "${rank}". Can you spot the scam before it spots you?`;
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: 'My Scam Shield certificate' });
      } else if (navigator.share) {
        await navigator.share({ text, url: window.location.origin, title: 'Scam Shield' });
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
        setStatus('Share text copied to your clipboard!');
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="font-display font-semibold text-primary-ink">You did it!</p>
        <h1 className="mt-1 text-4xl font-bold sm:text-5xl">You’re officially scam-savvy 🎓</h1>
        <p className="mt-3 text-lg text-muted">Add your name, download your certificate and challenge your friends and family to beat your score.</p>
      </header>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[320px_1fr]">
        <div className="card space-y-5 p-6">
          <div>
            <label htmlFor="cert-name" className="font-semibold">Name on certificate</label>
            <input
              id="cert-name"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
            <p className="mt-1.5 text-sm text-muted">Stays on your device. We don’t collect anything.</p>
          </div>
          <button className="btn-primary w-full" onClick={download} disabled={!fontsReady}>
            <IconDownload /> Download PNG
          </button>
          <button className="btn-ghost w-full" onClick={share} disabled={!fontsReady}>
            <IconShare /> Share
          </button>
          <p aria-live="polite" className="min-h-[1.5rem] text-center text-sm font-semibold text-safe-ink">{status}</p>
        </div>

        <div className="relative">
          {!fontsReady && <Skeleton className="aspect-[1.6] w-full rounded-3xl" />}
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0, y: 20, rotate: -1 }}
            animate={fontsReady ? { opacity: 1, y: 0, rotate: 0 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`h-auto w-full rounded-3xl shadow-lift ${fontsReady ? '' : 'hidden'}`}
            role="img"
            aria-label={`Certificate for ${name || 'a Scam Shield player'}: scam-proof score ${score} out of 100, rank ${rank}`}
          />
        </div>
      </div>
    </div>
  );
}
