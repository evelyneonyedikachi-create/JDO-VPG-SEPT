import { Language } from '../types';

export type GameType = 'football' | 'guide_me' | 'basketball' | 'racing';

export interface ParsedVoiceCommand {
  rawTranscript: string;
  cleanedTranscript: string;
  normalizedTokens: string[];
  gameType: GameType;
  action: string;
  direction?: 'left' | 'right' | 'forward' | 'back' | 'center' | 'up' | 'down';
  target?: string;
  stepCount?: number;
  sequencedActions?: Array<{ action: string; direction?: string; target?: string }>;
  isFullSentence: boolean;
  isAmbiguous: boolean;
  ambiguityPromptDe?: string;
  ambiguityPromptEn?: string;
  modeledFullSentenceDe?: string;
  modeledFullSentenceEn?: string;
  confidence: number;
  debugReason?: string;
}

/**
 * 1. Clean speech transcript:
 * Removes stammering prefixes, stuttered syllables, punctuation, and duplicate consecutive words.
 */
export function cleanStammeringTranscript(raw: string): string {
  if (!raw) return '';
  let text = raw.toLowerCase().trim();

  // Remove punctuation
  text = text.replace(/[\.\,\!\?\-]+/g, ' ');

  // Clean hyphenated stutter sounds: "p-p-pass" -> "pass", "b-b-ben" -> "ben"
  text = text.replace(/\b([a-zäöüß])\s*[-–]\s*([a-zäöüß])\s*[-–]?\s*/gi, '$1');

  // Collapse repeated single syllables: "pa pa pass" -> "pass", "ge ge geh" -> "geh"
  text = text.replace(/\b([a-zäöüß]{1,3})\s+\1\s+/gi, '$1 ');

  // Collapse duplicate consecutive words: "pass pass den ball" -> "pass den ball", "left left" -> "left"
  const tokens = text.split(/\s+/).filter(Boolean);
  const deduped: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (i === 0 || tokens[i] !== tokens[i - 1]) {
      deduped.push(tokens[i]);
    }
  }

  return deduped.join(' ');
}

/**
 * 2. German & English Synonym Normalizer:
 * Maps inflected forms, colloquialisms, and code-switching into standard semantic tokens.
 */
