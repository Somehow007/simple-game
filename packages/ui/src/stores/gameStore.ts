import { create } from 'zustand';
import {
  type SudokuGrid,
  type CellPosition,
  type CellValue,
  type GridValue,
  type Difficulty,
  type PuzzleData,
  type GameMove,
  GRID_SIZE,
} from '@shudu/core';
import { generate, validate } from '@shudu/core';
import {
  pushMove,
  undo as undoHistory,
  redo as redoHistory,
  canUndo as canUndoHistory,
  canRedo as canRedoHistory,
  createEmptyNote,
  toggleCandidate,
} from '@shudu/core';
import { STORAGE_KEYS, type ThemeOption } from '@shudu/shared';

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  bestTimes: Record<Difficulty, number | null>;
  difficultyDistribution: Record<Difficulty, number>;
  difficultyWins: Record<Difficulty, number>;
}

export interface GameSettings {
  theme: ThemeOption;
  highlightErrors: boolean;
  highlightSameNumbers: boolean;
  autoRemoveNotes: boolean;
  showTimer: boolean;
  soundEnabled: boolean;
}

interface HistoryState {
  moves: GameMove[];
  currentIndex: number;
}

interface SavedGameState {
  grid: { value: GridValue; isGiven: boolean; noteCandidates: number[] }[][];
  solution: GridValue[][];
  difficulty: Difficulty;
  selectedCell: CellPosition | null;
  history: {
    moves: {
      type: string;
      position: CellPosition;
      prevValue: GridValue;
      newValue: GridValue;
      prevNoteCandidates: number[];
      newNoteCandidates: number[];
    }[];
    currentIndex: number;
  };
  elapsedTime: number;
  isPaused: boolean;
  isCompleted: boolean;
  mistakes: number;
  hintsUsed: number;
  isNoteMode: boolean;
}

interface GameStore {
  grid: SudokuGrid | null;
  solution: GridValue[][] | null;
  difficulty: Difficulty;
  selectedCell: CellPosition | null;
  history: HistoryState;
  elapsedTime: number;
  isPaused: boolean;
  isCompleted: boolean;
  mistakes: number;
  hintsUsed: number;
  settings: GameSettings;
  statistics: GameStatistics;
  isNoteMode: boolean;

  newGame: (difficulty?: Difficulty) => void;
  selectCell: (position: CellPosition) => void;
  setValue: (value: CellValue) => void;
  clearValue: () => void;
  toggleNote: (value: CellValue) => void;
  toggleNoteMode: () => void;
  undo: () => void;
  redo: () => void;
  togglePause: () => void;
  setElapsedTime: (time: number) => void;
  getHint: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetGame: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  isCellValueCorrect: (position: CellPosition) => boolean;
  getNumberCount: (value: CellValue) => number;
  hasSavedGame: () => boolean;
  resumeGame: () => boolean;
  clearSavedGame: () => void;
  recordVariantWin: (difficulty: Difficulty, elapsedTime: number) => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  theme: 'light',
  highlightErrors: true,
  highlightSameNumbers: true,
  autoRemoveNotes: true,
  showTimer: true,
  soundEnabled: true,
};

const DEFAULT_STATISTICS: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestTimes: { easy: null, medium: null, hard: null, expert: null },
  difficultyDistribution: { easy: 0, medium: 0, hard: 0, expert: 0 },
  difficultyWins: { easy: 0, medium: 0, hard: 0, expert: 0 },
};

function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function loadStatistics(): GameStatistics {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATISTICS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_STATISTICS,
        ...parsed,
        difficultyWins: { ...DEFAULT_STATISTICS.difficultyWins, ...(parsed.difficultyWins || {}) },
      };
    }
  } catch {}
  return DEFAULT_STATISTICS;
}

function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

function saveStatistics(statistics: GameStatistics) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(statistics));
  } catch {}
}

function serializeGrid(grid: SudokuGrid): SavedGameState['grid'] {
  return grid.map((row) =>
    row.map((cell) => ({
      value: cell.value,
      isGiven: cell.isGiven,
      noteCandidates: [...cell.note.candidates],
    })),
  );
}

function deserializeGrid(serialized: SavedGameState['grid']): SudokuGrid {
  return serialized.map((row) =>
    row.map((cell) => ({
      value: cell.value,
      isGiven: cell.isGiven,
      note: { candidates: new Set(cell.noteCandidates as CellValue[]) },
    })),
  );
}

function serializeHistory(history: HistoryState): SavedGameState['history'] {
  return {
    moves: history.moves.map((move) => ({
      type: move.type,
      position: move.position,
      prevValue: move.prevValue,
      newValue: move.newValue,
      prevNoteCandidates: [...move.prevNote.candidates],
      newNoteCandidates: [...move.newNote.candidates],
    })),
    currentIndex: history.currentIndex,
  };
}

