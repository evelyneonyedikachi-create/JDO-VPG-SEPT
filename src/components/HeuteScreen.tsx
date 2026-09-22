import React from 'react';
import { DayOfWeek, LernwortItem } from '../types/lernwoerter';
import { PLAYMATES } from '../data/characters';
import { Sparkles, Star, Flame, ArrowRight, BookOpen, Layers, Printer, Trophy } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface HeuteScreenProps {
  currentDay: DayOfWeek;
  words: LernwortItem[];
  starsCount: number;
  streakDays: number;
  pointsToday: number;
  pointsWeek: number;
  onStartToday: () => void;
  onGoToWords: () => void;
  onGoToBildgeschichte: () => void;
  onOpenWorksheet: () => void;
}

export const HeuteScreen: React.FC<HeuteScreenProps> = ({
  currentDay,
  words,
  starsCount,
  streakDays,
  pointsToday,
  pointsWeek,
  onStartToday,
  onGoToWords,
  onGoToBildgeschichte,
  onOpenWorksheet,
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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Hallo Jedidiah! Deine heutige Mission:</span>
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
                <span>{pointsWeek} Pkt diese Woche</span>
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
                className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-lg sm:text-xl shadow-xl shadow-amber-400/25 active:scale-95 flex items-center gap-3 transition-transform"
              >
                <span>🚀 Jetzt starten</span>
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
