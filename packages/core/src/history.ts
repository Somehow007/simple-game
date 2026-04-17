import {
  type GameMove,
  type CellPosition,
  type GridValue,
  type CellNote,
} from './types';

export interface HistoryState {
  moves: GameMove[];
  currentIndex: number;
}

export function createHistory(): HistoryState {
  return { moves: [], currentIndex: -1 };
}

export function pushMove(state: HistoryState, move: GameMove): HistoryState {
  const moves = state.moves.slice(0, state.currentIndex + 1);
  moves.push(move);
  return { moves, currentIndex: moves.length - 1 };
}

export function undo(state: HistoryState): {
  state: HistoryState;
  move: GameMove | null;
} {
  if (!canUndo(state)) return { state, move: null };
  const move = state.moves[state.currentIndex];
  return {
    state: { ...state, currentIndex: state.currentIndex - 1 },
    move,
  };
}

export function redo(state: HistoryState): {
  state: HistoryState;
  move: GameMove | null;
} {
  if (!canRedo(state)) return { state, move: null };
  const move = state.moves[state.currentIndex + 1];
  return {
    state: { ...state, currentIndex: state.currentIndex + 1 },
    move,
  };
}

export function canUndo(state: HistoryState): boolean {
  return state.currentIndex >= 0;
}

export function canRedo(state: HistoryState): boolean {
  return state.currentIndex < state.moves.length - 1;
}

export function createMove(params: {
  type: GameMove['type'];
  position: CellPosition;
  prevValue: GridValue;
  newValue: GridValue;
  prevNote: CellNote;
  newNote: CellNote;
}): GameMove {
  return { ...params };
}
