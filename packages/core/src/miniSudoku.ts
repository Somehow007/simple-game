export type MiniGridSize = 4 | 6;

export interface MiniPuzzleData {
  grid: MiniGridCell[][];
  solution: number[][];
  gridSize: MiniGridSize;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MiniGridCell {
  value: number;
  isGiven: boolean;
  note: { candidates: Set<number> };
}

const MINI_VALUES: Record<MiniGridSize, number[]> = {
  4: [1, 2, 3, 4],
  6: [1, 2, 3, 4, 5, 6],
};

const MINI_BOX_SIZE: Record<MiniGridSize, [number, number]> = {
  4: [2, 2],
  6: [2, 3],
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValidPlacement(
  grid: (number | 0)[][],
  row: number,
  col: number,
  num: number,
  gridSize: MiniGridSize,
): boolean {
  for (let c = 0; c < gridSize; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < gridSize; r++) {
    if (grid[r][col] === num) return false;
  }
  const [boxRows, boxCols] = MINI_BOX_SIZE[gridSize];
  const boxRow = Math.floor(row / boxRows) * boxRows;
  const boxCol = Math.floor(col / boxCols) * boxCols;
  for (let r = boxRow; r < boxRow + boxRows; r++) {
    for (let c = boxCol; c < boxCol + boxCols; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function generateCompleteGrid(gridSize: MiniGridSize): number[][] {
  const grid: number[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(0),
  );
  const values = MINI_VALUES[gridSize];

  function fillGrid(): boolean {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === 0) {
          const nums = shuffleArray(values);
          for (const num of nums) {
            if (isValidPlacement(grid, row, col, num, gridSize)) {
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

function countSolutions(
  grid: (number | 0)[][],
  gridSize: MiniGridSize,
  limit = 2,
): number {
  const copy = grid.map((row) => [...row]);
  const values = MINI_VALUES[gridSize];
  let count = 0;

  function backtrack(): boolean {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (copy[r][c] === 0) {
          for (const num of values) {
            if (isValidPlacement(copy, r, c, num, gridSize)) {
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

const DIFFICULTY_REMOVAL: Record<string, Record<MiniGridSize, [number, number]>> = {
  easy: { 4: [4, 6], 6: [8, 12] },
  medium: { 4: [6, 8], 6: [14, 18] },
  hard: { 4: [8, 10], 6: [20, 24] },
};

export function generateMini(
  gridSize: MiniGridSize,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): MiniPuzzleData {
  const solution = generateCompleteGrid(gridSize);
  const puzzle = solution.map((row) => [...row]);

  const [minRemove, maxRemove] = DIFFICULTY_REMOVAL[difficulty][gridSize];
  const toRemove = Math.floor(Math.random() * (maxRemove - minRemove + 1)) + minRemove;

  const positions = shuffleArray(
    Array.from({ length: gridSize * gridSize }, (_, i) => ({
      row: Math.floor(i / gridSize),
      col: i % gridSize,
    })),
  );

  let removed = 0;
  for (const { row, col } of positions) {
    if (removed >= toRemove) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    if (countSolutions(puzzle, gridSize) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return {
    grid: puzzle.map((row) =>
      row.map((val) => ({
        value: val,
        isGiven: val !== 0,
        note: { candidates: new Set<number>() },
      })),
    ),
    solution,
    gridSize,
    difficulty,
  };
}

export function validateMiniGrid(
  grid: MiniGridCell[][],
  gridSize: MiniGridSize,
): { isValid: boolean; isComplete: boolean } {
  const values = MINI_VALUES[gridSize];
  const [boxRows, boxCols] = MINI_BOX_SIZE[gridSize];

  for (let i = 0; i < gridSize; i++) {
    const rowVals = grid[i].map((c) => c.value).filter((v) => v !== 0);
    if (new Set(rowVals).size !== rowVals.length) return { isValid: false, isComplete: false };
    if (rowVals.length === gridSize) {
      const sorted = [...rowVals].sort();
      if (sorted.join(',') !== values.join(',')) return { isValid: false, isComplete: false };
    }

    const colVals = grid.map((r) => r[i].value).filter((v) => v !== 0);
    if (new Set(colVals).size !== colVals.length) return { isValid: false, isComplete: false };
  }

  for (let br = 0; br < gridSize; br += boxRows) {
    for (let bc = 0; bc < gridSize; bc += boxCols) {
      const boxVals: number[] = [];
      for (let r = br; r < br + boxRows; r++) {
        for (let c = bc; c < bc + boxCols; c++) {
          if (grid[r][c].value !== 0) boxVals.push(grid[r][c].value);
        }
      }
      if (new Set(boxVals).size !== boxVals.length) return { isValid: false, isComplete: false };
    }
  }

  let isComplete = true;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c].value === 0) {
        isComplete = false;
        break;
      }
    }
    if (!isComplete) break;
  }

  return { isValid: true, isComplete };
}
