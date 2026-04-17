import { describe, it, expect } from 'vitest';
import { validate, validateCell, findConflicts } from './validator';
import type { SudokuGrid, GridCell } from './types';

function createCell(value: number, isGiven = value !== 0): GridCell {
  return {
    value: value as GridCell['value'],
    isGiven,
    note: { candidates: new Set() },
  };
}

function createGrid(cells: number[][]): SudokuGrid {
  return cells.map((row) => row.map((val) => createCell(val)));
}

const VALID_COMPLETE_GRID = createGrid([
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
]);

const PARTIAL_GRID = createGrid([
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]);

describe('validate', () => {
  it('should validate a complete valid grid', () => {
    const result = validate(VALID_COMPLETE_GRID);
    expect(result.isValid).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.conflicts.length).toBe(0);
  });

  it('should validate a partial grid as valid but incomplete', () => {
    const result = validate(PARTIAL_GRID);
    expect(result.isValid).toBe(true);
    expect(result.isComplete).toBe(false);
  });

  it('should detect row conflicts', () => {
    const grid = createGrid([
      [5, 5, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    const result = validate(grid);
    expect(result.isValid).toBe(false);
  });

  it('should detect column conflicts', () => {
    const grid = createGrid([
      [5, 0, 0, 0, 0, 0, 0, 0, 0],
      [5, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    const result = validate(grid);
    expect(result.isValid).toBe(false);
  });

  it('should detect box conflicts', () => {
    const grid = createGrid([
      [1, 2, 3, 0, 0, 0, 0, 0, 0],
      [4, 5, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    const result = validate(grid);
    expect(result.isValid).toBe(false);
  });
});

describe('validateCell', () => {
  it('should return no conflicts for an empty cell', () => {
    const conflict = validateCell(PARTIAL_GRID, { row: 0, col: 2 });
    expect(conflict.row.length).toBe(0);
    expect(conflict.col.length).toBe(0);
    expect(conflict.box.length).toBe(0);
  });

  it('should return no conflicts for a valid cell', () => {
    const conflict = validateCell(VALID_COMPLETE_GRID, { row: 0, col: 0 });
    expect(conflict.row.length).toBe(0);
    expect(conflict.col.length).toBe(0);
    expect(conflict.box.length).toBe(0);
  });

  it('should detect row conflict for a cell', () => {
    const grid = createGrid([
      [5, 5, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    const conflict = validateCell(grid, { row: 0, col: 0 });
    expect(conflict.row.length).toBeGreaterThan(0);
  });
});

describe('findConflicts', () => {
  it('should return empty array for a valid grid', () => {
    const conflicts = findConflicts(VALID_COMPLETE_GRID);
    expect(conflicts.length).toBe(0);
  });

  it('should return empty array for a partial valid grid', () => {
    const conflicts = findConflicts(PARTIAL_GRID);
    expect(conflicts.length).toBe(0);
  });
});
