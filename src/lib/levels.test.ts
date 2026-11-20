import { describe, expect, it } from 'vitest';
import { MESSAGES } from '../data/messages';
import { applyAnswer, EMPTY_STATS, newlyEarned } from './badges';
import {
  allLevelsPassed,
  breakLongRuns,
  getLevelMessages,
  highestUnlocked,
  isLevelUnlocked,
  LEVEL_IDS,
  nextLevel,
  type Progress,
} from './levels';
import { hasPassed, starsFor } from './scoring';
import { advance, answer, createSession, currentMessage, isFinished, summarize } from './session';
import type { GameMessage, LevelId, Mode } from './types';

const pass = (acc = 1) => ({ accuracy: acc, points: 100, stars: starsFor(acc), passed: hasPassed(acc) });

describe('level unlocking', () => {
  it('always unlocks level 1 and locks the rest at the start', () => {
    expect(isLevelUnlocked(1, {})).toBe(true);
    for (const l of [2, 3, 4, 5] as LevelId[]) expect(isLevelUnlocked(l, {})).toBe(false);
    expect(highestUnlocked({})).toBe(1);
  });

  it('unlocks the next level only when the previous is passed', () => {
    const progress: Progress = { 1: pass(), 2: pass(0.5) };
    expect(isLevelUnlocked(2, progress)).toBe(true);
    expect(isLevelUnlocked(3, progress)).toBe(false);
    expect(highestUnlocked(progress)).toBe(2);
  });

  it('knows when everything is passed', () => {
    const all: Progress = { 1: pass(), 2: pass(), 3: pass(), 4: pass(), 5: pass(0.7) };
    expect(allLevelsPassed(all)).toBe(true);
    expect(allLevelsPassed({ ...all, 5: pass(0.4) })).toBe(false);
  });

  it('steps through levels and ends at 5', () => {
    expect(nextLevel(1)).toBe(2);
    expect(nextLevel(5)).toBeNull();
  });
});

describe('level decks', () => {
  const modes: Mode[] = ['teen', 'adult'];

  it.each(modes)('every level has a balanced 6-card deck (7 for the final level) for %s mode', (mode) => {
    for (const level of LEVEL_IDS) {
      const deck = getLevelMessages(level, mode, 42);
      expect(deck).toHaveLength(level === 5 ? 7 : 6);
      expect(deck.every((m) => m.level === level)).toBe(true);
      expect(deck.every((m) => m.audience === 'both' || m.audience === mode)).toBe(true);
      const scams = deck.filter((m) => m.verdict === 'scam').length;
      expect(scams).toBeGreaterThanOrEqual(3);
      expect(scams).toBeLessThanOrEqual(5);
    }
  });

  it('is deterministic for a seed and varies across seeds', () => {
    const a = getLevelMessages(2, 'teen', 7).map((m) => m.id);
    const b = getLevelMessages(2, 'teen', 7).map((m) => m.id);
    expect(a).toEqual(b);
    const orders = new Set([1, 2, 3, 4, 5, 6].map((s) => getLevelMessages(2, 'teen', s).map((m) => m.id).join()));
    expect(orders.size).toBeGreaterThan(1);
  });

  it('avoids runs of 3+ identical verdicts when it can', () => {
    const mk = (id: string, verdict: 'scam' | 'legit') => ({ ...MESSAGES[0], id, verdict }) as GameMessage;
    const deck = [mk('a', 'scam'), mk('b', 'scam'), mk('c', 'scam'), mk('d', 'legit'), mk('e', 'legit')];
    const out = breakLongRuns(deck, 2).map((m) => m.verdict);
    expect(out.slice(0, 3)).not.toEqual(['scam', 'scam', 'scam']);
  });

  it('never uses real-looking message ids twice', () => {
    const ids = MESSAGES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every scam has at least one red flag and every legit message at least one green flag', () => {
    for (const m of MESSAGES) {
      const marks = [m.sender, m.link, ...m.body, ...(m.subject ?? [])].filter(
        (s): s is Exclude<typeof s, string | undefined> => typeof s === 'object' && s !== null,
      );
      if (m.verdict === 'scam') expect(marks.some((s) => s.flag), m.id).toBe(true);
      else expect(marks.some((s) => s.good), m.id).toBe(true);
    }
  });
});

