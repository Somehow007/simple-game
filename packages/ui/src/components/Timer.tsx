import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function Timer() {
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const isPaused = useGameStore((s) => s.isPaused);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const grid = useGameStore((s) => s.grid);
  const setElapsedTime = useGameStore((s) => s.setElapsedTime);
  const showTimer = useGameStore((s) => s.settings.showTimer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (grid && !isPaused && !isCompleted && showTimer) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(useGameStore.getState().elapsedTime + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [grid, isPaused, isCompleted, showTimer, setElapsedTime]);

  if (!showTimer) return null;

  return (
    <div className={`timer ${isPaused ? 'timer--paused' : ''}`}>
      <span className="timer__display">{formatTime(elapsedTime)}</span>
      {isPaused && <span className="timer__label">已暂停</span>}
    </div>
  );
}
