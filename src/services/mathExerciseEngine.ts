import { DayOfWeek } from '../types/lernwoerter';
import {
  MathExercise,
  DailyMathPlan,
  NumberPyramidExercise,
  NachbarzahlenExercise,
  DoublingHalvingExercise,
  StandardArithmeticExercise,
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
import {
  getMathExerciseSignature,
  buildMathSignature,
  calculateMathCategoryPoolStatistics,
  getTotalUniqueSafeMathCombinations,
  MathCategoryPoolStats,
  sampleFromPool,
  POOL_MON_ADDITION,
  POOL_MON_NACHBARZEHNER,
  POOL_MON_VERDOPPELN,
  POOL_TUE_MULTIPLIKATION,
  POOL_TUE_DIVISION,
  POOL_TUE_ZAHLENMAUER,
  POOL_WED_ERGAENZEN,
  POOL_WED_MULTIPLIKATION,
  POOL_WED_NACHBARHUNDERTER,
  POOL_THU_SUBTRAKTION,
  POOL_THU_DIVISION,
  POOL_THU_HALBIEREN,
  POOL_FRI_ADDITION,
  POOL_FRI_MULTIPLIKATION_LUECKE,
  POOL_FRI_ZAHLENMAUER,
  POOL_SAT_SUBTRAKTION_LUECKE,
  POOL_SAT_DIVISION,
  POOL_SAT_VERDOPPELN_UMKEHR,
} from './mathQuestionPools';

// Re-export anti-repetition utilities and stats
export {
  getMathExerciseSignature,
  buildMathSignature,
  calculateMathCategoryPoolStatistics,
  getTotalUniqueSafeMathCombinations,
};
export type { MathCategoryPoolStats };

/**
 * PHASE 1 DETERMINISTIC MATH CURRICULUM (Zahlenraum bis 1000)
 *
 * Strict Controlled Categories in Phase 1:
 * - Addition bis 1000
 * - Subtraktion bis 1000
 * - Multiplikation (1x1 facts, missing factor, neighbour strategy)
 * - Division (exact divisions: divisor * quotient = dividend)
 * - Verdoppeln (e.g. 320 x 2 = 640)
 * - Halbieren (even numbers: 860 / 2 = 430)
 * - Nachbarzehner (450 < 457 < 460)
 * - Nachbarhunderter (400 < 457 < 500)
 * - Zahlenmauer (every stone = sum of the two beneath it, calculated via calculateNumberWall)
 *
 * Workload: Strictly 3 diverse tasks per day (10-15 minutes).
 * All exercises are generated and validated deterministically before display.
 */

// Helper to build and validate a standard arithmetic task
function createAdditionTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  a: number;
  b: number;
  blankPosition?: 'first' | 'second' | 'result';
  hint: string;
  signature?: string;
  weekNumber?: number;
}): StandardArithmeticExercise {
  const sum = calculateAddition(params.a, params.b);
  const blank = params.blankPosition || 'result';
  let equation = `${params.a} + ${params.b}`;
  let correctAnswer: number = sum;

  if (blank === 'second') {
    equation = `${params.a} + ___ = ${sum}`;
    correctAnswer = params.b;
  } else if (blank === 'first') {
    equation = `___ + ${params.b} = ${sum}`;
    correctAnswer = params.a;
  }

  const ex: StandardArithmeticExercise = {
    id: params.id,
    day: params.day,
    type: 'addition_1000',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: 'Addition bis 1000',
    points: 4,
    equation,
    blankPosition: blank,
    correctAnswer,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

function createSubtractionTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  a: number;
  b: number;
  blankPosition?: 'first' | 'second' | 'result';
  hint: string;
  signature?: string;
  weekNumber?: number;
}): StandardArithmeticExercise {
  const diff = calculateSubtraction(params.a, params.b);
  const blank = params.blankPosition || 'result';
  let equation = `${params.a} − ${params.b}`;
  let correctAnswer: number = diff;

  if (blank === 'second') {
    equation = `${params.a} − ___ = ${diff}`;
    correctAnswer = params.b;
  } else if (blank === 'first') {
    equation = `___ − ${params.b} = ${diff}`;
    correctAnswer = params.a;
  }

  const ex: StandardArithmeticExercise = {
    id: params.id,
    day: params.day,
    type: 'subtraction_1000',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: 'Subtraktion bis 1000',
    points: 4,
    equation,
    blankPosition: blank,
    correctAnswer,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

function createMultiplicationTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  a: number;
  b: number;
  blankPosition?: 'first' | 'second' | 'result';
  dotArray?: { rows: number; cols: number };
  neighbourStrategy?: { prev: string; target: string; next: string };
  hint: string;
  signature?: string;
  weekNumber?: number;
}): StandardArithmeticExercise {
  const product = calculateMultiplication(params.a, params.b);
  const blank = params.blankPosition || 'result';
  let equation = `${params.a} × ${params.b}`;
  let correctAnswer: number = product;

  if (blank === 'second') {
    equation = `${params.a} × ___ = ${product}`;
    correctAnswer = params.b;
  }

  const ex: StandardArithmeticExercise = {
    id: params.id,
    day: params.day,
    type: 'multiplication_facts',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: 'Multiplikation',
    points: 4,
    equation,
    blankPosition: blank,
    correctAnswer,
    dotArray: params.dotArray,
    neighbourStrategy: params.neighbourStrategy,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

function createExactDivisionTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  divisor: number;
  quotient: number;
  hint: string;
  signature?: string;
  weekNumber?: number;
}): StandardArithmeticExercise {
  const { dividend } = generateExactDivision(params.divisor, params.quotient);
  const verifiedQuotient = calculateDivision(dividend, params.divisor);

  const ex: StandardArithmeticExercise = {
    id: params.id,
    day: params.day,
    type: 'division_facts',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: 'Division',
    points: 4,
    equation: `${dividend} ÷ ${params.divisor}`,
    blankPosition: 'result',
    correctAnswer: verifiedQuotient,
    hasRemainder: false,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

function createDoublingTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  n: number;
  hint: string;
  signature?: string;
  weekNumber?: number;
}): DoublingHalvingExercise {
  const double = calculateDouble(params.n);
  const ex: DoublingHalvingExercise = {
    id: params.id,
    day: params.day,
    type: 'verdoppeln_halbieren',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: 'Verdoppeln',
    points: 4,
    mode: 'verdoppeln',
    promptNumber: params.n,
    correctAnswer: double,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

function createHalvingTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  n: number;
  hint: string;
  signature?: string;
  weekNumber?: number;
}): DoublingHalvingExercise {
  const half = calculateHalf(params.n);
  const ex: DoublingHalvingExercise = {
    id: params.id,
    day: params.day,
    type: 'verdoppeln_halbieren',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: 'Halbieren',
    points: 4,
    mode: 'halbieren',
    promptNumber: params.n,
    correctAnswer: half,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

function createInverseDoublingTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  n: number;
  hint: string;
  signature?: string;
  weekNumber?: number;
}): DoublingHalvingExercise {
  const half = calculateHalf(params.n);
  const ex: DoublingHalvingExercise = {
    id: params.id,
    day: params.day,
    type: 'verdoppeln_halbieren',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: 'Halbieren',
    points: 4,
    mode: 'umkehr',
    promptNumber: params.n,
    correctAnswer: half,
    riddleText: `Das Doppelte meiner Zahl ist ${params.n}. Welche Zahl suche ich?`,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

function createNeighboursTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  n: number;
  kind: 'zehner' | 'hunderter' | 'both';
  hint: string;
  signature?: string;
  weekNumber?: number;
}): NachbarzahlenExercise {
  const neighbours = calculateNeighbours(params.n);

  const ex: NachbarzahlenExercise = {
    id: params.id,
    day: params.day,
    type: 'nachbarzahlen',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: params.kind === 'hunderter' ? 'Nachbarhunderter' : 'Nachbarzehner',
    points: 4,
    number: params.n,
    kind: params.kind,
    lowerZehner: neighbours.lowerTen,
    upperZehner: neighbours.upperTen,
    lowerHunderter: params.kind !== 'zehner' ? neighbours.lowerHundred : undefined,
    upperHunderter: params.kind !== 'zehner' ? neighbours.upperHundred : undefined,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

function createNumberWallTask(params: {
  id: string;
  day: DayOfWeek;
  title: string;
  subtitle: string;
  instruction: string;
  b0: number;
  b1: number;
  b2: number;
  hint: string;
  signature?: string;
  weekNumber?: number;
}): NumberPyramidExercise {
  const wall = calculateNumberWall(params.b0, params.b1, params.b2);

  const ex: NumberPyramidExercise = {
    id: params.id,
    day: params.day,
    type: 'zahlenmauer',
    title: params.title,
    subtitle: params.subtitle,
    instruction: params.instruction,
    skillName: 'Zahlenmauer',
    points: 4,
    hint: params.hint,
    signature: params.signature,
    weekNumber: params.weekNumber,
    bricks: {
      bottom: [
        { id: 'b0', value: wall.bottom[0], isGiven: true },
        { id: 'b1', value: wall.bottom[1], isGiven: true },
        { id: 'b2', value: wall.bottom[2], isGiven: true },
      ],
      middle: [
        { id: 'm0', value: wall.middle[0], isGiven: false },
        { id: 'm1', value: wall.middle[1], isGiven: false },
      ],
      top: [
        { id: 't0', value: wall.top[0], isGiven: false },
      ],
    },
  };

  const validation = validateMathExercise(ex);
  if (!validation.isValid) {
    throw new Error(`Failed validation for ${params.id}: ${validation.error}`);
  }
  return ex;
}

// -------------------------------------------------------------
// DYNAMIC WEEKLY TASK GENERATOR (WITH ANTI-REPETITION)
// -------------------------------------------------------------

export interface GenerateWeeklyMathTasksOptions {
  weekNumber?: number;
  strugglingSkills?: string[];
  history?: string[];
}

/**
 * Generates the complete 18-task weekly plan for any given week.
 * Guaranteed:
 * - Deterministic arithmetic execution.
 * - Distinct, non-repeating signatures across consecutive weeks.
 * - Same skill difficulty and daily structure preserved.
 * - Adaptive remediation: concepts reappear sooner with fresh number sets.
 */
export function generateWeeklyMathTasks(
  options: GenerateWeeklyMathTasksOptions = {}
): Record<DayOfWeek, MathExercise[]> {
  const weekNumber = Math.max(1, options.weekNumber || 1);
  const history = options.history || [];
  const struggling = options.strugglingSkills || [];

  const isStrugglingMul = struggling.some((s) => s.toLowerCase().includes('multiplikation'));
  const isStrugglingSub = struggling.some((s) => s.toLowerCase().includes('subtraktion'));
  const isStrugglingAdd = struggling.some((s) => s.toLowerCase().includes('addition'));
  const isStrugglingDiv = struggling.some((s) => s.toLowerCase().includes('division'));
  const isStrugglingVerd = struggling.some((s) => s.toLowerCase().includes('verdoppeln'));
  const isStrugglingHalb = struggling.some((s) => s.toLowerCase().includes('halbieren'));
  const isStrugglingNZ = struggling.some((s) => s.toLowerCase().includes('nachbarzehner'));
  const isStrugglingNH = struggling.some((s) => s.toLowerCase().includes('nachbarhunderter'));
  const isStrugglingMauer = struggling.some((s) => s.toLowerCase().includes('zahlenmauer'));

  // --- MONDAY ---
  const monAdd = sampleFromPool({
    pool: POOL_MON_ADDITION,
    getSignature: (it) => `addition:${it.a}+${it.b}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingAdd,
  });
  const monNZ = sampleFromPool({
    pool: POOL_MON_NACHBARZEHNER,
    getSignature: (it) => `neighbourTens:${it.n}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingNZ,
  });
  const monVerd = sampleFromPool({
    pool: POOL_MON_VERDOPPELN,
    getSignature: (it) => `doubling:${it.n}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingVerd,
  });

  const mondayTasks: MathExercise[] = [
    createAdditionTask({
      id: 'mon_math_1_addition',
      day: 'monday',
      title: 'Addition bis 1000',
      subtitle: 'Rechnen im Hunderter-Raum',
      instruction: 'Rechne die Aufgabe im Kopf oder nutze den Rechenweg.',
      a: monAdd.a,
      b: monAdd.b,
      hint: monAdd.hint,
      signature: `addition:${monAdd.a}+${monAdd.b}`,
      weekNumber,
    }),
    createNeighboursTask({
      id: 'mon_math_2_nachbarzehner',
      day: 'monday',
      title: 'Nachbarzehner bestimmen',
      subtitle: 'Vorgänger & Nachfolger auf Zehner gerundet',
      instruction: `Bestimme die Nachbarzehner (NZ) für die Zahl ${monNZ.n}.`,
      n: monNZ.n,
      kind: 'zehner',
      hint: '💡 Tipp: Schaue auf die Einerstelle. Welche Zehnerzahl liegt direkt davor und welche danach?',
      signature: `neighbourTens:${monNZ.n}`,
      weekNumber,
    }),
    createDoublingTask({
      id: 'mon_math_3_verdoppeln',
      day: 'monday',
      title: 'Zahlen verdoppeln',
      subtitle: 'Strategie: Hunderter und Zehner einzeln verdoppeln',
      instruction: `Verdopple die Zahl ${monVerd.n}.`,
      n: monVerd.n,
      hint: monVerd.hint,
      signature: `doubling:${monVerd.n}`,
      weekNumber,
    }),
  ];

  // --- TUESDAY ---
  const tueMul = sampleFromPool({
    pool: POOL_TUE_MULTIPLIKATION,
    getSignature: (it) => `multiplication:${it.a}x${it.b}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingMul,
  });
  const tueDiv = sampleFromPool({
    pool: POOL_TUE_DIVISION,
    getSignature: (it) => `division:${it.dividend}/${it.divisor}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingDiv,
  });
  const tueMauer = sampleFromPool({
    pool: POOL_TUE_ZAHLENMAUER,
    getSignature: (it) => `numberWall:${it.b0}|${it.b1}|${it.b2}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingMauer,
  });

  const tuesdayTasks: MathExercise[] = [
    createMultiplicationTask({
      id: 'tue_math_1_multiplikation',
      day: 'tuesday',
      title: 'Multiplikation – Einmaleins',
      subtitle: `${tueMul.a}er- und ${tueMul.b}er-Reihe mit Nachbarstrategie`,
      instruction: `Rechne die Malaufgabe: ${tueMul.a} × ${tueMul.b} = ?`,
      a: tueMul.a,
      b: tueMul.b,
      dotArray: { rows: tueMul.b, cols: tueMul.a },
      neighbourStrategy: tueMul.neighbourStrategy,
      hint: tueMul.hint,
      signature: `multiplication:${tueMul.a}x${tueMul.b}`,
      weekNumber,
    }),
    createExactDivisionTask({
      id: 'tue_math_2_division',
      day: 'tuesday',
      title: 'Division – Exaktes Teilen',
      subtitle: 'Aufteilen ohne Rest',
      instruction: `Teile ${tueDiv.dividend} durch ${tueDiv.divisor}: Wie oft passt die ${tueDiv.divisor} in ${tueDiv.dividend}?`,
      divisor: tueDiv.divisor,
      quotient: tueDiv.quotient,
      hint: tueDiv.hint,
      signature: `division:${tueDiv.dividend}/${tueDiv.divisor}`,
      weekNumber,
    }),
    createNumberWallTask({
      id: 'tue_math_3_zahlenmauer',
      day: 'tuesday',
      title: 'Zahlenmauer / Rechenpyramide',
      subtitle: 'Schrittweise nach oben addieren',
      instruction: 'Zwei nebeneinander liegende Steine ergeben zusammen den Stein darüber.',
      b0: tueMauer.b0,
      b1: tueMauer.b1,
      b2: tueMauer.b2,
      hint: tueMauer.hint,
      signature: `numberWall:${tueMauer.b0}|${tueMauer.b1}|${tueMauer.b2}`,
      weekNumber,
    }),
  ];

  // --- WEDNESDAY ---
  const wedErg = sampleFromPool({
    pool: POOL_WED_ERGAENZEN,
    getSignature: (it) => `addition:${it.a}+${it.b}:blank_second`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingAdd,
  });
  const wedMul = sampleFromPool({
    pool: POOL_WED_MULTIPLIKATION,
    getSignature: (it) => `multiplication:${it.a}x${it.b}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingMul,
  });
  const wedNH = sampleFromPool({
    pool: POOL_WED_NACHBARHUNDERTER,
    getSignature: (it) => `neighbourHundreds:${it.n}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingNH,
  });

  const wednesdayTasks: MathExercise[] = [
    createAdditionTask({
      id: 'wed_math_1_addition_luecke',
      day: 'wednesday',
      title: 'Ergänzen zum Hunderter',
      subtitle: 'Lückenaufgabe mit Zehnern',
      instruction: `Finde die fehlende Zahl: ${wedErg.a} + ___ = ${wedErg.targetHundred}`,
      a: wedErg.a,
      b: wedErg.b,
      blankPosition: 'second',
      hint: wedErg.hint,
      signature: `addition:${wedErg.a}+${wedErg.b}:blank_second`,
      weekNumber,
    }),
    createMultiplicationTask({
      id: 'wed_math_2_multiplikation',
      day: 'wednesday',
      title: `Multiplikation (${wedMul.a}er / ${wedMul.b}er Reihe)`,
      subtitle: 'Kleine Einmaleins-Fakten',
      instruction: `Berechne: ${wedMul.a} × ${wedMul.b} = ?`,
      a: wedMul.a,
      b: wedMul.b,
      hint: wedMul.hint,
      signature: `multiplication:${wedMul.a}x${wedMul.b}`,
      weekNumber,
    }),
    createNeighboursTask({
      id: 'wed_math_3_nachbarhunderter',
      day: 'wednesday',
      title: 'Nachbarhunderter bestimmen',
      subtitle: 'Volle Hunderter vor und nach einer Zahl',
      instruction: `Bestimme die Nachbarhunderter (NH) für die Zahl ${wedNH.n}.`,
      n: wedNH.n,
      kind: 'hunderter',
      hint: '💡 Tipp: Schaue auf die Hunderterstelle. Welcher volle Hunderter liegt davor und welcher danach?',
      signature: `neighbourHundreds:${wedNH.n}`,
      weekNumber,
    }),
  ];

  // --- THURSDAY ---
  const thuSub = sampleFromPool({
    pool: POOL_THU_SUBTRAKTION,
    getSignature: (it) => `subtraction:${it.a}-${it.b}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingSub,
  });
  const thuDiv = sampleFromPool({
    pool: POOL_THU_DIVISION,
    getSignature: (it) => `division:${it.dividend}/${it.divisor}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingDiv,
  });
  const thuHalb = sampleFromPool({
    pool: POOL_THU_HALBIEREN,
    getSignature: (it) => `halving:${it.n}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingHalb,
  });

  const thursdayTasks: MathExercise[] = [
    createSubtractionTask({
      id: 'thu_math_1_subtraktion',
      day: 'thursday',
      title: 'Subtraktion bis 1000',
      subtitle: 'Zehner abziehen',
      instruction: `Ziehe die Zehnerzahl ab: ${thuSub.a} − ${thuSub.b} = ?`,
      a: thuSub.a,
      b: thuSub.b,
      hint: thuSub.hint,
      signature: `subtraction:${thuSub.a}-${thuSub.b}`,
      weekNumber,
    }),
    createExactDivisionTask({
      id: 'thu_math_2_division',
      day: 'thursday',
      title: `Division (${thuDiv.divisor}er-Reihe)`,
      subtitle: 'Geteilt ohne Rest',
      instruction: `Berechne: ${thuDiv.dividend} ÷ ${thuDiv.divisor} = ?`,
      divisor: thuDiv.divisor,
      quotient: thuDiv.quotient,
      hint: thuDiv.hint,
      signature: `division:${thuDiv.dividend}/${thuDiv.divisor}`,
      weekNumber,
    }),
    createHalvingTask({
      id: 'thu_math_3_halbieren',
      day: 'thursday',
      title: 'Zahlen halbieren',
      subtitle: 'Strategie: Hunderter und Zehner einzeln halbieren',
      instruction: `Halbiere die Zahl ${thuHalb.n}.`,
      n: thuHalb.n,
      hint: thuHalb.hint,
      signature: `halving:${thuHalb.n}`,
      weekNumber,
    }),
  ];

  // --- FRIDAY ---
  const friAdd = sampleFromPool({
    pool: POOL_FRI_ADDITION,
    getSignature: (it) => `addition:${it.a}+${it.b}:transition`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingAdd,
  });
  const friMul = sampleFromPool({
    pool: POOL_FRI_MULTIPLIKATION_LUECKE,
    getSignature: (it) => `multiplication:${it.a}x${it.b}:blank_factor`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingMul,
  });
  const friMauer = sampleFromPool({
    pool: POOL_FRI_ZAHLENMAUER,
    getSignature: (it) => `numberWall:${it.b0}|${it.b1}|${it.b2}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingMauer,
  });

  const fridayTasks: MathExercise[] = [
    createAdditionTask({
      id: 'fri_math_1_addition',
      day: 'friday',
      title: 'Addition mit Zehnerübergang',
      subtitle: 'Hunderter überschreiten',
      instruction: `Berechne: ${friAdd.a} + ${friAdd.b} = ?`,
      a: friAdd.a,
      b: friAdd.b,
      hint: friAdd.hint,
      signature: `addition:${friAdd.a}+${friAdd.b}:transition`,
      weekNumber,
    }),
    createMultiplicationTask({
      id: 'fri_math_2_multiplikation_luecke',
      day: 'friday',
      title: 'Einmaleins mit Lücke',
      subtitle: 'Fehlenden Faktor bestimmen',
      instruction: `Finde den fehlenden Faktor: ${friMul.a} × ___ = ${friMul.product}`,
      a: friMul.a,
      b: friMul.b,
      blankPosition: 'second',
      hint: friMul.hint,
      signature: `multiplication:${friMul.a}x${friMul.b}:blank_factor`,
      weekNumber,
    }),
    createNumberWallTask({
      id: 'fri_math_3_zahlenmauer',
      day: 'friday',
      title: 'Zahlenmauer / Rechenpyramide',
      subtitle: 'Pyramide ausrechnen',
      instruction: 'Trage die fehlenden Zahlen in die Mauer ein.',
      b0: friMauer.b0,
      b1: friMauer.b1,
      b2: friMauer.b2,
      hint: friMauer.hint,
      signature: `numberWall:${friMauer.b0}|${friMauer.b1}|${friMauer.b2}`,
      weekNumber,
    }),
  ];

  // --- SATURDAY ---
  const satSub = sampleFromPool({
    pool: POOL_SAT_SUBTRAKTION_LUECKE,
    getSignature: (it) => `subtraction:${it.a}-${it.b}:blank_start`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingSub,
  });
  const satDiv = sampleFromPool({
    pool: POOL_SAT_DIVISION,
    getSignature: (it) => `division:${it.dividend}/${it.divisor}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingDiv,
  });
  const satVerd = sampleFromPool({
    pool: POOL_SAT_VERDOPPELN_UMKEHR,
    getSignature: (it) => `doubling_inverse:${it.n}`,
    weekNumber,
    recentHistory: history,
    isRemediation: isStrugglingVerd,
  });

  const saturdayTasks: MathExercise[] = [
    createSubtractionTask({
      id: 'sat_math_1_subtraktion_luecke',
      day: 'saturday',
      title: 'Subtraktion mit Lücke',
      subtitle: 'Startzahl ermitteln',
      instruction: `Finde die gesuchte Zahl: ___ − ${satSub.b} = ${satSub.diff}`,
      a: satSub.a,
      b: satSub.b,
      blankPosition: 'first',
      hint: satSub.hint,
      signature: `subtraction:${satSub.a}-${satSub.b}:blank_start`,
      weekNumber,
    }),
    createExactDivisionTask({
      id: 'sat_math_2_division',
      day: 'saturday',
      title: `Division – ${satDiv.divisor}er-Reihe`,
      subtitle: 'Große Einmaleins-Division',
      instruction: `Berechne: ${satDiv.dividend} ÷ ${satDiv.divisor} = ?`,
      divisor: satDiv.divisor,
      quotient: satDiv.quotient,
      hint: satDiv.hint,
      signature: `division:${satDiv.dividend}/${satDiv.divisor}`,
      weekNumber,
    }),
    createInverseDoublingTask({
      id: 'sat_math_3_verdoppeln_umkehr',
      day: 'saturday',
      title: 'Zahlenrätsel Verdoppeln',
      subtitle: 'Rückwärts denken',
      instruction: `Das Doppelte meiner Zahl ist ${satVerd.n}. Welche Zahl suche ich?`,
      n: satVerd.n,
      hint: satVerd.hint,
      signature: `doubling_inverse:${satVerd.n}`,
      weekNumber,
    }),
  ];

  return {
    monday: mondayTasks,
    tuesday: tuesdayTasks,
    wednesday: wednesdayTasks,
    thursday: thursdayTasks,
    friday: fridayTasks,
    saturday: saturdayTasks,
  };
}

// Fixed week 1 tasks export for backward compatibility
export const MONDAY_MATH_TASKS = generateWeeklyMathTasks({ weekNumber: 1 }).monday;
export const TUESDAY_MATH_TASKS = generateWeeklyMathTasks({ weekNumber: 1 }).tuesday;
export const WEDNESDAY_MATH_TASKS = generateWeeklyMathTasks({ weekNumber: 1 }).wednesday;
export const THURSDAY_MATH_TASKS = generateWeeklyMathTasks({ weekNumber: 1 }).thursday;
export const FRIDAY_MATH_TASKS = generateWeeklyMathTasks({ weekNumber: 1 }).friday;
export const SATURDAY_MATH_TASKS = generateWeeklyMathTasks({ weekNumber: 1 }).saturday;

export const ALL_WEEKLY_MATH_TASKS: Record<DayOfWeek, MathExercise[]> = {
  monday: MONDAY_MATH_TASKS,
  tuesday: TUESDAY_MATH_TASKS,
  wednesday: WEDNESDAY_MATH_TASKS,
  thursday: THURSDAY_MATH_TASKS,
  friday: FRIDAY_MATH_TASKS,
  saturday: SATURDAY_MATH_TASKS,
};

/**
 * Generates the daily math plan.
 * Monday–Saturday: strictly 3 required tasks from the Phase 1 categories.
 */
export function generateDailyMathPlan(params: {
  day: DayOfWeek;
  weekNumber?: number;
  strugglingSkills?: string[];
  history?: string[];
}): DailyMathPlan {
  const { day, weekNumber, strugglingSkills, history } = params;
  const weeklyPlan = generateWeeklyMathTasks({
    weekNumber,
    strugglingSkills,
    history,
  });
  const baseTasks = weeklyPlan[day] || weeklyPlan.monday;

  // Verify all tasks before returning
  baseTasks.forEach((task) => {
    const val = validateMathExercise(task);
    if (!val.isValid) {
      throw new Error(`Integrity check failed for task ${task.id}: ${val.error}`);
    }
  });

  return {
    day,
    tasks: baseTasks,
    isSaturdayChallenge: day === 'saturday',
    estimatedMinutes: 12,
  };
}

/**
 * QA VALIDATION REPORT FOR PHASE 1 DETERMINISTIC MATHS
 */
export interface MathWeeklyQAReport {
  isValid: boolean;
  totalWeeklyTasks: number;
  dailyCounts: Record<DayOfWeek, number>;
  phase1CategoriesCovered: {
    addition: boolean;
    subtraction: boolean;
    multiplication: boolean;
    division: boolean;
    verdoppeln: boolean;
    halbieren: boolean;
    nachbarzehner: boolean;
    nachbarhunderter: boolean;
    zahlenmauer: boolean;
  };
  maxCalculatedNumber: number;
  minCalculatedNumber: number;
  hasNegativeNumbers: boolean;
  uniqueSkillsCount: number;
  uniqueSignaturesCount: number;
  duplicateSignaturesWithinWeek: string[];
  totalSafeCombinationsInPools: number;
  weeksOfVarietyGuaranteed: number;
  categoryPoolStats: Record<string, MathCategoryPoolStats>;
  reportLines: string[];
}

export function validateMathWeeklyPlan(params: {
  weekNumber?: number;
  history?: string[];
} = {}): MathWeeklyQAReport {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dailyCounts: Record<DayOfWeek, number> = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
  };

  let maxNum = 0;
  let minNum = Infinity;
  let hasNegatives = false;
  const skillsSeen = new Set<string>();
  const signaturesSeen = new Set<string>();
  const duplicateSignatures: string[] = [];

  const categories = {
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
    verdoppeln: false,
    halbieren: false,
    nachbarzehner: false,
    nachbarhunderter: false,
    zahlenmauer: false,
  };

  let totalTasks = 0;
  const reportLines: string[] = [];

  days.forEach((d) => {
    const plan = generateDailyMathPlan({
      day: d,
      weekNumber: params.weekNumber || 1,
      history: params.history,
    });
    dailyCounts[d] = plan.tasks.length;
    totalTasks += plan.tasks.length;

    plan.tasks.forEach((t) => {
      skillsSeen.add(t.skillName);

      const sig = t.signature || getMathExerciseSignature(t);
      if (signaturesSeen.has(sig)) {
        duplicateSignatures.push(sig);
      } else {
        signaturesSeen.add(sig);
      }

      if (t.type === 'addition_1000') categories.addition = true;
      if (t.type === 'subtraction_1000') categories.subtraction = true;
      if (t.type === 'multiplication_facts') categories.multiplication = true;
      if (t.type === 'division_facts') categories.division = true;
      if (t.type === 'verdoppeln_halbieren') {
        const vh = t as DoublingHalvingExercise;
        if (vh.mode === 'verdoppeln') categories.verdoppeln = true;
        if (vh.mode === 'halbieren' || vh.mode === 'umkehr') categories.halbieren = true;
      }
      if (t.type === 'nachbarzahlen') {
        const nz = t as NachbarzahlenExercise;
        if (nz.kind === 'zehner' || nz.kind === 'both') categories.nachbarzehner = true;
        if (nz.kind === 'hunderter' || nz.kind === 'both') categories.nachbarhunderter = true;
      }
      if (t.type === 'zahlenmauer') categories.zahlenmauer = true;

      // Check numbers
      const checkVal = (v: any) => {
        if (typeof v === 'number' && !isNaN(v)) {
          if (v > maxNum) maxNum = v;
          if (v < minNum) minNum = v;
          if (v < 0) hasNegatives = true;
        }
      };

      if ('correctAnswer' in t) checkVal((t as any).correctAnswer);
      if ('promptNumber' in t) checkVal((t as any).promptNumber);
      if ('number' in t) checkVal((t as any).number);
      if ('lowerZehner' in t) checkVal((t as any).lowerZehner);
      if ('upperZehner' in t) checkVal((t as any).upperZehner);
      if ('lowerHunderter' in t) checkVal((t as any).lowerHunderter);
      if ('upperHunderter' in t) checkVal((t as any).upperHunderter);
      if ('bricks' in t) {
        const pyr = t as NumberPyramidExercise;
        pyr.bricks.bottom.forEach((b) => checkVal(b.value));
        pyr.bricks.middle.forEach((b) => checkVal(b.value));
        pyr.bricks.top.forEach((b) => checkVal(b.value));
      }
    });
  });

  const validDailyWorkload =
    dailyCounts.monday === 3 &&
    dailyCounts.tuesday === 3 &&
    dailyCounts.wednesday === 3 &&
    dailyCounts.thursday === 3 &&
    dailyCounts.friday === 3 &&
    dailyCounts.saturday === 3;

  const allCategoriesPresent =
    categories.addition &&
    categories.subtraction &&
    categories.multiplication &&
    categories.division &&
    categories.verdoppeln &&
    categories.halbieren &&
    categories.nachbarzehner &&
    categories.nachbarhunderter &&
    categories.zahlenmauer;

  const validNumberRange = maxNum <= 1000 && minNum >= 0 && !hasNegatives;
  const noDuplicates = duplicateSignatures.length === 0;
  const isValid =
    validDailyWorkload && allCategoriesPresent && validNumberRange && totalTasks === 18 && noDuplicates;

  const poolStats = calculateMathCategoryPoolStatistics();
  const totalSafeCombinations = getTotalUniqueSafeMathCombinations();
  const minPoolWeeks = Math.min(...Object.values(poolStats).map((p) => p.weeksOfZeroRepetition));

  reportLines.push(
    `Woche ${params.weekNumber || 1}: ${totalTasks} / 18 Aufgaben (Mo–Sa: exakt 3 abwechslungsreiche Aufgaben pro Tag)`
  );
  reportLines.push(
    `Tages-Workload: Mo=${dailyCounts.monday}, Di=${dailyCounts.tuesday}, Mi=${dailyCounts.wednesday}, Do=${dailyCounts.thursday}, Fr=${dailyCounts.friday}, Sa=${dailyCounts.saturday}`
  );
  reportLines.push(
    `Phase-1-Kategorien vollständig: Add=${categories.addition ? '✅' : '❌'}, Sub=${categories.subtraction ? '✅' : '❌'}, Mul=${categories.multiplication ? '✅' : '❌'}, Div=${categories.division ? '✅' : '❌'}, Verd=${categories.verdoppeln ? '✅' : '❌'}, Halb=${categories.halbieren ? '✅' : '❌'}, NZ=${categories.nachbarzehner ? '✅' : '❌'}, NH=${categories.nachbarhunderter ? '✅' : '❌'}, Mauer=${categories.zahlenmauer ? '✅' : '❌'}`
  );
  reportLines.push(
    `Zahlenbereich: Min=${minNum}, Max=${maxNum} (Max <= 1000: ${maxNum <= 1000 ? '✅' : '❌'}, Keine Negativen: ${!hasNegatives ? '✅' : '❌'})`
  );
  reportLines.push(
    `Wöchentliche Einzigartigkeit: ${signaturesSeen.size} / 18 einzigartige Aufgaben-Signaturen (Keine Dubletten: ${noDuplicates ? '✅' : '❌'})`
  );
  reportLines.push(
    `Pool-Sicherheit: ${totalSafeCombinations} mathematisch sichere Kombinationen (Mind. ${minPoolWeeks} Wochen 100% ohne Wiederholungen garantiert)`
  );

  return {
    isValid,
    totalWeeklyTasks: totalTasks,
    dailyCounts,
    phase1CategoriesCovered: categories,
    maxCalculatedNumber: maxNum,
    minCalculatedNumber: minNum,
    hasNegativeNumbers: hasNegatives,
    uniqueSkillsCount: skillsSeen.size,
    uniqueSignaturesCount: signaturesSeen.size,
    duplicateSignaturesWithinWeek: duplicateSignatures,
    totalSafeCombinationsInPools: totalSafeCombinations,
    weeksOfVarietyGuaranteed: minPoolWeeks,
    categoryPoolStats: poolStats,
    reportLines,
  };
}
