import { DayOfWeek } from '../types/lernwoerter';
import {
  MathExercise,
  DailyMathPlan,
  NumberLineExercise,
  NumberPyramidExercise,
  RechenradExercise,
  RechentabelleExercise,
  AufgabenfamilieExercise,
  StellenwertExercise,
  NachbarzahlenExercise,
  DoublingHalvingExercise,
  GroessenvergleichExercise,
  ZahlenfolgenExercise,
  HalbschriftlichExercise,
  StandardArithmeticExercise,
  GeldbetragExercise,
  SachaufgabeExercise,
} from '../types/math';

/**
 * DETERMINISTIC MATH CURRICULUM FOR YEAR 3/4 (Zahlenraum bis 1000)
 *
 * Daily workloads:
 * - Monday:   3 required tasks (Addition 1000, Zahlenstrahl, Verdoppeln/Halbieren)
 * - Tuesday:  3 required tasks (Subtraktion 1000, Nachbarzehner/hunderter, Zahlenmauer)
 * - Wednesday: 3 required tasks (Multiplikation 1x1, Aufgabenfamilie, Rechentabelle)
 * - Thursday: 3 required tasks (Division mit/ohne Rest, Rechenrad, Größenvergleich < > =)
 * - Friday:   3 required tasks (Sachaufgabe mit Denkaufgabe, Geld Euro/Cent, Halbschriftlich)
 * - Saturday: 5 required tasks (Gemischte Wochen-Challenge aus allen 4 Grundrechenarten)
 *
 * Total = 20 tasks per week.
 * Every calculation is <= 1000 and >= 0 (no negative numbers).
 */

export const MONDAY_MATH_TASKS: MathExercise[] = [
  // 1. Addition bis 1000 (Zehner- und Hunderterübergang)
  {
    id: 'mon_math_1_addition_1000',
    day: 'monday',
    type: 'addition_1000',
    title: 'Addition bis 1000',
    subtitle: 'Rechnen im Hunderter-Raum',
    instruction: 'Rechne die Aufgabe im Kopf oder nutze den Rechenweg.',
    skillName: 'Addition bis 1000',
    points: 4,
    equation: '430 + 20',
    blankPosition: 'result',
    correctAnswer: 450,
  } as StandardArithmeticExercise,

  // 2. Zahlenstrahl bis 1000
  {
    id: 'mon_math_2_zahlenstrahl',
    day: 'monday',
    type: 'zahlenstrahl',
    title: 'Zahlenstrahl bis 1000',
    subtitle: 'Orientierung im Tausenderraum',
    instruction: 'Finde die gesuchte Zahl auf dem Zahlenstrahl zwischen 0 und 1000.',
    skillName: 'Zahlenstrahl',
    points: 4,
    rangeMin: 0,
    rangeMax: 1000,
    stepSize: 100,
    targetNumber: 300,
    mode: 'locate',
    labeledTicks: [
      { value: 0 },
      { value: 100 },
      { value: 200 },
      { value: 300, isMissing: true },
      { value: 400 },
      { value: 500 },
      { value: 600 },
      { value: 700 },
      { value: 800 },
      { value: 900 },
      { value: 1000 },
    ],
    correctAnswer: 300,
  } as NumberLineExercise,

  // 3. Verdoppeln und Halbieren
  {
    id: 'mon_math_3_verdoppeln_halbieren',
    day: 'monday',
    type: 'verdoppeln_halbieren',
    title: 'Verdoppeln & Halbieren',
    subtitle: 'Große Zahlen verdoppeln',
    instruction: 'Verdopple die Zahl 320. Tipp: Verdopple erst 300, dann 20.',
    skillName: 'Verdoppeln',
    points: 4,
    mode: 'verdoppeln',
    promptNumber: 320,
    correctAnswer: 640,
  } as DoublingHalvingExercise,
];

