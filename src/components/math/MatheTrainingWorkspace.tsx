import React, { useState, useMemo } from 'react';
import { DayOfWeek } from '../../types/lernwoerter';
import { MathExercise, MathProgressState } from '../../types/math';
import {
  generateDailyMathPlan,
  generateWeeklyMathTasks,
  validateMathWeeklyPlan,
  calculateMathCategoryPoolStatistics,
  getTotalUniqueSafeMathCombinations,
  getMathExerciseSignature,
} from '../../services/mathExerciseEngine';
import { runMathStateIsolationQA } from '../../services/deterministicMathEngine';
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
  ChevronLeft,
  Calendar,
  Layers,
  Sparkle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatheTrainingWorkspaceProps {
  currentDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  mathProgress: MathProgressState;
  onUpdateMathProgress: (newState: MathProgressState) => void;
}

const DAY_LABELS: Record<DayOfWeek, { name: string; short: string; theme: string }> = {
  monday: { name: 'Montag', short: 'Mo', theme: 'Addition, Nachbarzehner & Verdoppeln' },
  tuesday: { name: 'Dienstag', short: 'Di', theme: 'Multiplikation, Division & Zahlenmauer' },
  wednesday: { name: 'Mittwoch', short: 'Mi', theme: 'Addition, Multiplikation & Nachbarhunderter' },
  thursday: { name: 'Donnerstag', short: 'Do', theme: 'Subtraktion, Division & Halbieren' },
  friday: { name: 'Freitag', short: 'Fr', theme: 'Addition, Multiplikation & Zahlenmauer' },
  saturday: { name: 'Samstag', short: 'Sa', theme: 'Subtraktion, Division & Verdoppeln' },
};

