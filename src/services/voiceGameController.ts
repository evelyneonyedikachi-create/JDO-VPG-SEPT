import { Language, Playmate } from '../types';
import { VoiceEngine, VoiceState, VoiceListeningMode } from './voiceEngine';
import { playChime } from '../utils/soundEffects';
import {
  GameType,
  cleanStammeringTranscript,
  isStructuredSentence,
  normalizeGameSynonyms,
  parseGameVoiceCommand,
} from './voiceGameParser';

export type GameKind = 'football' | 'basketball' | 'racing' | 'guide_me';

export type VoiceGameMachineState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'interpreting'
  | 'executing'
  | 'responding'
  | 'error';

export type UtteranceCategory =
  | 'command'
  | 'question'
  | 'help'
  | 'comment'
  | 'undo'
  | 'confirmation_yes'
  | 'confirmation_no'
  | 'unclear'
  | 'irrelevant';

export type ConfidenceLevel = 'UNDERSTOOD' | 'POSSIBLY_UNDERSTOOD' | 'NOT_UNDERSTOOD';

export interface GameAction {
  type: string;
  target?: string;
  direction?: 'left' | 'right' | 'forward' | 'back' | 'center' | 'up' | 'down';
  stepCount?: number;
  descriptionDe: string;
  descriptionEn: string;
}

export interface CompactGameState {
  gameKind: GameKind;
  summaryDe: string;
  summaryEn: string;
  optionsDe: string[];
  optionsEn: string[];
  ballHolder?: string;
  scoreOrPoints?: string | number;
  urgencyOrClock?: string | number;
  lastAvatarQuestion?: string;
}

export interface ParsedVoiceGameTurn {
  category: UtteranceCategory;
  rawTranscript: string;
  cleanedTranscript: string;
  actions: GameAction[];
  candidateAction?: GameAction;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  isMultiStep: boolean;
  isFullSentence: boolean;
  modeledFullSentenceDe: string;
  modeledFullSentenceEn: string;
  contextualReplyDe?: string;
  contextualReplyEn?: string;
  clarificationQuestionDe?: string;
  clarificationQuestionEn?: string;
  debugReason?: string;
}

export interface VoiceGameControllerCallbacks {
  onStateChange: (state: VoiceGameMachineState) => void;
  onInterimTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onActionExecute: (action: GameAction, isLastInSequence: boolean) => Promise<void> | void;
  onUndoAction?: () => void;
  onClarificationPrompt?: (candidate: GameAction, promptDe: string, promptEn: string) => void;
  onClarificationDismiss?: () => void;
  onAvatarSpeak: (text: string, mood?: 'celebrate' | 'coach' | 'friendly') => void;
  onError: (errorMessage: string) => void;
}

/**
 * Checks if the transcript is contextually irrelevant noise (e.g. "Punkt 19", isolated random numbers, non-game phrases).
 */
export function isIrrelevantNoise(cleaned: string, gameKind: GameKind): boolean {
  if (!cleaned) return true;

  // Pure irrelevant numbers / patterns (e.g. "punkt 19", "punkt 1", "nummer 20", "eins neun", "kapitel")
  if (/^(punkt|point|nummer|number|kapitel|seite|page)\s*\d+$/i.test(cleaned)) {
    return true;
  }
  if (cleaned === 'punkt 19' || cleaned === 'punkt 18' || cleaned === 'punkt 20') {
    return true;
  }

  // Pure numbers without direction or step context
  if (/^\d+$/.test(cleaned)) {
    const val = parseInt(cleaned, 10);
    // If not a small step (1..5 in guide_me), it's irrelevant noise
    if (gameKind !== 'guide_me' || val > 5 || val <= 0) {
      return true;
    }
  }

  return false;
}

/**
 * Maps a parsed command action string to concrete GameAction items
 */
