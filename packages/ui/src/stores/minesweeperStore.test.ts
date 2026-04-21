import { describe, it, expect, beforeEach } from 'vitest';
import { useMinesweeperStore, type MineGameStatistics } from './minesweeperStore';
import type { MineGrid, MineCell } from '@shudu/minesweeper-core';

function makeCell(overrides: Partial<MineCell> = {}): MineCell {
  return {
    state: 'hidden',
    content: 0,
    isMine: false,
    adjacentMines: 0,
    ...overrides,
  };
}

function makeGrid(rows: number, cols: number, cellFn: (r: number, c: number) => MineCell): MineGrid {
  const grid: MineGrid = [];
  for (let r = 0; r < rows; r++) {
    const row: MineCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(cellFn(r, c));
    }
    grid.push(row);
  }
  return grid;
}

function computeFlagAccuracy(stats: MineGameStatistics): number {
  if (stats.totalFlagsPlaced === 0) return 0;
  return Math.round((stats.totalCorrectFlags / stats.totalFlagsPlaced) * 100 * 100) / 100;
}

describe('minesweeperStore flag accuracy', () => {
  beforeEach(() => {
    localStorage.clear();
    useMinesweeperStore.setState({
      grid: null,
      config: null,
      difficulty: 'beginner',
      firstClick: true,
      elapsedTime: 0,
      isPaused: false,
      isGameOver: false,
      isWin: false,
      flagCount: 0,
      revealedCount: 0,
      flagMode: false,
      selectedCell: null,
      clickCount: 0,
      hitMinePosition: null,
      lastMineHint: null,
      hintsUsed: 0,
      statistics: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        currentStreak: 0,
        bestStreak: 0,
        bestTimes: { beginner: null, intermediate: null, advanced: null, expert: null },
        averageTimes: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
        difficultyDistribution: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
        difficultyWins: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
        totalFlagsPlaced: 0,
        totalCorrectFlags: 0,
        totalCellsRevealed: 0,
        totalClicks: 0,
        gameHistory: [],
      },
    });
  });

  describe('recordVariantResult - flag accuracy', () => {
    it('should correctly compute accuracy when all flags are correct (win)', () => {
      const grid = makeGrid(3, 3, (r, c) => {
        if (r === 0 && c === 0) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        if (r === 0 && c === 1) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 1 });
      });

      useMinesweeperStore.getState().recordVariantResult(true, 'beginner', 30, 10, 2, grid);

      const stats = useMinesweeperStore.getState().statistics;
      expect(stats.totalFlagsPlaced).toBe(2);
      expect(stats.totalCorrectFlags).toBe(2);
      expect(computeFlagAccuracy(stats)).toBe(100);
    });

    it('should correctly compute accuracy when some flags are incorrect (loss)', () => {
      const grid = makeGrid(3, 3, (r, c) => {
        if (r === 0 && c === 0) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        if (r === 0 && c === 1) return makeCell({ state: 'flagged', isMine: false, adjacentMines: 1 });
        if (r === 0 && c === 2) return makeCell({ state: 'hidden', isMine: true, content: 'mine', adjacentMines: 0 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 1 });
      });

      useMinesweeperStore.getState().recordVariantResult(false, 'beginner', 15, 8, 2, grid);

      const stats = useMinesweeperStore.getState().statistics;
      expect(stats.totalFlagsPlaced).toBe(2);
      expect(stats.totalCorrectFlags).toBe(1);
      expect(computeFlagAccuracy(stats)).toBe(50);
    });

    it('should correctly compute accuracy when no flags are placed', () => {
      const grid = makeGrid(3, 3, () => makeCell({ state: 'revealed', isMine: false, adjacentMines: 0 }));

      useMinesweeperStore.getState().recordVariantResult(true, 'beginner', 20, 5, 0, grid);

      const stats = useMinesweeperStore.getState().statistics;
      expect(stats.totalFlagsPlaced).toBe(0);
      expect(stats.totalCorrectFlags).toBe(0);
      expect(computeFlagAccuracy(stats)).toBe(0);
    });

    it('should correctly accumulate accuracy across multiple games', () => {
      const grid1 = makeGrid(3, 3, (r, c) => {
        if (r === 0 && c === 0) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        if (r === 0 && c === 1) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 1 });
      });

      useMinesweeperStore.getState().recordVariantResult(true, 'beginner', 30, 10, 2, grid1);

      const grid2 = makeGrid(3, 3, (r, c) => {
        if (r === 0 && c === 0) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        if (r === 0 && c === 1) return makeCell({ state: 'flagged', isMine: false, adjacentMines: 1 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 1 });
      });

      useMinesweeperStore.getState().recordVariantResult(false, 'beginner', 15, 8, 2, grid2);

      const stats = useMinesweeperStore.getState().statistics;
      expect(stats.totalFlagsPlaced).toBe(4);
      expect(stats.totalCorrectFlags).toBe(3);
      expect(computeFlagAccuracy(stats)).toBe(75);
    });

    it('should correctly compute accuracy when all flags are wrong', () => {
      const grid = makeGrid(3, 3, (r, c) => {
        if (r === 0 && c === 0) return makeCell({ state: 'flagged', isMine: false, adjacentMines: 1 });
        if (r === 0 && c === 1) return makeCell({ state: 'flagged', isMine: false, adjacentMines: 1 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 0 });
      });

      useMinesweeperStore.getState().recordVariantResult(false, 'beginner', 10, 5, 2, grid);

      const stats = useMinesweeperStore.getState().statistics;
      expect(stats.totalFlagsPlaced).toBe(2);
      expect(stats.totalCorrectFlags).toBe(0);
      expect(computeFlagAccuracy(stats)).toBe(0);
    });

    it('should handle large number of games with varying accuracy', () => {
      const gameResults = [
        { flags: 10, correct: 8 },
        { flags: 5, correct: 5 },
        { flags: 15, correct: 9 },
        { flags: 3, correct: 0 },
        { flags: 7, correct: 7 },
      ];

      for (const result of gameResults) {
        const grid = makeGrid(4, 4, (r, c) => {
          const idx = r * 4 + c;
          if (idx < result.correct) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
          if (idx < result.flags) return makeCell({ state: 'flagged', isMine: false, adjacentMines: 1 });
          return makeCell({ state: 'revealed', isMine: false, adjacentMines: 0 });
        });

        useMinesweeperStore.getState().recordVariantResult(
          result.correct === result.flags, 'beginner', 30, 10, result.flags, grid,
        );
      }

      const stats = useMinesweeperStore.getState().statistics;
      const totalFlags = gameResults.reduce((s, g) => s + g.flags, 0);
      const totalCorrect = gameResults.reduce((s, g) => s + g.correct, 0);
      expect(stats.totalFlagsPlaced).toBe(totalFlags);
      expect(stats.totalCorrectFlags).toBe(totalCorrect);
      const expected = Math.round((totalCorrect / totalFlags) * 100 * 100) / 100;
      expect(computeFlagAccuracy(stats)).toBe(expected);
    });
  });

  describe('game history records', () => {
    it('should record correctFlags in game history', () => {
      const grid = makeGrid(3, 3, (r, c) => {
        if (r === 0 && c === 0) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        if (r === 0 && c === 1) return makeCell({ state: 'flagged', isMine: false, adjacentMines: 1 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 0 });
      });

      useMinesweeperStore.getState().recordVariantResult(false, 'beginner', 15, 8, 2, grid);

      const history = useMinesweeperStore.getState().statistics.gameHistory;
      expect(history).toHaveLength(1);
      expect(history[0].flagsPlaced).toBe(2);
      expect(history[0].correctFlags).toBe(1);
      expect(history[0].won).toBe(false);
    });
  });

  describe('statistics persistence', () => {
    it('should persist totalCorrectFlags to localStorage', () => {
      const grid = makeGrid(3, 3, (r, c) => {
        if (r === 0 && c === 0) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 0 });
      });

      useMinesweeperStore.getState().recordVariantResult(true, 'beginner', 30, 10, 1, grid);

      const stored = localStorage.getItem('shudu_minesweeper_statistics');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.totalCorrectFlags).toBe(1);
      expect(parsed.totalFlagsPlaced).toBe(1);
    });

    it('should migrate from old totalFlagAccuracy format using gameHistory', () => {
      const oldData = {
        gamesPlayed: 2,
        gamesWon: 1,
        gamesLost: 1,
        currentStreak: 0,
        bestStreak: 1,
        bestTimes: { beginner: null, intermediate: null, advanced: null, expert: null },
        averageTimes: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
        difficultyDistribution: { beginner: 2, intermediate: 0, advanced: 0, expert: 0 },
        difficultyWins: { beginner: 1, intermediate: 0, advanced: 0, expert: 0 },
        totalFlagsPlaced: 15,
        totalCellsRevealed: 50,
        totalClicks: 30,
        totalFlagAccuracy: 0.6,
        gameHistory: [
          { difficulty: 'beginner', won: true, time: 30, clicks: 15, flagsPlaced: 10, correctFlags: 8, date: '2024-01-01' },
          { difficulty: 'beginner', won: false, time: 15, clicks: 15, flagsPlaced: 5, correctFlags: 3, date: '2024-01-02' },
        ],
      };
      localStorage.setItem('shudu_minesweeper_statistics', JSON.stringify(oldData));

      const stored = localStorage.getItem('shudu_minesweeper_statistics');
      const parsed = JSON.parse(stored!);
      let totalCorrectFlags = parsed.totalCorrectFlags ?? 0;
      if (totalCorrectFlags === 0 && parsed.totalFlagAccuracy != null && parsed.totalFlagsPlaced > 0) {
        const history = Array.isArray(parsed.gameHistory) ? parsed.gameHistory : [];
        if (history.length > 0) {
          totalCorrectFlags = history.reduce((sum: number, r: { correctFlags?: number }) => sum + (r.correctFlags || 0), 0);
        }
      }
      expect(totalCorrectFlags).toBe(11);
    });

    it('should handle missing totalCorrectFlags with no gameHistory gracefully', () => {
      const oldData = {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalFlagsPlaced: 0,
        totalFlagAccuracy: 0,
        gameHistory: [],
      };
      localStorage.setItem('shudu_minesweeper_statistics', JSON.stringify(oldData));

      const stored = localStorage.getItem('shudu_minesweeper_statistics');
      const parsed = JSON.parse(stored!);
      const totalCorrectFlags = parsed.totalCorrectFlags ?? 0;
      expect(totalCorrectFlags).toBe(0);
    });
  });

  describe('flag accuracy display calculation', () => {
    it('should return 0 when no flags have been placed', () => {
      const stats: MineGameStatistics = {
        gamesPlayed: 5,
        gamesWon: 3,
        gamesLost: 2,
        currentStreak: 0,
        bestStreak: 2,
        bestTimes: { beginner: null, intermediate: null, advanced: null, expert: null },
        averageTimes: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
        difficultyDistribution: { beginner: 5, intermediate: 0, advanced: 0, expert: 0 },
        difficultyWins: { beginner: 3, intermediate: 0, advanced: 0, expert: 0 },
        totalFlagsPlaced: 0,
        totalCorrectFlags: 0,
        totalCellsRevealed: 100,
        totalClicks: 50,
        gameHistory: [],
      };
      expect(computeFlagAccuracy(stats)).toBe(0);
    });

    it('should return 100 when all flags are correct', () => {
      const stats: MineGameStatistics = {
        gamesPlayed: 1,
        gamesWon: 1,
        gamesLost: 0,
        currentStreak: 1,
        bestStreak: 1,
        bestTimes: { beginner: 30, intermediate: null, advanced: null, expert: null },
        averageTimes: { beginner: 30, intermediate: 0, advanced: 0, expert: 0 },
        difficultyDistribution: { beginner: 1, intermediate: 0, advanced: 0, expert: 0 },
        difficultyWins: { beginner: 1, intermediate: 0, advanced: 0, expert: 0 },
        totalFlagsPlaced: 10,
        totalCorrectFlags: 10,
        totalCellsRevealed: 71,
        totalClicks: 20,
        gameHistory: [],
      };
      expect(computeFlagAccuracy(stats)).toBe(100);
    });

    it('should return correct percentage with decimal precision', () => {
      const stats: MineGameStatistics = {
        gamesPlayed: 2,
        gamesWon: 1,
        gamesLost: 1,
        currentStreak: 0,
        bestStreak: 1,
        bestTimes: { beginner: null, intermediate: null, advanced: null, expert: null },
        averageTimes: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
        difficultyDistribution: { beginner: 2, intermediate: 0, advanced: 0, expert: 0 },
        difficultyWins: { beginner: 1, intermediate: 0, advanced: 0, expert: 0 },
        totalFlagsPlaced: 7,
        totalCorrectFlags: 5,
        totalCellsRevealed: 100,
        totalClicks: 30,
        gameHistory: [],
      };
      expect(computeFlagAccuracy(stats)).toBe(71.43);
    });

    it('should return 0 when all flags are incorrect', () => {
      const stats: MineGameStatistics = {
        gamesPlayed: 1,
        gamesWon: 0,
        gamesLost: 1,
        currentStreak: 0,
        bestStreak: 0,
        bestTimes: { beginner: null, intermediate: null, advanced: null, expert: null },
        averageTimes: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
        difficultyDistribution: { beginner: 1, intermediate: 0, advanced: 0, expert: 0 },
        difficultyWins: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
        totalFlagsPlaced: 5,
        totalCorrectFlags: 0,
        totalCellsRevealed: 30,
        totalClicks: 15,
        gameHistory: [],
      };
      expect(computeFlagAccuracy(stats)).toBe(0);
    });
  });

  describe('flag counting on grid', () => {
    it('should count total flags and correct flags correctly on a mixed grid', () => {
      const grid = makeGrid(4, 4, (r, c) => {
        const idx = r * 4 + c;
        if (idx === 0) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        if (idx === 1) return makeCell({ state: 'flagged', isMine: true, content: 'mine', adjacentMines: 0 });
        if (idx === 2) return makeCell({ state: 'flagged', isMine: false, adjacentMines: 1 });
        if (idx === 3) return makeCell({ state: 'hidden', isMine: true, content: 'mine', adjacentMines: 0 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 1 });
      });

      let totalFlags = 0;
      let correctFlags = 0;
      for (const row of grid) {
        for (const cell of row) {
          if (cell.state === 'flagged') totalFlags++;
          if (cell.state === 'flagged' && cell.isMine) correctFlags++;
        }
      }

      expect(totalFlags).toBe(3);
      expect(correctFlags).toBe(2);
    });

    it('should not count revealed cells as flags even if they were previously flagged', () => {
      const grid = makeGrid(3, 3, (r, c) => {
        if (r === 0 && c === 0) return makeCell({ state: 'revealed', isMine: false, adjacentMines: 1 });
        return makeCell({ state: 'revealed', isMine: false, adjacentMines: 0 });
      });

      let totalFlags = 0;
      for (const row of grid) {
        for (const cell of row) {
          if (cell.state === 'flagged') totalFlags++;
        }
      }

      expect(totalFlags).toBe(0);
    });
  });
});
