import { type CellValue, ALL_VALUES } from '@shudu/core';
import { useGameStore } from '../stores/gameStore';
import { useSudokuVariantStore } from '../stores/sudokuVariantStore';

interface NumpadStoreAdapter {
  grid: import('@shudu/core').SudokuGrid | null;
  isNoteMode: boolean;
  selectedCell: import('@shudu/core').CellPosition | null;
  setValue: (value: CellValue) => void;
  clearValue: () => void;
  toggleNote: (value: CellValue) => void;
  toggleNoteMode: () => void;
  getNumberCount: (value: CellValue) => number;
}

function useStandardNumpadStore(): NumpadStoreAdapter {
  return {
    grid: useGameStore((s) => s.grid),
    isNoteMode: useGameStore((s) => s.isNoteMode),
    selectedCell: useGameStore((s) => s.selectedCell),
    setValue: useGameStore((s) => s.setValue),
    clearValue: useGameStore((s) => s.clearValue),
    toggleNote: useGameStore((s) => s.toggleNote),
    toggleNoteMode: useGameStore((s) => s.toggleNoteMode),
    getNumberCount: useGameStore((s) => s.getNumberCount),
  };
}

function useVariantNumpadStore(): NumpadStoreAdapter {
  const grid = useSudokuVariantStore((s) => s.grid);
  return {
    grid,
    isNoteMode: useSudokuVariantStore((s) => s.isNoteMode),
    selectedCell: useSudokuVariantStore((s) => s.selectedCell),
    setValue: useSudokuVariantStore((s) => s.setValue),
    clearValue: useSudokuVariantStore((s) => s.clearValue),
    toggleNote: useSudokuVariantStore((s) => s.toggleNote),
    toggleNoteMode: useSudokuVariantStore((s) => s.toggleNoteMode),
    getNumberCount: (num: CellValue) => {
      if (!grid) return 0;
      let count = 0;
      for (const row of grid) {
        for (const cell of row) {
          if (cell.value === num) count++;
        }
      }
      return count;
    },
  };
}

export function Numpad({ variant = false }: { variant?: boolean }) {
  const store = variant ? useVariantNumpadStore() : useStandardNumpadStore();
  const { grid, isNoteMode, selectedCell, setValue, clearValue, toggleNote, toggleNoteMode, getNumberCount } = store;

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
