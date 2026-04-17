import {
  type SudokuGrid,
  type CellPosition,
  type ConflictInfo,
  type ValidationResult,
  GRID_SIZE,
  BOX_SIZE,
} from './types';

export function validate(grid: SudokuGrid): ValidationResult {
  const conflicts = findConflicts(grid);
  const isComplete = checkCompleteness(grid);
  return {
    isValid: conflicts.length === 0,
    isComplete,
    conflicts,
  };
}

export function validateCell(
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

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (r !== row && c !== col && grid[r][c].value === value) {
        conflict.box.push(r * GRID_SIZE + c);
      }
    }
  }

  return conflict;
}

export function findConflicts(grid: SudokuGrid): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].value !== 0) {
        const conflict = validateCell(grid, { row, col });
        if (conflict.row.length > 0 || conflict.col.length > 0 || conflict.box.length > 0) {
          conflicts.push(conflict);
        }
      }
    }
  }
  return conflicts;
}

function checkCompleteness(grid: SudokuGrid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].value === 0) return false;
    }
  }
  return true;
}