export function normalizeGameSynonyms(text: string, gameType: GameType): string {
  let s = ` ${cleanStammeringTranscript(text)} `;

  // Common target aliases
  s = s.replace(/\b(zu\s+mia|an\s+mia|gib\s+mia|spiel\s+mia|pass\s+mia|to\s+mia)\b/g, ' pass_mia ');
  s = s.replace(/\b(zu\s+ben|an\s+ben|gib\s+ben|spiel\s+ben|pass\s+ben|to\s+ben)\b/g, ' pass_ben ');
  s = s.replace(/\b(zu\s+leo|an\s+leo|gib\s+leo|spiel\s+leo|pass\s+leo|to\s+leo)\b/g, ' pass_leo ');
  s = s.replace(/\b(zu\s+sophie|an\s+sophie|gib\s+sophie|spiel\s+sophie|pass\s+sophie|to\s+sophie)\b/g, ' pass_sophie ');
  s = s.replace(/\b(zu\s+mir|an\s+mich|gib\s+mir|pass\s+mir|to\s+me)\b/g, ' pass_jd ');

  // Basketball-specific synonyms
  if (gameType === 'basketball') {
    // 3-pointers
    s = s.replace(/\b(dreier|3er|dreipunktewurf|dreipunkter|3-punkter|drei\s+punkte|three\s+pointer|3\s+pointer|downtown)\b/g, ' three_pointer ');
    s = s.replace(/\b(mach\s+einen\s+dreier|wirf\s+einen\s+dreier|versuch\s+einen\s+dreier)\b/g, ' three_pointer ');

    // Shoot
    s = s.replace(/\b(wirf\s+auf\s+den\s+korb|wurf\s+auf\s+den\s+korb|mach\s+einen\s+wurf|schieß\s+auf\s+den\s+korb|versuch\s+einen\s+korb|korb\s+werfen|in\s+den\s+korb|treff\s+den\s+korb|take\s+a\s+shot|score\s+basket|shoot\s+the\s+ball)\b/g, ' shoot ');
    s = s.replace(/\b(wirf|wurf|werfen|schieß|schieße|schuss|treffer|dunk|dunken|shoot|throw)\b/g, ' shoot ');

    // Drive to basket / Layup
    s = s.replace(/\b(zieh\s+zum\s+korb|lauf\s+zum\s+korb|zum\s+korb\s+ziehen|zum\s+korb\s+laufen|durchmarsch|korbleger|layup|drive\s+to\s+basket|drive\s+to\s+the\s+hoop|drive\s+to\s+hoop)\b/g, ' drive_to_basket ');

    // Dribble
    s = s.replace(/\b(dribbeln|dribble|prellen|ball\s+prellen|crossover|cross)\b/g, ' dribble ');

    // Block / Defend
    s = s.replace(/\b(blocken|block|blockiere|verteidigen|verteidige|rebound|holen|steal|defend|defense)\b/g, ' block ');
  }

  // Racing-specific synonyms
  if (gameType === 'racing') {
    // Accelerate
    s = s.replace(/\b(gib\s+gas|vollgas|mehr\s+gas|gas\s+geben|fahr\s+schneller|schneller\s+fahren|beschleunigen|beschleunige|tempo\s+machen|go\s+faster|speed\s+up|full\s+speed|full\s+throttle|accelerate|step\s+on\s+the\s+gas|faster)\b/g, ' accelerate ');
    s = s.replace(/\b(turbo|speed|gas)\b/g, ' accelerate ');

    // Brake
    s = s.replace(/\b(abbremsen|bremsen|bremse|brems|langsamer\s+fahren|fahr\s+langsamer|brems\s+vor\s+der\s+kurve|vor\s+der\s+kurve\s+bremsen|stopp|slow\s+down|brake\s+now|hit\s+the\s+brakes|brake|slow)\b/g, ' brake ');

    // Overtake
    s = s.replace(/\b(überhole\s+ihn|überhole\s+das\s+rote\s+auto|überhole\s+das\s+blaue\s+auto|überhole\s+das\s+auto|überholen|überhol|überhole|fahr\s+vorbei|geh\s+vorbei|zieh\s+vorbei|vorbeiziehen|overtake\s+car|overtake\s+the\s+car|overtake|pass\s+the\s+car|pass\s+car)\b/g, ' overtake ');

    // Pit stop
    s = s.replace(/\b(fahr\s+in\s+die\s+box|ab\s+in\s+die\s+box|in\s+die\s+box|boxenstopp|boxenstop|reifen\s+wechseln|mach\s+einen\s+boxenstopp|reifenwechsel|box\s+now|pit\s+stop|change\s+tires|change\s+tyres|pit)\b/g, ' pit_stop ');

    // Slipstream / Follow
    s = s.replace(/\b(windschatten|hinterher\s+fahren|hinterher|dranbleiben|im\s+windschatten|follow\s+car|slipstream|follow)\b/g, ' follow ');

    // Steer left / right
    s = s.replace(/\b(fahr\s+nach\s+links|lenke\s+nach\s+links|lenk\s+nach\s+links|nimm\s+die\s+linke\s+seite|linke\s+seite|linke\s+bahn|turn\s+left|steer\s+left|go\s+left)\b/g, ' turn_left ');
    s = s.replace(/\b(fahr\s+nach\s+rechts|lenke\s+nach\s+rechts|lenk\s+nach\s+rechts|nimm\s+die\s+rechte\s+seite|rechte\s+seite|rechte\s+bahn|turn\s+right|steer\s+right|go\s+right)\b/g, ' turn_right ');
  }

  // Football-specific synonyms
  if (gameType === 'football') {
    s = s.replace(/\b(aufs\s+tor\s+schießen|schieß\s+aufs\s+tor|schuss\s+aufs\s+tor|tor\s+schießen|hau\s+ihn\s+rein|abziehen|draufhauen|shoot\s+on\s+goal|shoot\s+at\s+goal|score\s+a\s+goal)\b/g, ' shoot ');
    s = s.replace(/\b(in\s+die\s+mitte\s+flanken|flanke\s+in\s+die\s+mitte|hereingabe|hoch\s+herein|cross\s+the\s+ball|cross\s+into\s+box)\b/g, ' cross ');
    s = s.replace(/\b(in\s+den\s+strafraum\s+laufen|lauf\s+in\s+den\s+strafraum|strafraum|into\s+the\s+box)\b/g, ' enter_box ');
    s = s.replace(/\b(zurückfallen|verteidigen|abwehr|abfangen|defend|fall\s+back)\b/g, ' defend ');
  }

  // Guide Me synonyms
  if (gameType === 'guide_me') {
    s = s.replace(/\b(nach\s+links\s+drehen|dreh\s+dich\s+nach\s+links|bieg\s+nach\s+links\s+ab|turn\s+to\s+the\s+left)\b/g, ' turn_left ');
    s = s.replace(/\b(nach\s+rechts\s+drehen|dreh\s+dich\s+nach\s+rechts|bieg\s+nach\s+rechts\s+ab|turn\s+to\s+the\s+right)\b/g, ' turn_right ');
    s = s.replace(/\b(nach\s+vorne\s+gehen|geh\s+geradeaus|schritt\s+vorwärts|schritt\s+nach\s+vorne|step\s+forward|walk\s+forward)\b/g, ' step_forward ');
    s = s.replace(/\b(zurück\s+gehen|schritt\s+zurück|gehe\s+rückwärts|step\s+back|move\s+back)\b/g, ' step_back ');
    s = s.replace(/\b(edelstein\s+nehmen|schatz\s+einsammeln|nimm\s+den\s+stern|collect\s+gem|pick\s+up\s+treasure)\b/g, ' collect ');
  }

  return s.trim().replace(/\s+/g, ' ');
}

