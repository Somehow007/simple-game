import { create } from 'zustand';
import {
  type MineGrid,
  type MineDifficulty,
  type MinefieldConfig,
  type CellPosition,
  DIFFICULTY_CONFIGS,
} from '@shudu/minesweeper-core';
import {
  createEmptyGrid,
  generateMinefield,
  floodFill,
  chordReveal,
  checkWin,
  revealAllMines,
} from '@shudu/minesweeper-core';
import { useMinesweeperStore } from './minesweeperStore';

export type MineVariant = 'standard' | 'timed' | 'blind';

export interface TimedConfig {
  timeLimit: number;
}

export const TIMED_CONFIGS: Record<MineDifficulty, TimedConfig> = {
  beginner: { timeLimit: 60 },
  intermediate: { timeLimit: 300 },
  advanced: { timeLimit: 600 },
  expert: { timeLimit: 900 },
};

interface MineVariantStore {
  variant: MineVariant;
  grid: MineGrid | null;
  config: MinefieldConfig | null;
  difficulty: MineDifficulty;
  firstClick: boolean;
  elapsedTime: number;
  isPaused: boolean;
  isGameOver: boolean;
  isWin: boolean;
  flagCount: number;
  revealedCount: number;
  flagMode: boolean;
  selectedCell: CellPosition | null;
  clickCount: number;
  hitMinePosition: CellPosition | null;
  timeLimit: number;
  timeRemaining: number;

  newGame: (difficulty: MineDifficulty, variant: MineVariant) => void;
  handleCellClick: (position: CellPosition) => void;
  handleCellRightClick: (position: CellPosition) => void;
  handleCellDoubleClick: (position: CellPosition) => void;
  toggleFlagMode: () => void;
  togglePause: () => void;
  setElapsedTime: (time: number) => void;
  resetGame: () => void;
  selectCell: (position: CellPosition) => void;
  isBlindMode: () => boolean;
  isTimedMode: () => boolean;
  getDisplayGrid: () => MineGrid | null;
}

function countFlagsOnGrid(grid: MineGrid): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.state === 'flagged') count++;
    }
  }
  return count;
}

