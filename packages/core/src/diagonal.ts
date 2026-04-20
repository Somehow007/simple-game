import {
  type GridValue,
  type SudokuGrid,
  type Difficulty,
  type PuzzleData,
  type CellValue,
  type CellPosition,
  type ConflictInfo,
  type ValidationResult,
  GRID_SIZE,
  ALL_VALUES,
} from './types';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValidPlacementDiagonal(
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
  if (row === col) {
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[i][i] === num) return false;
    }
  }
  if (row + col === GRID_SIZE - 1) {
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[i][GRID_SIZE - 1 - i] === num) return false;
    }
  }
  return true;
}

function generateCompleteGridDiagonal(): GridValue[][] {
  const grid: GridValue[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0),
  );

  function fillGrid(): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === 0) {
          const nums = shuffleArray(ALL_VALUES);
          for (const num of nums) {
            if (isValidPlacementDiagonal(grid, row, col, num)) {
              grid[row][col] = num;
              if (fillGrid()) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillGrid();
  return grid;
}

function countSolutionsDiagonal(grid: GridValue[][], limit = 2): number {
  const copy = grid.map((row) => [...row]);
  let count = 0;

  function backtrack(): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (copy[r][c] === 0) {
          for (const num of ALL_VALUES) {
            if (isValidPlacementDiagonal(copy, r, c, num)) {
              copy[r][c] = num;
              if (backtrack()) return true;
              copy[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    count++;
    return count >= limit;
  }

  backtrack();
  return count;
}

const DIFFICULTY_GIVEN_RANGE: Record<Difficulty, [number, number]> = {
  easy: [36, 45],
  medium: [30, 35],
  hard: [27, 29],
  expert: [22, 26],
};

function gridToSudokuGrid(puzzle: GridValue[][], _solution: GridValue[][]): SudokuGrid {
  return puzzle.map((row) =>
    row.map((val) => ({
      value: val,
      isGiven: val !== 0,
      note: { candidates: new Set<CellValue>() },
    })),
  );
}

export function generateDiagonal(difficulty: Difficulty = 'medium'): PuzzleData {
  const solution = generateCompleteGridDiagonal();
  const puzzle = solution.map((row) => [...row]);

  const [minGiven, maxGiven] = DIFFICULTY_GIVEN_RANGE[difficulty];
  const targetGiven =
    Math.floor(Math.random() * (maxGiven - minGiven + 1)) + minGiven;
  const cellsToRemove = GRID_SIZE * GRID_SIZE - targetGiven;

  const positions = shuffleArray(
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
      row: Math.floor(i / GRID_SIZE),
      col: i % GRID_SIZE,
    })),
  );

  let removed = 0;
  for (const { row, col } of positions) {
    if (removed >= cellsToRemove) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    if (countSolutionsDiagonal(puzzle) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return {
    grid: gridToSudokuGrid(puzzle, solution),
    solution,
    difficulty,
  };
}

export function validateDiagonalCell(
  grid: SudokuGrid,
  position: CellPosition,
): ConflictInfo {
  const { row, col } = position;
  const value = grid[row][col].value;
  const conflict: ConflictInfo = { row: [], col: [], box: [] };

  if (value === 0) return conflict;

  for (let c = 0; c < GRID_SIZE; c++) {
    if (c !== col && grid[row][c].value === value) {
      conflict.row.push(c);
    }
  }
  for (let r = 0; r < GRID_SIZE; r++) {
    if (r !== row && grid[r][col].value === value) {
      conflict.col.push(r);
    }
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col && grid[r][c].value === value) {
        conflict.box.push(r * GRID_SIZE + c);
      }
    }
  }

  return conflict;
}

export function findDiagonalConflicts(grid: SudokuGrid): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].value !== 0) {
        const conflict = validateDiagonalCell(grid, { row, col });
        if (conflict.row.length > 0 || conflict.col.length > 0 || conflict.box.length > 0) {
          conflicts.push(conflict);
        }
      }
    }
  }
  return conflicts;
}

export function validateDiagonal(grid: SudokuGrid): ValidationResult {
  const conflicts = findDiagonalConflicts(grid);
  let isComplete = true;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].value === 0) {
        isComplete = false;
        break;
      }
    }
    if (!isComplete) break;
  }

  const diagonalConflicts = checkDiagonalConflicts(grid);
  const allConflicts = [...conflicts, ...diagonalConflicts];

  return {
    isValid: allConflicts.length === 0,
    isComplete,
    conflicts: allConflicts,
  };
}

function checkDiagonalConflicts(grid: SudokuGrid): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  const mainDiag = new Map<number, CellPosition[]>();
  const antiDiag = new Map<number, CellPosition[]>();

  for (let i = 0; i < GRID_SIZE; i++) {
    const mainVal = grid[i][i].value;
    if (mainVal !== 0) {
      if (!mainDiag.has(mainVal)) mainDiag.set(mainVal, []);
      mainDiag.get(mainVal)!.push({ row: i, col: i });
    }
    const antiVal = grid[i][GRID_SIZE - 1 - i].value;
    if (antiVal !== 0) {
      if (!antiDiag.has(antiVal)) antiDiag.set(antiVal, []);
      antiDiag.get(antiVal)!.push({ row: i, col: GRID_SIZE - 1 - i });
    }
  }

  for (const [, positions] of mainDiag) {
    if (positions.length > 1) {
      for (const pos of positions) {
        conflicts.push({ row: [], col: [], box: [pos.row * GRID_SIZE + pos.col] });
      }
    }
  }
  for (const [, positions] of antiDiag) {
    if (positions.length > 1) {
      for (const pos of positions) {
        conflicts.push({ row: [], col: [], box: [pos.row * GRID_SIZE + pos.col] });
      }
    }
  }

  return conflicts;
}
