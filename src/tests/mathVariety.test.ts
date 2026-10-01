import { describe, it, expect } from 'vitest';
import {
  generateDailyMathPlan,
  generateWeeklyMathTasks,
  validateMathWeeklyPlan,
  calculateMathCategoryPoolStatistics,
  getTotalUniqueSafeMathCombinations,
  getMathExerciseSignature,
} from '../services/mathExerciseEngine';
import { sampleFromPool, POOL_WED_MULTIPLIKATION } from '../services/mathQuestionPools';
import { validateMathExercise, validateUserMathAnswer } from '../services/deterministicMathEngine';
import { DayOfWeek } from '../types/lernwoerter';

describe('Math Variety & Anti-Repetition Tests', () => {
  it('has sufficient combinations in all category pools', () => {
    const poolStats = calculateMathCategoryPoolStatistics();
    const totalCombinations = getTotalUniqueSafeMathCombinations();
    expect(totalCombinations).toBeGreaterThanOrEqual(200);

    const categories = Object.keys(poolStats);
    expect(categories.length).toBeGreaterThanOrEqual(18);

    for (const [, stat] of Object.entries(poolStats)) {
      expect(stat.uniqueSafeCombinations).toBeGreaterThanOrEqual(12);
    }
  });

  it('generates 12 consecutive weeks without duplicate tasks', () => {
    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const seenSignaturesAcrossWeeks = new Map<string, { week: number; day: string; title: string }>();
    let totalTasksChecked = 0;

    for (let w = 1; w <= 12; w++) {
      const weeklyReport = validateMathWeeklyPlan({ weekNumber: w });
      expect(weeklyReport.isValid).toBe(true);

      const weeklyTasks = generateWeeklyMathTasks({ weekNumber: w });

      days.forEach((day) => {
        const tasks = weeklyTasks[day];
        expect(tasks.length).toBe(3);

        tasks.forEach((t) => {
          totalTasksChecked++;
          const val = validateMathExercise(t);
          expect(val.isValid).toBe(true);

          const sig = t.signature || getMathExerciseSignature(t);
          expect(sig).toBeTruthy();
          expect(seenSignaturesAcrossWeeks.has(sig)).toBe(false);

          seenSignaturesAcrossWeeks.set(sig, { week: w, day, title: t.title });
        });
      });
    }

    expect(totalTasksChecked).toBe(216);
    expect(seenSignaturesAcrossWeeks.size).toBe(216);
  });

  it('excludes recent history to prevent immediate repetition', () => {
    const historyToExclude = [
      'addition:430+20',
      'neighbourTens:457',
      'doubling:320',
      'multiplication:7x8',
      'subtraction:860-40',
    ];

    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const planWithHistory = generateWeeklyMathTasks({
      weekNumber: 1,
      history: historyToExclude,
    });

    days.forEach((d) => {
      planWithHistory[d].forEach((task) => {
        const sig = task.signature || getMathExerciseSignature(task);
        expect(historyToExclude.includes(sig)).toBe(false);
      });
    });
  });

  it('serves adaptive remediation variants before repeating failed facts', () => {
    const remediatedSample = sampleFromPool({
      pool: POOL_WED_MULTIPLIKATION,
      getSignature: (item) => `multiplication:${item.a}x${item.b}`,
      weekNumber: 1,
      recentHistory: ['multiplication:7x8'],
      isRemediation: true,
    });
    const sig = `multiplication:${remediatedSample.a}x${remediatedSample.b}`;
    expect(sig).toBe('multiplication:6x8');
    expect(sig).not.toBe('multiplication:7x8');
  });
});
