import { memo } from 'react';
import { useMinesweeperStore } from '../stores/minesweeperStore';
import type { CellPosition, MineCell } from '@shudu/minesweeper-core';

interface MineCellProps {
  cell: MineCell;
  position: CellPosition;
  isHitMine: boolean;
  isWrongFlag: boolean;
  isSelected: boolean;
  onCellClick: (position: CellPosition) => void;
  onCellRightClick: (position: CellPosition) => void;
  onCellDoubleClick: (position: CellPosition) => void;
}

const MineCellComponent = memo(function MineCellComponent({
  cell,
  position,
  isHitMine,
  isWrongFlag,
  isSelected,
  onCellClick,
  onCellRightClick,
  onCellDoubleClick,
}: MineCellProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onCellRightClick(position);
  };

  const handleClick = () => {
    onCellClick(position);
  };

  const handleDoubleClick = () => {
    onCellDoubleClick(position);
  };

  let className = 'mine-cell';
  if (cell.state === 'hidden') {
    className += ' mine-cell--hidden';
  } else if (cell.state === 'revealed') {
    className += ' mine-cell--revealed';
  } else if (cell.state === 'flagged') {
    className += ' mine-cell--flagged';
  } else if (cell.state === 'questioned') {
    className += ' mine-cell--questioned';
  }

  if (isHitMine) {
    className += ' mine-cell--hit-mine';
  }
  if (isWrongFlag) {
    className += ' mine-cell--wrong-flag';
  }
  if (isSelected) {
    className += ' mine-cell--selected';
  }

  const renderContent = () => {
    if (cell.state === 'hidden') return null;

    if (cell.state === 'flagged') {
      return <span className="mine-cell__icon">🚩</span>;
    }

    if (cell.state === 'questioned') {
      return <span className="mine-cell__icon">❓</span>;
    }

    if (cell.isMine) {
      return <span className="mine-cell__icon">💣</span>;
    }

    if (cell.adjacentMines > 0) {
      return (
        <span
          className={`mine-cell__number mine-cell__number--${cell.adjacentMines}`}
        >
          {cell.adjacentMines}
        </span>
      );
    }

    return null;
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}
    </div>
  );
});

export function MineGrid() {
  const grid = useMinesweeperStore((s) => s.grid);
  const config = useMinesweeperStore((s) => s.config);
  const isGameOver = useMinesweeperStore((s) => s.isGameOver);
  const isPaused = useMinesweeperStore((s) => s.isPaused);
  const hitMinePosition = useMinesweeperStore((s) => s.hitMinePosition);
  const selectedCell = useMinesweeperStore((s) => s.selectedCell);
  const handleCellClick = useMinesweeperStore((s) => s.handleCellClick);
  const handleCellRightClick = useMinesweeperStore((s) => s.handleCellRightClick);
  const handleCellDoubleClick = useMinesweeperStore((s) => s.handleCellDoubleClick);

  if (!grid || !config) return null;

  const isHitMine = (row: number, col: number) =>
    hitMinePosition !== null && hitMinePosition.row === row && hitMinePosition.col === col;

  const isWrongFlag = (cell: MineCell) =>
    isGameOver && cell.state === 'flagged' && !cell.isMine;

  const isSelected = (row: number, col: number) =>
    selectedCell !== null && selectedCell.row === row && selectedCell.col === col;

  return (
    <div className="mine-grid-container">
      {isPaused && (
        <div className="mine-pause-overlay">
          <span>游戏已暂停</span>
        </div>
      )}
      <div
        className={`mine-grid ${isPaused ? 'mine-grid--paused' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
          gridTemplateRows: `repeat(${config.rows}, 1fr)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <MineCellComponent
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              position={{ row: rowIndex, col: colIndex }}
              isHitMine={isHitMine(rowIndex, colIndex)}
              isWrongFlag={isWrongFlag(cell)}
              isSelected={isSelected(rowIndex, colIndex)}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
              onCellDoubleClick={handleCellDoubleClick}
            />
          )),
        )}
      </div>
    </div>
  );
}
