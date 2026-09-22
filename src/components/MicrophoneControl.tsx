import React from 'react';
import { Mic, MicOff, Sparkles, Volume2, CheckCircle } from 'lucide-react';
import { VoiceState } from '../services/voiceEngine';
import { Language } from '../types';

interface MicrophoneControlProps {
  voiceState: VoiceState;
  volume: number;
  language: Language;
  interimTranscript?: string;
  onToggleListening: () => void;
  onFinishSpeaking: () => void;
  disabled?: boolean;
}

export const MicrophoneControl: React.FC<MicrophoneControlProps> = ({
  voiceState,
  volume,
  language,
  interimTranscript,
  onToggleListening,
  onFinishSpeaking,
  disabled = false,
}) => {
  const isListening = voiceState === 'listening' || voiceState === 'speech_detected';
  const isThinking = voiceState === 'thinking';
  const isSpeaking = voiceState === 'speaking' || voiceState === 'modeling';

  const getStatusText = () => {
    if (voiceState === 'speech_detected') {
      return language === 'de' ? 'Ich höre noch zu… Nimm dir Zeit!' : "I'm still listening… Take your time!";
    }
    if (voiceState === 'listening') {
      return language === 'de' ? 'Ich höre dir zu… Fang einfach an zu sprechen!' : "Listening… Start speaking whenever you're ready!";
    }
    if (isThinking) {
      return language === 'de' ? 'Ich denke nach… ✨' : 'Thinking… ✨';
    }
    if (isSpeaking) {
      return language === 'de' ? 'Hör zu…' : 'Listening to playmate…';
    }
    return language === 'de' ? 'Tippe zum Sprechen 🎤' : 'Tap to talk 🎤';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto select-none">
      {/* Live Interim Transcript Display / Patience reassurance */}
      {isListening && (
        <div className="mb-4 px-6 py-3.5 rounded-2xl bg-white border border-slate-200/90 text-slate-800 text-center shadow-md transition-all animate-fade-in w-full">
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">
            {language === 'de' ? '💬 Deine Worte:' : '💬 Your words:'}
          </p>
          <p className="text-lg font-semibold min-h-[1.75rem] text-slate-900">
            {interimTranscript ? (
              <span>"{interimTranscript}"</span>
            ) : (
              <span className="italic text-slate-400 font-normal">
                {language === 'de' ? 'Ich warte ganz geduldig auf dich...' : 'Waiting patiently for you to speak...'}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Main Big Microphone Button Container */}
      <div className="relative flex items-center justify-center my-2">
        {/* Dynamic Pulsing Rings based on volume */}
        {isListening && (
          <>
            <div
              className="absolute rounded-full bg-rose-500/15 pointer-events-none transition-all duration-100"
              style={{
                width: `${120 + volume * 1.5}px`,
                height: `${120 + volume * 1.5}px`,
              }}
            />
            <div
              className="absolute rounded-full bg-rose-500/25 pointer-events-none transition-all duration-150 animate-ping opacity-30"
              style={{
                width: `${110 + volume * 0.8}px`,
                height: `${110 + volume * 0.8}px`,
              }}
            />
          </>
        )}

        {/* Large Child-Friendly Button */}
        <button
          id="btn-voice-microphone"
          onClick={onToggleListening}
          disabled={disabled || isThinking}
          aria-label={getStatusText()}
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-200 transform active:scale-95 focus:outline-none ${
            isListening
              ? 'bg-rose-600 ring-4 ring-rose-300 shadow-rose-500/30 scale-105'
              : isThinking
              ? 'bg-indigo-600 ring-4 ring-indigo-300 animate-pulse'
              : isSpeaking
              ? 'bg-emerald-600 ring-4 ring-emerald-300'
              : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-100 hover:scale-105 shadow-indigo-600/30'
          }`}
        >
          {isListening ? (
            <Mic className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse text-white" />
          ) : isThinking ? (
            <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 animate-spin text-amber-200" />
          ) : isSpeaking ? (
            <Volume2 className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce text-white" />
          ) : (
            <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          )}

          <span className="text-xs font-bold uppercase tracking-wider mt-1">
            {isListening
              ? language === 'de'
                ? 'Stopp'
                : 'Stop'
              : isThinking
              ? '...'
              : language === 'de'
              ? 'Sprechen'
              : 'Talk'}
          </span>
        </button>
      </div>

      {/* Status Pill */}
      <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
        {isListening && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
        {isSpeaking && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
        {isThinking && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-spin" />}
        <span>{getStatusText()}</span>
      </div>

      {/* Manual "I am done talking" helper button when speaking */}
      {isListening && interimTranscript && interimTranscript.trim().length > 0 && (
        <button
          id="btn-finish-speech"
          onClick={onFinishSpeaking}
          className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all animate-bounce"
        >
          <CheckCircle className="w-4 h-4" />
          {language === 'de' ? 'Ich bin fertig!' : "I'm finished speaking!"}
        </button>
      )}
    </div>
  );
};
