import { useGameStore } from '../stores/gameStore';
import { useSudokuVariantStore } from '../stores/sudokuVariantStore';
import { DIFFICULTY_LABELS } from '@shudu/shared';

interface ToolbarStoreAdapter {
  hasGrid: boolean;
  difficulty: string;
  mistakes: number;
  isPaused: boolean;
  isCompleted: boolean;
  undo: () => void;
  redo: () => void;
  togglePause: () => void;
  getHint: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  canHint: boolean;
  canUndoRedo: boolean;
}

function useStandardToolbarStore(): ToolbarStoreAdapter {
  const grid = useGameStore((s) => s.grid);
  const difficulty = useGameStore((s) => s.difficulty);
  return {
    hasGrid: grid !== null,
    difficulty: DIFFICULTY_LABELS[difficulty],
    mistakes: useGameStore((s) => s.mistakes),
    isPaused: useGameStore((s) => s.isPaused),
    isCompleted: useGameStore((s) => s.isCompleted),
    undo: useGameStore((s) => s.undo),
    redo: useGameStore((s) => s.redo),
    togglePause: useGameStore((s) => s.togglePause),
    getHint: useGameStore((s) => s.getHint),
    canUndo: useGameStore((s) => s.canUndo),
    canRedo: useGameStore((s) => s.canRedo),
    canHint: true,
    canUndoRedo: true,
  };
}

function useVariantToolbarStore(): ToolbarStoreAdapter {
  const variant = useSudokuVariantStore((s) => s.variant);
  const isDiagonal = variant === 'diagonal';
  const variantLabel = variant === 'diagonal' ? '对角线数独' : variant === 'mini4' ? '迷你4×4' : '迷你6×6';
  return {
    hasGrid: useSudokuVariantStore((s) => s.grid) !== null || isDiagonal,
    difficulty: variantLabel,
    mistakes: useSudokuVariantStore((s) => s.mistakes),
    isPaused: useSudokuVariantStore((s) => s.isPaused),
    isCompleted: useSudokuVariantStore((s) => s.isCompleted),
    undo: useSudokuVariantStore((s) => s.undo),
    redo: useSudokuVariantStore((s) => s.redo),
    togglePause: useSudokuVariantStore((s) => s.togglePause),
    getHint: useSudokuVariantStore((s) => s.getHint),
    canUndo: useSudokuVariantStore((s) => s.canUndo),
    canRedo: useSudokuVariantStore((s) => s.canRedo),
    canHint: isDiagonal,
    canUndoRedo: isDiagonal,
  };
}

export function Toolbar({ variant = false }: { variant?: boolean }) {
  const store = variant ? useVariantToolbarStore() : useStandardToolbarStore();
  const { hasGrid, difficulty, mistakes, isPaused, isCompleted, undo, redo, togglePause, getHint, canUndo, canRedo, canHint, canUndoRedo } = store;

  return (
    <div className="toolbar">
      <div className="toolbar__info">
        <span className="toolbar__difficulty">{difficulty}</span>
        {hasGrid && <span className="toolbar__mistakes">错误: {mistakes}</span>}
      </div>

      <div className="toolbar__actions">
        <button
          className="toolbar__btn"
          onClick={undo}
          disabled={!canUndoRedo || !canUndo()}
          title="撤销"
        >
          ↩️ 撤销
        </button>
        <button
          className="toolbar__btn"
          onClick={redo}
          disabled={!canUndoRedo || !canRedo()}
          title="重做"
        >
          ↪️ 重做
        </button>
        <button
          className="toolbar__btn"
          onClick={getHint}
          disabled={!canHint || !hasGrid || isCompleted}
          title="提示"
        >
          💡 提示
        </button>
        <button
          className="toolbar__btn"
          onClick={togglePause}
          disabled={!hasGrid || isCompleted}
          title={isPaused ? '继续' : '暂停'}
        >
          {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
        </button>
      </div>
    </div>
  );
}
