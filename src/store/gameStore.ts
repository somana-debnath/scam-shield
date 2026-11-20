import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { applyAnswer, EMPTY_STATS, newlyEarned, type BadgeId, type Stats } from '../lib/badges';
import { getLevelMessages, LEVEL_IDS, type Progress } from '../lib/levels';
import { mergeBest } from '../lib/scoring';
import { advance, answer, createSession, currentMessage, summarize, type Session } from '../lib/session';
import type { Choice, LevelId, Mode, Theme } from '../lib/types';

interface GameState {
  // persisted
  mode: Mode;
  theme: Theme;
  progress: Progress;
  stats: Stats;
  badges: BadgeId[];
  playerName: string;
  // transient
  session: Session | null;
  /** Badges waiting to be shown as toasts. */
  toastQueue: BadgeId[];
  /** Badges earned during the current level, for the summary screen. */
  sessionBadges: BadgeId[];

  setMode: (mode: Mode) => void;
  setTheme: (theme: Theme) => void;
  setPlayerName: (name: string) => void;
  startLevel: (level: LevelId) => void;
  choose: (choice: Choice) => void;
  next: () => void;
  /** Persist the finished level's result. Returns nothing; read `progress` after. */
  finishLevel: () => void;
  quitLevel: () => void;
  dismissToast: () => void;
  resetAll: () => void;
}

function passedLevels(progress: Progress): LevelId[] {
  return LEVEL_IDS.filter((l) => progress[l]?.passed);
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      mode: 'teen',
      theme: 'system',
      progress: {},
      stats: EMPTY_STATS,
      badges: [],
      playerName: '',
      session: null,
      toastQueue: [],
      sessionBadges: [],

      setMode: (mode) => set({ mode }),
      setTheme: (theme) => set({ theme }),
      setPlayerName: (playerName) => set({ playerName: playerName.slice(0, 40) }),

      startLevel: (level) =>
        set({ session: createSession(level, getLevelMessages(level, get().mode)), sessionBadges: [] }),

      choose: (choice) => {
        const { session, stats, badges, progress } = get();
        if (!session) return;
        const msg = currentMessage(session);
        const updated = answer(session, choice);
        if (!msg || updated === session) return;
        const last = updated.answers[updated.answers.length - 1];
        const newStats = applyAnswer(stats, msg, last);
        const earned = newlyEarned({ stats: newStats, levelsPassed: passedLevels(progress) }, badges);
        set((s) => ({
          session: updated,
          stats: newStats,
          badges: [...badges, ...earned],
          toastQueue: [...s.toastQueue, ...earned],
          sessionBadges: [...s.sessionBadges, ...earned],
        }));
      },

      next: () => {
        const { session } = get();
        if (session) set({ session: advance(session) });
      },

      finishLevel: () => {
        const { session, progress, stats, badges } = get();
        if (!session) return;
        const result = summarize(session);
        const best = { accuracy: result.accuracy, points: result.points, stars: result.stars, passed: result.passed };
        const newProgress: Progress = { ...progress, [session.level]: mergeBest(progress[session.level], best) };
        const newStats = { ...stats, perfectLevels: stats.perfectLevels + (result.accuracy === 1 ? 1 : 0) };
        const earned = newlyEarned({ stats: newStats, levelsPassed: passedLevels(newProgress) }, badges);
        set((s) => ({
          progress: newProgress,
          stats: newStats,
          badges: [...badges, ...earned],
          toastQueue: [...s.toastQueue, ...earned],
          sessionBadges: [...s.sessionBadges, ...earned],
        }));
      },

      quitLevel: () => set({ session: null, sessionBadges: [] }),
      dismissToast: () => set((s) => ({ toastQueue: s.toastQueue.slice(1) })),
      resetAll: () => set({ progress: {}, stats: EMPTY_STATS, badges: [], session: null, toastQueue: [], sessionBadges: [] }),
    }),
    {
      name: 'scam-shield',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        mode: s.mode,
        theme: s.theme,
        progress: s.progress,
        stats: s.stats,
        badges: s.badges,
        playerName: s.playerName,
      }),
    },
  ),
);
