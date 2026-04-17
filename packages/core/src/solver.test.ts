import { describe, it, expect } from 'vitest';
import { solve, countSolutions, isSolvable, hasUniqueSolution } from './solver';

const COMPLETE_GRID = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const NEARLY_COMPLETE_GRID = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 0, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const MOSTLY_COMPLETE_GRID = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 0, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

describe('solve', () => {
  it('should solve a nearly complete grid', () => {
    const result = solve(NEARLY_COMPLETE_GRID as any);
    expect(result).not.toBeNull();
    expect(result![4][4]).toBe(5);
  });

  it('should solve a mostly complete grid', () => {
    const result = solve(MOSTLY_COMPLETE_GRID as any);
    expect(result).not.toBeNull();
    expect(result![3][2]).toBe(9);
  });

  it('should return null for an unsolvable grid', () => {
    const unsolvable = [
      [1, 2, 3, 4, 5, 6, 7, 8, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    expect(solve(unsolvable as any)).toBeNull();
  });

  it('should not modify the original grid', () => {
    const original = NEARLY_COMPLETE_GRID.map((row) => [...row]);
    solve(NEARLY_COMPLETE_GRID as any);
    expect(NEARLY_COMPLETE_GRID).toEqual(original);
  });
});

describe('countSolutions', () => {
  it('should return 1 for a mostly complete grid', () => {
    expect(countSolutions(MOSTLY_COMPLETE_GRID as any)).toBe(1);
  });

  it('should return 0 for an unsolvable grid', () => {
    const unsolvable = [
      [1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    expect(countSolutions(unsolvable as any)).toBe(0);
  });

  it('should return 1 for a nearly complete grid', () => {
    expect(countSolutions(NEARLY_COMPLETE_GRID as any)).toBe(1);
  });
});

describe('isSolvable', () => {
  it('should return true for a solvable grid', () => {
    expect(isSolvable(MOSTLY_COMPLETE_GRID as any)).toBe(true);
  });

  it('should return false for an unsolvable grid', () => {
    const unsolvable = [
      [1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    expect(isSolvable(unsolvable as any)).toBe(false);
  });
});

describe('hasUniqueSolution', () => {
  it('should return true for a mostly complete grid', () => {
    expect(hasUniqueSolution(MOSTLY_COMPLETE_GRID as any)).toBe(true);
  });

  it('should return true for a complete valid grid', () => {
    expect(hasUniqueSolution(COMPLETE_GRID as any)).toBe(true);
  });

  it('should return true for a nearly complete grid', () => {
    expect(hasUniqueSolution(NEARLY_COMPLETE_GRID as any)).toBe(true);
  });
});