function mapCommandToAction(
  action: string,
  gameKind: GameKind,
  target?: string,
  direction?: 'left' | 'right' | 'forward' | 'back' | 'center' | 'up' | 'down',
  stepCount?: number
): GameAction | null {
  if (!action || action === 'unknown') return null;

  if (gameKind === 'football') {
    if (action === 'shoot') {
      return {
        type: 'SHOOT',
        descriptionDe: 'Schuss aufs Tor!',
        descriptionEn: 'Shot on goal!',
      };
    }
    if (action === 'cross') {
      return {
        type: 'CROSS',
        direction: 'center',
        descriptionDe: 'Flanke in den Strafraum!',
        descriptionEn: 'Cross into the penalty box!',
      };
    }
    if (action === 'enter_box') {
      return {
        type: 'ENTER_BOX',
        direction: 'forward',
        descriptionDe: 'In den Strafraum ziehen!',
        descriptionEn: 'Enter the penalty box!',
      };
    }
    if (action === 'defend') {
      return {
        type: 'DEFEND',
        descriptionDe: 'Zurückfallen und verteidigen!',
        descriptionEn: 'Fall back and defend!',
      };
    }
    if (action === 'run') {
      return {
        type: direction === 'back' ? 'RUN_BACK' : 'RUN_FORWARD',
        direction: direction || 'forward',
        descriptionDe: `Nach ${direction === 'left' ? 'links' : direction === 'right' ? 'rechts' : direction === 'back' ? 'hinten' : 'vorne'} laufen`,
        descriptionEn: `Run ${direction || 'forward'}`,
      };
    }
    if (action === 'pass') {
      if (target) {
        return {
          type: 'PASS_PLAYER',
          target,
          direction,
          descriptionDe: `Pass zu ${target === 'ben' ? 'Ben' : target === 'leo' ? 'Leo' : target === 'mia' ? 'Mia' : 'JD'}`,
          descriptionEn: `Pass to ${target}`,
        };
      }
      if (direction === 'left') {
        return {
          type: 'PASS_LEFT',
          direction: 'left',
          descriptionDe: 'Pass nach links',
          descriptionEn: 'Pass to the left',
        };
      }
      if (direction === 'right') {
        return {
          type: 'PASS_RIGHT',
          direction: 'right',
          descriptionDe: 'Pass nach rechts',
          descriptionEn: 'Pass to the right',
        };
      }
      return {
        type: 'PASS_FORWARD',
        direction: 'forward',
        descriptionDe: 'Pass nach vorne',
        descriptionEn: 'Pass forward',
      };
    }
    if (action === 'move') {
      return {
        type: direction === 'left' ? 'PASS_LEFT' : direction === 'right' ? 'PASS_RIGHT' : 'PASS_FORWARD',
        direction: direction || 'forward',
        descriptionDe: `Pass nach ${direction || 'vorne'}`,
        descriptionEn: `Pass ${direction || 'forward'}`,
      };
    }
  }

  if (gameKind === 'basketball') {
    if (action === 'three_pointer') {
      return {
        type: 'THREE_POINTER',
        descriptionDe: '3-Punkte-Wurf!',
        descriptionEn: '3-Point Shot!',
      };
    }
    if (action === 'shoot') {
      return {
        type: 'SHOOT',
        descriptionDe: 'Wurf auf den Korb!',
        descriptionEn: 'Shot on the basket!',
      };
    }
    if (action === 'drive_to_basket' || action === 'drive_basket') {
      return {
        type: 'DRIVE_TO_BASKET',
        direction: 'forward',
        descriptionDe: 'Zum Korb ziehen!',
        descriptionEn: 'Drive to the basket!',
      };
    }
    if (action === 'block' || action === 'defend') {
      return {
        type: 'BLOCK',
        descriptionDe: 'Blocken und verteidigen!',
        descriptionEn: 'Block and defend!',
      };
    }
    if (action === 'dribble' || action === 'dribble_left' || action === 'dribble_right' || action === 'dribble_forward') {
      const dir = direction || (action === 'dribble_left' ? 'left' : action === 'dribble_right' ? 'right' : 'forward');
      return {
        type: dir === 'left' ? 'DRIBBLE_LEFT' : dir === 'right' ? 'DRIBBLE_RIGHT' : 'MOVE_FORWARD',
        direction: dir,
        descriptionDe: `Dribbel nach ${dir === 'left' ? 'links' : dir === 'right' ? 'rechts' : 'vorne'}`,
        descriptionEn: `Dribble ${dir}`,
      };
    }
    if (action === 'pass') {
      return {
        type: 'PASS_PLAYER',
        target: target || 'mia',
        direction,
        descriptionDe: `Pass zu ${target === 'mia' ? 'Mia' : target === 'ben' ? 'Ben' : target === 'leo' ? 'Leo' : target === 'sophie' ? 'Sophie' : 'JD'}`,
        descriptionEn: `Pass to ${target || 'teammate'}`,
      };
    }
  }

  if (gameKind === 'racing') {
    if (action === 'accelerate') {
      return {
        type: 'ACCELERATE',
        descriptionDe: 'Vollgas geben!',
        descriptionEn: 'Full throttle acceleration!',
      };
    }
    if (action === 'brake') {
      return {
        type: 'BRAKE',
        descriptionDe: 'Vor der Kurve abbremsen',
        descriptionEn: 'Brake before the turn',
      };
    }
    if (action === 'overtake') {
      return {
        type: 'OVERTAKE',
        target: target || 'red_car',
        descriptionDe: `Überhole das ${target === 'blue_car' ? 'blaue' : 'rote'} Auto!`,
        descriptionEn: `Overtake the ${target === 'blue_car' ? 'blue' : 'red'} car!`,
      };
    }
    if (action === 'pit_stop') {
      return {
        type: 'PIT_STOP',
        descriptionDe: 'Boxenstopp & Reifenwechsel',
        descriptionEn: 'Pit stop & tyre change',
      };
    }
    if (action === 'follow') {
      return {
        type: 'FOLLOW',
        target: target || 'blue_car',
        descriptionDe: 'Im Windschatten folgen',
        descriptionEn: 'Follow in slipstream',
      };
    }
    if (action === 'turn_left' || (action === 'turn' && direction === 'left')) {
      return {
        type: 'TURN_LEFT',
        direction: 'left',
        descriptionDe: 'Nach links lenken',
        descriptionEn: 'Steer left',
      };
    }
    if (action === 'turn_right' || (action === 'turn' && direction === 'right')) {
      return {
        type: 'TURN_RIGHT',
        direction: 'right',
        descriptionDe: 'Nach rechts lenken',
        descriptionEn: 'Steer right',
      };
    }
  }

  if (gameKind === 'guide_me') {
    if (action === 'turn_left') {
      return {
        type: 'TURN_LEFT',
        direction: 'left',
        descriptionDe: 'Nach links drehen',
        descriptionEn: 'Turn left',
      };
    }
    if (action === 'turn_right') {
      return {
        type: 'TURN_RIGHT',
        direction: 'right',
        descriptionDe: 'Nach rechts drehen',
        descriptionEn: 'Turn right',
      };
    }
    if (action === 'step_back') {
      return {
        type: 'STEP_BACK',
        direction: 'back',
        stepCount: stepCount || 1,
        descriptionDe: `${stepCount || 1} Schritt(e) zurück`,
        descriptionEn: `Step ${stepCount || 1} back`,
      };
    }
    if (action === 'collect') {
      return {
        type: 'COLLECT',
        target: target || 'gem',
        descriptionDe: 'Gegenstand einsammeln',
        descriptionEn: 'Collect item',
      };
    }
    if (action === 'go_to_target') {
      return {
        type: 'GO_TO_TARGET',
        target: target || 'red_door',
        descriptionDe: `Gehe zu ${target === 'red_door' ? 'der roten Tür' : target === 'treasure' ? 'der Schatztruhe' : target === 'bridge' ? 'der Brücke' : target}`,
        descriptionEn: `Go to ${target}`,
      };
    }
    if (action === 'step_forward') {
      return {
        type: 'STEP_FORWARD',
        direction: 'forward',
        stepCount: stepCount || 1,
        descriptionDe: `${stepCount || 1} Schritt(e) vorwärts`,
        descriptionEn: `Step ${stepCount || 1} forward`,
      };
    }
  }

  return null;
}

