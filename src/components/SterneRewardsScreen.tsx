import React from 'react';
import { Star, Trophy, Flame, Sparkles, CheckCircle2, Award, ArrowLeft } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface SterneRewardsScreenProps {
  starsCount: number;
  streakDays: number;
  pointsToday: number;
  pointsWeek: number;
  onBackToHome: () => void;
}

export const SterneRewardsScreen: React.FC<SterneRewardsScreenProps> = ({
  starsCount,
  streakDays,
  pointsToday,
  pointsWeek,
  onBackToHome,
}) => {
  const badges = [
    {
      id: 'woerter_detektiv',
      name: 'Wörter-Detektiv 🕵️‍♀️',
      desc: 'Alle Rechtschreib- und Wortarten-Rätsel gemeistert',
      unlocked: starsCount >= 5,
      starsReq: 5,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'grammatik_coach',
      name: 'Grammatik-Coach ⚽',
      desc: 'Verben konjugiert und Nomen-Begleiter richtig zugeordnet',
      unlocked: starsCount >= 10,
      starsReq: 10,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'satz_baumeister',
      name: 'Satz-Baumeister 🏗️',
      desc: 'Wort-Blöcke zu vollständigen Sätzen mit Satzzeichen gebaut',
      unlocked: starsCount >= 18,
      starsReq: 18,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'satz_profi',
      name: 'Satz-Profi ✍️',
      desc: 'Eigene lange Sätze geschrieben und Bindewörter verwendet',
      unlocked: starsCount >= 25,
      starsReq: 25,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'bildgeschichte_meister',
      name: 'Geschichten-Meister 📖',
      desc: '9 Bilder der Bildgeschichte spannend erzählt',
      unlocked: starsCount >= 35,
      starsReq: 35,
      color: 'from-rose-500 to-red-600',
    },
    {
      id: 'wochen_champion',
      name: 'Großer Wochen-Champion 🏆',
      desc: 'Alle 6 Wochentage & Bildgeschichte 2 erfolgreich beendet',
      unlocked: starsCount >= 50,
      starsReq: 50,
      color: 'from-yellow-400 to-amber-600',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Erfolge & Trophäen</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            Jedidiah’s Sternen-Schatz ⭐
          </h2>
          <p className="text-amber-100 text-sm sm:text-base font-medium">
            Jede gemeisterte Aufgabe bringt dich näher an die nächste große Trophäe!
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-200">{pointsToday}</div>
            <div className="text-xs font-bold uppercase text-white/80">Pkt Heute</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-100">{pointsWeek}</div>
            <div className="text-xs font-bold uppercase text-white/80">Pkt Woche</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-orange-200">{streakDays || 1} 🔥</div>
            <div className="text-xs font-bold uppercase text-white/80">Tage Serie</div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${
              b.unlocked
                ? 'bg-white border-amber-300 shadow-md'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm text-white bg-gradient-to-tr ${b.color}`}
              >
                {b.unlocked ? <Trophy className="w-7 h-7 text-amber-200" /> : <Award className="w-7 h-7 text-white/70" />}
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-base">
                  {b.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {b.desc}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {b.unlocked ? (
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Freigeschaltet</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  {starsCount} / {b.starsReq} ⭐
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => {
            playChime('click');
            onBackToHome();
          }}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md active:scale-95 inline-flex items-center gap-2 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </button>
      </div>
    </div>
  );
};
