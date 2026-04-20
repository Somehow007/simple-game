import { useMinesweeperStore } from '../stores/minesweeperStore';
import { useMineVariantStore } from '../stores/mineVariantStore';
import { MINE_DIFFICULTY_LABELS } from '@shudu/shared';

interface MineToolbarAdapter {
  hasGrid: boolean;
  difficulty: string;
  isGameOver: boolean;
  isPaused: boolean;
  togglePause: () => void;
  getHint: () => void;
  newGame: () => void;
  canHint: boolean;
}

function useStandardMineToolbarStore(): MineToolbarAdapter {
  const grid = useMinesweeperStore((s) => s.grid);
  const difficulty = useMinesweeperStore((s) => s.difficulty);
  const newGame = useMinesweeperStore((s) => s.newGame);
  return {
    hasGrid: grid !== null,
    difficulty: MINE_DIFFICULTY_LABELS[difficulty],
    isGameOver: useMinesweeperStore((s) => s.isGameOver),
    isPaused: useMinesweeperStore((s) => s.isPaused),
    togglePause: useMinesweeperStore((s) => s.togglePause),
    getHint: useMinesweeperStore((s) => s.getHint),
    newGame: () => newGame(difficulty),
    canHint: true,
  };
}

function useVariantMineToolbarStore(): MineToolbarAdapter {
  const difficulty = useMineVariantStore((s) => s.difficulty);
  const variant = useMineVariantStore((s) => s.variant);
  const newGame = useMineVariantStore((s) => s.newGame);
  const variantLabel = variant === 'timed' ? '极限计时' : variant === 'blind' ? '盲扫模式' : '标准';
  return {
    hasGrid: useMineVariantStore((s) => s.grid) !== null,
    difficulty: `${variantLabel} · ${MINE_DIFFICULTY_LABELS[difficulty]}`,
    isGameOver: useMineVariantStore((s) => s.isGameOver),
    isPaused: useMineVariantStore((s) => s.isPaused),
    togglePause: useMineVariantStore((s) => s.togglePause),
    getHint: () => {},
    newGame: () => newGame(difficulty, variant),
    canHint: false,
  };
}

export function MineToolbar({ variant = false }: { variant?: boolean }) {
  const store = variant ? useVariantMineToolbarStore() : useStandardMineToolbarStore();
  const { hasGrid, difficulty, isGameOver, isPaused, togglePause, getHint, newGame, canHint } = store;

  return (
    <div className="toolbar">
      <div className="toolbar__info">
        <span className="toolbar__difficulty">
          {difficulty}
        </span>
      </div>

      <div className="toolbar__actions">
        <button
          className="toolbar__btn"
          onClick={newGame}
          title="重新开始 (F2)"
        >
          🔄 重来
        </button>
        {canHint && (
          <button
            className="toolbar__btn"
            onClick={getHint}
            disabled={!hasGrid || isGameOver}
            title="提示 (H)"
          >
            💡 提示
          </button>
        )}
        <button
          className="toolbar__btn"
          onClick={togglePause}
          disabled={!hasGrid || isGameOver}
          title={isPaused ? '继续 (P)' : '暂停 (P)'}
        >
          {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
        </button>
      </div>
    </div>
  );
}
