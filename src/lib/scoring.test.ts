import { describe, expect, it } from 'vitest';
import {
  accuracy,
  hasPassed,
  isCorrect,
  levelMultiplier,
  mergeBest,
  nextStreak,
  pointsFor,
  rankFor,
  scamProofScore,
  starsFor,
  streakBonus,
  type LevelBest,
} from './scoring';

const best = (acc: number, points = 0): LevelBest => ({
  accuracy: acc,
  points,
  stars: starsFor(acc),
  passed: hasPassed(acc),
});

describe('isCorrect', () => {
  it('rewards reporting scams and trusting legit messages', () => {
    expect(isCorrect('report', 'scam')).toBe(true);
    expect(isCorrect('trust', 'legit')).toBe(true);
    expect(isCorrect('trust', 'scam')).toBe(false);
    expect(isCorrect('report', 'legit')).toBe(false);
  });
});

describe('streaks', () => {
  it('increments on correct and resets on wrong', () => {
    expect(nextStreak(0, true)).toBe(1);
    expect(nextStreak(4, true)).toBe(5);
    expect(nextStreak(7, false)).toBe(0);
  });

  it('gives no bonus for the first answer and caps the bonus', () => {
    expect(streakBonus(0)).toBe(0);
    expect(streakBonus(1)).toBe(0);
    expect(streakBonus(2)).toBe(25);
    expect(streakBonus(5)).toBe(100);
    expect(streakBonus(50)).toBe(100);
  });
});

describe('pointsFor', () => {
  it('scores zero for a wrong answer, never negative', () => {
    expect(pointsFor(false, 0, 5)).toBe(0);
  });

  it('scales with level difficulty', () => {
    expect(levelMultiplier(1)).toBe(1);
    expect(levelMultiplier(5)).toBe(2);
    expect(pointsFor(true, 1, 1)).toBe(100);
    expect(pointsFor(true, 1, 5)).toBe(200);
  });

  it('adds the streak bonus before the multiplier', () => {
    // (100 + 50) * 1.5
    expect(pointsFor(true, 3, 3)).toBe(225);
  });
});

describe('accuracy, passing and stars', () => {
  it('handles empty totals and clamps', () => {
    expect(accuracy(0, 0)).toBe(0);
    expect(accuracy(3, 6)).toBe(0.5);
    expect(accuracy(9, 6)).toBe(1);
  });

  it('passes at 70% or better', () => {
    expect(hasPassed(0.69)).toBe(false);
    expect(hasPassed(0.7)).toBe(true);
    expect(hasPassed(accuracy(5, 6))).toBe(true);
    expect(hasPassed(accuracy(4, 6))).toBe(false);
  });

  it('awards stars by accuracy', () => {
    expect(starsFor(1)).toBe(3);
    expect(starsFor(5 / 6)).toBe(1);
    expect(starsFor(0.9)).toBe(2);
    expect(starsFor(0.7)).toBe(1);
    expect(starsFor(0.5)).toBe(0);
  });
});

describe('scamProofScore', () => {
  it('is 0 with no progress and 100 with all levels perfect', () => {
    expect(scamProofScore({})).toBe(0);
    expect(scamProofScore({ 1: best(1), 2: best(1), 3: best(1), 4: best(1), 5: best(1) })).toBe(100);
  });

  it('weights harder levels more', () => {
    const easyOnly = scamProofScore({ 1: best(1) });
    const hardOnly = scamProofScore({ 5: best(1) });
    expect(hardOnly).toBeGreaterThan(easyOnly);
    // weights 1, 1.25, 1.5, 1.75, 2 → total 7.5
    expect(easyOnly).toBe(Math.round((1 / 7.5) * 100));
    expect(hardOnly).toBe(Math.round((2 / 7.5) * 100));
  });
});

describe('rankFor', () => {
  it('maps scores to ranks', () => {
    expect(rankFor(0).title).toBe('Rookie');
    expect(rankFor(15).title).toBe('Spotter');
    expect(rankFor(72).title).toBe('Guardian');
    expect(rankFor(100).title).toBe('Scam-proof');
  });
});

describe('mergeBest', () => {
  it('keeps the higher accuracy, then the higher points', () => {
    expect(mergeBest(undefined, best(0.5, 10)).accuracy).toBe(0.5);
    expect(mergeBest(best(0.8, 900), best(0.6, 2000)).accuracy).toBe(0.8);
    expect(mergeBest(best(0.8, 900), best(0.8, 1200)).points).toBe(1200);
    expect(mergeBest(best(0.5, 100), best(1, 50)).accuracy).toBe(1);
  });

  it('never loses a pass', () => {
    const merged = mergeBest({ accuracy: 0.9, points: 10, stars: 2, passed: true }, best(0.2));
    expect(merged.passed).toBe(true);
  });
});
