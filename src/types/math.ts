import { DayOfWeek } from './lernwoerter';
import { Stroke } from './handwriting';

export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';

export type MathExerciseType =
  | 'addition_1000'
  | 'subtraction_1000'
  | 'multiplication_facts'
  | 'division_facts'
  | 'aufgabenfamilie'
  | 'zahlenstrahl'
  | 'nachbarzahlen'
  | 'fehlende_zehner_hunderter'
  | 'verdoppeln_halbieren'
  | 'groessenvergleich'
  | 'zahlenfolgen'
  | 'stellenwert_hze'
  | 'zahlenmauer'
  | 'rechenrad'
  | 'rechentabelle'
  | 'geldbetrag'
  | 'sachaufgabe'
  | 'halbschriftlich';

export interface BaseMathExercise {
  id: string;
  day: DayOfWeek;
  type: MathExerciseType;
  title: string;
  subtitle: string;
  instruction: string;
  skillName: string;
  difficulty?: 'leicht' | 'mittel' | 'profi';
  points: number;
  hint?: string;
  signature?: string; // Stable signature: skillType + operands + operator + structure
  weekNumber?: number;
}

// 1. Number Line (Zahlenstrahl)
export interface NumberLineExercise extends BaseMathExercise {
  type: 'zahlenstrahl';
  rangeMin: number; // e.g. 0
  rangeMax: number; // e.g. 1000
  stepSize: number; // e.g. 100 or 50
  targetNumber: number; // e.g. 450
  mode: 'locate' | 'identify_missing' | 'count_steps';
  stepDelta?: number; // e.g. +100
  labeledTicks: { value: number; isMissing?: boolean }[];
  correctAnswer: number | string;
}

// 2. Number Pyramid (Zahlenmauer)
export interface PyramidBrick {
  id: string;
  value: number;
  isGiven: boolean; // if false, student must solve
}

export interface NumberPyramidExercise extends BaseMathExercise {
  type: 'zahlenmauer';
  // 3-level pyramid:
  // bottom: [b0, b1, b2]
  // middle: [m0, m1]
  // top: [t0]
  bricks: {
    bottom: PyramidBrick[];
    middle: PyramidBrick[];
    top: PyramidBrick[];
  };
}

// 3. Calculation Wheel (Rechenrad)
export interface WheelSpoke {
  operation: '+' | '-' | '×' | '÷';
  operand: number;
  result: number;
}

export interface RechenradExercise extends BaseMathExercise {
  type: 'rechenrad';
  centerNumber: number;
  spokes: WheelSpoke[];
}

// 4. Calculation Table (Rechentabelle)
export interface TableCell {
  rowIdx: number;
  colIdx: number;
  expectedValue: number;
}

export interface RechentabelleExercise extends BaseMathExercise {
  type: 'rechentabelle';
  operator: '+' | '-' | '×';
  colHeaders: number[]; // e.g. [20, 50, 60]
  rowHeaders: number[]; // e.g. [590, 660]
  grid: number[][]; // full solution matrix
}

// 5. Aufgabenfamilie
export interface AufgabenfamilieExercise extends BaseMathExercise {
  type: 'aufgabenfamilie';
  numbers: [number, number, number]; // e.g. [4, 5, 20]
  equations: {
    op1: number;
    operator: '×' | '÷';
    op2: number;
    result: number;
  }[];
}

// 6. Stellenwert H/Z/E
export interface StellenwertExercise extends BaseMathExercise {
  type: 'stellenwert_hze';
  hundreds: number;
  tens: number;
  ones: number;
  totalNumber: number;
  mode: 'blocks_to_number' | 'number_to_hze' | 'equation';
}

// 7. Neighbours (Nachbarzehner / Nachbarhunderter)
export interface NachbarzahlenExercise extends BaseMathExercise {
  type: 'nachbarzahlen';
  number: number; // e.g. 457
  kind: 'zehner' | 'hunderter' | 'both';
  lowerZehner: number; // 450
  upperZehner: number; // 460
  lowerHunderter?: number; // 400
  upperHunderter?: number; // 500
}

// 8. Doubling and Halving
export interface DoublingHalvingExercise extends BaseMathExercise {
  type: 'verdoppeln_halbieren';
  mode: 'verdoppeln' | 'halbieren' | 'umkehr';
  promptNumber: number;
  correctAnswer: number;
  riddleText?: string; // e.g. "Das Doppelte meiner Zahl ist 840. Welche Zahl suche ich?"
}

// 9. Comparison (< > =)
export interface ComparisonItem {
  leftExpr: string;
  leftVal: number;
  rightExpr: string;
  rightVal: number;
  correctOp: '<' | '>' | '=';
}

