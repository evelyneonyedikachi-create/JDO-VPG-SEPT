import React from 'react';
import { Language, Playmate, SessionStats } from '../types';
import { Trophy, Star, Sparkles, Check, Home, ArrowRight } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';

interface CelebrationRewardModalProps {
  language: Language;
  playmate: Playmate;
  stats: SessionStats;
  onClose: () => void;
  onContinueAdventure: () => void;
}

export const CelebrationRewardModal: React.FC<CelebrationRewardModalProps> = ({
  language,
  playmate,
  stats,
  onClose,
  onContinueAdventure,
}) => {
  return (
    <div
      id="celebration-reward-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-white to-amber-50 rounded-3xl border-4 border-amber-300 p-6 sm:p-8 shadow-2xl text-slate-900 text-center my-6 animate-scale-up">
        {/* Confetti & Star Accents */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-amber-400 border-4 border-white shadow-xl flex items-center justify-center text-3xl animate-bounce">
          🏆
        </div>

        {/* Playmate Header & Avatar */}
        <div className="mt-4 mb-3 flex flex-col items-center">
          <div className="mb-2">
            <AvatarDisplay
              playmate={playmate}
              emotion="cheering"
              viseme="smile"
              isSpeaking={false}
              isListening={false}
              size="md"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'de' ? 'Klasse Leistung, Jedidiah!' : 'Awesome Job, Jedidiah!'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {language === 'de' ? 'STERNEN-BELOHNUNG! ⭐' : 'STAR REWARD! ⭐'}
          </h2>
        </div>

        {/* Spoken Playmate Praise Quote */}
        <div className="p-4 rounded-2xl bg-white border-2 border-amber-200 shadow-sm text-sm sm:text-base font-extrabold text-slate-800 my-3">
          "{stats.playmateFarewell || (language === 'de'
            ? `Das war richtig klasse! Du hast so mutig und toll gesprochen!`
            : `That was fantastic! You spoke so clearly and bravely!`)}"
        </div>

        {/* Stats Badges Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-4">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
            <span className="text-xl sm:text-2xl font-black text-indigo-600">
              {stats.jedidiahTurnCount ?? stats.jdTurnCount}
            </span>
            <p className="text-[11px] font-bold text-slate-600 mt-1">
              {language === 'de' ? 'Redebeiträge' : 'Talk Turns'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {Math.max(1, Math.round(stats.durationSeconds / 60))}
            </span>
            <p className="text-[11px] font-bold text-slate-600 mt-1">
              {language === 'de' ? 'Minuten' : 'Minutes'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xl sm:text-2xl font-black text-amber-600">
              +3 ⭐
            </span>
            <p className="text-[11px] font-bold text-slate-600 mt-1">
              {language === 'de' ? 'Sterne' : 'Stars'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>{language === 'de' ? 'Zurück zu den Freunden' : 'Back to Friends'}</span>
          </button>

          <button
            onClick={onContinueAdventure}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 border border-amber-300"
          >
            <span>{language === 'de' ? 'Weiterspielen 🚀' : 'Keep Playing 🚀'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
