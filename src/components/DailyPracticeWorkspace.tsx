import React, { useState, useEffect } from 'react';
import { DayOfWeek, DifficultyLevel, LernwortItem, PracticeMistake } from '../types/lernwoerter';
import {
  generateMondayExercises,
  generateTuesdayExercises,
  generateWednesdayExercises,
  generateThursdayExercises,
  GeneratedExercise,
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
  Star,
  Printer,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Award,
  RefreshCw,
  Trophy,
} from 'lucide-react';

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
  onRewardStars: (count: number, reason: string) => void;
  onAwardPoints: (points: number, reason: string) => void;
  onRecordMistake: (mistake: Omit<PracticeMistake, 'id' | 'timestamp' | 'resolved'>) => void;
  onOpenWorksheet: (day: DayOfWeek) => void;
  onGoToBildgeschichte?: () => void;
}

export const DailyPracticeWorkspace: React.FC<DailyPracticeWorkspaceProps> = ({
  currentDay,
  onSelectDay,
  words,
  pointsToday,
  pointsWeek,
  onRewardStars,
  onAwardPoints,
  onRecordMistake,
  onOpenWorksheet,
  onGoToBildgeschichte,
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

  // Active exercises queue (includes initial exercises + repeated mistakes)
  const [exerciseQueue, setExerciseQueue] = useState<GeneratedExercise[]>([]);

  // List of mistakes encountered in this session (for listing & repetition)
  const [mistakeList, setMistakeList] = useState<RepeatedMistakeItem[]>([]);

  // Initialize or re-initialize exercises
  const loadExercises = () => {
    let exList: GeneratedExercise[] = [];
    if (currentDay === 'monday') {
      exList = generateMondayExercises(words, level);
    } else if (currentDay === 'tuesday') {
      exList = generateTuesdayExercises(words, level);
    } else if (currentDay === 'wednesday') {
      exList = generateWednesdayExercises(level);
    } else if (currentDay === 'thursday') {
      exList = generateThursdayExercises(level);
    }
    setExerciseQueue(exList);
    setExerciseIndex(0);
    setIsCompleted(false);
    resetCurrentInputs();
  };

  useEffect(() => {
    loadExercises();
    setMistakeList([]);
    setSessionPointsEarned(0);
  }, [currentDay, level, words]);

  const currentEx = exerciseQueue[exerciseIndex];
  const isRepeatedTask = currentEx && currentEx.id.includes('_repeat');

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
  };

  // RETAKE ENTIRE DAY EXERCISE
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
    }

    if (isCorrect) {
      playChime('success');
      setFeedbackStatus('correct');

      // Points calculation
      // 1st attempt: 20 pts, 2nd attempt: 15 pts, 3rd+: 10 pts
      const pointsEarned = attemptCount === 0 ? 20 : attemptCount === 1 ? 15 : 10;
      setSessionPointsEarned((prev) => prev + pointsEarned);
      onAwardPoints(pointsEarned, `${currentEx.title} gelöst!`);

      // Stars
      onRewardStars(level === 'starter' ? 1 : level === 'profi' ? 2 : 3, `${currentEx.title} gemeistert!`);

      // If this was a repeated task, mark mistake as resolved
      if (isRepeatedTask) {
        setMistakeList((prev) =>
          prev.map((m) =>
            m.title === currentEx.title ? { ...m, isResolved: true } : m
          )
        );
      }

      setHintMessage(
        `Super gemacht! +${pointsEarned} Punkte! ⭐ ${currentEx.solutionExplanation || ''}`
      );
    } else {
      playChime('whistle');
      const nextAttempt = attemptCount + 1;
      setAttemptCount(nextAttempt);
      setFeedbackStatus('wrong');

      // Record mistake for spaced repetition
      onRecordMistake({
        word: currentEx.word?.word || currentEx.title,
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

      // REPETITION QUEUE: Schedule this exact question to repeat as part of the next Aufgabe!
      // We insert a duplicate clone of this exercise right after the current one or into the queue
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
        // Insert right after next exercise or at end of queue
        const newQueue = [...exerciseQueue];
        const insertPosition = Math.min(exerciseIndex + 2, newQueue.length);
        newQueue.splice(insertPosition, 0, clonedEx);
        setExerciseQueue(newQueue);
      }

      // Smart pedagogical hint
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
      // Completed all exercises for this day/level!
      playChime('cheer');
      setIsCompleted(true);
    }
  };

  const handleRevealSolution = () => {
    if (!currentEx) return;
    playChime('click');
    setFeedbackStatus('revealed');
    setHintMessage(`Lösung: "${currentEx.correctAnswer}". ${currentEx.solutionExplanation || ''}`);
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
                    ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-md scale-102 font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-1">{d.icon}</span>
                <span className="text-base font-bold">{d.name}</span>
                <span className={`text-xs ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {d.avatar}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FRIDAY / SATURDAY special route to Bildgeschichte */}
      {currentDay === 'friday' || currentDay === 'saturday' ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 text-center space-y-6">
          <div className="text-7xl sm:text-8xl animate-bounce-subtle">
            {currentDay === 'friday' ? '📖' : '🏆'}
          </div>
          <div className="max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentDay === 'friday'
                ? 'Freitag: Bildgeschichte 1 – Eine spannende Woche'
                : 'Samstag: Bildgeschichte 2 & Große Wochen-Challenge'}
            </h3>
            <p className="text-slate-600 text-base sm:text-lg font-medium">
              {currentDay === 'friday'
                ? 'Schau dir die 9 großen Bilder an, schreibe zu jedem Bild 1-2 Sätze und nutze die Satzanfänge (Zuerst, Dann, Danach...).'
                : 'Schreibe eine vollständige, spannende Geschichte mit mindestens 6 Sätzen, 6 Lernwörtern und Bindewörtern!'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {onGoToBildgeschichte && (
              <button
                onClick={() => {
                  playChime('click');
                  onGoToBildgeschichte();
                }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg shadow-xl shadow-amber-500/25 active:scale-95 flex items-center gap-3 transition-transform"
              >
                <span>Jetzt Bildgeschichte starten 🚀</span>
              </button>
            )}

            <button
              onClick={() => {
                playChime('click');
                onOpenWorksheet(currentDay);
              }}
              className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center gap-2 border border-slate-200"
            >
              <Printer className="w-5 h-5 text-indigo-600" />
              <span>🖨️ Bildgeschichte drucken</span>
            </button>
          </div>
        </div>
      ) : (
        /* MONDAY - THURSDAY DAILY EXERCISE WORKSPACE */
        <div className="space-y-6">
          {/* Header Bar: Avatar Companion + Difficulty Switcher + Points + Retake Button */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Avatar Companion Info */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-indigo-200 bg-indigo-50 shrink-0">
                {companion.avatarImageUrl ? (
                  <img
                    src={companion.avatarImageUrl}
                    alt={companion.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-indigo-600">
                    {companion.name[0]}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-slate-900">
                    {companion.name}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                    {companionRole}
                  </span>
                </div>
                <div className="text-sm text-slate-500 font-medium mt-0.5">
                  {currentDay === 'monday'
                    ? 'Rechtschreibung & Wortarten'
                    : currentDay === 'tuesday'
                    ? 'Konjugation & Wortformen'
                    : currentDay === 'wednesday'
                    ? 'Wort-Blöcke & Satzbau'
                    : 'Eigene Sätze & Satz-Verbinder'}
                </div>
              </div>
            </div>

            {/* Level Selector: Starter, Profi, Meister */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto">
              <button
                onClick={() => {
                  playChime('click');
                  setLevel('starter');
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                  level === 'starter'
                    ? 'bg-white text-indigo-900 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⭐ Starter</span>
              </button>
              <button
                onClick={() => {
                  playChime('click');
                  setLevel('profi');
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                  level === 'profi'
                    ? 'bg-white text-indigo-900 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⭐⭐ Profi</span>
              </button>
              <button
                onClick={() => {
                  playChime('click');
                  setLevel('meister');
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                  level === 'meister'
                    ? 'bg-white text-indigo-900 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⭐⭐⭐ Meister</span>
              </button>
            </div>

            {/* Points Today & Week Summary Badges */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-amber-900">
                <Trophy className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase text-amber-700">Heute</div>
                  <div className="text-sm font-black">{pointsToday} Pkt</div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-indigo-900">
                <Star className="w-5 h-5 text-indigo-600 fill-indigo-200" />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase text-indigo-600">Woche</div>
                  <div className="text-sm font-black">{pointsWeek} Pkt</div>
                </div>
              </div>

              {/* Retake Button (Can be clicked at any time) */}
              <button
                onClick={handleRetakeDayExercise}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors"
                title="Diese Einheit von vorne beginnen / wiederholen"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* COMPLETED SCREEN (WITH RETAKE POSSIBILITY) */}
          {isCompleted ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-5xl shadow-lg shadow-emerald-200/50 animate-bounce-subtle">
                🏆
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Einheit erfolgreich abgeschlossen!
                </h3>
                <p className="text-slate-600 text-base sm:text-lg font-medium">
                  Großartige Leistung, Jedidiah! Du hast alle Aufgaben für{' '}
                  <strong>{currentDay.toUpperCase()}</strong> auf Stufe{' '}
                  <strong>{level.toUpperCase()}</strong> gemeistert.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <div className="bg-amber-50 border border-amber-200 px-5 py-3 rounded-2xl text-center">
                  <div className="text-2xl font-black text-amber-700">+{sessionPointsEarned}</div>
                  <div className="text-xs font-bold text-amber-600 uppercase">Punkte verdient</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl text-center">
                  <div className="text-2xl font-black text-emerald-700">100%</div>
                  <div className="text-xs font-bold text-emerald-600 uppercase">Gemeistert</div>
                </div>
              </div>

              {/* ACTION BUTTONS: RETAKE OR ADVANCE */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleRetakeDayExercise}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base sm:text-lg shadow-xl shadow-indigo-600/25 active:scale-95 flex items-center gap-3 transition-transform"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Diese Einheit wiederholen / Nochmal üben 🔄</span>
                </button>

                <button
                  onClick={() => {
                    playChime('click');
                    if (level === 'starter') setLevel('profi');
                    else if (level === 'profi') setLevel('meister');
                    else onSelectDay(currentDay === 'monday' ? 'tuesday' : currentDay === 'tuesday' ? 'wednesday' : 'thursday');
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
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 space-y-6">
                {/* Progress Tracker & Points Award Tag */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-black flex items-center justify-center">
                      {exerciseIndex + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Aufgabe {exerciseIndex + 1} von {exerciseQueue.length}
                    </span>

                    {/* REPETITION BADGE IF REPEATED TASK */}
                    {isRepeatedTask && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Wiederholungs-Aufgabe</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>+20 Punkte bei 1. Versuch</span>
                    </div>

                    <button
                      onClick={handleRetakeDayExercise}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1"
                      title="Einheit neu starten"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Neu starten</span>
                    </button>
                  </div>
                </div>

                {/* PROMINENT IMAGE / VISUAL PRESENTATION (TWICE AS BIG ON SCREEN) */}
                {currentEx.word && (
                  <div className="flex justify-center">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-indigo-50 via-slate-50 to-amber-50 border-2 border-indigo-100 shadow-md flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="text-7xl sm:text-8xl animate-bounce-subtle select-none">
                        {currentEx.word.emoji || '📝'}
                      </div>
                      <div className="absolute bottom-3 px-4 py-1 rounded-xl bg-white/95 backdrop-blur-xs border border-indigo-100 text-xs sm:text-sm font-black text-indigo-900 shadow-xs">
                        {currentEx.word.cleanWord}
                      </div>
                    </div>
                  </div>
                )}

                {/* Task Header & Voice Reader */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                        {currentEx.title}
                      </h3>
                      <p className="text-slate-700 font-semibold text-lg sm:text-xl mt-1.5 whitespace-pre-line leading-relaxed">
                        {currentEx.prompt}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSpeakPrompt(currentEx.prompt)}
                      className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors shrink-0 shadow-xs"
                      title="Aufgabe vorlesen"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* EXERCISE INTERACTION ZONE */}
                <div className="pt-2">
                  {/* 1. Sentence Builder with draggable/clickable Word Blocks (Wednesday) */}
                  {currentEx.type === 'sentence_builder' && (
                    <div className="space-y-6">
                      {/* Sentence Drop / Arrangement Area */}
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

                      {/* Available Word Blocks to Pick */}
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

                      {/* Reset button */}
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

                  {/* 2. Multiple Choice Options (Spelling, Conjugation, Wortart, Plural, Article) */}
                  {currentEx.options && currentEx.type !== 'sentence_expand' && currentEx.type !== 'sentence_builder' && (
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
                  {(currentEx.type === 'missing_letters' || currentEx.type === 'type_word' || currentEx.type === 'sentence_expand') && (
                    <div className="space-y-4">
                      {/* Expand suggestion chips for Thursday */}
                      {currentEx.expandSuggestions && currentEx.expandSuggestions.length > 0 && (
                        <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-100 space-y-2">
                          <div className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span>Mögliche Ideen zum Ergänzen (klicke zum Einfügen):</span>
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

                {/* ACTION BUTTONS (Prüfen, Hilfe, Nächste) */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    {feedbackStatus !== 'correct' && (
                      <button
                        onClick={handleRevealSolution}
                        className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2 transition-colors"
                      >
                        <HelpCircle className="w-5 h-5 text-slate-400" />
                        <span>Hilfe / Lösung anzeigen</span>
                      </button>
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

          {/* REPEATED MISTAKES LIST (Showing repeated questions for transparency) */}
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
                  <div
                    key={mIdx}
                    className="py-2.5 flex items-center justify-between text-sm"
                  >
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
      )}
    </div>
  );
};
