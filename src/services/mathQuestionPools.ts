/**
 * MATH QUESTION POOLS & ANTI-REPETITION ENGINE
 *
 * Implements deterministic variety, anti-repetition tracking, and safe combination spaces:
 * - Guarantees 8–12+ weeks of fresh, non-repeating question instances.
 * - Stable question signatures: skillType + operands + operator + structure.
 * - History tracking prevents recent duplicates across weeks.
 * - Adaptive remediation: concepts reappear sooner with DIFFERENT number sets (e.g. 6x8, 8x7, 7x6 before 7x8).
 * - Exact unique safe combination counts calculated for every category.
 */

import { DayOfWeek } from '../types/lernwoerter';
import {
  MathExercise,
  StandardArithmeticExercise,
  DoublingHalvingExercise,
  NachbarzahlenExercise,
  NumberPyramidExercise,
} from '../types/math';
import {
  calculateAddition,
  calculateSubtraction,
  calculateMultiplication,
  calculateDivision,
  generateExactDivision,
  calculateDouble,
  calculateHalf,
  calculateNeighbours,
  calculateNumberWall,
  validateMathExercise,
} from './deterministicMathEngine';

// Stable signature builder
export function buildMathSignature(params: {
  skillType: string;
  operands: (number | string)[];
  operator: string;
  structure?: string;
}): string {
  const opStr = params.operands.join(params.operator);
  if (params.structure) {
    return `${params.skillType}:${opStr}:${params.structure}`;
  }
  return `${params.skillType}:${opStr}`;
}

export function getMathExerciseSignature(exercise: MathExercise): string {
  if (exercise.signature) return exercise.signature;

  switch (exercise.type) {
    case 'multiplication_facts': {
      const sa = exercise as StandardArithmeticExercise;
      const match = sa.equation.match(/(\d+)\s*×\s*(\d+)/);
      const a = match ? match[1] : '';
      const b = match ? match[2] : '';
      if (sa.blankPosition === 'second') {
        return `multiplication:${a}x${b}:blank_factor`;
      }
      if (sa.blankPosition === 'first') {
        return `multiplication:${a}x${b}:blank_first`;
      }
      return `multiplication:${a}x${b}`;
    }
    case 'division_facts': {
      const sa = exercise as StandardArithmeticExercise;
      const match = sa.equation.match(/(\d+)\s*÷\s*(\d+)/);
      const div = match ? match[1] : '';
      const divisor = match ? match[2] : '';
      return `division:${div}/${divisor}`;
    }
    case 'subtraction_1000': {
      const sa = exercise as StandardArithmeticExercise;
      const match = sa.equation.match(/(\d+)\s*−\s*(\d+)/);
      const a = match ? match[1] : '';
      const b = match ? match[2] : '';
      if (sa.blankPosition === 'first') {
        return `subtraction:${a}-${b}:blank_start`;
      }
      if (sa.blankPosition === 'second') {
        return `subtraction:${a}-${b}:blank_subtrahend`;
      }
      return `subtraction:${a}-${b}`;
    }
    case 'addition_1000': {
      const sa = exercise as StandardArithmeticExercise;
      const match = sa.equation.match(/(\d+)\s*\+\s*(\d+)/);
      const a = match ? match[1] : '';
      const b = match ? match[2] : '';
      if (sa.blankPosition === 'second') {
        return `addition:${a}+${b}:blank_second`;
      }
      if (sa.blankPosition === 'first') {
        return `addition:${a}+${b}:blank_first`;
      }
      return `addition:${a}+${b}`;
    }
    case 'nachbarzahlen': {
      const nz = exercise as NachbarzahlenExercise;
      if (nz.kind === 'zehner') {
        return `neighbourTens:${nz.number}`;
      }
      if (nz.kind === 'hunderter') {
        return `neighbourHundreds:${nz.number}`;
      }
      return `neighbourNumbers:${nz.number}`;
    }
    case 'verdoppeln_halbieren': {
      const vh = exercise as DoublingHalvingExercise;
      if (vh.mode === 'verdoppeln') {
        return `doubling:${vh.promptNumber}`;
      }
      if (vh.mode === 'halbieren') {
        return `halving:${vh.promptNumber}`;
      }
      if (vh.mode === 'umkehr') {
        return `doubling_inverse:${vh.promptNumber}`;
      }
      return `doubling_halving:${vh.promptNumber}`;
    }
    case 'zahlenmauer': {
      const pyr = exercise as NumberPyramidExercise;
      const b0 = pyr.bricks.bottom[0]?.value ?? 0;
      const b1 = pyr.bricks.bottom[1]?.value ?? 0;
      const b2 = pyr.bricks.bottom[2]?.value ?? 0;
      return `numberWall:${b0}|${b1}|${b2}`;
    }
    default:
      return `${exercise.type}:${exercise.id}`;
  }
}

// -------------------------------------------------------------
// SAFE COMBINATION POOLS FOR EVERY CURRICULUM SLOT
// -------------------------------------------------------------

// Slot 1 (Monday): Addition bis 1000 (Zehner addieren im Hunderter-Raum, kein Zehnerübergang)
export interface AdditionSlotItem {
  a: number;
  b: number;
  hint: string;
}
export const POOL_MON_ADDITION: AdditionSlotItem[] = [
  { a: 430, b: 20, hint: '💡 Tipp: Behalte die Hunderter (400) im Kopf und addiere 30 + 20.' },
  { a: 320, b: 50, hint: '💡 Tipp: Behalte 300 im Kopf und addiere 20 + 50 = 70.' },
  { a: 540, b: 30, hint: '💡 Tipp: 500 bleibt, addiere die Zehner: 40 + 30 = 70.' },
  { a: 610, b: 40, hint: '💡 Tipp: Rechne 10 + 40 = 50, also 650.' },
  { a: 250, b: 30, hint: '💡 Tipp: 200 bleibt stehen: 50 + 30 = 80.' },
  { a: 730, b: 50, hint: '💡 Tipp: Addiere 30 + 50 = 80 zu 700 dazu.' },
  { a: 160, b: 20, hint: '💡 Tipp: Rechne mit den Zehnern: 60 + 20 = 80.' },
  { a: 820, b: 40, hint: '💡 Tipp: 800 im Kopf behalten: 20 + 40 = 60.' },
  { a: 350, b: 40, hint: '💡 Tipp: 50 + 40 = 90, also 390.' },
  { a: 420, b: 50, hint: '💡 Tipp: 20 + 50 = 70, zusammen 470.' },
  { a: 530, b: 30, hint: '💡 Tipp: 30 + 30 = 60, zusammen 560.' },
  { a: 640, b: 20, hint: '💡 Tipp: 40 + 20 = 60, zusammen 660.' },
  { a: 710, b: 60, hint: '💡 Tipp: 10 + 60 = 70, zusammen 770.' },
  { a: 260, b: 30, hint: '💡 Tipp: 60 + 30 = 90, zusammen 290.' },
  { a: 440, b: 40, hint: '💡 Tipp: 40 + 40 = 80, zusammen 480.' },
  { a: 830, b: 30, hint: '💡 Tipp: 30 + 30 = 60, zusammen 860.' },
];

