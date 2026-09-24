import React, { useState, useEffect } from 'react';
import {
  DayOfWeek,
  DifficultyLevel,
  LernwortItem,
  PracticeMistake,
  SkippedExerciseItem,
  PausedSessionState,
} from '../types/lernwoerter';
import {
  generateDailyExercisePlan,
  generateReinforcementExercises,
  GeneratedExercise,
  DailyExercisePlan,
  getSmartPedagogicalHint,
} from '../services/exerciseEngine';
import { PLAYMATES } from '../data/characters';
import { speakGerman } from '../services/speechSynthesisService';
import { playChime } from '../utils/soundEffects';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Printer,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Trophy,
  Pause,
  Play,
  SkipForward,
  ListOrdered,
  Target,
  BookOpen,
  Star,
  Lock,
  Check,
} from 'lucide-react';
import { getModelSolutionUnlockStatus } from '../utils/textValidation';
import { getNextRewardMilestone, formatPoints } from '../data/rewardLadder';
import { CompletedExerciseRecord, DayProgressSummary } from '../types/progress';
import { RepeatTaskModal } from './RepeatTaskModal';

interface RepeatedMistakeItem {
  id: string;
  title: string;
  prompt: string;
  wrongAnswer: string;
  correctAnswer: string;
  isResolved: boolean;
}

interface DailyPracticeWorkspaceProps {
  currentDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  words: LernwortItem[];
  pointsToday: number;
  pointsWeek: number;
  cumulativePoints?: number;
  onRewardStars: (count: number, reason: string) => void;
  onAwardPoints: (points: number, reason: string) => void;
  onRecordMistake: (mistake: Omit<PracticeMistake, 'id' | 'timestamp' | 'resolved'>) => void;
  onOpenWorksheet: (day: DayOfWeek) => void;
  onGoToBildgeschichte?: () => void;
  skippedExercises?: SkippedExerciseItem[];
  onSkipExercise?: (item: SkippedExerciseItem) => void;
  onCompleteSkipped?: (skippedId: string) => void;
  pausedSession?: PausedSessionState | null;
  onSavePauseSession?: (state: PausedSessionState | null) => void;
  weakWords?: string[];
  completedRecords?: CompletedExerciseRecord[];
  onRecordCompletedExercise?: (record: CompletedExerciseRecord) => void;
  daysProgress?: Record<DayOfWeek, DayProgressSummary>;
}