/**
 * 3. Check if transcript represents a structured full sentence
 */
export function isStructuredSentence(text: string, lang: Language): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;

  const deSentenceStarters = [
    'pass', 'spiel', 'gib', 'lauf', 'schieß', 'schiesse', 'flanke', 'geh', 'gehe', 'dreh',
    'wirf', 'dribbel', 'fahr', 'fahre', 'beschleunige', 'brems', 'bremse', 'überhole', 'wechsel',
    'wechsle', 'bring', 'nimm', 'du', 'wir', 'ich', 'bitte', 'zuerst', 'jetzt', 'ben', 'leo', 'mia', 'sophie'
  ];
  const enSentenceStarters = [
    'pass', 'play', 'give', 'run', 'shoot', 'cross', 'go', 'turn', 'throw', 'dribble', 'drive',
    'accelerate', 'brake', 'overtake', 'change', 'bring', 'take', 'you', 'we', 'i', 'please', 'first', 'now'
  ];

  const starters = lang === 'de' ? deSentenceStarters : enSentenceStarters;
  const startsWithAction = starters.some((s) => words[0].startsWith(s));

  return words.length >= 3 || (words.length >= 2 && startsWithAction);
}

/**
 * 4. Contextual Disambiguation Helper:
 * Uses previous avatar prompt (e.g. "Zu wem soll ich passen?", "Links oder rechts?") to resolve short child responses.
 */
export function resolveShortAnswerWithContext(
  transcript: string,
  lastAvatarPrompt: string = '',
  gameType: GameType
): { action?: string; target?: string; direction?: 'left' | 'right' | 'forward' | 'back' } | null {
  const cleanT = cleanStammeringTranscript(transcript);
  const cleanPrompt = cleanStammeringTranscript(lastAvatarPrompt);

  // If avatar asked "Zu wem soll ich passen?" or "Mia oder Ben?"
  if (cleanPrompt.includes('zu wem') || cleanPrompt.includes('passen') || cleanPrompt.includes('who') || cleanPrompt.includes('mia oder ben')) {
    if (cleanT.includes('mia')) return { action: 'pass', target: 'mia' };
    if (cleanT.includes('ben')) return { action: 'pass', target: 'ben' };
    if (cleanT.includes('leo')) return { action: 'pass', target: 'leo' };
    if (cleanT.includes('sophie')) return { action: 'pass', target: 'sophie' };
  }

  // If avatar asked "Links oder rechts?"
  if (cleanPrompt.includes('links oder rechts') || cleanPrompt.includes('left or right') || cleanPrompt.includes('überholen') || cleanPrompt.includes('kurve')) {
    if (cleanT === 'links' || cleanT === 'left' || cleanT.includes('links')) {
      if (gameType === 'racing') return { action: 'turn_left', direction: 'left' };
      if (gameType === 'basketball') return { action: 'dribble', direction: 'left' };
      if (gameType === 'football') return { action: 'pass', direction: 'left' };
      if (gameType === 'guide_me') return { action: 'turn_left', direction: 'left' };
    }
    if (cleanT === 'rechts' || cleanT === 'right' || cleanT.includes('rechts')) {
      if (gameType === 'racing') return { action: 'turn_right', direction: 'right' };
      if (gameType === 'basketball') return { action: 'dribble', direction: 'right' };
      if (gameType === 'football') return { action: 'pass', direction: 'right' };
      if (gameType === 'guide_me') return { action: 'turn_right', direction: 'right' };
    }
  }

  // If avatar asked "Werfen oder zum Korb ziehen?" or "Werfen oder passen?"
  if (cleanPrompt.includes('werfen') || cleanPrompt.includes('korb') || cleanPrompt.includes('shoot') || cleanPrompt.includes('drive')) {
    if (cleanT.includes('werf') || cleanT.includes('schieß') || cleanT.includes('shoot') || cleanT === 'korb') {
      return { action: 'shoot' };
    }
    if (cleanT.includes('drei') || cleanT.includes('three')) {
      return { action: 'three_pointer' };
    }
    if (cleanT.includes('zieh') || cleanT.includes('layup') || cleanT.includes('drive')) {
      return { action: 'drive_to_basket' };
    }
    if (cleanT.includes('pass') || cleanT.includes('spiel')) {
      return { action: 'pass', direction: 'forward' };
    }
  }

  // If avatar asked "Bremsen oder Gas geben?"
  if (cleanPrompt.includes('bremsen') || cleanPrompt.includes('gas') || cleanPrompt.includes('brake') || cleanPrompt.includes('accelerate')) {
    if (cleanT.includes('gas') || cleanT.includes('vollgas') || cleanT.includes('schneller') || cleanT.includes('faster')) {
      return { action: 'accelerate' };
    }
    if (cleanT.includes('brems') || cleanT.includes('langsamer') || cleanT.includes('slow')) {
      return { action: 'brake' };
    }
  }

  return null;
}

