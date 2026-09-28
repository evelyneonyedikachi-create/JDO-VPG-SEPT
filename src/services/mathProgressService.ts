import { DayOfWeek } from '../types/lernwoerter';
import { CompletedMathRecord, MathExercise, MathProgressState, QuestionHistoryEntry } from '../types/math';
import { generateDailyMathPlan, getMathExerciseSignature } from './mathExerciseEngine';
import { queueProgressSync } from './progressSyncService';

const MATH_STORAGE_KEY = 'jd_math_progress_v1';
const MATH_QUESTION_HISTORY_KEY = 'jd_math_question_history_v1';

export function getInitialMathProgressState(): MathProgressState {
  return {
    completedTaskIds: [],
    completedRecords: [],
    skillsMastery: {},
    strugglingSkills: [],
    recentQuestionHistory: loadStoredQuestionSignatures(),
    questionHistoryEntries: [],
    currentWeekNumber: 1,
    pointsToday: 0,
    pointsWeek: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  };
}

export function loadStoredQuestionSignatures(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(MATH_QUESTION_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredQuestionSignatures(signatures: string[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(MATH_QUESTION_HISTORY_KEY, JSON.stringify(signatures.slice(-200)));
    }
  } catch (e) {
    console.warn('Failed to save math question history to localStorage:', e);
  }
}

export function loadMathProgressFromStorage(): MathProgressState {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return getInitialMathProgressState();
    }
    const raw = localStorage.getItem(MATH_STORAGE_KEY);
    const storedSignatures = loadStoredQuestionSignatures();

    if (!raw) {
      const init = getInitialMathProgressState();
      init.recentQuestionHistory = storedSignatures;
      return init;
    }

    const parsed = JSON.parse(raw);
    const combinedHistory = Array.from(
      new Set([
        ...(Array.isArray(parsed.recentQuestionHistory) ? parsed.recentQuestionHistory : []),
        ...storedSignatures,
      ])
    );

    return {
      completedTaskIds: Array.isArray(parsed.completedTaskIds) ? parsed.completedTaskIds : [],
      completedRecords: Array.isArray(parsed.completedRecords) ? parsed.completedRecords : [],
      skillsMastery: parsed.skillsMastery || {},
      strugglingSkills: Array.isArray(parsed.strugglingSkills) ? parsed.strugglingSkills : [],
      recentQuestionHistory: combinedHistory,
      questionHistoryEntries: Array.isArray(parsed.questionHistoryEntries) ? parsed.questionHistoryEntries : [],
      currentWeekNumber: typeof parsed.currentWeekNumber === 'number' ? parsed.currentWeekNumber : 1,
      pointsToday: typeof parsed.pointsToday === 'number' ? parsed.pointsToday : 0,
      pointsWeek: typeof parsed.pointsWeek === 'number' ? parsed.pointsWeek : 0,
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 1,
      lastActiveDate: parsed.lastActiveDate,
    };
  } catch {
    return getInitialMathProgressState();
  }
}

export function saveMathProgressToStorage(state: MathProgressState): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(MATH_STORAGE_KEY, JSON.stringify(state));
      if (state.recentQuestionHistory) {
        saveStoredQuestionSignatures(state.recentQuestionHistory);
      }
    }
    // Also push to persistent server progress endpoint via queueProgressSync
    queueProgressSync({
      mathProgress: state,
    });
  } catch (e) {
    console.warn('Failed to save math progress to localStorage:', e);
  }
}

export interface DayMathSummary {
  day: DayOfWeek;
  totalRequired: number;
  completedRequired: number;
  isCompleted: boolean;
  tasks: MathExercise[];
  completedTaskIds: string[];
}

export function calculateDailyMathSummary(
  day: DayOfWeek,
  completedRecords: CompletedMathRecord[],
  weekNumber: number = 1
): DayMathSummary {
  const plan = generateDailyMathPlan({ day, weekNumber });
  const dayCompletedIds = completedRecords
    .filter((r) => r.day === day)
    .map((r) => r.taskId);

  const completedSet = new Set(dayCompletedIds);
  let completedCount = 0;

  plan.tasks.forEach((t) => {
    if (completedSet.has(t.id)) {
      completedCount++;
    }
  });

  return {
    day,
    totalRequired: plan.tasks.length,
    completedRequired: completedCount,
    isCompleted: completedCount >= plan.tasks.length,
    tasks: plan.tasks,
    completedTaskIds: Array.from(completedSet),
  };
}

export function calculateAllDaysMathProgress(
  completedRecords: CompletedMathRecord[],
  weekNumber: number = 1
): Record<DayOfWeek, DayMathSummary> {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const result = {} as Record<DayOfWeek, DayMathSummary>;

  days.forEach((d) => {
    result[d] = calculateDailyMathSummary(d, completedRecords, weekNumber);
  });

  return result;
}