// Slot 2 (Monday): Nachbarzehner bestimmen
export interface NachbarzehnerSlotItem {
  n: number;
}
export const POOL_MON_NACHBARZEHNER: NachbarzehnerSlotItem[] = [
  { n: 457 },
  { n: 384 },
  { n: 628 },
  { n: 519 },
  { n: 763 },
  { n: 246 },
  { n: 872 },
  { n: 195 },
  { n: 438 },
  { n: 671 },
  { n: 354 },
  { n: 589 },
  { n: 742 },
  { n: 267 },
  { n: 813 },
  { n: 926 },
];

// Slot 3 (Monday): Verdoppeln bis 1000
export interface VerdoppelnSlotItem {
  n: number;
  hint: string;
}
export const POOL_MON_VERDOPPELN: VerdoppelnSlotItem[] = [
  { n: 320, hint: '💡 Tipp: Zerlege 320: Verdopple zuerst 300 und danach 20.' },
  { n: 240, hint: '💡 Tipp: Verdopple 200 (400) und verdopple 40 (80).' },
  { n: 410, hint: '💡 Tipp: Das Doppelte von 400 ist 800, das Doppelte von 10 ist 20.' },
  { n: 350, hint: '💡 Tipp: Verdopple 300 (600) und 50 (100). Zusammen: 700.' },
  { n: 230, hint: '💡 Tipp: Verdopple 200 (400) und 30 (60).' },
  { n: 450, hint: '💡 Tipp: Das Doppelte von 400 ist 800, 50 mal 2 ist 100. Zusammen: 900.' },
  { n: 180, hint: '💡 Tipp: Verdopple 100 (200) und 80 (160). Zusammen: 360.' },
  { n: 340, hint: '💡 Tipp: 300 × 2 = 600, 40 × 2 = 80.' },
  { n: 260, hint: '💡 Tipp: 200 × 2 = 400, 60 × 2 = 120. Zusammen: 520.' },
  { n: 430, hint: '💡 Tipp: 400 × 2 = 800, 30 × 2 = 60.' },
  { n: 370, hint: '💡 Tipp: 300 × 2 = 600, 70 × 2 = 140. Zusammen: 740.' },
  { n: 220, hint: '💡 Tipp: Verdopple 200 (400) und 20 (40).' },
  { n: 160, hint: '💡 Tipp: 100 × 2 = 200, 60 × 2 = 120. Zusammen: 320.' },
  { n: 440, hint: '💡 Tipp: 400 × 2 = 800, 40 × 2 = 80.' },
  { n: 330, hint: '💡 Tipp: 300 × 2 = 600, 30 × 2 = 60.' },
  { n: 470, hint: '💡 Tipp: 400 × 2 = 800, 70 × 2 = 140. Zusammen: 940.' },
];

// Slot 4 (Tuesday): Multiplikation Einmaleins mit Nachbarstrategie & Punktfeld
export interface MultiplikationSlotItem {
  a: number;
  b: number;
  neighbourStrategy?: { prev: string; target: string; next: string };
  hint: string;
}
export const POOL_TUE_MULTIPLIKATION: MultiplikationSlotItem[] = [
  {
    a: 6,
    b: 4,
    neighbourStrategy: { prev: '5 × 4 = 20', target: '6 × 4 = ?', next: '7 × 4 = 28' },
    hint: '💡 Tipp: Nutze die Nachbaraufgabe: 5 × 4 = 20. Addiere noch 4 dazu.',
  },
  {
    a: 7,
    b: 3,
    neighbourStrategy: { prev: '6 × 3 = 18', target: '7 × 3 = ?', next: '8 × 3 = 24' },
    hint: '💡 Tipp: Nutze 6 × 3 = 18. Addiere noch eine 3 dazu.',
  },
  {
    a: 8,
    b: 4,
    neighbourStrategy: { prev: '7 × 4 = 28', target: '8 × 4 = ?', next: '9 × 4 = 36' },
    hint: '💡 Tipp: Verdopple 4 × 4 = 16: Das Doppelte von 16 ist 32.',
  },
  {
    a: 4,
    b: 6,
    neighbourStrategy: { prev: '3 × 6 = 18', target: '4 × 6 = ?', next: '5 × 6 = 30' },
    hint: '💡 Tipp: Nutze die Tauschaufgabe: 6 × 4 = 24.',
  },
  {
    a: 6,
    b: 5,
    neighbourStrategy: { prev: '5 × 5 = 25', target: '6 × 5 = ?', next: '7 × 5 = 35' },
    hint: '💡 Tipp: Zähle in 5er-Schritten bis 6 mal 5.',
  },
  {
    a: 7,
    b: 4,
    neighbourStrategy: { prev: '6 × 4 = 24', target: '7 × 4 = ?', next: '8 × 4 = 32' },
    hint: '💡 Tipp: 5 × 4 = 20, plus 2 × 4 = 8.',
  },
  {
    a: 3,
    b: 8,
    neighbourStrategy: { prev: '2 × 8 = 16', target: '3 × 8 = ?', next: '4 × 8 = 32' },
    hint: '💡 Tipp: 2 × 8 = 16. Addiere noch 8 dazu.',
  },
  {
    a: 5,
    b: 7,
    neighbourStrategy: { prev: '4 × 7 = 28', target: '5 × 7 = ?', next: '6 × 7 = 42' },
    hint: '💡 Tipp: Die Hälfte von 10 × 7 (70) ist 35.',
  },
  {
    a: 6,
    b: 6,
    neighbourStrategy: { prev: '5 × 6 = 30', target: '6 × 6 = ?', next: '7 × 6 = 42' },
    hint: '💡 Tipp: Quadratzahl! 5 × 6 = 30, plus 6.',
  },
  {
    a: 4,
    b: 7,
    neighbourStrategy: { prev: '3 × 7 = 21', target: '4 × 7 = ?', next: '5 × 7 = 35' },
    hint: '💡 Tipp: Verdopple 2 × 7 = 14: Das Doppelte ist 28.',
  },
  {
    a: 8,
    b: 3,
    neighbourStrategy: { prev: '7 × 3 = 21', target: '8 × 3 = ?', next: '9 × 3 = 27' },
    hint: '💡 Tipp: 3er-Reihe: 8 × 3 ist das Gleiche wie 3 × 8.',
  },
  {
    a: 7,
    b: 5,
    neighbourStrategy: { prev: '6 × 5 = 30', target: '7 × 5 = ?', next: '8 × 5 = 40' },
    hint: '💡 Tipp: 5er-Schritte: 7 × 5 = 35.',
  },
];

