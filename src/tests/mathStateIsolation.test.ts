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
import { StandardArithmeticExercise, DoublingHalvingExercise } from '../types/math';

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

console.log('--- Running Math State Isolation QA Tests ---');

// 1. Run engine isolation suite
const qaResult = runMathStateIsolationQA();
console.log(`Suite result: ${qaResult.allPassed ? 'ALL PASSED' : 'FAILED'}`);
for (const r of qaResult.results) {
  console.log(`  [${r.passed ? 'PASS' : 'FAIL'}] ${r.testName}`);
  if (!r.passed) {
    console.error(`    Error: ${r.message}`);
    process.exit(1);
  }
}

// 2. Exact test cases specified in prompt:
// 7 × 8 → only 56 accepted
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
if (validateUserMathAnswer(task7x8, '60').isCorrect) {
  throw new Error('Test failed: 7 × 8 accepted 60');
}
if (!validateUserMathAnswer(task7x8, '56').isCorrect) {
  throw new Error('Test failed: 7 × 8 rejected 56');
}

// 860 − 40 → only 820 accepted
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
if (validateUserMathAnswer(task860minus40, '7').isCorrect) {
  throw new Error('Test failed: 860 − 40 accepted 7');
}
if (!validateUserMathAnswer(task860minus40, '820').isCorrect) {
  throw new Error('Test failed: 860 − 40 rejected 820');
}

// 35 ÷ 5 → only 7 accepted
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
if (validateUserMathAnswer(task35div5, '820').isCorrect) {
  throw new Error('Test failed: 35 ÷ 5 accepted 820');
}
if (!validateUserMathAnswer(task35div5, '7').isCorrect) {
  throw new Error('Test failed: 35 ÷ 5 rejected 7');
}

// 48 ÷ 6 → only 8 accepted
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
if (validateUserMathAnswer(task48div6, '24').isCorrect) {
  throw new Error('Test failed: 48 ÷ 6 accepted 24');
}
if (!validateUserMathAnswer(task48div6, '8').isCorrect) {
  throw new Error('Test failed: 48 ÷ 6 rejected 8');
}

// 3. Navigation test sequence:
// Step 1: Solve 860 - 40 = 820
const step1 = validateUserMathAnswer(task860minus40, '820');
if (!step1.isCorrect) throw new Error('Navigation Step 1 failed');

// Step 2: Move to 35 ÷ 5
// Input must be empty by default, and if 820 leaks it must be rejected
const step2_leak = validateUserMathAnswer(task35div5, '820');
if (step2_leak.isCorrect) throw new Error('Navigation Step 2 failed: 35 ÷ 5 accepted 820');

// Step 3: Enter 7 -> correct
const step2_correct = validateUserMathAnswer(task35div5, '7');
if (!step2_correct.isCorrect) throw new Error('Navigation Step 3 failed: 35 ÷ 5 rejected 7');

// 4. Draft isolation tests:
clearAllMathDrafts();
saveTaskDraft('task-sub-1', { typedAnswer: '820' });
if (getTaskDraft('task-sub-1')?.typedAnswer !== '820') {
  throw new Error('Draft test failed: could not retrieve task draft');
}
if (getTaskDraft('task-div-2') !== null) {
  throw new Error('Draft test failed: draft leaked to another task ID!');
}
clearTaskDraft('task-sub-1');
if (getTaskDraft('task-sub-1') !== null) {
  throw new Error('Draft test failed: draft was not cleared!');
}

console.log('✅ ALL MATH STATE ISOLATION & DETERMINISTIC TESTS PASSED SUCCESSFULLY!');
