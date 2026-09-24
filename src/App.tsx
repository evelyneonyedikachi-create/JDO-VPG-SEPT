import React, { useState, useEffect } from 'react';
import {
  DayOfWeek,
  DifficultyLevel,
  LernwortItem,
  MiniExamResult,
  PausedSessionState,
  PracticeMistake,
  SkippedExerciseItem,
  WeeklyCurriculum,
} from './types/lernwoerter';
import { INITIAL_CURRICULUM } from './data/defaultWeeklyCurriculum';
import { HeuteScreen } from './components/HeuteScreen';
import { LernwoerterWordExplorer } from './components/LernwoerterWordExplorer';
import { DailyPracticeWorkspace } from './components/DailyPracticeWorkspace';
import { BildgeschichteWorkshop } from './components/BildgeschichteWorkshop';
import { SterneRewardsScreen } from './components/SterneRewardsScreen';
import { ParentLernwoerterBackend } from './components/ParentLernwoerterBackend';
import { PrintWorksheetModal } from './components/PrintWorksheetModal';
import { MiniExamModal } from './components/MiniExamModal';
import { VoiceGamesHub } from './components/VoiceGames/VoiceGamesHub';
import { PLAYMATES } from './data/characters';
import { playChime } from './utils/soundEffects';
import {
  Sparkles,
  BookOpen,
  Calendar,
  PenTool,
  Trophy,
  Star,
  Settings,
  Printer,
  Flame,
  Gamepad2,
  Cloud,
  Check,
} from 'lucide-react';
import {
  fetchRemoteProgress,
  queueProgressSync,
  subscribeSyncStatus,
  SyncState,
} from './services/progressSyncService';
import { CompletedExerciseRecord } from './types/progress';
import {
  calculateAllDaysProgress,
  calculateWeeklyOverview,
  determineNextRecommendedTask,
} from './services/progressService';

type MainView = 'heute' | 'woerter' | 'ueben' | 'bildgeschichte' | 'sterne' | 'games';

