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
  Compass,
  ArrowLeft,
  Sparkles,
  Trophy,
  Footprints,
} from 'lucide-react';

type TileType = 'path' | 'wall' | 'gem' | 'bridge' | 'tunnel' | 'goal' | 'tree' | 'water';

interface MapTile {
  r: number;
  c: number;
  type: TileType;
  collected?: boolean;
}

interface VoiceGuideMeGameProps {
  language: Language;
  playmate: Playmate;
  voiceEngineRef: React.MutableRefObject<VoiceEngine | null>;
  onBack: () => void;
  onRewardStars: (count: number, reason: string) => void;
}

export const VoiceGuideMeGame: React.FC<VoiceGuideMeGameProps> = ({
  language,
  playmate,
  voiceEngineRef,
  onBack,
  onRewardStars,
}) => {
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 6, c: 3 });
  const [prevPlayerPos, setPrevPlayerPos] = useState<{ r: number; c: number }>({ r: 6, c: 3 });
  const [playerFacing, setPlayerFacing] = useState<'up' | 'down' | 'left' | 'right'>('up');
  const [prevFacing, setPrevFacing] = useState<'up' | 'down' | 'left' | 'right'>('up');
  const [gemsCollected, setGemsCollected] = useState<number>(0);
  const [stepCountTotal, setStepCountTotal] = useState<number>(0);
  const [fullSentenceMode, setFullSentenceMode] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [lastActionText, setLastActionText] = useState<string>('Am Startpunkt bereit!');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [pendingClarification, setPendingClarification] = useState<GameAction | null>(null);

  // Standard Voice State Machine
  const [voiceMachineState, setVoiceMachineState] = useState<VoiceGameMachineState>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  const [avatarSpeech, setAvatarSpeech] = useState<string>(
    language === 'de'
      ? `Ich stehe am Start! Wohin soll ich gehen — z.B. "Gehe zwei Schritte nach vorne" oder "Dreh dich nach links"?`
      : `I'm at the start! Tell me where to go — e.g. "Move two steps forward" or "Turn left"?`
  );

  // 7x7 Map Grid
  const [grid, setGrid] = useState<MapTile[][]>(() => {
    return [
      // Row 0
      [
        { r: 0, c: 0, type: 'wall' },
        { r: 0, c: 1, type: 'wall' },
        { r: 0, c: 2, type: 'wall' },
        { r: 0, c: 3, type: 'goal' },
        { r: 0, c: 4, type: 'wall' },
        { r: 0, c: 5, type: 'wall' },
        { r: 0, c: 6, type: 'wall' },
      ],
      // Row 1
      [
        { r: 1, c: 0, type: 'wall' },
        { r: 1, c: 1, type: 'gem' },
        { r: 1, c: 2, type: 'path' },
        { r: 1, c: 3, type: 'path' },
        { r: 1, c: 4, type: 'path' },
        { r: 1, c: 5, type: 'gem' },
        { r: 1, c: 6, type: 'wall' },
      ],
      // Row 2 (Bridge on left, Tunnel on right)
      [
        { r: 2, c: 0, type: 'wall' },
        { r: 2, c: 1, type: 'bridge' },
        { r: 2, c: 2, type: 'water' },
        { r: 2, c: 3, type: 'wall' },
        { r: 2, c: 4, type: 'water' },
        { r: 2, c: 5, type: 'tunnel' },
        { r: 2, c: 6, type: 'wall' },
      ],
      // Row 3
      [
        { r: 3, c: 0, type: 'wall' },
        { r: 3, c: 1, type: 'path' },
        { r: 3, c: 2, type: 'path' },
        { r: 3, c: 3, type: 'gem' },
        { r: 3, c: 4, type: 'path' },
        { r: 3, c: 5, type: 'path' },
        { r: 3, c: 6, type: 'wall' },
      ],
      // Row 4
      [
        { r: 4, c: 0, type: 'wall' },
        { r: 4, c: 1, type: 'wall' },
        { r: 4, c: 2, type: 'path' },
        { r: 4, c: 3, type: 'path' },
        { r: 4, c: 4, type: 'path' },
        { r: 4, c: 5, type: 'wall' },
        { r: 4, c: 6, type: 'wall' },
      ],
      // Row 5
      [
        { r: 5, c: 0, type: 'wall' },
        { r: 5, c: 1, type: 'gem' },
        { r: 5, c: 2, type: 'path' },
        { r: 5, c: 3, type: 'path' },
        { r: 5, c: 4, type: 'path' },
        { r: 5, c: 5, type: 'gem' },
        { r: 5, c: 6, type: 'wall' },
      ],
      // Row 6 (Start at 6,3)
      [
        { r: 6, c: 0, type: 'wall' },
        { r: 6, c: 1, type: 'wall' },
        { r: 6, c: 2, type: 'wall' },
        { r: 6, c: 3, type: 'path' },
        { r: 6, c: 4, type: 'wall' },
        { r: 6, c: 5, type: 'wall' },
        { r: 6, c: 6, type: 'wall' },
      ],
    ];
  });

  const getCompactGameState = useCallback((): CompactGameState => {
    return {
      gameKind: 'guide_me',
      scoreOrPoints: `${gemsCollected} Edelsteine`,
      summaryDe: `Avatar steht auf Position (${playerPos.r}, ${playerPos.c}) mit Blick nach ${
        playerFacing === 'up' ? 'vorne/Norden' : playerFacing === 'down' ? 'hinten/Süden' : playerFacing === 'left' ? 'links/Westen' : 'rechts/Osten'
      }.`,
      summaryEn: `Avatar at (${playerPos.r}, ${playerPos.c}) facing ${playerFacing}.`,
      optionsDe: [
        'Gehe zwei Schritte nach vorne',
        'Dreh dich nach links',
        'Dreh dich nach rechts',
        'Gehe einen Schritt zurück',
        'Geh über die Brücke',
        'Geh zur roten Tür',
      ],
      optionsEn: [
        'Move two steps forward',
        'Turn left',
        'Turn right',
        'Step back',
        'Cross the bridge',
        'Go to the red door',
      ],
    };
  }, [playerPos, playerFacing, gemsCollected]);

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
    if (action.type === 'TURN_LEFT') {
      playChime('step');
      setPrevFacing(playerFacing);
      const turns: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        up: 'left',
        left: 'down',
        down: 'right',
        right: 'up',
      };
      const nextFacing = turns[playerFacing] || 'left';
      setPlayerFacing(nextFacing);
      setLastActionText(language === 'de' ? '🧭 Nach links gedreht' : '🧭 Turned left');
      if (isLast) {
        speakInCharacter(
          language === 'de' ? 'Ich habe mich nach links gedreht! Wohin jetzt?' : 'Turned left! Where next?'
        );
      }
    } else if (action.type === 'TURN_RIGHT') {
      playChime('step');
      setPrevFacing(playerFacing);
      const turns: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        up: 'right',
        right: 'down',
        down: 'left',
        left: 'up',
      };
      const nextFacing = turns[playerFacing] || 'right';
      setPlayerFacing(nextFacing);
      setLastActionText(language === 'de' ? '🧭 Nach rechts gedreht' : '🧭 Turned right');
      if (isLast) {
        speakInCharacter(
          language === 'de' ? 'Ich habe mich nach rechts gedreht! Wohin jetzt?' : 'Turned right! Where next?'
        );
      }
    } else if (action.type === 'STEP_FORWARD' || action.type === 'STEP_BACK' || action.type === 'GO_TO_TARGET') {
      const steps = action.stepCount || 1;
      let currentR = playerPos.r;
      let currentC = playerPos.c;
      const isReverse = action.type === 'STEP_BACK';
      setPrevPlayerPos({ r: playerPos.r, c: playerPos.c });

      for (let s = 0; s < steps; s++) {
        let dr = 0;
        let dc = 0;

        if (playerFacing === 'up') dr = isReverse ? 1 : -1;
        else if (playerFacing === 'down') dr = isReverse ? -1 : 1;
        else if (playerFacing === 'left') dc = isReverse ? 1 : -1;
        else if (playerFacing === 'right') dc = isReverse ? -1 : 1;

        const nextR = currentR + dr;
        const nextC = currentC + dc;

        if (nextR >= 0 && nextR < 7 && nextC >= 0 && nextC < 7) {
          const targetTile = grid[nextR][nextC];
          if (targetTile.type !== 'wall' && targetTile.type !== 'water') {
            currentR = nextR;
            currentC = nextC;
            playChime('step');

            // Check gem collection
            if (targetTile.type === 'gem' && !targetTile.collected) {
              setGrid((prev) => {
                const nextGrid = prev.map((row) => [...row]);
                nextGrid[nextR][nextC] = { ...targetTile, collected: true };
                return nextGrid;
              });
              setGemsCollected((prev) => prev + 1);
              playChime('star_earned');
              onRewardStars(1, 'Edelstein im Labyrinth gefunden!');
            }

            // Check goal reaching
            if (targetTile.type === 'goal') {
              setHasWon(true);
              playChime('unlock_fanfare');
              onRewardStars(3, 'Zieltor im Labyrinth erreicht!');
              speakInCharacter(
                language === 'de'
                  ? 'JAAAA! WIR SIND AM ZIELTOR! Fantastische Navigation, JD!'
                  : 'YESSS! WE REACHED THE GOAL! Fantastic navigation, JD!'
              );
            }
          } else {
            playChime('repeat_model');
            speakInCharacter(
              language === 'de'
                ? 'Halt! Da ist eine Wand im Weg. Dreh mich in eine freie Richtung!'
                : 'Hold on! A wall is in the way. Turn me to an open direction!'
            );
            break;
          }
        }
      }

      setPlayerPos({ r: currentR, c: currentC });
      setStepCountTotal((prev) => prev + steps);
      setLastActionText(
        language === 'de' ? `🚶 ${steps} Schritt(e) gelaufen` : `🚶 Walked ${steps} step(s)`
      );

      if (isLast && !hasWon) {
        speakInCharacter(
          language === 'de'
            ? 'Schritte ausgeführt! Sag mir den nächsten Wegpunkt!'
            : 'Steps completed! Tell me the next waypoint!'
        );
      }
    }
  };

  // Undo handler
  const handleUndoMove = () => {
    setPlayerPos(prevPlayerPos);
    setPlayerFacing(prevFacing);
    playChime('score');
    setLastActionText(
      language === 'de'
        ? `↩️ Schritt rückgängig gemacht: Position (${prevPlayerPos.r}, ${prevPlayerPos.c})`
        : `↩️ Step undone: Position (${prevPlayerPos.r}, ${prevPlayerPos.c})`
    );
  };

  useEffect(() => {
    if (!voiceEngineRef.current) return;

    const controller = new VoiceGameController({
      voiceEngine: voiceEngineRef.current,
      gameKind: 'guide_me',
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
        onError: (err) => console.warn('Guide Me controller error:', err),
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

        {/* Gems & Steps Stats */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-xs">
          <span>💎 {gemsCollected} {language === 'de' ? 'Edelsteine' : 'Gems'}</span>
          <span className="text-slate-500">•</span>
          <span>👣 {stepCountTotal} {language === 'de' ? 'Schritte' : 'Steps'}</span>
        </div>
      </div>

      {/* Avatar Speech Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-emerald-200 shadow-lg mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 border-2 border-white">
          {playmate.name.charAt(0)}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {playmate.name} ({language === 'de' ? 'Dein Abenteurer' : 'Your Explorer'})
            </span>
          </div>

          <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            "{avatarSpeech}"
          </p>
        </div>
      </div>

      {/* 7x7 TILE MAP GRID CANVAS */}
      <div className="relative w-full max-w-lg mx-auto aspect-square rounded-3xl overflow-hidden border-4 border-emerald-800 shadow-2xl bg-slate-800 p-2 sm:p-3 select-none">
        <div className="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full">
          {grid.map((row, rIdx) =>
            row.map((tile, cIdx) => {
              const isPlayerHere = playerPos.r === rIdx && playerPos.c === cIdx;
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`relative rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    tile.type === 'wall'
                      ? 'bg-slate-700 border border-slate-600'
                      : tile.type === 'water'
                      ? 'bg-blue-600 border border-blue-400'
                      : tile.type === 'bridge'
                      ? 'bg-amber-800 border-2 border-amber-600'
                      : tile.type === 'tunnel'
                      ? 'bg-purple-900 border-2 border-purple-500'
                      : tile.type === 'goal'
                      ? 'bg-red-600 border-2 border-amber-300 animate-pulse'
                      : 'bg-emerald-700/60 border border-emerald-600/40'
                  }`}
                >
                  {/* Static Tile Icons */}
                  {tile.type === 'wall' && <span className="opacity-40">🌲</span>}
                  {tile.type === 'water' && <span className="opacity-70">🌊</span>}
                  {tile.type === 'bridge' && <span>🌉</span>}
                  {tile.type === 'tunnel' && <span>🚇</span>}
                  {tile.type === 'goal' && <span>🚪🏆</span>}
                  {tile.type === 'gem' && !tile.collected && <span className="animate-bounce">💎</span>}

                  {/* Player Avatar */}
                  {isPlayerHere && (
                    <div className="absolute inset-0.5 rounded-lg bg-amber-400 border-2 border-white shadow-xl flex items-center justify-center text-sm font-black z-30 animate-scale-in">
                      {playerFacing === 'up' ? '⬆️ 🧒' : playerFacing === 'down' ? '⬇️ 🧒' : playerFacing === 'left' ? '⬅️ 🧒' : '➡️ 🧒'}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* UNIFIED PERSISTENT MICROPHONE CONTROL BAR (Bottom Centre) */}
      <VoiceGameControlBar
        language={language}
        gameKind="guide_me"
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
          language === 'de' ? 'Gehe zwei Schritte nach vorne' : 'Move two steps forward',
          language === 'de' ? 'Dreh dich nach links' : 'Turn left',
          language === 'de' ? 'Dreh dich nach rechts' : 'Turn right',
          language === 'de' ? 'Geh über die Brücke' : 'Cross the bridge',
          language === 'de' ? 'Geh zur roten Tür' : 'Go to red door',
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
