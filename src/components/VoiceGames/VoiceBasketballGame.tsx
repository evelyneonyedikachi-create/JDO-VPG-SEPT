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
  Timer,
  Zap,
} from 'lucide-react';

interface PlayerPos {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

interface VoiceBasketballGameProps {
  language: Language;
  playmate: Playmate;
  voiceEngineRef: React.MutableRefObject<VoiceEngine | null>;
  onBack: () => void;
  onRewardStars: (count: number, reason: string) => void;
}

export const VoiceBasketballGame: React.FC<VoiceBasketballGameProps> = ({
  language,
  playmate,
  voiceEngineRef,
  onBack,
  onRewardStars,
}) => {
  const [fullSentenceMode, setFullSentenceMode] = useState<boolean>(false);
  const [basketsScored, setBasketsScored] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [shotClock, setShotClock] = useState<number>(14);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [pendingClarification, setPendingClarification] = useState<GameAction | null>(null);

  // Ball & Player Positions (0 - 100%)
  const [ballHolder, setBallHolder] = useState<string>('mia');
  const [previousBallHolder, setPreviousBallHolder] = useState<string>('mia');
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 30, y: 65 });
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [celebratingBasket, setCelebratingBasket] = useState<boolean>(false);
  const [lastActionText, setLastActionText] = useState<string>('Aufbauspiel im Gang');

  // Standard Voice State Machine
  const [voiceMachineState, setVoiceMachineState] = useState<VoiceGameMachineState>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // Avatar Speech State
  const [avatarSpeech, setAvatarSpeech] = useState<string>(
    language === 'de'
      ? `Hey JD! Mia hat den Ball. Leo steht auf dem rechten Flügel frei. Was ist der Spielzug?`
      : `Hey JD! Mia has the ball. Leo is open on the right wing. What's the play?`
  );

  // Players
  const [players, setPlayers] = useState<PlayerPos[]>([
    { id: 'mia', name: 'Mia', x: 30, y: 65, color: '#ec4899' },
    { id: 'leo', name: 'Leo', x: 70, y: 65, color: '#10b981' },
    { id: 'ben', name: 'Ben', x: 50, y: 40, color: '#3b82f6' },
    { id: 'jd', name: 'JD (Jedidiah)', x: 50, y: 78, color: '#f59e0b' },
  ]);

  const hoopPos = { x: 50, y: 15 };

  // Shot clock countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setShotClock((prev) => (prev > 1 ? prev - 1 : 14));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compact Game State Payload
  const getCompactGameState = useCallback((): CompactGameState => {
    const currentHolder = players.find((p) => p.id === ballHolder) || players[0];

    return {
      gameKind: 'basketball',
      ballHolder: currentHolder.name,
      scoreOrPoints: `${points} Punkte`,
      urgencyOrClock: `${shotClock}s Wurfuhr`,
      summaryDe: `${currentHolder.name} hat den Ball. Noch ${shotClock} Sekunden auf der Wurfuhr. Ben steht unter dem Korb, Leo auf dem Flügel.`,
      summaryEn: `${currentHolder.name} has the ball. ${shotClock}s on the shot clock. Ben is open under the hoop, Leo on the wing.`,
      optionsDe: [
        'Pass zu Leo',
        'Pass zu Ben',
        'Dribbel nach rechts',
        'Zum Korb ziehen',
        'Dreipunktewurf',
        'Wirf den Ball!',
      ],
      optionsEn: [
        'Pass to Leo',
        'Pass to Ben',
        'Dribble right',
        'Drive to the basket',
        'Three-pointer',
        'Shoot the ball!',
      ],
    };
  }, [players, ballHolder, points, shotClock]);

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
    if (action.type.startsWith('PASS')) {
      let targetPlayer: PlayerPos | undefined;
      if (action.target) {
        targetPlayer = players.find((p) => p.id === action.target);
      } else if (action.direction === 'left') {
        targetPlayer = players.find((p) => p.id === 'mia');
      } else if (action.direction === 'right') {
        targetPlayer = players.find((p) => p.id === 'leo');
      } else if (action.direction === 'back') {
        targetPlayer = players.find((p) => p.id === 'jd');
      }

      if (!targetPlayer) {
        targetPlayer = players.find((p) => p.id !== ballHolder) || players[1];
      }

      setPreviousBallHolder(ballHolder);
      playChime('pass');
      setBallPos({ x: targetPlayer.x, y: targetPlayer.y });
      setBallHolder(targetPlayer.id);
      setLastActionText(
        language === 'de' ? `🏀 Traumpass zu ${targetPlayer.name}!` : `🏀 Great pass to ${targetPlayer.name}!`
      );

      if (isLast) {
        speakInCharacter(
          language === 'de'
            ? `Super Anspiel zu ${targetPlayer.name}! Die Abwehr ist überrascht. Werfen oder zum Korb ziehen?`
            : `Awesome pass to ${targetPlayer.name}! Defense is caught off guard. Shoot or drive?`
        );
      }
    } else if (action.type === 'SHOOT' || action.type === 'THREE_POINTER') {
      const is3pt = action.type === 'THREE_POINTER';
      setIsShooting(true);
      playChime('pass');
      setLastActionText(
        is3pt
          ? language === 'de'
            ? '🎯 3-PUNKTE-TREFFER!'
            : '🎯 3-POINT HIT!'
          : language === 'de'
          ? '🏀 Wurf auf den Korb!'
          : '🏀 Shot on the hoop!'
      );

      setBallPos({ x: hoopPos.x, y: hoopPos.y });

      await new Promise((r) => setTimeout(r, 600));

      setIsShooting(false);
      setCelebratingBasket(true);
      playChime('basket_score');

      const addedPts = is3pt ? 3 : 2;
      setPoints((prev) => prev + addedPts);
      setBasketsScored((prev) => prev + 1);
      setShotClock(14);
      onRewardStars(2, `${addedPts}-Punkte Treffer!`);

      const cheer = is3pt
        ? language === 'de'
          ? 'UNGLAUBLICH! Aus der Distanz versenkt! 3 Punkte für uns!'
          : 'UNBELIEVABLE! From downtown! 3 points for the team!'
        : language === 'de'
        ? 'SWISH! Perfekter Korbwurf! Sauberer Treffer, JD!'
        : 'SWISH! Perfect basket, clean shot JD!';
      speakInCharacter(cheer);

      setTimeout(() => {
        setCelebratingBasket(false);
        setBallPos({ x: 30, y: 65 });
        setBallHolder('mia');
      }, 2500);
    } else if (action.type === 'DRIVE_TO_BASKET' || action.type === 'DRIVE_BASKET') {
      playChime('step');
      setLastActionText(language === 'de' ? '⚡ Durchmarsch zum Korb (Layup)!' : '⚡ Fast drive to hoop!');

      setPlayers((prev) =>
        prev.map((p) => (p.id === ballHolder ? { ...p, x: 50, y: 25 } : p))
      );
      setBallPos({ x: 50, y: 25 });

      await new Promise((r) => setTimeout(r, 500));

      playChime('basket_score');
      setPoints((prev) => prev + 2);
      setBasketsScored((prev) => prev + 1);
      setShotClock(14);
      onRewardStars(2, 'Korbleger verwandelt!');

      speakInCharacter(
        language === 'de'
          ? 'Sensationeller Korbleger mit Vollspeed! 2 Punkte gutgeschrieben!'
          : 'Sensational full-speed layup! 2 points on the board!'
      );

      setTimeout(() => {
        setBallPos({ x: 70, y: 65 });
        setBallHolder('leo');
      }, 2000);
    } else if (action.type === 'DRIBBLE_LEFT' || action.type === 'DRIBBLE_RIGHT' || action.type === 'MOVE_FORWARD') {
      playChime('step');
      setLastActionText(
        language === 'de'
          ? `🏀 Dribbel nach ${action.direction === 'left' ? 'links' : action.direction === 'right' ? 'rechts' : 'vorne'}`
          : `🏀 Dribble ${action.direction || 'forward'}`
      );

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === ballHolder) {
            const newX = action.direction === 'left' ? Math.max(20, p.x - 20) : action.direction === 'right' ? Math.min(80, p.x + 20) : p.x;
            const newY = Math.max(30, p.y - 15);
            setBallPos({ x: newX, y: newY });
            return { ...p, x: newX, y: newY };
          }
          return p;
        })
      );

      if (isLast) {
        speakInCharacter(
          language === 'de'
            ? 'Guter Raumgewinn beim Dribbling! Jetzt haben wir freien Blick auf den Korb!'
            : 'Good space created off the dribble! Clear view of the hoop now!'
        );
      }
    } else if (action.type === 'DEFEND' || action.type === 'BLOCK') {
      playChime('whistle');
      setLastActionText(language === 'de' ? '🛡️ Monster-Block in der Defense!' : '🛡️ Monster block on defense!');
      speakInCharacter(
        language === 'de'
          ? 'NOT IN MY HOUSE! Riesenblock von JD! Der Ball gehört wieder uns!'
          : 'NOT IN MY HOUSE! Huge block by JD! Ball is ours again!'
      );
    }
  };

  // Undo Handler
  const handleUndoMove = () => {
    const prevPlayer = players.find((p) => p.id === previousBallHolder) || players[0];
    setBallHolder(prevPlayer.id);
    setBallPos({ x: prevPlayer.x, y: prevPlayer.y });
    playChime('score');
    setLastActionText(
      language === 'de'
        ? `↩️ Zug rückgängig gemacht: Ball bei ${prevPlayer.name}`
        : `↩️ Move undone: Ball with ${prevPlayer.name}`
    );
  };

  // INITIALIZE CONTROLLER
  useEffect(() => {
    if (!voiceEngineRef.current) return;

    const controller = new VoiceGameController({
      voiceEngine: voiceEngineRef.current,
      gameKind: 'basketball',
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
        onError: (err) => console.warn('Basketball controller error:', err),
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
      {/* Top Header */}
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

        {/* Score & Shot Clock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-xs">
            <span>🏀 {points} {language === 'de' ? 'Punkte' : 'Points'}</span>
            <span className="text-slate-500">•</span>
            <span>🎯 {basketsScored} {language === 'de' ? 'Treffer' : 'Baskets'}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-mono text-xs font-black border ${
              shotClock <= 5
                ? 'bg-red-500 text-white border-red-400 animate-pulse'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{shotClock}s</span>
          </div>
        </div>
      </div>

      {/* Basket Celebration Overlay */}
      {celebratingBasket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center animate-fade-in p-4">
          <div className="bg-gradient-to-b from-orange-500 via-amber-500 to-yellow-500 text-white p-8 rounded-3xl shadow-2xl border-4 border-white text-center max-w-md animate-bounce-subtle">
            <span className="text-6xl sm:text-7xl block mb-2 animate-spin-slow">🏀🔥</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">SWISH!</h2>
            <p className="text-lg font-bold text-amber-100 mb-4">
              {language === 'de' ? 'Perfekter Korbwurf!' : 'Perfect basket hit!'}
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-amber-900 font-black text-sm shadow-md">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>+2 ⭐ {language === 'de' ? 'Sterne verdient!' : 'Stars earned!'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Speech Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-orange-200 shadow-lg mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 border-2 border-white">
          {playmate.name.charAt(0)}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-xs font-black uppercase text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full">
              {playmate.name} ({language === 'de' ? 'Basketball-Coach' : 'Basketball Coach'})
            </span>
          </div>

          <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            "{avatarSpeech}"
          </p>
        </div>
      </div>

      {/* 2D HARDWOOD BASKETBALL COURT CANVAS */}
      <div className="relative w-full h-[380px] sm:h-[460px] rounded-3xl overflow-hidden border-4 border-amber-900 shadow-2xl bg-[#c28448] select-none">
        {/* Court Wood Planks Texture Lines */}
        <div className="absolute inset-0 flex flex-col opacity-15 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-amber-950' : 'bg-amber-800'}`} />
          ))}
        </div>

        {/* Court Markings */}
        <div className="absolute inset-4 border-2 border-white/80 rounded-2xl pointer-events-none">
          {/* Key Area & Free Throw Circle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-40 border-b-2 border-l-2 border-r-2 border-white/80 bg-red-700/20" />
          <div className="absolute top-36 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-2 border-white/80" />

          {/* 3-Point Arc */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[340px] sm:w-[420px] h-[280px] sm:h-[320px] rounded-b-full border-2 border-white/80" />

          {/* Basketball Hoop */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-20 h-2 bg-white rounded-t-sm shadow-md" />
            <div className="w-10 h-10 rounded-full border-4 border-orange-500 bg-orange-400/20 shadow-lg flex items-center justify-center text-xs">
              🕸️
            </div>
          </div>
        </div>

        {/* Teammates on Court */}
        {players.map((p) => {
          const hasBall = ballHolder === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handleManualCommand(`pass to ${p.name}`)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-700 z-20 ${
                hasBall ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {hasBall && (
                <div className="absolute -top-6 bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow-md whitespace-nowrap">
                  🏀 {language === 'de' ? 'Ballbesitz' : 'Has Ball'}
                </div>
              )}
              <div
                className="w-11 h-11 rounded-full border-3 border-white text-white font-black text-xs flex items-center justify-center shadow-xl transition-all"
                style={{ backgroundColor: p.color }}
              >
                {p.name.charAt(0)}
              </div>
              <span className="text-[11px] font-black text-white drop-shadow-md bg-slate-900/80 px-2 py-0.5 rounded-full mt-1">
                {p.name}
              </span>
            </div>
          );
        })}

        {/* Animated Basketball */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-orange-500 border-2 border-black shadow-2xl flex items-center justify-center text-xs z-30 transition-all duration-500 ease-out"
          style={{
            left: `${ballPos.x}%`,
            top: `${ballPos.y}%`,
            transform: `translate(-50%, -50%) ${isShooting ? 'scale(1.3) rotate(360deg)' : 'scale(1)'}`,
          }}
        >
          🏀
        </div>

        {/* Status Chip */}
        <div className="absolute top-3 right-4 z-30 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-amber-300 font-extrabold text-xs border border-white/20 shadow-xs">
            {lastActionText}
          </div>
        </div>
      </div>

      {/* UNIFIED PERSISTENT MICROPHONE CONTROL BAR (Bottom Centre) */}
      <VoiceGameControlBar
        language={language}
        gameKind="basketball"
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
          language === 'de' ? 'Pass zu Leo' : 'Pass to Leo',
          language === 'de' ? 'Dribbel nach rechts und wirf dann' : 'Dribble right and shoot',
          language === 'de' ? 'Zum Korb ziehen' : 'Drive to the hoop',
          language === 'de' ? 'Dreipunktewurf!' : 'Three-pointer!',
          language === 'de' ? 'Wirf den Ball!' : 'Shoot the ball!',
          language === 'de' ? 'Spiel zu Ben' : 'Pass to Ben',
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