function getTodayDayOfWeek(): DayOfWeek {
  const day = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
  switch (day) {
    case 1:
      return 'monday';
    case 2:
      return 'tuesday';
    case 3:
      return 'wednesday';
    case 4:
      return 'thursday';
    case 5:
      return 'friday';
    case 6:
      return 'saturday';
    default:
      return 'monday'; // default Sunday to Monday
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<MainView>('heute');
  const [activeDay, setActiveDay] = useState<DayOfWeek>(() => getTodayDayOfWeek());

  // Curriculum state
  const [curriculum, setCurriculum] = useState<WeeklyCurriculum>(() => {
    try {
      const saved = localStorage.getItem('jd_curriculum_v2');
      return saved ? JSON.parse(saved) : INITIAL_CURRICULUM;
    } catch {
      return INITIAL_CURRICULUM;
    }
  });

  // Stars count
  const [starsCount, setStarsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jd_total_stars');
      return saved ? parseInt(saved, 10) : 12;
    } catch {
      return 12;
    }
  });

  // Streak days
  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jd_streak_days');
      return saved ? parseInt(saved, 10) : 4;
    } catch {
      return 4;
    }
  });

  // Points tracking (per day, capped per week at 100 max, and cumulative for long-term reward ladder)
  const todayKey = new Date().toISOString().slice(0, 10);
  const [pointsState, setPointsState] = useState<{
    pointsToday: number;
    pointsWeek: number; // strictly capped at 100 max
    cumulativePoints: number; // separate cumulative counter for reward ladder (1000 Pkt = Pizza + Fanta)
    lastDate: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('jd_points_state_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastDate !== todayKey) {
          return {
            pointsToday: 0,
            pointsWeek: Math.min(100, parsed.pointsWeek || 0),
            cumulativePoints: parsed.cumulativePoints || 420,
            lastDate: todayKey,
          };
        }
        return {
          ...parsed,
          pointsWeek: Math.min(100, parsed.pointsWeek || 0),
          cumulativePoints: parsed.cumulativePoints || 420,
        };
      }
      return { pointsToday: 24, pointsWeek: 65, cumulativePoints: 420, lastDate: todayKey };
    } catch {
      return { pointsToday: 24, pointsWeek: 65, cumulativePoints: 420, lastDate: todayKey };
    }
  });

  // Claimed / received rewards tracker (level numbers, e.g. [1, 2])
  // Claiming a reward NEVER deducts points. Points accumulate permanently as lifetime points.
  const [claimedRewards, setClaimedRewards] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('jd_claimed_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleClaimReward = (level: number) => {
    setClaimedRewards((prev) => {
      const exists = prev.includes(level);
      const updated = exists ? prev.filter((l) => l !== level) : [...prev, level];
      try {
        localStorage.setItem('jd_claimed_rewards', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Completed exercise records (id, day, pointsEarned, completedAt)
  const [completedRecords, setCompletedRecords] = useState<CompletedExerciseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jd_completed_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleRecordCompletedExercise = (record: CompletedExerciseRecord) => {
    setCompletedRecords((prev) => {
      const exists = prev.some((r) => r.id === record.id && r.day === record.day);
      if (exists) return prev;
      const updated = [...prev, record];
      try {
        localStorage.setItem('jd_completed_records', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAwardPoints = (points: number, _reason: string) => {
    setPointsState((prev) => {
      const updated = {
        pointsToday: prev.pointsToday + points,
        pointsWeek: Math.min(100, prev.pointsWeek + points), // STRICT 100 PTS WEEKLY CAP
        cumulativePoints: (prev.cumulativePoints || 0) + points, // ACCUMULATES FOR LONG-TERM REWARDS
        lastDate: todayKey,
      };
      try {
        localStorage.setItem('jd_points_state_v3', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Skipped exercises weekly queue
  const [skippedExercises, setSkippedExercises] = useState<SkippedExerciseItem[]>(() => {
    try {
      const saved = localStorage.getItem('jd_skipped_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSkipExercise = (item: SkippedExerciseItem) => {
    setSkippedExercises((prev) => {
      const updated = [...prev.filter((i) => i.exerciseId !== item.exerciseId), item];
      try {
        localStorage.setItem('jd_skipped_queue', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCompleteSkipped = (skippedId: string) => {
    setSkippedExercises((prev) => {
      const updated = prev.filter((i) => i.id !== skippedId);
      try {
        localStorage.setItem('jd_skipped_queue', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Paused session state (for returning later)
  const [pausedSession, setPausedSession] = useState<PausedSessionState | null>(() => {
    try {
      const saved = localStorage.getItem('jd_paused_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSavePauseSession = (state: PausedSessionState | null) => {
    setPausedSession(state);
    try {
      if (state) {
        localStorage.setItem('jd_paused_session', JSON.stringify(state));
      } else {
        localStorage.removeItem('jd_paused_session');
      }
    } catch {}
  };

  // 4-Week Cycle Mini Exam
  const [showMiniExam, setShowMiniExam] = useState<boolean>(false);
  const [miniExamHistory, setMiniExamHistory] = useState<MiniExamResult[]>(() => {
    try {
      const saved = localStorage.getItem('jd_mini_exam_results');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleFinishExam = (result: MiniExamResult) => {
    setMiniExamHistory((prev) => {
      const updated = [result, ...prev];
      try {
        localStorage.setItem('jd_mini_exam_results', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    handleAwardPoints(20, '4-Wochen Mini-Prüfung abgeschlossen!');
    handleRewardStars(10, 'Mini-Prüfung Urkunde!');
  };

  // Mistakes for spaced repetition ("Noch üben")
  const [mistakes, setMistakes] = useState<PracticeMistake[]>(() => {
    try {
      const saved = localStorage.getItem('jd_mistakes_v2');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'm1',
              word: 'kennen',
              category: 'Grammatik',
              wrongAnswer: 'du kennst nicht',
              correctAnswer: 'du kennst',
              timestamp: Date.now() - 86400000,
              resolved: false,
            },
            {
              id: 'm2',
              word: 'das Schloss',
              category: 'Artikel',
              wrongAnswer: 'der Schloss',
              correctAnswer: 'das Schloss',
              timestamp: Date.now() - 43200000,
              resolved: false,
            },
            {
              id: 'm3',
              word: 'rennen',
              category: 'Grammatik',
              wrongAnswer: 'er renntet',
              correctAnswer: 'er rennt',
              timestamp: Date.now() - 20000000,
              resolved: false,
            },
          ];
    } catch {
      return [];
    }
  });

  // Calculate weak words from mistakes
  const mistakeCounts = mistakes.reduce((acc, m) => {
    const clean = m.word.replace(/^(der|die|das)\s+/i, '').trim();
    acc[clean] = (acc[clean] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const calculatedWeakWords = Object.keys(mistakeCounts);
  const activeWeakWords = calculatedWeakWords.length > 0 ? calculatedWeakWords : ['schwimmen', 'Zimmer'];

  // Backend persistence & cross-device sync
  const [syncStatus, setSyncStatus] = useState<SyncState>('idle');
  const isInitialRemoteLoadDone = React.useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus(setSyncStatus);

    fetchRemoteProgress('jedidiah').then((remote) => {
      if (remote) {
        if (remote.curriculum) setCurriculum(remote.curriculum);
        if (typeof remote.starsCount === 'number') setStarsCount(remote.starsCount);
        if (typeof remote.streakDays === 'number') setStreakDays(remote.streakDays);
        if (remote.pointsState) setPointsState(remote.pointsState);
        if (Array.isArray(remote.skippedExercises)) setSkippedExercises(remote.skippedExercises);
        if (remote.pausedSession !== undefined) setPausedSession(remote.pausedSession);
        if (Array.isArray(remote.miniExamHistory)) setMiniExamHistory(remote.miniExamHistory);
        if (Array.isArray(remote.mistakes)) setMistakes(remote.mistakes);
        if (Array.isArray(remote.claimedRewards)) setClaimedRewards(remote.claimedRewards);
        if (Array.isArray(remote.completedExerciseRecords)) setCompletedRecords(remote.completedExerciseRecords);
      }
      isInitialRemoteLoadDone.current = true;
    });

    return () => unsubscribe();
  }, []);

  // Queue backend sync whenever progress state updates
  useEffect(() => {
    if (!isInitialRemoteLoadDone.current) return;
    queueProgressSync(
      {
        curriculum,
        starsCount,
        streakDays,
        pointsState,
        skippedExercises,
        pausedSession,
        miniExamHistory,
        mistakes,
        claimedRewards,
        completedExerciseRecords: completedRecords,
      },
      'jedidiah'
    );
  }, [
    curriculum,
    starsCount,
    streakDays,
    pointsState,
    skippedExercises,
    pausedSession,
    miniExamHistory,
    mistakes,
    claimedRewards,
    completedRecords,
  ]);

  // Modals
  const [showParentBackend, setShowParentBackend] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printModalDay, setPrintModalDay] = useState<DayOfWeek>('monday');

  // Reward handler
  const handleRewardStars = (count: number, reason: string) => {
    const updated = starsCount + count;
    setStarsCount(updated);
    try {
      localStorage.setItem('jd_total_stars', updated.toString());
    } catch {}
  };

  // Record mistake for "Noch üben"
  const handleRecordMistake = (
    mistakeData: Omit<PracticeMistake, 'id' | 'timestamp' | 'resolved'>
  ) => {
    const newMistake: PracticeMistake = {
      ...mistakeData,
      id: `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      resolved: false,
    };
    const updated = [newMistake, ...mistakes.slice(0, 19)];
    setMistakes(updated);
    try {
      localStorage.setItem('jd_mistakes_v2', JSON.stringify(updated));
    } catch {}
  };

  const handleClearResolvedMistakes = () => {
    setMistakes([]);
    try {
      localStorage.removeItem('jd_mistakes_v2');
    } catch {}
  };

  const handleSaveCurriculum = (newCurriculum: WeeklyCurriculum) => {
    setCurriculum(newCurriculum);
    try {
      localStorage.setItem('jd_curriculum_v2', JSON.stringify(newCurriculum));
    } catch {}
  };

  const openPrintForDay = (day: DayOfWeek = activeDay) => {
    setPrintModalDay(day);
    setShowPrintModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Logo & Platform Name */}
          {/* Brand Logo / Home */}
          <div
            onClick={() => {
              playChime('click');
              setCurrentView('heute');
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-amber-200 fill-amber-300" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>JD LernPlayground</span>
                <span className="text-xs uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hidden sm:inline">
                  Deutsch 4. Klasse
                </span>
              </h1>
            </div>
          </div>

          {/* Child Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              onClick={() => {
                playChime('click');
                setCurrentView('heute');
              }}
              className={`px-3.5 lg:px-4 py-2 lg:py-2.5 rounded-2xl text-sm sm:text-base font-black transition-all ${
                currentView === 'heute'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              🏠 Heute
            </button>

            <button
              onClick={() => {
                playChime('click');
                setCurrentView('woerter');
              }}
              className={`px-3.5 lg:px-4 py-2 lg:py-2.5 rounded-2xl text-sm sm:text-base font-black transition-all ${
                currentView === 'woerter'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              📚 Lernwörter
            </button>

            <button
              onClick={() => {
                playChime('click');
                setCurrentView('ueben');
              }}
              className={`px-3.5 lg:px-4 py-2 lg:py-2.5 rounded-2xl text-sm sm:text-base font-black transition-all ${
                currentView === 'ueben'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              ✏️ Tages-Übungen
            </button>

            <button
              onClick={() => {
                playChime('click');
                setCurrentView('bildgeschichte');
              }}
              className={`px-3.5 lg:px-4 py-2 lg:py-2.5 rounded-2xl text-sm sm:text-base font-black transition-all ${
                currentView === 'bildgeschichte'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              📖 Bild-Geschichte
            </button>

            <button
              onClick={() => {
                playChime('click');
                setCurrentView('sterne');
              }}
              className={`px-3.5 lg:px-4 py-2 lg:py-2.5 rounded-2xl text-sm sm:text-base font-black transition-all ${
                currentView === 'sterne'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              ⭐ Belohnungen
            </button>
          </nav>

          {/* Right Controls: Unified Points & Stars Counter, Print & Parent Backend */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Unified Points & Stars Counter */}
            <button
              onClick={() => {
                playChime('click');
                setCurrentView('sterne');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200 shadow-2xs text-sm sm:text-base font-black text-amber-950 transition-all active:scale-95"
              title="Punkte & Sterne ansehen"
            >
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>{pointsState.pointsToday} Pkt</span>
              <span className="text-amber-300">|</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{starsCount} ⭐</span>
            </button>

            {/* Print Worksheet Shortcut */}
            <button
              onClick={() => openPrintForDay(activeDay)}
              className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-sm sm:text-base font-bold text-slate-800 border-2 border-slate-200 shadow-2xs flex items-center gap-2 transition-all"
              title="Arbeitsblatt drucken"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Drucken</span>
            </button>

            {/* Cloud Sync Status */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-2 rounded-2xl border text-xs font-bold transition-all ${
                syncStatus === 'syncing'
                  ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
                  : syncStatus === 'offline'
                  ? 'bg-slate-100 border-slate-200 text-slate-500'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
              title={
                syncStatus === 'syncing'
                  ? 'Synchronisiere mit der Datenbank...'
                  : syncStatus === 'offline'
                  ? 'Offline-Modus: Daten sicher im Browser gespeichert'
                  : 'Fortschritt sicher mit Datenbank & allen Geräten synchronisiert'
              }
            >
              <Cloud className="w-4 h-4 shrink-0" />
              <span>
                {syncStatus === 'syncing'
                  ? 'Sichert...'
                  : syncStatus === 'offline'
                  ? 'Lokal'
                  : 'Gesichert'}
              </span>
              {syncStatus === 'synced' && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            </div>

            {/* Parent Area (PIN 1234) */}
            <button
              id="btn-parent-dashboard"
              onClick={() => {
                playChime('click');
                setShowParentBackend(true);
              }}
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 hover:text-slate-900 border-2 border-slate-200 shadow-2xs transition-all"
              title="Eltern-Bereich (PIN 1234)"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1.5 text-xs font-bold bg-slate-50">
          <button
            onClick={() => setCurrentView('heute')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentView === 'heute' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
          >
            🏠 Heute
          </button>
          <button
            onClick={() => setCurrentView('woerter')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentView === 'woerter' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
          >
            📚 Wörter
          </button>
          <button
            onClick={() => setCurrentView('ueben')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentView === 'ueben' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
          >
            ✏️ Üben
          </button>
          <button
            onClick={() => setCurrentView('bildgeschichte')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentView === 'bildgeschichte' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
          >
            📖 Bildgeschichte
          </button>
          <button
            onClick={() => setCurrentView('sterne')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentView === 'sterne' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
          >
            ⭐ Sterne
          </button>
        </div>
      </header>

      {/* Main Dynamic Workspace */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 w-full">
        {/* VIEW 1: HEUTE (Today's Mission) */}
        {(() => {
          const daysProgress = calculateAllDaysProgress({
            words: curriculum.words,
            completedRecords,
            pausedSession,
            skippedExercises,
          });

          const weeklyOverview = calculateWeeklyOverview({
            daysProgress,
            pointsWeek: pointsState.pointsWeek,
            skippedExercises,
            pausedSession,
          });

          const nextTask = determineNextRecommendedTask({
            currentDay: activeDay,
            words: curriculum.words,
            daysProgress,
            pausedSession,
            skippedExercises,
            weakWords: activeWeakWords,
            completedRecords,
          });

          return (
            <>
              {currentView === 'heute' && (
                <HeuteScreen
                  currentDay={activeDay}
                  words={curriculum.words}
                  starsCount={starsCount}
                  streakDays={streakDays}
                  pointsToday={pointsState.pointsToday}
                  pointsWeek={pointsState.pointsWeek}
                  cumulativePoints={pointsState.cumulativePoints}
                  pausedSession={pausedSession}
                  onResumePaused={() => {
                    if (pausedSession) {
                      setActiveDay(pausedSession.day);
                      setCurrentView('ueben');
                    }
                  }}
                  skippedCount={skippedExercises.length}
                  weakWords={activeWeakWords}
                  daysProgress={daysProgress}
                  weeklyOverview={weeklyOverview}
                  nextTask={nextTask}
                  onSelectDay={(day) => setActiveDay(day)}
                  onStartToday={() => setCurrentView('ueben')}
                  onGoToWords={() => setCurrentView('woerter')}
                  onGoToBildgeschichte={() => setCurrentView('bildgeschichte')}
                  onOpenWorksheet={() => openPrintForDay(activeDay)}
                  onOpenRewards={() => setCurrentView('sterne')}
                  onOpenMiniExam={() => setShowMiniExam(true)}
                />
              )}

              {/* VIEW 2: MEINE LERNWÖRTER (Word Explorer, Lernwörter 1 & 2, Flashcards, Pronoun Sentence Tables) */}
              {currentView === 'woerter' && (
                <LernwoerterWordExplorer
                  words={curriculum.words}
                  onOpenWorksheet={() => openPrintForDay('monday')}
                />
              )}

              {/* VIEW 3: ÜBEN (Monday to Saturday Daily Interactive Exercise Engine) */}
              {currentView === 'ueben' && (
                <DailyPracticeWorkspace
                  currentDay={activeDay}
                  onSelectDay={(day) => setActiveDay(day)}
                  words={curriculum.words}
                  pointsToday={pointsState.pointsToday}
                  pointsWeek={pointsState.pointsWeek}
                  cumulativePoints={pointsState.cumulativePoints}
                  onRewardStars={handleRewardStars}
                  onAwardPoints={handleAwardPoints}
                  onRecordMistake={handleRecordMistake}
                  onOpenWorksheet={openPrintForDay}
                  onGoToBildgeschichte={() => setCurrentView('bildgeschichte')}
                  skippedExercises={skippedExercises}
                  onSkipExercise={handleSkipExercise}
                  onCompleteSkipped={handleCompleteSkipped}
                  pausedSession={pausedSession}
                  onSavePauseSession={handleSavePauseSession}
                  weakWords={activeWeakWords}
                  completedRecords={completedRecords}
                  onRecordCompletedExercise={handleRecordCompletedExercise}
                  daysProgress={daysProgress}
                />
              )}
            </>
          );
        })()}

        {/* VIEW 4: BILDGESCHICHTE (Freitag 9 Szenen & Samstag Wochen-Challenge) */}
        {currentView === 'bildgeschichte' && (
          <BildgeschichteWorkshop
            scenes={curriculum.scenes}
            words={curriculum.words}
            pointsToday={pointsState.pointsToday}
            pointsWeek={pointsState.pointsWeek}
            onRewardStars={handleRewardStars}
            onAwardPoints={handleAwardPoints}
            onOpenWorksheet={() => openPrintForDay('friday')}
          />
        )}

        {/* VIEW 5: MEINE STERNE & ERFOLGE */}
        {currentView === 'sterne' && (
          <SterneRewardsScreen
            starsCount={starsCount}
            streakDays={streakDays}
            pointsToday={pointsState.pointsToday}
            pointsWeek={pointsState.pointsWeek}
            cumulativePoints={pointsState.cumulativePoints}
            claimedRewards={claimedRewards}
            onToggleClaimReward={handleToggleClaimReward}
            onBackToHome={() => setCurrentView('heute')}
          />
        )}

        {/* VIEW 6: BONUS GAMES HUB */}
        {currentView === 'games' && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-2">🎮 Bonus-Spiele</h2>
              <p className="text-slate-600 text-sm font-medium mb-6">
                Belohne dich nach deinen Lernwörtern mit lustigen interaktiven Spielen!
              </p>
              <VoiceGamesHub
                language="de"
                playmate={PLAYMATES[1]} // Ben
                voiceEngineRef={{ current: null }}
                onBack={() => setCurrentView('heute')}
                onRewardStars={(count, reason) => handleRewardStars(count, reason)}
              />
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-bold print:hidden">
        JD LernPlayground • Spielerisches Lernen mit Mia, Ben, Leo und Sophie ⭐
      </footer>

      {/* MODAL 1: PARENT BACKEND (PIN 1234) */}
      {showParentBackend && (() => {
        const daysProgress = calculateAllDaysProgress({
          words: curriculum.words,
          completedRecords,
          pausedSession,
          skippedExercises,
        });

        const weeklyOverview = calculateWeeklyOverview({
          daysProgress,
          pointsWeek: pointsState.pointsWeek,
          skippedExercises,
          pausedSession,
        });

        return (
          <ParentLernwoerterBackend
            curriculum={curriculum}
            onSaveCurriculum={handleSaveCurriculum}
            mistakes={mistakes}
            onClearResolvedMistakes={handleClearResolvedMistakes}
            onClose={() => setShowParentBackend(false)}
            pointsWeek={pointsState.pointsWeek}
            cumulativePoints={pointsState.cumulativePoints}
            claimedRewards={claimedRewards}
            onToggleClaimReward={handleToggleClaimReward}
            skippedCount={skippedExercises.length}
            weakWords={activeWeakWords}
            strongWords={['Zimmer', 'Messer', 'Kuss', 'Schloss', 'passen', 'dünn']}
            miniExamHistory={miniExamHistory}
            daysProgress={daysProgress}
            weeklyOverview={weeklyOverview}
          />
        );
      })()}

      {/* MODAL 2: PRINTABLE WORKSHEET MODAL */}
      {showPrintModal && (
        <PrintWorksheetModal
          day={printModalDay}
          words={curriculum.words}
          scenes={curriculum.scenes}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* MODAL 3: 4-WEEK CYCLE MINI EXAM MODAL */}
      {showMiniExam && (
        <MiniExamModal
          words={curriculum.words}
          onClose={() => setShowMiniExam(false)}
          onFinishExam={handleFinishExam}
        />
      )}
    </div>
  );
}