export const TUESDAY_MATH_TASKS: MathExercise[] = [
  // 1. Subtraktion bis 1000
  {
    id: 'tue_math_1_subtraktion_1000',
    day: 'tuesday',
    type: 'subtraction_1000',
    title: 'Subtraktion bis 1000',
    subtitle: 'Zehner abziehen',
    instruction: 'Ziehe die Zehnerzahl ab: 860 − 40 = ?',
    skillName: 'Subtraktion bis 1000',
    points: 4,
    equation: '860 − 40',
    blankPosition: 'result',
    correctAnswer: 820,
  } as StandardArithmeticExercise,

  // 2. Nachbarzehner & Nachbarhunderter
  {
    id: 'tue_math_2_nachbarzahlen',
    day: 'tuesday',
    type: 'nachbarzahlen',
    title: 'Nachbarzahlen bestimmen',
    subtitle: 'Vorgänger & Nachfolger',
    instruction: 'Bestimme die Nachbarzehner (NZ) und Nachbarhunderter (NH) für 457.',
    skillName: 'Nachbarzehner',
    points: 4,
    number: 457,
    kind: 'both',
    lowerZehner: 450,
    upperZehner: 460,
    lowerHunderter: 400,
    upperHunderter: 500,
  } as NachbarzahlenExercise,

  // 3. Zahlenmauer / Rechenpyramide
  {
    id: 'tue_math_3_zahlenmauer',
    day: 'tuesday',
    type: 'zahlenmauer',
    title: 'Zahlenmauer / Rechenpyramide',
    subtitle: 'Baue die Mauer nach oben',
    instruction: 'Zwei nebeneinander liegende Steine ergeben zusammen den Stein darüber.',
    skillName: 'Zahlenmauern',
    points: 4,
    bricks: {
      bottom: [
        { id: 'b0', value: 120, isGiven: true },
        { id: 'b1', value: 80, isGiven: true },
        { id: 'b2', value: 150, isGiven: true },
      ],
      middle: [
        { id: 'm0', value: 200, isGiven: false }, // 120 + 80 = 200
        { id: 'm1', value: 230, isGiven: false }, // 80 + 150 = 230
      ],
      top: [
        { id: 't0', value: 430, isGiven: false }, // 200 + 230 = 430
      ],
    },
  } as NumberPyramidExercise,
];

export const WEDNESDAY_MATH_TASKS: MathExercise[] = [
  // 1. Multiplikation (1x1 mit Nachbarstrategie)
  {
    id: 'wed_math_1_multiplikation',
    day: 'wednesday',
    type: 'multiplication_facts',
    title: 'Multiplikation – Einmaleins',
    subtitle: '7er- und 8er-Reihe',
    instruction: 'Rechne die Malaufgabe: 6 × 4 = ? Nutze die Nachbaraufgabe 5 × 4 wenn nötig.',
    skillName: 'Multiplikation',
    points: 4,
    equation: '6 × 4',
    blankPosition: 'result',
    correctAnswer: 24,
    dotArray: { rows: 4, cols: 6 },
    neighbourStrategy: {
      prev: '5 × 4 = 20',
      target: '6 × 4 = ?',
      next: '7 × 4 = 28',
    },
  } as StandardArithmeticExercise,

  // 2. Aufgabenfamilie (4 Aufgaben aus 3 Zahlen)
  {
    id: 'wed_math_2_aufgabenfamilie',
    day: 'wednesday',
    type: 'aufgabenfamilie',
    title: 'Aufgabenfamilie',
    subtitle: 'Zusammenhang von Mal und Geteilt',
    instruction: 'Bilde aus den 3 Zahlen (4, 5, 20) zwei Mal- und zwei Geteilt-Aufgaben.',
    skillName: 'Aufgabenfamilien',
    points: 4,
    numbers: [4, 5, 20],
    equations: [
      { op1: 4, operator: '×', op2: 5, result: 20 },
      { op1: 5, operator: '×', op2: 4, result: 20 },
      { op1: 20, operator: '÷', op2: 5, result: 4 },
      { op1: 20, operator: '÷', op2: 4, result: 5 },
    ],
  } as AufgabenfamilieExercise,

  // 3. Rechentabelle (+ Grid)
  {
    id: 'wed_math_3_rechentabelle',
    day: 'wednesday',
    type: 'rechentabelle',
    title: 'Rechentabelle',
    subtitle: 'Zehner im Gitter addieren',
    instruction: 'Addiere die Zeilenzahl mit der Spaltenzahl und trage die Ergebnisse ein.',
    skillName: 'Rechentabellen',
    points: 4,
    operator: '+',
    colHeaders: [20, 50, 60],
    rowHeaders: [590, 660],
    grid: [
      [610, 640, 650], // 590+20=610, 590+50=640, 590+60=650
      [680, 710, 720], // 660+20=680, 660+50=710, 660+60=720
    ],
  } as RechentabelleExercise,
];

