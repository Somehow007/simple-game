import { useGameStore } from '../stores/gameStore';
import { type Difficulty } from '@shudu/core';
import { DIFFICULTY_LABELS } from '@shudu/shared';

export function Toolbar() {
  const grid = useGameStore((s) => s.grid);
  const difficulty = useGameStore((s) => s.difficulty);
  const mistakes = useGameStore((s) => s.mistakes);
  const isPaused = useGameStore((s) => s.isPaused);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const newGame = useGameStore((s) => s.newGame);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const togglePause = useGameStore((s) => s.togglePause);
  const getHint = useGameStore((s) => s.getHint);
  const canUndo = useGameStore((s) => s.canUndo);
  const canRedo = useGameStore((s) => s.canRedo);

  return (
    <div className="toolbar">
      <div className="toolbar__info">
        <span className="toolbar__difficulty">{DIFFICULTY_LABELS[difficulty]}</span>
        {grid && <span className="toolbar__mistakes">错误: {mistakes}</span>}
      </div>

      <div className="toolbar__actions">
        <button
          className="toolbar__btn"
          onClick={undo}
          disabled={!canUndo()}
          title="撤销"
        >
          ↩️ 撤销
        </button>
        <button
          className="toolbar__btn"
          onClick={redo}
          disabled={!canRedo()}
          title="重做"
        >
          ↪️ 重做
        </button>
        <button
          className="toolbar__btn"
          onClick={getHint}
          disabled={!grid || isCompleted}
          title="提示"
        >
          💡 提示
        </button>
        <button
          className="toolbar__btn"
          onClick={togglePause}
          disabled={!grid || isCompleted}
          title={isPaused ? '继续' : '暂停'}
        >
          {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
        </button>
      </div>

      <div className="toolbar__new-game">
        {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
          <button
            key={d}
            className={`toolbar__difficulty-btn ${difficulty === d ? 'toolbar__difficulty-btn--active' : ''}`}
            onClick={() => newGame(d)}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>
    </div>
  );
}
