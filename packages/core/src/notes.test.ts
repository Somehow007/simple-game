import { describe, it, expect } from 'vitest';
import {
  createEmptyNote,
  toggleCandidate,
  addCandidate,
  removeCandidate,
  clearNote,
  hasCandidate,
  getCandidates,
  getCandidateCount,
  isNoteEmpty,
  setCandidates,
  removeCandidatesByValues,
} from './notes';
import type { CellValue } from './types';

describe('createEmptyNote', () => {
  it('should create a note with no candidates', () => {
    const note = createEmptyNote();
    expect(note.candidates.size).toBe(0);
    expect(isNoteEmpty(note)).toBe(true);
  });
});

describe('toggleCandidate', () => {
  it('should add a candidate if not present', () => {
    const note = createEmptyNote();
    const result = toggleCandidate(note, 5 as CellValue);
    expect(hasCandidate(result, 5 as CellValue)).toBe(true);
  });

  it('should remove a candidate if already present', () => {
    let note = createEmptyNote();
    note = toggleCandidate(note, 5 as CellValue);
    const result = toggleCandidate(note, 5 as CellValue);
    expect(hasCandidate(result, 5 as CellValue)).toBe(false);
  });

  it('should not affect other candidates', () => {
    let note = createEmptyNote();
    note = addCandidate(note, 3 as CellValue);
    note = addCandidate(note, 7 as CellValue);
    const result = toggleCandidate(note, 5 as CellValue);
    expect(hasCandidate(result, 3 as CellValue)).toBe(true);
    expect(hasCandidate(result, 7 as CellValue)).toBe(true);
    expect(hasCandidate(result, 5 as CellValue)).toBe(true);
  });
});

describe('addCandidate', () => {
  it('should add a candidate', () => {
    const note = createEmptyNote();
    const result = addCandidate(note, 5 as CellValue);
    expect(hasCandidate(result, 5 as CellValue)).toBe(true);
  });

  it('should not duplicate a candidate', () => {
    const note = addCandidate(createEmptyNote(), 5 as CellValue);
    const result = addCandidate(note, 5 as CellValue);
    expect(getCandidateCount(result)).toBe(1);
  });
});

describe('removeCandidate', () => {
  it('should remove a candidate', () => {
    const note = addCandidate(createEmptyNote(), 5 as CellValue);
    const result = removeCandidate(note, 5 as CellValue);
    expect(hasCandidate(result, 5 as CellValue)).toBe(false);
  });

  it('should do nothing if candidate not present', () => {
    const note = addCandidate(createEmptyNote(), 3 as CellValue);
    const result = removeCandidate(note, 5 as CellValue);
    expect(getCandidateCount(result)).toBe(1);
    expect(hasCandidate(result, 3 as CellValue)).toBe(true);
  });
});

describe('clearNote', () => {
  it('should remove all candidates', () => {
    let note = createEmptyNote();
    note = addCandidate(note, 1 as CellValue);
    note = addCandidate(note, 2 as CellValue);
    note = addCandidate(note, 3 as CellValue);
    const result = clearNote(note);
    expect(isNoteEmpty(result)).toBe(true);
    expect(getCandidateCount(result)).toBe(0);
  });
});

describe('getCandidates', () => {
  it('should return sorted candidates', () => {
    let note = createEmptyNote();
    note = addCandidate(note, 5 as CellValue);
    note = addCandidate(note, 2 as CellValue);
    note = addCandidate(note, 8 as CellValue);
    expect(getCandidates(note)).toEqual([2, 5, 8]);
  });

  it('should return empty array for empty note', () => {
    const note = createEmptyNote();
    expect(getCandidates(note)).toEqual([]);
  });
});

describe('setCandidates', () => {
  it('should set multiple candidates at once', () => {
    const note = setCandidates(createEmptyNote(), [1, 3, 5] as CellValue[]);
    expect(getCandidates(note)).toEqual([1, 3, 5]);
  });

  it('should replace existing candidates', () => {
    let note = setCandidates(createEmptyNote(), [1, 2, 3] as CellValue[]);
    note = setCandidates(note, [4, 5, 6] as CellValue[]);
    expect(getCandidates(note)).toEqual([4, 5, 6]);
  });
});

describe('removeCandidatesByValues', () => {
  it('should remove multiple candidates', () => {
    const note = setCandidates(createEmptyNote(), [1, 2, 3, 4, 5] as CellValue[]);
    const result = removeCandidatesByValues(note, [2, 4] as CellValue[]);
    expect(getCandidates(result)).toEqual([1, 3, 5]);
  });

  it('should handle removing non-existent candidates', () => {
    const note = setCandidates(createEmptyNote(), [1, 3, 5] as CellValue[]);
    const result = removeCandidatesByValues(note, [2, 4] as CellValue[]);
    expect(getCandidates(result)).toEqual([1, 3, 5]);
  });
});

describe('getCandidateCount', () => {
  it('should return the correct count', () => {
    let note = createEmptyNote();
    expect(getCandidateCount(note)).toBe(0);
    note = addCandidate(note, 1 as CellValue);
    expect(getCandidateCount(note)).toBe(1);
    note = addCandidate(note, 2 as CellValue);
    expect(getCandidateCount(note)).toBe(2);
  });
});