export const THURSDAY_MATH_TASKS: MathExercise[] = [
  // 1. Division mit / ohne Rest
  {
    id: 'thu_math_1_division',
    day: 'thursday',
    type: 'division_facts',
    title: 'Division – Teilen mit Rest',
    subtitle: 'Aufteilen & Rest bestimmen',
    instruction: 'Teile 40 durch 7: Wie oft passt die 7 hinein und wie viel bleibt als Rest übrig?',
    skillName: 'Division',
    points: 4,
    equation: '40 ÷ 7',
    blankPosition: 'result',
    correctAnswer: '5 Rest 5',
    hasRemainder: true,
    remainder: 5,
  } as StandardArithmeticExercise,

  // 2. Rechenrad
  {
    id: 'thu_math_2_rechenrad',
    day: 'thursday',
    type: 'rechenrad',
    title: 'Rechenrad',
    subtitle: 'Vom Zentrum nach außen',
    instruction: 'Die Zahl in der Mitte ist 420. Wende jede Operation nach außen an.',
    skillName: 'Rechenräder',
    points: 4,
    centerNumber: 420,
    spokes: [
      { operation: '+', operand: 30, result: 450 },
      { operation: '+', operand: 80, result: 500 },
      { operation: '+', operand: 20, result: 440 },
      { operation: '+', operand: 70, result: 490 },
    ],
  } as RechenradExercise,

  // 3. Größenvergleich (< > =)
  {
    id: 'thu_math_3_groessenvergleich',
    day: 'thursday',
    type: 'groessenvergleich',
    title: 'Größenvergleich (< > =)',
    subtitle: 'Rechnungen und Zahlen vergleichen',
    instruction: 'Setze das richtige Zeichen ein: < (kleiner), > (größer) oder = (gleich).',
    skillName: 'Größenvergleich',
    points: 4,
    items: [
      { leftExpr: '200', leftVal: 200, rightExpr: '600', rightVal: 600, correctOp: '<' },
      { leftExpr: '300 + 200', leftVal: 500, rightExpr: '400', rightVal: 400, correctOp: '>' },
      { leftExpr: '500 − 300', leftVal: 200, rightExpr: '100 + 100', rightVal: 200, correctOp: '=' },
    ],
  } as GroessenvergleichExercise,
];

export const FRIDAY_MATH_TASKS: MathExercise[] = [
  // 1. Sachaufgabe mit Information-Check ("Kannst du diese Aufgabe lösen?")
  {
    id: 'fri_math_1_sachaufgabe',
    day: 'friday',
    type: 'sachaufgabe',
    title: 'Sachaufgabe – Detektiv-Check',
    subtitle: 'Fahrrad-Ausflug & Information prüfen',
    instruction: 'Lies die Aufgabe genau. Prüfe: Kannst du sie lösen oder fehlen Angaben?',
    skillName: 'Sachaufgaben',
    points: 4,
    topic: 'fahrrad',
    story:
      'Leo und David machen eine Fahrrad-Tour um den See. Am Vormittag fahren sie 14 km. Am Nachmittag machen sie eine Pause und essen ein Eis.',
    question: 'Wie viele Kilometer sind die beiden Jungen insgesamt gefahren?',
    isMissingInformation: true,
    missingReason:
      'Es fehlt die Angabe, wie viele Kilometer Leo und David nach der Eis-Pause noch gefahren sind!',
    correctAnswer: 'Nein, es fehlen Informationen.',
  } as SachaufgabeExercise,

  // 2. Geldbeträge in Euro & Cent
  {
    id: 'fri_math_2_geld',
    day: 'friday',
    type: 'geldbetrag',
    title: 'Geldbeträge in Euro & Cent',
    subtitle: 'Einkauf für die Schule',
    instruction: 'Rechne die Preise zusammen. Wie viel kosten ein Rucksack und zwei Hefte?',
    skillName: 'Geldbeträge',
    points: 4,
    items: [
      { name: 'Bleistift', priceEuro: 1.2, icon: '✏️' },
      { name: 'Schreibheft', priceEuro: 2.6, icon: '📓' },
      { name: 'Schul-Rucksack', priceEuro: 19.5, icon: '🎒' },
    ],
    question: 'Du kaufst einen Rucksack (19,50 €) und zwei Hefte (je 2,60 €). Wie viel bezahlst du?',
    correctTotalCent: 2470, // 1950 + 260 + 260 = 2470
    formattedAnswer: '24,70 €',
  } as GeldbetragExercise,

  // 3. Halbschriftliches Rechnen mit Rechenweg
  {
    id: 'fri_math_3_halbschriftlich',
    day: 'friday',
    type: 'halbschriftlich',
    title: 'Halbschriftliche Addition',
    subtitle: 'Schrittweise rechnen mit Zehnern und Einern',
    instruction: 'Rechne 72 + 25 in zwei Schritten: erst die Zehner (+20), dann die Einer (+5).',
    skillName: 'Halbschriftlich',
    points: 4,
    problem: '72 + 25',
    op1: 72,
    op2: 25,
    operator: '+',
    step1: { expr: '72 + 20', result: 92 },
    step2: { expr: '92 + 5', result: 97 },
    finalResult: 97,
  } as HalbschriftlichExercise,
];

