import { create } from 'zustand';
import {
  type MineGrid,
  type MineDifficulty,
  type MinefieldConfig,
  type CellPosition,
  type MineCell,
  DIFFICULTY_CONFIGS,
} from '@shudu/minesweeper-core';
import {
  createEmptyGrid,
  generateMinefield,
  floodFill,
  chordReveal,
  checkWin,
  revealAllMines,
  getSafeCellHint,
  getLogicalMineHint,
  type MineHintDetail,
} from '@shudu/minesweeper-core';
import { STORAGE_KEYS, type ThemeOption } from '@shudu/shared';

export interface MineGameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  currentStreak: number;
  bestStreak: number;
  bestTimes: Record<MineDifficulty, number | null>;
  averageTimes: Record<MineDifficulty, number>;
  difficultyDistribution: Record<MineDifficulty, number>;
  difficultyWins: Record<MineDifficulty, number>;
  totalFlagsPlaced: number;
  totalCorrectFlags: number;
  totalCellsRevealed: number;
  totalClicks: number;
  gameHistory: MineGameRecord[];
}

export interface MineGameRecord {
  difficulty: MineDifficulty;
  won: boolean;
  time: number;
  clicks: number;
  flagsPlaced: number;
  correctFlags: number;
  date: string;
}

export interface MineGameSettings {
  theme: ThemeOption;
  flagMode: boolean;
  showTimer: boolean;
  questionMarkEnabled: boolean;
  soundEnabled: boolean;
}

interface SavedMineGameState {
  grid: { state: MineCell['state']; isMine: boolean; adjacentMines: number }[][];
  config: MinefieldConfig;
  difficulty: MineDifficulty;
  firstClick: boolean;
  elapsedTime: number;
  isGameOver: boolean;
  isWin: boolean;
  flagCount: number;
  revealedCount: number;
  flagMode: boolean;
  clickCount: number;
  hitMinePosition: CellPosition | null;
}

interface MinesweeperStore {
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
  settings: MineGameSettings;
  statistics: MineGameStatistics;
  hitMinePosition: CellPosition | null;
  lastMineHint: MineHintDetail | null;
  hintsUsed: number;

  newGame: (difficulty?: MineDifficulty) => void;
  handleCellClick: (position: CellPosition) => void;
  handleCellRightClick: (position: CellPosition) => void;
  handleCellDoubleClick: (position: CellPosition) => void;
  toggleFlagMode: () => void;
  togglePause: () => void;
  setElapsedTime: (time: number) => void;
  getHint: () => void;
  updateSettings: (settings: Partial<MineGameSettings>) => void;
  resetGame: () => void;
  selectCell: (position: CellPosition) => void;
  hasSavedGame: () => boolean;
  resumeGame: () => boolean;
  clearSavedGame: () => void;
  recordVariantResult: (isWin: boolean, difficulty: MineDifficulty, elapsedTime: number, clickCount: number, flagCount: number, grid: MineGrid) => void;
}

const DEFAULT_SETTINGS: MineGameSettings = {
  theme: 'light',
  flagMode: false,
  showTimer: true,
  questionMarkEnabled: true,
  soundEnabled: true,
};

const MAX_HISTORY = 50;

const DEFAULT_STATISTICS: MineGameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestTimes: {
    beginner: null,
    intermediate: null,
    advanced: null,
    expert: null,
  },
  averageTimes: {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  },
  difficultyDistribution: {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  },
  difficultyWins: {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  },
  totalFlagsPlaced: 0,
  totalCorrectFlags: 0,
  totalCellsRevealed: 0,
  totalClicks: 0,
  gameHistory: [],
};