export const useMineVariantStore = create<MineVariantStore>((set, get) => ({
  variant: 'standard',
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
  timeLimit: 0,
  timeRemaining: 0,

  newGame: (difficulty, variant) => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const grid = createEmptyGrid(config.rows, config.cols);
    const timeLimit = variant === 'timed' ? TIMED_CONFIGS[difficulty].timeLimit : 0;
    set({
      variant,
      grid,
      config,
      difficulty,
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
      timeLimit,
      timeRemaining: timeLimit,
    });
  },

  handleCellClick: (position) => {
    const state = get();
    const { grid, config, firstClick, isGameOver, isPaused, flagMode } = state;
    if (!grid || !config || isGameOver || isPaused) return;

    const { row, col } = position;
    const cell = grid[row][col];

    if (cell.state === 'revealed') return;

    if (flagMode) {
      get().handleCellRightClick(position);
      return;
    }

    if (cell.state === 'flagged') return;

    set((s) => ({ clickCount: s.clickCount + 1, selectedCell: position }));

    let workingGrid: MineGrid;

    if (firstClick) {
      workingGrid = generateMinefield(config, position);
      set({ grid: workingGrid, firstClick: false });
    } else {
      workingGrid = grid.map((r) => r.map((c) => ({ ...c })));
    }

    const targetCell = workingGrid[row][col];

    if (targetCell.isMine) {
      targetCell.state = 'revealed';
      const revealedGrid = revealAllMines(workingGrid);
      const finalFlagCount = countFlagsOnGrid(revealedGrid);
      useMinesweeperStore.getState().recordVariantResult(
        false, get().difficulty, get().elapsedTime, get().clickCount, finalFlagCount, revealedGrid,
      );
      set({
        grid: revealedGrid,
        isGameOver: true,
        isWin: false,
        hitMinePosition: position,
        flagCount: finalFlagCount,
      });
      return;
    }

    const revealed = floodFill(workingGrid, row, col);
    const newRevealedCount = get().revealedCount + revealed.length;

    set({
      grid: workingGrid,
      revealedCount: newRevealedCount,
    });

    if (checkWin(workingGrid)) {
      useMinesweeperStore.getState().recordVariantResult(
        true, get().difficulty, get().elapsedTime, get().clickCount, get().flagCount, workingGrid,
      );
      set({
        isGameOver: true,
        isWin: true,
      });
    }
  },

  handleCellRightClick: (position) => {
    const { grid, isGameOver, isPaused } = get();
    if (!grid || isGameOver || isPaused) return;

    const { row, col } = position;
    const cell = grid[row][col];
    if (cell.state === 'revealed') return;

    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    const targetCell = newGrid[row][col];

    if (targetCell.state === 'hidden') {
      targetCell.state = 'flagged';
    } else if (targetCell.state === 'flagged') {
      targetCell.state = 'hidden';
    }

    const newFlagCount = countFlagsOnGrid(newGrid);
    set({
      grid: newGrid,
      flagCount: newFlagCount,
      selectedCell: position,
      clickCount: get().clickCount + 1,
    });
  },

  handleCellDoubleClick: (position) => {
    const { grid, isGameOver, isPaused } = get();
    if (!grid || isGameOver || isPaused) return;

    const { row, col } = position;
    const cell = grid[row][col];
    if (cell.state !== 'revealed' || cell.adjacentMines === 0) return;

    set((s) => ({ clickCount: s.clickCount + 1 }));

    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    const { hitMine } = chordReveal(newGrid, row, col);

    if (hitMine) {
      const revealedGrid = revealAllMines(newGrid);
      const finalFlagCount = countFlagsOnGrid(revealedGrid);
      useMinesweeperStore.getState().recordVariantResult(
        false, get().difficulty, get().elapsedTime, get().clickCount, finalFlagCount, revealedGrid,
      );
      set({
        grid: revealedGrid,
        isGameOver: true,
        isWin: false,
        hitMinePosition: null,
        flagCount: finalFlagCount,
      });
    } else {
      const newRevealedCount = get().revealedCount + 0;
      set({ grid: newGrid, revealedCount: newRevealedCount });

      if (checkWin(newGrid)) {
        useMinesweeperStore.getState().recordVariantResult(
          true, get().difficulty, get().elapsedTime, get().clickCount, get().flagCount, newGrid,
        );
        set({
          isGameOver: true,
          isWin: true,
        });
      }
    }
  },

  toggleFlagMode: () => {
    set((state) => ({ flagMode: !state.flagMode }));
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  setElapsedTime: (time) => {
    const { variant, timeLimit, grid, isGameOver } = get();
    if (variant === 'timed') {
      const remaining = Math.max(0, timeLimit - time);
      const timedOut = remaining <= 0 && !isGameOver;
      if (timedOut && grid) {
        const finalFlagCount = countFlagsOnGrid(grid);
        useMinesweeperStore.getState().recordVariantResult(
          false, get().difficulty, time, get().clickCount, finalFlagCount, grid,
        );
      }
      set({
        elapsedTime: time,
        timeRemaining: remaining,
        isGameOver: timedOut ? true : isGameOver,
        isWin: timedOut ? false : get().isWin,
      });
    } else {
      set({ elapsedTime: time });
    }
  },

  resetGame: () => {
    set({
      grid: null,
      config: null,
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
      timeRemaining: 0,
    });
  },

  selectCell: (position) => {
    set({ selectedCell: position });
  },

  isBlindMode: () => get().variant === 'blind',

  isTimedMode: () => get().variant === 'timed',

  getDisplayGrid: () => {
    const { grid, variant } = get();
    if (!grid) return null;
    if (variant !== 'blind') return grid;

    return grid.map((row) =>
      row.map((cell) => {
        if (cell.state === 'revealed' && !cell.isMine) {
          return {
            ...cell,
            adjacentMines: 0,
            content: 0,
          };
        }
        return cell;
      }),
    );
  },
}));
