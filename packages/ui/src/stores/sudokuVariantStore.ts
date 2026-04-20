import { create } from 'zustand';
import {
  type SudokuGrid,
  type CellPosition,
  type CellValue,
  type GridValue,
  type Difficulty,
  type GameMove,
  GRID_SIZE,
} from '@shudu/core';
import {
  generateDiagonal,
  validateDiagonal,
  generateMini,
  validateMiniGrid,
  type MiniGridSize,
  type MiniGridCell,
} from '@shudu/core';
import {
  pushMove,
  undo as undoHistory,
  redo as redoHistory,
  canUndo as canUndoHistory,
  canRedo as canRedoHistory,
  createEmptyNote,
} from '@shudu/core';
import { useGameStore } from './gameStore';

export type SudokuVariant = 'standard' | 'diagonal' | 'mini4' | 'mini6';

interface SudokuVariantStore {
  variant: SudokuVariant;
  grid: SudokuGrid | null;
  solution: GridValue[][] | null;
  difficulty: Difficulty;
  selectedCell: CellPosition | null;
  history: { moves: GameMove[]; currentIndex: number };
  elapsedTime: number;
  isPaused: boolean;
  isCompleted: boolean;
  mistakes: number;
  hintsUsed: number;
  isNoteMode: boolean;

  miniGrid: MiniGridCell[][] | null;
  miniSolution: number[][] | null;
  miniGridSize: MiniGridSize;

  newGame: (variant: SudokuVariant, difficulty?: Difficulty) => void;
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
  resetGame: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  setMiniValue: (row: number, col: number, value: number) => void;
  clearMiniValue: (row: number, col: number) => void;
}