function loadSettings(): MineGameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MINESWEEPER_SETTINGS);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function loadStatistics(): MineGameStatistics {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MINESWEEPER_STATISTICS);
    if (stored) {
      const parsed = JSON.parse(stored);
      let totalCorrectFlags = parsed.totalCorrectFlags ?? 0;
      if (totalCorrectFlags === 0 && parsed.totalFlagAccuracy != null && parsed.totalFlagsPlaced > 0) {
        const history: MineGameRecord[] = Array.isArray(parsed.gameHistory) ? parsed.gameHistory : [];
        if (history.length > 0) {
          totalCorrectFlags = history.reduce((sum: number, r: MineGameRecord) => sum + (r.correctFlags || 0), 0);
        }
      }
      return {
        ...DEFAULT_STATISTICS,
        ...parsed,
        totalCorrectFlags,
        averageTimes: { ...DEFAULT_STATISTICS.averageTimes, ...(parsed.averageTimes || {}) },
        difficultyWins: { ...DEFAULT_STATISTICS.difficultyWins, ...(parsed.difficultyWins || {}) },
        gameHistory: Array.isArray(parsed.gameHistory) ? parsed.gameHistory.slice(-MAX_HISTORY) : [],
      };
    }
  } catch {}
  return DEFAULT_STATISTICS;
}

function saveSettings(settings: MineGameSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.MINESWEEPER_SETTINGS, JSON.stringify(settings));
  } catch {}
}

function saveStatistics(statistics: MineGameStatistics) {
  try {
    const toSave = {
      ...statistics,
      gameHistory: statistics.gameHistory.slice(-MAX_HISTORY),
    };
    localStorage.setItem(STORAGE_KEYS.MINESWEEPER_STATISTICS, JSON.stringify(toSave));
  } catch {}
}

function serializeMineGrid(grid: MineGrid): SavedMineGameState['grid'] {
  return grid.map((row) =>
    row.map((cell) => ({
      state: cell.state,
      isMine: cell.isMine,
      adjacentMines: cell.adjacentMines,
    })),
  );
}

function deserializeMineGrid(serialized: SavedMineGameState['grid']): MineGrid {
  return serialized.map((row) =>
    row.map((cell) => ({
      state: cell.state,
      content: cell.isMine ? 'mine' as const : cell.adjacentMines,
      isMine: cell.isMine,
      adjacentMines: cell.adjacentMines,
    })),
  );
}

function saveMineGameState(state: MinesweeperStore) {
  try {
    if (!state.grid || !state.config) {
      localStorage.removeItem(STORAGE_KEYS.MINESWEEPER_SAVED_GAME);
      return;
    }
    if (state.isGameOver || state.firstClick) {
      localStorage.removeItem(STORAGE_KEYS.MINESWEEPER_SAVED_GAME);
      return;
    }
    const saved: SavedMineGameState = {
      grid: serializeMineGrid(state.grid),
      config: state.config,
      difficulty: state.difficulty,
      firstClick: state.firstClick,
      elapsedTime: state.elapsedTime,
      isGameOver: state.isGameOver,
      isWin: state.isWin,
      flagCount: state.flagCount,
      revealedCount: state.revealedCount,
      flagMode: state.flagMode,
      clickCount: state.clickCount,
      hitMinePosition: state.hitMinePosition,
    };
    localStorage.setItem(STORAGE_KEYS.MINESWEEPER_SAVED_GAME, JSON.stringify(saved));
  } catch {}
}

function loadSavedMineGame(): SavedMineGameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MINESWEEPER_SAVED_GAME);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.grid && parsed.config && !parsed.isGameOver && !parsed.firstClick) {
        return parsed;
      }
    }
  } catch {}
  return null;
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

function countCorrectFlagsOnGrid(grid: MineGrid): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.state === 'flagged' && cell.isMine) count++;
    }
  }
  return count;
}

function recordLoss(
  set: (partial: Partial<MinesweeperStore> | ((s: MinesweeperStore) => Partial<MinesweeperStore>)) => void,
  get: () => MinesweeperStore,
  grid: MineGrid,
  hitMinePosition: CellPosition | null,
  totalFlags: number,
  correctFlags: number,
) {
  const stats = { ...get().statistics };
  stats.gamesPlayed++;
  stats.gamesLost++;
  stats.currentStreak = 0;
  stats.difficultyDistribution[get().difficulty]++;
  stats.totalClicks += get().clickCount;
  stats.totalFlagsPlaced += totalFlags;
  stats.totalCorrectFlags += correctFlags;
  const record: MineGameRecord = {
    difficulty: get().difficulty,
    won: false,
    time: get().elapsedTime,
    clicks: get().clickCount,
    flagsPlaced: totalFlags,
    correctFlags,
    date: new Date().toISOString(),
  };
  stats.gameHistory = [...stats.gameHistory, record].slice(-MAX_HISTORY);
  set({
    grid,
    isGameOver: true,
    isWin: false,
    hitMinePosition,
    flagCount: countFlagsOnGrid(grid),
    statistics: stats,
  });
  saveStatistics(stats);
}

