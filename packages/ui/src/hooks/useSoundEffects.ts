import { useCallback, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useMinesweeperStore } from '../stores/minesweeperStore';

type SoundType = 'click' | 'place' | 'error' | 'complete' | 'flag' | 'reveal' | 'explode' | 'win';

const SOUND_FREQUENCIES: Record<SoundType, number[]> = {
  click: [800],
  place: [600, 800],
  error: [300, 200],
  complete: [523, 659, 784, 1047],
  flag: [500],
  reveal: [700],
  explode: [200, 150, 100],
  win: [523, 659, 784],
};

function playTone(frequencies: number[], duration: number = 100, volume: number = 0.15) {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      const startTime = ctx.currentTime + i * (duration / 1000);
      osc.start(startTime);
      osc.stop(startTime + duration / 1000);
    });

    setTimeout(() => ctx.close(), frequencies.length * duration + 500);
  } catch {}
}

export function useSoundEffects() {
  const sudokuSoundEnabled = useGameStore((s) => s.settings.soundEnabled);
  const mineSoundEnabled = useMinesweeperStore((s) => s.settings.soundEnabled);
  const lastSoundRef = useRef<number>(0);

  const play = useCallback((type: SoundType, game: 'sudoku' | 'minesweeper') => {
    const enabled = game === 'sudoku' ? sudokuSoundEnabled : mineSoundEnabled;
    if (!enabled) return;

    const now = Date.now();
    if (now - lastSoundRef.current < 50) return;
    lastSoundRef.current = now;

    const frequencies = SOUND_FREQUENCIES[type];
    const duration = type === 'complete' || type === 'win' ? 150 : type === 'explode' ? 200 : 80;
    playTone(frequencies, duration);
  }, [sudokuSoundEnabled, mineSoundEnabled]);

  return { play };
}
