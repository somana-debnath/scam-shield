export type Mode = 'teen' | 'adult';
export type Theme = 'light' | 'dark' | 'system';
export type Channel = 'sms' | 'email' | 'voicemail' | 'popup';
export type Verdict = 'scam' | 'legit';
export type Choice = 'trust' | 'report';
export type LevelId = 1 | 2 | 3 | 4 | 5;

/** Red flags: things that should make you suspicious. */
export type FlagKind =
  | 'urgency'
  | 'odd-sender'
  | 'mismatched-link'
  | 'gift-cards'
  | 'too-good'
  | 'personal-info'
  | 'threat'
  | 'typos'
  | 'odd-payment'
  | 'generic-greeting'
  | 'secrecy'
  | 'remote-access'
  | 'code-request'
  | 'unexpected';

/** Green flags: signs a message is probably genuine. */
export type GoodKind = 'known-sender' | 'no-request' | 'official-channel' | 'expected' | 'no-pressure';

export interface Mark {
  flag?: FlagKind;
  good?: GoodKind;
  /** Specific explanation for this spot. Falls back to the catalog text. */
  note?: string;
}

export type Segment = string | ({ t: string } & Mark);

export interface GameMessage {
  id: string;
  level: LevelId;
  channel: Channel;
  verdict: Verdict;
  audience: 'both' | Mode;
  sender: { name: string; handle: string } & Mark;
  /** Optional situation the player knows about (e.g. "You just tried to log in"). */
  context?: string;
  subject?: Segment[];
  body: Segment[];
  link?: { label: string; url: string } & Mark;
  /** Pop-ups only: button labels. */
  actions?: string[];
  time: string;
  lesson: Record<Mode, string>;
}

export interface Answer {
  messageId: string;
  choice: Choice;
  correct: boolean;
  points: number;
  streak: number;
}
