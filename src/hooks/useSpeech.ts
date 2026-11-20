import { useCallback, useEffect, useRef, useState } from 'react';

/** Thin wrapper around the Web Speech API for voicemail playback. */
export function useSpeech(rate = 1) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.lang === 'en-CA') ?? voices.find((v) => v.lang.startsWith('en') && v.localService) ?? voices.find((v) => v.lang.startsWith('en'));
      if (voice) u.voice = voice;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      utterRef.current = u;
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [rate, supported],
  );

  useEffect(() => () => stop(), [stop]);

  return { supported, speaking, speak, stop };
}