/**
 * -------------------------------------------------------------
 * CENTRAL SPEECH & INTENT CLASSIFIER (4-Layer Pipeline)
 * -------------------------------------------------------------
 */
export function classifyGameSpeech(
  rawTranscript: string,
  gameKind: GameKind,
  lang: Language,
  currentState: CompactGameState
): ParsedVoiceGameTurn {
  const cleaned = cleanStammeringTranscript(rawTranscript);
  const isFullSentence = isStructuredSentence(cleaned, lang);

  // Layer 0: Check for Irrelevant Noise (e.g. "Punkt 19", isolated random numbers)
  if (isIrrelevantNoise(cleaned, gameKind)) {
    return {
      category: 'irrelevant',
      rawTranscript,
      cleanedTranscript: cleaned,
      actions: [],
      confidenceLevel: 'NOT_UNDERSTOOD',
      confidenceScore: 0.05,
      isMultiStep: false,
      isFullSentence: false,
      modeledFullSentenceDe: 'Sag bitte einen Spielbefehl!',
      modeledFullSentenceEn: 'Please say a game command!',
      contextualReplyDe: 'Ich glaube, ich habe dich nicht richtig verstanden. Sag den Befehl bitte noch einmal.',
      contextualReplyEn: "I didn't quite catch that clearly. Please say the command again.",
      debugReason: 'Rejected as irrelevant noise',
    };
  }

  // Layer 0.1: Undo / Correction Classification ("Korrektur", "Rückgängig", "Halt", "Stop", "Undo")
  const isUndo =
    cleaned === 'korrektur' ||
    cleaned === 'rückgängig' ||
    cleaned === 'zurücknehmen' ||
    cleaned === 'undo' ||
    cleaned === 'nochmal' ||
    cleaned === 'wiederholen' ||
    cleaned === 'repeat' ||
    cleaned === 'try again' ||
    cleaned === 'falsch' ||
    cleaned === 'stop' ||
    cleaned === 'stopp' ||
    cleaned === 'halt' ||
    cleaned === 'cancel';

  if (isUndo) {
    return {
      category: 'undo',
      rawTranscript,
      cleanedTranscript: cleaned,
      actions: [],
      confidenceLevel: 'UNDERSTOOD',
      confidenceScore: 0.95,
      isMultiStep: false,
      isFullSentence: true,
      modeledFullSentenceDe: 'Korrektur, bitte noch einmal!',
      modeledFullSentenceEn: 'Correction, let’s try again!',
      contextualReplyDe: 'Kein Problem! Wir machen den Zug noch einmal. Was möchtest du tun?',
      contextualReplyEn: "No problem! Let's do that move again. What would you like to do?",
      debugReason: 'Undo / correction recognized',
    };
  }

  // Layer 0.2: Confirmation Responses ("Ja", "Genau", "Richtig", "Yes", "Nein", "No")
  const isYes =
    cleaned === 'ja' ||
    cleaned === 'ja genau' ||
    cleaned === 'genau' ||
    cleaned === 'richtig' ||
    cleaned === 'yes' ||
    cleaned === 'sure' ||
    cleaned === 'mach das' ||
    cleaned === 'okay' ||
    cleaned === 'ok' ||
    cleaned === 'do it';

  const isNo =
    cleaned === 'nein' ||
    cleaned === 'no' ||
    cleaned === 'nicht' ||
    cleaned === 'abbrechen' ||
    cleaned === 'cancel';

  if (isYes) {
    return {
      category: 'confirmation_yes',
      rawTranscript,
      cleanedTranscript: cleaned,
      actions: [],
      confidenceLevel: 'UNDERSTOOD',
      confidenceScore: 0.95,
      isMultiStep: false,
      isFullSentence: true,
      modeledFullSentenceDe: 'Ja, genau das machen wir!',
      modeledFullSentenceEn: 'Yes, let’s do that!',
      contextualReplyDe: 'Super, wird sofort ausgeführt!',
      contextualReplyEn: 'Great, executing now!',
      debugReason: 'Affirmative confirmation recognized',
    };
  }

  if (isNo) {
    return {
      category: 'confirmation_no',
      rawTranscript,
      cleanedTranscript: cleaned,
      actions: [],
      confidenceLevel: 'UNDERSTOOD',
      confidenceScore: 0.95,
      isMultiStep: false,
      isFullSentence: true,
      modeledFullSentenceDe: 'Nein, anderer Befehl!',
      modeledFullSentenceEn: 'No, different command!',
      contextualReplyDe: 'Alles klar! Sag einfach deinen gewünschten Befehl.',
      contextualReplyEn: 'Got it! Just say your desired command.',
      debugReason: 'Negative confirmation recognized',
    };
  }

  // Layer 0.3: Help Request Classification
  const isHelpRequest =
    cleaned.includes('ich weiß nicht') ||
    cleaned.includes('weiß nicht') ||
    cleaned.includes('hilf mir') ||
    cleaned.includes('hilfe') ||
    cleaned.includes('verstehe nicht') ||
    cleaned.includes('was muss ich') ||
    cleaned.includes('dont know') ||
    cleaned.includes('help me') ||
    cleaned.includes('help');

  if (isHelpRequest) {
    const optsDe = currentState.optionsDe.join(', ');
    const optsEn = currentState.optionsEn.join(', ');
    return {
      category: 'help',
      rawTranscript,
      cleanedTranscript: cleaned,
      actions: [],
      confidenceLevel: 'UNDERSTOOD',
      confidenceScore: 0.95,
      isMultiStep: false,
      isFullSentence: true,
      modeledFullSentenceDe: 'Was soll ich jetzt tun?',
      modeledFullSentenceEn: 'What should I do now?',
      contextualReplyDe: `Kein Problem, JD! Hier sind Möglichkeiten: ${optsDe}. Sag einfach, was du wählen möchtest!`,
      contextualReplyEn: `No problem, JD! Here are your options: ${optsEn}. Just say which one you want!`,
      debugReason: 'Help query recognized',
    };
  }

  // Layer 0.4: Question Classification ("Was soll ich machen?", "Wohin?")
  const isQuestion =
    cleaned.includes('was soll ich') ||
    cleaned.includes('was können wir') ||
    cleaned.includes('was jetzt') ||
    cleaned.includes('wohin') ||
    cleaned.includes('wie geht') ||
    cleaned.includes('what should i') ||
    cleaned.includes('what can we') ||
    cleaned.includes('where to') ||
    cleaned.includes('what now');

  if (isQuestion) {
    const optsDe = currentState.optionsDe.slice(0, 3).join(' oder ');
    const optsEn = currentState.optionsEn.slice(0, 3).join(' or ');
    return {
      category: 'question',
      rawTranscript,
      cleanedTranscript: cleaned,
      actions: [],
      confidenceLevel: 'UNDERSTOOD',
      confidenceScore: 0.95,
      isMultiStep: false,
      isFullSentence: true,
      modeledFullSentenceDe: 'Wohin soll ich spielen?',
      modeledFullSentenceEn: 'Where should I play?',
      contextualReplyDe: `${currentState.summaryDe} Du kannst jetzt: ${optsDe}!`,
      contextualReplyEn: `${currentState.summaryEn} You can: ${optsEn}!`,
      debugReason: 'Conversational question recognized',
    };
  }

  // Layer 0.5: Social / Comment Classification ("Das war cool!", "Super!")
  const isComment =
    cleaned.includes('cool') ||
    cleaned.includes('super') ||
    cleaned.includes('toll') ||
    cleaned.includes('klasse') ||
    cleaned.includes('wahnsinn') ||
    cleaned.includes('jaaa') ||
    cleaned.includes('geil') ||
    cleaned.includes('spitze') ||
    cleaned.includes('awesome') ||
    cleaned.includes('great') ||
    cleaned.includes('wow');

  if (isComment && cleaned.split(/\s+/).length <= 4) {
    return {
      category: 'comment',
      rawTranscript,
      cleanedTranscript: cleaned,
      actions: [],
      confidenceLevel: 'UNDERSTOOD',
      confidenceScore: 0.9,
      isMultiStep: false,
      isFullSentence: true,
      modeledFullSentenceDe: 'Das war ein genialer Spielzug!',
      modeledFullSentenceEn: 'That was an awesome play!',
      contextualReplyDe: 'Jaaa, absolut mega! Lass uns gleich den nächsten Spielzug starten!',
      contextualReplyEn: 'Yesss, awesome play! Let’s set up the next move!',
      debugReason: 'Positive social comment recognized',
    };
  }

  // -------------------------------------------------------------
  // Layer 1 - 3: Unified Game Command Parsing
  // -------------------------------------------------------------
  const parsedCmd = parseGameVoiceCommand(
    rawTranscript,
    gameKind,
    lang,
    currentState.lastAvatarQuestion || currentState.summaryDe
  );

  const actions: GameAction[] = [];

  // Multi-step sequenced actions
  if (parsedCmd.sequencedActions && parsedCmd.sequencedActions.length > 0) {
    for (const seq of parsedCmd.sequencedActions) {
      const act = mapCommandToAction(seq.action, gameKind, seq.target, seq.direction as any);
      if (act) actions.push(act);
    }
  } else {
    const act = mapCommandToAction(parsedCmd.action, gameKind, parsedCmd.target, parsedCmd.direction, parsedCmd.stepCount);
    if (act) actions.push(act);
  }

  // If action was successfully mapped
  if (actions.length > 0) {
    // If command was parsed with high confidence and is not ambiguous
    if (parsedCmd.confidence >= 0.8 && !parsedCmd.isAmbiguous) {
      return {
        category: 'command',
        rawTranscript,
        cleanedTranscript: cleaned,
        actions,
        confidenceLevel: 'UNDERSTOOD',
        confidenceScore: parsedCmd.confidence,
        isMultiStep: actions.length > 1,
        isFullSentence,
        modeledFullSentenceDe: parsedCmd.modeledFullSentenceDe || 'Spiel den Ball zum Mitspieler!',
        modeledFullSentenceEn: parsedCmd.modeledFullSentenceEn || 'Pass the ball to the teammate!',
        debugReason: `Command mapped directly to ${actions.map((a) => a.type).join(' -> ')}`,
      };
    }

    // If ambiguous, prompt clarification (Layer 4)
    if (parsedCmd.isAmbiguous) {
      return {
        category: 'command',
        rawTranscript,
        cleanedTranscript: cleaned,
        actions: [],
        candidateAction: actions[0],
        confidenceLevel: 'POSSIBLY_UNDERSTOOD',
        confidenceScore: 0.7,
        isMultiStep: false,
        isFullSentence,
        modeledFullSentenceDe: parsedCmd.modeledFullSentenceDe || '',
        modeledFullSentenceEn: parsedCmd.modeledFullSentenceEn || '',
        clarificationQuestionDe: parsedCmd.ambiguityPromptDe || `Meintest du: "${actions[0].descriptionDe}"?`,
        clarificationQuestionEn: parsedCmd.ambiguityPromptEn || `Did you mean: "${actions[0].descriptionEn}"?`,
        contextualReplyDe: parsedCmd.ambiguityPromptDe || `Meintest du: "${actions[0].descriptionDe}"?`,
        contextualReplyEn: parsedCmd.ambiguityPromptEn || `Did you mean: "${actions[0].descriptionEn}"?`,
        debugReason: 'Action requires clarification of target/direction',
      };
    }
  }

  // Fallback: Not Understood (DO NOT EXECUTE ANYTHING)
  return {
    category: 'unclear',
    rawTranscript,
    cleanedTranscript: cleaned,
    actions: [],
    confidenceLevel: 'NOT_UNDERSTOOD',
    confidenceScore: 0.15,
    isMultiStep: false,
    isFullSentence: false,
    modeledFullSentenceDe: 'Sag bitte deinen nächsten Spielzug!',
    modeledFullSentenceEn: 'Please say your next move!',
    contextualReplyDe: 'Ich glaube, ich habe dich nicht richtig verstanden. Sag den Befehl bitte noch einmal.',
    contextualReplyEn: "I didn't quite catch that clearly. Please say the command again.",
    debugReason: 'No matching intent found in dictionary or synonyms',
  };
}

