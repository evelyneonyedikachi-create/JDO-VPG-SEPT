import React, { useState, useMemo } from 'react';
import { DayOfWeek } from '../../types/lernwoerter';
import { MathExercise, MathProgressState } from '../../types/math';
import {
  generateDailyMathPlan,
  validateMathWeeklyPlan,
  ALL_WEEKLY_MATH_TASKS,
} from '../../services/mathExerciseEngine';
import {
  calculateDailyMathSummary,
  recordCompletedMathTask,
} from '../../services/mathProgressService';
import { MathExerciseDispatcher } from './MathExerciseDispatcher';
import { playChime } from '../../utils/soundEffects';
import {
  CheckCircle2,
  Trophy,
  Flame,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Star,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatheTrainingWorkspaceProps {
  currentDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  mathProgress: MathProgressState;
  onUpdateMathProgress: (newState: MathProgressState) => void;
}

const DAY_LABELS: Record<DayOfWeek, { name: string; short: string; theme: string }> = {
  monday: { name: 'Montag', short: 'Mo', theme: 'Addition & Zahlenstrahl' },
  tuesday: { name: 'Dienstag', short: 'Di', theme: 'Subtraktion & Zahlenmauer' },
  wednesday: { name: 'Mittwoch', short: 'Mi', theme: 'Multiplikation & Rechentabelle' },
  thursday: { name: 'Donnerstag', short: 'Do', theme: 'Division & Rechenrad' },
  friday: { name: 'Freitag', short: 'Fr', theme: 'Sachaufgaben & Geld' },
  saturday: { name: 'Samstag', short: 'Sa', theme: '🏆 Wochen-Challenge' },
};

export const MatheTrainingWorkspace: React.FC<MatheTrainingWorkspaceProps> = ({
  currentDay,
  onSelectDay,
  mathProgress,
  onUpdateMathProgress,
}) => {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [showTestwocheModal, setShowTestwocheModal] = useState(false);

  const dailyPlan = useMemo(
    () =>
      generateDailyMathPlan({
        day: currentDay,
        strugglingSkills: mathProgress.strugglingSkills,
      }),
    [currentDay, mathProgress.strugglingSkills]
  );

  const dailySummary = useMemo(
    () => calculateDailyMathSummary(currentDay, mathProgress.completedRecords),
    [currentDay, mathProgress.completedRecords]
  );

  // Active task safely indexed
  const activeTask = dailyPlan.tasks[selectedTaskIndex] || dailyPlan.tasks[0];
  const isCurrentTaskCompleted =
    activeTask && mathProgress.completedTaskIds.includes(activeTask.id);

  const handleTaskSolved = (isCorrect: boolean) => {
    if (!isCorrect || !activeTask) return;

    const alreadyDone = mathProgress.completedTaskIds.includes(activeTask.id);

    const updated = recordCompletedMathTask({
      exercise: activeTask,
      inputMethod: 'keyboard',
      wasCorrectFirstTry: true,
      currentState: mathProgress,
    });

    onUpdateMathProgress(updated);

    if (!alreadyDone) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.75 },
      });
    }

    // Auto-advance to next unsolved task if available
    const nextUnsolved = dailyPlan.tasks.findIndex(
      (t, idx) => idx > selectedTaskIndex && !updated.completedTaskIds.includes(t.id)
    );
    if (nextUnsolved !== -1) {
      setTimeout(() => {
        setSelectedTaskIndex(nextUnsolved);
      }, 1200);
    }
  };

  const qaReport = useMemo(() => validateMathWeeklyPlan(), []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
            ➕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Mathe-Training • 3. / 4. Klasse
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Zahlenraum bis 1000
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {DAY_LABELS[currentDay].name} – {DAY_LABELS[currentDay].theme}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Dauer: ca. {dailyPlan.estimatedMinutes} Minuten • {dailyPlan.tasks.length} Aufgaben für heute
            </p>
          </div>
        </div>

        {/* Stats & Parent QA button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-sm font-black shadow-2xs">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>{mathProgress.pointsToday} Pkt</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm font-black shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {dailySummary.completedRequired} / {dailySummary.totalRequired} geschafft
            </span>
          </div>

          {/* Parent QA Checkpoint modal shortcut */}
          <button
            type="button"
            onClick={() => setShowTestwocheModal(true)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition-all text-xs flex items-center gap-1.5 shadow-2xs"
            title="Eltern: Mathe Testwoche & QA-Prüfung"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">QA Testwoche</span>
          </button>
        </div>
      </div>

      {/* Day Selector Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(Object.keys(DAY_LABELS) as DayOfWeek[]).map((day) => {
          const isSelected = currentDay === day;
          const sum = calculateDailyMathSummary(day, mathProgress.completedRecords);

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                playChime('click');
                onSelectDay(day);
                setSelectedTaskIndex(0);
              }}
              className={`flex-1 min-w-[120px] p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">
                  {DAY_LABELS[day].short}
                </span>
                {sum.isCompleted ? (
                  <CheckCircle2
                    className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}
                  />
                ) : (
                  <span
                    className={`text-[11px] font-black ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {sum.completedRequired}/{sum.totalRequired}
                  </span>
                )}
              </div>
              <div className="text-sm font-black truncate mt-1">
                {DAY_LABELS[day].name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Task Stepper Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        {dailyPlan.tasks.map((task, idx) => {
          const isCompleted = mathProgress.completedTaskIds.includes(task.id);
          const isSelected = selectedTaskIndex === idx;

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => {
                playChime('click');
                setSelectedTaskIndex(idx);
              }}
              className={`flex-1 min-w-[150px] px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-between gap-2 transition-all ${
                isSelected
                  ? 'bg-white text-indigo-900 shadow-sm border border-slate-300'
                  : isCompleted
                  ? 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-900 text-[11px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate">{task.title}</span>
              </div>
              {isCompleted && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Task Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-6">
        {/* Task Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Aufgabe {selectedTaskIndex + 1} von {dailyPlan.tasks.length} • {activeTask.skillName}
              </span>
              {isCurrentTaskCompleted && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Erledigt
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {activeTask.subtitle}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              {activeTask.instruction}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setSelectedTaskIndex((prev) => Math.max(0, prev - 1))}
              disabled={selectedTaskIndex === 0}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all"
              title="Vorherige Aufgabe"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedTaskIndex((prev) =>
                  Math.min(dailyPlan.tasks.length - 1, prev + 1)
                )
              }
              disabled={selectedTaskIndex === dailyPlan.tasks.length - 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all"
              title="Nächste Aufgabe"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Interactive Body */}
        <MathExerciseDispatcher
          exercise={activeTask}
          onSolve={handleTaskSolved}
        />
      </div>

      {/* "Das üben wir noch" Section */}
      {mathProgress.strugglingSkills.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
              Das üben wir noch (Förderschwerpunkte)
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {mathProgress.strugglingSkills.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 text-xs font-bold shadow-2xs"
              >
                🟡 {sk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* QA Testwoche Modal (Parent-Only) */}
      {showTestwocheModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 border-2 border-slate-300 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    QA-Inspektion: Mathe Testwoche
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Überprüfung aller 20 Wochenaufgaben (Mo–Fr: 3 Tasks, Sa: 5 Tasks, max. 1000, 4 Grundrechenarten)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestwocheModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* QA Checklist */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs sm:text-sm font-semibold text-indigo-950">
              <div className="font-black text-sm uppercase text-indigo-900">
                Prüfergebnis der Engine: {qaReport.isValid ? '✅ BESTANDEN' : '❌ FEHLER'}
              </div>
              {qaReport.reportLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span>•</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            {/* List of all 20 Tasks across days */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
              {(Object.keys(ALL_WEEKLY_MATH_TASKS) as DayOfWeek[]).map((d) => (
                <div key={d} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                    <span>{DAY_LABELS[d].name} ({ALL_WEEKLY_MATH_TASKS[d].length} Aufgaben)</span>
                    <span className="text-slate-400 font-normal">{DAY_LABELS[d].theme}</span>
                  </div>
                  <div className="space-y-1">
                    {ALL_WEEKLY_MATH_TASKS[d].map((t, idx) => (
                      <div
                        key={t.id}
                        className="text-xs font-bold text-slate-700 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <span>
                          {idx + 1}. {t.title}: <em>{t.subtitle}</em>
                        </span>
                        <span className="text-[11px] font-mono text-indigo-600 font-black">
                          {t.skillName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowTestwocheModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-sm transition-all shadow-md"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
