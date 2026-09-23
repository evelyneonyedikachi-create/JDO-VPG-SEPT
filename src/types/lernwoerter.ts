export type Wortart = 'Nomen' | 'Verb' | 'Adjektiv';
export type Artikel = 'der' | 'die' | 'das' | '';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type DifficultyLevel = 'starter' | 'profi' | 'meister';

export interface PracticeSentence {
  pronoun: 'ich' | 'du' | 'er' | 'wir' | 'ihr' | 'sie';
  text: string;
}

export interface LernwortItem {
  id: string;
  word: string; // e.g. "das Zimmer" or "schwimmen"
  cleanWord: string; // e.g. "Zimmer" or "schwimmen"
  wortart: Wortart;
  artikel?: Artikel;
  plural?: string; // e.g. "die Zimmer"
  infinitive?: string; // e.g. "schwimmen"
  group: 1 | 2;
  emoji: string;
  distractors: string[]; // e.g. ["das Zimer", "der Zimmer"]
  missingLetterPattern: string; // e.g. "das Z_mm_r"
  sentences: PracticeSentence[];
  exampleSentence?: string;
  needsPracticeNote?: string;
}

export interface DragSentenceWord {
  id: string;
  text: string;
}

export interface SentenceBuilderExercise {
  id: string;
  targetSentence: string;
  words: DragSentenceWord[];
  difficulty: DifficultyLevel;
  hint: string;
  connector?: string;
  translationEn?: string;
}

export interface SatzProfiExercise {
  id: string;
  word: string;
  emoji: string;
  imageHint: string;
  prompt: string;
  baseExample: string;
  expandSuggestions: string[]; // e.g. ["heute", "im Schwimmbad", "mit seinem Freund"]
  longExample: string;
  linkedTask?: {
    firstSentence: string;
    secondSentence: string;
    options: ('und' | 'aber' | 'weil')[];
    correctConnector: 'und' | 'aber' | 'weil';
    combinedSentence: string;
  };
}

export interface BildgeschichteScene {
  id: number;
  title: string;
  emoji: string;
  suggestedWords: string[];
  description: string;
  starterIdeas: string[];
  linesCount?: number;
}

export interface DailyExerciseSet {
  day: DayOfWeek;
  dayNameDe: string;
  themeTitle: string;
  subtitle: string;
  avatarId: 'mia' | 'ben' | 'leo' | 'sophie';
  avatarRoleDe: string;
  estimatedMinutes: number;
}

export interface WeeklyCurriculum {
  id: string;
  weekNumber: number;
  title: string;
  subtitle: string;
  createdAt: string;
  words: LernwortItem[];
  bildgeschichteTitle: string;
  scenes: BildgeschichteScene[];
}

export interface PracticeMistake {
  id: string;
  word: string;
  category: 'Rechtschreibung' | 'Grammatik' | 'Artikel' | 'Satzbau';
  wrongAnswer: string;
  correctAnswer: string;
  timestamp: number;
  resolved: boolean;
}

export interface PointsState {
  pointsToday: number;
  pointsWeek: number; // strictly capped at 100 per week
  cumulativePoints: number; // total accumulated points across all weeks for long-term reward ladder
  lastActiveDate: string; // e.g. "2026-09-22"
}

export type ExerciseStatus = 'open' | 'correct' | 'wrong' | 'skipped' | 'paused' | 'needs_review';

export interface SkippedExerciseItem {
  id: string;
  day: DayOfWeek;
  level: DifficultyLevel;
  exerciseId: string;
  title: string;
  prompt?: string;
  wordClean: string;
  grammarCategory?: 'Rechtschreibung' | 'Grammatik' | 'Artikel' | 'Satzbau';
  skippedAt: number;
  exerciseData?: any; // Full GeneratedExercise payload for instant resumption anywhere
}

export interface PausedSessionState {
  day: DayOfWeek;
  level: DifficultyLevel;
  exerciseIndex: number;
  exerciseQueueIds: string[];
  currentInputText?: string;
  currentSelectedOption?: string;
  savedAt: number;
}

export interface CumulativeRewardMilestone {
  pointsNeeded: number;
  title: string;
  rewardDescription: string;
  emoji: string;
  badgeName: string;
}

export interface MiniExamQuestion {
  id: string;
  wordId: string;
  wordClean: string;
  type: 'sentence_missing_word' | 'sentence_completion' | 'spelling_context' | 'verb_in_sentence' | 'grammar_choice';
  prompt: string;
  sentenceWithBlank: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  emoji?: string;
  hint?: string;
}

export interface MiniExamResult {
  id: string;
  date: string;
  timestamp: number;
  score: number; // e.g. 18 / 20
  totalQuestions: number; // 20
  percentage: number;
  passed: boolean;
  correctWords: string[];
  wrongWords: string[];
}

export interface ChildProgress {
  totalStars: number;
  streakDays: number;
  lastActiveDate: string;
  completedDays: Record<string, boolean>; // e.g. "woche1_monday_starter": true
  dayProgress: Record<DayOfWeek, { starter: boolean; profi: boolean; meister: boolean }>;
  completedStories: {
    title: string;
    date: string;
    text: string;
    wordsCount: number;
    usedLernwoerter: string[];
  }[];
  mistakes: PracticeMistake[];
  masteredWords: string[];
  skippedExercises?: SkippedExerciseItem[];
  pausedSession?: PausedSessionState | null;
  miniExamResults?: MiniExamResult[];
}
