import { DayOfWeek } from '../types/lernwoerter';

export type TaskVisualStatus =
  | 'completed' // ✅ Erledigt
  | 'next' // ⭐ Als Nächstes
  | 'open' // 🟡 Offen
  | 'skipped' // ⏩ Übersprungen
  | 'paused' // ⏸ Pausiert
  | 'focus' // 🎯 Schwerpunkt
  | 'repeat'; // 🔁 Freiwillig wiederholen

export interface CompletedExerciseRecord {
  id: string; // exercise ID
  day: DayOfWeek;
  pointsEarned: number;
  completedAt: number;
  isVoluntaryRepeat?: boolean;
}

export interface DayProgressSummary {
  day: DayOfWeek;
  dayLabel: string;
  dayIcon: string;
  avatar: string;
  totalRequired: number; // 5 required exercises per day
  completedRequired: number;
  openCount: number;
  skippedCount: number;
  isPaused: boolean;
  isCompleted: boolean;
  statusText: string;
  statusBadge: {
    label: string;
    icon: string;
    color: string; // Tailwind class
  };
}

export interface NextRecommendedTask {
  type: 'paused' | 'skipped' | 'unfinished_earlier' | 'today_recommended' | 'weak_area';
  day: DayOfWeek;
  title: string;
  prompt: string;
  estimatedMinutes: number;
  reasonBadge: string;
  priorityOrder: number;
  exerciseId?: string;
  exerciseData?: any;
}

export interface WeeklyOverviewStats {
  totalRequiredWeekly: number; // 30 (6 days x 5 tasks)
  totalCompletedWeekly: number;
  remainingRequiredWeekly: number;
  completedDaysCount: number;
  outstandingDaysCount: number;
  totalSkippedCount: number;
  pausedDaysCount: number;
  isAllWeekCompleted: boolean;
  isFullPointsEarned: boolean;
  pointsWeek: number;
  maxPointsWeek: number; // 100
  potentialPointsStillAttainable: number;
}
