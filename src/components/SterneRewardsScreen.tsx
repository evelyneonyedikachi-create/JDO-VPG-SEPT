import React, { useState } from 'react';
import {
  Star,
  Trophy,
  Flame,
  Sparkles,
  CheckCircle2,
  Award,
  ArrowLeft,
  Gift,
  Lock,
  Gamepad2,
  ShieldCheck,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import { playChime } from '../utils/soundEffects';
import { REWARD_LADDER, getNextRewardMilestone, formatPoints, RewardMilestone } from '../data/rewardLadder';

interface SterneRewardsScreenProps {
  starsCount: number;
  streakDays: number;
  pointsToday: number;
  pointsWeek: number;
  cumulativePoints?: number;
  claimedRewards?: number[];
  onToggleClaimReward?: (level: number) => void;
  onBackToHome: () => void;
}

export const SterneRewardsScreen: React.FC<SterneRewardsScreenProps> = ({
  starsCount,
  streakDays,
  pointsToday,
  pointsWeek,
  cumulativePoints = 0,
  claimedRewards = [],
  onToggleClaimReward,
  onBackToHome,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'next' | 'unlocked'>('all');

  // Next milestone progress calculation (towards next milestone, not 20,000)
  const { nextMilestone, pointsToNext, progressPercent } = getNextRewardMilestone(cumulativePoints);

  // Stufe 20 major milestone
  const majorMilestone = REWARD_LADDER[REWARD_LADDER.length - 1];
  const isMajorUnlocked = cumulativePoints >= majorMilestone.points;
  const pointsToMajor = Math.max(0, majorMilestone.points - cumulativePoints);

  // Badges for specific skills & habits
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
            Sammle jede Woche bis zu 100 Punkte! Deine Punkte verfallen nie und wachsen dauerhaft als Gesamtpunkte. Belohnungen schalten sich automatisch frei – ohne Punkteabzug!
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-200">{pointsWeek} / 100</div>
            <div className="text-xs font-bold uppercase text-white/80">Woche (max 100)</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-100">{formatPoints(cumulativePoints)}</div>
            <div className="text-xs font-bold uppercase text-white/80">Gesamt-Punkte</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-orange-200">{streakDays || 1} 🔥</div>
            <div className="text-xs font-bold uppercase text-white/80">Tage Serie</div>
          </div>
        </div>
      </div>

      {/* PROMINENT REWARD SCREEN: CURRENT POINTS & NEXT REWARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-300 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-amber-600" />
              <h3 className="text-2xl font-black text-slate-900">
                Aktueller Belohnungs-Stand
              </h3>
            </div>
            <p className="text-slate-500 font-semibold text-xs sm:text-sm">
              Familien-vereinbarte Belohnungen • Punkte werden beim Einlösen <u>nicht</u> abgezogen
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Familienabsprache (Eltern bestätigen Einlösung)</span>
          </div>
        </div>

        {/* PROMINENT METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. CURRENT POINTS TOWARDS NEXT MILESTONE */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/80 p-5 sm:p-6 rounded-3xl border border-indigo-200 space-y-2">
            <div className="text-xs font-black uppercase text-indigo-700 tracking-wider">
              Aktuelle Punkte
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {formatPoints(cumulativePoints)} / {formatPoints(nextMilestone.points)} Punkte
            </div>
            <div className="text-xs font-medium text-slate-500">
              Fortschritt zum nächsten Meilenstein ({nextMilestone.title})
            </div>
          </div>

          {/* 2. NEXT REWARD CALLOUT */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 p-5 sm:p-6 rounded-3xl border border-amber-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                <span>Nächste Belohnung</span>
                <span className="text-base">{nextMilestone.emoji}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                {nextMilestone.reward}
              </div>
            </div>
            <div className="pt-2 text-sm sm:text-base font-black text-amber-900 flex items-center gap-2">
              {cumulativePoints >= nextMilestone.points ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Bereit zum Einlösen! 🎉</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>{nextMilestone.emoji.slice(0, 2)}</span>
                  <span>Noch {formatPoints(pointsToNext)} Punkte bis {nextMilestone.reward}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR: TOWARDS THE NEXT MILESTONE (NOT 20,000) */}
        <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center text-xs sm:text-sm font-black text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>{nextMilestone.emoji}</span>
              <span>Fortschritt zu {nextMilestone.title} ({nextMilestone.reward})</span>
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-5 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-700 shadow-inner"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 px-1">
            <span>Start</span>
            <span>Ziel: {formatPoints(nextMilestone.points)} Punkte</span>
          </div>
        </div>
      </div>

      {/* MAJOR REWARD: SPECIAL VISUAL SHOWCASE (STUFE 20) */}
      <div className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden transition-all shadow-xl border-2 ${
        isMajorUnlocked
          ? 'bg-gradient-to-br from-violet-900 via-purple-900 to-amber-950 border-amber-400 text-white'
          : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 border-indigo-400/40 text-white'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase shadow-md tracking-wider">
              <Gamepad2 className="w-4 h-4" />
              <span>👑 Das Große Hauptziel • Stufe 20</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              🎮 20.000 Punkte — Nintendo Game Reward
            </h3>

            <div className="text-xl sm:text-2xl font-black text-amber-300">
              Smith Toys Gift Card
            </div>

            <p className="text-indigo-200 text-xs sm:text-sm font-medium max-w-xl">
              Das große Finale der Belohnungs-Leiter! Nach fleißigen Wochen voller Lernwörter wartet der Smith Toys Gutschein für ein neues Nintendo-Spiel nach deiner Wahl.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <div className={`p-6 rounded-3xl border-2 backdrop-blur-md text-center space-y-2 min-w-[220px] ${
              isMajorUnlocked
                ? 'bg-amber-400/20 border-amber-400 shadow-xl shadow-amber-400/20'
                : 'bg-white/10 border-white/20'
            }`}>
              <div className="text-4xl sm:text-5xl">🎮🏆</div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-200">
                {isMajorUnlocked ? 'Geschafft!' : 'Großes Ziel'}
              </div>
              <div className="text-lg font-black">
                {isMajorUnlocked ? (
                  <span className="text-emerald-300 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Freigeschaltet!</span>
                  </span>
                ) : (
                  <span className="text-amber-100 flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>Noch {formatPoints(pointsToMajor)} Pkt</span>
                  </span>
                )}
              </div>

              {isMajorUnlocked && onToggleClaimReward && (
                <button
                  onClick={() => {
                    playChime('success');
                    onToggleClaimReward(20);
                  }}
                  className={`mt-2 w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    claimedRewards.includes(20)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  {claimedRewards.includes(20) ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Belohnung erhalten ✓</span>
                    </>
                  ) : (
                    <span>Als erhalten markieren</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT REWARD LADDER TABLE / LIST */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Vollständige Belohnungs-Leiter (Stufe 1 bis 20)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Alle 1.000 Punkte ein Meilenstein • Alle 4.000 Punkte Kino & Popcorn • Bei 20.000 Smith Toys Gutschein
            </p>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterMode === 'all' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alle 20 Stufen
            </button>
            <button
              onClick={() => setFilterMode('next')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterMode === 'next' ? 'bg-white shadow-xs text-indigo-700 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nächste Ziele
            </button>
            <button
              onClick={() => setFilterMode('unlocked')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterMode === 'unlocked' ? 'bg-white shadow-xs text-emerald-700 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Geschafft ({REWARD_LADDER.filter((r) => cumulativePoints >= r.points).length})
            </button>
          </div>
        </div>

        {/* LADDER ITEMS */}
        <div className="grid grid-cols-1 gap-3">
          {REWARD_LADDER.filter((step) => {
            const isUnlocked = cumulativePoints >= step.points;
            if (filterMode === 'unlocked') return isUnlocked;
            if (filterMode === 'next') {
              // Show up to 3 next upcoming milestones plus current
              return step.points >= cumulativePoints && step.points <= cumulativePoints + 3000;
            }
            return true;
          }).map((step) => {
            const isUnlocked = cumulativePoints >= step.points;
            const isClaimed = claimedRewards.includes(step.level);
            const isNext = step.level === nextMilestone.level && !isUnlocked;
            const pointsNeeded = Math.max(0, step.points - cumulativePoints);

            return (
              <div
                key={step.level}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  step.isMajor
                    ? isUnlocked
                      ? 'bg-gradient-to-r from-violet-100 via-purple-50 to-amber-100 border-purple-400 shadow-md ring-2 ring-purple-300'
                      : 'bg-gradient-to-r from-violet-50/70 to-purple-50/70 border-violet-300 shadow-xs'
                    : isUnlocked
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                    : isNext
                    ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200 shadow-sm'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-xs ${
                      step.isMajor
                        ? 'bg-gradient-to-br from-violet-600 to-amber-500 text-white'
                        : isUnlocked
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isNext
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {step.emoji}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-500">
                        {step.title}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {formatPoints(step.points)} Punkte
                      </span>
                      {step.isMajor && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-600 text-white">
                          Nintendo Game
                        </span>
                      )}
                      {step.type === 'kino' && !step.isMajor && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          Kino-Spezial
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {step.reward}
                    </h4>
                  </div>
                </div>

                {/* Right: State & Actions */}
                <div className="shrink-0 flex items-center gap-3 self-end sm:self-auto">
                  {isUnlocked ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Geschafft!</span>
                      </span>

                      {/* Parent Mark: Belohnung erhalten */}
                      {onToggleClaimReward && (
                        <button
                          onClick={() => {
                            playChime('click');
                            onToggleClaimReward(step.level);
                          }}
                          title="Als Elternteil bestätigen, dass diese Belohnung eingelöst/gegeben wurde"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            isClaimed
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isClaimed ? 'Belohnung erhalten ✓' : 'Belohnung erhalten?'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>🔒 Noch {formatPoints(pointsNeeded)} Punkte</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Small pedagogical disclaimer */}
        <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 font-medium">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Alle Belohnungen sind <strong>Familien-Absprachen</strong>. Eltern behalten die Kontrolle und bestätigen die Einlösung über das Häkchen.
          </span>
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
