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
  Trophy,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PlayerPos {
  id: string;
  name: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  color: string;
  role: 'striker' | 'winger' | 'midfielder' | 'gk' | 'defender';
}

interface VoiceFootballGameProps {
  language: Language;
  playmate: Playmate;
  voiceEngineRef: React.MutableRefObject<VoiceEngine | null>;
  onBack: () => void;
  onRewardStars: (count: number, reason: string) => void;
}

export const VoiceFootballGame: React.FC<VoiceFootballGameProps> = ({
  language,
  playmate,
  voiceEngineRef,
  onBack,
  onRewardStars,
}) => {
  // Game mode & score state
  const [fullSentenceMode, setFullSentenceMode] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [goalsScored, setGoalsScored] = useState<number>(0);
  const [passesCompleted, setPassesCompleted] = useState<number>(0);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [pendingClarification, setPendingClarification] = useState<GameAction | null>(null);

  // Field & Ball State
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 70 });
  const [ballHolder, setBallHolder] = useState<string>('ben');
  const [previousBallHolder, setPreviousBallHolder] = useState<string>('ben');
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [lastActionText, setLastActionText] = useState<string>('Bereit für den Anstoß!');
  const [celebratingGoal, setCelebratingGoal] = useState<boolean>(false);

  // Standardized Voice Controller State Machine
  const [voiceMachineState, setVoiceMachineState] = useState<VoiceGameMachineState>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // Avatar Speech State
  const [avatarSpeech, setAvatarSpeech] = useState<string>(
    language === 'de'
      ? `Hey JD! Ben hat den Ball. Wohin wollen wir spielen?`
      : `Hey JD! Ben has the ball. Where should we pass or run?`
  );

  // Teammates & Positions
  const [players, setPlayers] = useState<PlayerPos[]>([
    { id: 'ben', name: 'Ben', x: 50, y: 70, color: '#3b82f6', role: 'midfielder' },
    { id: 'leo', name: 'Leo', x: 25, y: 45, color: '#10b981', role: 'winger' },
    { id: 'mia', name: 'Mia', x: 75, y: 45, color: '#ec4899', role: 'winger' },
    { id: 'jd', name: 'JD (Jedidiah)', x: 50, y: 35, color: '#f59e0b', role: 'striker' },
  ]);

  // Opponents
  const opponents = [
    { id: 'def1', name: 'Verteidiger', x: 35, y: 30 },
    { id: 'def2', name: 'Verteidiger', x: 65, y: 30 },
    { id: 'gk', name: 'Torwart', x: 50, y: 10 },
  ];

  // Helper: Produce Compact Game State Payload
  const getCompactGameState = useCallback((): CompactGameState => {
    const currentHolder = players.find((p) => p.id === ballHolder) || players[0];
    const isNearGoal = currentHolder.y <= 45;

    return {
      gameKind: 'football',
      ballHolder: currentHolder.name,
      scoreOrPoints: `${goalsScored} Tore`,
      summaryDe: `Ball bei ${currentHolder.name}. Mia steht rechts frei, Leo ist links gedeckt. ${
        isNearGoal ? 'Wir sind in Schussweite vor dem Tor!' : 'Wir bauen den Angriff auf.'
      }`,
      summaryEn: `Ball with ${currentHolder.name}. Mia is open on right, Leo is marked. ${
        isNearGoal ? 'In shooting range of goal!' : 'Building the attack.'
      }`,
      optionsDe: [
        'Pass zu Mia',
        'Pass zu Leo',
        'Spiel den Ball zu Ben',
        'Lauf in den Strafraum',
        'Flanke in die Mitte',
        'Schieß aufs Tor!',
      ],
      optionsEn: [
        'Pass to Mia',
        'Pass to Leo',
        'Pass to Ben',
        'Run into the box',
        'Cross into middle',
        'Shoot at goal!',
      ],
    };
  }, [players, ballHolder, goalsScored]);

  // Ref to the shared controller instance
  const controllerRef = useRef<VoiceGameController | null>(null);

  // SPEAK HELPER IN PLAYMATE CHARACTER
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

  // ACTION EXECUTION HANDLER
  const handleActionExecute = async (action: GameAction, isLast: boolean) => {
    setIsMoving(true);

    if (action.type.startsWith('PASS')) {
      let targetPlayer: PlayerPos | undefined;
      if (action.target) {
        targetPlayer = players.find((p) => p.id === action.target);
      } else if (action.direction === 'left') {
        targetPlayer = players.find((p) => p.id === 'leo');
      } else if (action.direction === 'right') {
        targetPlayer = players.find((p) => p.id === 'mia');
      } else if (action.direction === 'forward') {
        targetPlayer = players.find((p) => p.id === 'jd');
      } else if (action.direction === 'back') {
        targetPlayer = players.find((p) => p.id === 'ben');
      }

      if (!targetPlayer) {
        targetPlayer = players.find((p) => p.id !== ballHolder) || players[0];
      }

      setPreviousBallHolder(ballHolder);
      playChime('pass');
      setBallPos({ x: targetPlayer.x, y: targetPlayer.y });
      setBallHolder(targetPlayer.id);
      setPassesCompleted((prev) => prev + 1);
      setLastActionText(
        language === 'de'
          ? `⚽ Pass zu ${targetPlayer.name} ausgeführt!`
          : `⚽ Pass to ${targetPlayer.name}!`
      );

      if (isLast) {
        speakInCharacter(
          language === 'de'
            ? `Perfekter Pass zu ${targetPlayer.name}! Wir stehen frei vor dem Tor. Was machen wir jetzt?`
            : `Great pass to ${targetPlayer.name}! We're open in front of goal. What's next?`
        );
      }

      // Check level progression after 3 passes
      if ((passesCompleted + 1) % 3 === 0 && level < 5) {
        setLevel((prev) => prev + 1);
        playChime('unlock_fanfare');
        onRewardStars(2, 'Taktik-Aufstieg im Fußball!');
      }
    } else if (action.type === 'SHOOT') {
      playChime('pass');
      setLastActionText(language === 'de' ? '🚀 TORSCHUSS!' : '🚀 SHOT ON GOAL!');
      setBallPos({ x: 50, y: 7 });

      await new Promise((r) => setTimeout(r, 600));

      setCelebratingGoal(true);
      playChime('goal_scored');
      setGoalsScored((prev) => prev + 1);
      setScore((prev) => prev + 100);
      onRewardStars(3, 'Traumtor geschossen!');

      const goalPraise =
        language === 'de'
          ? 'TOOOOOOR! Was für ein Schuss, JD! Direkt in den Winkel!'
          : 'GOOOAL! What a strike, JD! Right in the top corner!';
      speakInCharacter(goalPraise);

      setTimeout(() => {
        setCelebratingGoal(false);
        setBallPos({ x: 50, y: 70 });
        setBallHolder('ben');
      }, 3000);
    } else if (action.type === 'RUN_FORWARD' || action.type === 'ENTER_BOX') {
      playChime('step');
      setLastActionText(language === 'de' ? '🏃 Vorstoß in den Strafraum' : '🏃 Run into the box');

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === ballHolder) {
            const newY = Math.max(25, p.y - 18);
            const newX = action.direction === 'left' ? Math.max(15, p.x - 15) : action.direction === 'right' ? Math.min(85, p.x + 15) : p.x;
            setBallPos({ x: newX, y: newY });
            return { ...p, x: newX, y: newY };
          }
          return p;
        })
      );

      if (isLast) {
        speakInCharacter(
          language === 'de'
            ? 'Super Vorstoß in den Strafraum! Freie Schussbahn — schießen oder abspielen?'
            : 'Great run into the box! Clear shot on goal — shoot or pass?'
        );
      }
    } else if (action.type === 'CROSS') {
      playChime('pass');
      setLastActionText(language === 'de' ? '🎯 Flanke in den Strafraum!' : '🎯 Cross into the box!');
      const jdPlayer = players.find((p) => p.id === 'jd')!;
      setBallPos({ x: jdPlayer.x, y: jdPlayer.y });
      setBallHolder('jd');

      if (isLast) {
        speakInCharacter(
          language === 'de'
            ? 'Perfekte Flanke genau auf JD! Jetzt abziehen und aufs Tor schießen!'
            : 'Perfect cross right to JD! Shoot at the goal now!'
        );
      }
    } else if (action.type === 'DEFEND') {
      playChime('whistle');
      setLastActionText(language === 'de' ? '🛡️ Perfektes Abwehrtackling!' : '🛡️ Defensive tackle!');
      speakInCharacter(
        language === 'de'
          ? 'Ball zurückerobert! Jetzt schnell umschalten zum Angriff!'
          : 'Ball won back! Now switch to the attack!'
      );
    }

    setTimeout(() => {
      setIsMoving(false);
    }, 500);
  };

  // Undo handler
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

  // INITIALIZE CONTROLLER ONCE & UPDATE DYNAMIC REFS
  useEffect(() => {
    if (!voiceEngineRef.current) return;

    const controller = new VoiceGameController({
      voiceEngine: voiceEngineRef.current,
      gameKind: 'football',
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
        onError: (err) => console.warn('Football controller error:', err),
      },
    });

    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.cleanup();
      controllerRef.current = null;
    };
  }, [language, playmate]);

  // Update dynamic dependencies inside controller without tearing down mic listener
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
      {/* Header & Controls */}
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

        {/* Level Indicator Pill */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs sm:text-sm shadow-2xs">
          <Trophy className="w-4 h-4 text-emerald-600" />
          <span>
            {language === 'de' ? `Level ${level}: Fußball-Arena` : `Level ${level}: Football Arena`}
          </span>
        </div>

        {/* Goals & Score Stats */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-xs">
          <span>⚽ {goalsScored} {language === 'de' ? 'Tore' : 'Goals'}</span>
          <span className="text-slate-500">•</span>
          <span>👟 {passesCompleted} {language === 'de' ? 'Pässe' : 'Passes'}</span>
        </div>
      </div>

      {/* Goal Celebration Overlay */}
      {celebratingGoal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center animate-fade-in p-4">
          <div className="bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 text-white p-8 rounded-3xl shadow-2xl border-4 border-white text-center max-w-md animate-bounce-subtle">
            <span className="text-6xl sm:text-7xl block mb-2 animate-spin-slow">⚽🏆</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
              {language === 'de' ? 'TOOOOOOR!' : 'GOOOOOAL!'}
            </h2>
            <p className="text-lg font-bold text-amber-100 mb-4">
              {language === 'de' ? 'Spektakulärer Treffer von Jedidiah!' : 'Spectacular goal by Jedidiah!'}
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-amber-900 font-black text-sm shadow-md">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>+3 ⭐ {language === 'de' ? 'Sterne verdient!' : 'Stars earned!'}</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP AVATAR CONVERSATION & PROMPT BAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-indigo-200 shadow-lg mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 border-2 border-white">
          {playmate.name.charAt(0)}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {playmate.name} ({language === 'de' ? 'Dein Mitspieler' : 'Your Teammate'})
            </span>
          </div>

          <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            "{avatarSpeech}"
          </p>
        </div>
      </div>

      {/* 2D FOOTBALL PITCH CANVAS */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border-4 border-emerald-700 shadow-2xl bg-emerald-600 select-none">
        {/* Grass Pattern Stripes */}
        <div className="absolute inset-0 flex flex-col opacity-25 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-emerald-700' : 'bg-emerald-500'}`} />
          ))}
        </div>

        {/* Field Markings */}
        <div className="absolute inset-4 border-2 border-white/80 rounded-2xl pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white/80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />

          {/* Goal Area (Top) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b-2 border-l-2 border-r-2 border-white/80" />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 h-6 border-b-2 border-l-2 border-r-2 border-amber-300 bg-white/30 rounded-b-md" />
        </div>

        {/* Opponent GK & Defenders */}
        {opponents.map((opp) => (
          <div
            key={opp.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-700"
            style={{ left: `${opp.x}%`, top: `${opp.y}%` }}
          >
            <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-white text-white font-black text-xs flex items-center justify-center shadow-lg">
              🛡️
            </div>
            <span className="text-[10px] font-black text-white drop-shadow-md bg-black/40 px-1.5 py-0.5 rounded-full mt-0.5">
              {opp.name}
            </span>
          </div>
        ))}

        {/* Teammates (Ben, Leo, Mia, JD) */}
        {players.map((player) => {
          const hasBall = ballHolder === player.id;
          return (
            <div
              key={player.id}
              onClick={() => handleManualCommand(`pass to ${player.name}`)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-700 z-20 ${
                hasBall ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
            >
              {hasBall && (
                <div className="absolute -top-6 bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow-md whitespace-nowrap">
                  ⚽ {language === 'de' ? 'Am Ball' : 'Has Ball'}
                </div>
              )}
              <div
                className="w-11 h-11 rounded-full border-3 border-white text-white font-black text-xs flex items-center justify-center shadow-xl transition-all"
                style={{ backgroundColor: player.color }}
              >
                {player.name.charAt(0)}
              </div>
              <span className="text-[11px] font-black text-white drop-shadow-md bg-slate-900/80 px-2 py-0.5 rounded-full mt-1">
                {player.name}
              </span>
            </div>
          );
        })}

        {/* Animated Football */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-2 border-slate-900 shadow-2xl flex items-center justify-center text-sm z-30 transition-all duration-500 ease-out"
          style={{
            left: `${ballPos.x}%`,
            top: `${ballPos.y}%`,
            transform: `translate(-50%, -50%) ${isMoving ? 'rotate(360deg) scale(1.15)' : 'scale(1)'}`,
          }}
        >
          ⚽
        </div>

        {/* Action Status Banner */}
        <div className="absolute top-3 right-4 z-30 pointer-events-none">
          <div className="bg-emerald-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-emerald-300 font-extrabold text-xs border border-emerald-400/40 shadow-xs">
            {lastActionText}
          </div>
        </div>
      </div>

      {/* UNIFIED PERSISTENT MICROPHONE CONTROL BAR (Bottom Centre) */}
      <VoiceGameControlBar
        language={language}
        gameKind="football"
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
          language === 'de' ? 'Spiel zu Mia' : 'Pass to Mia',
          language === 'de' ? 'Pass nach links' : 'Pass left',
          language === 'de' ? 'Lauf in den Strafraum' : 'Run into box',
          language === 'de' ? 'Schieß aufs Tor!' : 'Shoot at goal!',
          language === 'de' ? 'Flanke in die Mitte' : 'Cross in center',
          language === 'de' ? 'Pass zu Ben und lauf nach vorne' : 'Pass to Ben and run forward',
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
