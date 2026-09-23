import React from 'react';
import { Star, Trophy, Flame, Sparkles, CheckCircle2, Award, ArrowLeft, Gift, Lock } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface SterneRewardsScreenProps {
  starsCount: number;
  streakDays: number;
  pointsToday: number;
  pointsWeek: number;
  cumulativePoints?: number;
  onBackToHome: () => void;
}

export const SterneRewardsScreen: React.FC<SterneRewardsScreenProps> = ({
  starsCount,
  streakDays,
  pointsToday,
  pointsWeek,
  cumulativePoints = 0,
  onBackToHome,
}) => {
  // Reward Ladder milestones
  const rewardLadder = [
    {
      points: 1000,
      title: 'Stufe 1: Pizza + Fanta Fest 🍕🥤',
      description: 'Große Wunsch-Pizza + gekühlte Fanta / „Fantastica“ mit der Familie!',
      emoji: '🍕',
      color: 'from-amber-500 to-red-500',
    },
    {
      points: 2000,
      title: 'Stufe 2: Kino & Popcorn Nachmittag 🎬🍿',
      description: 'Wunschfilm im Kino mit großem Popcorn oder ein toller Spiele-Nachmittag!',
      emoji: '🍿',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      points: 3000,
      title: 'Stufe 3: Großer Familien-Ausflug 🎡',
      description: 'Ein ganzer Tag im Freizeitpark, Erlebnisbad oder Tierpark nach deiner Wahl!',
      emoji: '🎡',
      color: 'from-purple-500 to-pink-600',
    },
    {
      points: 4000,
      title: 'Stufe 4: Meister-Pokal & Super-Belohnung 👑',
      description: 'Echter Pokal als Lernwörter-Champion der 4. Klasse + Familien-Überraschung!',
      emoji: '🏆',
      color: 'from-yellow-400 to-amber-600',
    },
  ];

  // Badges
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

  // Find next milestone
  const nextMilestone = rewardLadder.find((r) => cumulativePoints < r.points) || rewardLadder[rewardLadder.length - 1];
  const pointsToNext = Math.max(0, nextMilestone.points - cumulativePoints);
  const progressPercent = Math.min(100, Math.round((cumulativePoints / nextMilestone.points) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Erfolge & Belohnungs-Leiter</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            Jedidiah’s Belohnungs-Leiter ⭐
          </h2>
          <p className="text-amber-100 text-sm sm:text-base font-medium max-w-lg">
            Sammle fleißig Punkte! Wochenpunkte sind auf 100 begrenzt, aber deine Gesamtpunkte wachsen immer weiter für die großen Belohnungen.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-200">{pointsWeek} / 100</div>
            <div className="text-xs font-bold uppercase text-white/80">Woche (max 100)</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-100">{cumulativePoints}</div>
            <div className="text-xs font-bold uppercase text-white/80">Gesamt-Punkte</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-orange-200">{streakDays || 1} 🔥</div>
            <div className="text-xs font-bold uppercase text-white/80">Tage Serie</div>
          </div>
        </div>
      </div>

      {/* LONG-TERM REWARD LADDER SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-indigo-600" />
              <h3 className="text-2xl font-black text-slate-900">
                Die Große Belohnungs-Leiter
              </h3>
            </div>
            <p className="text-slate-500 font-semibold text-sm">
              Familien-vereinbarte Meilensteine durch fleißiges Üben über die Wochen
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-2xl text-right">
            <div className="text-xs font-black text-indigo-900 uppercase">Nächstes Ziel</div>
            <div className="text-base font-black text-indigo-700">
              Noch {pointsToNext} Punkte bis {nextMilestone.emoji}
            </div>
          </div>
        </div>

        {/* PROGRESS TOWARDS NEXT MILESTONE */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center text-sm font-black text-slate-700">
            <span>Fortschritt zu {nextMilestone.title}</span>
            <span>{cumulativePoints} / {nextMilestone.points} Punkte ({progressPercent}%)</span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* LADDER STEPS */}
        <div className="space-y-4">
          {rewardLadder.map((step, sIdx) => {
            const isUnlocked = cumulativePoints >= step.points;
            return (
              <div
                key={sIdx}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-amber-50/70 border-amber-300 shadow-md'
                    : 'bg-white border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm text-white shrink-0 bg-gradient-to-tr ${step.color}`}
                  >
                    {step.emoji}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {step.points} Punkte
                      </span>
                      <h4 className="font-black text-slate-900 text-lg">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right sm:pl-4">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-black border border-emerald-300 shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Freigeschaltet! 🎉</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-500 text-sm font-bold border border-slate-200">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Noch {step.points - cumulativePoints} Pkt</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BADGES & TROPHIES GRID */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-slate-900">
          Abzeichen & Meister-Trophäen
        </h3>
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
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => {
            playChime('click');
            onBackToHome();
          }}
          className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-md active:scale-95 inline-flex items-center gap-2 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Zurück zur Übersicht</span>
        </button>
      </div>
    </div>
  );
};
