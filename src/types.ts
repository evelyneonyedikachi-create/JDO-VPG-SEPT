export type Language = 'de' | 'en';

export type Emotion = 'happy' | 'curious' | 'encouraging' | 'thinking' | 'surprised' | 'cheering' | 'talking';

export type Viseme = 'closed' | 'open_small' | 'open_medium' | 'open_wide' | 'round' | 'smile';

export interface PlaymateActivity {
  id: string;
  titleDe: string;
  titleEn: string;
  subtitleDe: string;
  subtitleEn: string;
  emoji: string;
  color: string;
  topicId: string;
  environmentId?: string;
  subModeId?: string;
  starterQuestionDe: string;
  starterQuestionEn: string;
}

export interface Playmate {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  taglineDe: string;
  taglineEn: string;
  descriptionDe: string;
  descriptionEn: string;
  interestsDe: string[];
  interestsEn: string[];
  avatarImageUrl?: string;
  voicePreviewDe?: string;
  voicePreviewEn?: string;
  avatarColors: {
    skin: string;
    hair: string;
    shirt: string;
    accent: string;
    eyes: string;
  };
  hairStyle: 'short_curly' | 'ponytail' | 'spiky' | 'long_wavy' | 'cap_forward' | 'bob_cut';
  vocalArchetype: 'warm_thoughtful' | 'energetic_sporty' | 'calm_curious' | 'bright_playful';
  voicePersonaDe: string;
  voicePersonaEn: string;
  identityDe: string;
  identityEn: string;
  voicePitch: number;
  voiceRate: number;
  favoriteTopics: string[];
  greetingDe: string;
  greetingEn: string;
  customActivities?: PlaymateActivity[];
}

export interface PlayEnvironment {
  id: string;
  nameDe: string;
  nameEn: string;
  emoji: string;
  bgGradient: string;
  bgImageUrl?: string;
  accentColor: string;
  soundType: 'stadium' | 'park' | 'room' | 'library' | 'nature' | 'space' | 'beach';
  promptContextDe: string;
  promptContextEn: string;
}

export interface TopicCategory {
  id: string;
  nameDe: string;
  nameEn: string;
  emoji: string;
  badge: string;
  color: string;
  descriptionDe: string;
  descriptionEn: string;
  defaultEnvironment: string;
  defaultPlaymate: string;
  subModes?: {
    id: string;
    nameDe: string;
    nameEn: string;
    promptDe: string;
    promptEn: string;
    starterQuestionDe: string;
    starterQuestionEn: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'jedidiah' | 'jd' | 'playmate' | 'system';
  text: string;
  timestamp: number;
  modeledSentence?: string;
  isPracticeTrigger?: boolean;
  isRepeatRequest?: boolean;
  emotion?: Emotion;
  audioDurationMs?: number;
}

export interface PracticeState {
  active: boolean;
  targetSentence: string;
  repetitionCount: number; // 0, 1, 2
  maxRepetitions: number; // 2
  isSlowMode: boolean;
  historyText?: string;
}

export type ConversationGoal =
  | 'just_chat'
  | 'full_sentences'
  | 'tell_a_story'
  | 'explain_it'
  | 'ask_the_avatar'
  | 'real_world'
  | 'picture_prompt'
  | 'daily_5min'
  | 'practice_german'
  | 'practice_english'
  | 'slow_and_clear';

export type CorrectionLevel = 'light' | 'balanced' | 'practice_heavy';

export interface PersonalMemory {
  favoriteFootballTeam: string;
  favoritePlayer: string;
  safeFriends: string[];
  favoriteCartoon: string;
  recentBook: string;
  holidayMemory: string;
  customNotes?: string;
}

export interface DailyMission {
  id: string;
  titleDe: string;
  titleEn: string;
  goal: ConversationGoal;
  targetPlaymateId: string;
  icon: string;
  badgeDe: string;
  badgeEn: string;
  descriptionDe: string;
  descriptionEn: string;
  starterQuestionDe: string;
  starterQuestionEn: string;
  topicId: string;
}

export interface PictureScene {
  id: string;
  titleDe: string;
  titleEn: string;
  imageUrl: string;
  descriptionDe: string;
  descriptionEn: string;
  starterQuestionsDe: string[];
  starterQuestionsEn: string[];
}

export interface RealWorldScenario {
  id: string;
  titleDe: string;
  titleEn: string;
  emoji: string;
  descriptionDe: string;
  descriptionEn: string;
  avatarRoleDe: string;
  avatarRoleEn: string;
  childGoalDe: string;
  childGoalEn: string;
  starterPromptDe: string;
  starterPromptEn: string;
  starterChipsDe: string[];
  starterChipsEn: string[];
}

export interface SessionStats {
  id: string;
  date: string;
  durationSeconds: number;
  topicId: string;
  topicName: string;
  playmateId: string;
  playmateName: string;
  language: Language;
  goal?: ConversationGoal;
  jdTurnCount: number;
  jedidiahTurnCount?: number;
  aiTurnCount: number;
  fullSentenceCount?: number;
  questionAskedCount?: number;
  newWords: string[];
  greatSentences: string[];
  practicedSentences: string[];
  badgeEarned?: {
    id: string;
    nameDe: string;
    nameEn: string;
    emoji: string;
  };
  playmateFarewell: string;
}

export interface ParentSettings {
  pin: string;
  speechRate: 'slow' | 'normal' | 'faster';
  pauseToleranceMs: number; // 2000 - 4500ms
  gentleGrammarCorrection: boolean;
  correctionLevel: CorrectionLevel;
  listeningBackEnabled: boolean;
  enabledTopics: Record<string, boolean>; // topicId -> boolean
  topicPriorities: Record<string, 'high' | 'normal' | 'low'>;
  childName: string;
  childAge: number;
  allowBilingualSuggestions: boolean;
  soundEffectsEnabled: boolean;
  personalMemory: PersonalMemory;
}

export interface BookInfo {
  title: string;
  author: string;
  coverUrl?: string;
  firstPublishYear?: number;
  summary?: string;
  subjects?: string[];
  keyThemes?: string[];
}

