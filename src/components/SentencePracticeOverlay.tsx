import React, { useState } from 'react';
import { RotateCcw, Play, Star, Mic, ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { Emotion, Language, Playmate, Viseme } from '../types';
import { playChime } from '../utils/soundEffects';

interface SentencePracticeOverlayProps {
  playmate: Playmate;
  targetSentence: string;
  language: Language;
  viseme?: Viseme;
  emotion?: Emotion;
  isSpeaking: boolean;
  currentWordIndex?: number;
  repetitionCount?: number;
  maxRepetitions?: number;
  volume?: number;
  isListening?: boolean;
  onListenToModel?: (slow: boolean) => void;
  onPlayModelSentence?: (slow: boolean) => void;
  onJDStartSpeaking?: () => void;
  onStartJDRepeat?: () => void;
  onStartJedidiahRepeat?: () => void;
  onFinishSpeech?: () => void;
  onCompletePractice?: () => void;
  onSkip?: () => void;
}

export const SentencePracticeOverlay: React.FC<SentencePracticeOverlayProps> = ({
  playmate,
  targetSentence,
  language,
  viseme = 'closed',
  emotion = 'happy',
  isSpeaking,
  currentWordIndex = -1,
  repetitionCount: propRepetitionCount,
  onListenToModel,
  onPlayModelSentence,
  onJDStartSpeaking,
  onStartJDRepeat,
  onStartJedidiahRepeat,
  onFinishSpeech,
  onCompletePractice,
  onSkip,
}) => {
  const [internalRepCount, setInternalRepCount] = useState<number>(0);
  const repCount = propRepetitionCount !== undefined ? propRepetitionCount : internalRepCount;
  const words = targetSentence.split(/\s+/);

  const handleReplay = (slow: boolean) => {
    playChime('repeat_model');
    if (onListenToModel) onListenToModel(slow);
    else if (onPlayModelSentence) onPlayModelSentence(slow);
  };

  const handleJedidiahRepetitionFinished = () => {
    const nextCount = repCount + 1;
    setInternalRepCount(nextCount);
    playChime('star_earned');

    if (onStartJedidiahRepeat) onStartJedidiahRepeat();
    else if (onStartJDRepeat) onStartJDRepeat();
    else if (onJDStartSpeaking) onJDStartSpeaking();

    if (onFinishSpeech) {
      onFinishSpeech();
    } else {
      if (nextCount >= 2) {
        setTimeout(() => {
          if (onCompletePractice) onCompletePractice();
          else if (onSkip) onSkip();
        }, 1200);
      } else {
        setTimeout(() => {
          handleReplay(false);
        }, 800);
      }
    }
  };

  return (
    <div
      id="sentence-practice-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xl text-slate-900 flex flex-col items-center">
        {/* Header Tag */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>{language === 'de' ? 'Gemeinsam ruhig sprechen' : 'Practice Together'}</span>
        </div>

        {/* Playmate in Close-up for clear visual observation */}
        <div className="my-2">
          <AvatarDisplay
            playmate={playmate}
            emotion={emotion}
            viseme={viseme}
            isSpeaking={isSpeaking}
            isListening={false}
            size="lg"
            showCloseUp={true}
          />
        </div>

        <p className="text-sm sm:text-base text-slate-600 text-center font-medium my-2">
          {isSpeaking
            ? language === 'de'
              ? `${playmate.name} spricht den Satz vor. Schau genau hin:`
              : `${playmate.name} models the sentence. Watch and listen:`
            : language === 'de'
            ? 'Jetzt bist du dran! Sag den Satz ganz in Ruhe nach:'
            : 'Your turn! Repeat the sentence calmly:'}
        </p>

        {/* Word-by-word highlighted sentence card */}
        <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-200/80 my-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xl sm:text-2xl font-bold leading-relaxed">
            {words.map((word, idx) => {
              const isCurrent = idx === currentWordIndex;
              return (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg transition-all duration-200 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-400'
                      : 'text-slate-900'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Repetition Star Tracker (Max 2 reps) */}
        <div className="flex items-center gap-3 my-3">
          <span className="text-sm font-semibold text-slate-600">
            {language === 'de' ? 'Übungs-Sterne:' : 'Stars earned:'}
          </span>
          <div className="flex gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                repCount >= 1
                  ? 'bg-amber-400 border-amber-300 text-slate-950 scale-110 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                repCount >= 2
                  ? 'bg-amber-400 border-amber-300 text-slate-950 scale-110 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full">
          {/* Replay Normal Button */}
          <button
            id="btn-replay-normal"
            onClick={() => handleReplay(false)}
            disabled={isSpeaking}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 font-semibold text-sm active:scale-95 transition-all text-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-indigo-600" />
            <span>{language === 'de' ? '🔁 Noch einmal' : '🔁 Replay'}</span>
          </button>

          {/* Replay Slow Button */}
          <button
            id="btn-replay-slow"
            onClick={() => handleReplay(true)}
            disabled={isSpeaking}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 font-semibold text-sm active:scale-95 transition-all text-slate-700"
          >
            <span>🐢</span>
            <span>{language === 'de' ? 'Langsamer' : 'Slower'}</span>
          </button>

          {/* Speak Button */}
          <button
            id="btn-practice-speak"
            onClick={() => {
              handleJedidiahRepetitionFinished();
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md active:scale-95 transition-all"
          >
            <Mic className="w-5 h-5" />
            <span>{language === 'de' ? 'Jetzt nachsprechen! 🎤' : 'Repeat Now! 🎤'}</span>
          </button>
        </div>

        {/* Continue / Skip Button (Ensures zero pressure) */}
        <button
          id="btn-skip-practice"
          onClick={() => {
            if (onCompletePractice) onCompletePractice();
            else if (onSkip) onSkip();
          }}
          className="mt-6 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>{language === 'de' ? 'Weiter im Gespräch' : 'Continue talking'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