// Slot 5 (Tuesday): Exakte Division (12 distinct facts)
export interface DivisionSlotItem {
  dividend: number;
  divisor: number;
  quotient: number;
  hint: string;
}
export const POOL_TUE_DIVISION: DivisionSlotItem[] = [
  { dividend: 48, divisor: 6, quotient: 8, hint: '💡 Tipp: Nutze die Umkehraufgabe: Welche Zahl mal 6 ergibt 48?' },
  { dividend: 36, divisor: 4, quotient: 9, hint: '💡 Tipp: Wie oft passt die 4 in die 36? Denke an 9 × 4.' },
  { dividend: 42, divisor: 7, quotient: 6, hint: '💡 Tipp: Welche Zahl mal 7 ergibt 42?' },
  { dividend: 32, divisor: 8, quotient: 4, hint: '💡 Tipp: Nutze 4 × 8 = 32.' },
  { dividend: 28, divisor: 4, quotient: 7, hint: '💡 Tipp: Die Umkehraufgabe ist 7 × 4 = 28.' },
  { dividend: 40, divisor: 5, quotient: 8, hint: '💡 Tipp: Wie oft passt die 5 in die 40? 8 × 5 = 40.' },
  { dividend: 24, divisor: 3, quotient: 8, hint: '💡 Tipp: Welche Zahl mal 3 ergibt 24?' },
  { dividend: 27, divisor: 9, quotient: 3, hint: '💡 Tipp: 3 × 9 = 27.' },
  { dividend: 18, divisor: 2, quotient: 9, hint: '💡 Tipp: Die Hälfte von 18 ist 9 (9 × 2 = 18).' },
  { dividend: 16, divisor: 4, quotient: 4, hint: '💡 Tipp: Quadratzahl: 4 × 4 = 16.' },
  { dividend: 21, divisor: 3, quotient: 7, hint: '💡 Tipp: 7 × 3 = 21.' },
  { dividend: 15, divisor: 5, quotient: 3, hint: '💡 Tipp: 3 × 5 = 15.' },
];

// Slot 6 (Tuesday): Zahlenmauer
export interface ZahlenmauerSlotItem {
  b0: number;
  b1: number;
  b2: number;
  hint: string;
}
export const POOL_TUE_ZAHLENMAUER: ZahlenmauerSlotItem[] = [
  { b0: 120, b1: 80, b2: 150, hint: '💡 Tipp: Rechne von unten nach oben: 120 + 80 = Mitte links, 80 + 150 = Mitte rechts.' },
  { b0: 110, b1: 90, b2: 130, hint: '💡 Tipp: Unten addieren: 110 + 90 = 200, 90 + 130 = 220.' },
  { b0: 140, b1: 70, b2: 160, hint: '💡 Tipp: 140 + 70 = 210, 70 + 160 = 230.' },
  { b0: 90, b1: 110, b2: 80, hint: '💡 Tipp: 90 + 110 = 200, 110 + 80 = 190.' },
  { b0: 130, b1: 60, b2: 170, hint: '💡 Tipp: 130 + 60 = 190, 60 + 170 = 230.' },
  { b0: 100, b1: 120, b2: 90, hint: '💡 Tipp: 100 + 120 = 220, 120 + 90 = 210.' },
  { b0: 150, b1: 50, b2: 140, hint: '💡 Tipp: 150 + 50 = 200, 50 + 140 = 190.' },
  { b0: 80, b1: 130, b2: 110, hint: '💡 Tipp: 80 + 130 = 210, 130 + 110 = 240.' },
  { b0: 160, b1: 70, b2: 120, hint: '💡 Tipp: 160 + 70 = 230, 70 + 120 = 190.' },
  { b0: 120, b1: 100, b2: 130, hint: '💡 Tipp: 120 + 100 = 220, 100 + 130 = 230.' },
  { b0: 140, b1: 80, b2: 110, hint: '💡 Tipp: 140 + 80 = 220, 80 + 110 = 190.' },
  { b0: 90, b1: 140, b2: 70, hint: '💡 Tipp: 90 + 140 = 230, 140 + 70 = 210.' },
];

// Slot 7 (Wednesday): Ergänzen zum Hunderter (Lücke)
export interface ErgaenzenSlotItem {
  a: number;
  b: number;
  targetHundred: number;
  hint: string;
}
export const POOL_WED_ERGAENZEN: ErgaenzenSlotItem[] = [
  { a: 340, b: 60, targetHundred: 400, hint: '💡 Tipp: Wie viel fehlt von 340 bis zum nächsten vollen Hunderter (400)?' },
  { a: 520, b: 80, targetHundred: 600, hint: '💡 Tipp: Von 20 bis 100 fehlen 80. Also 520 + 80 = 600.' },
  { a: 270, b: 30, targetHundred: 300, hint: '💡 Tipp: Wie viel fehlt von 70 bis 100? Genau 30!' },
  { a: 630, b: 70, targetHundred: 700, hint: '💡 Tipp: Denke an verliebte Zahlen: 30 und 70 ergeben 100.' },
  { a: 410, b: 90, targetHundred: 500, hint: '💡 Tipp: Von 10 bis 100 fehlen 90.' },
  { a: 750, b: 50, targetHundred: 800, hint: '💡 Tipp: 50 + 50 = 100, also 750 + 50 = 800.' },
  { a: 180, b: 20, targetHundred: 200, hint: '💡 Tipp: Von 80 bis 100 fehlen nur 20.' },
  { a: 460, b: 40, targetHundred: 500, hint: '💡 Tipp: 60 + 40 = 100.' },
  { a: 580, b: 20, targetHundred: 600, hint: '💡 Tipp: Ergänze 20 zum nächsten Hunderter.' },
  { a: 330, b: 70, targetHundred: 400, hint: '💡 Tipp: 30 + 70 = 100.' },
  { a: 720, b: 80, targetHundred: 800, hint: '💡 Tipp: 20 + 80 = 100.' },
  { a: 260, b: 40, targetHundred: 300, hint: '💡 Tipp: 60 + 40 = 100.' },
];

