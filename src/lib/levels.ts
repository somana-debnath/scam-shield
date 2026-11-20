import { MESSAGES } from '../data/messages';
import type { LevelBest } from './scoring';
import type { GameMessage, LevelId, Mode } from './types';

export interface LevelInfo {
  id: LevelId;
  name: string;
  tagline: Record<Mode, string>;
  emoji: string;
}

export const LEVELS: LevelInfo[] = [
  { id: 1, name: 'The Obvious Ones', emoji: '🐣', tagline: { teen: 'Shouty prizes, typos and fake virus alerts.', adult: 'Easy warm-up. Big prizes and spelling mistakes.' } },
  { id: 2, name: 'Links & Lookalikes', emoji: '🔗', tagline: { teen: 'Delivery fees, fake logins and sneaky domains.', adult: 'Fake links that look real.' } },
  { id: 3, name: 'Calls & Pop-ups', emoji: '📞', tagline: { teen: 'Voicemails and browser alerts that want control.', adult: 'Phone messages and pop-up warnings.' } },
  { id: 4, name: 'Smooth Talkers', emoji: '🎭', tagline: { teen: 'Hacked friends, fake jobs and romance cons.', adult: 'People pretending to be family or friends.' } },
  { id: 5, name: 'Master Class', emoji: '🧠', tagline: { teen: 'Polished, polite and nearly perfect fakes.', adult: 'The hardest ones. Look very closely.' } },
];

export const LEVEL_IDS: LevelId[] = LEVELS.map((l) => l.id);
export const FINAL_LEVEL: LevelId = 5;

export function getLevel(id: number): LevelInfo | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function isLevelId(n: number): n is LevelId {
  return LEVEL_IDS.includes(n as LevelId);
}

export type Progress = Partial<Record<LevelId, LevelBest>>;

/** Level 1 is always open; every other level opens once the previous one is passed. */
export function isLevelUnlocked(level: LevelId, progress: Progress): boolean {
  if (level === 1) return true;
  return Boolean(progress[(level - 1) as LevelId]?.passed);
}

export function nextLevel(level: LevelId): LevelId | null {
  return level < FINAL_LEVEL ? ((level + 1) as LevelId) : null;
}

export function highestUnlocked(progress: Progress): LevelId {
  let top: LevelId = 1;
  for (const l of LEVEL_IDS) if (isLevelUnlocked(l, progress)) top = l;
  return top;
}

export function allLevelsPassed(progress: Progress): boolean {
  return LEVEL_IDS.every((l) => progress[l]?.passed);
}

export function levelsPassedCount(progress: Progress): number {
  return LEVEL_IDS.filter((l) => progress[l]?.passed).length;
}

/** Small deterministic PRNG so shuffles are reproducible in tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The deck for a level: shared messages plus the ones written for this mode,
 * shuffled. Guarantees the first card is never the same verdict three times
 * in a row at the start, so a level never opens with a long run of one answer.
 */
export function getLevelMessages(
  level: LevelId,
  mode: Mode,
  seed: number = Date.now(),
  pool: readonly GameMessage[] = MESSAGES,
): GameMessage[] {
  const deck = pool.filter((m) => m.level === level && (m.audience === 'both' || m.audience === mode));
  const shuffled = shuffle(deck, mulberry32(seed));
  return breakLongRuns(shuffled, 2);
}

/** Reorders so no more than `maxRun` identical verdicts appear consecutively, when possible. */
export function breakLongRuns(deck: GameMessage[], maxRun: number): GameMessage[] {
  const out = deck.slice();
  for (let i = maxRun; i < out.length; i++) {
    const run = out.slice(i - maxRun, i + 1);
    if (run.every((m) => m.verdict === out[i].verdict)) {
      const swap = out.findIndex((m, j) => j > i && m.verdict !== out[i].verdict);
      if (swap !== -1) [out[i], out[swap]] = [out[swap], out[i]];
    }
  }
  return out;
}
