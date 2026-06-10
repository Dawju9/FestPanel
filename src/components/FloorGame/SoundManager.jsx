import { useCallback, useRef } from 'react';

const SOUNDS = {
  place: { freq: 800, duration: 0.1 },
  error: { freq: 200, duration: 0.3 },
  complete: { freq: 1000, duration: 0.5 },
  badge: { freq: 1200, duration: 0.8 },
  tick: { freq: 600, duration: 0.05 },
  bonus: { freq: 900, duration: 0.4 },
};

export default function SoundManager({ enabled = true }) {
  const audioCtx = useRef(null);

  const playTone = useCallback((freq, duration, type = 'square') => {
    if (!enabled || typeof window === 'undefined') return;
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + duration);
    } catch (e) {
    }
  }, [enabled]);

  const play = useCallback((soundName) => {
    const sound = SOUNDS[soundName];
    if (sound) {
      playTone(sound.freq, sound.duration);
    }
  }, [playTone]);

  return null;
}

export function useSound() {
  const audioCtx = useRef(null);

  const playTone = useCallback((freq, duration, type = 'square') => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + duration);
    } catch (e) {
    }
  }, []);

  return {
    playPlace: () => playTone(800, 0.1),
    playError: () => playTone(200, 0.3, 'sawtooth'),
    playComplete: () => {
      playTone(1000, 0.2);
      setTimeout(() => playTone(1200, 0.2), 200);
      setTimeout(() => playTone(1500, 0.3), 400);
    },
    playBadge: () => playTone(1200, 0.8, 'sine'),
    playClick: () => playTone(600, 0.05),
    playBonus: () => playTone(900, 0.2),
  };
}