/**
 * -------------------------------------------------------------
 * UNIFIED VOICE GAME CONTROLLER (Class Instance)
 * -------------------------------------------------------------
 */
export class VoiceGameController {
  private state: VoiceGameMachineState = 'idle';
  private callbacks: VoiceGameControllerCallbacks;
  private voiceEngine: VoiceEngine;
  private gameKind: GameKind;
  private language: Language;
  private fullSentenceMode: boolean = false;
  private currentStateGetter: () => CompactGameState;
  private playmate: Playmate;

  private pendingClarificationAction: GameAction | null = null;
  private lastExecutedActions: GameAction[] = [];
  private watchdogTimer: NodeJS.Timeout | null = null;
  private isProcessingQueue = false;

  constructor(options: {
    voiceEngine: VoiceEngine;
    gameKind: GameKind;
    language: Language;
    playmate: Playmate;
    fullSentenceMode: boolean;
    currentStateGetter: () => CompactGameState;
    callbacks: VoiceGameControllerCallbacks;
  }) {
    this.voiceEngine = options.voiceEngine;
    this.gameKind = options.gameKind;
    this.language = options.language;
    this.playmate = options.playmate;
    this.fullSentenceMode = options.fullSentenceMode;
    this.currentStateGetter = options.currentStateGetter;
    this.callbacks = options.callbacks;

    this.bindEngineListeners();
  }