export interface GroessenvergleichExercise extends BaseMathExercise {
  type: 'groessenvergleich';
  items: ComparisonItem[];
}

// 10. Number Sequences (Zahlenfolgen)
export interface ZahlenfolgenExercise extends BaseMathExercise {
  type: 'zahlenfolgen';
  sequence: (number | null)[];
  stepDescription: string;
  correctAnswers: number[]; // missing numbers
}

// 11. Halbschriftliches Rechnen (Intermediate working)
export interface HalbschriftlichExercise extends BaseMathExercise {
  type: 'halbschriftlich';
  problem: string; // "72 + 25"
  op1: number;
  op2: number;
  operator: '+' | '-';
  step1: { expr: string; result: number }; // "72 + 20 = 92"
  step2: { expr: string; result: number }; // "92 + 5 = 97"
  finalResult: number;
}

// 12. Standard Arithmetic & Missing Operands (Addition / Subtraktion / Multiplikation / Division)
export interface StandardArithmeticExercise extends BaseMathExercise {
  type:
    | 'addition_1000'
    | 'subtraction_1000'
    | 'multiplication_facts'
    | 'division_facts'
    | 'fehlende_zehner_hunderter';
  equation: string; // e.g. "430 + 20", "340 + ___ = 400", "40 ÷ 7"
  blankPosition: 'result' | 'first' | 'second';
  correctAnswer: number | string;
  hasRemainder?: boolean;
  remainder?: number;
  dotArray?: { rows: number; cols: number };
  neighbourStrategy?: {
    prev: string;
    target: string;
    next: string;
  };
}

// 13. Money Word Problem (Geldbetrag)
export interface MoneyItem {
  name: string;
  priceEuro: number;
  icon?: string;
}

export interface GeldbetragExercise extends BaseMathExercise {
  type: 'geldbetrag';
  items: MoneyItem[];
  question: string;
  correctTotalCent: number; // e.g. 2470
  formattedAnswer: string; // "24,70 €"
}

// 14. Sachaufgabe (Word Problem + Missing Info Reasoning)
export interface SachaufgabeExercise extends BaseMathExercise {
  type: 'sachaufgabe';
  topic: 'fahrrad' | 'fussball' | 'einkaufen' | 'schule' | 'taschengeld' | 'buecher';
  story: string;
  question: string;
  isMissingInformation: boolean; // "Nein, es fehlen Informationen"
  missingReason?: string;
  correctAnswer?: number | string;
  unit?: string;
}

export type MathExercise =
  | NumberLineExercise
  | NumberPyramidExercise
  | RechenradExercise
  | RechentabelleExercise
  | AufgabenfamilieExercise
  | StellenwertExercise
  | NachbarzahlenExercise
  | DoublingHalvingExercise
  | GroessenvergleichExercise
  | ZahlenfolgenExercise
  | HalbschriftlichExercise
  | StandardArithmeticExercise
  | GeldbetragExercise
  | SachaufgabeExercise;

// Daily Math Plan: Mon-Fri = 3 tasks, Sat = 5 tasks
export interface DailyMathPlan {
  day: DayOfWeek;
  tasks: MathExercise[];
  isSaturdayChallenge: boolean;
  estimatedMinutes: number; // 10-15
}

// Completed Record for Persistence
export interface CompletedMathRecord {
  id: string; // equals task.id
  taskId: string;
  day: DayOfWeek;
  skillName: string;
  skillType?: string;
  weekId?: string | number;
  pointsEarned: number;
  completedAt: number;
  inputMethod: 'keyboard' | 'handwriting';
  handwrittenStrokes?: Stroke[];
  scratchpadStrokes?: Stroke[];
  attemptCount: number;
  wasCorrectFirstTry: boolean;
  isCorrect?: boolean;
}

// Detailed question history tracking
export interface QuestionHistoryEntry {
  signature: string;
  skillName: string;
  weekNumber: number;
  completedAt: number;
  taskId: string;
}

// Overall Math Progress State
export interface MathProgressState {
  completedTaskIds: string[];
  completedRecords: CompletedMathRecord[];
  skillsMastery: Record<
    string,
    {
      skillName: string;
      consecutiveCorrect: number;
      mastered: boolean;
      lastAttemptAt: number;
      totalAttempts: number;
    }
  >;
  strugglingSkills: string[]; // "Das üben wir noch"
  recentQuestionHistory?: string[]; // Array of unique question signatures seen in recent weeks
  questionHistoryEntries?: QuestionHistoryEntry[]; // Detailed question history tracking
  currentWeekNumber?: number; // Active math week (1, 2, 3, ...)
  pointsToday: number;
  pointsWeek: number;
  streakDays: number;
  lastActiveDate?: string;
}