describe('session flow', () => {
  const deck = getLevelMessages(1, 'teen', 1);
  const correctChoice = (m: GameMessage) => (m.verdict === 'scam' ? 'report' : 'trust');

  it('plays a perfect level with a growing streak', () => {
    let s = createSession(1, deck);
    for (let i = 0; i < deck.length; i++) {
      s = answer(s, correctChoice(currentMessage(s)!));
      expect(s.streak).toBe(i + 1);
      if (i < deck.length - 1) s = advance(s);
    }
    expect(isFinished(s)).toBe(true);
    const sum = summarize(s);
    expect(sum.correct).toBe(6);
    expect(sum.accuracy).toBe(1);
    expect(sum.stars).toBe(3);
    expect(sum.passed).toBe(true);
    // 100 + 125 + 150 + 175 + 200 + 200 (bonus caps at streak 5)
    expect(sum.points).toBe(950);
    expect(s.bestStreak).toBe(6);
  });

  it('resets the streak on a wrong answer and fails under 70%', () => {
    let s = createSession(1, deck);
    deck.forEach((m, i) => {
      const wrong = i % 2 === 0;
      s = answer(s, wrong ? (correctChoice(m) === 'report' ? 'trust' : 'report') : correctChoice(m));
      if (wrong) expect(s.streak).toBe(0);
      s = advance(s);
    });
    const sum = summarize(s);
    expect(sum.correct).toBe(3);
    expect(sum.passed).toBe(false);
  });

  it('ignores double answers and refuses to advance unanswered cards', () => {
    let s = createSession(1, deck);
    expect(advance(s).index).toBe(0);
    s = answer(s, 'report');
    const again = answer(s, 'trust');
    expect(again.answers).toHaveLength(1);
  });
});

describe('badges', () => {
  const scamWithLink = MESSAGES.find((m) => m.id === 'l1-prize-sms')!;
  const giftCard = MESSAGES.find((m) => m.id === 'l4-job-offer-email')!;

  it('awards First Catch and Gift Card Guardian from stats', () => {
    let stats = applyAnswer(EMPTY_STATS, giftCard, { messageId: giftCard.id, choice: 'report', correct: true, points: 100, streak: 1 });
    expect(newlyEarned({ stats, levelsPassed: [] }, [])).toEqual(['first-catch', 'gift-card-guardian']);
    expect(newlyEarned({ stats, levelsPassed: [] }, ['first-catch'])).toEqual(['gift-card-guardian']);
    stats = applyAnswer(stats, scamWithLink, { messageId: scamWithLink.id, choice: 'trust', correct: false, points: 0, streak: 0 });
    expect(stats.scamsCaught).toBe(1);
  });

  it('awards Link Detective after 3 mismatched-link catches', () => {
    let stats = EMPTY_STATS;
    for (let i = 0; i < 3; i++) {
      stats = applyAnswer(stats, scamWithLink, { messageId: scamWithLink.id, choice: 'report', correct: true, points: 100, streak: i + 1 });
    }
    expect(newlyEarned({ stats, levelsPassed: [] }, [])).toContain('link-detective');
  });

  it('awards Scam-Proof only for all five levels', () => {
    expect(newlyEarned({ stats: EMPTY_STATS, levelsPassed: [1, 2, 3, 4] }, [])).not.toContain('scam-proof');
    expect(newlyEarned({ stats: EMPTY_STATS, levelsPassed: [1, 2, 3, 4, 5] }, [])).toContain('scam-proof');
  });
});
