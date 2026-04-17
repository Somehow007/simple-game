import { type GridValue, type CellValue, GRID_SIZE, ALL_VALUES } from './types';

function isValidPlacement(
  grid: GridValue[][],
  row: number,
  col: number,
  num: CellValue,
): boolean {
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function findEmpty(grid: GridValue[][]): [number, number] | null {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

export function solve(grid: GridValue[][]): GridValue[][] | null {
  const copy = grid.map((row) => [...row]);
  if (solveInPlace(copy)) {
    return copy;
  }
  return null;
}

function solveInPlace(grid: GridValue[][]): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [row, col] = empty;
  for (const num of ALL_VALUES) {
    if (isValidPlacement(grid, row, col, num)) {
      grid[row][col] = num;
      if (solveInPlace(grid)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

export function countSolutions(grid: GridValue[][], limit = 2): number {
  const copy = grid.map((row) => [...row]);
  let count = 0;
  function backtrack(): boolean {
    const empty = findEmpty(copy);
    if (!empty) {
      count++;
      return count >= limit;
    }
    const [row, col] = empty;
    for (const num of ALL_VALUES) {
      if (isValidPlacement(copy, row, col, num)) {
        copy[row][col] = num;
        if (backtrack()) return true;
        copy[row][col] = 0;
      }
    }
    return false;
  }
  backtrack();
  return count;
}

export function isSolvable(grid: GridValue[][]): boolean {
  return countSolutions(grid) > 0;
}

export function hasUniqueSolution(grid: GridValue[][]): boolean {
  return countSolutions(grid) === 1;
}
