import React from 'react';
import {
  DayOfWeek,
  PausedSessionState,
  SkippedExerciseItem,
} from '../types/lernwoerter';
import {
  DayProgressSummary,
  NextRecommendedTask,
  WeeklyOverviewStats,
} from '../types/progress';
import {
  CheckCircle2,
  Trophy,
  ArrowRight,
  Clock,
  Sparkles,
  Flame,
  Star,
  SkipForward,
  Play,
  RotateCcw,
  Target,
  Pause,
  AlertCircle,
  Award,
} from 'lucide-react';
import { playChime } from '../utils/soundEffects';
import { DAYS_ORDER } from '../services/progressService';

interface WeeklyProgressPanelProps {
  currentDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  daysProgress: Record<DayOfWeek, DayProgressSummary>;
  weeklyOverview: WeeklyOverviewStats;
  nextTask: NextRecommendedTask;
  onStartNextTask: () => void;
  onOpenSkipped?: () => void;
  onOpenTaskDirectly?: (day: DayOfWeek, taskId: string) => void;
}

export const WeeklyProgressPanel: React.FC<WeeklyProgressPanelProps> = ({
  currentDay,
  onSelectDay,
  daysProgress,
  weeklyOverview,
  nextTask,
  onStartNextTask,
  onOpenSkipped,
  onOpenTaskDirectly,
}) => {
  const [expandedDay, setExpandedDay] = React.useState<DayOfWeek | null>(null);
  return (
    <div className="w-full space-y-5">
      {/* END-OF-WEEK CELEBRATION (Section 11) */}
      {weeklyOverview.isAllWeekCompleted && (
        <div className="bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-4 animate-fade-in">
          <div className="text-5xl sm:text-6xl animate-bounce-subtle">🎉</div>
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black">
              🎉 Woche geschafft!
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base font-semibold">
              Du hast alle Pflichtaufgaben erledigt.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-lg sm:text-xl">
            {weeklyOverview.isFullPointsEarned ? (
              <>
                <Trophy className="w-6 h-6 text-amber-300" />
                <span>🏆 100 / 100 Punkte</span>
              </>
            ) : (
              <>
                <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
                <span>{weeklyOverview.pointsWeek} / 100 Punkte • Alle Aufgaben erledigt</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* SECTION 7: PROMINENT "ALS NÄCHSTES" CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-indigo-200 hover:border-indigo-400 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xl text-indigo-700 shadow-2xs">
              ⭐
            </div>
            <div>
              <div className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                Automatische Empfehlung
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Als Nächstes
              </h3>
            </div>
          </div>

          {/* Reason Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{nextTask.reasonBadge}</span>
          </span>
        </div>

        {/* Task Details Banner */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/50 p-4 sm:p-5 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white uppercase">
                {daysProgress[nextTask.day]?.dayLabel || nextTask.day}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Noch ca. {nextTask.estimatedMinutes} Minuten</span>
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-black text-slate-900">
              {nextTask.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {nextTask.prompt}
            </p>
          </div>

          <button
            onClick={() => {
              playChime('click');
              onStartNextTask();
            }}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base shadow-md active:scale-95 flex items-center justify-center gap-2 transition-transform shrink-0"
          >
            <span>Jetzt starten</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 5 & 6: WEEKLY OVERVIEW STATUS & FULL-POINTS REQUIREMENT */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-black text-slate-900">
              Wochen-Übersicht: {weeklyOverview.totalCompletedWeekly} von {weeklyOverview.totalRequiredWeekly} Aufgaben erledigt
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              {weeklyOverview.remainingRequiredWeekly === 0 ? (
                <span className="text-emerald-700 font-bold">
                  ✅ Alle {weeklyOverview.totalRequiredWeekly} Pflichtaufgaben der Woche abgeschlossen!
                </span>
              ) : (
                <span>Noch {weeklyOverview.remainingRequiredWeekly} Aufgaben für alle Wochenpunkte</span>
              )}
            </p>
          </div>

          {/* Points Progress */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
            <Trophy className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-xs font-bold text-amber-800">Wochen-Punkte</div>
              <div className="text-base font-black text-amber-950">
                {weeklyOverview.pointsWeek} / {weeklyOverview.maxPointsWeek} Pkt
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar towards 30 weekly tasks */}
        <div className="space-y-1.5">
          <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (weeklyOverview.totalCompletedWeekly /
                      Math.max(1, weeklyOverview.totalRequiredWeekly)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Section 6: Full-points requirement notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <span>
              {weeklyOverview.remainingRequiredWeekly === 0
                ? 'Super! Du hast alle Pflichtaufgaben erledigt.'
                : `Für 100/100 Wochenpunkte fehlen dir noch ${weeklyOverview.remainingRequiredWeekly} Aufgabe${
                    weeklyOverview.remainingRequiredWeekly > 1 ? 'n' : ''
                  }.`}
            </span>
          </div>

          {weeklyOverview.totalSkippedCount > 0 && (
            <span className="font-bold text-orange-900 bg-orange-100 px-2.5 py-1 rounded-xl border border-orange-200 flex items-center gap-1 self-start sm:self-auto">
              <span>⏩</span>
              <span>
                {weeklyOverview.totalSkippedCount} übersprungene Aufgabe{weeklyOverview.totalSkippedCount > 1 ? 'n' : ''} müssen noch nachgeholt werden.
              </span>
            </span>
          )}
        </div>

        {/* SECTION 3 & 4: DAY NAVIGATION CARDS WITH EXACT OUTSTANDING TASKS (User Request) */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400 tracking-wider">
            <span>Wochentage im Überblick:</span>
            <span className="text-[11px] text-indigo-600 font-bold lowercase">
              Tippe auf einen Tag für offene Aufgaben
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {DAYS_ORDER.map((day) => {
              const summary = daysProgress[day];
              const isSelected = currentDay === day;
              const isExpanded = expandedDay === day;
              const hasOutstanding = summary.outstandingTasks && summary.outstandingTasks.length > 0;

              return (
                <div
                  key={day}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                      : summary.isCompleted
                      ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    playChime('click');
                    onSelectDay(day);
                    setExpandedDay(isExpanded ? null : day);
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xl">{summary.dayIcon}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {summary.completedRequired}/{summary.totalRequired}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-sm font-black text-slate-900 flex items-center justify-between">
                      <span>{summary.dayLabel}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {isExpanded ? '▴' : '▾'}
                      </span>
                    </div>

                    {/* Exact Day Card Summary (User Request) */}
                    {summary.isCompleted ? (
                      <div className="text-[11px] font-black text-emerald-700">
                        ✅ 5 von 5 geschafft
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-black text-slate-700">
                          {summary.completedRequired} von {summary.totalRequired} geschafft
                        </div>
                        {summary.outstandingTasks && summary.outstandingTasks.length === 1 && (
                          <div className="text-[10px] font-bold text-amber-900 truncate" title={`Offen: ${summary.outstandingTasks[0].title}`}>
                            Offen: {summary.outstandingTasks[0].title}
                          </div>
                        )}
                        {summary.outstandingTasks && summary.outstandingTasks.length > 1 && (
                          <div className="text-[10px] font-bold text-amber-800">
                            Noch {summary.outstandingTasks.length} Aufgaben offen
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Visual Status Badge & Toggle */}
                  <div className="pt-1 flex items-center justify-between gap-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${summary.statusBadge.color}`}
                    >
                      <span>{summary.statusBadge.icon}</span>
                      <span>{summary.statusBadge.label}</span>
                    </span>
                    {hasOutstanding && (
                      <span className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800">
                        {isExpanded ? '▴ Weniger' : '▾ Details'}
                      </span>
                    )}
                  </div>

                  {/* Inline Expandable List on Card Click (User Request: Tap to reveal exact outstanding tasks) */}
                  {isExpanded && hasOutstanding && (
                    <div className="mt-2 pt-2 border-t border-slate-200/90 space-y-1 animate-fade-in">
                      <div className="text-[9px] font-black text-amber-900 uppercase tracking-wider">
                        Offene Aufgaben ({summary.outstandingTasks.length}):
                      </div>
                      <div className="space-y-1">
                        {summary.outstandingTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              playChime('click');
                              if (onOpenTaskDirectly) {
                                onOpenTaskDirectly(day, task.id);
                              } else {
                                onSelectDay(day);
                              }
                            }}
                            className="text-[10px] font-bold text-slate-800 hover:text-indigo-700 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs hover:border-indigo-400 flex items-center justify-between gap-1 transition-all active:scale-95 cursor-pointer"
                            title={`Klicke hier, um „${task.title}“ direkt zu öffnen`}
                          >
                            <span className="truncate min-w-0 font-bold">
                              • {task.title}
                            </span>
                            <span
                              className={`shrink-0 text-[9px] font-black px-1 rounded border ${task.statusBadge.color}`}
                            >
                              {task.statusBadge.icon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* EXPANDABLE DETAIL DRAWER: EXACT OUTSTANDING TASKS (User Request) */}
          {expandedDay && daysProgress[expandedDay] && (
            <div className="mt-3 p-4 sm:p-5 rounded-3xl bg-indigo-50/80 border-2 border-indigo-200 animate-fade-in space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{daysProgress[expandedDay].dayIcon}</span>
                  <div>
                    <h5 className="text-base sm:text-lg font-black text-slate-900">
                      Aufgaben für {daysProgress[expandedDay].dayLabel}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium">
                      {daysProgress[expandedDay].isCompleted
                        ? 'Alle 5 Aufgaben dieser Tages-Mission wurden erfolgreich gemeistert! 🎉'
                        : `${daysProgress[expandedDay].completedRequired} von ${daysProgress[expandedDay].totalRequired} erledigt. Klicke eine offene Aufgabe, um sie direkt zu starten:`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedDay(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
                >
                  Schließen ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {daysProgress[expandedDay].tasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        playChime('click');
                        if (onOpenTaskDirectly) {
                          onOpenTaskDirectly(expandedDay, task.id);
                        } else {
                          onSelectDay(expandedDay);
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isDone
                          ? 'bg-white/80 border-emerald-200 hover:bg-emerald-50/50'
                          : 'bg-white border-slate-300 shadow-xs hover:border-indigo-500 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${task.statusBadge.color}`}
                          >
                            {task.statusBadge.icon} {task.statusBadge.label}
                          </span>
                          <span className="text-sm font-black text-slate-900 truncate">
                            {task.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {task.prompt}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isDone ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>+{task.pointsEarned || 4} Pkt</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-xs flex items-center gap-1">
                            <span>Starten</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