/**
 * -------------------------------------------------------------
 * 5. BASKETBALL PARSER
 * -------------------------------------------------------------
 */
export function parseBasketballCommand(
  rawText: string,
  lang: Language,
  lastAvatarPrompt?: string
): ParsedVoiceCommand {
  const cleaned = cleanStammeringTranscript(rawText);
  const normalized = normalizeGameSynonyms(cleaned, 'basketball');
  const isFull = isStructuredSentence(cleaned, lang);

  let action = 'unknown';
  let direction: 'left' | 'right' | 'forward' | 'back' | undefined = undefined;
  let target: string | undefined = undefined;
  let isAmbiguous = false;
  let ambiguityPromptDe: string | undefined;
  let ambiguityPromptEn: string | undefined;
  let modeledDe = 'Pass den Ball zu Mia und wirf!';
  let modeledEn = 'Pass the ball to Mia and shoot!';
  let confidence = 0.95;

  // Context resolution check first
  const ctx = resolveShortAnswerWithContext(cleaned, lastAvatarPrompt, 'basketball');
  if (ctx) {
    action = ctx.action || action;
    target = ctx.target || target;
    direction = ctx.direction || direction;
  }

  // Detect Targets
  if (normalized.includes('pass_mia') || cleaned.includes('mia')) target = 'mia';
  else if (normalized.includes('pass_ben') || cleaned.includes('ben')) target = 'ben';
  else if (normalized.includes('pass_leo') || cleaned.includes('leo')) target = 'leo';
  else if (normalized.includes('pass_sophie') || cleaned.includes('sophie')) target = 'sophie';
  else if (normalized.includes('pass_jd') || cleaned.includes('jedidiah') || cleaned.includes('mich') || cleaned.includes('mir')) target = 'jd';

  // Detect Directions
  if (cleaned.includes('links') || cleaned.includes('left')) direction = 'left';
  else if (cleaned.includes('rechts') || cleaned.includes('right')) direction = 'right';
  else if (cleaned.includes('vorne') || cleaned.includes('vorwärts') || cleaned.includes('forward')) direction = 'forward';
  else if (cleaned.includes('zurück') || cleaned.includes('back')) direction = 'back';

  // Three-pointer
  if (action === 'unknown') {
    if (normalized.includes('three_pointer')) {
      action = 'three_pointer';
      modeledDe = 'Mach einen Dreipunktewurf von der Dreierlinie!';
      modeledEn = 'Go for a three-point shot from downtown!';
    } else if (normalized.includes('drive_to_basket')) {
      action = 'drive_to_basket';
      modeledDe = 'Zieh mit Vollgas zum Korb für einen Korbleger!';
      modeledEn = 'Drive fast to the basket for a layup!';
    } else if (normalized.includes('shoot')) {
      action = 'shoot';
      modeledDe = 'Wirf den Ball direkt in den Korb!';
      modeledEn = 'Shoot the ball directly into the hoop!';
    } else if (normalized.includes('dribble')) {
      action = direction === 'left' ? 'dribble_left' : direction === 'right' ? 'dribble_right' : 'dribble_forward';
      modeledDe = direction ? `Dribbel nach ${direction === 'left' ? 'links' : 'rechts'}!` : 'Dribbel nach vorne zum Korb!';
      modeledEn = direction ? `Dribble to the ${direction}!` : 'Dribble forward to the hoop!';
    } else if (normalized.includes('block')) {
      action = 'block';
      modeledDe = 'Spring hoch und block den gegnerischen Wurf!';
      modeledEn = 'Jump up and block the shot!';
    } else if (target || normalized.includes('pass_') || cleaned.includes('pass') || cleaned.includes('spiel') || cleaned.includes('gib')) {
      action = 'pass';
      if (!target && !direction) {
        isAmbiguous = true;
        ambiguityPromptDe = 'Zu wem möchtest du passen — Mia oder Ben?';
        ambiguityPromptEn = 'Who do you want to pass to — Mia or Ben?';
      }
      modeledDe = target ? `Pass den Ball zu ${target === 'mia' ? 'Mia' : target === 'ben' ? 'Ben' : target === 'leo' ? 'Leo' : 'Sophie'}!` : 'Pass den Ball nach links!';
      modeledEn = target ? `Pass the ball to ${target}!` : 'Pass the ball to the left!';
    } else if (direction) {
      action = direction === 'left' ? 'dribble_left' : 'dribble_right';
      modeledDe = `Dribbel nach ${direction === 'left' ? 'links' : 'rechts'}!`;
      modeledEn = `Dribble to the ${direction}!`;
    }
  }

  if (action === 'unknown') {
    confidence = 0.2;
  }

  return {
    rawTranscript: rawText,
    cleanedTranscript: cleaned,
    normalizedTokens: normalized.split(/\s+/),
    gameType: 'basketball',
    action,
    direction,
    target,
    isFullSentence: isFull,
    isAmbiguous,
    ambiguityPromptDe,
    ambiguityPromptEn,
    modeledFullSentenceDe: modeledDe,
    modeledFullSentenceEn: modeledEn,
    confidence,
  };
}