export const MatheTrainingWorkspace: React.FC<MatheTrainingWorkspaceProps> = ({
  currentDay,
  onSelectDay,
  mathProgress,
  onUpdateMathProgress,
}) => {
  const [activeWeekNumber, setActiveWeekNumber] = useState<number>(
    mathProgress.currentWeekNumber || 1
  );
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [showTestwocheModal, setShowTestwocheModal] = useState(false);
  const [inspectedQAWeek, setInspectedQAWeek] = useState<number>(activeWeekNumber);

  const dailyPlan = useMemo(
    () =>
      generateDailyMathPlan({
        day: currentDay,
        weekNumber: activeWeekNumber,
        strugglingSkills: mathProgress.strugglingSkills,
        history: mathProgress.recentQuestionHistory,
      }),
    [currentDay, activeWeekNumber, mathProgress.strugglingSkills, mathProgress.recentQuestionHistory]
  );

  const dailySummary = useMemo(
    () => calculateDailyMathSummary(currentDay, mathProgress.completedRecords, activeWeekNumber),
    [currentDay, mathProgress.completedRecords, activeWeekNumber]
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
      currentState: {
        ...mathProgress,
        currentWeekNumber: activeWeekNumber,
      },
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

  const handleSwitchWeek = (newWeek: number) => {
    if (newWeek < 1) return;
    playChime('click');
    setActiveWeekNumber(newWeek);
    setInspectedQAWeek(newWeek);
    setSelectedTaskIndex(0);
    onUpdateMathProgress({
      ...mathProgress,
      currentWeekNumber: newWeek,
    });
  };

  const inspectedWeekTasks = useMemo(
    () =>
      generateWeeklyMathTasks({
        weekNumber: inspectedQAWeek,
        strugglingSkills: mathProgress.strugglingSkills,
        history: mathProgress.recentQuestionHistory,
      }),
    [inspectedQAWeek, mathProgress.strugglingSkills, mathProgress.recentQuestionHistory]
  );

  const qaReport = useMemo(
    () =>
      validateMathWeeklyPlan({
        weekNumber: inspectedQAWeek,
        history: mathProgress.recentQuestionHistory,
      }),
    [inspectedQAWeek, mathProgress.recentQuestionHistory]
  );

  const stateIsolationQA = useMemo(() => runMathStateIsolationQA(), []);
  const poolStats = useMemo(() => calculateMathCategoryPoolStatistics(), []);
  const totalPoolCombinations = useMemo(() => getTotalUniqueSafeMathCombinations(), []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
            ➕
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Mathe-Training • 3. / 4. Klasse
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Zahlenraum bis 1000
              </span>
              {/* Week Switcher Badge */}
              <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5 text-[11px] font-black text-indigo-700">
                <button
                  type="button"
                  onClick={() => handleSwitchWeek(Math.max(1, activeWeekNumber - 1))}
                  disabled={activeWeekNumber <= 1}
                  className="hover:text-indigo-900 disabled:opacity-30 px-1"
                  title="Vorherige Woche"
                >
                  ◀
                </button>
                <span className="px-1.5">Woche {activeWeekNumber}</span>
                <button
                  type="button"
                  onClick={() => handleSwitchWeek(activeWeekNumber + 1)}
                  className="hover:text-indigo-900 px-1"
                  title="Nächste Woche"
                >
                  ▶
                </button>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {DAY_LABELS[currentDay].name} – {DAY_LABELS[currentDay].theme}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Dauer: ca. {dailyPlan.estimatedMinutes} Minuten • {dailyPlan.tasks.length} frische Aufgaben für heute
            </p>
          </div>
        </div>

        {/* Stats & Parent QA button */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
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
            onClick={() => {
              setInspectedQAWeek(activeWeekNumber);
              setShowTestwocheModal(true);
            }}
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
          const sum = calculateDailyMathSummary(day, mathProgress.completedRecords, activeWeekNumber);

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
              <div className="text-[11px] font-bold truncate mt-1 opacity-90">
                {DAY_LABELS[day].name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Task Navigator (Task 1, 2, 3) */}
      <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {dailyPlan.tasks.map((task, idx) => {
            const isSelected = selectedTaskIndex === idx;
            const isCompleted = mathProgress.completedTaskIds.includes(task.id);

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => {
                  playChime('click');
                  setSelectedTaskIndex(idx);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current inline-block" />
                )}
                <span>
                  Aufgabe {idx + 1}: {task.skillName}
                </span>
                <span className="text-[10px] opacity-75 font-mono">+{task.points}P</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={selectedTaskIndex === 0}
            onClick={() => setSelectedTaskIndex((i) => Math.max(0, i - 1))}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
            title="Vorherige Aufgabe"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={selectedTaskIndex >= dailyPlan.tasks.length - 1}
            onClick={() => setSelectedTaskIndex((i) => Math.min(dailyPlan.tasks.length - 1, i + 1))}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
            title="Nächste Aufgabe"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Exercise Dispatcher Area */}
      {activeTask && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm relative">
          {/* Task Header Bar for JD (Clean, child-friendly: no debug signatures or IDs) */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                Woche {activeWeekNumber} • {DAY_LABELS[currentDay].name} • Aufgabe {selectedTaskIndex + 1}
              </span>
            </div>
            {isCurrentTaskCompleted && (
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bereits gelöst (+{activeTask.points} Pkt)</span>
              </div>
            )}
          </div>

          <MathExerciseDispatcher
            key={activeTask.id}
            exercise={activeTask}
            onComplete={handleTaskSolved}
          />
        </div>
      )}

      {/* PARENT QA INSPECTION MODAL */}
      {showTestwocheModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border-2 border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    QA-Inspektion: Mathe Testwoche & Anti-Repetition
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Prüfung der deterministischen Varianz, Aufgaben-Signaturen & 100% Zustandstrennung
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

            {/* Week Switcher for QA preview */}
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-slate-800 uppercase">
                  Woche auswählen ({inspectedQAWeek}):
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setInspectedQAWeek(w)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      inspectedQAWeek === w
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    W{w}
                  </button>
                ))}
              </div>
            </div>

            {/* QA Checklist */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs sm:text-sm font-semibold text-indigo-950">
              <div className="font-black text-sm uppercase text-indigo-900 flex items-center justify-between">
                <span>Wochenplan Woche {inspectedQAWeek}: {qaReport.isValid ? '✅ BESTANDEN' : '❌ FEHLER'}</span>
                <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">
                  {qaReport.weeksOfVarietyGuaranteed}+ Wochen ohne Dubletten
                </span>
              </div>
              {qaReport.reportLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span>•</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            {/* Variety & Anti-Repetition Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2 text-xs text-purple-950">
              <div className="font-black text-sm uppercase text-purple-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Anti-Repetitions-Architektur & Pool-Statistik
                </span>
                <span className="text-xs font-mono font-bold text-purple-700">
                  {totalPoolCombinations} sichere Kombinationen
                </span>
              </div>
              <p className="text-purple-800 leading-relaxed">
                Jede Woche generiert neue Operanden und Aufgabeninstanzen aus denselben didaktischen Templates.
                Stabile Signaturen (z. B. <code>multiplication:7x8</code>, <code>subtraction:860-40</code>)
                verhindern Wiederholungen über 8–12+ Wochen hinweg. Bei Fehlern greift die adaptive Remediierung
                mit abgewandelten Zahlen (z. B. 6×8, 8×7 vor erneuter Vorlage).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-purple-100">
                  <span className="text-slate-500 block">Multiplikation (1x1):</span>
                  <strong className="text-purple-900">36 Fakten (Di/Mi/Fr)</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-purple-100">
                  <span className="text-slate-500 block">Division (Exakt):</span>
                  <strong className="text-purple-900">36 Fakten (Di/Do/Sa)</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-purple-100">
                  <span className="text-slate-500 block">Zahlenmauer:</span>
                  <strong className="text-purple-900">24 Pyramiden (Di/Fr)</strong>
                </div>
              </div>
            </div>

            {/* QA State Isolation & Hard Correctness Assertions */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs sm:text-sm font-semibold text-emerald-950">
              <div className="font-black text-sm uppercase text-emerald-900 flex items-center justify-between">
                <span>Task State Isolation & Hard Tests:</span>
                <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                  {stateIsolationQA.allPassed ? '✅ 100% ISOLIERT' : '❌ LEAK ERKANNT'}
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                {stateIsolationQA.results.map((r, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs bg-white/70 p-1.5 rounded-lg border border-emerald-100">
                    <span className="shrink-0">{r.passed ? '✅' : '❌'}</span>
                    <span>
                      <strong className="text-emerald-950">{r.testName}:</strong>{' '}
                      <span className="text-emerald-800">{r.message}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* List of Tasks for Inspected Week */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              <div className="text-xs font-bold text-slate-500 uppercase">
                Aufgaben-Übersicht für Woche {inspectedQAWeek} (Mo–Sa: 18 Aufgaben):
              </div>
              {(Object.keys(inspectedWeekTasks) as DayOfWeek[]).map((d) => (
                <div key={d} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                    <span>{DAY_LABELS[d].name}</span>
                    <span className="text-slate-400 font-normal">{DAY_LABELS[d].theme}</span>
                  </div>
                  <div className="space-y-1">
                    {inspectedWeekTasks[d].map((t, idx) => (
                      <div
                        key={t.id}
                        className="text-xs font-bold text-slate-700 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          {idx + 1}. {t.title}: <em>{t.subtitle}</em>
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            {t.signature || getMathExerciseSignature(t)}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-600 font-black">
                            {t.skillName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleSwitchWeek(inspectedQAWeek)}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs transition-all border border-indigo-200"
              >
                Diese Woche als aktive Trainingswoche setzen (Woche {inspectedQAWeek})
              </button>
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
