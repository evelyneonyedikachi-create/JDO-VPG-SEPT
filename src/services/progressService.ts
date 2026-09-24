import { DayOfWeek, LernwortItem, PausedSessionState, SkippedExerciseItem } from '../types/lernwoerter';
import {
  CompletedExerciseRecord,
  DayProgressSummary,
  NextRecommendedTask,
  WeeklyOverviewStats,
} from '../types/progress';
import { generateDailyExercisePlan } from './exerciseEngine';

export const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const DAY_METADATA: Record<DayOfWeek, { label: string; icon: string; avatar: string }> = {
  monday: { label: 'Montag', icon: '🔍', avatar: 'Mia' },
  tuesday: { label: 'Dienstag', icon: '⚽', avatar: 'Ben' },
  wednesday: { label: 'Mittwoch', icon: '🏗️', avatar: 'Leo' },
  thursday: { label: 'Donnerstag', icon: '✍️', avatar: 'Sophie' },
  friday: { label: 'Freitag', icon: '📖', avatar: 'Sophie' },
  saturday: { label: 'Samstag', icon: '🏆', avatar: 'Challenge' },
};

/**
 * Calculates day progress summaries for all 6 days.
 * Strictly checks mandatory tasks (5 per day), paused sessions, and skipped exercises.
 */
