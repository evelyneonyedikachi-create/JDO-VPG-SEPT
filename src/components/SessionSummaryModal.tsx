import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Language, Playmate, SessionStats } from '../types';
import { Trophy, Star, Clock, Sparkles, MessageSquare, BookOpen, Volume2, RotateCcw } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { playChime } from '../utils/soundEffects';

interface SessionSummaryModalProps {
  summary: SessionStats;
  playmate: Playmate;
  language: Language;
  onPlaySentenceAudio?: (text: string) => void;
  onClose: () => void;
  onStartNewAdventure: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  summary,
  playmate,
  language,
  onPlaySentenceAudio,
  onClose,
  onStartNewAdventure,
}) => {
  useEffect(() => {
    playChime('star_earned');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  const minutes = Math.max(1, Math.round(summary.durationSeconds / 60));

  return (
    <div
      id="session-summary-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xl text-slate-900 my-8">
        {/* Playmate Header & Trophy */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-2">
            <AvatarDisplay
              playmate={playmate}
              emotion="cheering"
              viseme="smile"
              isSpeaking={false}
              isListening={false}
              size="md"
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md border-2 border-white">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {language === 'de' ? `⭐ Jedidiahs Abenteuer-Rückblick` : `⭐ Jedidiah's Adventure Recap`}
          </h2>
          <p className="text-indigo-600 font-semibold text-sm mt-1">
            {language === 'de' ? `Zusammen mit ${playmate.name}` : `With ${playmate.name}`}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-center text-indigo-600 mb-1">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">{minutes} Min.</span>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'de' ? 'Gesprochen' : 'Talked'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-center text-amber-500 mb-1">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">{summary.jedidiahTurnCount ?? summary.jdTurnCount}</span>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'de' ? 'Deine Redebeiträge' : 'Your turns'}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-2xl p-4 text-center border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-center text-emerald-600 mb-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-base font-extrabold text-indigo-700 truncate block">
              {summary.badgeEarned?.emoji} {summary.badgeEarned?.nameDe}
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'de' ? 'Auszeichnung' : 'Badge'}
            </p>
          </div>
        </div>

        {/* Playmate Message */}
        {summary.playmateFarewell && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 text-sm text-slate-800 flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-bold text-indigo-700 mb-0.5">{playmate.name} sagt:</p>
              <p className="italic leading-relaxed">"{summary.playmateFarewell}"</p>
            </div>
          </div>
        )}

        {/* Star Sentences & Practiced Sentences */}
        <div className="space-y-4 mb-6">
          {summary.greatSentences && summary.greatSentences.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{language === 'de' ? 'Tolle Sätze von dir:' : 'Great sentences you spoke:'}</span>
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {summary.greatSentences.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span>"{s}"</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.practicedSentences && summary.practicedSentences.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>{language === 'de' ? 'Gemeinsam geübte Sätze:' : 'Practiced sentences:'}</span>
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {summary.practicedSentences.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="italic">"{s}"</span>
                    {onPlaySentenceAudio && (
                      <button
                        onClick={() => onPlaySentenceAudio(s)}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all border border-indigo-200"
                        title="Anhören"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.newWords && summary.newWords.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                {language === 'de' ? 'Entdeckte Wörter:' : 'Vocabulary discovered:'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {summary.newWords.map((w, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    ✨ {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-new-adventure"
            onClick={() => {
              playChime('click');
              onStartNewAdventure();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base shadow-md transition-all"
          >
            {language === 'de' ? 'Neues Abenteuer starten 🚀' : 'Start New Adventure 🚀'}
          </button>

          <button
            id="btn-close-summary"
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-sm border border-slate-200 transition-all"
          >
            {language === 'de' ? 'Schließen' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