/**
 * -------------------------------------------------------------
 * 6. RACING PARSER
 * -------------------------------------------------------------
 */
export function parseRacingCommand(
  rawText: string,
  lang: Language,
  lastAvatarPrompt?: string
): ParsedVoiceCommand {
  const cleaned = cleanStammeringTranscript(rawText);
  const normalized = normalizeGameSynonyms(cleaned, 'racing');
  const isFull = isStructuredSentence(cleaned, lang);

  let action = 'unknown';
  let direction: 'left' | 'right' | 'forward' | 'back' | undefined = undefined;
  let target: string | undefined = undefined;
  let modeledDe = 'Gib Vollgas und beschleunige auf der Geraden!';
  let modeledEn = 'Accelerate full speed on the straight!';
  let confidence = 0.95;

  // Context resolution check first
  const ctx = resolveShortAnswerWithContext(cleaned, lastAvatarPrompt, 'racing');
  if (ctx) {
    action = ctx.action || action;
    direction = ctx.direction || (ctx.action === 'turn_left' ? 'left' : ctx.action === 'turn_right' ? 'right' : undefined);
  }

  if (cleaned.includes('rot') || cleaned.includes('red')) target = 'red_car';
  else if (cleaned.includes('blau') || cleaned.includes('blue')) target = 'blue_car';
  else if (cleaned.includes('grün') || cleaned.includes('green')) target = 'green_car';

  if (cleaned.includes('links') || cleaned.includes('left') || normalized.includes('turn_left')) direction = 'left';
  else if (cleaned.includes('rechts') || cleaned.includes('right') || normalized.includes('turn_right')) direction = 'right';

  // Multi-step sequencing split (e.g. "zuerst bremsen und danach vollgas")
  const sequenced: Array<{ action: string; direction?: string; target?: string }> = [];
  if (
    cleaned.includes('zuerst') ||
    cleaned.includes('danach') ||
    cleaned.includes('dann') ||
    cleaned.includes('und') ||
    cleaned.includes('first') ||
    cleaned.includes('then') ||
    cleaned.includes('after')
  ) {
    if (normalized.includes('brake') || cleaned.includes('brems') || cleaned.includes('slow')) {
      sequenced.push({ action: 'brake' });
    }
    if (direction) {
      sequenced.push({ action: direction === 'left' ? 'turn_left' : 'turn_right', direction });
    }
    if (normalized.includes('accelerate') || cleaned.includes('gas') || cleaned.includes('speed')) {
      sequenced.push({ action: 'accelerate' });
    }
    if (normalized.includes('overtake') || cleaned.includes('überhol')) {
      sequenced.push({ action: 'overtake', target: target || 'red_car' });
    }
    if (normalized.includes('pit_stop') || cleaned.includes('box')) {
      sequenced.push({ action: 'pit_stop' });
    }
  }

  if (action === 'unknown') {
    if (normalized.includes('accelerate') || cleaned === 'gas' || cleaned === 'vollgas') {
      action = 'accelerate';
      modeledDe = 'Gib Vollgas auf der Geraden!';
      modeledEn = 'Accelerate full speed on the straight!';
    } else if (normalized.includes('brake') || cleaned === 'brems' || cleaned === 'bremse') {
      action = 'brake';
      modeledDe = 'Brems rechtzeitig vor dem Kurvenscheitelpunkt!';
      modeledEn = 'Brake in time before the curve apex!';
    } else if (normalized.includes('overtake') || cleaned === 'überhol' || cleaned === 'vorbei') {
      action = 'overtake';
      modeledDe = `Überhole das ${target === 'blue_car' ? 'blaue' : 'rote'} Auto auf der Innenseite!`;
      modeledEn = `Overtake the ${target === 'blue_car' ? 'blue' : 'red'} car on the inside!`;
    } else if (normalized.includes('pit_stop') || cleaned === 'box' || cleaned === 'boxenstopp') {
      action = 'pit_stop';
      modeledDe = 'Fahr in die Box und wechsle die Reifen!';
      modeledEn = 'Drive into the pits and change the tires!';
    } else if (normalized.includes('follow') || cleaned.includes('windschatten')) {
      action = 'follow';
      modeledDe = 'Fahr im Windschatten des Vordermanns!';
      modeledEn = 'Follow in the slipstream of the car ahead!';
    } else if (direction === 'left' || normalized.includes('turn_left')) {
      action = 'turn_left';
      modeledDe = 'Zieh nach links auf die Ideallinie!';
      modeledEn = 'Steer left onto the racing line!';
    } else if (direction === 'right' || normalized.includes('turn_right')) {
      action = 'turn_right';
      modeledDe = 'Zieh nach rechts auf die Außenbahn!';
      modeledEn = 'Steer right onto the outer lane!';
    }
  }

  if (action === 'unknown') {
    confidence = 0.2;
  }

  return {
    rawTranscript: rawText,
    cleanedTranscript: cleaned,
    normalizedTokens: normalized.split(/\s+/),
    gameType: 'racing',
    action,
    direction,
    target,
    sequencedActions: sequenced.length > 1 ? sequenced : undefined,
    isFullSentence: isFull,
    isAmbiguous: false,
    modeledFullSentenceDe: modeledDe,
    modeledFullSentenceEn: modeledEn,
    confidence,
  };
}