// Slot 8 (Wednesday): Multiplikation (7er / 8er / 9er Reihe)
export interface MultiplicationChallengingSlotItem {
  a: number;
  b: number;
  hint: string;
}
export const POOL_WED_MULTIPLIKATION: MultiplicationChallengingSlotItem[] = [
  { a: 7, b: 8, hint: '💡 Tipp: Denke an 5 × 8 = 40 und addiere 2 × 8 = 16 dazu (40 + 16 = 56).' },
  { a: 8, b: 7, hint: '💡 Tipp: Tauschaufgabe zu 7 × 8! Nutze 8 × 5 = 40 plus 8 × 2 = 16.' },
  { a: 6, b: 8, hint: '💡 Tipp: 5 × 8 = 40, plus eine weitere 8 ergibt 48.' },
  { a: 9, b: 7, hint: '💡 Tipp: 10 × 7 = 70. Ziehe 7 ab: 70 − 7 = 63.' },
  { a: 8, b: 6, hint: '💡 Tipp: 8 × 5 = 40, plus 8 = 48.' },
  { a: 7, b: 9, hint: '💡 Tipp: 7 × 10 = 70. Ziehe 7 ab: 70 − 7 = 63.' },
  { a: 8, b: 8, hint: '💡 Tipp: Quadratzahl! 8 × 8 = 64.' },
  { a: 9, b: 8, hint: '💡 Tipp: 10 × 8 = 80. Ziehe 8 ab: 80 − 8 = 72.' },
  { a: 7, b: 6, hint: '💡 Tipp: 7 × 5 = 35. Addiere 7: 35 + 7 = 42.' },
  { a: 8, b: 9, hint: '💡 Tipp: 8 × 10 = 80. Ziehe 8 ab: 80 − 8 = 72.' },
  { a: 6, b: 9, hint: '💡 Tipp: 6 × 10 = 60. Ziehe 6 ab: 60 − 6 = 54.' },
  { a: 9, b: 9, hint: '💡 Tipp: 9 × 10 = 90. Ziehe 9 ab: 81.' },
];

// Slot 9 (Wednesday): Nachbarhunderter bestimmen
export interface NachbarhunderterSlotItem {
  n: number;
}
export const POOL_WED_NACHBARHUNDERTER: NachbarhunderterSlotItem[] = [
  { n: 457 },
  { n: 632 },
  { n: 284 },
  { n: 715 },
  { n: 349 },
  { n: 578 },
  { n: 823 },
  { n: 164 },
  { n: 691 },
  { n: 426 },
  { n: 785 },
  { n: 352 },
  { n: 517 },
  { n: 863 },
  { n: 238 },
  { n: 941 },
];

// Slot 10 (Thursday): Subtraktion bis 1000 (Zehner abziehen)
export interface SubtraktionSlotItem {
  a: number;
  b: number;
  hint: string;
}
export const POOL_THU_SUBTRAKTION: SubtraktionSlotItem[] = [
  { a: 860, b: 40, hint: '💡 Tipp: Rechne nur mit den Zehnern: 60 − 40 = 20. Die 800 bleibt unverändert.' },
  { a: 770, b: 30, hint: '💡 Tipp: 70 − 30 = 40, also bleibt 740.' },
  { a: 590, b: 50, hint: '💡 Tipp: 90 − 50 = 40, also 540.' },
  { a: 680, b: 40, hint: '💡 Tipp: 80 − 40 = 40, also 640.' },
  { a: 950, b: 30, hint: '💡 Tipp: 50 − 30 = 20, also 920.' },
  { a: 480, b: 50, hint: '💡 Tipp: 80 − 50 = 30, also 430.' },
  { a: 390, b: 40, hint: '💡 Tipp: 90 − 40 = 50, also 350.' },
  { a: 760, b: 20, hint: '💡 Tipp: 60 − 20 = 40, also 740.' },
  { a: 870, b: 50, hint: '💡 Tipp: 70 − 50 = 20, also 820.' },
  { a: 560, b: 30, hint: '💡 Tipp: 60 − 30 = 30, also 530.' },
  { a: 670, b: 40, hint: '💡 Tipp: 70 − 40 = 30, also 630.' },
  { a: 940, b: 20, hint: '💡 Tipp: 40 − 20 = 20, also 920.' },
];

// Slot 11 (Thursday): Division Fakten (12 distinct facts)
export interface DivisionThuSlotItem {
  dividend: number;
  divisor: number;
  quotient: number;
  hint: string;
}
export const POOL_THU_DIVISION: DivisionThuSlotItem[] = [
  { dividend: 35, divisor: 5, quotient: 7, hint: '💡 Tipp: Zähle in 5er-Schritten bis 35: 5, 10, 15, 20, 25, 30, 35.' },
  { dividend: 45, divisor: 5, quotient: 9, hint: '💡 Tipp: 9 × 5 = 45. Die 5 passt 9 mal hinein.' },
  { dividend: 56, divisor: 8, quotient: 7, hint: '💡 Tipp: Denke an 7 × 8 = 56.' },
  { dividend: 30, divisor: 5, quotient: 6, hint: '💡 Tipp: 6 × 5 = 30.' },
  { dividend: 49, divisor: 7, quotient: 7, hint: '💡 Tipp: Quadratzahl: 7 × 7 = 49.' },
  { dividend: 40, divisor: 8, quotient: 5, hint: '💡 Tipp: 5 × 8 = 40.' },
  { dividend: 25, divisor: 5, quotient: 5, hint: '💡 Tipp: 5 × 5 = 25.' },
  { dividend: 36, divisor: 6, quotient: 6, hint: '💡 Tipp: 6 × 6 = 36.' },
  { dividend: 28, divisor: 7, quotient: 4, hint: '💡 Tipp: 4 × 7 = 28.' },
  { dividend: 20, divisor: 4, quotient: 5, hint: '💡 Tipp: 5 × 4 = 20.' },
  { dividend: 18, divisor: 6, quotient: 3, hint: '💡 Tipp: 3 × 6 = 18.' },
  { dividend: 14, divisor: 2, quotient: 7, hint: '💡 Tipp: 7 × 2 = 14.' },
];