export function calculateAllDaysProgress({
  words,
  completedRecords,
  pausedSession,
  skippedExercises,
}: {
  words: LernwortItem[];
  completedRecords: CompletedExerciseRecord[];
  pausedSession: PausedSessionState | null;
  skippedExercises: SkippedExerciseItem[];
}): Record<DayOfWeek, DayProgressSummary> {
  const result: Partial<Record<DayOfWeek, DayProgressSummary>> = {};

  DAYS_ORDER.forEach((day) => {
    const meta = DAY_METADATA[day];
    // Generate the standard daily mandatory plan (5 tasks)
    const plan = generateDailyExercisePlan({
      day,
      words,
      level: 'profi',
      skippedCount: skippedExercises.filter((s) => s.day === day).length,
    });

    const mandatoryIds = plan.heuteEmpfohlen.map((e) => e.id);
    const totalRequired = mandatoryIds.length || 5;

    // Filter completed records for this day that match mandatory exercise IDs
    // Also include exercise IDs if id matches directly or starts with the same root
    const dayCompletedIds = completedRecords
      .filter((r) => r.day === day)
      .map((r) => r.id);

    // Count how many mandatory tasks have been completed
    const completedCount = mandatoryIds.filter(
      (mId) => dayCompletedIds.includes(mId) || dayCompletedIds.some((cId) => cId.startsWith(mId))
    ).length;

    const daySkipped = skippedExercises.filter((s) => s.day === day).length;
    const isPaused = pausedSession !== null && pausedSession.day === day;
    const isCompleted = completedCount >= totalRequired;
    const openCount = Math.max(0, totalRequired - completedCount);

    // Construct user-facing text & badges according to requirements:
    // ✅ Geschafft
    // 🟡 Noch 2 Aufgaben / 🟠 1 Aufgabe offen
    // ⏩ 1 Aufgabe übersprungen
    // ⏸ Pausiert
    let statusText = 'Offen';
    let statusBadge = {
      label: 'Offen',
      icon: '🟡',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
    };

    if (isCompleted) {
      statusText = 'Geschafft';
      statusBadge = {
        label: 'Geschafft',
        icon: '✅',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    } else if (isPaused) {
      statusText = 'Pausiert';
      statusBadge = {
        label: 'Pausiert',
        icon: '⏸',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    } else if (daySkipped > 0) {
      statusText = `${daySkipped} Aufgabe${daySkipped > 1 ? 'n' : ''} übersprungen`;
      statusBadge = {
        label: `${daySkipped} übersprungen`,
        icon: '⏩',
        color: 'bg-orange-100 text-orange-900 border-orange-300',
      };
    } else if (openCount === 1) {
      statusText = '1 Aufgabe offen';
      statusBadge = {
        label: '1 Aufgabe offen',
        icon: '🟠',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
      };
    } else if (openCount > 1) {
      statusText = `Noch ${openCount} Aufgaben`;
      statusBadge = {
        label: `Noch ${openCount} Aufgaben`,
        icon: '🟡',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }

    result[day] = {
      day,
      dayLabel: meta.label,
      dayIcon: meta.icon,
      avatar: meta.avatar,
      totalRequired,
      completedRequired: completedCount,
      openCount,
      skippedCount: daySkipped,
      isPaused,
      isCompleted,
      statusText,
      statusBadge,
    };
  });

  return result as Record<DayOfWeek, DayProgressSummary>;
}

/**
 * Calculates weekly overview stats.
 */
export function calculateWeeklyOverview({
  daysProgress,
  pointsWeek,
  skippedExercises,
  pausedSession,
}: {
  daysProgress: Record<DayOfWeek, DayProgressSummary>;
  pointsWeek: number;
  skippedExercises: SkippedExerciseItem[];
  pausedSession: PausedSessionState | null;
}): WeeklyOverviewStats {
  let totalRequiredWeekly = 0;
  let totalCompletedWeekly = 0;
  let completedDaysCount = 0;
  let outstandingDaysCount = 0;

  DAYS_ORDER.forEach((d) => {
    const summary = daysProgress[d];
    if (summary) {
      totalRequiredWeekly += summary.totalRequired;
      totalCompletedWeekly += summary.completedRequired;
      if (summary.isCompleted) {
        completedDaysCount += 1;
      } else {
        outstandingDaysCount += 1;
      }
    }
  });

  const remainingRequiredWeekly = Math.max(0, totalRequiredWeekly - totalCompletedWeekly);
  const isAllWeekCompleted = remainingRequiredWeekly === 0 && skippedExercises.length === 0;
  const isFullPointsEarned = pointsWeek >= 100;
  const potentialPointsStillAttainable = Math.min(100, pointsWeek + remainingRequiredWeekly * 4);

  return {
    totalRequiredWeekly,
    totalCompletedWeekly,
    remainingRequiredWeekly,
    completedDaysCount,
    outstandingDaysCount,
    totalSkippedCount: skippedExercises.length,
    pausedDaysCount: pausedSession ? 1 : 0,
    isAllWeekCompleted,
    isFullPointsEarned,
    pointsWeek,
    maxPointsWeek: 100,
    potentialPointsStillAttainable,
  };
}

/**
 * Determines "Was sollte ich als Nächstes tun?" based on the strict 5-tier priority order:
 * 1. paused task
 * 2. skipped required task
 * 3. unfinished task from an earlier day
 * 4. today's recommended task
 * 5. weak-area review
 */
export function determineNextRecommendedTask({
  currentDay,
  words,
  daysProgress,
  pausedSession,
  skippedExercises,
  weakWords,
  completedRecords,
}: {
  currentDay: DayOfWeek;
  words: LernwortItem[];
  daysProgress: Record<DayOfWeek, DayProgressSummary>;
  pausedSession: PausedSessionState | null;
  skippedExercises: SkippedExerciseItem[];
  weakWords: string[];
  completedRecords: CompletedExerciseRecord[];
}): NextRecommendedTask {
  // PRIORITY 1: Paused task
  if (pausedSession) {
    const dayMeta = DAY_METADATA[pausedSession.day];
    return {
      type: 'paused',
      day: pausedSession.day,
      title: `${dayMeta.label} – Pausierte Einheit fortsetzen`,
      prompt: `Aufgabe ${pausedSession.exerciseIndex + 1} wartet darauf, abgeschlossen zu werden!`,
      estimatedMinutes: 3,
      reasonBadge: '⏸ Pausiert',
      priorityOrder: 1,
    };
  }

  // PRIORITY 2: Skipped required task
  if (skippedExercises.length > 0) {
    const firstSkip = skippedExercises[0];
    const dayMeta = DAY_METADATA[firstSkip.day];
    return {
      type: 'skipped',
      day: firstSkip.day,
      title: `${dayMeta.label} – ${firstSkip.title}`,
      prompt: firstSkip.prompt || `Übersprungene Pflichtaufgabe nachholen (${firstSkip.wordClean})`,
      estimatedMinutes: 3,
      reasonBadge: '⏩ Übersprungen',
      priorityOrder: 2,
      exerciseId: firstSkip.exerciseId,
      exerciseData: firstSkip.exerciseData,
    };
  }

  // PRIORITY 3: Unfinished task from an earlier day in the week
  const currentDayIndex = DAYS_ORDER.indexOf(currentDay);
  for (let i = 0; i < currentDayIndex; i++) {
    const earlierDay = DAYS_ORDER[i];
    const summary = daysProgress[earlierDay];
    if (summary && !summary.isCompleted) {
      const dayMeta = DAY_METADATA[earlierDay];
      return {
        type: 'unfinished_earlier',
        day: earlierDay,
        title: `${dayMeta.label} – Noch ${summary.openCount} offene Pflichtaufgabe${summary.openCount > 1 ? 'n' : ''}`,
        prompt: `Schließe ${dayMeta.label} ab, um alle ${summary.totalRequired} Aufgaben zu meistern!`,
        estimatedMinutes: summary.openCount * 3,
        reasonBadge: '🟡 Früherer Tag nachholen',
        priorityOrder: 3,
      };
    }
  }

  // PRIORITY 4: Today's recommended task (if today is not yet complete)
  const todaySummary = daysProgress[currentDay];
  if (todaySummary && !todaySummary.isCompleted) {
    const dayMeta = DAY_METADATA[currentDay];
    // Find first unfinished exercise for today
    const plan = generateDailyExercisePlan({
      day: currentDay,
      words,
      level: 'profi',
    });
    const completedIds = completedRecords
      .filter((r) => r.day === currentDay)
      .map((r) => r.id);
    const nextUnfinished = plan.heuteEmpfohlen.find(
      (e) => !completedIds.includes(e.id) && !completedIds.some((c) => c.startsWith(e.id))
    ) || plan.heuteEmpfohlen[0];

    return {
      type: 'today_recommended',
      day: currentDay,
      title: `${dayMeta.label} – ${nextUnfinished.title}`,
      prompt: nextUnfinished.prompt,
      estimatedMinutes: 4,
      reasonBadge: '⭐ Als Nächstes empfohlen',
      priorityOrder: 4,
      exerciseId: nextUnfinished.id,
      exerciseData: nextUnfinished,
    };
  }

  // PRIORITY 5: Weak-area review or subsequent days
  if (weakWords.length > 0) {
    return {
      type: 'weak_area',
      day: currentDay,
      title: `Gezieltes Training: ${weakWords.slice(0, 3).join(', ')}`,
      prompt: 'Wiederhole deine persönlichen Stolperwörter, um dein Wissen zu festigen.',
      estimatedMinutes: 4,
      reasonBadge: '🎯 Schwerpunkt üben',
      priorityOrder: 5,
    };
  }

  // Fallback: If everything today is done, recommend next day or review
  const nextDay = DAYS_ORDER[Math.min(currentDayIndex + 1, DAYS_ORDER.length - 1)];
  const nextMeta = DAY_METADATA[nextDay];
  return {
    type: 'today_recommended',
    day: nextDay,
    title: `${nextMeta.label} vorbereiten`,
    prompt: `Tagesziel für heute erreicht! Du kannst freiwillig ${nextMeta.label} erkunden oder wiederholen.`,
    estimatedMinutes: 5,
    reasonBadge: '🔁 Freiwillig üben',
    priorityOrder: 5,
  };
}