/**
 * -------------------------------------------------------------
 * 7. FOOTBALL PARSER (Baseline)
 * -------------------------------------------------------------
 */
export function parseFootballCommand(
  rawText: string,
  lang: Language,
  lastAvatarPrompt?: string
): ParsedVoiceCommand {
  const cleaned = cleanStammeringTranscript(rawText);
  const normalized = normalizeGameSynonyms(cleaned, 'football');
  const isFull = isStructuredSentence(cleaned, lang);

  let action = 'unknown';
  let direction: 'left' | 'right' | 'forward' | 'back' | 'center' | undefined = undefined;
  let target: string | undefined = undefined;
  let isAmbiguous = false;
  let ambiguityPromptDe: string | undefined;
  let ambiguityPromptEn: string | undefined;
  let modeledDe = 'Pass den Ball nach links!';
  let modeledEn = 'Pass the ball to the left!';
  let confidence = 0.95;

  // Context resolution
  const ctx = resolveShortAnswerWithContext(cleaned, lastAvatarPrompt, 'football');
  if (ctx) {
    action = ctx.action || action;
    target = ctx.target || target;
    direction = ctx.direction || direction;
  }

  // Detect Players
  if (normalized.includes('pass_ben') || cleaned.includes('ben')) target = 'ben';
  else if (normalized.includes('pass_leo') || cleaned.includes('leo')) target = 'leo';
  else if (normalized.includes('pass_mia') || cleaned.includes('mia')) target = 'mia';
  else if (normalized.includes('pass_jd') || cleaned.includes('jedidiah') || cleaned.includes('ich') || cleaned.includes('me')) target = 'jd';

  // Detect Directions
  if (cleaned.includes('links') || cleaned.includes('linke') || cleaned.includes('left')) direction = 'left';
  else if (cleaned.includes('rechts') || cleaned.includes('rechte') || cleaned.includes('right')) direction = 'right';
  else if (cleaned.includes('vorne') || cleaned.includes('vorn') || cleaned.includes('vorwärts') || cleaned.includes('forward')) direction = 'forward';
  else if (cleaned.includes('zurück') || cleaned.includes('hinten') || cleaned.includes('back')) direction = 'back';
  else if (cleaned.includes('mitte') || cleaned.includes('zentrum') || cleaned.includes('center')) direction = 'center';

  if (action === 'unknown') {
    if (normalized.includes('shoot') || cleaned.includes('schieß') || cleaned.includes('schuss') || (cleaned.includes('tor') && !cleaned.includes('torwart'))) {
      action = 'shoot';
      modeledDe = 'Schieß aufs Tor!';
      modeledEn = 'Shoot at the goal!';
    } else if (normalized.includes('cross') || cleaned.includes('flank')) {
      action = 'cross';
      direction = direction || 'center';
      modeledDe = 'Flanke den Ball in die Mitte!';
      modeledEn = 'Cross the ball into the center!';
    } else if (normalized.includes('enter_box') || cleaned.includes('strafraum')) {
      action = 'enter_box';
      direction = 'forward';
      modeledDe = 'Lauf direkt in den Strafraum!';
      modeledEn = 'Run straight into the box!';
    } else if (normalized.includes('defend') || cleaned.includes('verteidig') || cleaned.includes('abwehr')) {
      action = 'defend';
      modeledDe = 'Komm zurück und verteidige!';
      modeledEn = 'Fall back and defend!';
    } else if (cleaned.includes('lauf') || cleaned.includes('rennen') || cleaned.includes('run') || cleaned.includes('sprint')) {
      action = 'run';
      direction = direction || 'forward';
      modeledDe = direction === 'left' ? 'Lauf nach links!' : direction === 'right' ? 'Lauf nach rechts!' : 'Lauf nach vorne in den Strafraum!';
      modeledEn = direction === 'left' ? 'Run to the left!' : direction === 'right' ? 'Run to the right!' : 'Run forward into the box!';
    } else if (target || normalized.includes('pass_') || cleaned.includes('pass') || cleaned.includes('spiel') || cleaned.includes('gib')) {
      action = 'pass';
      if (!target && !direction) {
        isAmbiguous = true;
        ambiguityPromptDe = 'Klar! Zu wem soll ich passen — Ben oder Leo?';
        ambiguityPromptEn = 'Got it! Who should I pass to — Ben or Leo?';
      }
      modeledDe = target ? `Spiel den Ball zu ${target === 'ben' ? 'Ben' : target === 'leo' ? 'Leo' : 'Mia'}!` : `Pass den Ball nach ${direction || 'links'}!`;
      modeledEn = target ? `Pass the ball to ${target}!` : `Pass the ball to the ${direction || 'left'}!`;
    } else if (direction) {
      action = 'move';
      modeledDe = `Spiel den Ball nach ${direction === 'left' ? 'links' : direction === 'right' ? 'rechts' : direction === 'back' ? 'hinten' : 'vorne'}!`;
      modeledEn = `Pass the ball to the ${direction}!`;
    }
  }

  if (action === 'unknown') {
    confidence = 0.2;
  }

  return {
    rawTranscript: rawText,
    cleanedTranscript: cleaned,
    normalizedTokens: normalized.split(/\s+/),
    gameType: 'football',
    action,
    direction,
    target,
    isFullSentence: isFull,
    isAmbiguous,
    ambiguityPromptDe,
    ambiguityPromptEn,
    modeledFullSentenceDe: modeledDe,
    modeledFullSentenceEn: modeledEn,
    confidence,
  };
}

