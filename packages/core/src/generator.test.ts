import { describe, it, expect } from 'vitest';
import { generate, generateFromSeed } from './generator';
import { hasUniqueSolution } from './solver';
import type { GridValue } from './types';

describe('generate', () => {
  it('should generate a puzzle with a unique solution', () => {
    const puzzle = generate('easy');
    const flatGrid: GridValue[][] = puzzle.grid.map((row) =>
      row.map((cell) => cell.value),
    );
    expect(hasUniqueSolution(flatGrid)).toBe(true);
  });

  it('should generate puzzles for all difficulty levels', () => {
    const difficulties = ['easy', 'medium', 'hard', 'expert'] as const;
    for (const difficulty of difficulties) {
      const puzzle = generate(difficulty);
      expect(puzzle.difficulty).toBe(difficulty);
      expect(puzzle.solution).toBeDefined();
      expect(puzzle.solution.length).toBe(9);
    }
  });

  it('should generate a puzzle with the correct grid structure', () => {
    const puzzle = generate('easy');
    expect(puzzle.grid.length).toBe(9);
    for (const row of puzzle.grid) {
      expect(row.length).toBe(9);
      for (const cell of row) {
        expect(cell.value).toBeGreaterThanOrEqual(0);
        expect(cell.value).toBeLessThanOrEqual(9);
        if (cell.value !== 0) {
          expect(cell.isGiven).toBe(true);
        }
      }
    }
  });

  it('should generate different puzzles on successive calls', () => {
    const puzzle1 = generate('easy');
    const puzzle2 = generate('easy');
    const grid1 = puzzle1.grid.map((row) => row.map((cell) => cell.value));
    const grid2 = puzzle2.grid.map((row) => row.map((cell) => cell.value));
    let isDifferent = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid1[r][c] !== grid2[r][c]) {
          isDifferent = true;
          break;
        }
      }
      if (isDifferent) break;
    }
    expect(isDifferent).toBe(true);
  });

  it('should have a valid solution', () => {
    const puzzle = generate('medium');
    const solution = puzzle.solution;
    for (let row = 0; row < 9; row++) {
      const rowSet = new Set(solution[row]);
      expect(rowSet.size).toBe(9);
    }
    for (let col = 0; col < 9; col++) {
      const colSet = new Set(solution.map((row) => row[col]));
      expect(colSet.size).toBe(9);
    }
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxValues: number[] = [];
        for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
          for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
            boxValues.push(solution[r][c]);
          }
        }
        expect(new Set(boxValues).size).toBe(9);
      }
    }
  });
});

describe('generateFromSeed', () => {
  it('should generate the same puzzle for the same seed', () => {
    const puzzle1 = generateFromSeed('easy', 12345);
    const puzzle2 = generateFromSeed('easy', 12345);
    const grid1 = puzzle1.grid.map((row) => row.map((cell) => cell.value));
    const grid2 = puzzle2.grid.map((row) => row.map((cell) => cell.value));
    expect(grid1).toEqual(grid2);
  });

  it('should generate different puzzles for different seeds', () => {
    const puzzle1 = generateFromSeed('easy', 12345);
    const puzzle2 = generateFromSeed('easy', 54321);
    const grid1 = puzzle1.grid.map((row) => row.map((cell) => cell.value));
    const grid2 = puzzle2.grid.map((row) => row.map((cell) => cell.value));
    let isDifferent = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid1[r][c] !== grid2[r][c]) {
          isDifferent = true;
          break;
        }
      }
      if (isDifferent) break;
    }
    expect(isDifferent).toBe(true);
  });

  it('should include the seed in the result', () => {
    const puzzle = generateFromSeed('medium', 42);
    expect(puzzle.seed).toBe(42);
  });
});
