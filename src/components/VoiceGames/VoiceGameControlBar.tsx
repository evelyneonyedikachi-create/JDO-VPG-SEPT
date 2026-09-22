import React, { useState } from 'react';
import { Language } from '../../types';
import { VoiceGameMachineState, GameKind, GameAction } from '../../services/voiceGameController';
import { Mic, MicOff, Sparkles, HelpCircle, Zap, MessageSquare, Volume2, CheckCircle2, RotateCcw, Sliders, Check, X } from 'lucide-react';
import { playChime } from '../../utils/soundEffects';
import { VoiceListeningMode } from '../../services/voiceEngine';

interface VoiceGameControlBarProps {
  language: Language;
  gameKind: GameKind;
  state: VoiceGameMachineState;
  liveTranscript: string;
  lastActionText?: string;
  fullSentenceMode: boolean;
  listeningMode?: VoiceListeningMode;
  pendingClarification?: GameAction | null;
  onToggleFullSentenceMode: (enabled: boolean) => void;
  onToggleMic: () => void;
  onStartPushToTalk?: () => void;
  onStopPushToTalk?: () => void;
  onUndoOrCorrection?: () => void;
  onConfirmClarification?: () => void;
  onRejectClarification?: () => void;
  onOpenCalibrationModal?: () => void;
  onRequestHelp: () => void;
  onManualTriggerCommand?: (cmd: string) => void;
  quickSuggestions?: string[];
}