// Slot 12 (Thursday): Halbieren
export interface HalbierenSlotItem {
  n: number;
  hint: string;
}
export const POOL_THU_HALBIEREN: HalbierenSlotItem[] = [
  { n: 860, hint: '💡 Tipp: Zerlege 860: Halbiere zuerst 800 (400) und danach 60 (30).' },
  { n: 640, hint: '💡 Tipp: Halbiere 600 (300) und halbiere 40 (20). Zusammen: 320.' },
  { n: 720, hint: '💡 Tipp: Halbiere 700 (350) und 20 (10). Oder: 72 Zehner durch 2 = 36 Zehner (360).' },
  { n: 480, hint: '💡 Tipp: Halbiere 400 (200) und 80 (40). Zusammen: 240.' },
  { n: 960, hint: '💡 Tipp: Halbiere 900 (450) und 60 (30). Zusammen: 480.' },
  { n: 540, hint: '💡 Tipp: 54 Zehner geteilt durch 2 = 27 Zehner (270).' },
  { n: 380, hint: '💡 Tipp: 300 halbieren (150) plus 80 halbieren (40) = 190.' },
  { n: 760, hint: '💡 Tipp: 700 halbieren (350) plus 60 halbieren (30) = 380.' },
  { n: 820, hint: '💡 Tipp: 800 halbieren (400) plus 20 halbieren (10) = 410.' },
  { n: 680, hint: '💡 Tipp: 600 halbieren (300) plus 80 halbieren (40) = 340.' },
  { n: 520, hint: '💡 Tipp: 500 halbieren (250) plus 20 halbieren (10) = 260.' },
  { n: 940, hint: '💡 Tipp: 900 halbieren (450) plus 40 halbieren (20) = 470.' },
];

// Slot 13 (Friday): Addition mit Zehnerübergang
export interface AdditionUebergangSlotItem {
  a: number;
  b: number;
  hint: string;
}
export const POOL_FRI_ADDITION: AdditionUebergangSlotItem[] = [
  { a: 560, b: 70, hint: '💡 Tipp: Rechne schrittweise: 560 + 40 = 600, dann noch die restlichen 30 dazu (630).' },
  { a: 480, b: 50, hint: '💡 Tipp: 480 + 20 = 500, dann noch 30 dazu = 530.' },
  { a: 370, b: 60, hint: '💡 Tipp: 370 + 30 = 400, plus 30 = 430.' },
  { a: 650, b: 80, hint: '💡 Tipp: 650 + 50 = 700, plus 30 = 730.' },
  { a: 290, b: 40, hint: '💡 Tipp: 290 + 10 = 300, plus 30 = 330.' },
  { a: 760, b: 70, hint: '💡 Tipp: 760 + 40 = 800, plus 30 = 830.' },
  { a: 470, b: 80, hint: '💡 Tipp: 470 + 30 = 500, plus 50 = 550.' },
  { a: 580, b: 50, hint: '💡 Tipp: 580 + 20 = 600, plus 30 = 630.' },
  { a: 360, b: 70, hint: '💡 Tipp: 360 + 40 = 400, plus 30 = 430.' },
  { a: 690, b: 40, hint: '💡 Tipp: 690 + 10 = 700, plus 30 = 730.' },
  { a: 280, b: 60, hint: '💡 Tipp: 280 + 20 = 300, plus 40 = 340.' },
  { a: 740, b: 90, hint: '💡 Tipp: 740 + 60 = 800, plus 30 = 830.' },
];

// Slot 14 (Friday): Multiplikation mit Lücke
export interface MultiplikationLueckeSlotItem {
  a: number;
  b: number;
  product: number;
  hint: string;
}
export const POOL_FRI_MULTIPLIKATION_LUECKE: MultiplikationLueckeSlotItem[] = [
  { a: 8, b: 6, product: 48, hint: '💡 Tipp: Wie oft passt die 8 in die 48? Denke an die 8er-Reihe.' },
  { a: 7, b: 6, product: 42, hint: '💡 Tipp: Welche Zahl mal 7 ergibt 42? Denke an 6 × 7.' },
  { a: 6, b: 9, product: 54, hint: '💡 Tipp: Welche Zahl mal 6 ergibt 54? 9 × 6 = 54.' },
  { a: 9, b: 4, product: 36, hint: '💡 Tipp: 9 mal welche Zahl ergibt 36? Denke an 4 × 9.' },
  { a: 8, b: 7, product: 56, hint: '💡 Tipp: 8 × ___ = 56. 7 × 8 = 56.' },
  { a: 7, b: 5, product: 35, hint: '💡 Tipp: 7 mal wie viel ergibt 35? 5 × 7 = 35.' },
  { a: 6, b: 6, product: 36, hint: '💡 Tipp: Welche Zahl mit sich selbst multipliziert ergibt 36?' },
  { a: 9, b: 8, product: 72, hint: '💡 Tipp: 9 × ___ = 72. 8 × 9 = 72.' },
  { a: 4, b: 8, product: 32, hint: '💡 Tipp: 4 × ___ = 32. 8 × 4 = 32.' },
  { a: 8, b: 8, product: 64, hint: '💡 Tipp: 8 × ___ = 64. Quadratzahl: 8 × 8!' },
  { a: 7, b: 9, product: 63, hint: '💡 Tipp: 7 × ___ = 63. 9 × 7 = 63.' },
  { a: 6, b: 7, product: 42, hint: '💡 Tipp: 6 × ___ = 42. 7 × 6 = 42.' },
];

