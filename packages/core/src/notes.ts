import { type CellNote, type CellValue, ALL_VALUES } from './types';

export function createEmptyNote(): CellNote {
  return { candidates: new Set<CellValue>() };
}

export function toggleCandidate(note: CellNote, value: CellValue): CellNote {
  const candidates = new Set(note.candidates);
  if (candidates.has(value)) {
    candidates.delete(value);
  } else {
    candidates.add(value);
  }
  return { candidates };
}

export function addCandidate(note: CellNote, value: CellValue): CellNote {
  const candidates = new Set(note.candidates);
  candidates.add(value);
  return { candidates };
}

export function removeCandidate(note: CellNote, value: CellValue): CellNote {
  const candidates = new Set(note.candidates);
  candidates.delete(value);
  return { candidates };
}

export function clearNote(_note: CellNote): CellNote {
  return { candidates: new Set<CellValue>() };
}

export function hasCandidate(note: CellNote, value: CellValue): boolean {
  return note.candidates.has(value);
}

export function getCandidates(note: CellNote): CellValue[] {
  return ALL_VALUES.filter((v) => note.candidates.has(v));
}

export function getCandidateCount(note: CellNote): number {
  return note.candidates.size;
}

export function isNoteEmpty(note: CellNote): boolean {
  return note.candidates.size === 0;
}

export function setCandidates(_note: CellNote, values: CellValue[]): CellNote {
  return { candidates: new Set(values) };
}

export function removeCandidatesByValues(
  note: CellNote,
  values: CellValue[],
): CellNote {
  const candidates = new Set(note.candidates);
  for (const v of values) {
    candidates.delete(v);
  }
  return { candidates };
}