function deserializeHistory(serialized: SavedGameState['history']): HistoryState {
  return {
    moves: serialized.moves.map((move) => ({
      type: move.type as GameMove['type'],
      position: move.position,
      prevValue: move.prevValue,
      newValue: move.newValue,
      prevNote: { candidates: new Set(move.prevNoteCandidates as CellValue[]) },
      newNote: { candidates: new Set(move.newNoteCandidates as CellValue[]) },
    })),
    currentIndex: serialized.currentIndex,
  };
}

function saveGameState(state: GameStore) {
  try {
    if (!state.grid || !state.solution) {
      localStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
      return;
    }
    if (state.isCompleted) {
      localStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
      return;
    }
    const saved: SavedGameState = {
      grid: serializeGrid(state.grid),
      solution: state.solution,
      difficulty: state.difficulty,
      selectedCell: state.selectedCell,
      history: serializeHistory(state.history),
      elapsedTime: state.elapsedTime,
      isPaused: false,
      isCompleted: state.isCompleted,
      mistakes: state.mistakes,
      hintsUsed: state.hintsUsed,
      isNoteMode: state.isNoteMode,
    };
    localStorage.setItem(STORAGE_KEYS.SAVED_GAME, JSON.stringify(saved));
  } catch {}
}

function loadSavedGame(): SavedGameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVED_GAME);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.grid && parsed.solution && !parsed.isCompleted) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  grid: null,
  solution: null,
  difficulty: 'medium',
  selectedCell: null,
  history: { moves: [], currentIndex: -1 },
  elapsedTime: 0,
  isPaused: false,
  isCompleted: false,
  mistakes: 0,
  hintsUsed: 0,
  settings: loadSettings(),
  statistics: loadStatistics(),
  isNoteMode: false,

  newGame: (difficulty = 'medium') => {
    const puzzle: PuzzleData = generate(difficulty);
    set({
      grid: puzzle.grid,
      solution: puzzle.solution,
      difficulty,
      selectedCell: null,
      history: { moves: [], currentIndex: -1 },
      elapsedTime: 0,
      isPaused: false,
      isCompleted: false,
      mistakes: 0,
      hintsUsed: 0,
      isNoteMode: false,
    });
  },

  selectCell: (position) => {
    set({ selectedCell: position });
  },

  setValue: (value) => {
    const { grid, solution, selectedCell, history, isNoteMode, settings } = get();
    if (!grid || !selectedCell || isNoteMode) return;

    const { row, col } = selectedCell;
    const cell = grid[row][col];
    if (cell.isGiven) return;

    const prevValue = cell.value;
    const prevNote = cell.note;
    const newNote = createEmptyNote();

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    newGrid[row][col] = {
      value,
      isGiven: false,
      note: newNote,
    };

    if (settings.autoRemoveNotes) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c !== col) {
          const note = newGrid[row][c].note;
          note.candidates = new Set([...note.candidates].filter((v) => v !== value));
        }
      }
      for (let r = 0; r < GRID_SIZE; r++) {
        if (r !== row) {
          const note = newGrid[r][col].note;
          note.candidates = new Set([...note.candidates].filter((v) => v !== value));
        }
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (r !== row || c !== col) {
            const note = newGrid[r][c].note;
            note.candidates = new Set([...note.candidates].filter((v) => v !== value));
          }
        }
      }
    }

    const move: GameMove = {
      type: 'setValue',
      position: selectedCell,
      prevValue,
      newValue: value,
      prevNote,
      newNote,
    };
    const newHistory = pushMove(history, move);

    let mistakes = get().mistakes;
    if (solution && value !== solution[row][col]) {
      mistakes++;
    }

    const validationResult = validate(newGrid);
    const isCompleted = validationResult.isComplete && validationResult.isValid;

    set({
      grid: newGrid,
      history: newHistory,
      mistakes,
      isCompleted,
    });

    if (isCompleted) {
      const stats = { ...get().statistics };
      stats.gamesPlayed++;
      stats.gamesWon++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
      stats.difficultyDistribution[get().difficulty]++;
      stats.difficultyWins[get().difficulty]++;
      const currentBest = stats.bestTimes[get().difficulty];
      if (currentBest === null || get().elapsedTime < currentBest) {
        stats.bestTimes[get().difficulty] = get().elapsedTime;
      }
      set({ statistics: stats });
      saveStatistics(stats);
    }
  },

  clearValue: () => {
    const { grid, selectedCell, history } = get();
    if (!grid || !selectedCell) return;

    const { row, col } = selectedCell;
    const cell = grid[row][col];
    if (cell.isGiven) return;

    const hasNotes = cell.note.candidates.size > 0;
    if (cell.value === 0 && !hasNotes) return;

    const prevValue = cell.value;
    const prevNote = cell.note;
    const newNote = createEmptyNote();

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    newGrid[row][col] = {
      value: 0,
      isGiven: false,
      note: newNote,
    };

    const move: GameMove = {
      type: cell.value !== 0 ? 'clearValue' : 'clearNote',
      position: selectedCell,
      prevValue,
      newValue: 0,
      prevNote,
      newNote,
    };
    const newHistory = pushMove(history, move);

    set({ grid: newGrid, history: newHistory, isCompleted: false });
  },

  toggleNote: (value) => {
    const { grid, selectedCell, history } = get();
    if (!grid || !selectedCell) return;

    const { row, col } = selectedCell;
    const cell = grid[row][col];
    if (cell.isGiven || cell.value !== 0) return;

    const prevNote = cell.note;
    const newNote = toggleCandidate(cell.note, value);

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    newGrid[row][col] = {
      ...cell,
      note: newNote,
    };

    const move: GameMove = {
      type: 'toggleNote',
      position: selectedCell,
      prevValue: cell.value,
      newValue: cell.value,
      prevNote,
      newNote,
    };
    const newHistory = pushMove(history, move);

    set({ grid: newGrid, history: newHistory });
  },

  toggleNoteMode: () => {
    set((state) => ({ isNoteMode: !state.isNoteMode }));
  },

  undo: () => {
    const { grid, history } = get();
    if (!grid || !canUndoHistory(history)) return;

    const result = undoHistory(history);
    const move = result.move;
    if (!move) return;

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    const { row, col } = move.position;
    newGrid[row][col] = {
      value: move.prevValue,
      isGiven: newGrid[row][col].isGiven,
      note: { candidates: new Set(move.prevNote.candidates) },
    };

    set({ grid: newGrid, history: result.state, isCompleted: false });
  },

  redo: () => {
    const { grid, history } = get();
    if (!grid || !canRedoHistory(history)) return;

    const result = redoHistory(history);
    const move = result.move;
    if (!move) return;

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    const { row, col } = move.position;
    newGrid[row][col] = {
      value: move.newValue,
      isGiven: newGrid[row][col].isGiven,
      note: { candidates: new Set(move.newNote.candidates) },
    };

    set({ grid: newGrid, history: result.state });
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  setElapsedTime: (time) => {
    set({ elapsedTime: time });
  },

  getHint: () => {
    const { grid, solution, selectedCell, history, hintsUsed } = get();
    if (!grid || !solution) return;

    let targetCell: CellPosition | null = null;

    if (selectedCell) {
      const { row, col } = selectedCell;
      if (!grid[row][col].isGiven && grid[row][col].value !== solution[row][col]) {
        targetCell = selectedCell;
      }
    }

    if (!targetCell) {
      const emptyCells: CellPosition[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!grid[r][c].isGiven && grid[r][c].value !== solution[r][c]) {
            emptyCells.push({ row: r, col: c });
          }
        }
      }
      if (emptyCells.length === 0) return;
      targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    const { row, col } = targetCell;
    const correctValue = solution[row][col] as CellValue;
    const prevValue = grid[row][col].value;
    const prevNote = grid[row][col].note;
    const newNote = createEmptyNote();

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    newGrid[row][col] = {
      value: correctValue,
      isGiven: false,
      note: newNote,
    };

    const move: GameMove = {
      type: 'setValue',
      position: targetCell,
      prevValue,
      newValue: correctValue,
      prevNote,
      newNote,
    };
    const newHistory = pushMove(history, move);

    const validationResult = validate(newGrid);
    const isCompleted = validationResult.isComplete && validationResult.isValid;

    set({
      grid: newGrid,
      history: newHistory,
      selectedCell: targetCell,
      hintsUsed: hintsUsed + 1,
      isCompleted,
    });
  },

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    set({ settings });
    saveSettings(settings);
  },

  resetGame: () => {
    localStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
    set({
      grid: null,
      solution: null,
      selectedCell: null,
      history: { moves: [], currentIndex: -1 },
      elapsedTime: 0,
      isPaused: false,
      isCompleted: false,
      mistakes: 0,
      hintsUsed: 0,
      isNoteMode: false,
    });
  },

  canUndo: () => {
    return canUndoHistory(get().history);
  },

  canRedo: () => {
    return canRedoHistory(get().history);
  },

  isCellValueCorrect: (position) => {
    const { grid, solution } = get();
    if (!grid || !solution) return true;
    const { row, col } = position;
    if (grid[row][col].value === 0) return true;
    return grid[row][col].value === solution[row][col];
  },

  getNumberCount: (value) => {
    const { grid } = get();
    if (!grid) return 0;
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].value === value) count++;
      }
    }
    return count;
  },

  hasSavedGame: () => {
    return loadSavedGame() !== null;
  },

  resumeGame: () => {
    const saved = loadSavedGame();
    if (!saved) return false;
    set({
      grid: deserializeGrid(saved.grid),
      solution: saved.solution,
      difficulty: saved.difficulty,
      selectedCell: saved.selectedCell,
      history: deserializeHistory(saved.history),
      elapsedTime: saved.elapsedTime,
      isPaused: false,
      isCompleted: saved.isCompleted,
      mistakes: saved.mistakes,
      hintsUsed: saved.hintsUsed,
      isNoteMode: saved.isNoteMode,
    });
    return true;
  },

  clearSavedGame: () => {
    localStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
  },

  recordVariantWin: (difficulty, elapsedTime) => {
    const stats = { ...get().statistics };
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
    set({ statistics: stats });
    saveStatistics(stats);
  },
}));

useGameStore.subscribe((state) => {
  saveGameState(state);
});
