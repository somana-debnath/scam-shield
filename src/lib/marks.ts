import type { FlagKind, GameMessage, GoodKind, Segment } from './types';

export type MarkLocation = 'sender' | 'subject' | 'body' | 'link';

export interface NumberedMark {
  n: number;
  where: MarkLocation;
  text: string;
  flag?: FlagKind;
  good?: GoodKind;
  note?: string;
}

/**
 * Every red/green flag in a message, numbered in reading order
 * (sender → subject → body → link) so the inline markers on the message
 * match the explanation list beside it.
 */
export function collectMarks(msg: GameMessage): NumberedMark[] {
  const out: NumberedMark[] = [];
  const push = (where: MarkLocation, text: string, m: { flag?: FlagKind; good?: GoodKind; note?: string }) => {
    if (m.flag || m.good) out.push({ n: out.length + 1, where, text, flag: m.flag, good: m.good, note: m.note });
  };
  push('sender', msg.sender.handle, msg.sender);
  const segs = (where: MarkLocation, list?: Segment[]) =>
    list?.forEach((s) => typeof s !== 'string' && push(where, s.t, s));
  segs('subject', msg.subject);
  segs('body', msg.body);
  if (msg.link) push('link', msg.link.url, msg.link);
  return out;
}

/** Plain text of a segment list, used for text-to-speech and alt text. */
export function plainText(list: Segment[]): string {
  return list.map((s) => (typeof s === 'string' ? s : s.t)).join('');
}
