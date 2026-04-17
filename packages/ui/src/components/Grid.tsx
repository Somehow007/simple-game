import { useGameStore } from '../stores/gameStore';
import { type CellValue } from '@shudu/core';

export function Grid() {
  const grid = useGameStore((s) => s.grid);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const settings = useGameStore((s) => s.settings);
  const selectCell = useGameStore((s) => s.selectCell);
  const isCellValueCorrect = useGameStore((s) => s.isCellValueCorrect);

  if (!grid) return null;

  const selectedValue = selectedCell ? grid[selectedCell.row][selectedCell.col].value : 0;

  const getCellClass = (row: number, col: number) => {
    const cell = grid[row][col];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInSameRow = selectedCell?.row === row;
    const isInSameCol = selectedCell?.col === col;
    const isInSameBox =
      selectedCell &&
      Math.floor(row / 3) === Math.floor(selectedCell.row / 3) &&
      Math.floor(col / 3) === Math.floor(selectedCell.col / 3);
    const isSameNumber = settings.highlightSameNumbers && selectedValue !== 0 && cell.value === selectedValue;
    const isConflict = settings.highlightErrors && cell.value !== 0 && !isCellValueCorrect({ row, col });
    const isBorderRight = (col + 1) % 3 === 0 && col < 8;
    const isBorderBottom = (row + 1) % 3 === 0 && row < 8;

    let className = 'grid-cell';
    if (cell.isGiven) className += ' grid-cell--given';
    if (isSelected) className += ' grid-cell--selected';
    else if (isSameNumber) className += ' grid-cell--same-number';
    else if (isInSameRow || isInSameCol || isInSameBox) className += ' grid-cell--highlight';
    if (isConflict) className += ' grid-cell--error';
    if (isBorderRight) className += ' grid-cell--border-right';
    if (isBorderBottom) className += ' grid-cell--border-bottom';

    return className;
  };

  const handleCellClick = (row: number, col: number) => {
    selectCell({ row, col });
  };

  return (
    <div className="grid-container">
      <div className="sudoku-grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClass(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              data-row={rowIndex}
              data-col={colIndex}
            >
              {cell.value !== 0 ? (
                <span className="cell-value">{cell.value}</span>
              ) : cell.note.candidates.size > 0 ? (
                <div className="cell-notes">
                  {([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]).map((num) => (
                    <span
                      key={num}
                      className={`cell-note ${cell.note.candidates.has(num) ? 'cell-note--active' : ''}`}
                    >
                      {cell.note.candidates.has(num) ? num : ''}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