// Slot 15 (Friday): Zahlenmauer Variante
export const POOL_FRI_ZAHLENMAUER: ZahlenmauerSlotItem[] = [
  { b0: 70, b1: 50, b2: 90, hint: '💡 Tipp: Addiere die Grundsteine: 70 + 50 = Mitte links, 50 + 90 = Mitte rechts.' },
  { b0: 60, b1: 80, b2: 50, hint: '💡 Tipp: 60 + 80 = 140, 80 + 50 = 130.' },
  { b0: 80, b1: 40, b2: 70, hint: '💡 Tipp: 80 + 40 = 120, 40 + 70 = 110.' },
  { b0: 50, b1: 90, b2: 60, hint: '💡 Tipp: 50 + 90 = 140, 90 + 60 = 150.' },
  { b0: 90, b1: 30, b2: 80, hint: '💡 Tipp: 90 + 30 = 120, 30 + 80 = 110.' },
  { b0: 70, b1: 60, b2: 50, hint: '💡 Tipp: 70 + 60 = 130, 60 + 50 = 110.' },
  { b0: 40, b1: 100, b2: 60, hint: '💡 Tipp: 40 + 100 = 140, 100 + 60 = 160.' },
  { b0: 80, b1: 70, b2: 40, hint: '💡 Tipp: 80 + 70 = 150, 70 + 40 = 110.' },
  { b0: 60, b1: 50, b2: 80, hint: '💡 Tipp: 60 + 50 = 110, 50 + 80 = 130.' },
  { b0: 100, b1: 40, b2: 70, hint: '💡 Tipp: 100 + 40 = 140, 40 + 70 = 110.' },
  { b0: 50, b1: 80, b2: 90, hint: '💡 Tipp: 50 + 80 = 130, 80 + 90 = 170.' },
  { b0: 70, b1: 40, b2: 60, hint: '💡 Tipp: 70 + 40 = 110, 40 + 60 = 100.' },
];

// Slot 16 (Saturday): Subtraktion mit Lücke (Startzahl ermitteln)
export interface SubtraktionLueckeSlotItem {
  a: number;
  b: number;
  diff: number;
  hint: string;
}
export const POOL_SAT_SUBTRAKTION_LUECKE: SubtraktionLueckeSlotItem[] = [
  { a: 300, b: 70, diff: 230, hint: '💡 Tipp: Nutze die Umkehraufgabe: Addiere 230 + 70, um die Startzahl zu finden.' },
  { a: 400, b: 60, diff: 340, hint: '💡 Tipp: Addiere 340 + 60 = 400.' },
  { a: 500, b: 50, diff: 450, hint: '💡 Tipp: 450 + 50 = 500.' },
  { a: 600, b: 80, diff: 520, hint: '💡 Tipp: 520 + 80 = 600.' },
  { a: 700, b: 40, diff: 660, hint: '💡 Tipp: 660 + 40 = 700.' },
  { a: 200, b: 70, diff: 130, hint: '💡 Tipp: 130 + 70 = 200.' },
  { a: 400, b: 90, diff: 310, hint: '💡 Tipp: 310 + 90 = 400.' },
  { a: 800, b: 50, diff: 750, hint: '💡 Tipp: 750 + 50 = 800.' },
  { a: 300, b: 60, diff: 240, hint: '💡 Tipp: 240 + 60 = 300.' },
  { a: 500, b: 80, diff: 420, hint: '💡 Tipp: 420 + 80 = 500.' },
  { a: 600, b: 70, diff: 530, hint: '💡 Tipp: 530 + 70 = 600.' },
  { a: 400, b: 40, diff: 360, hint: '💡 Tipp: 360 + 40 = 400.' },
];

// Slot 17 (Saturday): Division (6er/7er/8er/9er Reihe)
export const POOL_SAT_DIVISION: DivisionSlotItem[] = [
  { dividend: 54, divisor: 6, quotient: 9, hint: '💡 Tipp: Denke an das Einmaleins der 6: Welche Zahl mal 6 ergibt 54?' },
  { dividend: 72, divisor: 8, quotient: 9, hint: '💡 Tipp: 9 × 8 = 72.' },
  { dividend: 63, divisor: 7, quotient: 9, hint: '💡 Tipp: 9 × 7 = 63.' },
  { dividend: 81, divisor: 9, quotient: 9, hint: '💡 Tipp: Quadratzahl: 9 × 9 = 81.' },
  { dividend: 64, divisor: 8, quotient: 8, hint: '💡 Tipp: Quadratzahl: 8 × 8 = 64.' },
  { dividend: 48, divisor: 8, quotient: 6, hint: '💡 Tipp: 6 × 8 = 48.' },
  { dividend: 56, divisor: 7, quotient: 8, hint: '💡 Tipp: 8 × 7 = 56.' },
  { dividend: 42, divisor: 6, quotient: 7, hint: '💡 Tipp: 7 × 6 = 42.' },
  { dividend: 72, divisor: 9, quotient: 8, hint: '💡 Tipp: 8 × 9 = 72.' },
  { dividend: 63, divisor: 9, quotient: 7, hint: '💡 Tipp: 7 × 9 = 63.' },
  { dividend: 54, divisor: 9, quotient: 6, hint: '💡 Tipp: 6 × 9 = 54.' },
  { dividend: 32, divisor: 4, quotient: 8, hint: '💡 Tipp: 8 × 4 = 32.' },
];

// Slot 18 (Saturday): Zahlenrätsel Verdoppeln (umkehr)
export interface VerdoppelnUmkehrSlotItem {
  n: number;
  hint: string;
}
export const POOL_SAT_VERDOPPELN_UMKEHR: VerdoppelnUmkehrSlotItem[] = [
  { n: 840, hint: '💡 Tipp: Halbiere 840, um die Ausgangszahl zu finden: erst 800 halbieren (400), dann 40 (20).' },
  { n: 680, hint: '💡 Tipp: Halbiere 680: 600 halbieren = 300, 80 halbieren = 40. Zusammen: 340.' },
  { n: 560, hint: '💡 Tipp: Halbiere 500 (250) und 60 (30). Zusammen: 280.' },
  { n: 920, hint: '💡 Tipp: Halbiere 900 (450) und 20 (10). Zusammen: 460.' },
  { n: 740, hint: '💡 Tipp: Halbiere 700 (350) und 40 (20). Zusammen: 370.' },
  { n: 460, hint: '💡 Tipp: Halbiere 400 (200) und 60 (30). Zusammen: 230.' },
  { n: 880, hint: '💡 Tipp: Halbiere 800 (400) und 80 (40). Zusammen: 440.' },
  { n: 620, hint: '💡 Tipp: Halbiere 600 (300) und 20 (10). Zusammen: 310.' },
  { n: 760, hint: '💡 Tipp: Halbiere 700 (350) und 60 (30). Zusammen: 380.' },
  { n: 940, hint: '💡 Tipp: Halbiere 900 (450) und 40 (20). Zusammen: 470.' },
  { n: 520, hint: '💡 Tipp: Halbiere 500 (250) und 20 (10). Zusammen: 260.' },
  { n: 860, hint: '💡 Tipp: Halbiere 800 (400) und 60 (30). Zusammen: 430.' },
];