  public updateConfig(config: {
    language?: Language;
    playmate?: Playmate;
    fullSentenceMode?: boolean;
    currentStateGetter?: () => CompactGameState;
  }) {
    if (config.language !== undefined) this.language = config.language;
    if (config.playmate !== undefined) this.playmate = config.playmate;
    if (config.fullSentenceMode !== undefined) this.fullSentenceMode = config.fullSentenceMode;
    if (config.currentStateGetter !== undefined) this.currentStateGetter = config.currentStateGetter;
  }

  public getState(): VoiceGameMachineState {
    return this.state;
  }

  public getPendingClarification(): GameAction | null {
    return this.pendingClarificationAction;
  }

  private transitionTo(newState: VoiceGameMachineState) {
    this.state = newState;
    this.clearWatchdog();

    // Safety watchdog: if in any non-idle state for longer than 8 seconds, automatically recover to idle
    if (newState !== 'idle') {
      this.watchdogTimer = setTimeout(() => {
        console.warn(`VoiceGameController watchdog triggered in state: ${newState}. Forcing return to idle.`);
        this.transitionTo('idle');
        this.resumeListening();
      }, 8000);
    }

    this.callbacks.onStateChange(newState);
  }

  private clearWatchdog() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private bindEngineListeners() {
    this.voiceEngine.setCallbacks({
      onStateChange: (vState: VoiceState) => {
        if (this.state === 'executing' || this.state === 'responding') return;
        if (vState === 'listening') {
          this.transitionTo('listening');
        } else if (vState === 'speech_detected') {
          this.transitionTo('transcribing');
        } else if (vState === 'idle' && this.state !== 'idle') {
          this.transitionTo('idle');
        }
      },
      onInterimTranscript: (text: string) => {
        this.callbacks.onInterimTranscript(text);
        if (this.state !== 'executing' && this.state !== 'responding') {
          this.transitionTo('transcribing');
        }
      },
      onFinalTranscript: (text: string) => {
        this.callbacks.onFinalTranscript(text);
        this.handleProcessSpokenUtterance(text);
      },
      onVolumeChange: () => {},
      onVisemeChange: () => {},
      onError: (errMsg: string) => {
        console.warn('VoiceGameController Engine Error:', errMsg);
        this.transitionTo('error');
        this.callbacks.onError(errMsg);
        setTimeout(() => {
          this.transitionTo('idle');
          this.resumeListening();
        }, 1500);
      },
    });
  }

