import { create } from 'zustand';
import { STORAGE_KEYS } from '@shudu/shared';
import { generateFromSeed } from '@shudu/core';
import { DIFFICULTY_CONFIGS } from '@shudu/minesweeper-core';
import type { Difficulty } from '@shudu/core';
import type { MineDifficulty, MinefieldConfig } from '@shudu/minesweeper-core';

export interface DailyChallengeResult {
  date: string;
  game: 'sudoku' | 'minesweeper';
  completed: boolean;
  elapsedTime: number;
}

interface DailyChallengeState {
  sudokuResults: Record<string, DailyChallengeResult>;
  mineResults: Record<string, DailyChallengeResult>;
}

interface DailyChallengeStore {
  state: DailyChallengeState;
  today: string;

  getTodayDate: () => string;
  getDailySeed: (date: string) => number;
  isSudokuCompleted: (date?: string) => boolean;
  isMineCompleted: (date?: string) => boolean;
  getSudokuResult: (date?: string) => DailyChallengeResult | null;
  getMineResult: (date?: string) => DailyChallengeResult | null;
  getDailySudokuPuzzle: (date?: string) => ReturnType<typeof generateFromSeed>;
  getDailyMineConfig: (date?: string) => { config: MinefieldConfig; difficulty: MineDifficulty; seed: number };
  recordSudokuResult: (elapsedTime: number) => void;
  recordMineResult: (elapsedTime: number) => void;
  getStreak: (game: 'sudoku' | 'minesweeper') => number;
}

function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function dateToSeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function loadState(): DailyChallengeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { sudokuResults: {}, mineResults: {} };
}

function saveState(state: DailyChallengeState) {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE, JSON.stringify(state));
  } catch {}
}

const DAILY_SUDOKU_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
const DAILY_MINE_DIFFICULTIES: MineDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export const useDailyChallengeStore = create<DailyChallengeStore>((set, get) => ({
  state: loadState(),
  today: getTodayDateStr(),

  getTodayDate: () => getTodayDateStr(),

  getDailySeed: (date) => dateToSeed(date || getTodayDateStr()),

  isSudokuCompleted: (date) => {
    const d = date || get().today;
    return get().state.sudokuResults[d]?.completed ?? false;
  },

  isMineCompleted: (date) => {
    const d = date || get().today;
    return get().state.mineResults[d]?.completed ?? false;
  },

  getSudokuResult: (date) => {
    const d = date || get().today;
    return get().state.sudokuResults[d] ?? null;
  },

  getMineResult: (date) => {
    const d = date || get().today;
    return get().state.mineResults[d] ?? null;
  },

  getDailySudokuPuzzle: (date) => {
    const d = date || get().today;
    const seed = dateToSeed(d);
    const dayOfWeek = new Date(d).getDay();
    const difficulty = DAILY_SUDOKU_DIFFICULTIES[dayOfWeek % DAILY_SUDOKU_DIFFICULTIES.length];
    return generateFromSeed(difficulty, seed);
  },

  getDailyMineConfig: (date) => {
    const d = date || get().today;
    const seed = dateToSeed(d);
    const dayOfWeek = new Date(d).getDay();
    const difficulty = DAILY_MINE_DIFFICULTIES[dayOfWeek % DAILY_MINE_DIFFICULTIES.length];
    const config = DIFFICULTY_CONFIGS[difficulty];
    return { config, difficulty, seed };
  },

  recordSudokuResult: (elapsedTime) => {
    const { state, today } = get();
    const newResults = {
      ...state.sudokuResults,
      [today]: { date: today, game: 'sudoku' as const, completed: true, elapsedTime },
    };
    const newState = { ...state, sudokuResults: newResults };
    saveState(newState);
    set({ state: newState });
  },

  recordMineResult: (elapsedTime) => {
    const { state, today } = get();
    const newResults = {
      ...state.mineResults,
      [today]: { date: today, game: 'minesweeper' as const, completed: true, elapsedTime },
    };
    const newState = { ...state, mineResults: newResults };
    saveState(newState);
    set({ state: newState });
  },

  getStreak: (game) => {
    const { state } = get();
    const results = game === 'sudoku' ? state.sudokuResults : state.mineResults;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (results[dateStr]?.completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
}));