// -------------------------------------------------------------
// CATEGORY POOL STATISTICS
// -------------------------------------------------------------

export interface MathCategoryPoolStats {
  category: string;
  slotName: string;
  uniqueSafeCombinations: number;
  weeksOfZeroRepetition: number;
  exampleSignature: string;
  description: string;
}

export function calculateMathCategoryPoolStatistics(): Record<string, MathCategoryPoolStats> {
  return {
    mon_1_addition: {
      category: 'Addition bis 1000',
      slotName: 'Mo 1: Zehner addieren',
      uniqueSafeCombinations: POOL_MON_ADDITION.length,
      weeksOfZeroRepetition: POOL_MON_ADDITION.length,
      exampleSignature: 'addition:430+20',
      description: 'Zehner im Hunderter-Raum ohne Zehnerübergang (Ergebnis <= 1000)',
    },
    mon_2_nachbarzehner: {
      category: 'Nachbarzehner',
      slotName: 'Mo 2: Nachbarzehner',
      uniqueSafeCombinations: POOL_MON_NACHBARZEHNER.length,
      weeksOfZeroRepetition: POOL_MON_NACHBARZEHNER.length,
      exampleSignature: 'neighbourTens:457',
      description: '3-stellige Zahlen zur Bestimmung der Nachbarzehner (z. B. 450 < 457 < 460)',
    },
    mon_3_verdoppeln: {
      category: 'Verdoppeln',
      slotName: 'Mo 3: Zahlen verdoppeln',
      uniqueSafeCombinations: POOL_MON_VERDOPPELN.length,
      weeksOfZeroRepetition: POOL_MON_VERDOPPELN.length,
      exampleSignature: 'doubling:320',
      description: 'Verdoppeln runder Zehnerzahlen mit Ergebnis <= 1000',
    },
    tue_1_multiplikation: {
      category: 'Multiplikation Fakten',
      slotName: 'Di 1: Einmaleins mit Strategie',
      uniqueSafeCombinations: POOL_TUE_MULTIPLIKATION.length,
      weeksOfZeroRepetition: POOL_TUE_MULTIPLIKATION.length,
      exampleSignature: 'multiplication:6x4',
      description: '1x1 Fakten mit Punktfeld und Nachbaraufgaben-Verankerung',
    },
    tue_2_division: {
      category: 'Division Exakt',
      slotName: 'Di 2: Exaktes Teilen',
      uniqueSafeCombinations: POOL_TUE_DIVISION.length,
      weeksOfZeroRepetition: POOL_TUE_DIVISION.length,
      exampleSignature: 'division:48/6',
      description: 'Aufteilen ohne Rest mit Umkehraufgaben-Verknüpfung',
    },
    tue_3_zahlenmauer: {
      category: 'Zahlenmauer',
      slotName: 'Di 3: Rechenpyramide 3-stufig',
      uniqueSafeCombinations: POOL_TUE_ZAHLENMAUER.length,
      weeksOfZeroRepetition: POOL_TUE_ZAHLENMAUER.length,
      exampleSignature: 'numberWall:120|80|150',
      description: '3 Grundsteine, 2 Mittelsteine, 1 Deckstein (Deckstein <= 1000)',
    },
    wed_1_addition_luecke: {
      category: 'Ergänzen zum Hunderter',
      slotName: 'Mi 1: Lückenaufgabe Hunderter',
      uniqueSafeCombinations: POOL_WED_ERGAENZEN.length,
      weeksOfZeroRepetition: POOL_WED_ERGAENZEN.length,
      exampleSignature: 'addition:340+60:blank_second',
      description: 'Ergänzen zum nächsten vollen Hunderter (z. B. 340 + ___ = 400)',
    },
    wed_2_multiplikation: {
      category: 'Multiplikation 7er/8er/9er',
      slotName: 'Mi 2: Anspruchsvolles 1x1',
      uniqueSafeCombinations: POOL_WED_MULTIPLIKATION.length,
      weeksOfZeroRepetition: POOL_WED_MULTIPLIKATION.length,
      exampleSignature: 'multiplication:7x8',
      description: 'Schwere Einmaleins-Fakten der 7er, 8er und 9er Reihe',
    },
    wed_3_nachbarhunderter: {
      category: 'Nachbarhunderter',
      slotName: 'Mi 3: Nachbarhunderter',
      uniqueSafeCombinations: POOL_WED_NACHBARHUNDERTER.length,
      weeksOfZeroRepetition: POOL_WED_NACHBARHUNDERTER.length,
      exampleSignature: 'neighbourHundreds:457',
      description: 'Bestimmung der vollen Hunderter vor und nach einer Zahl (400 < 457 < 500)',
    },
    thu_1_subtraktion: {
      category: 'Subtraktion bis 1000',
      slotName: 'Do 1: Zehner abziehen',
      uniqueSafeCombinations: POOL_THU_SUBTRAKTION.length,
      weeksOfZeroRepetition: POOL_THU_SUBTRAKTION.length,
      exampleSignature: 'subtraction:860-40',
      description: 'Subtraktion von Zehnern bis 1000 ohne Zehnerübergang (Ergebnis >= 0)',
    },
    thu_2_division: {
      category: 'Division Einmaleins',
      slotName: 'Do 2: Division Fakten',
      uniqueSafeCombinations: POOL_THU_DIVISION.length,
      weeksOfZeroRepetition: POOL_THU_DIVISION.length,
      exampleSignature: 'division:35/5',
      description: 'Geteiltaufgaben der 5er, 6er, 7er, 8er Reihe ohne Rest',
    },
    thu_3_halbieren: {
      category: 'Halbieren',
      slotName: 'Do 3: Zahlen halbieren',
      uniqueSafeCombinations: POOL_THU_HALBIEREN.length,
      weeksOfZeroRepetition: POOL_THU_HALBIEREN.length,
      exampleSignature: 'halving:860',
      description: 'Halbieren von geraden Zehner- und Hunderterzahlen mit ganzzahligem Ergebnis',
    },
    fri_1_addition: {
      category: 'Addition mit Zehnerübergang',
      slotName: 'Fr 1: Zehnerübergang',
      uniqueSafeCombinations: POOL_FRI_ADDITION.length,
      weeksOfZeroRepetition: POOL_FRI_ADDITION.length,
      exampleSignature: 'addition:560+70:transition',
      description: 'Hunderter überschreiten (z. B. 560 + 70 = 630)',
    },
    fri_2_multiplikation_luecke: {
      category: 'Multiplikation Lücke',
      slotName: 'Fr 2: Fehlender Faktor',
      uniqueSafeCombinations: POOL_FRI_MULTIPLIKATION_LUECKE.length,
      weeksOfZeroRepetition: POOL_FRI_MULTIPLIKATION_LUECKE.length,
      exampleSignature: 'multiplication:8x6:blank_factor',
      description: 'Lückenaufgabe mit fehlendem Faktor (z. B. 8 × ___ = 48)',
    },
    fri_3_zahlenmauer: {
      category: 'Zahlenmauer Fr',
      slotName: 'Fr 3: Pyramiden-Variante',
      uniqueSafeCombinations: POOL_FRI_ZAHLENMAUER.length,
      weeksOfZeroRepetition: POOL_FRI_ZAHLENMAUER.length,
      exampleSignature: 'numberWall:70|50|90',
      description: 'Zahlenmauer mit alternativen Grundsteinen für vertiefte Pyramiden-Übung',
    },
    sat_1_subtraktion_luecke: {
      category: 'Subtraktion Lücke',
      slotName: 'Sa 1: Startzahl ermitteln',
      uniqueSafeCombinations: POOL_SAT_SUBTRAKTION_LUECKE.length,
      weeksOfZeroRepetition: POOL_SAT_SUBTRAKTION_LUECKE.length,
      exampleSignature: 'subtraction:300-70:blank_start',
      description: 'Fehlende Startzahl berechnen durch Umkehraufgabe (z. B. ___ − 70 = 230)',
    },
    sat_2_division: {
      category: 'Division Groß',
      slotName: 'Sa 2: Große Division',
      uniqueSafeCombinations: POOL_SAT_DIVISION.length,
      weeksOfZeroRepetition: POOL_SAT_DIVISION.length,
      exampleSignature: 'division:54/6',
      description: 'Divisionen der 6er, 7er, 8er, 9er Reihe',
    },
    sat_3_verdoppeln_umkehr: {
      category: 'Zahlenrätsel Verdoppeln',
      slotName: 'Sa 3: Rätsel Verdoppeln',
      uniqueSafeCombinations: POOL_SAT_VERDOPPELN_UMKEHR.length,
      weeksOfZeroRepetition: POOL_SAT_VERDOPPELN_UMKEHR.length,
      exampleSignature: 'doubling_inverse:840',
      description: 'Rückwärts denken: "Das Doppelte meiner Zahl ist X. Welche Zahl suche ich?"',
    },
  };
}