/**
 * Records a completed math task:
 * - Extracts and logs stable question signature for anti-repetition tracking.
 * - Duplicate protection: only awards points if not already completed!
 * - Updates skill mastery (2 consecutive correct -> temporarily mastered).
 * - Persists to local storage & queues server sync.
 */
export function recordCompletedMathTask(params: {
  exercise: MathExercise;
  inputMethod: 'keyboard' | 'handwriting';
  wasCorrectFirstTry: boolean;
  currentState: MathProgressState;
  handwrittenStrokes?: any[];
  scratchpadStrokes?: any[];
}): MathProgressState {
  const {
    exercise,
    inputMethod,
    wasCorrectFirstTry,
    currentState,
    handwrittenStrokes,
    scratchpadStrokes,
  } = params;

  const alreadyCompleted = currentState.completedTaskIds.includes(exercise.id);

  // If already completed, do not re-award points
  const pointsAwarded = alreadyCompleted ? 0 : exercise.points || 4;

  const signature = exercise.signature || getMathExerciseSignature(exercise);

  const newRecord: CompletedMathRecord = {
    id: exercise.id,
    taskId: exercise.id,
    day: exercise.day,
    skillName: exercise.skillName,
    pointsEarned: pointsAwarded,
    completedAt: Date.now(),
    inputMethod,
    wasCorrectFirstTry,
    attemptCount: wasCorrectFirstTry ? 1 : 2,
    handwrittenStrokes,
    scratchpadStrokes,
  };

  const updatedRecords = alreadyCompleted
    ? currentState.completedRecords
    : [...currentState.completedRecords, newRecord];

  const updatedTaskIds = alreadyCompleted
    ? currentState.completedTaskIds
    : [...currentState.completedTaskIds, exercise.id];

  // Update question history tracking: move newly completed signature to the end for accurate recency
  const currentHistory = currentState.recentQuestionHistory || [];
  const filteredHistory = currentHistory.filter((s) => s !== signature);
  const updatedHistory = [...filteredHistory, signature].slice(-200);

  const newEntry: QuestionHistoryEntry = {
    signature,
    skillName: exercise.skillName,
    weekNumber: exercise.weekNumber || currentState.currentWeekNumber || 1,
    completedAt: Date.now(),
    taskId: exercise.id,
  };

  const updatedEntries = [...(currentState.questionHistoryEntries || []), newEntry].slice(-200);

  // Update skills mastery
  const skill = currentState.skillsMastery[exercise.skillName] || {
    skillName: exercise.skillName,
    consecutiveCorrect: 0,
    mastered: false,
    lastAttemptAt: 0,
    totalAttempts: 0,
  };

  const newConsecutive = wasCorrectFirstTry ? skill.consecutiveCorrect + 1 : 0;
  const isMastered = newConsecutive >= 2;

  const updatedSkillsMastery = {
    ...currentState.skillsMastery,
    [exercise.skillName]: {
      ...skill,
      consecutiveCorrect: newConsecutive,
      mastered: isMastered,
      lastAttemptAt: Date.now(),
      totalAttempts: skill.totalAttempts + 1,
    },
  };

  // Struggling skills: skills with non-first-try attempts and not yet mastered
  const updatedStrugglingSkills = Object.values(updatedSkillsMastery)
    .filter((s) => !s.mastered && s.consecutiveCorrect === 0 && s.totalAttempts > 0)
    .map((s) => s.skillName);

  // Calculate points
  const todayDate = new Date().toISOString().slice(0, 10);
  const pointsToday = updatedRecords
    .filter((r) => new Date(r.completedAt).toISOString().slice(0, 10) === todayDate)
    .reduce((sum, r) => sum + r.pointsEarned, 0);

  const pointsWeek = updatedRecords.reduce((sum, r) => sum + r.pointsEarned, 0);

  const updatedState: MathProgressState = {
    ...currentState,
    completedTaskIds: updatedTaskIds,
    completedRecords: updatedRecords,
    skillsMastery: updatedSkillsMastery,
    strugglingSkills: updatedStrugglingSkills,
    recentQuestionHistory: updatedHistory,
    questionHistoryEntries: updatedEntries,
    pointsToday,
    pointsWeek,
    lastActiveDate: todayDate,
  };

  saveMathProgressToStorage(updatedState);
  return updatedState;
}

export function clearMathQuestionHistory(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(MATH_QUESTION_HISTORY_KEY);
    }
  } catch (e) {
    console.warn('Failed to clear question history from localStorage:', e);
  }
}