export const DailyPracticeWorkspace: React.FC<DailyPracticeWorkspaceProps> = ({
  currentDay,
  onSelectDay,
  words,
  pointsToday,
  pointsWeek,
  cumulativePoints = 0,
  onRewardStars,
  onAwardPoints,
  onRecordMistake,
  onOpenWorksheet,
  onGoToBildgeschichte,
  skippedExercises = [],
  onSkipExercise,
  onCompleteSkipped,
  pausedSession,
  onSavePauseSession,
  weakWords = [],
  completedRecords = [],
  onRecordCompletedExercise,
  daysProgress,
}) => {
  const [level, setLevel] = useState<DifficultyLevel>('starter');
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [selectedWordBlocks, setSelectedWordBlocks] = useState<string[]>([]);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [sessionPointsEarned, setSessionPointsEarned] = useState<number>(0);

  // Daily plan and active exercise queue
  const [dailyPlan, setDailyPlan] = useState<DailyExercisePlan | null>(null);
  const [exerciseQueue, setExerciseQueue] = useState<GeneratedExercise[]>([]);
  const [mandatoryExerciseIds, setMandatoryExerciseIds] = useState<string[]>([]);
  const [mistakeList, setMistakeList] = useState<RepeatedMistakeItem[]>([]);
  const [showExerciseMenu, setShowExerciseMenu] = useState<boolean>(false);
  const [menuTab, setMenuTab] = useState<'heute' | 'offen' | 'skipped' | 'schwerpunkt'>('heute');
  const [showWordHelp, setShowWordHelp] = useState<boolean>(false);
  const [pauseNotification, setPauseNotification] = useState<string | null>(null);

  // Voluntary repeat modal state
  const [repeatModalExercise, setRepeatModalExercise] = useState<{
    exercise: GeneratedExercise;
    index: number;
    pointsEarned: number;
  } | null>(null);

  // Track if current exercise in this session is voluntary repeat
  const [isCurrentVoluntaryRepeat, setIsCurrentVoluntaryRepeat] = useState<boolean>(false);

  // Initialize or re-initialize exercises with MAX 5 DAILY PLAN
  const loadExercises = () => {
    const plan = generateDailyExercisePlan({
      day: currentDay,
      words,
      level,
      weakWords,
      skippedCount: skippedExercises.length,
    });
    setDailyPlan(plan);
    const exList = plan.heuteEmpfohlen;
    setMandatoryExerciseIds(exList.map((e) => e.id));

    // If there is a paused session for this day & level, resume it!
    if (pausedSession && pausedSession.day === currentDay && pausedSession.level === level) {
      setExerciseQueue(exList);
      setExerciseIndex(Math.min(pausedSession.exerciseIndex, exList.length - 1));
      setTextInput(pausedSession.currentInputText || '');
      setSelectedOption(pausedSession.currentSelectedOption || '');
      setPauseNotification('Pausierte Einheit erfolgreich fortgesetzt! 🚀');
      setTimeout(() => setPauseNotification(null), 4000);
      setIsCurrentVoluntaryRepeat(false);
    } else {
      // Find first uncompleted exercise in the daily plan so child never reopens finished work
      const dayCompletedIds = completedRecords
        .filter((r) => r.day === currentDay)
        .map((r) => r.id);

      const firstUncompletedIdx = exList.findIndex(
        (ex) => !dayCompletedIds.includes(ex.id) && !dayCompletedIds.some((c) => c.startsWith(ex.id))
      );

      setExerciseQueue(exList);
      if (firstUncompletedIdx !== -1) {
        setExerciseIndex(firstUncompletedIdx);
        setIsCurrentVoluntaryRepeat(false);
      } else {
        // All tasks for this day already completed!
        setExerciseIndex(0);
        setIsCurrentVoluntaryRepeat(true);
      }
      resetCurrentInputs();
    }
    setIsCompleted(false);
  };

  useEffect(() => {
    loadExercises();
    setMistakeList([]);
    setSessionPointsEarned(0);
  }, [currentDay, level, words, skippedExercises.length]);

  const currentEx = exerciseQueue[exerciseIndex];
  const isRepeatedTask = currentEx && currentEx.id.includes('_repeat');
  const isReinforcementTask = currentEx && (currentEx.id.includes('reinf_') || currentEx.id.includes('adaptive_'));
  const isCurrentBonus = currentEx && !mandatoryExerciseIds.includes(currentEx.id);

  // Check if an exercise ID is already in completed records
  const isExerciseAlreadyCompleted = (exId: string): boolean => {
    return completedRecords.some(
      (r) => r.day === currentDay && (r.id === exId || r.id.startsWith(exId) || exId.startsWith(r.id))
    );
  };

  const getExercisePointsEarned = (exId: string): number => {
    const rec = completedRecords.find(
      (r) => r.day === currentDay && (r.id === exId || r.id.startsWith(exId) || exId.startsWith(r.id))
    );
    return rec?.pointsEarned ?? (level === 'starter' ? 4 : level === 'profi' ? 6 : 8);
  };

  // Mandatory goal tracking
  const dayCompletedRecords = completedRecords.filter((r) => r.day === currentDay);
  const completedMandatoryCount = mandatoryExerciseIds.filter((mId) =>
    dayCompletedRecords.some((r) => r.id === mId || r.id.startsWith(mId))
  ).length;

  const isMandatoryDone = completedMandatoryCount >= Math.min(5, mandatoryExerciseIds.length || 5);
  const extraTasksInQueue = exerciseQueue.filter(
    (e) => !mandatoryExerciseIds.includes(e.id)
  );

  // Check if current task is recall-based
  const isRecallTask =
    currentEx &&
    (currentEx.type === 'spelling_choice' ||
      currentEx.type === 'missing_letters' ||
      currentEx.type === 'type_word' ||
      currentEx.type === 'picture_match');

  // Companion avatar info
  const dayAvatarId =
    currentDay === 'monday'
      ? 'mia'
      : currentDay === 'tuesday'
      ? 'ben'
      : currentDay === 'wednesday'
      ? 'leo'
      : 'sophie';

  const companion = PLAYMATES.find((p) => p.id === dayAvatarId) || PLAYMATES[0];
  const companionRole =
    currentDay === 'monday'
      ? 'Wörter-Detektiv'
      : currentDay === 'tuesday'
      ? 'Grammatik-Coach'
      : currentDay === 'wednesday'
      ? 'Satz-Baumeister'
      : 'Geschichten-Profi';

  const resetCurrentInputs = () => {
    setSelectedOption('');
    setTextInput('');
    setSelectedWordBlocks([]);
    setAttemptCount(0);
    setHintMessage(null);
    setFeedbackStatus('idle');
    setShowWordHelp(false);
  };

  const handleRetakeDayExercise = () => {
    playChime('click');
    loadExercises();
    setMistakeList([]);
    setSessionPointsEarned(0);
  };

  const handleSpeakPrompt = (text: string) => {
    playChime('click');
    speakGerman(text, { avatarId: dayAvatarId });
  };

  const handleSelectWordBlock = (block: string) => {
    playChime('click');
    if (selectedWordBlocks.includes(block)) {
      setSelectedWordBlocks(selectedWordBlocks.filter((b) => b !== block));
    } else {
      setSelectedWordBlocks([...selectedWordBlocks, block]);
    }
    setHintMessage(null);
  };

  const handlePauseSession = () => {
    playChime('click');
    if (onSavePauseSession && currentEx) {
      onSavePauseSession({
        day: currentDay,
        level,
        exerciseIndex,
        currentInputText: textInput,
        currentSelectedOption: selectedOption,
        timestamp: Date.now(),
      });
      setPauseNotification('Einheit pausiert! Du kannst jederzeit genau hier weitermachen. ⏸️');
      setTimeout(() => setPauseNotification(null), 5000);
    }
  };

  const handleSkipExercise = () => {
    playChime('click');
    if (!currentEx) return;

    if (onSkipExercise) {
      onSkipExercise({
        id: `skip_${Date.now()}_${currentEx.id}`,
        day: currentDay,
        level,
        exerciseId: currentEx.id,
        title: currentEx.title,
        prompt: currentEx.prompt,
        wordClean: currentEx.word?.cleanWord || currentEx.word?.word || currentEx.title,
        grammarCategory: currentEx.grammarCategory,
        skippedAt: Date.now(),
        exerciseData: currentEx,
      });
    }

    setPauseNotification(
      `Aufgabe übersprungen! Sie wurde für den Wochenabschluss in deine Wiederholungsliste verschoben. ⏩`
    );
    setTimeout(() => setPauseNotification(null), 4000);

    // Advance to next or finish
    if (exerciseIndex < exerciseQueue.length - 1) {
      setExerciseIndex((prev) => prev + 1);
      resetCurrentInputs();
    } else {
      setIsCompleted(true);
      if (onSavePauseSession) {
        onSavePauseSession(null);
      }
    }
  };

  // CHECK ANSWER & AWARD POINTS SAFELY (Section 10 Points Protection)
  const handleCheckAnswer = () => {
    if (!currentEx) return;

    let isCorrect = false;
    let studentAnswer = '';

    if (currentEx.type === 'sentence_builder') {
      studentAnswer = selectedWordBlocks.join(' ').trim();
      const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
      isCorrect = normalize(studentAnswer) === normalize(currentEx.correctAnswer);
    } else if (
      currentEx.type === 'sentence_expand' ||
      currentEx.type === 'sentence_linking' ||
      currentEx.type === 'bildgeschichte_step'
    ) {
      studentAnswer = textInput.trim();
      isCorrect = studentAnswer.length >= 8;
    } else if (currentEx.type === 'type_word' || currentEx.type === 'missing_letters') {
      studentAnswer = textInput.trim();
      isCorrect = studentAnswer.toLowerCase() === currentEx.correctAnswer.toLowerCase();
    } else {
      studentAnswer = selectedOption;
      isCorrect = studentAnswer.toLowerCase() === currentEx.correctAnswer.toLowerCase();
    }

    if (isCorrect) {
      playChime('success');
      setFeedbackStatus('correct');

      const isAlreadyDone = isExerciseAlreadyCompleted(currentEx.id);
      const isVoluntaryPractice = isAlreadyDone || isCurrentVoluntaryRepeat;

      // Base points calculation
      const basePoints = level === 'starter' ? 4 : level === 'profi' ? 6 : 8;

      if (!isVoluntaryPractice) {
        // Points awarded for first successful completion
        const pointsEarned = attemptCount === 0 ? basePoints : Math.max(2, basePoints - attemptCount);
        setSessionPointsEarned((prev) => prev + pointsEarned);
        onAwardPoints(pointsEarned, `${currentEx.title} gelöst!`);

        // Record completed
        if (onRecordCompletedExercise) {
          onRecordCompletedExercise({
            id: currentEx.id,
            day: currentDay,
            pointsEarned,
            completedAt: Date.now(),
            isVoluntaryRepeat: false,
          });
        }
        setHintMessage(`Super gemacht! +${pointsEarned} Punkte! ⭐ ${currentEx.solutionExplanation || ''}`);
      } else {
        // Section 10: Repeat attempt must not award the same required-task points again
        setHintMessage(`Super geübt! (Freiwillige Wiederholung – Punkte bereits sicher gutgeschrieben) ⭐`);
      }

      // Stars
      onRewardStars(level === 'starter' ? 1 : level === 'profi' ? 2 : 3, `${currentEx.title} gemeistert!`);

      // If this was a skipped task being solved, remove from skipped queue
      if (onCompleteSkipped) {
        const matchingSkip = skippedExercises.find(
          (s) => s.exerciseId === currentEx.id || s.id === currentEx.id
        );
        if (matchingSkip) {
          onCompleteSkipped(matchingSkip.id);
        }
      }

      // If this was a repeated task, mark mistake as resolved
      if (isRepeatedTask) {
        setMistakeList((prev) =>
          prev.map((m) =>
            m.title === currentEx.title ? { ...m, isResolved: true } : m
          )
        );
      }
    } else {
      playChime('whistle');
      const nextAttempt = attemptCount + 1;
      setAttemptCount(nextAttempt);
      setFeedbackStatus('wrong');

      onRecordMistake({
        word: currentEx.word?.cleanWord || currentEx.word?.word || currentEx.title,
        category: currentEx.grammarCategory,
        wrongAnswer: studentAnswer,
        correctAnswer: currentEx.correctAnswer,
      });

      const existingMistake = mistakeList.find((m) => m.title === currentEx.title);
      if (!existingMistake) {
        setMistakeList((prev) => [
          ...prev,
          {
            id: `mistake_${Date.now()}`,
            title: currentEx.title,
            prompt: currentEx.prompt,
            wrongAnswer: studentAnswer,
            correctAnswer: currentEx.correctAnswer,
            isResolved: false,
          },
        ]);
      }

      const repeatId = `${currentEx.id}_repeat_${Date.now()}`;
      const isAlreadyScheduled = exerciseQueue.some(
        (ex, idx) => idx > exerciseIndex && ex.title === currentEx.title
      );

      if (!isAlreadyScheduled) {
        const clonedEx: GeneratedExercise = {
          ...currentEx,
          id: repeatId,
          title: `Wiederholung: ${currentEx.title}`,
        };
        const newQueue = [...exerciseQueue];
        const insertPosition = Math.min(exerciseIndex + 2, newQueue.length);
        newQueue.splice(insertPosition, 0, clonedEx);
        setExerciseQueue(newQueue);
      }

      const hint = getSmartPedagogicalHint(currentEx, studentAnswer, nextAttempt);
      setHintMessage(
        `${hint} (Diese Aufgabe wird gleich noch einmal wiederholt, damit du sie meisterst!)`
      );
    }
  };

  const handleNextExercise = () => {
    playChime('click');
    if (exerciseIndex < exerciseQueue.length - 1) {
      setExerciseIndex((prev) => prev + 1);
      setIsCurrentVoluntaryRepeat(false);
      resetCurrentInputs();
    } else {
      playChime('cheer');
      setIsCompleted(true);
      if (onSavePauseSession) {
        onSavePauseSession(null);
      }
    }
  };

  const handleRevealSolution = () => {
    if (!currentEx) return;
    playChime('click');
    setFeedbackStatus('revealed');
    setHintMessage(`Lösung: "${currentEx.correctAnswer}". ${currentEx.solutionExplanation || ''}`);
  };

  const handleLoadReinforcement = () => {
    playChime('click');
    if (weakWords.length === 0) return;
    const reinfExercises = generateReinforcementExercises(weakWords, words, level);
    setExerciseQueue((prev) => [...prev, ...reinfExercises]);
    setPauseNotification(`🎯 ${reinfExercises.length} gezielte Übungen für schwierige Wörter hinzugefügt!`);
    setTimeout(() => setPauseNotification(null), 4000);
  };

  // Section 2: Selecting an exercise from the task list
  const handleSelectExerciseFromList = (ex: GeneratedExercise, qIdx: number) => {
    const isDone = isExerciseAlreadyCompleted(ex.id);
    if (isDone) {
      // Show confirmation dialog:
      // "Diese Aufgabe hast du schon geschafft. Möchtest du sie freiwillig noch einmal üben?"
      setRepeatModalExercise({
        exercise: ex,
        index: qIdx,
        pointsEarned: getExercisePointsEarned(ex.id),
      });
      return;
    }

    // Uncompleted task -> open directly
    playChime('click');
    setExerciseIndex(qIdx);
    setIsCurrentVoluntaryRepeat(false);
    resetCurrentInputs();
    setShowExerciseMenu(false);
  };

  const days: { id: DayOfWeek; name: string; icon: string; avatar: string }[] = [
    { id: 'monday', name: 'Montag', icon: '🔍', avatar: 'Mia' },
    { id: 'tuesday', name: 'Dienstag', icon: '⚽', avatar: 'Ben' },
    { id: 'wednesday', name: 'Mittwoch', icon: '🏗️', avatar: 'Leo' },
    { id: 'thursday', name: 'Donnerstag', icon: '✍️', avatar: 'Sophie' },
    { id: 'friday', name: 'Freitag', icon: '📖', avatar: 'Sophie' },
    { id: 'saturday', name: 'Samstag', icon: '🏆', avatar: 'Challenge' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* SECTION 2: REPEAT TASK MODAL */}
      {repeatModalExercise && (
        <RepeatTaskModal
          exerciseTitle={repeatModalExercise.exercise.title}
          pointsEarned={repeatModalExercise.pointsEarned}
          onCancel={() => setRepeatModalExercise(null)}
          onConfirmRepeat={() => {
            setExerciseIndex(repeatModalExercise.index);
            setIsCurrentVoluntaryRepeat(true);
            resetCurrentInputs();
            setShowExerciseMenu(false);
            setRepeatModalExercise(null);
          }}
        />
      )}

      {/* SECTION 3 & 4: DAY SELECTOR NAVIGATION BAR WITH VISUAL COMPLETION STATUS */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-md border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {days.map((d) => {
            const isActive = currentDay === d.id;
            const summary = daysProgress ? daysProgress[d.id] : null;
            const isDayDone = summary?.isCompleted ?? false;

            return (
              <button
                key={d.id}
                onClick={() => {
                  playChime('click');
                  onSelectDay(d.id);
                }}
                className={`py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md font-black scale-102'
                    : isDayDone
                    ? 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-300 text-slate-800'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-bold'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-xs font-black">{d.name}</span>
                </div>

                {/* Day status badge */}
                <div className="mt-1">
                  {summary ? (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-indigo-700 text-indigo-100 border-indigo-500'
                          : summary.statusBadge.color
                      }`}
                    >
                      {summary.statusBadge.icon} {summary.statusBadge.label}
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200/60 text-slate-500'
                      }`}
                    >
                      {d.avatar}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP CONTROLS & POINTS LADDER BAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        {/* Playmate Companion Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-2xl shadow-xs overflow-hidden">
            {companion.avatarImageUrl ? (
              <img src={companion.avatarImageUrl} alt={companion.name} className="w-full h-full object-cover" />
            ) : (
              '🎒'
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-sm sm:text-base">{companion.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                {companionRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">„Komm, wir meistern die 5 heutigen Aufgaben!“</p>
          </div>
        </div>

        {/* Level Selector: Starter (★) / Profi (★★) / Meister (★★★) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {(['starter', 'profi', 'meister'] as DifficultyLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                playChime('click');
                setLevel(lvl);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                level === lvl
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl === 'starter' ? '⭐ Starter' : lvl === 'profi' ? '⭐⭐ Profi' : '⭐⭐⭐ Meister'}
            </button>
          ))}
        </div>

        {/* WORKLOAD & POINTS STATUS */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-black">
            <CheckCircle2 className={`w-4 h-4 ${isMandatoryDone ? 'text-emerald-600' : 'text-indigo-600'}`} />
            <span>
              {isMandatoryDone
                ? 'Tagesziel: 5 von 5 geschafft! 🎉'
                : `Tagesziel: ${completedMandatoryCount} von ${Math.min(5, mandatoryExerciseIds.length || 5)} geschafft`}
              {extraTasksInQueue.length > 0 ? ` (+${extraTasksInQueue.length} Zusatz)` : ''}
            </span>
          </div>

          {/* Cumulative Points to Next Milestone */}
          {(() => {
            const { nextMilestone } = getNextRewardMilestone(cumulativePoints);
            return (
              <div
                className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-black text-amber-900"
                title={`Nächstes Ziel: ${nextMilestone.reward} (${formatPoints(nextMilestone.points)} Punkte)`}
              >
                <span>{nextMilestone.emoji.slice(0, 2)}</span>
                <span>{formatPoints(cumulativePoints)} / {formatPoints(nextMilestone.points)}</span>
              </div>
            );
          })()}

          {/* Worksheet Print */}
          <button
            onClick={() => {
              playChime('click');
              onOpenWorksheet(currentDay);
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Arbeitsblatt drucken"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PAUSE / NOTIFICATION BANNER */}
      {pauseNotification && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 text-indigo-950 font-bold text-sm shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Pause className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>{pauseNotification}</span>
          </div>
          <button
            onClick={() => setPauseNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* SATURDAY AUTOMATIC CATCH-UP BALANCE NOTIFICATION */}
      {currentDay === 'saturday' && dailyPlan?.isSaturdayLightened && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">🎈</span>
            <span>
              <strong>Entlastungs-Modus aktiv:</strong> Weil du noch{' '}
              <span className="underline decoration-amber-500 font-extrabold">{dailyPlan.skippedCount}</span> nachzuholende Aufgabe(n) hast, wurde deine Samstags-Challenge automatisch auf{' '}
              <span className="font-extrabold">{mandatoryExerciseIds.length} Aufgaben</span> angepasst, damit der Gesamtaufwand für dich angenehm leicht bleibt!
            </span>
          </div>
        </div>
      )}

      {/* WORKSPACE MAIN CARD */}
      <div className="space-y-4">
        {/* Header with Exercise Counter, Task Menu Button, and Pause/Skip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 sm:px-6 py-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                playChime('click');
                setShowExerciseMenu(!showExerciseMenu);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-black flex items-center gap-2 transition-colors"
              title="Aufgaben-Übersicht & Reihenfolge wählen"
            >
              <ListOrdered className="w-4 h-4 text-indigo-600" />
              <span>Aufgaben-Plan</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExerciseMenu ? 'rotate-180' : ''}`} />
            </button>

            <span className="text-xs sm:text-sm font-black text-slate-700">
              {isCurrentBonus ? (
                <span className="text-purple-700 font-black">🎯 Freiwilliger Zusatz</span>
              ) : (
                `Aufgabe ${Math.min(exerciseIndex + 1, 5)} von ${Math.min(5, mandatoryExerciseIds.length || 5)}`
              )}
            </span>

            {/* Completed badge if current exercise is already done */}
            {currentEx && isExerciseAlreadyCompleted(currentEx.id) && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Erledigt · +{getExercisePointsEarned(currentEx.id)} Punkte</span>
              </span>
            )}

            {/* Repetition badge */}
            {isRepeatedTask && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>Wiederholung</span>
              </span>
            )}

            {/* Reinforcement badge */}
            {isReinforcementTask && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-[11px] font-black flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Fokus-Training</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePauseSession}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-black flex items-center gap-1.5 transition-colors"
              title="Pausieren und später weitermachen"
            >
              <Pause className="w-4 h-4 text-indigo-600" />
              <span>Pause</span>
            </button>

            <button
              onClick={handleSkipExercise}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 border border-slate-200 text-slate-600 hover:text-amber-700 text-xs font-black flex items-center gap-1.5 transition-colors"
              title="Aufgabe überspringen"
            >
              <SkipForward className="w-4 h-4 text-amber-500" />
              <span>Überspringen</span>
            </button>
          </div>
        </div>

        {/* EXPANDABLE EXERCISE MENU / ORDER PICKER (Sections 1 & 2) */}
        {showExerciseMenu && (
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200 space-y-4 animate-fade-in">
            {/* 4 Section Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
              <button
                onClick={() => setMenuTab('heute')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  menuTab === 'heute'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⭐ Heute empfohlen ({exerciseQueue.length})
              </button>

              <button
                onClick={() => setMenuTab('offen')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  menuTab === 'offen'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📋 Noch offen ({dailyPlan?.nochOffen.length || 0})
              </button>

              <button
                onClick={() => setMenuTab('skipped')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  menuTab === 'skipped'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                ⏩ Übersprungen ({skippedExercises.length})
              </button>

              <button
                onClick={() => setMenuTab('schwerpunkt')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  menuTab === 'schwerpunkt'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                🎯 Schwerpunkt ({dailyPlan?.schwerpunktExtra.length || 0})
              </button>
            </div>

            {/* TAB 1: HEUTE EMPFOHLEN (Section 1: Clearly Mark Completed Tasks) */}
            {menuTab === 'heute' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  Ausgewogene Tagesmischung für heute (max. 5 Aufgaben). Erledigte Aufgaben sind mit grünem Häkchen markiert:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {exerciseQueue.map((ex, qIdx) => {
                    const isCurrent = qIdx === exerciseIndex;
                    const isDone = isExerciseAlreadyCompleted(ex.id);
                    const pts = getExercisePointsEarned(ex.id);

                    // First uncompleted item in queue is recommended next
                    const firstUncompletedIndex = exerciseQueue.findIndex(
                      (item) => !isExerciseAlreadyCompleted(item.id)
                    );
                    const isNextRecommended = !isDone && qIdx === firstUncompletedIndex;

                    return (
                      <button
                        key={ex.id}
                        onClick={() => handleSelectExerciseFromList(ex, qIdx)}
                        className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between gap-2 ${
                          isDone
                            ? 'bg-emerald-50/60 border-emerald-300 hover:bg-emerald-100/60'
                            : isCurrent
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                            : isNextRecommended
                            ? 'border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-slate-400">#{qIdx + 1}</span>

                          {/* SECTION 1 & 12 VISUAL STATUS BADGE */}
                          {isDone ? (
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Erledigt · +{pts} Punkte</span>
                            </span>
                          ) : isNextRecommended ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1">
                              <Star className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                              <span>Als Nächstes</span>
                            </span>
                          ) : ex.id.includes('_repeat') ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                              🔄 Wiederholen
                            </span>
                          ) : ex.id.includes('reinf_') || ex.id.includes('adaptive_') ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                              🎯 Schwerpunkt
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              🟡 Offen
                            </span>
                          )}
                        </div>

                        <div className="font-black text-slate-900 text-sm line-clamp-1">
                          {ex.title}
                        </div>
                        <div className="text-xs text-indigo-900 font-semibold line-clamp-1">
                          {ex.prompt}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: NOCH OFFEN */}
            {menuTab === 'offen' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                  <span>Weitere Übungen für die Woche (Freiwilliger Zusatz – kein Pflichtpensum):</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                    Freiwillig
                  </span>
                </div>
                {dailyPlan && dailyPlan.nochOffen.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 max-h-60 overflow-y-auto">
                    {dailyPlan.nochOffen.map((ex, oIdx) => (
                      <button
                        key={ex.id}
                        onClick={() => {
                          playChime('click');
                          setExerciseQueue((prev) => [...prev, ex]);
                          setExerciseIndex(exerciseQueue.length);
                          resetCurrentInputs();
                          setShowExerciseMenu(false);
                        }}
                        className="p-3 rounded-2xl text-left border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-all flex flex-col justify-between gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">
                            {ex.title}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                            Bonus
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-xs line-clamp-1">
                          {ex.prompt}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    Keine weiteren offenen Übungen mehr in diesem Pool.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: ÜBERSPRUNGENE AUFGABEN */}
            {menuTab === 'skipped' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  Aufgaben, die du während der Woche übersprungen hast. Diese musst du für den 100-Punkte-Wochenabschluss nachholen:
                </div>
                {skippedExercises.length === 0 ? (
                  <div className="p-4 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200">
                    🎉 Keine übersprungenen Aufgaben! Alle Pflichtaufgaben sind im Plan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {skippedExercises.map((sk) => (
                      <div
                        key={sk.id}
                        className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase text-amber-800 px-1.5 py-0.5 rounded bg-amber-200">
                              {sk.day.toUpperCase()}
                            </span>
                            <span className="font-black text-slate-900 text-xs">{sk.title}</span>
                          </div>
                          <div className="text-xs text-slate-600 font-medium mt-0.5">
                            Wort: <strong>{sk.wordClean}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            playChime('click');
                            if (sk.exerciseData) {
                              setExerciseQueue((prev) => [sk.exerciseData, ...prev]);
                              setExerciseIndex(0);
                            }
                            resetCurrentInputs();
                            setShowExerciseMenu(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shrink-0"
                        >
                          Jetzt lösen 🚀
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SCHWERPUNKT-AUFGABEN */}
            {menuTab === 'schwerpunkt' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  Gezielte Trainingsaufgaben zu deinen häufigsten Fehlern (Doppelkonsonanten, Artikel & Beugung):
                </div>
                {dailyPlan && dailyPlan.schwerpunktExtra.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 max-h-60 overflow-y-auto">
                    {dailyPlan.schwerpunktExtra.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => {
                          playChime('click');
                          setExerciseQueue((prev) => [...prev, ex]);
                          setExerciseIndex(exerciseQueue.length);
                          resetCurrentInputs();
                          setShowExerciseMenu(false);
                        }}
                        className="p-3 rounded-2xl text-left border border-rose-200 bg-rose-50/50 hover:bg-rose-100 transition-all flex flex-col justify-between gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-rose-800 uppercase">
                            {ex.title}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                            Fokus
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-xs line-clamp-1">
                          {ex.prompt}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    Keine zusätzlichen Schwerpunkt-Aufgaben nötig – super!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* SKIPPED EXERCISES REMINDER BANNER */}
        {skippedExercises.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-amber-900">
            <div className="flex items-center gap-2.5">
              <SkipForward className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs sm:text-sm font-bold">
                <strong>{skippedExercises.length} übersprungene Aufgabe(n)</strong> noch offen. Diese müssen für den vollen Wochenerfolg abgeschlossen werden!
              </div>
            </div>
            <button
              onClick={() => {
                playChime('click');
                setShowExerciseMenu(true);
                setMenuTab('skipped');
              }}
              className="text-xs font-black text-amber-800 underline hover:text-amber-950"
            >
              Anzeigen
            </button>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT */}
        {isCompleted ? (
          /* COMPLETION SCREEN */
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-6xl mx-auto shadow-lg animate-bounce-subtle">
              🌟
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
                Tages-Einheit gemeistert!
              </h3>
              <p className="text-slate-600 text-base sm:text-lg font-medium">
                Großartige Leistung, Jedidiah! Du hast die 5 Aufgaben für{' '}
                <strong>{currentDay.toUpperCase()}</strong> auf Stufe{' '}
                <strong>{level.toUpperCase()}</strong> erfolgreich abgeschlossen.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="bg-amber-50 border border-amber-200 px-5 py-3 rounded-2xl text-center">
                <div className="text-2xl font-black text-amber-700">+{sessionPointsEarned}</div>
                <div className="text-xs font-bold text-amber-600 uppercase">Punkte verdient</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl text-center">
                <div className="text-2xl font-black text-emerald-700">{pointsWeek} / 100</div>
                <div className="text-xs font-bold text-emerald-600 uppercase">Wochen-Punkte</div>
              </div>
            </div>

            {/* ACTION BUTTONS: RETAKE OR ADVANCE */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={handleRetakeDayExercise}
                className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base sm:text-lg shadow-xl shadow-indigo-600/25 active:scale-95 flex items-center gap-3 transition-transform"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Diese Einheit wiederholen 🔄</span>
              </button>

              <button
                onClick={() => {
                  playChime('click');
                  if (level === 'starter') setLevel('profi');
                  else if (level === 'profi') setLevel('meister');
                  else
                    onSelectDay(
                      currentDay === 'monday'
                        ? 'tuesday'
                        : currentDay === 'tuesday'
                        ? 'wednesday'
                        : currentDay === 'wednesday'
                        ? 'thursday'
                        : currentDay === 'thursday'
                        ? 'friday'
                        : 'saturday'
                    );
                }}
                className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center gap-2 border border-slate-200"
              >
                <span>Nächste Herausforderung ➡️</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE EXERCISE CARD */
          currentEx && (
            <div className={`rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg border-2 space-y-6 transition-all ${
              isExerciseAlreadyCompleted(currentEx.id)
                ? 'bg-emerald-50/40 border-emerald-300'
                : 'bg-white border-slate-200'
            }`}>
              {/* Card Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {exerciseIndex + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {isCurrentBonus ? (
                      <span className="text-purple-700 font-bold">Freiwilliger Zusatz</span>
                    ) : (
                      `Aufgabe ${Math.min(exerciseIndex + 1, 5)} von ${Math.min(5, mandatoryExerciseIds.length || 5)}`
                    )}
                  </span>

                  {/* Section 1: Erledigt status badge if completed */}
                  {isExerciseAlreadyCompleted(currentEx.id) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Erledigt · +{getExercisePointsEarned(currentEx.id)} Punkte</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>+{level === 'starter' ? 4 : level === 'profi' ? 6 : 8} Pkt</span>
                  </div>

                  <button
                    onClick={handlePauseSession}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                    title="Pausieren & später fortsetzen"
                  >
                    <Pause className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Pause</span>
                  </button>

                  <button
                    onClick={handleSkipExercise}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1"
                    title="Aufgabe überspringen"
                  >
                    <SkipForward className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">Überspringen</span>
                  </button>
                </div>
              </div>

              {/* PROMINENT IMAGE / VISUAL PRESENTATION */}
              {currentEx.word && (
                <div className="flex items-center justify-center p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200">
                  <div className="text-center space-y-2">
                    <div className="text-7xl sm:text-8xl select-none filter drop-shadow-md animate-bounce-subtle">
                      {currentEx.word.emoji}
                    </div>
                    {/* Recall tasks hide word context until answered */}
                    {!isRecallTask && (
                      <div className="text-xs font-black tracking-wider uppercase text-slate-500">
                        {currentEx.word.wortart} • Gruppe {currentEx.word.group}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PROMINENT ACTION PROMPT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                    {currentEx.title}
                  </span>
                  <button
                    onClick={() => handleSpeakPrompt(`${currentEx.prompt} ${currentEx.contextSentence || ''}`)}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors"
                    title="Aufgabe laut vorlesen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {currentEx.prompt}
                </h3>

                {currentEx.contextSentence && (
                  <p className="text-base sm:text-lg text-indigo-950 font-bold bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100">
                    {currentEx.contextSentence}
                  </p>
                )}
              </div>

              {/* INTERACTIVE WORK AREA */}
              <div className="space-y-4 pt-2">
                {/* 1. Sentence Builder Blocks */}
                {currentEx.type === 'sentence_builder' && currentEx.wordBlocks && (
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border-2 border-indigo-200 min-h-[64px] flex flex-wrap items-center gap-2">
                      {selectedWordBlocks.length === 0 ? (
                        <span className="text-slate-400 text-sm font-medium italic">
                          Klicke unten auf die Wort-Blöcke in der richtigen Reihenfolge...
                        </span>
                      ) : (
                        selectedWordBlocks.map((blk, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => handleSelectWordBlock(blk)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-black text-sm sm:text-base shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
                          >
                            {blk} ✕
                          </button>
                        ))
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {currentEx.wordBlocks.map((blk, bIdx) => {
                        const isChosen = selectedWordBlocks.includes(blk);
                        return (
                          <button
                            key={bIdx}
                            onClick={() => handleSelectWordBlock(blk)}
                            disabled={isChosen}
                            className={`px-4 py-2.5 rounded-xl font-black text-sm sm:text-base border-2 transition-all ${
                              isChosen
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                : 'bg-white hover:bg-indigo-50 border-slate-300 text-slate-800 shadow-sm active:scale-95'
                            }`}
                          >
                            {blk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Text Input (Missing Letters, Type Word, Sentence Expand) */}
                {(currentEx.type === 'missing_letters' ||
                  currentEx.type === 'type_word' ||
                  currentEx.type === 'sentence_expand' ||
                  currentEx.type === 'sentence_linking' ||
                  currentEx.type === 'bildgeschichte_step') && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCheckAnswer();
                      }}
                      placeholder="Deine Antwort hier tippen..."
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:outline-hidden text-lg font-bold text-slate-900 bg-white shadow-inner"
                      autoFocus
                    />
                  </div>
                )}

                {/* 3. Multiple Choice Options */}
                {currentEx.options && currentEx.options.length > 0 && currentEx.type !== 'sentence_builder' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentEx.options.map((opt, oIdx) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            playChime('click');
                            setSelectedOption(opt);
                          }}
                          className={`p-4 rounded-2xl border-2 text-left font-black text-base sm:text-lg transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm ring-2 ring-indigo-200'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span>{opt}</span>
                          <span
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* HINT & FEEDBACK MESSAGE */}
              {hintMessage && (
                <div
                  className={`p-4 rounded-2xl border-2 text-sm sm:text-base font-bold flex items-center gap-3 animate-fade-in ${
                    feedbackStatus === 'correct'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : feedbackStatus === 'wrong'
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <span className="text-xl">
                    {feedbackStatus === 'correct' ? '🎉' : feedbackStatus === 'wrong' ? '💡' : 'ℹ️'}
                  </span>
                  <div className="flex-1">{hintMessage}</div>
                </div>
              )}

              {/* ACTION FOOTER */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {feedbackStatus !== 'correct' && (
                    <>
                      {currentEx.type === 'bildgeschichte_step' ? (
                        (() => {
                          const unlockStatus = getModelSolutionUnlockStatus(textInput);
                          return unlockStatus.isUnlocked ? (
                            <button
                              type="button"
                              onClick={handleRevealSolution}
                              className="px-3.5 py-2.5 rounded-xl text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                            >
                              <HelpCircle className="w-4 h-4 text-amber-600" />
                              <span>Musterbeispiel ansehen</span>
                            </button>
                          ) : (
                            <div
                              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-not-allowed select-none border border-slate-200"
                              title="Schreibe zuerst deinen Satz mit mindestens 2–3 sinnvollen Wörtern, um das Musterbeispiel freizuschalten."
                            >
                              <Lock className="w-4 h-4 text-slate-400" />
                              <span>Musterbeispiel gesperrt ({unlockStatus.label})</span>
                            </div>
                          );
                        })()
                      ) : attemptCount === 0 && feedbackStatus !== 'revealed' ? (
                        <div
                          className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-not-allowed select-none border border-slate-200"
                          title="Versuche zuerst die Aufgabe zu lösen. Nach dem 1. Versuch wird die Hilfe freigeschaltet."
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Lösung nach dem 1. Versuch</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRevealSolution}
                          className="px-3.5 py-2.5 rounded-xl text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                        >
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                          <span>Lösung aufdecken</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSkipExercise}
                        className="px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-amber-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                      >
                        <SkipForward className="w-4 h-4" />
                        <span>Überspringen</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {feedbackStatus !== 'correct' ? (
                    <button
                      onClick={handleCheckAnswer}
                      className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base sm:text-lg shadow-md active:scale-95 transition-all"
                    >
                      Antwort prüfen ✨
                    </button>
                  ) : (
                    <button
                      onClick={handleNextExercise}
                      className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg shadow-md active:scale-95 flex items-center gap-2 transition-all"
                    >
                      <span>
                        {exerciseIndex < exerciseQueue.length - 1 ? 'Nächste Aufgabe' : 'Geschafft!'}
                      </span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* MISTAKE MEMORY & REVIEW FOCUS */}
        {weakWords.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base sm:text-lg">
                <Target className="w-5 h-5 text-rose-500" />
                <span>Das üben wir noch • Häufige Fehlerwörter</span>
              </div>
              <button
                onClick={handleLoadReinforcement}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs border border-rose-200 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Schwerpunkt jetzt üben</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {weakWords.map((ww, wIdx) => (
                <span
                  key={wIdx}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-black flex items-center gap-1"
                >
                  <span>🎯</span>
                  <span>{ww}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* REPEATED MISTAKES LIST */}
        {mistakeList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-black text-base">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>
                Wiederholungs-Liste dieser Einheit ({mistakeList.length} Aufgabe
                {mistakeList.length > 1 ? 'n' : ''})
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Aufgaben, die nicht beim ersten Mal geklappt haben, werden in der Einheit automatisch noch einmal wiederholt:
            </p>
            <div className="divide-y divide-slate-100">
              {mistakeList.map((m, mIdx) => (
                <div key={mIdx} className="py-2.5 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-bold text-slate-900">{m.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{m.prompt}</div>
                  </div>
                  <div>
                    {m.isResolved ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Wiederholt & Gemeistert!</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                        <span>Wird wiederholt</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