function recordWin(
  set: (partial: Partial<MinesweeperStore> | ((s: MinesweeperStore) => Partial<MinesweeperStore>)) => void,
  get: () => MinesweeperStore,
  grid: MineGrid,
  revealedCount: number,
) {
  const stats = { ...get().statistics };
  stats.gamesPlayed++;
  stats.gamesWon++;
  stats.currentStreak++;
  if (stats.currentStreak > stats.bestStreak) {
    stats.bestStreak = stats.currentStreak;
  }
  stats.difficultyDistribution[get().difficulty]++;
  stats.difficultyWins[get().difficulty]++;
  stats.totalCellsRevealed += revealedCount;
  stats.totalClicks += get().clickCount;
  const totalFlags = get().flagCount;
  const correctFlags = countCorrectFlagsOnGrid(grid);
  stats.totalFlagsPlaced += totalFlags;
  stats.totalCorrectFlags += correctFlags;
  const currentBest = stats.bestTimes[get().difficulty];
  if (currentBest === null || get().elapsedTime < currentBest) {
    stats.bestTimes[get().difficulty] = get().elapsedTime;
  }
  const d = get().difficulty;
  const prevAvg = stats.averageTimes[d];
  const wins = stats.difficultyWins[d];
  stats.averageTimes[d] = prevAvg === 0 ? get().elapsedTime : Math.round((prevAvg * (wins - 1) + get().elapsedTime) / wins);
  const record: MineGameRecord = {
    difficulty: get().difficulty,
    won: true,
    time: get().elapsedTime,
    clicks: get().clickCount,
    flagsPlaced: totalFlags,
    correctFlags,
    date: new Date().toISOString(),
  };
  stats.gameHistory = [...stats.gameHistory, record].slice(-MAX_HISTORY);
  set({
    isGameOver: true,
    isWin: true,
    statistics: stats,
  });
  saveStatistics(stats);
}

