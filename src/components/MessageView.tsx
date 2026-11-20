import { motion } from 'framer-motion';
import { useMemo, type ReactNode } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { plainText } from '../lib/marks';
import type { GameMessage, Mark, Mode, Segment } from '../lib/types';
import { IconChat, IconChevronLeft, IconMail, IconPlay, IconStop, IconVoicemail, IconWindow } from './Icons';

interface Props {
  msg: GameMessage;
  revealed: boolean;
  mode: Mode;
}

type Numbering = Map<object, number>;

function buildNumbering(msg: GameMessage): Numbering {
  const map: Numbering = new Map();
  const add = (o: object & Mark) => {
    if (o.flag || o.good) map.set(o, map.size + 1);
  };
  add(msg.sender);
  msg.subject?.forEach((s) => typeof s !== 'string' && add(s));
  msg.body.forEach((s) => typeof s !== 'string' && add(s));
  if (msg.link) add(msg.link);
  return map;
}

function Marked({ mark, n, revealed, children }: { mark: Mark; n?: number; revealed: boolean; children: ReactNode }) {
  if (!revealed || !n) return <>{children}</>;
  const bad = Boolean(mark.flag);
  return (
    <motion.mark
      initial={{ backgroundSize: '0% 100%' }}
      animate={{ backgroundSize: '100% 100%' }}
      transition={{ delay: 0.1 + n * 0.08, duration: 0.4 }}
      className={bad ? 'flag-mark' : 'safe-mark'}
      style={{ backgroundRepeat: 'no-repeat' }}
    >
      {children}
      <sup
        className={`ml-0.5 inline-grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full px-1 align-[0.35em] font-sans text-[0.65rem] font-bold not-italic ${
          bad ? 'bg-scam text-scam-on' : 'bg-safe text-safe-on'
        }`}
        aria-label={`${bad ? 'red flag' : 'good sign'} ${n}`}
      >
        {n}
      </sup>
    </motion.mark>
  );
}

function Segments({ list, nums, revealed }: { list: Segment[]; nums: Numbering; revealed: boolean }) {
  return (
    <>
      {list.map((s, i) =>
        typeof s === 'string' ? (
          <span key={i}>{s}</span>
        ) : (
          <Marked key={i} mark={s} n={nums.get(s)} revealed={revealed}>
            {s.t}
          </Marked>
        ),
      )}
    </>
  );
}

function LinkLine({ msg, nums, revealed }: { msg: GameMessage; nums: Numbering; revealed: boolean }) {
  if (!msg.link) return null;
  const { link } = msg;
  return (
    <span className="mt-2 block">
      <Marked mark={link} n={nums.get(link)} revealed={revealed}>
        <span className="break-all font-semibold text-[#2563EB] underline decoration-2 underline-offset-2 dark:text-[#93C5FD]">{link.label}</span>
      </Marked>
      {revealed && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-1 block break-all text-[0.8em] font-semibold ${link.flag ? 'text-scam-ink' : 'text-safe-ink'}`}
        >
          Actually opens: {link.url}
        </motion.span>
      )}
    </span>
  );
}

function Avatar({ name, tone }: { name: string; tone: string }) {
  const isNumber = /^[+d(]/.test(name) || /unknown/i.test(name);
  const initial = isNumber ? '?' : name.replace(/[^A-Za-z0-9]/g, '').charAt(0) || '?';
  return (
    <span aria-hidden className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-lg font-bold text-white ${tone}`}>
      {initial.toUpperCase()}
    </span>
  );
}

function SenderHandle({ msg, nums, revealed }: { msg: GameMessage; nums: Numbering; revealed: boolean }) {
  return (
    <Marked mark={msg.sender} n={nums.get(msg.sender)} revealed={revealed}>
      <span className="break-all">{msg.sender.handle}</span>
    </Marked>
  );
}

export function ContextNote({ text }: { text: string }) {
  return (
    <p className="mx-3 mb-2 rounded-2xl bg-sun-soft px-3 py-2 text-[0.8rem] font-medium text-ink">
      <span aria-hidden>💡 </span>
      <span className="sr-only">Context: </span>
      {text}
    </p>
  );
}

const CHANNEL_META = {
  sms: { label: 'Text message', Icon: IconChat },
  email: { label: 'Email', Icon: IconMail },
  voicemail: { label: 'Voicemail', Icon: IconVoicemail },
  popup: { label: 'Pop-up', Icon: IconWindow },
} as const;

export function channelLabel(c: GameMessage['channel']) {
  return CHANNEL_META[c].label;
}

export function MessageView({ msg, revealed, mode }: Props) {
  const nums = useMemo(() => buildNumbering(msg), [msg]);
  const p = { msg, nums, revealed };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {msg.channel === 'sms' && <SmsView {...p} />}
      {msg.channel === 'email' && <EmailView {...p} />}
      {msg.channel === 'voicemail' && <VoicemailView {...p} mode={mode} />}
      {msg.channel === 'popup' && <PopupView {...p} />}
    </div>
  );
}

type ViewProps = { msg: GameMessage; nums: Numbering; revealed: boolean };

