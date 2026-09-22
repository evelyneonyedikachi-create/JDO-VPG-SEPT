import React, { useEffect, useState } from 'react';
import { Emotion, Playmate, Viseme } from '../types';

interface AvatarDisplayProps {
  playmate: Playmate;
  emotion: Emotion;
  viseme: Viseme;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showCloseUp?: boolean;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  playmate,
  emotion,
  viseme,
  isSpeaking,
  isListening,
  isThinking = false,
  size = 'lg',
  showCloseUp = false,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false);

  // Natural eye blink interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Thinking state staged timer:
  // Stage 1 (0-2s): Attentive
  // Stage 2 (2-5s): Subtle thinking animation
  // Stage 3 (>5s): Short 'Einen Moment...' notification
  const [thinkingStage, setThinkingStage] = useState<'none' | 'attentive' | 'thinking' | 'patient'>('none');

  useEffect(() => {
    let timerStage2: NodeJS.Timeout | null = null;
    let timerStage3: NodeJS.Timeout | null = null;

    if (isThinking || emotion === 'thinking') {
      setThinkingStage('attentive');

      timerStage2 = setTimeout(() => {
        setThinkingStage('thinking');
      }, 2000);

      timerStage3 = setTimeout(() => {
        setThinkingStage('patient');
      }, 5000);
    } else {
      setThinkingStage('none');
    }

    return () => {
      if (timerStage2) clearTimeout(timerStage2);
      if (timerStage3) clearTimeout(timerStage3);
    };
  }, [isThinking, emotion]);

  // Quick reactive viseme switch on speech
  useEffect(() => {
    if (isSpeaking) {
      const mouthTimer = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 140);
      return () => clearInterval(mouthTimer);
    } else {
      setMouthOpen(false);
    }
  }, [isSpeaking]);

  const sizeClasses = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24',
    md: 'w-36 h-36 sm:w-44 sm:h-44',
    lg: 'w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72',
    xl: 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96',
    hero: 'w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px]',
  }[size];

  const thinkingActive = isThinking || emotion === 'thinking';

  // Emotion status badges
  const emotionEmoji = {
    happy: '😊',
    curious: '🤔',
    encouraging: '👍',
    thinking: '💭',
    surprised: '😲',
    cheering: '🎉',
    talking: '💬',
  }[emotion] || '😊';

  return (
    <div
      id={`avatar-${playmate.id}`}
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses} ${
        thinkingActive ? 'animate-pulse' : ''
      }`}
      aria-label={`AI Playmate ${playmate.name}`}
    >
      {/* Outer Pulse & Glow ring when speaking or listening or thinking */}
      <div
        className={`absolute -inset-2 rounded-full transition-all duration-500 pointer-events-none ${
          isSpeaking
            ? 'ring-6 ring-indigo-400/80 scale-105 animate-pulse shadow-[0_0_40px_rgba(99,102,241,0.5)]'
            : isListening
            ? 'ring-6 ring-emerald-400/80 scale-102 shadow-[0_0_35px_rgba(16,185,129,0.45)]'
            : thinkingActive
            ? 'ring-4 ring-amber-300/80 scale-102 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
            : 'ring-4 ring-white/60 shadow-xl'
        }`}
      />

      {/* Main Avatar Container with gentle tilt during thinking */}
      <div
        className={`relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-b from-slate-100 to-slate-200 transition-all duration-500 ${
          showCloseUp ? 'scale-115 translate-y-2' : ''
        } ${isSpeaking ? 'animate-bounce-subtle' : ''} ${
          thinkingActive ? 'rotate-1 -translate-y-1' : ''
        }`}
      >
        {playmate.avatarImageUrl ? (
          <div className="relative w-full h-full">
            {/* 3D Realistic Character Portrait Image */}
            <img
              src={playmate.avatarImageUrl}
              alt={playmate.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-top transition-transform duration-700 ${
                isSpeaking ? 'scale-105' : thinkingActive ? 'scale-103' : 'scale-100'
              }`}
            />

            {/* Subtle blink overlay */}
            {isBlinking && (
              <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[0.5px] pointer-events-none transition-opacity duration-100" />
            )}

            {/* Dynamic Lip-Sync Mouth Overlay for Realistic 3D Human Avatar */}
            {isSpeaking && (
              <div className="absolute bottom-[24%] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none transition-transform duration-100">
                {viseme === 'open_wide' || (isSpeaking && emotion === 'cheering') ? (
                  <div className="w-9 h-6 sm:w-11 sm:h-7 rounded-full bg-rose-950/90 border-2 border-rose-300/80 shadow-inner flex items-center justify-center animate-pulse">
                    <div className="w-5 h-2 bg-white/90 rounded-full" />
                  </div>
                ) : viseme === 'open_medium' || mouthOpen ? (
                  <div className="w-7 h-4 sm:w-9 sm:h-5 rounded-full bg-rose-950/90 border border-rose-400/80 shadow-inner flex items-center justify-center">
                    <div className="w-4 h-1.5 bg-white/90 rounded-full" />
                  </div>
                ) : viseme === 'round' ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-950/90 border border-rose-400/80 shadow-inner" />
                ) : (
                  <div className="w-6 h-2 sm:w-8 sm:h-2.5 rounded-full bg-rose-950/80 border border-rose-300/60" />
                )}
              </div>
            )}

            {/* Soft Ambient Inner Vignette */}
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 pointer-events-none" />
          </div>
        ) : (
          /* SVG Fallback Character */
          <div className="w-full h-full flex items-center justify-center bg-slate-100 font-bold text-4xl text-indigo-600">
            {playmate.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Staged Thinking Indicators:
          0-2s: Attentive (glow on avatar ring)
          2-5s: Subtle thinking animation (dots & thought bubble)
          >5s: Short reassuring "Einen Moment..." notification */}
      {thinkingStage === 'thinking' && (
        <div className="absolute -top-3 -right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-amber-300 text-slate-800 text-xs font-black shadow-xl animate-fade-in flex items-center gap-1.5 z-30">
          <span className="animate-bounce text-amber-500">💭</span>
          <span className="flex items-center gap-1">
            <span>Überlegt</span>
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 bg-amber-600 rounded-full animate-pulse" />
              <span className="w-1 h-1 bg-amber-600 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-1 bg-amber-600 rounded-full animate-pulse delay-150" />
            </span>
          </span>
        </div>
      )}

      {thinkingStage === 'patient' && (
        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-50 to-white px-3.5 py-1.5 rounded-2xl border-2 border-amber-400 text-slate-900 text-xs font-black shadow-xl animate-fade-in flex items-center gap-1.5 z-30">
          <span className="text-amber-500 animate-spin">⏳</span>
          <span>Einen Moment…</span>
        </div>
      )}

      {/* Floating Emotion Badge */}
      <div
        className="absolute -bottom-1 -right-1 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white/95 backdrop-blur-sm border-2 border-slate-100 shadow-lg flex items-center justify-center text-xl sm:text-2xl animate-bounce-subtle z-20"
        title={`Stimmung: ${emotion}`}
      >
        <span>{emotionEmoji}</span>
      </div>

      {/* Speaking Sound Waves Indicator */}
      {isSpeaking && (
        <div className="absolute -top-3 flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black tracking-wide shadow-lg border border-indigo-300 animate-bounce z-20">
          <span className="w-1.5 h-3 bg-white rounded-full animate-pulse" />
          <span className="w-1.5 h-4 bg-white rounded-full animate-pulse delay-75" />
          <span className="w-1.5 h-2 bg-white rounded-full animate-pulse delay-150" />
          <span className="ml-1 uppercase">{playmate.name} spricht</span>
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div className="absolute -top-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black tracking-wide shadow-lg border border-emerald-300 animate-pulse z-20">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Hört JD zu...</span>
        </div>
      )}
    </div>
  );
};
