import type { MineGrid, CellPosition } from './types';

export interface HintResult {
  safeCells: CellPosition[];
  mineCells: CellPosition[];
}

export function getHint(grid: MineGrid): HintResult {
  const rows = grid.length;
  const cols = grid[0].length;
  const safeCells: CellPosition[] = [];
  const mineCells: CellPosition[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell.state !== 'revealed' || cell.adjacentMines === 0) continue;

      const hiddenNeighbors: CellPosition[] = [];
      let flaggedCount = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighbor = grid[nr][nc];
            if (neighbor.state === 'flagged') {
              flaggedCount++;
            } else if (neighbor.state === 'hidden' || neighbor.state === 'questioned') {
              hiddenNeighbors.push({ row: nr, col: nc });
            }
          }
        }
      }

      const remainingMines = cell.adjacentMines - flaggedCount;

      if (remainingMines === 0 && hiddenNeighbors.length > 0) {
        for (const pos of hiddenNeighbors) {
          if (!safeCells.some((s) => s.row === pos.row && s.col === pos.col)) {
            safeCells.push(pos);
          }
        }
      }

      if (remainingMines === hiddenNeighbors.length && hiddenNeighbors.length > 0) {
        for (const pos of hiddenNeighbors) {
          if (!mineCells.some((s) => s.row === pos.row && s.col === pos.col)) {
            mineCells.push(pos);
          }
        }
      }
    }
  }

  return { safeCells, mineCells };
}

export function getSafeCellHint(grid: MineGrid): CellPosition | null {
  const { safeCells } = getHint(grid);
  if (safeCells.length > 0) {
    return safeCells[Math.floor(Math.random() * safeCells.length)];
  }

  const safeHiddenCells: CellPosition[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].state === 'hidden' && !grid[r][c].isMine) {
        safeHiddenCells.push({ row: r, col: c });
      }
    }
  }
  if (safeHiddenCells.length > 0) {
    return safeHiddenCells[Math.floor(Math.random() * safeHiddenCells.length)];
  }
  return null;
}
