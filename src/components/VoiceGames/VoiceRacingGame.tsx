import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, Playmate } from '../../types';
import { VoiceEngine, VoiceListeningMode } from '../../services/voiceEngine';
import {
  VoiceGameController,
  VoiceGameMachineState,
  GameAction,
  CompactGameState,
} from '../../services/voiceGameController';
import { VoiceGameControlBar } from './VoiceGameControlBar';
import { MicrophoneCalibrationModal } from '../MicrophoneCalibrationModal';
import { playChime } from '../../utils/soundEffects';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  Gauge,
  Flag,
  Zap,
} from 'lucide-react';

interface VoiceRacingGameProps {
  language: Language;
  playmate: Playmate;
  voiceEngineRef: React.MutableRefObject<VoiceEngine | null>;
  onBack: () => void;
  onRewardStars: (count: number, reason: string) => void;
}

export const VoiceRacingGame: React.FC<VoiceRacingGameProps> = ({
  language,
  playmate,
  voiceEngineRef,
  onBack,
  onRewardStars,
}) => {
  const [fullSentenceMode, setFullSentenceMode] = useState<boolean>(false);
  const [speedKmh, setSpeedKmh] = useState<number>(140);
  const [prevSpeedKmh, setPrevSpeedKmh] = useState<number>(140);
  const [lap, setLap] = useState<number>(1);
  const [position, setPosition] = useState<number>(3); // 3rd -> 2nd -> 1st!
  const [playerLane, setPlayerLane] = useState<'left' | 'center' | 'right'>('center');
  const [prevPlayerLane, setPrevPlayerLane] = useState<'left' | 'center' | 'right'>('center');
  const [trackSegment, setTrackSegment] = useState<'straight' | 'curve_left' | 'curve_right' | 'pit'>('straight');
  const [isPitStop, setIsPitStop] = useState<boolean>(false);
  const [hasWonRace, setHasWonRace] = useState<boolean>(false);
  const [lastActionText, setLastActionText] = useState<string>('Rennstart! Vollgas!');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [pendingClarification, setPendingClarification] = useState<GameAction | null>(null);

  // Standard Voice State Machine
  const [voiceMachineState, setVoiceMachineState] = useState<VoiceGameMachineState>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // Avatar Speech State
  const [avatarSpeech, setAvatarSpeech] = useState<string>(
    language === 'de'
      ? `JD! Wir kommen zur Kurve und das rote Auto ist direkt vor uns. Was machen wir — Zuerst bremsen und danach überholen?`
      : `JD! Coming to the turn and the red car is right ahead! What's the plan — Brake first and overtake after?`
  );

  // Compact Game State Payload
  const getCompactGameState = useCallback((): CompactGameState => {
    return {
      gameKind: 'racing',
      urgencyOrClock: `${speedKmh} km/h`,
      scoreOrPoints: `P${position} (${language === 'de' ? 'Platz' : 'Pos'} ${position})`,
      summaryDe: `Wir fahren mit ${speedKmh} km/h auf Platz ${position}. Das rote Auto ist 10 Meter vor uns und eine Linkskurve naht.`,
      summaryEn: `Driving at ${speedKmh} km/h in P${position}. Red car is 10m ahead, sharp left turn approaching.`,
      optionsDe: [
        'Brems vor der Kurve und beschleunige danach',
        'Überhole das rote Auto',
        'Gib Vollgas auf der Geraden',
        'Lenk nach links auf die Ideallinie',
        'Fahr in die Box zum Reifenwechsel',
      ],
      optionsEn: [
        'Brake before the turn and accelerate after',
        'Overtake the red car',
        'Full throttle on straight',
        'Steer left to racing line',
        'Box now for tyre change',
      ],
    };
  }, [speedKmh, position, language]);

  const controllerRef = useRef<VoiceGameController | null>(null);

  const speakInCharacter = (text: string) => {
    setAvatarSpeech(text);
    if (voiceEngineRef.current) {
      voiceEngineRef.current.speak(text, {
        pitch: playmate.voicePitch || 1.1,
        gender: playmate.gender || 'boy',
        rate: 1.0,
      });
    }
  };

  const handleActionExecute = async (action: GameAction, isLast: boolean) => {
    if (action.type === 'ACCELERATE') {
      playChime('engine_rev');
      setPrevSpeedKmh(speedKmh);
      setSpeedKmh((prev) => Math.min(280, prev + 40));
      setLastActionText(language === 'de' ? '🏎️ VOLLGAS auf der Geraden!' : '🏎️ FULL THROTTLE on straight!');
      if (isLast) {
        speakInCharacter(
          language === 'de'
            ? 'Vollgas gegeben! 240 km/h auf der Geraden erreicht!'
            : 'Full throttle! 240 km/h reached on the straight!'
        );
      }
    } else if (action.type === 'BRAKE') {
      playChime('step');
      setPrevSpeedKmh(speedKmh);
      setSpeedKmh((prev) => Math.max(90, prev - 45));
      setLastActionText(language === 'de' ? '🛑 Perfekt vor der Kurve abgebremst!' : '🛑 Braked before curve!');
      if (isLast) {
        speakInCharacter(
          language === 'de'
            ? 'Perfekter Bremspunkt! Der Rennwagen liegt stabil in der Kurve. Jetzt herausbeschleunigen!'
            : 'Perfect braking point! Car is balanced in the corner. Accelerate out now!'
        );
      }
    } else if (action.type === 'TURN_LEFT' || action.type === 'TURN_RIGHT') {
      playChime('step');
      const dir = action.direction || (action.type === 'TURN_LEFT' ? 'left' : 'right');
      setPrevPlayerLane(playerLane);
      setPlayerLane(dir);
      setLastActionText(
        language === 'de'
          ? `🏎️ Auf die ${dir === 'left' ? 'linke Ideallinie' : 'rechte Außenbahn'} gezogen!`
          : `🏎️ Steered ${dir}!`
      );
      if (isLast) {
        speakInCharacter(
          language === 'de'
            ? `Perfekt nach ${dir === 'left' ? 'links' : 'rechts'} eingelenkt! Freie Bahn!`
            : `Cleanly steered ${dir}! Clean air ahead!`
        );
      }
    } else if (action.type === 'OVERTAKE') {
      playChime('engine_rev');
      const newPos = Math.max(1, position - 1);
      setPosition(newPos);
      setLastActionText(
        language === 'de'
          ? `🔥 Spektakuläres Überholmanöver! P${newPos}!`
          : `🔥 Spectacular overtake! P${newPos}!`
      );

      if (newPos === 1) {
        playChime('goal_scored');
        setHasWonRace(true);
        onRewardStars(3, 'Rennsieg in der Formel 1!');
        speakInCharacter(
          language === 'de'
            ? 'P1! ZIELGERADE! WIR HABEN DAS RENNEN GEWONNEN, JD! Sensationelle Fahrt!'
            : 'P1! FINISH LINE! WE WON THE RACE, JD! Sensational driving!'
        );
      } else {
        onRewardStars(1, 'Überholmanöver gelungen!');
        speakInCharacter(
          language === 'de'
            ? `Gute Entscheidung! Wir sind am roten Auto vorbei auf Platz ${newPos}! Was machen wir bei der nächsten Kurve?`
            : `Great move! We passed the red car into P${newPos}! What's the plan for next corner?`
        );
      }
    } else if (action.type === 'PIT_STOP' || action.type === 'CHANGE_TYRES') {
      playChime('step');
      setIsPitStop(true);
      setSpeedKmh(60);
      setLastActionText(language === 'de' ? '🔧 Boxenstopp: 2.1s Reifenwechsel!' : '🔧 Pit stop: 2.1s tyre swap!');

      speakInCharacter(
        language === 'de'
          ? 'Boxenstopp erledigt! Frische weiche Reifen montiert. Jetzt wieder Vollgas auf die Strecke!'
          : 'Pit stop complete! Fresh soft tyres fitted. Full speed back on track!'
      );

      setTimeout(() => {
        setIsPitStop(false);
        setSpeedKmh(210);
      }, 2200);
    } else if (action.type === 'FOLLOW') {
      playChime('step');
      setLastActionText(language === 'de' ? '🌬️ Im Windschatten angesaugt!' : '🌬️ Tucked in slipstream!');
      speakInCharacter(
        language === 'de'
          ? 'Direkt im Windschatten! Wir sparen Reifen und haben mehr Topspeed zum Überholen!'
          : 'In the slipstream! Saving tyres and ready for the overtake!'
      );
    }
  };

  // Undo handler
  const handleUndoMove = () => {
    setPlayerLane(prevPlayerLane);
    setSpeedKmh(prevSpeedKmh);
    playChime('score');
    setLastActionText(
      language === 'de'
        ? `↩️ Fahrmanöver rückgängig gemacht: ${prevPlayerLane === 'left' ? 'Links' : prevPlayerLane === 'right' ? 'Rechts' : 'Mitte'} bei ${prevSpeedKmh} km/h`
        : `↩️ Move undone: ${prevPlayerLane} lane at ${prevSpeedKmh} km/h`
    );
  };

  // INITIALIZE CONTROLLER
  useEffect(() => {
    if (!voiceEngineRef.current) return;

    const controller = new VoiceGameController({
      voiceEngine: voiceEngineRef.current,
      gameKind: 'racing',
      language,
      playmate,
      fullSentenceMode,
      currentStateGetter: getCompactGameState,
      callbacks: {
        onStateChange: (st) => setVoiceMachineState(st),
        onInterimTranscript: (t) => setLiveTranscript(t),
        onFinalTranscript: (t) => setLiveTranscript(t),
        onActionExecute: (act, isLast) => handleActionExecute(act, isLast),
        onUndoAction: handleUndoMove,
        onClarificationPrompt: (cand) => setPendingClarification(cand),
        onClarificationDismiss: () => setPendingClarification(null),
        onAvatarSpeak: (text) => setAvatarSpeech(text),
        onError: (err) => console.warn('Racing controller error:', err),
      },
    });

    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.cleanup();
      controllerRef.current = null;
    };
  }, [language, playmate]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateConfig({
        language,
        playmate,
        fullSentenceMode,
        currentStateGetter: getCompactGameState,
      });
    }
  }, [language, playmate, fullSentenceMode, getCompactGameState]);

  const handleManualCommand = (cmdText: string) => {
    if (controllerRef.current) {
      controllerRef.current.handleProcessSpokenUtterance(cmdText);
    }
  };

  const handleRequestHelp = () => {
    handleManualCommand('Was soll ich machen?');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <button
          onClick={() => {
            playChime('click');
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs text-sm font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'de' ? 'Zurück zu allen Spielen' : 'Back to Games'}</span>
        </button>

        {/* Speedometer & Position */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900 text-white font-mono text-xs font-black shadow-xs">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>{speedKmh} km/h</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
            <Flag className="w-4 h-4" />
            <span>P{position} {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}</span>
          </div>
        </div>
      </div>

      {/* Victory Overlay */}
      {hasWonRace && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center animate-fade-in p-4">
          <div className="bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 text-white p-8 rounded-3xl shadow-2xl border-4 border-white text-center max-w-md animate-bounce-subtle">
            <span className="text-6xl sm:text-7xl block mb-2">🏎️🏆🏁</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">P1 SIEG!</h2>
            <p className="text-lg font-bold text-amber-100 mb-4">
              {language === 'de' ? 'Jedidiah gewinnt den Großen Preis!' : 'Jedidiah wins the Grand Prix!'}
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-amber-950 font-black text-sm shadow-md">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>+3 ⭐ {language === 'de' ? 'Sterne verdient!' : 'Stars earned!'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Speech Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-indigo-200 shadow-lg mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 border-2 border-white">
          {playmate.name.charAt(0)}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {playmate.name} ({language === 'de' ? 'Dein Renningenieur' : 'Your Race Engineer'})
            </span>
          </div>

          <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            "{avatarSpeech}"
          </p>
        </div>
      </div>

      {/* 2D GRAND PRIX RACING TRACK CANVAS */}
      <div className="relative w-full h-[380px] sm:h-[450px] rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-slate-900 select-none">
        {/* Asphalt Road & Curb Stones */}
        <div className="absolute inset-x-8 sm:inset-x-16 inset-y-0 bg-slate-800 border-x-4 border-dashed border-white/40 flex justify-between">
          {/* Left Curbs (Red-White) */}
          <div className="w-3 bg-repeating-linear-gradient(0deg, #ef4444 0px, #ef4444 20px, #ffffff 20px, #ffffff 40px)" />
          {/* Lane Center Line */}
          <div className="w-1 h-full border-r-2 border-dashed border-amber-400 opacity-60" />
          {/* Right Curbs */}
          <div className="w-3 bg-repeating-linear-gradient(0deg, #ef4444 0px, #ef4444 20px, #ffffff 20px, #ffffff 40px)" />
        </div>

        {/* Rival Opponent Red Car Ahead */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 z-20 flex flex-col items-center"
          style={{
            left: position === 1 ? '85%' : '50%',
            top: position === 1 ? '15%' : '35%',
          }}
        >
          <div className="w-14 h-22 rounded-2xl bg-red-600 border-3 border-white shadow-xl flex items-center justify-center text-xl font-black text-white relative">
            🏎️
            <span className="absolute -top-5 text-[10px] font-black bg-black/60 text-white px-2 py-0.5 rounded-full">
              P2 (Rival)
            </span>
          </div>
        </div>

        {/* Player's Formula 1 Race Car (Jedidiah) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-30 flex flex-col items-center"
          style={{
            left: playerLane === 'left' ? '30%' : playerLane === 'right' ? '70%' : '50%',
            top: position === 1 ? '20%' : '75%',
          }}
        >
          <div className="w-16 h-24 rounded-2xl bg-indigo-600 border-3 border-amber-300 shadow-2xl flex items-center justify-center text-2xl font-black text-white relative animate-pulse-slow">
            🏎️
            <div className="absolute -bottom-4 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
              JD (Jedidiah)
            </div>
          </div>
        </div>

        {/* Status Chip */}
        <div className="absolute top-3 right-4 z-30 pointer-events-none">
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-amber-400 font-black text-xs border border-white/20 shadow-xs">
            {lastActionText}
          </div>
        </div>
      </div>

      {/* UNIFIED PERSISTENT MICROPHONE CONTROL BAR (Bottom Centre) */}
      <VoiceGameControlBar
        language={language}
        gameKind="racing"
        state={voiceMachineState}
        liveTranscript={liveTranscript}
        lastActionText={lastActionText}
        fullSentenceMode={fullSentenceMode}
        pendingClarification={pendingClarification}
        onToggleFullSentenceMode={(enabled) => setFullSentenceMode(enabled)}
        onToggleMic={() => {
          if (controllerRef.current) {
            if (voiceMachineState === 'idle') {
              controllerRef.current.start();
            } else {
              controllerRef.current.stop();
            }
          }
        }}
        onStartPushToTalk={() => controllerRef.current?.start('push_to_talk')}
        onStopPushToTalk={() => controllerRef.current?.stop()}
        onUndoOrCorrection={() => controllerRef.current?.triggerUndoOrCorrection()}
        onConfirmClarification={() => controllerRef.current?.confirmClarification()}
        onRejectClarification={() => controllerRef.current?.rejectClarification()}
        onOpenCalibrationModal={() => setIsCalibrating(true)}
        onRequestHelp={handleRequestHelp}
        onManualTriggerCommand={handleManualCommand}
        quickSuggestions={[
          language === 'de' ? 'Brems vor der Kurve und beschleunige danach' : 'Brake before turn and accelerate after',
          language === 'de' ? 'Überhole das rote Auto' : 'Overtake the red car',
          language === 'de' ? 'Gib Vollgas auf der Geraden!' : 'Full throttle on straight!',
          language === 'de' ? 'Lenk nach links' : 'Steer left',
          language === 'de' ? 'Fahr in die Box' : 'Pit stop now',
        ]}
      />

      {/* Microphone Calibration & Test Modal */}
      <MicrophoneCalibrationModal
        isOpen={isCalibrating}
        onClose={() => setIsCalibrating(false)}
        language={language}
        voiceEngine={voiceEngineRef.current || undefined}
      />
    </div>
  );
};
