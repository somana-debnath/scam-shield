import type { Choice, LevelId, Verdict } from './types';

export const BASE_POINTS = 100;
export const STREAK_BONUS = 25;
export const MAX_STREAK_BONUS_STEPS = 4;
/** Fraction of correct answers needed to pass a level. */
export const PASS_THRESHOLD = 0.7;

/** Correct means: report a scam, or trust a legit message. */
export function isCorrect(choice: Choice, verdict: Verdict): boolean {
  return (choice === 'report' && verdict === 'scam') || (choice === 'trust' && verdict === 'legit');
}

/** Harder levels are worth more: L1 = 1x, L5 = 2x. */
export function levelMultiplier(level: LevelId): number {
  return 1 + (level - 1) * 0.25;
}

/**
 * Bonus for a streak *including* the current answer.
 * Streak 1 → 0, 2 → 25, 3 → 50 … capped at 100.
 */
export function streakBonus(streak: number): number {
  if (streak <= 1) return 0;
  return Math.min(streak - 1, MAX_STREAK_BONUS_STEPS) * STREAK_BONUS;
}

export function nextStreak(prevStreak: number, correct: boolean): number {
  return correct ? prevStreak + 1 : 0;
}

/** Points for one answer. Wrong answers score 0 (we never take points away). */
export function pointsFor(correct: boolean, streak: number, level: LevelId): number {
  if (!correct) return 0;
  return Math.round((BASE_POINTS + streakBonus(streak)) * levelMultiplier(level));
}

export function accuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, correct / total));
}

export function hasPassed(acc: number): boolean {
  return acc >= PASS_THRESHOLD - 1e-9;
}

/** 0 to 3 stars from accuracy. You need at least 1 star to pass. */
export function starsFor(acc: number): 0 | 1 | 2 | 3 {
  if (acc >= 1 - 1e-9) return 3;
  if (acc >= 0.85) return 2;
  if (hasPassed(acc)) return 1;
  return 0;
}

export interface LevelBest {
  accuracy: number;
  points: number;
  stars: 0 | 1 | 2 | 3;
  passed: boolean;
}

/**
 * Overall "scam-proof" score (0 to 100): the best accuracy per level, weighted
 * by difficulty, across all five levels. Unplayed levels count as 0, so you
 * can only reach 100 by mastering every level.
 */
export function scamProofScore(best: Partial<Record<LevelId, LevelBest>>): number {
  const levels: LevelId[] = [1, 2, 3, 4, 5];
  let weighted = 0;
  let weights = 0;
  for (const l of levels) {
    const w = levelMultiplier(l);
    weights += w;
    weighted += (best[l]?.accuracy ?? 0) * w;
  }
  return Math.round((weighted / weights) * 100);
}

export interface Rank {
  title: string;
  min: number;
}

export const RANKS: Rank[] = [
  { title: 'Scam-proof', min: 90 },
  { title: 'Guardian', min: 70 },
  { title: 'Sharp Eye', min: 40 },
  { title: 'Spotter', min: 15 },
  { title: 'Rookie', min: 0 },
];

export function rankFor(score: number): Rank {
  return RANKS.find((r) => score >= r.min) ?? RANKS[RANKS.length - 1];
}

/** Keep whichever result is better: higher accuracy, then higher points. */
export function mergeBest(prev: LevelBest | undefined, next: LevelBest): LevelBest {
  if (!prev) return next;
  if (next.accuracy > prev.accuracy) return next;
  if (next.accuracy === prev.accuracy && next.points > prev.points) return next;
  return { ...prev, passed: prev.passed || next.passed };
}