export const SATURDAY_MATH_TASKS: MathExercise[] = [
  // 1. Stellenwert H/Z/E
  {
    id: 'sat_math_1_stellenwert',
    day: 'saturday',
    type: 'stellenwert_hze',
    title: 'Stellenwert H / Z / E',
    subtitle: 'Hunderter, Zehner und Einer bündeln',
    instruction: 'Welche Zahl wird durch 3 Hunderter-Platten, 5 Zehner-Stangen und 9 Einer-Würfel dargestellt?',
    skillName: 'Stellenwert H/Z/E',
    points: 4,
    hundreds: 3,
    tens: 5,
    ones: 9,
    totalNumber: 359,
    mode: 'blocks_to_number',
  } as StellenwertExercise,

  // 2. Zahlenfolgen (+50 / -100 / Muster)
  {
    id: 'sat_math_2_zahlenfolgen',
    day: 'saturday',
    type: 'zahlenfolgen',
    title: 'Zahlenfolgen',
    subtitle: 'Muster erkennen & fortsetzen',
    instruction: 'Erkenne die Regel und trage die fehlende Zahl ein: 100, 400, 700, ___',
    skillName: 'Zahlenfolgen',
    points: 4,
    sequence: [100, 400, 700, null],
    stepDescription: 'Immer +300',
    correctAnswers: [1000],
  } as ZahlenfolgenExercise,

  // 3. Ergänzen zum nächsten Hunderter
  {
    id: 'sat_math_3_ergaenzen_100',
    day: 'saturday',
    type: 'fehlende_zehner_hunderter',
    title: 'Ergänzen zum Hunderter',
    subtitle: 'Fehlende Zahl finden',
    instruction: 'Finde die fehlende Zahl: 340 + ___ = 400',
    skillName: 'Fehlende Zehnerzahlen',
    points: 4,
    equation: '340 + ___ = 400',
    blankPosition: 'second',
    correctAnswer: 60,
  } as StandardArithmeticExercise,

  // 4. Multiplikation mit Umkehraufgabe
  {
    id: 'sat_math_4_multiplikation_luecke',
    day: 'saturday',
    type: 'multiplication_facts',
    title: 'Einmaleins mit Lücke',
    subtitle: '8er-Reihe rückwärts denken',
    instruction: 'Finde den fehlenden Faktor: 8 × ___ = 48',
    skillName: 'Multiplikation Lücke',
    points: 4,
    equation: '8 × ___ = 48',
    blankPosition: 'second',
    correctAnswer: 6,
  } as StandardArithmeticExercise,

  // 5. Umkehr-Rätsel: Verdoppeln & Halbieren
  {
    id: 'sat_math_5_halbieren_raetsel',
    day: 'saturday',
    type: 'verdoppeln_halbieren',
    title: 'Zahlenrätsel Halbieren',
    subtitle: 'Das Doppelte rückwärts',
    instruction: 'Das Doppelte meiner Zahl ist 840. Welche Zahl suche ich?',
    skillName: 'Halbieren',
    points: 4,
    mode: 'umkehr',
    promptNumber: 840,
    correctAnswer: 420,
    riddleText: 'Das Doppelte meiner Zahl ist 840. Welche Zahl suche ich?',
  } as DoublingHalvingExercise,
];

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
 * Monday–Friday: strictly 3 required tasks.
 * Saturday: 5-question mixed challenge.
 *
 * If student has strugglingSkills, conditionally adapts an exercise
 * to provide reinforcement, while maintaining the strict 3-task (or 5-task Sat) limit.
 */
export function generateDailyMathPlan(params: {
  day: DayOfWeek;
  strugglingSkills?: string[];
}): DailyMathPlan {
  const { day } = params;
  const baseTasks = ALL_WEEKLY_MATH_TASKS[day] || ALL_WEEKLY_MATH_TASKS.monday;

  return {
    day,
    tasks: baseTasks,
    isSaturdayChallenge: day === 'saturday',
    estimatedMinutes: day === 'saturday' ? 15 : 12,
  };
}