export const useMinesweeperStore = create<MinesweeperStore>((set, get) => ({
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
  settings: loadSettings(),
  statistics: loadStatistics(),
  hitMinePosition: null,
  lastMineHint: null,
  hintsUsed: 0,

  newGame: (difficulty = 'beginner') => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const grid = createEmptyGrid(config.rows, config.cols);
    set({
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
      lastMineHint: null,
      hintsUsed: 0,
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
      const totalFlagsBeforeReveal = countFlagsOnGrid(workingGrid);
      const correctFlagsBeforeReveal = countCorrectFlagsOnGrid(workingGrid);
      const revealedGrid = revealAllMines(workingGrid);
      set({ grid: revealedGrid });
      recordLoss(set, get, revealedGrid, position, totalFlagsBeforeReveal, correctFlagsBeforeReveal);
      return;
    }

    const revealed = floodFill(workingGrid, row, col);
    const newRevealedCount = get().revealedCount + revealed.length;

    set({
      grid: workingGrid,
      revealedCount: newRevealedCount,
    });

    if (checkWin(workingGrid)) {
      recordWin(set, get, workingGrid, newRevealedCount);
    }
  },

  handleCellRightClick: (position) => {
    const { grid, isGameOver, isPaused, settings } = get();
    if (!grid || isGameOver || isPaused) return;

    const { row, col } = position;
    const cell = grid[row][col];
    if (cell.state === 'revealed') return;

    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    const targetCell = newGrid[row][col];

    if (targetCell.state === 'hidden') {
      targetCell.state = 'flagged';
    } else if (targetCell.state === 'flagged') {
      if (settings.questionMarkEnabled) {
        targetCell.state = 'questioned';
      } else {
        targetCell.state = 'hidden';
      }
    } else if (targetCell.state === 'questioned') {
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
    const { revealed, hitMine } = chordReveal(newGrid, row, col);

    if (hitMine) {
      const totalFlagsBeforeReveal = countFlagsOnGrid(newGrid);
      const correctFlagsBeforeReveal = countCorrectFlagsOnGrid(newGrid);
      const revealedGrid = revealAllMines(newGrid);
      set({ grid: revealedGrid });
      recordLoss(set, get, revealedGrid, null, totalFlagsBeforeReveal, correctFlagsBeforeReveal);
    } else {
      const newRevealedCount = get().revealedCount + revealed.length;
      set({ grid: newGrid, revealedCount: newRevealedCount });

      if (checkWin(newGrid)) {
        recordWin(set, get, newGrid, newRevealedCount);
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
    set({ elapsedTime: time });
  },

  getHint: () => {
    const { grid, isGameOver, isPaused } = get();
    if (!grid || isGameOver || isPaused) return;

    const logicalHint = getLogicalMineHint(grid);
    if (logicalHint) {
      if (logicalHint.type === 'safe') {
        get().handleCellClick(logicalHint.position);
      } else {
        get().handleCellRightClick(logicalHint.position);
      }
      set({ lastMineHint: logicalHint, hintsUsed: get().hintsUsed + 1 });
      return;
    }

    const hint = getSafeCellHint(grid);
    if (hint) {
      get().handleCellClick(hint);
      set({ lastMineHint: null, hintsUsed: get().hintsUsed + 1 });
    }
  },

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    set({ settings });
    saveSettings(settings);
  },

  resetGame: () => {
    localStorage.removeItem(STORAGE_KEYS.MINESWEEPER_SAVED_GAME);
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
    });
  },

  selectCell: (position) => {
    set({ selectedCell: position });
  },

  hasSavedGame: () => {
    return loadSavedMineGame() !== null;
  },

  resumeGame: () => {
    const saved = loadSavedMineGame();
    if (!saved) return false;
    set({
      grid: deserializeMineGrid(saved.grid),
      config: saved.config,
      difficulty: saved.difficulty,
      firstClick: saved.firstClick,
      elapsedTime: saved.elapsedTime,
      isPaused: false,
      isGameOver: saved.isGameOver,
      isWin: saved.isWin,
      flagCount: saved.flagCount,
      revealedCount: saved.revealedCount,
      flagMode: saved.flagMode,
      selectedCell: null,
      clickCount: saved.clickCount,
      hitMinePosition: saved.hitMinePosition,
    });
    return true;
  },

  clearSavedGame: () => {
    localStorage.removeItem(STORAGE_KEYS.MINESWEEPER_SAVED_GAME);
  },

  recordVariantResult: (isWin, difficulty, elapsedTime, clickCount, flagCount, grid) => {
    const stats = { ...get().statistics };
    const totalFlags = flagCount;
    const correctFlags = countCorrectFlagsOnGrid(grid);

    if (isWin) {
      stats.gamesPlayed++;
      stats.gamesWon++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
      stats.difficultyDistribution[difficulty]++;
      stats.difficultyWins[difficulty]++;
      const currentBest = stats.bestTimes[difficulty];
      if (currentBest === null || elapsedTime < currentBest) {
        stats.bestTimes[difficulty] = elapsedTime;
      }
      const prevAvg = stats.averageTimes[difficulty];
      const wins = stats.difficultyWins[difficulty];
      stats.averageTimes[difficulty] = prevAvg === 0 ? elapsedTime : Math.round((prevAvg * (wins - 1) + elapsedTime) / wins);
    } else {
      stats.gamesPlayed++;
      stats.gamesLost++;
      stats.currentStreak = 0;
      stats.difficultyDistribution[difficulty]++;
    }

    stats.totalClicks += clickCount;
    stats.totalFlagsPlaced += totalFlags;
    stats.totalCorrectFlags += correctFlags;

    const record: MineGameRecord = {
      difficulty,
      won: isWin,
      time: elapsedTime,
      clicks: clickCount,
      flagsPlaced: totalFlags,
      correctFlags,
      date: new Date().toISOString(),
    };
    stats.gameHistory = [...stats.gameHistory, record].slice(-MAX_HISTORY);

    set({ statistics: stats });
    saveStatistics(stats);
  },
}));

useMinesweeperStore.subscribe((state) => {
  saveMineGameState(state);
});