/**
 * -------------------------------------------------------------
 * 8. GUIDE ME PARSER
 * -------------------------------------------------------------
 */
export function parseGuideMeCommand(
  rawText: string,
  lang: Language,
  lastAvatarPrompt?: string
): ParsedVoiceCommand {
  const cleaned = cleanStammeringTranscript(rawText);
  const normalized = normalizeGameSynonyms(cleaned, 'guide_me');
  const isFull = isStructuredSentence(cleaned, lang);

  let action = 'unknown';
  let direction: 'left' | 'right' | 'forward' | 'back' | undefined = undefined;
  let stepCount = 1;
  let target: string | undefined = undefined;
  let modeledDe = 'Gehe zwei Schritte nach vorne!';
  let modeledEn = 'Move two steps forward!';
  let confidence = 0.95;

  const numbersDe: Record<string, number> = { ein: 1, eins: 1, einen: 1, zwei: 2, drei: 3, vier: 4, fünf: 5 };
  const numbersEn: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  const numDict = lang === 'de' ? numbersDe : numbersEn;
  for (const [w, val] of Object.entries(numDict)) {
    if (cleaned.includes(w)) {
      stepCount = val;
      break;
    }
  }
  const digits = cleaned.match(/\b([1-5])\b/);
  if (digits) {
    stepCount = parseInt(digits[1], 10);
  }

  if (cleaned.includes('rot') || cleaned.includes('tür') || cleaned.includes('red') || cleaned.includes('door')) target = 'red_door';
  else if (cleaned.includes('schatz') || cleaned.includes('kiste') || cleaned.includes('chest') || cleaned.includes('treasure')) target = 'treasure';
  else if (cleaned.includes('stern') || cleaned.includes('edelstein') || cleaned.includes('gem') || cleaned.includes('star')) target = 'gem';
  else if (cleaned.includes('brücke') || cleaned.includes('bridge')) target = 'bridge';
  else if (cleaned.includes('tunnel')) target = 'tunnel';

  if (normalized.includes('turn_left') || cleaned.includes('links') || cleaned.includes('left')) {
    action = 'turn_left';
    direction = 'left';
    modeledDe = 'Dreh dich nach links!';
    modeledEn = 'Turn to the left!';
  } else if (normalized.includes('turn_right') || cleaned.includes('rechts') || cleaned.includes('right')) {
    action = 'turn_right';
    direction = 'right';
    modeledDe = 'Dreh dich nach rechts!';
    modeledEn = 'Turn to the right!';
  } else if (normalized.includes('step_back') || cleaned.includes('rück') || cleaned.includes('zurück') || cleaned.includes('back')) {
    action = 'step_back';
    direction = 'back';
    modeledDe = `Gehe ${stepCount > 1 ? stepCount + ' Schritte' : 'einen Schritt'} zurück!`;
    modeledEn = `Move ${stepCount > 1 ? stepCount + ' steps' : 'one step'} back!`;
  } else if (normalized.includes('collect') || cleaned.includes('nimm') || cleaned.includes('sammel') || cleaned.includes('grab')) {
    action = 'collect';
    modeledDe = 'Nimm den Schatz und bring ihn ins Ziel!';
    modeledEn = 'Pick up the treasure!';
  } else if (target) {
    action = 'go_to_target';
    modeledDe = target === 'bridge' ? 'Geh über die Brücke!' : 'Geh zur roten Tür!';
    modeledEn = target === 'bridge' ? 'Cross the bridge!' : 'Go to the red door!';
  } else if (normalized.includes('step_forward') || cleaned.includes('vor') || cleaned.includes('geradeaus') || cleaned.includes('schritt') || cleaned.includes('geh') || cleaned.includes('lauf')) {
    action = 'step_forward';
    direction = 'forward';
    modeledDe = `Gehe ${stepCount > 1 ? stepCount + ' Schritte' : 'einen Schritt'} nach vorne!`;
    modeledEn = `Take ${stepCount > 1 ? stepCount + ' steps' : 'one step'} forward!`;
  }

  if (action === 'unknown') {
    confidence = 0.2;
  }

  return {
    rawTranscript: rawText,
    cleanedTranscript: cleaned,
    normalizedTokens: normalized.split(/\s+/),
    gameType: 'guide_me',
    action,
    direction,
    stepCount,
    target,
    isFullSentence: isFull,
    isAmbiguous: false,
    modeledFullSentenceDe: modeledDe,
    modeledFullSentenceEn: modeledEn,
    confidence,
  };
}

/**
 * Universal Game Command Router
 */
export function parseGameVoiceCommand(
  rawText: string,
  gameType: GameType,
  lang: Language,
  lastAvatarPrompt?: string
): ParsedVoiceCommand {
  switch (gameType) {
    case 'football':
      return parseFootballCommand(rawText, lang, lastAvatarPrompt);
    case 'guide_me':
      return parseGuideMeCommand(rawText, lang, lastAvatarPrompt);
    case 'basketball':
      return parseBasketballCommand(rawText, lang, lastAvatarPrompt);
    case 'racing':
      return parseRacingCommand(rawText, lang, lastAvatarPrompt);
    default:
      return parseFootballCommand(rawText, lang, lastAvatarPrompt);
  }
}
