import type { Answer, GameMessage, LevelId } from './types';

export type BadgeId =
  | 'first-catch'
  | 'link-detective'
  | 'gift-card-guardian'
  | 'streak-star'
  | 'trust-builder'
  | 'voice-vigilante'
  | 'perfect-level'
  | 'scam-proof';

export interface BadgeInfo {
  id: BadgeId;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: BadgeInfo[] = [
  { id: 'first-catch', name: 'First Catch', emoji: '🎣', description: 'Reported your first scam.' },
  { id: 'link-detective', name: 'Link Detective', emoji: '🔍', description: 'Caught 3 scams hiding a mismatched link.' },
  { id: 'gift-card-guardian', name: 'Gift Card Guardian', emoji: '🎁', description: 'Caught a gift-card payment scam.' },
  { id: 'streak-star', name: 'Streak Star', emoji: '🔥', description: 'Got 5 answers right in a row.' },
  { id: 'trust-builder', name: 'Trust Builder', emoji: '🤝', description: 'Correctly trusted 5 real messages. Not everything is a scam!' },
  { id: 'voice-vigilante', name: 'Voice Vigilante', emoji: '🎙️', description: 'Caught 3 scam voicemails.' },
  { id: 'perfect-level', name: 'Flawless', emoji: '💎', description: 'Finished a level with 100% accuracy.' },
  { id: 'scam-proof', name: 'Scam-Proof', emoji: '🛡️', description: 'Passed all five levels.' },
];

export function getBadge(id: BadgeId): BadgeInfo {
  return BADGES.find((b) => b.id === id)!;
}

/** Lifetime counters used to award badges. */
export interface Stats {
  scamsCaught: number;
  legitTrusted: number;
  linkScamsCaught: number;
  giftCardScamsCaught: number;
  voicemailScamsCaught: number;
  bestStreak: number;
  perfectLevels: number;
  totalAnswered: number;
  totalCorrect: number;
}

export const EMPTY_STATS: Stats = {
  scamsCaught: 0,
  legitTrusted: 0,
  linkScamsCaught: 0,
  giftCardScamsCaught: 0,
  voicemailScamsCaught: 0,
  bestStreak: 0,
  perfectLevels: 0,
  totalAnswered: 0,
  totalCorrect: 0,
};

export function messageHasFlag(msg: GameMessage, flag: string): boolean {
  if (msg.link?.flag === flag || msg.sender.flag === flag) return true;
  const segs = [...msg.body, ...(msg.subject ?? [])];
  return segs.some((s) => typeof s !== 'string' && s.flag === flag);
}

/** Fold a single answer into lifetime stats. */
export function applyAnswer(stats: Stats, msg: GameMessage, a: Answer): Stats {
  const caughtScam = a.correct && msg.verdict === 'scam';
  return {
    ...stats,
    totalAnswered: stats.totalAnswered + 1,
    totalCorrect: stats.totalCorrect + (a.correct ? 1 : 0),
    scamsCaught: stats.scamsCaught + (caughtScam ? 1 : 0),
    legitTrusted: stats.legitTrusted + (a.correct && msg.verdict === 'legit' ? 1 : 0),
    linkScamsCaught: stats.linkScamsCaught + (caughtScam && messageHasFlag(msg, 'mismatched-link') ? 1 : 0),
    giftCardScamsCaught: stats.giftCardScamsCaught + (caughtScam && messageHasFlag(msg, 'gift-cards') ? 1 : 0),
    voicemailScamsCaught: stats.voicemailScamsCaught + (caughtScam && msg.channel === 'voicemail' ? 1 : 0),
    bestStreak: Math.max(stats.bestStreak, a.streak),
  };
}

export interface BadgeContext {
  stats: Stats;
  levelsPassed: LevelId[];
}

const RULES: Record<BadgeId, (c: BadgeContext) => boolean> = {
  'first-catch': (c) => c.stats.scamsCaught >= 1,
  'link-detective': (c) => c.stats.linkScamsCaught >= 3,
  'gift-card-guardian': (c) => c.stats.giftCardScamsCaught >= 1,
  'streak-star': (c) => c.stats.bestStreak >= 5,
  'trust-builder': (c) => c.stats.legitTrusted >= 5,
  'voice-vigilante': (c) => c.stats.voicemailScamsCaught >= 3,
  'perfect-level': (c) => c.stats.perfectLevels >= 1,
  'scam-proof': (c) => [1, 2, 3, 4, 5].every((l) => c.levelsPassed.includes(l as LevelId)),
};

/** Returns badges that are earned now but weren't already owned, in catalog order. */
export function newlyEarned(ctx: BadgeContext, owned: readonly BadgeId[]): BadgeId[] {
  return BADGES.map((b) => b.id).filter((id) => !owned.includes(id) && RULES[id](ctx));
}
