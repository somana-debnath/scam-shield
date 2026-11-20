import type { FlagKind, GoodKind, Mode } from '../lib/types';

interface FlagInfo {
  label: string;
  emoji: string;
  text: Record<Mode, string>;
}

export const FLAGS: Record<FlagKind, FlagInfo> = {
  urgency: {
    label: 'Fake urgency',
    emoji: '⏰',
    text: {
      teen: 'Countdowns and "act now" are there to stop you thinking it through. Real companies give you time.',
      adult: 'They want you to hurry. Real companies give you time. Slow down.',
    },
  },
  'odd-sender': {
    label: 'Odd sender',
    emoji: '🕵️',
    text: {
      teen: "The sender's number or address doesn't match the company it claims to be. Look closely at the domain.",
      adult: 'The sender does not match the company. Check the email address or number carefully.',
    },
  },
  'mismatched-link': {
    label: 'Mismatched link',
    emoji: '🔗',
    text: {
      teen: 'The link text says one thing but actually goes somewhere else. Long-press or hover to preview before tapping.',
      adult: 'The link goes to a different website than it shows. Do not tap it.',
    },
  },
  'gift-cards': {
    label: 'Gift card request',
    emoji: '🎁',
    text: {
      teen: "No real business, government or boss asks to be paid in gift cards. Gift cards are cash that can't be traced.",
      adult: 'Nobody real asks for payment in gift cards. This is always a scam.',
    },
  },
  'too-good': {
    label: 'Too good to be true',
    emoji: '🤑',
    text: {
      teen: 'Free prizes, huge pay for easy work, surprise refunds: if it sounds too good, it is bait.',
      adult: 'A surprise prize or easy money is bait. If it sounds too good, it is not true.',
    },
  },
  'personal-info': {
    label: 'Asks for private info',
    emoji: '🔐',
    text: {
      teen: 'Passwords, SIN, card numbers, login details: real companies never ask for these by message.',
      adult: 'They want your password, SIN or bank details. Real companies never ask for this by message.',
    },
  },
  threat: {
    label: 'Scary threat',
    emoji: '⚠️',
    text: {
      teen: 'Arrest, deleted accounts, viruses: fear is used to rush you. Check by contacting the company yourself.',
      adult: 'They are trying to scare you. Hang up or close it, then call the company yourself.',
    },
  },
  typos: {
    label: 'Spelling mistakes',
    emoji: '✏️',
    text: {
      teen: 'Odd spelling and grammar are a classic sign of a mass-sent scam.',
      adult: 'Real companies check their spelling. Mistakes are a warning sign.',
    },
  },
  'odd-payment': {
    label: 'Strange way to pay',
    emoji: '💸',
    text: {
      teen: 'Crypto, wire transfers, e-transfers to strangers, or small "fees" through a random link are scam favourites.',
      adult: 'They want money in an unusual way. That is a warning sign.',
    },
  },
  'generic-greeting': {
    label: 'Generic greeting',
    emoji: '👋',
    text: {
      teen: '"Dear customer" means they don\'t actually know who you are. Your real bank uses your name.',
      adult: '"Dear customer" means they do not know your name. Your real bank does.',
    },
  },
  secrecy: {
    label: 'Asks for secrecy',
    emoji: '🤫',
    text: {
      teen: '"Don\'t tell anyone" or "don\'t call" keeps you from checking with someone who would spot the scam.',
      adult: 'They tell you to keep it secret, so nobody can warn you.',
    },
  },
  'remote-access': {
    label: 'Wants control of your device',
    emoji: '🖥️',
    text: {
      teen: 'Installing an app so "support" can see your screen hands them your accounts.',
      adult: 'Never install an app because a caller or pop-up tells you to. They want control of your computer.',
    },
  },
  'code-request': {
    label: 'Asks for your code',
    emoji: '🔢',
    text: {
      teen: 'One-time codes are the key to your account. Anyone asking you to share one is trying to get in.',
      adult: 'Never share a code sent to your phone. It is the key to your account.',
    },
  },
  unexpected: {
    label: 'Out of the blue',
    emoji: '🎯',
    text: {
      teen: "You didn't start this conversation, enter this contest or order this thing. Be extra sceptical.",
      adult: 'You were not expecting this. Be careful with surprise messages.',
    },
  },
};

