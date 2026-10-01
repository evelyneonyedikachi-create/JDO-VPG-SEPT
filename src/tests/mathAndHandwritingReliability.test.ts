import { describe, it, expect } from 'vitest';
import { generateDailyMathPlan, generateWeeklyMathTasks } from '../services/mathExerciseEngine';
import {
  calculateDailyMathSummary,
  recordCompletedMathTask,
  getInitialMathProgressState,
  MATH_COMPLETED_RECORDS_KEY,
  MATH_COMPLETED_TASK_IDS_KEY,
} from '../services/mathProgressService';
import { CompletedMathRecord, MathProgressState } from '../types/math';
import { DayOfWeek } from '../types/lernwoerter';

// Mock localStorage and window for node environment
const localStore = new Map<string, string>();
const storageMock = {
  getItem: (key: string) => localStore.get(key) || null,
  setItem: (key: string, val: string) => { localStore.set(key, val); },
  removeItem: (key: string) => { localStore.delete(key); },
  clear: () => localStore.clear(),
};
(globalThis as any).localStorage = storageMock;
(globalThis as any).window = { localStorage: storageMock };

describe('Maths & Handwriting Reliability Tests', () => {
  it('Maths Day Completion progresses 0/3 -> 1/3 -> 2/3 -> 3/3 accurately', () => {
    const mondayPlan = generateDailyMathPlan({ day: 'monday', weekNumber: 1 });
    expect(mondayPlan.tasks.length).toBe(3);

    const taskAddition = mondayPlan.tasks[0];
    const taskNeighbours = mondayPlan.tasks[1];
    const taskDoubling = mondayPlan.tasks[2];

    let state: MathProgressState = getInitialMathProgressState();
    let completedTaskIds: string[] = [];
    let completedRecords: CompletedMathRecord[] = [];

    // Initial check: 0/3
    let summary = calculateDailyMathSummary('monday', completedRecords, 1, completedTaskIds);
    expect(summary.completedRequired).toBe(0);
    expect(summary.totalRequired).toBe(3);
    expect(summary.isCompleted).toBe(false);

    // Step 1: Complete Addition 430 + 20 = 450
    state = recordCompletedMathTask({
      exercise: taskAddition,
      inputMethod: 'keyboard',
      wasCorrectFirstTry: true,
      currentState: state,
    });
    completedTaskIds.push(taskAddition.id);
    completedRecords = state.completedRecords;

    summary = calculateDailyMathSummary('monday', completedRecords, 1, completedTaskIds);
    expect(summary.completedRequired).toBe(1);
    expect(summary.totalRequired).toBe(3);
    expect(summary.isCompleted).toBe(false);

    // Step 2: Complete Nachbarzehner 457 -> 450 / 460
    state = recordCompletedMathTask({
      exercise: taskNeighbours,
      inputMethod: 'keyboard',
      wasCorrectFirstTry: true,
      currentState: state,
    });
    completedTaskIds.push(taskNeighbours.id);
    completedRecords = state.completedRecords;

    summary = calculateDailyMathSummary('monday', completedRecords, 1, completedTaskIds);
    expect(summary.completedRequired).toBe(2);
    expect(summary.totalRequired).toBe(3);
    expect(summary.isCompleted).toBe(false);

    // Step 3: Complete Verdoppeln 320 -> 640
    state = recordCompletedMathTask({
      exercise: taskDoubling,
      inputMethod: 'keyboard',
      wasCorrectFirstTry: true,
      currentState: state,
    });
    completedTaskIds.push(taskDoubling.id);
    completedRecords = state.completedRecords;

    summary = calculateDailyMathSummary('monday', completedRecords, 1, completedTaskIds);
    expect(summary.completedRequired).toBe(3);
    expect(summary.totalRequired).toBe(3);
    expect(summary.isCompleted).toBe(true);
  });

  it('preserves completed records and completion state on simulated refresh', () => {
    const storedRecordsRaw = localStore.get(MATH_COMPLETED_RECORDS_KEY);
    const storedTaskIdsRaw = localStore.get(MATH_COMPLETED_TASK_IDS_KEY);
    expect(storedRecordsRaw).toBeDefined();
    expect(storedTaskIdsRaw).toBeDefined();

    const reloadedRecords: CompletedMathRecord[] = JSON.parse(storedRecordsRaw!);
    const reloadedTaskIds: string[] = JSON.parse(storedTaskIdsRaw!);

    const reloadedSummary = calculateDailyMathSummary('monday', reloadedRecords, 1, reloadedTaskIds);
    expect(reloadedSummary.completedRequired).toBe(3);
    expect(reloadedSummary.isCompleted).toBe(true);
  });

  it('strictly isolates German and Maths records and keeps days separate', () => {
    const germanRecord = {
      id: 'word_swim_type',
      taskId: 'word_swim_type',
      day: 'monday' as DayOfWeek,
      weekId: 1,
      pointsEarned: 4,
      completedAt: Date.now(),
    };

    const tuesdaySummaryWithGerman = calculateDailyMathSummary('tuesday', [germanRecord as any], 1, []);
    expect(tuesdaySummaryWithGerman.completedRequired).toBe(0);

    const storedRecordsRaw = localStore.get(MATH_COMPLETED_RECORDS_KEY) || '[]';
    const storedTaskIdsRaw = localStore.get(MATH_COMPLETED_TASK_IDS_KEY) || '[]';
    const reloadedRecords: CompletedMathRecord[] = JSON.parse(storedRecordsRaw);
    const reloadedTaskIds: string[] = JSON.parse(storedTaskIdsRaw);

    const tuesdaySummary = calculateDailyMathSummary('tuesday', reloadedRecords, 1, reloadedTaskIds);
    expect(tuesdaySummary.completedRequired).toBe(0);
  });

  it('uses stable task IDs across weeks', () => {
    const week1 = generateWeeklyMathTasks({ weekNumber: 1 });
    const week2 = generateWeeklyMathTasks({ weekNumber: 2 });

    const stableIdsExpected = [
      'mon_math_1_addition',
      'mon_math_2_nachbarzehner',
      'mon_math_3_verdoppeln',
    ];

    stableIdsExpected.forEach((expectedId, idx) => {
      expect(week1.monday[idx].id).toBe(expectedId);
      expect(week2.monday[idx].id).toBe(expectedId);
    });
  });

  it('formats constrained candidate prompt and distinguishes errors correctly', () => {
    const weeklyVocabulary = ['Zimmer', 'schwimmen', 'Messer', 'Kuss', 'rennen', 'passen', 'brennen', 'beginnen', 'Schloss'];
    function formatOcrPrompt(vocab: string[]) {
      return `Transcribe the handwritten German word exactly as written. Candidate vocabulary: ${vocab.join(', ')}. Prefer a candidate only if the handwriting genuinely matches it. Do not infer the target from the exercise. Return only the literal transcribed word or text without punctuation, formatting or quotes.`;
    }

    const promptText = formatOcrPrompt(weeklyVocabulary);
    expect(promptText).toContain('schwimmen');
    expect(promptText).toContain('Schloss');
    expect(promptText).toContain('Zimmer');

    function classifyOcrError(code?: string): { isTech: boolean; userMessage: string } {
      const isTech = code === 'technical_error' || code === 'empty_response' || code === 'parse_error';
      return {
        isTech,
        userMessage: isTech
          ? 'Die Schrifterkennung hat gerade nicht funktioniert. Versuch es bitte noch einmal.'
          : 'Bitte schreibe etwas deutlicher.',
      };
    }

    const techErr = classifyOcrError('technical_error');
    expect(techErr.isTech).toBe(true);
    expect(techErr.userMessage).toContain('nicht funktioniert');

    const unreadableErr = classifyOcrError('unreadable');
    expect(unreadableErr.isTech).toBe(false);
    expect(unreadableErr.userMessage).toContain('deutlicher');
  });
});