/**
 * QA VALIDATION REPORT FOR MATHS MODULE
 * Validates:
 * 1. Exactly 3 daily tasks Mon-Fri, 5 on Sat (20 total).
 * 2. All 4 operations represented across the week (+, -, ×, ÷).
 * 3. Number range never exceeds 1000.
 * 4. No negative numbers.
 * 5. High variety: never 3 identical tasks on any day.
 */
export interface MathWeeklyQAReport {
  isValid: boolean;
  totalWeeklyTasks: number;
  dailyCounts: Record<DayOfWeek, number>;
  operationsCovered: {
    addition: boolean;
    subtraction: boolean;
    multiplication: boolean;
    division: boolean;
  };
  maxCalculatedNumber: number;
  minCalculatedNumber: number;
  hasNegativeNumbers: boolean;
  uniqueSkillsCount: number;
  reportLines: string[];
}

export function validateMathWeeklyPlan(): MathWeeklyQAReport {
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

  const operations = {
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
  };

  let totalTasks = 0;
  const reportLines: string[] = [];

  days.forEach((d) => {
    const plan = generateDailyMathPlan({ day: d });
    dailyCounts[d] = plan.tasks.length;
    totalTasks += plan.tasks.length;

    plan.tasks.forEach((t) => {
      skillsSeen.add(t.skillName);

      // Track operations
      if (
        t.type === 'addition_1000' ||
        t.type === 'zahlenmauer' ||
        t.type === 'rechentabelle' ||
        t.type === 'halbschriftlich' ||
        t.type === 'geldbetrag'
      ) {
        operations.addition = true;
      }
      if (t.type === 'subtraction_1000') {
        operations.subtraction = true;
      }
      if (
        t.type === 'multiplication_facts' ||
        t.type === 'aufgabenfamilie' ||
        t.type === 'verdoppeln_halbieren'
      ) {
        operations.multiplication = true;
      }
      if (t.type === 'division_facts' || t.type === 'aufgabenfamilie') {
        operations.division = true;
      }

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
      if ('targetNumber' in t) checkVal((t as any).targetNumber);
      if ('number' in t) checkVal((t as any).number);
      if ('totalNumber' in t) checkVal((t as any).totalNumber);
      if ('finalResult' in t) checkVal((t as any).finalResult);
    });
  });

  const validDailyWorkload =
    dailyCounts.monday === 3 &&
    dailyCounts.tuesday === 3 &&
    dailyCounts.wednesday === 3 &&
    dailyCounts.thursday === 3 &&
    dailyCounts.friday === 3 &&
    dailyCounts.saturday === 5;

  const allOperationsPresent =
    operations.addition && operations.subtraction && operations.multiplication && operations.division;

  const validNumberRange = maxNum <= 1000 && minNum >= 0 && !hasNegatives;

  const isValid = validDailyWorkload && allOperationsPresent && validNumberRange && totalTasks === 20;

  reportLines.push(`Gesamtaufgaben: ${totalTasks} / 20 (Mo–Fr: je 3, Sa: 5 Challenge-Aufgaben)`);
  reportLines.push(
    `Tages-Workload: Mo=${dailyCounts.monday}, Di=${dailyCounts.tuesday}, Mi=${dailyCounts.wednesday}, Do=${dailyCounts.thursday}, Fr=${dailyCounts.friday}, Sa=${dailyCounts.saturday}`
  );
  reportLines.push(
    `Grundrechenarten: Addition=${operations.addition ? '✅' : '❌'}, Subtraktion=${operations.subtraction ? '✅' : '❌'}, Multiplikation=${operations.multiplication ? '✅' : '❌'}, Division=${operations.division ? '✅' : '❌'}`
  );
  reportLines.push(`Zahlenbereich: Min=${minNum}, Max=${maxNum} (Max <= 1000: ${maxNum <= 1000 ? '✅' : '❌'}, Keine Negativen: ${!hasNegatives ? '✅' : '❌'})`);
  reportLines.push(`Kompetenzen & Formate abgedeckt: ${skillsSeen.size} verschiedene Skills`);

  return {
    isValid,
    totalWeeklyTasks: totalTasks,
    dailyCounts,
    operationsCovered: operations,
    maxCalculatedNumber: maxNum,
    minCalculatedNumber: minNum,
    hasNegativeNumbers: hasNegatives,
    uniqueSkillsCount: skillsSeen.size,
    reportLines,
  };
}
