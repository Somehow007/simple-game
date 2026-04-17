import {
  type GridValue,
  type SudokuGrid,
  type Difficulty,
  type PuzzleData,
  type CellValue,
  GRID_SIZE,
  ALL_VALUES,
} from './types';
import { hasUniqueSolution } from './solver';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

function generateCompleteGrid(): GridValue[][] {
  const grid: GridValue[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0),
  );

  function fillGrid(): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === 0) {
          const nums = shuffleArray(ALL_VALUES);
          for (const num of nums) {
            if (isValidPlacement(grid, row, col, num)) {
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

export function generate(difficulty: Difficulty = 'medium'): PuzzleData {
  const solution = generateCompleteGrid();
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
    if (hasUniqueSolution(puzzle)) {
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

export function generateFromSeed(
  difficulty: Difficulty = 'medium',
  seed: number,
): PuzzleData {
  const random = seededRandom(seed);
  const solution = generateCompleteGridSeeded(random);
  const puzzle = solution.map((row) => [...row]);

  const [minGiven, maxGiven] = DIFFICULTY_GIVEN_RANGE[difficulty];
  const targetGiven =
    Math.floor(random() * (maxGiven - minGiven + 1)) + minGiven;
  const cellsToRemove = GRID_SIZE * GRID_SIZE - targetGiven;

  const positions = Array.from(
    { length: GRID_SIZE * GRID_SIZE },
    (_, i) => ({
      row: Math.floor(i / GRID_SIZE),
      col: i % GRID_SIZE,
    }),
  );
  shuffleArraySeeded(positions, random);

  let removed = 0;
  for (const { row, col } of positions) {
    if (removed >= cellsToRemove) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    if (hasUniqueSolution(puzzle)) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return {
    grid: gridToSudokuGrid(puzzle, solution),
    solution,
    difficulty,
    seed,
  };
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateCompleteGridSeeded(random: () => number): GridValue[][] {
  const grid: GridValue[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0),
  );

  function fillGrid(): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === 0) {
          const nums = shuffleArraySeeded([...ALL_VALUES], random);
          for (const num of nums) {
            if (isValidPlacement(grid, row, col, num)) {
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

function shuffleArraySeeded<T>(array: T[], random: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