export const useSudokuVariantStore = create<SudokuVariantStore>((set, get) => ({
  variant: 'standard',
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
  isNoteMode: false,
  miniGrid: null,
  miniSolution: null,
  miniGridSize: 4,

  newGame: (variant, difficulty = 'medium') => {
    if (variant === 'diagonal') {
      const puzzle = generateDiagonal(difficulty);
      set({
        variant,
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
        miniGrid: null,
        miniSolution: null,
        miniGridSize: 4,
      });
    } else if (variant === 'mini4') {
      const puzzle = generateMini(4, 'easy');
      set({
        variant,
        grid: null,
        solution: null,
        difficulty,
        selectedCell: null,
        history: { moves: [], currentIndex: -1 },
        elapsedTime: 0,
        isPaused: false,
        isCompleted: false,
        mistakes: 0,
        hintsUsed: 0,
        isNoteMode: false,
        miniGrid: puzzle.grid,
        miniSolution: puzzle.solution,
        miniGridSize: 4,
      });
    } else if (variant === 'mini6') {
      const puzzle = generateMini(6, 'medium');
      set({
        variant,
        grid: null,
        solution: null,
        difficulty,
        selectedCell: null,
        history: { moves: [], currentIndex: -1 },
        elapsedTime: 0,
        isPaused: false,
        isCompleted: false,
        mistakes: 0,
        hintsUsed: 0,
        isNoteMode: false,
        miniGrid: puzzle.grid,
        miniSolution: puzzle.solution,
        miniGridSize: 6,
      });
    }
  },

  selectCell: (position) => {
    set({ selectedCell: position });
  },

  setValue: (value) => {
    const { grid, solution, selectedCell, history, isNoteMode, variant } = get();
    if (!grid || !selectedCell || isNoteMode) return;
    if (variant !== 'diagonal') return;

    const { row, col } = selectedCell;
    const cell = grid[row][col];
    if (cell.isGiven) return;

    const prevValue = cell.value;
    const prevNote = cell.note;
    const newNote = createEmptyNote();

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    newGrid[row][col] = { value, isGiven: false, note: newNote };

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

    const validationResult = validateDiagonal(newGrid);
    const isCompleted = validationResult.isComplete && validationResult.isValid;

    if (isCompleted) {
      useGameStore.getState().recordVariantWin(get().difficulty, get().elapsedTime);
    }

    set({ grid: newGrid, history: newHistory, mistakes, isCompleted });
  },

  clearValue: () => {
    const { grid, selectedCell, history, variant } = get();
    if (!grid || !selectedCell || variant !== 'diagonal') return;

    const { row, col } = selectedCell;
    const cell = grid[row][col];
    if (cell.isGiven) return;

    const prevValue = cell.value;
    const prevNote = cell.note;
    const newNote = createEmptyNote();

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    newGrid[row][col] = { value: 0, isGiven: false, note: newNote };

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
    const { grid, selectedCell, history, variant } = get();
    if (!grid || !selectedCell || variant !== 'diagonal') return;

    const { row, col } = selectedCell;
    const cell = grid[row][col];
    if (cell.isGiven || cell.value !== 0) return;

    const prevNote = cell.note;
    const newCandidates = new Set(prevNote.candidates);
    if (newCandidates.has(value)) {
      newCandidates.delete(value);
    } else {
      newCandidates.add(value);
    }
    const newNote = { candidates: newCandidates };

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    newGrid[row][col] = { ...cell, note: newNote };

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
    const { grid, history, variant } = get();
    if (!grid || variant !== 'diagonal' || !canUndoHistory(history)) return;

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
    const { grid, history, variant } = get();
    if (!grid || variant !== 'diagonal' || !canRedoHistory(history)) return;

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
    const { grid, solution, selectedCell, history, hintsUsed, variant } = get();
    if (!grid || !solution || variant !== 'diagonal') return;

    let targetCell: CellPosition | null = null;
    if (selectedCell) {
      const { row, col } = selectedCell;
      if (!grid[row][col].isGiven && grid[row][col].value !== solution[row][col]) {
        targetCell = selectedCell;
      }
    }
    if (!targetCell) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!grid[r][c].isGiven && grid[r][c].value !== solution[r][c]) {
            targetCell = { row: r, col: c };
            break;
          }
        }
        if (targetCell) break;
      }
    }
    if (!targetCell) return;

    const { row, col } = targetCell;
    const correctValue = solution[row][col] as CellValue;
    const prevValue = grid[row][col].value;
    const prevNote = grid[row][col].note;
    const newNote = createEmptyNote();

    const newGrid = grid.map((r) => r.map((c) => ({ ...c, note: { candidates: new Set(c.note.candidates) } })));
    newGrid[row][col] = { value: correctValue, isGiven: false, note: newNote };

    const move: GameMove = {
      type: 'setValue',
      position: targetCell,
      prevValue,
      newValue: correctValue,
      prevNote,
      newNote,
    };
    const newHistory = pushMove(history, move);

    const validationResult = validateDiagonal(newGrid);
    const isCompleted = validationResult.isComplete && validationResult.isValid;

    set({
      grid: newGrid,
      history: newHistory,
      selectedCell: targetCell,
      hintsUsed: hintsUsed + 1,
      isCompleted,
    });
  },

  resetGame: () => {
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
      miniGrid: null,
      miniSolution: null,
    });
  },

  canUndo: () => canUndoHistory(get().history),
  canRedo: () => canRedoHistory(get().history),

  setMiniValue: (row, col, value) => {
    const { miniGrid, miniSolution, miniGridSize } = get();
    if (!miniGrid || !miniSolution) return;

    const cell = miniGrid[row][col];
    if (cell.isGiven) return;

    const newGrid = miniGrid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col] = { value, isGiven: false, note: { candidates: new Set<number>() } };

    let mistakes = get().mistakes;
    if (value !== miniSolution[row][col]) {
      mistakes++;
    }

    const result = validateMiniGrid(newGrid, miniGridSize);
    const isCompleted = result.isComplete && result.isValid;

    if (isCompleted) {
      useGameStore.getState().recordVariantWin(get().difficulty, get().elapsedTime);
    }

    set({ miniGrid: newGrid, mistakes, isCompleted });
  },

  clearMiniValue: (row, col) => {
    const { miniGrid } = get();
    if (!miniGrid) return;

    const cell = miniGrid[row][col];
    if (cell.isGiven) return;

    const newGrid = miniGrid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col] = { value: 0, isGiven: false, note: { candidates: new Set<number>() } };

    set({ miniGrid: newGrid, isCompleted: false });
  },
}));