export const GOODS: Record<GoodKind, { label: string; text: Record<Mode, string> }> = {
  'known-sender': {
    label: 'Real sender',
    text: {
      teen: "The address or number matches the company's real one exactly.",
      adult: 'The sender matches the real company.',
    },
  },
  'no-request': {
    label: 'Asks for nothing',
    text: {
      teen: "No link to tap, no money, no info. It's just telling you something.",
      adult: 'It does not ask you for money or information.',
    },
  },
  'official-channel': {
    label: 'Points to the official app or site',
    text: {
      teen: 'It tells you to open the app or type the website yourself instead of tapping a link.',
      adult: 'It tells you to use the official app or website yourself.',
    },
  },
  expected: {
    label: 'You expected it',
    text: {
      teen: 'It matches something you actually just did.',
      adult: 'It matches something you just did.',
    },
  },
  'no-pressure': {
    label: 'No pressure',
    text: {
      teen: "There's no countdown or threat. You can take your time.",
      adult: 'No rush and no threats.',
    },
  },
};

export interface Pattern {
  title: string;
  emoji: string;
  flags: FlagKind[];
  text: Record<Mode, string>;
  tip: Record<Mode, string>;
}

/** Top scam patterns, shown on the Learn page. */
export const PATTERNS: Pattern[] = [
  {
    title: 'The rush job',
    emoji: '⏰',
    flags: ['urgency', 'threat'],
    text: {
      teen: 'Your account will be deleted in 12 hours. A warrant is out for your arrest. Your files are at risk. Panic makes smart people click.',
      adult: 'They say something bad will happen very soon. Fear makes people act fast.',
    },
    tip: {
      teen: 'Pause. Close the message and contact the company through its app or a number you look up yourself.',
      adult: 'Stop. Hang up or close it. Call the company using a number you trust.',
    },
  },
  {
    title: 'The lookalike link',
    emoji: '🔗',
    flags: ['mismatched-link', 'odd-sender'],
    text: {
      teen: 'mapleridgebank-ca.com looks a lot like mapleridgebank.ca. Scammers buy lookalike domains and hide them behind friendly link text.',
      adult: 'The website name looks almost right, but it is a fake copy.',
    },
    tip: {
      teen: 'Read the domain just before the first single slash. Better yet, type the address yourself.',
      adult: 'Do not tap links in messages. Type the website yourself or use the app.',
    },
  },
  {
    title: 'The gift card ask',
    emoji: '🎁',
    flags: ['gift-cards', 'odd-payment'],
    text: {
      teen: "Gift cards, crypto and wire transfers are hard to trace and impossible to reverse. That's why scammers love them.",
      adult: 'Gift cards and wire transfers cannot be undone. Scammers love them.',
    },
    tip: {
      teen: "If anyone asks to be paid in gift cards, it's a scam. Every single time.",
      adult: 'A request to pay with gift cards is a scam. Every time.',
    },
  },
  {
    title: 'The prize you never entered',
    emoji: '🤑',
    flags: ['too-good', 'unexpected'],
    text: {
      teen: 'Free gems, a surprise refund, $45/hr for "testing products". The bait is shiny so you won\'t look at the hook.',
      adult: 'You "won" something you never entered. It is bait.',
    },
    tip: {
      teen: "You can't win a contest you didn't enter. Real refunds show up in your account, not in a text.",
      adult: 'You cannot win a contest you did not enter.',
    },
  },
  {
    title: 'The "it\'s me, new number"',
    emoji: '📱',
    flags: ['secrecy', 'code-request'],
    text: {
      teen: "A friend or family member texts from a new number and needs a favour fast, often a code or money, and can't talk on the phone.",
      adult: 'Someone says they are your child or grandchild with a new number, and they need money fast.',
    },
    tip: {
      teen: "Call or message them on the number you already have. A real friend won't mind.",
      adult: 'Call them on their old number, or call another family member.',
    },
  },
  {
    title: 'The helpful "support" agent',
    emoji: '🖥️',
    flags: ['remote-access', 'personal-info'],
    text: {
      teen: 'Pop-ups and callers claiming to be tech support or your bank want you to install an app or read out your details.',
      adult: 'A pop-up or caller says your computer or bank account has a problem and offers to fix it.',
    },
    tip: {
      teen: 'Real support never cold-calls you or asks you to install anything. Close the tab, restart, move on.',
      adult: 'Close the pop-up. Never let a stranger into your computer.',
    },
  },
];
