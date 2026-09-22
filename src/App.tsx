import React, { useState, useEffect } from 'react';
import { DayOfWeek, DifficultyLevel, LernwortItem, PracticeMistake, WeeklyCurriculum } from './types/lernwoerter';
import { INITIAL_CURRICULUM } from './data/defaultWeeklyCurriculum';
import { HeuteScreen } from './components/HeuteScreen';
import { LernwoerterWordExplorer } from './components/LernwoerterWordExplorer';
import { DailyPracticeWorkspace } from './components/DailyPracticeWorkspace';
import { BildgeschichteWorkshop } from './components/BildgeschichteWorkshop';
import { SterneRewardsScreen } from './components/SterneRewardsScreen';
import { ParentLernwoerterBackend } from './components/ParentLernwoerterBackend';
import { PrintWorksheetModal } from './components/PrintWorksheetModal';
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
} from 'lucide-react';

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

  // Points tracking (per day and per week)
  const todayKey = new Date().toISOString().slice(0, 10);
  const [pointsState, setPointsState] = useState<{
    pointsToday: number;
    pointsWeek: number;
    lastDate: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('jd_points_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastDate !== todayKey) {
          // If new day, reset today's points, keep week points
          return {
            pointsToday: 0,
            pointsWeek: parsed.pointsWeek || 0,
            lastDate: todayKey,
          };
        }
        return parsed;
      }
      return { pointsToday: 40, pointsWeek: 160, lastDate: todayKey };
    } catch {
      return { pointsToday: 40, pointsWeek: 160, lastDate: todayKey };
    }
  });

  const handleAwardPoints = (points: number, _reason: string) => {
    setPointsState((prev) => {
      const updated = {
        pointsToday: prev.pointsToday + points,
        pointsWeek: prev.pointsWeek + points,
        lastDate: todayKey,
      };
      try {
        localStorage.setItem('jd_points_state', JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
          <div
            onClick={() => {
              playChime('click');
              setCurrentView('heute');
            }}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-200 fill-amber-300" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>JD LernPlayground</span>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hidden sm:inline">
                  Deutsch 4. Klasse
                </span>
              </h1>
            </div>
          </div>

          {/* Child Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => {
                playChime('click');
                setCurrentView('heute');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'heute'
                  ? 'bg-indigo-600 text-white shadow-xs'
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
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'woerter'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              📚 Meine Lernwörter
            </button>

            <button
              onClick={() => {
                playChime('click');
                setCurrentView('ueben');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'ueben'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              ✏️ Üben (Mo–Sa)
            </button>

            <button
              onClick={() => {
                playChime('click');
                setCurrentView('bildgeschichte');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'bildgeschichte'
                  ? 'bg-indigo-600 text-white shadow-xs'
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
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === 'sterne'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              ⭐ Meine Sterne
            </button>
          </nav>

          {/* Right Controls: Points, Stars, Print, Games & Parent Dashboard (PIN 1234) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Points Badge (Per Day and Per Week) */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-2xs text-xs font-black text-amber-950"
              title="Punkte: Heute & Diese Woche"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>{pointsState.pointsToday} Pkt heute</span>
              <span className="text-amber-300 font-normal">|</span>
              <span className="text-indigo-900 font-bold">{pointsState.pointsWeek} Wo</span>
            </div>

            {/* Print Worksheet Shortcut */}
            <button
              onClick={() => openPrintForDay(activeDay)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
              title="Arbeitsblatt drucken"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Drucken</span>
            </button>

            {/* Stars Counter Button */}
            <button
              onClick={() => {
                playChime('click');
                setCurrentView('sterne');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-xs font-black text-amber-900 border border-amber-200 shadow-2xs transition-all"
              title="Meine Sterne & Belohnungen"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{starsCount} ⭐</span>
            </button>

            {/* Games Hub */}
            <button
              onClick={() => {
                playChime('click');
                setCurrentView('games');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currentView === 'games'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
              }`}
              title="Bonus-Spiele"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />
              <span className="hidden sm:inline font-black">Spiele</span>
            </button>

            {/* Parent Area (Discreet in top corner) */}
            <button
              id="btn-parent-dashboard"
              onClick={() => {
                playChime('click');
                setShowParentBackend(true);
              }}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-2xs transition-all"
              title="Eltern-Bereich (PIN 1234)"
            >
              <Settings className="w-4 h-4" />
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
        {currentView === 'heute' && (
          <HeuteScreen
            currentDay={activeDay}
            words={curriculum.words}
            starsCount={starsCount}
            streakDays={streakDays}
            pointsToday={pointsState.pointsToday}
            pointsWeek={pointsState.pointsWeek}
            onStartToday={() => setCurrentView('ueben')}
            onGoToWords={() => setCurrentView('woerter')}
            onGoToBildgeschichte={() => setCurrentView('bildgeschichte')}
            onOpenWorksheet={() => openPrintForDay(activeDay)}
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
            onRewardStars={handleRewardStars}
            onAwardPoints={handleAwardPoints}
            onRecordMistake={handleRecordMistake}
            onOpenWorksheet={openPrintForDay}
            onGoToBildgeschichte={() => setCurrentView('bildgeschichte')}
          />
        )}

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
      {showParentBackend && (
        <ParentLernwoerterBackend
          curriculum={curriculum}
          onSaveCurriculum={handleSaveCurriculum}
          mistakes={mistakes}
          onClearResolvedMistakes={handleClearResolvedMistakes}
          onClose={() => setShowParentBackend(false)}
        />
      )}

      {/* MODAL 2: PRINTABLE WORKSHEET MODAL */}
      {showPrintModal && (
        <PrintWorksheetModal
          day={printModalDay}
          words={curriculum.words}
          scenes={curriculum.scenes}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