export const VoiceGameControlBar: React.FC<VoiceGameControlBarProps> = ({
  language,
  gameKind,
  state,
  liveTranscript,
  lastActionText,
  fullSentenceMode,
  listeningMode = 'continuous',
  pendingClarification,
  onToggleFullSentenceMode,
  onToggleMic,
  onStartPushToTalk,
  onStopPushToTalk,
  onUndoOrCorrection,
  onConfirmClarification,
  onRejectClarification,
  onOpenCalibrationModal,
  onRequestHelp,
  onManualTriggerCommand,
  quickSuggestions = [],
}) => {
  const [isPressingPushToTalk, setIsPressingPushToTalk] = useState(false);

  const isListeningOrActive =
    state === 'listening' || state === 'transcribing' || state === 'interpreting' || isPressingPushToTalk;

  // Push-to-talk handlers
  const handlePushToTalkStart = () => {
    if (listeningMode === 'push_to_talk') {
      setIsPressingPushToTalk(true);
      playChime('click');
      onStartPushToTalk?.();
    }
  };

  const handlePushToTalkEnd = () => {
    if (listeningMode === 'push_to_talk') {
      setIsPressingPushToTalk(false);
      onStopPushToTalk?.();
    }
  };

  // State Badge Configuration
  const getStatusBadge = () => {
    switch (state) {
      case 'listening':
        return {
          icon: <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />,
          label: language === 'de' ? '🔴 Ich höre zu...' : '🔴 Listening...',
          bg: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'transcribing':
        return {
          icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" />,
          label: language === 'de' ? '✨ Ich habe dich gehört...' : '✨ I heard you...',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'interpreting':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />,
          label: language === 'de' ? '🧠 Verstehe Befehl...' : '🧠 Processing...',
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'executing':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 animate-bounce" />,
          label: language === 'de' ? '⚡ Aktion!' : '⚡ Action!',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black',
        };
      case 'responding':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-600" />,
          label: language === 'de' ? '💬 Antwortet...' : '💬 Responding...',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'error':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-rose-600" />,
          label: language === 'de' ? '⚠️ Wiederhole ruhig...' : '⚠️ Please repeat...',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'idle':
      default:
        return {
          icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />,
          label: lastActionText
            ? language === 'de'
              ? '🎤 Was jetzt?'
              : '🎤 What now?'
            : language === 'de'
            ? '🎤 Dein Zug'
            : '🎤 Your Turn',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div
      id="voice-game-control-bar"
      className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-200 p-3 sm:p-4 shadow-xl flex flex-col gap-3 my-2 z-20 transition-all"
    >
      {/* 1. Clarification Banner (when avatar is confirming candidate command) */}
      {pendingClarification && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
            <span className="text-xl">🤔</span>
            <span>
              {language === 'de'
                ? `Meintest du: "${pendingClarification.descriptionDe}"?`
                : `Did you mean: "${pendingClarification.descriptionEn}"?`}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                playChime('click');
                onConfirmClarification?.();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Ja, genau!' : 'Yes, exactly!'}</span>
            </button>

            <button
              onClick={() => {
                playChime('click');
                onRejectClarification?.();
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs flex items-center gap-1 shadow-2xs transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Nein, nochmal' : 'No, try again'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Bar: Status Badge, Mode Pills & Calibration */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-xs transition-all ${status.bg}`}
          >
            {status.icon}
            <span>{status.label}</span>
          </div>

          {/* Full Sentence Mode Pill */}
          <button
            onClick={() => {
              playChime('click');
              onToggleFullSentenceMode(!fullSentenceMode);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all border shadow-xs flex items-center gap-1 ${
              fullSentenceMode
                ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-300'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Ganze-Sätze-Modus / Full Sentence Mode"
          >
            <Sparkles className="w-3 h-3" />
            <span>{language === 'de' ? 'Ganze-Sätze' : 'Full Sentences'}</span>
            <span className="text-[9px] uppercase px-1 rounded bg-black/20 ml-0.5">
              {fullSentenceMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Action Controls: Undo/Correction, Mic Calibration, Help */}
        <div className="flex items-center gap-1.5">
          {/* Undo / Correction Button */}
          <button
            onClick={() => {
              playChime('click');
              onUndoOrCorrection?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-black transition-all shadow-xs"
            title={language === 'de' ? 'Letzten Zug wiederholen / Korrektur' : 'Undo / Repeat last move'}
          >
            <RotateCcw className="w-3 h-3 text-slate-600" />
            <span>{language === 'de' ? '↩️ Korrektur' : '↩️ Correction'}</span>
          </button>

          {/* Mic Calibration Button */}
          {onOpenCalibrationModal && (
            <button
              onClick={() => {
                playChime('click');
                onOpenCalibrationModal();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-black transition-all shadow-xs"
              title="Mikrofon-Kalibrierung & Test"
            >
              <Sliders className="w-3 h-3 text-indigo-600" />
              <span>{language === 'de' ? '🎙️ Mikro-Test' : '🎙️ Mic Test'}</span>
            </button>
          )}

          {/* Help Button */}
          <button
            onClick={() => {
              playChime('click');
              onRequestHelp();
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black transition-all shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'de' ? '💡 Tipps' : '💡 Tips'}</span>
          </button>
        </div>
      </div>

      {/* Center Section: Live Microphone Waveform & Spoken Transcript */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Main Glowing Microphone Button (Supports Push-to-Talk & Tap) */}
          <button
            id="voice-mic-main-btn"
            onClick={() => {
              if (listeningMode === 'continuous') {
                playChime('click');
                onToggleMic();
              }
            }}
            onMouseDown={handlePushToTalkStart}
            onMouseUp={handlePushToTalkEnd}
            onTouchStart={handlePushToTalkStart}
            onTouchEnd={handlePushToTalkEnd}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg active:scale-95 shrink-0 select-none ${
              isListeningOrActive
                ? 'bg-gradient-to-tr from-red-500 to-rose-600 ring-4 ring-rose-300 shadow-rose-500/40 animate-pulse'
                : 'bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
            }`}
            title={
              listeningMode === 'push_to_talk'
                ? language === 'de'
                  ? 'Gedrückt halten zum Sprechen (Push-to-Talk)'
                  : 'Hold down to speak (Push-to-Talk)'
                : isListeningOrActive
                ? 'Mikrofon aktiv'
                : 'Mikrofon einschalten'
            }
          >
            {isListeningOrActive ? (
              <Mic className="w-6 h-6 animate-bounce" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {/* Transcript & Spoken Feedback */}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>{language === 'de' ? 'Gesprochene Anweisung:' : 'Spoken Instruction:'}</span>
              {listeningMode === 'push_to_talk' && (
                <span className="text-[9px] bg-indigo-100 text-indigo-800 font-black px-1.5 py-0.2 rounded">
                  {language === 'de' ? 'DRÜCKEN & SPRECHEN' : 'HOLD TO SPEAK'}
                </span>
              )}
            </div>
            <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">
              {liveTranscript ? (
                <span className="text-indigo-700 font-black">"{liveTranscript}"</span>
              ) : (
                <span className="text-slate-600 italic font-medium">
                  {language === 'de' ? 'Sprich deinen nächsten Spielzug...' : 'Speak your next move...'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Audio Wave Visualizer Bars */}
        <div className="flex items-center gap-1 h-6 shrink-0">
          {[40, 70, 90, 60, 80, 50, 95, 65, 45].map((h, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListeningOrActive
                  ? 'bg-indigo-600 animate-pulse'
                  : 'bg-slate-300 h-2'
              }`}
              style={{
                height: isListeningOrActive ? `${Math.max(6, Math.round(h * Math.random()))}px` : '6px',
                animationDelay: `${idx * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Row: Quick Command Chips (Clickable / Speakable Suggestions) */}
      {quickSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-black text-slate-600 uppercase mr-1">
            {language === 'de' ? 'Tipps:' : 'Tips:'}
          </span>
          {quickSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                playChime('click');
                onManualTriggerCommand?.(suggestion);
              }}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold shadow-2xs hover:border-indigo-300 hover:scale-105 active:scale-95 transition-all text-left"
            >
              💬 "{suggestion}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