function SmsView({ msg, nums, revealed }: ViewProps) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-line/70 px-3 pb-3">
        <IconChevronLeft className="text-primary-ink" />
        <Avatar name={msg.sender.name} tone="bg-gradient-to-br from-slate-400 to-slate-500" />
        <div className="min-w-0 text-left">
          <p className="truncate font-semibold leading-tight">{msg.sender.name}</p>
          <p className="text-xs text-muted">
            <SenderHandle {...{ msg, nums, revealed }} />
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 text-left">
        <p className="mb-3 text-center text-[0.7rem] font-semibold uppercase tracking-wider text-muted">Today {msg.time}</p>
        {msg.context && <ContextNote text={msg.context} />}
        <div className="max-w-[88%] whitespace-pre-line rounded-3xl rounded-bl-md bg-surface-2 px-4 py-3 text-[0.95rem] leading-relaxed shadow-sm">
          <Segments list={msg.body} nums={nums} revealed={revealed} />
          <LinkLine {...{ msg, nums, revealed }} />
        </div>
      </div>
    </>
  );
}

function EmailView({ msg, nums, revealed }: ViewProps) {
  return (
    <>
      <div className="flex items-center justify-between px-4 pb-2 text-sm font-semibold text-primary-ink">
        <span className="flex items-center gap-0.5">
          <IconChevronLeft size={18} /> Inbox
        </span>
        <span className="text-muted">{msg.time}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 text-left">
        {msg.context && <div className="-mx-3"><ContextNote text={msg.context} /></div>}
        <h3 className="mb-3 font-sans text-lg font-bold leading-snug">
          {msg.subject ? <Segments list={msg.subject} nums={nums} revealed={revealed} /> : '(no subject)'}
        </h3>
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={msg.sender.name} tone="bg-gradient-to-br from-primary to-[#7C3AED]" />
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{msg.sender.name}</p>
            <p className="text-xs text-muted">
              <SenderHandle {...{ msg, nums, revealed }} />
            </p>
          </div>
        </div>
        <div className="whitespace-pre-line text-[0.95rem] leading-relaxed">
          <Segments list={msg.body} nums={nums} revealed={revealed} />
        </div>
        {msg.link && (
          <div className="mt-4 rounded-2xl border border-line bg-surface p-3">
            <LinkLine {...{ msg, nums, revealed }} />
          </div>
        )}
      </div>
    </>
  );
}

function VoicemailView({ msg, nums, revealed, mode }: ViewProps & { mode: Mode }) {
  const { supported, speaking, speak, stop } = useSpeech(mode === 'adult' ? 0.85 : 1.02);
  const bars = useMemo(() => Array.from({ length: 28 }, (_, i) => 30 + ((i * 37) % 70)), []);
  return (
    <>
      <div className="px-4 pb-3 text-left">
        <p className="text-sm font-semibold text-primary-ink">Voicemail</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 text-left">
        {msg.context && <div className="-mx-3"><ContextNote text={msg.context} /></div>}
        <div className="rounded-3xl bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Avatar name={msg.sender.name} tone="bg-gradient-to-br from-[#0EA5E9] to-primary" />
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{msg.sender.name}</p>
              <p className="text-xs text-muted">
                <SenderHandle {...{ msg, nums, revealed }} /> · {msg.time}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => (speaking ? stop() : speak(plainText(msg.body)))}
              disabled={!supported}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white shadow-soft transition hover:scale-105 disabled:opacity-40"
              aria-label={speaking ? 'Stop voicemail' : 'Play voicemail out loud'}
            >
              {speaking ? <IconStop /> : <IconPlay />}
            </button>
            <div aria-hidden className="flex h-10 flex-1 items-center gap-[3px]">
              {bars.map((h, i) => (
                <motion.span
                  key={i}
                  className="w-full rounded-full bg-primary/60"
                  style={{ height: `${h}%` }}
                  animate={speaking ? { scaleY: [1, 0.35, 1] } : { scaleY: 1 }}
                  transition={speaking ? { repeat: Infinity, duration: 0.7, delay: (i % 7) * 0.08 } : {}}
                />
              ))}
            </div>
          </div>
          {!supported && <p className="mt-2 text-xs text-muted">Audio isn't available in this browser. Read the transcript below.</p>}
        </div>
        <p className="mb-1 mt-4 text-[0.7rem] font-semibold uppercase tracking-wider text-muted">Transcript</p>
        <p className="rounded-2xl bg-surface-2 p-3 text-[0.95rem] italic leading-relaxed">
          “<Segments list={msg.body} nums={nums} revealed={revealed} />”
        </p>
      </div>
    </>
  );
}

function PopupView({ msg, nums, revealed }: ViewProps) {
  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      {/* faux page behind the pop-up */}
      <div aria-hidden className="absolute inset-0 space-y-3 p-4 opacity-60">
        <div className="h-8 rounded-xl bg-surface-2" />
        <div className="h-28 rounded-2xl bg-surface-2" />
        <div className="h-4 w-3/4 rounded bg-surface-2" />
        <div className="h-4 w-2/3 rounded bg-surface-2" />
        <div className="h-24 rounded-2xl bg-surface-2" />
      </div>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" aria-hidden />
      <div className="relative flex min-h-full flex-col justify-center p-4">
        {msg.context && <div className="-mx-3"><ContextNote text={msg.context} /></div>}
        <div className="rounded-3xl bg-surface p-5 text-left shadow-lift">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary-ink">
              <IconWindow size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold leading-tight">{msg.sender.name}</p>
              <p className="text-[0.7rem] text-muted">
                <SenderHandle {...{ msg, nums, revealed }} />
              </p>
            </div>
          </div>
          <p className="text-[0.95rem] leading-relaxed">
            <Segments list={msg.body} nums={nums} revealed={revealed} />
          </p>
          {msg.actions && (
            <div aria-hidden className="mt-4 flex gap-2">
              {msg.actions.map((a, i) => (
                <span
                  key={a}
                  className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold ${
                    i === msg.actions!.length - 1 ? 'bg-[#2563EB] text-white' : 'bg-surface-2 text-ink'
                  }`}
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
