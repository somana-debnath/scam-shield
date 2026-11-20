import { accuracy, hasPassed, isCorrect, nextStreak, pointsFor, starsFor, type LevelBest } from './scoring';
import type { Answer, Choice, GameMessage, LevelId } from './types';

export interface Session {
  level: LevelId;
  deck: GameMessage[];
  index: number;
  answers: Answer[];
  streak: number;
  bestStreak: number;
  points: number;
}

export function createSession(level: LevelId, deck: GameMessage[]): Session {
  return { level, deck, index: 0, answers: [], streak: 0, bestStreak: 0, points: 0 };
}

export function currentMessage(s: Session): GameMessage | undefined {
  return s.deck[s.index];
}

export function isAnswered(s: Session): boolean {
  return s.answers.length > s.index;
}

export function isFinished(s: Session): boolean {
  return s.index >= s.deck.length || (s.index === s.deck.length - 1 && isAnswered(s));
}

/** Record the player's choice for the current card. Answering twice is ignored. */
export function answer(s: Session, choice: Choice): Session {
  const msg = currentMessage(s);
  if (!msg || isAnswered(s)) return s;
  const correct = isCorrect(choice, msg.verdict);
  const streak = nextStreak(s.streak, correct);
  const points = pointsFor(correct, streak, s.level);
  return {
    ...s,
    answers: [...s.answers, { messageId: msg.id, choice, correct, points, streak }],
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    points: s.points + points,
  };
}

/** Move to the next card (only once the current one is answered). */
export function advance(s: Session): Session {
  if (!isAnswered(s)) return s;
  return { ...s, index: Math.min(s.index + 1, s.deck.length) };
}

export function summarize(s: Session): LevelBest & { correct: number; total: number } {
  const correct = s.answers.filter((a) => a.correct).length;
  const total = s.deck.length;
  const acc = accuracy(correct, total);
  return { correct, total, accuracy: acc, points: s.points, stars: starsFor(acc), passed: hasPassed(acc) };
}
