import { useMinesweeperStore } from '../stores/minesweeperStore';
import { useMineVariantStore } from '../stores/mineVariantStore';
import type { MineDifficulty } from '@shudu/minesweeper-core';

interface FaceButtonAdapter {
  isGameOver: boolean;
  isWin: boolean;
  isPaused: boolean;
  newGame: (difficulty: MineDifficulty, variant?: string) => void;
  difficulty: MineDifficulty;
}

function useStandardFaceStore(): FaceButtonAdapter {
  const newGame = useMinesweeperStore((s) => s.newGame);
  const difficulty = useMinesweeperStore((s) => s.difficulty);
  return {
    isGameOver: useMinesweeperStore((s) => s.isGameOver),
    isWin: useMinesweeperStore((s) => s.isWin),
    isPaused: useMinesweeperStore((s) => s.isPaused),
    newGame: (d) => newGame(d),
    difficulty,
  };
}

function useVariantFaceStore(): FaceButtonAdapter {
  const newGame = useMineVariantStore((s) => s.newGame);
  const difficulty = useMineVariantStore((s) => s.difficulty);
  const variant = useMineVariantStore((s) => s.variant);
  return {
    isGameOver: useMineVariantStore((s) => s.isGameOver),
    isWin: useMineVariantStore((s) => s.isWin),
    isPaused: useMineVariantStore((s) => s.isPaused),
    newGame: (d) => newGame(d, variant),
    difficulty,
  };
}

export function FaceButton({ variant = false }: { variant?: boolean }) {
  const store = variant ? useVariantFaceStore() : useStandardFaceStore();
  const { isGameOver, isWin, isPaused, newGame, difficulty } = store;

  const getFace = () => {
    if (isWin) return '😎';
    if (isGameOver) return '😵';
    if (isPaused) return '😴';
    return '🙂';
  };

  const handleClick = () => {
    newGame(difficulty);
  };

  return (
    <button className="face-button" onClick={handleClick} title="重新开始">
      {getFace()}
    </button>
  );
}
