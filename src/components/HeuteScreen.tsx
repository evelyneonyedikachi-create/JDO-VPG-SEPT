import React from 'react';
import { DayOfWeek, LernwortItem, PausedSessionState } from '../types/lernwoerter';
import { PLAYMATES } from '../data/characters';
import {
  Sparkles,
  Star,
  Flame,
  ArrowRight,
  BookOpen,
  Layers,
  Printer,
  Trophy,
  Play,
  Clock,
  SkipForward,
  Award,
  Gift,
  Target,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { playChime } from '../utils/soundEffects';
import { getNextRewardMilestone, formatPoints } from '../data/rewardLadder';
import { WeeklyProgressPanel } from './WeeklyProgressPanel';
import { DayProgressSummary, NextRecommendedTask, WeeklyOverviewStats } from '../types/progress';
import { MathProgressState } from '../types/math';
import { DayMathSummary } from '../services/mathProgressService';

interface HeuteScreenProps {
  currentDay: DayOfWeek;
  words: LernwortItem[];
  starsCount: number;
  streakDays: number;
  pointsToday: number;
  pointsWeek: number;
  cumulativePoints?: number;
  pausedSession?: PausedSessionState | null;
  onResumePaused?: () => void;
  skippedCount?: number;
  weakWords?: string[];
  daysProgress?: Record<DayOfWeek, DayProgressSummary>;
  weeklyOverview?: WeeklyOverviewStats;
  nextTask?: NextRecommendedTask;
  mathSummary?: DayMathSummary;
  mathProgress?: MathProgressState;
  onSelectDay: (day: DayOfWeek) => void;
  onStartToday: () => void;
  onStartMathToday?: () => void;
  onGoToWords: () => void;
  onGoToBildgeschichte: () => void;
  onOpenWorksheet: () => void;
  onOpenRewards: () => void;
  onOpenMiniExam: () => void;
  onOpenTaskDirectly?: (day: DayOfWeek, taskId: string) => void;
}

export const HeuteScreen: React.FC<HeuteScreenProps> = ({
  currentDay,
  words,
  starsCount,
  streakDays,
  pointsToday,
  pointsWeek,
  cumulativePoints = 0,
  pausedSession,
  onResumePaused,
  skippedCount = 0,
  weakWords = [],
  daysProgress,
  weeklyOverview,
  nextTask,
  mathSummary,
  mathProgress,
  onSelectDay,
  onStartToday,
  onStartMathToday,
  onGoToWords,
  onGoToBildgeschichte,
  onOpenWorksheet,
  onOpenRewards,
  onOpenMiniExam,
  onOpenTaskDirectly,
}) => {
  const dayAvatarId =
    currentDay === 'monday'
      ? 'mia'
      : currentDay === 'tuesday'
      ? 'ben'
      : currentDay === 'wednesday'
      ? 'leo'
      : 'sophie';

  const companion = PLAYMATES.find((p) => p.id === dayAvatarId) || PLAYMATES[0];

  const dayDetails: Record<
    DayOfWeek,
    { title: string; subtitle: string; icon: string; role: string; desc: string }
  > = {
    monday: {
      title: 'Montag – Wörter entdecken',
      subtitle: 'Rechtschreibung & Wortarten',
      icon: '🔍',
      role: 'Wörter-Detektiv',
      desc: 'Bilder zuordnen, Doppelkonsonanten aufspüren und Wortarten (Nomen, Verb, Adjektiv) bestimmen.',
    },
    tuesday: {
      title: 'Dienstag – Wortformen & Grammatik',
      subtitle: 'Verben konjugieren & Nomen',
      icon: '⚽',
      role: 'Grammatik-Coach',
      desc: 'Passe die Verben an (ich schwimme, du rennst) und finde Einzahl & Mehrzahl der Nomen heraus.',
    },
    wednesday: {
      title: 'Mittwoch – Sätze bauen',
      subtitle: 'Wort-Blöcke ordnen & Bindewörter',
      icon: '🏗️',
      role: 'Satz-Baumeister',
      desc: 'Klicke auf die Wort-Blöcke und baue fehlerfreie deutsche Sätze mit Satzzeichen!',
    },
    thursday: {
      title: 'Donnerstag – Satz-Profi',
      subtitle: 'Eigene Sätze & Satz-Verbinder',
      icon: '✍️',
      role: 'Geschichten-Profi',
      desc: 'Schreibe eigene Sätze zu den Lernwörtern und verbinde zwei Gedanken mit und, aber oder weil.',
    },
    friday: {
      title: 'Freitag – Bildgeschichte 1',
      subtitle: 'Eine spannende Woche (9 Szenen)',
      icon: '📖',
      role: 'Geschichten-Profi',
      desc: 'Schau dir die 9 Bilder an, schreibe zu jedem Bild 1-2 Sätze und nutze die Satzanfänge!',
    },
    saturday: {
      title: 'Samstag – Bildgeschichte 2',
      subtitle: 'Große Wochen-Challenge',
      icon: '🏆',
      role: 'Geschichten-Profi',
      desc: 'Verfasse deine eigene vollständige Geschichte mit mindestens 6 Sätzen und 6 Lernwörtern.',
    },
  };

  const todayInfo = dayDetails[currentDay] || dayDetails.monday;

  // Next reward ladder milestone
  const { nextMilestone, pointsToNext, progressPercent } = getNextRewardMilestone(cumulativePoints);

  const isTodayComplete = daysProgress ? daysProgress[currentDay]?.isCompleted : false;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* DUAL SUBJECT TRACKER: DEUTSCH & MATHE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Deutsch Card */}
        <button
          type="button"
          onClick={() => {
            playChime('click');
            onStartToday();
          }}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-indigo-100 hover:border-indigo-300 shadow-sm flex items-center justify-between transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl shrink-0">
              📚
            </div>
            <div>
              <div className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Lernwörter & Grammatik
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                Deutsch: {daysProgress ? daysProgress[currentDay]?.completedRequired : 0}/5 geschafft
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Öffnen →
          </span>
        </button>

        {/* Mathe Card */}
        <button
          type="button"
          onClick={() => {
            playChime('click');
            if (onStartMathToday) onStartMathToday();
          }}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-purple-100 hover:border-purple-300 shadow-sm flex items-center justify-between transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0">
              ➕
            </div>
            <div>
              <div className="text-xs font-black uppercase text-purple-600 tracking-wider">
                Zahlenraum bis 1000
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                Mathe: {mathSummary ? mathSummary.completedRequired : 0}/{mathSummary ? mathSummary.totalRequired : 3} geschafft
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Öffnen →
          </span>
        </button>
      </div>

      {/* SECTION 7, 5, 4, 3: PROMINENT "ALS NÄCHSTES" & WEEKLY PROGRESS PANEL */}
      {daysProgress && weeklyOverview && nextTask && (
        <WeeklyProgressPanel
          currentDay={currentDay}
          onSelectDay={onSelectDay}
          daysProgress={daysProgress}
          weeklyOverview={weeklyOverview}
          nextTask={nextTask}
          onStartNextTask={() => {
            if (nextTask.day !== currentDay) {
              onSelectDay(nextTask.day);
            }
            onStartToday();
          }}
          onOpenSkipped={() => {
            onStartToday();
          }}
          onOpenTaskDirectly={onOpenTaskDirectly}
        />
      )}

      {/* PAUSED SESSION NOTIFICATION / RESUME BANNER */}
      {pausedSession && onResumePaused && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
              ⏸️
            </div>
            <div>
              <div className="text-xs font-black uppercase text-amber-100 tracking-wider">
                Gespeicherte Einheit
              </div>
              <h4 className="text-xl font-black">
                Du hast eine pausierte Einheit für {pausedSession.day.toUpperCase()}!
              </h4>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Aufgabe {pausedSession.exerciseIndex + 1} wartet auf dich. Du kannst genau dort weitermachen.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playChime('click');
              onResumePaused();
            }}
            className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-black text-sm shadow-md active:scale-95 flex items-center gap-2 shrink-0 transition-transform"
          >
            <Play className="w-4 h-4 fill-slate-900" />
            <span>Jetzt fortsetzen 🚀</span>
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className={`rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden transition-all ${
        isTodayComplete
          ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900'
          : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800'
      }`}>
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider border border-white/20">
              {isTodayComplete ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{todayInfo.title} • ✅ Geschafft!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Hallo Jedidiah! Deine heutige Mission:</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {todayInfo.title}
            </h1>

            <p className="text-indigo-100 text-base sm:text-lg font-medium max-w-xl">
              {todayInfo.desc}
            </p>

            {/* Quick stats tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-sm font-black shadow-md">
                <Trophy className="w-5 h-5 text-slate-950" />
                <span>{pointsToday} Pkt heute</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/25 text-sm font-black">
                <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span>{pointsWeek} / 100 Pkt diese Woche</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-black">
                <Flame className="w-5 h-5 text-orange-300 fill-orange-300" />
                <span>{streakDays || 1} Tage Serie 🔥</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-black">
                <BookOpen className="w-5 h-5 text-sky-300" />
                <span>{words.length} Lernwörter</span>
              </div>
            </div>

            {/* BIG INVITING START BUTTON */}
            <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <button
                onClick={() => {
                  playChime('click');
                  onStartToday();
                }}
                className={`px-8 py-4 rounded-2xl font-black text-lg sm:text-xl shadow-xl active:scale-95 flex items-center gap-3 transition-transform ${
                  isTodayComplete
                    ? 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-emerald-950/20'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25'
                }`}
              >
                <span>{isTodayComplete ? '🔁 Freiwillig üben' : '🚀 Jetzt starten'}</span>
                <ArrowRight className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  playChime('click');
                  onOpenWorksheet();
                }}
                className="px-5 py-4 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-sm sm:text-base border border-white/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Printer className="w-5 h-5 text-indigo-200" />
                <span>🖨️ Arbeitsblatt drucken</span>
              </button>
            </div>
          </div>

          {/* Avatar Hero Companion Card */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-4 border-white/80 shadow-2xl bg-indigo-100">
              {companion.avatarImageUrl ? (
                <img
                  src={companion.avatarImageUrl}
                  alt={companion.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-indigo-700">
                  {companion.name[0]}
                </div>
              )}

              <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-center shadow-md">
                <div className="text-xs font-black text-slate-900">{companion.name}</div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase">{todayInfo.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: ➕ MATHE HEUTE (Requirement 2 & 20) */}
      {mathSummary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                ➕
              </div>
              <div>
                <span className="text-xs font-black uppercase text-purple-600 tracking-wider">
                  Tägliches Mathe-Training • 3. / 4. Klasse
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  ➕ Mathe heute ({mathSummary.completedRequired} von {mathSummary.totalRequired} geschafft)
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Dauer: ca. 10–15 Minuten • 3 Pflichtaufgaben täglich (Sa: Wochen-Challenge)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playChime('click');
                if (onStartMathToday) onStartMathToday();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 self-start sm:self-center"
            >
              <span>Mathe-Training starten</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today's 3 tasks list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {mathSummary.tasks.map((task, idx) => {
              const isDone = mathSummary.completedTaskIds.includes(task.id);
              return (
                <div
                  key={task.id}
                  onClick={() => {
                    playChime('click');
                    if (onStartMathToday) onStartMathToday();
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400'
                      : 'bg-purple-50/30 hover:bg-purple-50 border-purple-200 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-white border border-purple-200 text-purple-900 font-black text-xs flex items-center justify-center shadow-2xs">
                      {idx + 1}
                    </span>
                    {isDone ? (
                      <span className="text-xs font-black text-emerald-700 flex items-center gap-1 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Geschafft
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-purple-600 bg-white px-2.5 py-0.5 rounded-full border border-purple-200">
                        Offen
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-black text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                      {task.title}
                    </h5>
                    <p className="text-xs font-semibold text-slate-500 line-clamp-2 mt-0.5">
                      {task.subtitle}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-purple-700 font-bold bg-white/70 px-2 py-1 rounded-lg border border-purple-100 self-start">
                    {task.skillName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skills checklist & "Das üben wir noch" */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500">Heutige Kompetenzen:</span>
              {mathSummary.tasks.map((t) => {
                const done = mathSummary.completedTaskIds.includes(t.id);
                return (
                  <span
                    key={t.id}
                    className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs ${
                      done
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{done ? '✅' : '🟡'}</span>
                    <span>{t.skillName}</span>
                  </span>
                );
              })}
            </div>

            {mathProgress && mathProgress.strugglingSkills.length > 0 && (
              <div className="flex items-center gap-1.5 text-amber-900 font-bold bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                <span>💡 Das üben wir noch:</span>
                <span className="font-mono">{mathProgress.strugglingSkills.slice(0, 2).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOTIVATION: REWARD LADDER & 4-WEEK MINI-EXAM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REWARD LADDER PREVIEW CARD */}
        <div
          onClick={() => {
            playChime('click');
            onOpenRewards();
          }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {nextMilestone.emoji.slice(0, 2)}
              </div>
              <div>
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
                  Belohnungs-Leiter ({nextMilestone.title})
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {nextMilestone.reward}
                </h3>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>

          <div className="space-y-1.5 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100">
            <div className="flex justify-between text-xs font-black text-slate-700">
              <span>Fortschritt zu {formatPoints(nextMilestone.points)} Punkten</span>
              <span>{formatPoints(cumulativePoints)} / {formatPoints(nextMilestone.points)} Pkt ({progressPercent}%)</span>
            </div>
            <div className="h-3 bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-amber-900 font-bold pt-0.5">
              {pointsToNext === 0
                ? `🎉 ${nextMilestone.title} geschafft! Zeit für: ${nextMilestone.reward}!`
                : `Noch ${formatPoints(pointsToNext)} Punkte bis ${nextMilestone.reward}`}
            </p>
          </div>
        </div>

        {/* 4-WEEK CYCLE MINI-EXAM CARD */}
        <div
          onClick={() => {
            playChime('click');
            onOpenMiniExam();
          }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🏅
              </div>
              <div>
                <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                  4-Wochen-Zyklus
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Lernwörter Mini-Prüfung
                </h3>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>

          <p className="text-sm text-slate-600 font-medium">
            20 gemischte Satzfragen zu allen Lernwörtern der Wochen 1–4. Überprüfe Rechtschreibung, Grammatik und Satzbau!
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>20 Fragen • Bereit zum Start</span>
            </span>
            <span className="text-xs font-bold text-indigo-600 group-hover:underline">
              Prüfung starten ➡️
            </span>
          </div>
        </div>
      </div>

      {/* Week Overview Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Meine Lernwörter */}
        <div
          onClick={() => {
            playChime('click');
            onGoToWords();
          }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-4xl sm:text-5xl group-hover:scale-110 transition-transform shrink-0 shadow-xs">
              📚
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl sm:text-2xl">
                Meine Lernwörter
              </h3>
              <p className="text-base text-slate-600 font-medium mt-1">
                Lernwörter 1 & 2 erkunden, Sätze laut lesen und Karteikarten üben.
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1.5 transition-all shrink-0 ml-3" />
        </div>

        {/* Card 2: Bildgeschichte */}
        <div
          onClick={() => {
            playChime('click');
            onGoToBildgeschichte();
          }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center text-4xl sm:text-5xl group-hover:scale-110 transition-transform shrink-0 shadow-xs">
              📖
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl sm:text-2xl">
                Bild-Geschichte
              </h3>
              <p className="text-base text-slate-600 font-medium mt-1">
                Eine spannende Woche: 9 Bilder mit allen Lernwörtern erzählen!
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1.5 transition-all shrink-0 ml-3" />
        </div>
      </div>
    </div>
  );
};
