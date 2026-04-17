import { useGameStore } from '../stores/gameStore';
import { type CellValue, ALL_VALUES } from '@shudu/core';

export function Numpad() {
  const grid = useGameStore((s) => s.grid);
  const isNoteMode = useGameStore((s) => s.isNoteMode);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const setValue = useGameStore((s) => s.setValue);
  const clearValue = useGameStore((s) => s.clearValue);
  const toggleNote = useGameStore((s) => s.toggleNote);
  const toggleNoteMode = useGameStore((s) => s.toggleNoteMode);
  const getNumberCount = useGameStore((s) => s.getNumberCount);

  if (!grid) return null;

  const handleNumberClick = (value: CellValue) => {
    if (!selectedCell) return;
    const cell = grid[selectedCell.row][selectedCell.col];
    if (cell.isGiven) return;

    if (isNoteMode) {
      if (cell.value === 0) {
        toggleNote(value);
      }
    } else {
      setValue(value);
    }
  };

  const handleErase = () => {
    if (!selectedCell) return;
    clearValue();
  };

  return (
    <div className="numpad">
      <div className="numpad-numbers">
        {ALL_VALUES.map((num) => {
          const count = getNumberCount(num);
          const isComplete = count >= 9;
          return (
            <button
              key={num}
              className={`numpad-btn ${isComplete ? 'numpad-btn--complete' : ''}`}
              onClick={() => handleNumberClick(num)}
              disabled={isComplete}
            >
              <span className="numpad-btn__number">{num}</span>
              <span className="numpad-btn__count">{count}/9</span>
            </button>
          );
        })}
      </div>
      <div className="numpad-actions">
        <button
          className={`numpad-action-btn ${isNoteMode ? 'numpad-action-btn--active' : ''}`}
          onClick={toggleNoteMode}
        >
          ✏️ {isNoteMode ? '笔记开' : '笔记关'}
        </button>
        <button className="numpad-action-btn" onClick={handleErase}>
          ⌫ 擦除
        </button>
      </div>
    </div>
  );
}
