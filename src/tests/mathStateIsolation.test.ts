import { describe, it, expect } from 'vitest';
import {
  validateUserMathAnswer,
  runMathStateIsolationQA,
} from '../services/deterministicMathEngine';
import {
  getTaskDraft,
  saveTaskDraft,
  clearTaskDraft,
  clearAllMathDrafts,
} from '../services/mathDraftService';
import { StandardArithmeticExercise } from '../types/math';

// Mock sessionStorage for Node environment
if (typeof window === 'undefined' || !globalThis.sessionStorage) {
  const store = new Map<string, string>();
  globalThis.sessionStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => { store.set(key, val); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear(),
    key: (idx: number) => Array.from(store.keys())[idx] || null,
    length: 0,
  };
}

describe('Math State Isolation & Deterministic Validation Tests', () => {
  it('passes internal engine isolation suite', () => {
    const qaResult = runMathStateIsolationQA();
    expect(qaResult.allPassed).toBe(true);
  });

  it('validates 7 × 8 strictly: rejects 60 and accepts 56', () => {
    const task7x8: StandardArithmeticExercise = {
      id: 'task-7x8',
      day: 'tuesday',
      type: 'multiplication_facts',
      title: 'Multiplikation',
      subtitle: '7 × 8',
      instruction: '',
      skillName: 'Multiplikation',
      points: 4,
      equation: '7 × 8',
      blankPosition: 'result',
      correctAnswer: 56,
    };
    expect(validateUserMathAnswer(task7x8, '60').isCorrect).toBe(false);
    expect(validateUserMathAnswer(task7x8, '56').isCorrect).toBe(true);
  });

  it('validates 860 − 40 strictly: rejects 7 and accepts 820', () => {
    const task860minus40: StandardArithmeticExercise = {
      id: 'task-860-40',
      day: 'thursday',
      type: 'subtraction_1000',
      title: 'Subtraktion',
      subtitle: '860 − 40',
      instruction: '',
      skillName: 'Subtraktion',
      points: 4,
      equation: '860 − 40',
      blankPosition: 'result',
      correctAnswer: 820,
    };
    expect(validateUserMathAnswer(task860minus40, '7').isCorrect).toBe(false);
    expect(validateUserMathAnswer(task860minus40, '820').isCorrect).toBe(true);
  });

  it('validates 35 ÷ 5 strictly: rejects 820 and accepts 7', () => {
    const task35div5: StandardArithmeticExercise = {
      id: 'task-35-5',
      day: 'tuesday',
      type: 'division_facts',
      title: 'Division',
      subtitle: '35 ÷ 5',
      instruction: '',
      skillName: 'Division',
      points: 4,
      equation: '35 ÷ 5',
      blankPosition: 'result',
      correctAnswer: 7,
    };
    expect(validateUserMathAnswer(task35div5, '820').isCorrect).toBe(false);
    expect(validateUserMathAnswer(task35div5, '7').isCorrect).toBe(true);
  });

  it('validates 48 ÷ 6 strictly: rejects 24 and accepts 8', () => {
    const task48div6: StandardArithmeticExercise = {
      id: 'task-48-6',
      day: 'thursday',
      type: 'division_facts',
      title: 'Division',
      subtitle: '48 ÷ 6',
      instruction: '',
      skillName: 'Division',
      points: 4,
      equation: '48 ÷ 6',
      blankPosition: 'result',
      correctAnswer: 8,
    };
    expect(validateUserMathAnswer(task48div6, '24').isCorrect).toBe(false);
    expect(validateUserMathAnswer(task48div6, '8').isCorrect).toBe(true);
  });

  it('maintains draft isolation between tasks', () => {
    clearAllMathDrafts();
    saveTaskDraft('task-sub-1', { typedAnswer: '820' });
    expect(getTaskDraft('task-sub-1')?.typedAnswer).toBe('820');
    expect(getTaskDraft('task-div-2')).toBeNull();
    clearTaskDraft('task-sub-1');
    expect(getTaskDraft('task-sub-1')).toBeNull();
  });
});