  public async start(mode?: VoiceListeningMode) {
    try {
      this.transitionTo('listening');
      await this.voiceEngine.startListening({ mode });
    } catch (e: any) {
      console.warn('Error starting voice listener:', e);
      this.transitionTo('idle');
    }
  }

  public stop() {
    this.clearWatchdog();
    this.voiceEngine.stopListening(false);
    this.voiceEngine.stopSpeaking();
    this.transitionTo('idle');
  }

  public resumeListening() {
    try {
      this.voiceEngine.startListening();
    } catch (e) {
      console.warn('Error resuming listening:', e);
    }
  }

  /**
   * Confirm pending clarification action
   */
  public async confirmClarification() {
    if (!this.pendingClarificationAction) return;
    const action = this.pendingClarificationAction;
    this.pendingClarificationAction = null;
    this.callbacks.onClarificationDismiss?.();
    await this.executeActionSequence([action]);
  }

  /**
   * Reject pending clarification
   */
  public rejectClarification() {
    this.pendingClarificationAction = null;
    this.callbacks.onClarificationDismiss?.();
    const prompt =
      this.language === 'de'
        ? 'Alles klar! Sag einfach deinen gewünschten Befehl.'
        : 'Got it! Just say your desired command.';
    this.callbacks.onAvatarSpeak(prompt, 'friendly');
    this.voiceEngine.speak(prompt, {
      pitch: this.playmate.voicePitch || 1.1,
      gender: this.playmate.gender || 'boy',
      characterId: this.playmate.name.toLowerCase(),
      rate: 1.0,
      onEnd: () => {
        this.transitionTo('idle');
        this.resumeListening();
      },
    });
  }

