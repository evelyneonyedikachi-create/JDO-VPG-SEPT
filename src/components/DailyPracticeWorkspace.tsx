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
} from 'lucide-react';
import { getModelSolutionUnlockStatus } from '../utils/textValidation';
import { getNextRewardMilestone, formatPoints } from '../data/rewardLadder';

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

  // Daily plan and active exercise queue (strictly capped at max 5 exercises)
  const [dailyPlan, setDailyPlan] = useState<DailyExercisePlan | null>(null);
  const [exerciseQueue, setExerciseQueue] = useState<GeneratedExercise[]>([]);
  // Mandatory exercise IDs (the base 5 daily exercises)
  const [mandatoryExerciseIds, setMandatoryExerciseIds] = useState<string[]>([]);
  // Completed exercise IDs in this session
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  // Mistakes in this session
  const [mistakeList, setMistakeList] = useState<RepeatedMistakeItem[]>([]);
  // Exercise menu open state and active tab
  const [showExerciseMenu, setShowExerciseMenu] = useState<boolean>(false);
  const [menuTab, setMenuTab] = useState<'heute' | 'offen' | 'skipped' | 'schwerpunkt'>('heute');
  // Optional word help toggle in Bildgeschichte tasks
  const [showWordHelp, setShowWordHelp] = useState<boolean>(false);
  // Pause banner / modal notification
  const [pauseNotification, setPauseNotification] = useState<string | null>(null);

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
    } else {
      setExerciseQueue(exList);
      setExerciseIndex(0);
      resetCurrentInputs();
    }
    setIsCompleted(false);
  };

  useEffect(() => {
    loadExercises();
    setMistakeList([]);
    setSessionPointsEarned(0);
    setCompletedExerciseIds([]);
  }, [currentDay, level, words, skippedExercises.length]);

  const currentEx = exerciseQueue[exerciseIndex];
  const isRepeatedTask = currentEx && currentEx.id.includes('_repeat');
  const isReinforcementTask = currentEx && (currentEx.id.includes('reinf_') || currentEx.id.includes('adaptive_'));
  const isCurrentBonus = currentEx && !mandatoryExerciseIds.includes(currentEx.id);

  // Mandatory goal tracking: strictly 5 tasks
  const completedMandatoryCount = completedExerciseIds.filter((id) =>
    mandatoryExerciseIds.includes(id)
  ).length;
  const isMandatoryDone = completedMandatoryCount >= Math.min(5, mandatoryExerciseIds.length || 5);
  const extraTasksInQueue = exerciseQueue.filter(
    (e) => !mandatoryExerciseIds.includes(e.id)
  );

  // Check if current task is recall-based (where answer should NEVER be shown before answering)
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

  // RETAKE ENTIRE DAY EXERCISE
  const handleRetakeDayExercise = () => {
    playChime('click');
    loadExercises();
    setMistakeList([]);
    setSessionPointsEarned(0);
    setCompletedExerciseIds([]);
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

  // PAUSE AND RETURN LATER
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

  // SKIP CURRENT EXERCISE (Put into weekly skipped queue)
  const handleSkipExercise = () => {
    if (!currentEx) return;
    playChime('click');

    if (onSkipExercise) {
      onSkipExercise({
        id: `skip_${currentEx.id}_${Date.now()}`,
        exerciseId: currentEx.id,
        day: currentDay,
        level,
        wordClean: currentEx.word?.cleanWord || '',
        title: currentEx.title,
        prompt: currentEx.prompt,
        grammarCategory: currentEx.grammarCategory,
        timestamp: Date.now(),
        skippedAt: Date.now(),
        exerciseData: currentEx,
      });
    }

    setPauseNotification(`Aufgabe „${currentEx.title}“ übersprungen. Du kannst sie jederzeit im Aufgaben-Plan nachholen! ⏩`);
    setTimeout(() => setPauseNotification(null), 4000);

    // Remove from active queue or advance
    if (exerciseIndex < exerciseQueue.length - 1) {
      setExerciseIndex((prev) => prev + 1);
      resetCurrentInputs();
    } else {
      // Completed all available
      playChime('cheer');
      setIsCompleted(true);
    }
  };

  // RESUME A SKIPPED EXERCISE DIRECTLY
  const handleResumeSkippedItem = (skippedItem: SkippedExerciseItem) => {
    playChime('click');
    const matched =
      (skippedItem.exerciseData as GeneratedExercise) ||
      dailyPlan?.nochOffen.find((e) => e.id === skippedItem.exerciseId) ||
      dailyPlan?.heuteEmpfohlen.find((e) => e.id === skippedItem.exerciseId) ||
      dailyPlan?.schwerpunktExtra.find((e) => e.id === skippedItem.exerciseId);

    if (matched) {
      setExerciseQueue((prev) => [matched, ...prev.filter((e) => e.id !== matched.id)]);
      setExerciseIndex(0);
      resetCurrentInputs();
      setShowExerciseMenu(false);
    }
  };

  // CHECK ANSWER
  const handleCheckAnswer = () => {
    if (!currentEx) return;

    let studentAnswer = '';
    if (currentEx.type === 'sentence_builder') {
      studentAnswer = selectedWordBlocks.join(' ');
      if (!studentAnswer.endsWith('.') && currentEx.correctAnswer.endsWith('.')) {
        studentAnswer += '.';
      }
    } else if (currentEx.options && currentEx.type !== 'sentence_expand') {
      studentAnswer = selectedOption;
    } else {
      studentAnswer = textInput.trim();
    }

    if (!studentAnswer) {
      setHintMessage('Wähle oder tippe zuerst eine Antwort aus!');
      return;
    }

    const cleanInput = studentAnswer.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
    const cleanCorrect = currentEx.correctAnswer.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();

    let isCorrect = cleanInput === cleanCorrect;
    if (currentEx.type === 'sentence_expand') {
      const targetWord = (currentEx.word?.cleanWord || '').toLowerCase();
      isCorrect = cleanInput.length >= 8 && (!targetWord || cleanInput.includes(targetWord));
    } else if (currentEx.type === 'bildgeschichte_step') {
      isCorrect = cleanInput.length >= 8;
    }

    if (isCorrect) {
      playChime('success');
      setFeedbackStatus('correct');

      // Modest points per task (max weekly cap is 100):
      // Starter: 4 pts, Profi: 6 pts, Meister: 8 pts
      const basePts = level === 'starter' ? 4 : level === 'profi' ? 6 : 8;
      const pointsEarned = attemptCount === 0 ? basePts : attemptCount === 1 ? Math.max(2, basePts - 2) : 2;

      setSessionPointsEarned((prev) => prev + pointsEarned);
      onAwardPoints(pointsEarned, `${currentEx.title} gelöst!`);

      // Stars
      onRewardStars(level === 'starter' ? 1 : level === 'profi' ? 2 : 3, `${currentEx.title} gemeistert!`);

      // Track completed
      if (!completedExerciseIds.includes(currentEx.id)) {
        setCompletedExerciseIds((prev) => [...prev, currentEx.id]);
      }

      // If this was a skipped task being solved, remove from skipped queue
      if (onCompleteSkipped) {
        const matchingSkip = skippedExercises.find((s) => s.exerciseId === currentEx.id);
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

      // Check if current exercise was in skipped queue and resolve it
      if (onCompleteSkipped) {
        const matchingSkipped = skippedExercises.find(
          (sk) => sk.exerciseId === currentEx.id || sk.id === currentEx.id
        );
        if (matchingSkipped) {
          onCompleteSkipped(matchingSkipped.id);
        }
      }

      setHintMessage(
        `Super gemacht! +${pointsEarned} Punkte! ⭐ ${currentEx.solutionExplanation || ''}`
      );
    } else {
      playChime('whistle');
      const nextAttempt = attemptCount + 1;
      setAttemptCount(nextAttempt);
      setFeedbackStatus('wrong');

      // Record mistake for spaced repetition & weak word analysis
      onRecordMistake({
        word: currentEx.word?.cleanWord || currentEx.word?.word || currentEx.title,
        category: currentEx.grammarCategory,
        wrongAnswer: studentAnswer,
        correctAnswer: currentEx.correctAnswer,
      });

      // Add to session mistake list if not already there
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

      // REPETITION QUEUE: Schedule this exact question to repeat
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

  // INJECT REINFORCEMENT EXERCISES FOR WEAK WORDS
  const handleLoadReinforcement = () => {
    playChime('click');
    if (weakWords.length === 0) return;
    const reinfExercises = generateReinforcementExercises(weakWords, words, level);
    setExerciseQueue((prev) => [...prev, ...reinfExercises]);
    setPauseNotification(`🎯 ${reinfExercises.length} gezielte Übungen für schwierige Wörter hinzugefügt!`);
    setTimeout(() => setPauseNotification(null), 4000);
  };

  // Days metadata
  const days: { id: DayOfWeek; name: string; icon: string; avatar: string }[] = [
    { id: 'monday', name: 'Montag', icon: '🔍', avatar: 'Mia' },
    { id: 'tuesday', name: 'Dienstag', icon: '⚽', avatar: 'Ben' },
    { id: 'wednesday', name: 'Mittwoch', icon: '🏗️', avatar: 'Leo' },
    { id: 'thursday', name: 'Donnerstag', icon: '✍️', avatar: 'Sophie' },
    { id: 'friday', name: 'Freitag', icon: '📖', avatar: 'Sophie' },
    { id: 'saturday', name: 'Samstag', icon: '🏆', avatar: 'Challenge' },
  ];

  // Daily workload count: completed vs total
  const completedTodayCount = Math.min(
    exerciseQueue.length,
    completedExerciseIds.filter((id) => exerciseQueue.some((q) => q.id === id)).length
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Day Selector Navigation Bar */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-md border border-slate-200">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {days.map((d) => {
            const isActive = currentDay === d.id;
            return (
              <button
                key={d.id}
                onClick={() => {
                  playChime('click');
                  onSelectDay(d.id);
                }}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-102 font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                }`}
              >
                <span className="text-xl sm:text-2xl">{d.icon}</span>
                <span className="text-xs sm:text-sm mt-1">{d.name}</span>
                <span
                  className={`text-[10px] mt-0.5 px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200/60 text-slate-500'
                  }`}
                >
                  {d.avatar}
                </span>
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
          {/* Daily Workload Indicator (Strictly tracks 5 mandatory tasks, bonus separate) */}
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
            className="text-indigo-400 hover:text-indigo-700 text-xs font-black px-2 py-1"
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

            {/* Bonus badge */}
            {isCurrentBonus && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-[11px] font-black flex items-center gap-1">
                <Star className="w-3 h-3 text-purple-600" />
                <span>Freiwillige Zusatz-Aufgabe (Kein Pflicht-Pensum)</span>
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
                <span>Schwerpunkt</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePauseSession}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-colors"
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

        {/* EXPANDABLE EXERCISE MENU / ORDER PICKER (Section 18 & 19) */}
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

            {/* TAB 1: HEUTE EMPFOHLEN (Max 5 mixed tasks) */}
            {menuTab === 'heute' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  Ausgewogene Tagesmischung für heute (max. 5 Aufgaben). Klicke eine Aufgabe, um ihre Reihenfolge zu wählen:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {exerciseQueue.map((ex, qIdx) => {
                    const isCurrent = qIdx === exerciseIndex;
                    const isCompletedItem = completedExerciseIds.includes(ex.id);
                    // Meaningful recommendation: Next uncompleted item is recommended next!
                    const isNextRecommended = !isCompletedItem && qIdx === exerciseIndex;

                    let badgeLabel = '🟢 Gut zum Üben';
                    let badgeColor = 'bg-slate-100 text-slate-700';

                    if (isCompletedItem) {
                      badgeLabel = '✅ Erledigt';
                      badgeColor = 'bg-emerald-100 text-emerald-800';
                    } else if (isNextRecommended) {
                      badgeLabel = '⭐ Als Nächstes empfohlen';
                      badgeColor = 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-black';
                    } else if (ex.id.includes('_repeat')) {
                      badgeLabel = '🔄 Wiederholen';
                      badgeColor = 'bg-amber-100 text-amber-900';
                    } else if (ex.id.includes('reinf_') || ex.id.includes('adaptive_')) {
                      badgeLabel = '🎯 Schwerpunkt';
                      badgeColor = 'bg-rose-100 text-rose-900';
                    }

                    return (
                      <button
                        key={ex.id}
                        onClick={() => {
                          playChime('click');
                          setExerciseIndex(qIdx);
                          resetCurrentInputs();
                          setShowExerciseMenu(false);
                        }}
                        className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-1.5 ${
                          isCurrent
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-slate-400">#{qIdx + 1}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {badgeLabel}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm line-clamp-1">
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
                        <div className="font-bold text-slate-800 text-xs line-clamp-2">
                          {ex.prompt}
                        </div>
                        <div className="text-[11px] text-purple-600 font-medium">
                          + Als freiwilligen Zusatz üben
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm font-bold text-slate-500">
                    Alle Wochen-Aufgaben wurden bereits eingeplant! 🎉
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ÜBERSPRUNGEN */}
            {menuTab === 'skipped' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  Übersprungene Aufgaben bleiben erhalten und können jederzeit nachgeholt werden:
                </div>
                {skippedExercises.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {skippedExercises.map((sk) => (
                      <div
                        key={sk.id}
                        className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-black text-amber-950">{sk.title}</div>
                          <div className="text-amber-800 font-medium">{sk.prompt}</div>
                        </div>
                        <button
                          onClick={() => handleResumeSkippedItem(sk)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shrink-0 transition-colors"
                        >
                          Jetzt nachholen ➡️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm font-bold text-emerald-600">
                    Keine übersprungenen Aufgaben! Alles brav gelöst. 🌟
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SCHWERPUNKT */}
            {menuTab === 'schwerpunkt' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                  <span>Gezielte Zusatz-Übungen für Wörter mit Fehlern (Freiwillig):</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                    Empfohlen · Freiwillig
                  </span>
                </div>
                {dailyPlan && dailyPlan.schwerpunktExtra.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto">
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
                        className="p-3.5 rounded-2xl text-left border border-rose-200 bg-rose-50/50 hover:bg-rose-100 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-rose-900">{ex.title}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                            Freiwillig
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 mt-1">{ex.prompt}</div>
                        <div className="text-[11px] text-rose-600 font-bold mt-2 flex items-center gap-1">
                          <span>+ Als freiwilligen Schwerpunkt üben</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm font-bold text-slate-500">
                    Keine offenen Fehlerschwerpunkte für diese Wörter vorhanden. Super! 🚀
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SKIPPED TASKS BANNER */}
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
            <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg border border-slate-200 space-y-6">
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
              {/* For recall tasks (type_word, missing_letters, spelling_choice, picture_match),
                  NEVER show the target word in readable text before answering! */}
              {currentEx.word && (
                <div className="flex justify-center">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-3xl bg-gradient-to-tr from-indigo-50 via-slate-50 to-amber-50 border-3 border-indigo-200 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="text-7xl sm:text-8xl md:text-9xl animate-bounce-subtle select-none">
                      {currentEx.word.emoji || '📝'}
                    </div>

                    {/* DECORATIVE LABEL: Only revealed after answering or for non-recall tasks */}
                    <div className="absolute bottom-3 sm:bottom-4 px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur-xs border-2 border-indigo-200 text-sm sm:text-base md:text-lg font-black text-indigo-950 shadow-md">
                      {feedbackStatus === 'correct' || feedbackStatus === 'revealed' ? (
                        currentEx.word.cleanWord
                      ) : isRecallTask ? (
                        <span className="text-slate-400 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                          <span>❓</span>
                          <span>Was ist das?</span>
                        </span>
                      ) : (
                        currentEx.word.cleanWord
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* INSTRUCTION HIERARCHY (Section 1 & 2):
                  1. Small secondary technical exercise label
                  2. Large prominent action instruction with accent color */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-wider border border-slate-200">
                    {currentEx.title}
                  </span>
                  {currentEx.grammarCategory && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                      {currentEx.grammarCategory}
                    </span>
                  )}
                  {isCurrentBonus && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200">
                      Freiwilliger Bonus
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Large prominent task instruction */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-indigo-950 leading-snug tracking-tight break-words">
                      {currentEx.prompt}
                    </h3>

                    {/* Contextual Sentence / Pattern / Blank Card (if any) */}
                    {currentEx.contextSentence && currentEx.type !== 'bildgeschichte_step' && (
                      <div className="mt-3 p-3.5 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-800 text-base sm:text-lg md:text-xl font-bold tracking-wide break-words">
                        {currentEx.contextSentence}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSpeakPrompt(`${currentEx.prompt}. ${currentEx.contextSentence || ''}`)}
                    className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors shrink-0 shadow-xs"
                    title="Aufgabe vorlesen"
                  >
                    <Volume2 className="w-5 sm:w-6 h-5 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* 💡 NON-SPOILER CONCEPT HINT CARD (EINZAHL & MEHRZAHL - Section 7 & 8) */}
              {currentEx.type === 'plural_choice' && currentEx.pluralRuleHint && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-xs flex items-start gap-3.5">
                  <div className="text-2xl shrink-0 mt-0.5">💡</div>
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Tipp
                    </div>
                    <div className="text-sm sm:text-base font-bold text-amber-950 leading-relaxed">
                      {currentEx.pluralRuleHint}
                    </div>
                  </div>
                </div>
              )}

              {/* EXERCISE INTERACTION ZONE */}
              <div className="pt-2">
                {/* 1. Sentence Builder with draggable/clickable Word Blocks (Wednesday) */}
                {currentEx.type === 'sentence_builder' && (
                  <div className="space-y-6">
                    <div className="min-h-[84px] p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-indigo-300 flex flex-wrap items-center gap-2.5">
                      {selectedWordBlocks.length === 0 ? (
                        <span className="text-base font-bold text-slate-400 italic">
                          Klicke auf die Wort-Blöcke unten, um den Satz zu bauen...
                        </span>
                      ) : (
                        selectedWordBlocks.map((block, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => handleSelectWordBlock(block)}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-base sm:text-lg shadow-md active:scale-95 transition-transform flex items-center gap-1.5"
                          >
                            <span>{block}</span>
                            <span className="text-xs text-indigo-200 ml-1">✕</span>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Verfügbare Wort-Blöcke:
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {currentEx.wordBlocks?.map((block, idx) => {
                          const isUsed = selectedWordBlocks.includes(block);
                          return (
                            <button
                              key={idx}
                              disabled={isUsed || feedbackStatus === 'correct'}
                              onClick={() => handleSelectWordBlock(block)}
                              className={`px-5 py-3 rounded-2xl font-black text-base sm:text-lg transition-all border shadow-xs ${
                                isUsed
                                  ? 'opacity-30 bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed'
                                  : 'bg-white hover:bg-indigo-50 border-slate-300 text-slate-800 hover:border-indigo-400 active:scale-95'
                              }`}
                            >
                              {block}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedWordBlocks.length > 0 && feedbackStatus !== 'correct' && (
                      <button
                        onClick={() => {
                          playChime('click');
                          setSelectedWordBlocks([]);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Blöcke zurücksetzen</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 2. Multiple Choice Options (Spelling, Conjugation, Wortart, Plural, Article, Connector) */}
                {currentEx.options &&
                  currentEx.type !== 'sentence_expand' &&
                  currentEx.type !== 'sentence_builder' &&
                  currentEx.type !== 'bildgeschichte_step' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {currentEx.options.map((opt, oIdx) => {
                        const isSelected = selectedOption === opt;
                        return (
                          <button
                            key={oIdx}
                            disabled={feedbackStatus === 'correct'}
                            onClick={() => {
                              playChime('click');
                              setSelectedOption(opt);
                              setHintMessage(null);
                            }}
                            className={`p-5 rounded-2xl font-black text-lg sm:text-xl transition-all border-2 text-center shadow-xs ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-md scale-102'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                {/* 3. Text Typing (Missing letters, Full word, Sentence writing) */}
                {(currentEx.type === 'missing_letters' ||
                  currentEx.type === 'type_word' ||
                  currentEx.type === 'sentence_expand') && (
                  <div className="space-y-4">
                    {currentEx.expandSuggestions && currentEx.expandSuggestions.length > 0 && (
                      <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-100 space-y-2">
                        <div className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Mögliche Ideen zum Ergänzen:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentEx.expandSuggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => {
                                playChime('click');
                                setTextInput((prev) => (prev ? `${prev} ${sug}` : sug));
                              }}
                              className="px-4 py-2 rounded-xl bg-white hover:bg-amber-100 text-indigo-900 text-sm font-bold border border-indigo-200 shadow-2xs transition-colors"
                            >
                              + {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type="text"
                        value={textInput}
                        disabled={feedbackStatus === 'correct'}
                        onChange={(e) => {
                          setTextInput(e.target.value);
                          setHintMessage(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCheckAnswer();
                        }}
                        placeholder="Hier deine Antwort eingeben..."
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none text-lg sm:text-xl font-bold text-slate-900 placeholder:text-slate-400 bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Bildgeschichte step inside daily practice (Section 10-14) */}
                {currentEx.type === 'bildgeschichte_step' && (
                  <div className="space-y-5">
                    {/* Large Scene Illustration */}
                    <div className="w-full h-56 sm:h-64 rounded-3xl bg-gradient-to-tr from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-200 flex flex-col items-center justify-center text-7xl sm:text-8xl relative overflow-hidden shadow-inner">
                      <span className="animate-bounce-subtle select-none">{currentEx.sceneEmoji || '📖'}</span>
                      <span className="absolute top-3 left-3 text-xs font-black uppercase px-3 py-1 rounded-xl bg-white/95 text-amber-900 border border-amber-200 shadow-xs">
                        {currentEx.contextSentence || 'Bildgeschichte'}
                      </span>
                    </div>

                    {/* Sentence Starters in large readable chips */}
                    {currentEx.starterIdeas && currentEx.starterIdeas.length > 0 && (
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 space-y-2.5">
                        <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Hilfreiche Satzanfänge (klicke zum Einfügen):</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {currentEx.starterIdeas.map((st, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => {
                                playChime('click');
                                const clean = st.replace('…', '').trim();
                                setTextInput((prev) => (prev ? `${prev} ${clean}` : `${clean} `));
                              }}
                              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-base font-bold border border-amber-200 shadow-2xs transition-colors"
                            >
                              + {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optional Wörter-Hilfe Toggle */}
                    {currentEx.expandSuggestions && currentEx.expandSuggestions.length > 0 && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            playChime('click');
                            setShowWordHelp(!showWordHelp);
                          }}
                          className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{showWordHelp ? 'Wörter-Hilfe ausblenden' : '💡 Wörter-Hilfe anzeigen'}</span>
                        </button>

                        {showWordHelp && (
                          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-wrap gap-2 animate-fade-in">
                            {currentEx.expandSuggestions.map((w, wIdx) => (
                              <span
                                key={wIdx}
                                className="px-3 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-sm font-bold shadow-2xs"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Student Sentence Textarea */}
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={textInput}
                        disabled={feedbackStatus === 'correct'}
                        onChange={(e) => {
                          setTextInput(e.target.value);
                          setHintMessage(null);
                        }}
                        placeholder="Schreibe 1–2 Sätze zu dem Bild..."
                        className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none text-base sm:text-lg font-semibold text-slate-900 resize-none bg-white placeholder:text-slate-400 shadow-inner"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* HINT & FEEDBACK BANNER */}
              {hintMessage && (
                <div
                  className={`p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                    feedbackStatus === 'correct'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : feedbackStatus === 'wrong'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  }`}
                >
                  <div className="shrink-0 mt-0.5 text-2xl">
                    {feedbackStatus === 'correct' ? '🎉' : feedbackStatus === 'wrong' ? '💡' : 'ℹ️'}
                  </div>
                  <div className="flex-1 text-base sm:text-lg font-bold leading-relaxed">
                    {hintMessage}
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS (Prüfen, Hilfe, Skip) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {feedbackStatus !== 'correct' && (
                    <>
                      {currentEx.type === 'bildgeschichte_step' ? (
                        (() => {
                          const unlockStatus = getModelSolutionUnlockStatus(textInput, 2);
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

        {/* MISTAKE MEMORY & REVIEW FOCUS ("Das üben wir noch" / "Schwierige Wörter") */}
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
