import { describe, it, expect } from 'vitest';
import { createHistory, pushMove, undo, redo, canUndo, canRedo } from './history';
import type { GameMove, CellNote } from './types';

const emptyNote: CellNote = { candidates: new Set() };

function createTestMove(row: number, col: number, prevVal: number, newVal: number): GameMove {
  return {
    type: newVal === 0 ? 'clearValue' : 'setValue',
    position: { row, col },
    prevValue: prevVal as GameMove['prevValue'],
    newValue: newVal as GameMove['newValue'],
    prevNote: { ...emptyNote },
    newNote: { ...emptyNote },
  };
}

describe('createHistory', () => {
  it('should create an empty history', () => {
    const history = createHistory();
    expect(history.moves).toEqual([]);
    expect(history.currentIndex).toBe(-1);
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);
  });
});

describe('pushMove', () => {
  it('should add a move to the history', () => {
    const history = createHistory();
    const move = createTestMove(0, 0, 0, 5);
    const newHistory = pushMove(history, move);
    expect(newHistory.moves.length).toBe(1);
    expect(newHistory.currentIndex).toBe(0);
    expect(canUndo(newHistory)).toBe(true);
    expect(canRedo(newHistory)).toBe(false);
  });

  it('should truncate future moves when pushing after undo', () => {
    let history = createHistory();
    history = pushMove(history, createTestMove(0, 0, 0, 5));
    history = pushMove(history, createTestMove(0, 1, 0, 3));
    const undoResult = undo(history);
    history = undoResult.state;
    history = pushMove(history, createTestMove(0, 2, 0, 7));
    expect(history.moves.length).toBe(2);
    expect(history.currentIndex).toBe(1);
    expect(canRedo(history)).toBe(false);
  });
});

describe('undo', () => {
  it('should return the previous move', () => {
    let history = createHistory();
    const move1 = createTestMove(0, 0, 0, 5);
    const move2 = createTestMove(0, 1, 0, 3);
    history = pushMove(history, move1);
    history = pushMove(history, move2);

    const result = undo(history);
    expect(result.move).toEqual(move2);
    expect(result.state.currentIndex).toBe(0);
    expect(canUndo(result.state)).toBe(true);
    expect(canRedo(result.state)).toBe(true);
  });

  it('should return null when there is nothing to undo', () => {
    const history = createHistory();
    const result = undo(history);
    expect(result.move).toBeNull();
    expect(result.state).toEqual(history);
  });
});

describe('redo', () => {
  it('should return the next move after undo', () => {
    let history = createHistory();
    const move1 = createTestMove(0, 0, 0, 5);
    const move2 = createTestMove(0, 1, 0, 3);
    history = pushMove(history, move1);
    history = pushMove(history, move2);
    const undoResult = undo(history);
    history = undoResult.state;

    const redoResult = redo(history);
    expect(redoResult.move).toEqual(move2);
    expect(redoResult.state.currentIndex).toBe(1);
  });

  it('should return null when there is nothing to redo', () => {
    const history = createHistory();
    const result = redo(history);
    expect(result.move).toBeNull();
    expect(result.state).toEqual(history);
  });
});

describe('canUndo / canRedo', () => {
  it('should track undo/redo availability correctly', () => {
    let history = createHistory();
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);

    history = pushMove(history, createTestMove(0, 0, 0, 5));
    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(false);

    history = pushMove(history, createTestMove(0, 1, 0, 3));
    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(false);

    const undoResult = undo(history);
    history = undoResult.state;
    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(true);

    const undoResult2 = undo(history);
    history = undoResult2.state;
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(true);
  });
});