  /**
   * Undo / Correction trigger
   */
  public triggerUndoOrCorrection() {
    this.pendingClarificationAction = null;
    this.callbacks.onClarificationDismiss?.();
    this.callbacks.onUndoAction?.();
    const prompt =
      this.language === 'de'
        ? 'Kein Problem! Wir machen den Zug noch einmal. Was möchtest du tun?'
        : "No problem! Let's do that move again. What would you like to do?";
    this.callbacks.onAvatarSpeak(prompt, 'friendly');
    this.voiceEngine.speak(prompt, {
      pitch: this.playmate.voicePitch || 1.1,
      gender: this.playmate.gender || 'boy',
      characterId: this.playmate.name.toLowerCase(),
      rate: 1.0,
      onEnd: () => {
        this.transitionTo('idle');
        this.resumeListening();
      },
    });
  }

  /**
   * Executes a sequence of game actions
   */
  private async executeActionSequence(actions: GameAction[]) {
    this.transitionTo('executing');
    this.lastExecutedActions = actions;

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const isLast = i === actions.length - 1;
      await this.callbacks.onActionExecute(action, isLast);

      if (!isLast) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    setTimeout(() => {
      this.transitionTo('idle');
      this.resumeListening();
    }, 600);
  }

  /**
   * Main utterance handler
   */
  public async handleProcessSpokenUtterance(spokenText: string) {
    if (!spokenText.trim() || this.isProcessingQueue) return;

    this.isProcessingQueue = true;
    this.transitionTo('interpreting');

    try {
      const currentState = this.currentStateGetter();
      const turn = classifyGameSpeech(spokenText, this.gameKind, this.language, currentState);

      // Developer Debug Logging
      console.log(
        `[VoiceGameDebug] Game: ${this.gameKind} | Raw: "${spokenText}" | Clean: "${turn.cleanedTranscript}" | Category: ${turn.category} | Actions: [${turn.actions.map((a) => a.type).join(', ')}] | Score: ${turn.confidenceScore} | Conf: ${turn.confidenceLevel} | Reason: ${turn.debugReason || 'n/a'}`
      );

      // 1. Pending Clarification handling ("Ja" or "Nein")
      if (this.pendingClarificationAction) {
        if (turn.category === 'confirmation_yes') {
          await this.confirmClarification();
          return;
        } else if (turn.category === 'confirmation_no') {
          this.rejectClarification();
          return;
        }
      }

      // 2. Undo / Correction
      if (turn.category === 'undo') {
        this.triggerUndoOrCorrection();
        return;
      }

      // 3. Irrelevant Noise or Unclear -> DO NOT EXECUTE ANYTHING!
      if (turn.confidenceLevel === 'NOT_UNDERSTOOD' || turn.category === 'irrelevant' || turn.category === 'unclear') {
        const reply =
          this.language === 'de'
            ? 'Ich glaube, ich habe dich nicht richtig verstanden. Sag den Befehl bitte noch einmal.'
            : "I didn't quite catch that clearly. Please say the command again.";

        this.transitionTo('responding');
        this.callbacks.onAvatarSpeak(reply, 'coach');

        this.voiceEngine.speak(reply, {
          pitch: this.playmate.voicePitch || 1.1,
          gender: this.playmate.gender || 'boy',
          characterId: this.playmate.name.toLowerCase(),
          rate: 0.95,
          onEnd: () => {
            this.transitionTo('idle');
            this.resumeListening();
          },
        });
        return;
      }

      // 4. Questions, Help, Comments
      if (turn.category === 'question' || turn.category === 'help' || turn.category === 'comment') {
        const reply = this.language === 'de' ? (turn.contextualReplyDe || '') : (turn.contextualReplyEn || '');
        this.transitionTo('responding');
        this.callbacks.onAvatarSpeak(reply, turn.category === 'comment' ? 'celebrate' : 'coach');

        this.voiceEngine.speak(reply, {
          pitch: this.playmate.voicePitch || 1.1,
          gender: this.playmate.gender || 'boy',
          characterId: this.playmate.name.toLowerCase(),
          rate: 1.0,
          onEnd: () => {
            this.transitionTo('idle');
            this.resumeListening();
          },
        });
        return;
      }

      // 5. Possibly Understood -> Prompt Clarification
      if (turn.confidenceLevel === 'POSSIBLY_UNDERSTOOD' && turn.candidateAction) {
        this.pendingClarificationAction = turn.candidateAction;
        const promptDe = turn.clarificationQuestionDe || `Meintest du: "${turn.candidateAction.descriptionDe}"?`;
        const promptEn = turn.clarificationQuestionEn || `Did you mean: "${turn.candidateAction.descriptionEn}"?`;
        const spoken = this.language === 'de' ? promptDe : promptEn;

        this.transitionTo('responding');
        this.callbacks.onClarificationPrompt?.(turn.candidateAction, promptDe, promptEn);
        this.callbacks.onAvatarSpeak(spoken, 'coach');

        this.voiceEngine.speak(spoken, {
          pitch: this.playmate.voicePitch || 1.1,
          gender: this.playmate.gender || 'boy',
          characterId: this.playmate.name.toLowerCase(),
          rate: 0.95,
          onEnd: () => {
            this.transitionTo('idle');
            this.resumeListening();
          },
        });
        return;
      }

      // 6. Understood Commands
      if (turn.confidenceLevel === 'UNDERSTOOD' && turn.actions.length > 0) {
        // Full Sentence Practice Mode enforcement
        if (this.fullSentenceMode && !turn.isFullSentence) {
          playChime('repeat_model');
          this.transitionTo('responding');
          const modelPrompt =
            this.language === 'de'
              ? `Sag den ganzen Satz: "${turn.modeledFullSentenceDe}"`
              : `Say the full sentence: "${turn.modeledFullSentenceEn}"`;

          this.callbacks.onAvatarSpeak(modelPrompt, 'coach');
          this.voiceEngine.speak(modelPrompt, {
            pitch: this.playmate.voicePitch || 1.1,
            gender: this.playmate.gender || 'boy',
            characterId: this.playmate.name.toLowerCase(),
            rate: 1.0,
            onEnd: () => {
              this.transitionTo('idle');
              this.resumeListening();
            },
          });
          return;
        }

        // Execute action sequence
        await this.executeActionSequence(turn.actions);
      }
    } catch (err: any) {
      console.error('Error executing voice turn:', err);
      this.transitionTo('error');
      this.callbacks.onError('Fehler beim Ausführen der Aktion.');
      setTimeout(() => {
        this.transitionTo('idle');
        this.resumeListening();
      }, 1000);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  public cleanup() {
    this.clearWatchdog();
    this.stop();
  }
}
