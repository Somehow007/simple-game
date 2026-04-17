export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CandidateValue = 0;
export type EmptyValue = 0;
export type GridValue = CellValue | EmptyValue;

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellNote {
  candidates: Set<CellValue>;
}

export interface GridCell {
  value: GridValue;
  isGiven: boolean;
  note: CellNote;
}

export type SudokuGrid = GridCell[][];

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface PuzzleData {
  grid: SudokuGrid;
  solution: GridValue[][];
  difficulty: Difficulty;
  seed?: number;
}

export interface ConflictInfo {
  row: number[];
  col: number[];
  box: number[];
}

export interface ValidationResult {
  isValid: boolean;
  isComplete: boolean;
  conflicts: ConflictInfo[];
}

export interface GameMove {
  type: 'setValue' | 'clearValue' | 'toggleNote' | 'clearNote';
  position: CellPosition;
  prevValue: GridValue;
  newValue: GridValue;
  prevNote: CellNote;
  newNote: CellNote;
}

export interface GameState {
  puzzle: PuzzleData;
  moves: GameMove[];
  moveIndex: number;
  elapsedTime: number;
  isPaused: boolean;
  isCompleted: boolean;
  mistakes: number;
  hintsUsed: number;
}

export const GRID_SIZE = 9;
export const BOX_SIZE = 3;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const ALL_VALUES: CellValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