export function getTotalUniqueSafeMathCombinations(): number {
  const stats = calculateMathCategoryPoolStatistics();
  return Object.values(stats).reduce((acc, s) => acc + s.uniqueSafeCombinations, 0);
}

// -------------------------------------------------------------
// ADAPTIVE REMEDIATION & ANTI-REPETITION SAMPLER
// -------------------------------------------------------------

/**
 * Samples a safe combination from a pool with anti-repetition & controlled recycling:
 * 1. Filters out any combination whose signature exists in `recentHistory` (anti-repetition window).
 * 2. If JD struggles with the skill, concept reappears sooner but with a DIFFERENT number set!
 *    (e.g., if 7 × 8 failed, use 6 × 8, 8 × 7, 7 × 6, 7 × 9 before returning to 7 × 8).
 * 3. Never returns an exact duplicate of a recently seen signature while unused options exist.
 * 4. Controlled Recycle Policy (when pool is exhausted):
 *    - First reuse the oldest question signatures (lowest last-seen index in chronological history).
 *    - Never immediately repeat last week’s exact questions (exclude signatures in recent 18-task window).
 *    - Preserve variety of skill types (always stays within this dedicated category pool).
 */
export function sampleFromPool<T>(params: {
  pool: T[];
  getSignature: (item: T) => string;
  weekNumber: number;
  recentHistory?: string[];
  isRemediation?: boolean;
}): T {
  const { pool, getSignature, weekNumber, recentHistory = [], isRemediation } = params;
  if (!pool || pool.length === 0) {
    throw new Error('Cannot sample from empty pool');
  }

  const historySet = new Set(recentHistory);

  // 1. Unused items (never seen in recent history)
  const unusedItems = pool.filter((item) => !historySet.has(getSignature(item)));

  if (unusedItems.length > 0) {
    const offset = isRemediation ? 1 : 0;
    const index = (Math.max(0, weekNumber - 1) + offset) % unusedItems.length;
    return unusedItems[index];
  }

  // 2. Controlled Recycle Policy when all items in pool have been seen
  // Find the most recent occurrence of each item in chronological recentHistory
  const poolWithRecency = pool.map((item) => {
    const sig = getSignature(item);
    const lastSeenIndex = recentHistory.lastIndexOf(sig);
    return { item, sig, lastSeenIndex };
  });

  // Sort by lastSeenIndex ascending (oldest used signatures first)
  poolWithRecency.sort((a, b) => a.lastSeenIndex - b.lastSeenIndex);

  // Never immediately repeat last week's exact questions
  // In this category pool, the item with the highest lastSeenIndex was the one used most recently (last week's question)
  const recentWindowSize = Math.min(18, Math.max(1, recentHistory.length - 1));
  const recentCutoff = recentHistory.length - recentWindowSize;

  let olderThanLastWeek = poolWithRecency.filter((entry) => entry.lastSeenIndex < recentCutoff);

  // Guarantee at least 2 older candidates remain (excluding at minimum the most recently seen item in this pool)
  if (olderThanLastWeek.length < 2) {
    olderThanLastWeek = poolWithRecency.slice(0, Math.max(1, poolWithRecency.length - 1));
  }

  const candidates = olderThanLastWeek.map((e) => e.item);

  const offset = isRemediation ? 1 : 0;
  const index = (Math.max(0, weekNumber - 1) + offset) % candidates.length;
  return candidates[index];
}
