/**
 * DETERMINISTIC MATH ENGINE
 *
 * All arithmetic generation, calculation, and validation are strictly performed in code.
 * Mathematical correctness NEVER relies on an LLM or heuristic approximation.
 *
 * Core principle: Generate -> calculate in code -> validate before display.
 */

import {
  MathExercise,
  StandardArithmeticExercise,
  DoublingHalvingExercise,
  NachbarzahlenExercise,
  NumberPyramidExercise,
  ZahlenfolgenExercise,
} from '../types/math';

export interface NeighboursResult {
  lowerTen: number;
  upperTen: number;
  lowerHundred: number;
  upperHundred: number;
}

/**
 * Calculates Nachbarzehner and Nachbarhunderter deterministically.
 * Rule:
 * For n not a multiple of 10:
 *   lowerTen = floor(n / 10) * 10
 *   upperTen = lowerTen + 10
 * For n exact multiple of 10:
 *   lowerTen = n - 10
 *   upperTen = n + 10
 *
 * For n not a multiple of 100:
 *   lowerHundred = floor(n / 100) * 100
 *   upperHundred = lowerHundred + 100
 * For n exact multiple of 100:
 *   lowerHundred = n - 100
 *   upperHundred = n + 100
 */
export function calculateNeighbours(n: number): NeighboursResult {
  let lowerTen: number;
  let upperTen: number;
  if (n % 10 === 0) {
    lowerTen = n - 10;
    upperTen = n + 10;
  } else {
    lowerTen = Math.floor(n / 10) * 10;
    upperTen = lowerTen + 10;
  }

  let lowerHundred: number;
  let upperHundred: number;
  if (n % 100 === 0) {
    lowerHundred = n - 100;
    upperHundred = n + 100;
  } else {
    lowerHundred = Math.floor(n / 100) * 100;
    upperHundred = lowerHundred + 100;
  }

  return { lowerTen, upperTen, lowerHundred, upperHundred };
}

/**
 * Deterministic Doubling (Verdoppeln)
 */
export function calculateDouble(n: number): number {
  const result = n * 2;
  if (result > 1000) {
    throw new Error(`Double of ${n} exceeds 1000: ${result}`);
  }
  return result;
}

/**
 * Deterministic Halving (Halbieren)
 * Accepts only even numbers to ensure integer results.
 */
export function calculateHalf(n: number): number {
  if (n % 2 !== 0) {
    throw new Error(`calculateHalf requires an even number, got ${n}`);
  }
  return n / 2;
}

/**
 * Deterministic Number Wall (Zahlenmauer / Rechenpyramide)
 * Every stone = sum of the two stones directly beneath it.
 * Bottom: [b0, b1, b2]
 * Middle: [b0 + b1, b1 + b2]
 * Top:    [m0 + m1]
 */
export interface NumberWallCalculation {
  bottom: [number, number, number];
  middle: [number, number];
  top: [number];
}

export function calculateNumberWall(b0: number, b1: number, b2: number): NumberWallCalculation {
  const m0 = b0 + b1;
  const m1 = b1 + b2;
  const t0 = m0 + m1;

  if (t0 > 1000 || b0 < 0 || b1 < 0 || b2 < 0) {
    throw new Error(`Number wall exceeds 1000 or has negative values: top=${t0}`);
  }

  return {
    bottom: [b0, b1, b2],
    middle: [m0, m1],
    top: [t0],
  };
}

/**
 * Validates whether a given 3-level pyramid is mathematically consistent.
 */
export function isNumberWallValid(wall: {
  bottom: number[];
  middle: number[];
  top: number[];
}): boolean {
  if (!wall || wall.bottom.length !== 3 || wall.middle.length !== 2 || wall.top.length !== 1) {
    return false;
  }
  const [b0, b1, b2] = wall.bottom;
  const [m0, m1] = wall.middle;
  const [t0] = wall.top;

  return m0 === b0 + b1 && m1 === b1 + b2 && t0 === m0 + m1;
}

/**
 * Deterministic Addition (Zahlenraum 0–1000)
 */
export function calculateAddition(a: number, b: number): number {
  const sum = a + b;
  if (sum < 0 || sum > 1000 || a < 0 || b < 0) {
    throw new Error(`Addition result out of bounds [0..1000]: ${a} + ${b} = ${sum}`);
  }
  return sum;
}

/**
 * Deterministic Subtraction (Zahlenraum 0–1000, non-negative)
 */
export function calculateSubtraction(a: number, b: number): number {
  if (a < b) {
    throw new Error(`Negative subtraction result not permitted: ${a} - ${b}`);
  }
  const diff = a - b;
  if (diff < 0 || a > 1000 || b < 0) {
    throw new Error(`Subtraction result out of bounds [0..1000]: ${a} - ${b} = ${diff}`);
  }
  return diff;
}

/**
 * Deterministic Multiplication
 */
export function calculateMultiplication(a: number, b: number): number {
  const product = a * b;
  if (product > 1000 || a < 0 || b < 0) {
    throw new Error(`Multiplication result out of bounds: ${a} * ${b} = ${product}`);
  }
  return product;
}

/**
 * Deterministic Exact Division
 * Dividend must be exact multiple of divisor.
 */
export function calculateDivision(dividend: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Division by zero');
  }
  if (dividend % divisor !== 0) {
    throw new Error(`Exact division required, but ${dividend} ÷ ${divisor} has remainder`);
  }
  return dividend / divisor;
}

/**
 * Backwards generator for exact divisions:
 * divisor * quotient = dividend
 */
export function generateExactDivision(
  divisor: number,
  quotient: number
): { dividend: number; divisor: number; quotient: number } {
  if (divisor <= 0 || quotient < 0) {
    throw new Error('Divisor must be > 0 and quotient >= 0');
  }
  const dividend = divisor * quotient;
  if (dividend > 1000) {
    throw new Error(`Dividend ${dividend} exceeds 1000`);
  }
  return { dividend, divisor, quotient };
}

/**
 * Automatic mathematical integrity test (Section 13)
 * Validates any math exercise before it can be displayed.
 */
export function validateMathExercise(exercise: MathExercise): { isValid: boolean; error?: string } {
  if (!exercise || !exercise.id || !exercise.type) {
    return { isValid: false, error: 'Malformed exercise object' };
  }

  switch (exercise.type) {
    case 'addition_1000': {
      const ex = exercise as StandardArithmeticExercise;
      if (ex.blankPosition === 'second') {
        const match = ex.equation.match(/(\d+)\s*\+\s*___\s*=\s*(\d+)/);
        if (!match) return { isValid: false, error: 'Malformed missing addend equation' };
        const op1 = parseInt(match[1], 10);
        const target = parseInt(match[2], 10);
        const ans = Number(ex.correctAnswer);
        if (op1 + ans !== target) {
          return { isValid: false, error: `Addition validation failed: ${op1} + ${ans} !== ${target}` };
        }
        if (target > 1000 || op1 < 0 || ans < 0) {
          return { isValid: false, error: 'Addition numbers out of range [0..1000]' };
        }
      } else {
        const match = ex.equation.match(/(\d+)\s*\+\s*(\d+)/);
        if (!match) return { isValid: false, error: 'Malformed addition equation' };
        const op1 = parseInt(match[1], 10);
        const op2 = parseInt(match[2], 10);
        const expected = calculateAddition(op1, op2);
        if (Number(ex.correctAnswer) !== expected) {
          return {
            isValid: false,
            error: `Addition answer mismatch: ${op1} + ${op2} expected ${expected}, got ${ex.correctAnswer}`,
          };
        }
      }
      return { isValid: true };
    }

    case 'subtraction_1000': {
      const ex = exercise as StandardArithmeticExercise;
      if (ex.blankPosition === 'second') {
        const match = ex.equation.match(/(\d+)\s*[-−]\s*___\s*=\s*(\d+)/);
        if (!match) return { isValid: false, error: 'Malformed missing subtrahend equation' };
        const op1 = parseInt(match[1], 10);
        const target = parseInt(match[2], 10);
        const ans = Number(ex.correctAnswer);
        if (op1 - ans !== target) {
          return { isValid: false, error: `Subtraction validation failed: ${op1} - ${ans} !== ${target}` };
        }
      } else if (ex.blankPosition === 'first') {
        const match = ex.equation.match(/___\s*[-−]\s*(\d+)\s*=\s*(\d+)/);
        if (!match) return { isValid: false, error: 'Malformed missing minuend equation' };
        const op2 = parseInt(match[1], 10);
        const target = parseInt(match[2], 10);
        const ans = Number(ex.correctAnswer);
        if (ans - op2 !== target) {
          return { isValid: false, error: `Subtraction validation failed: ${ans} - ${op2} !== ${target}` };
        }
      } else {
        const match = ex.equation.match(/(\d+)\s*[-−]\s*(\d+)/);
        if (!match) return { isValid: false, error: 'Malformed subtraction equation' };
        const op1 = parseInt(match[1], 10);
        const op2 = parseInt(match[2], 10);
        const expected = calculateSubtraction(op1, op2);
        if (Number(ex.correctAnswer) !== expected) {
          return {
            isValid: false,
            error: `Subtraction answer mismatch: ${op1} - ${op2} expected ${expected}, got ${ex.correctAnswer}`,
          };
        }
      }
      return { isValid: true };
    }

    case 'multiplication_facts': {
      const ex = exercise as StandardArithmeticExercise;
      if (ex.blankPosition === 'second') {
        const match = ex.equation.match(/(\d+)\s*[×*x]\s*___\s*=\s*(\d+)/);
        if (!match) return { isValid: false, error: 'Malformed missing factor equation' };
        const op1 = parseInt(match[1], 10);
        const target = parseInt(match[2], 10);
        const ans = Number(ex.correctAnswer);
        if (op1 * ans !== target) {
          return { isValid: false, error: `Multiplication validation failed: ${op1} * ${ans} !== ${target}` };
        }
      } else {
        const match = ex.equation.match(/(\d+)\s*[×*x]\s*(\d+)/);
        if (!match) return { isValid: false, error: 'Malformed multiplication equation' };
        const op1 = parseInt(match[1], 10);
        const op2 = parseInt(match[2], 10);
        const expected = calculateMultiplication(op1, op2);
        if (Number(ex.correctAnswer) !== expected) {
          return {
            isValid: false,
            error: `Multiplication answer mismatch: ${op1} * ${op2} expected ${expected}, got ${ex.correctAnswer}`,
          };
        }
      }
      return { isValid: true };
    }

    case 'division_facts': {
      const ex = exercise as StandardArithmeticExercise;
      const match = ex.equation.match(/(\d+)\s*[÷/:]\s*(\d+)/);
      if (!match) return { isValid: false, error: 'Malformed division equation' };
      const dividend = parseInt(match[1], 10);
      const divisor = parseInt(match[2], 10);
      if (divisor === 0) return { isValid: false, error: 'Division by zero' };

      if (ex.hasRemainder) {
        const q = Math.floor(dividend / divisor);
        const r = dividend % divisor;
        if (ex.remainder !== r || String(ex.correctAnswer).trim() !== `${q} Rest ${r}`) {
          return { isValid: false, error: `Division with remainder mismatch` };
        }
      } else {
        if (dividend % divisor !== 0) {
          return { isValid: false, error: `Division not exact: ${dividend} ÷ ${divisor}` };
        }
        const expected = calculateDivision(dividend, divisor);
        if (Number(ex.correctAnswer) !== expected) {
          return {
            isValid: false,
            error: `Division answer mismatch: ${dividend} ÷ ${divisor} expected ${expected}, got ${ex.correctAnswer}`,
          };
        }
      }
      return { isValid: true };
    }

    case 'verdoppeln_halbieren': {
      const ex = exercise as DoublingHalvingExercise;
      if (ex.mode === 'verdoppeln') {
        const expected = calculateDouble(ex.promptNumber);
        if (ex.correctAnswer !== expected) {
          return {
            isValid: false,
            error: `Doubling mismatch: ${ex.promptNumber} * 2 = ${expected}, got ${ex.correctAnswer}`,
          };
        }
      } else if (ex.mode === 'halbieren') {
        if (ex.promptNumber % 2 !== 0) {
          return { isValid: false, error: `Halving odd number not permitted: ${ex.promptNumber}` };
        }
        const expected = calculateHalf(ex.promptNumber);
        if (ex.correctAnswer !== expected) {
          return {
            isValid: false,
            error: `Halving mismatch: ${ex.promptNumber} / 2 = ${expected}, got ${ex.correctAnswer}`,
          };
        }
      } else if (ex.mode === 'umkehr') {
        if (ex.promptNumber % 2 !== 0) {
          return { isValid: false, error: `Inverse doubling odd number not permitted: ${ex.promptNumber}` };
        }
        const expected = ex.promptNumber / 2;
        if (ex.correctAnswer !== expected) {
          return {
            isValid: false,
            error: `Inverse doubling mismatch: got ${ex.correctAnswer}, expected ${expected}`,
          };
        }
      }
      return { isValid: true };
    }

    case 'nachbarzahlen': {
      const ex = exercise as NachbarzahlenExercise;
      const expected = calculateNeighbours(ex.number);
      if (ex.kind === 'zehner' || ex.kind === 'both') {
        if (ex.lowerZehner !== expected.lowerTen || ex.upperZehner !== expected.upperTen) {
          return {
            isValid: false,
            error: `Nachbarzehner mismatch for ${ex.number}: expected ${expected.lowerTen} & ${expected.upperTen}, got ${ex.lowerZehner} & ${ex.upperZehner}`,
          };
        }
      }
      if (ex.kind === 'hunderter' || ex.kind === 'both') {
        if (ex.lowerHunderter !== expected.lowerHundred || ex.upperHunderter !== expected.upperHundred) {
          return {
            isValid: false,
            error: `Nachbarhunderter mismatch for ${ex.number}: expected ${expected.lowerHundred} & ${expected.upperHundred}, got ${ex.lowerHunderter} & ${ex.upperHunderter}`,
          };
        }
      }
      return { isValid: true };
    }

    case 'zahlenmauer': {
      const ex = exercise as NumberPyramidExercise;
      const { bottom, middle, top } = ex.bricks;
      if (bottom.length !== 3 || middle.length !== 2 || top.length !== 1) {
        return { isValid: false, error: 'Zahlenmauer structure must have 3 bottom, 2 middle, 1 top brick' };
      }
      const bVals = bottom.map((b) => b.value);
      const mVals = middle.map((b) => b.value);
      const tVals = top.map((b) => b.value);

      const isValid = isNumberWallValid({ bottom: bVals, middle: mVals, top: tVals });
      if (!isValid) {
        return {
          isValid: false,
          error: `Zahlenmauer internally inconsistent: bottom=[${bVals.join(',')}], middle=[${mVals.join(',')}], top=[${tVals.join(',')}]`,
        };
      }
      return { isValid: true };
    }

    default:
      return { isValid: true };
  }
}

/**
 * Validates a user's submitted answer strictly against the current active MathExercise.
 * Never allows stale cached answers, wrong-task answers, or cross-task pollution.
 */
export interface UserMathAnswerValidationResult {
  isCorrect: boolean;
  expectedAnswer?: string | number;
  feedback?: string;
}

export function validateUserMathAnswer(
  exercise: MathExercise,
  typedAnswer: string,
  options?: { remainder?: string }
): UserMathAnswerValidationResult {
  const cleanAns = typedAnswer.trim();
  if (!cleanAns) {
    return { isCorrect: false, feedback: 'Bitte trage dein Ergebnis ein.' };
  }

  switch (exercise.type) {
    case 'addition_1000':
    case 'subtraction_1000':
    case 'multiplication_facts':
    case 'division_facts':
    case 'fehlende_zehner_hunderter': {
      const ex = exercise as StandardArithmeticExercise;
      if (ex.hasRemainder) {
        const remClean = (options?.remainder || '').trim();
        const enteredQuotient = parseInt(cleanAns, 10);
        const enteredRemainder = parseInt(remClean, 10);

        const expectedQuotient = Math.floor(Number(ex.correctAnswer));
        const expectedRemainder = ex.remainder ?? 0;

        const isRight =
          !isNaN(enteredQuotient) &&
          !isNaN(enteredRemainder) &&
          enteredQuotient === expectedQuotient &&
          enteredRemainder === expectedRemainder;

        return {
          isCorrect: isRight,
          expectedAnswer: `${expectedQuotient} Rest ${expectedRemainder}`,
          feedback: isRight
            ? undefined
            : (ex.hint || 'Das Ergebnis oder der Rest stimmen noch nicht. Rechne noch einmal Schritt für Schritt!'),
        };
      } else {
        const cleanExpected = String(ex.correctAnswer).trim();
        const isNumeric = !isNaN(Number(cleanAns)) && !isNaN(Number(cleanExpected));
        const isRight = isNumeric
          ? Number(cleanAns) === Number(cleanExpected)
          : cleanAns.toLowerCase() === cleanExpected.toLowerCase();

        return {
          isCorrect: isRight,
          expectedAnswer: ex.correctAnswer,
          feedback: isRight
            ? undefined
            : (ex.hint || '❌ Das Ergebnis stimmt noch nicht. Versuche es noch einmal in Einzelschritten!'),
        };
      }
    }

    case 'verdoppeln_halbieren': {
      const ex = exercise as DoublingHalvingExercise;
      const num = parseInt(cleanAns, 10);
      const isRight = !isNaN(num) && num === ex.correctAnswer;
      return {
        isCorrect: isRight,
        expectedAnswer: ex.correctAnswer,
        feedback: isRight
          ? undefined
          : (ex.hint || '❌ Tipp: Zerlege die Zahl erst in Hunderter und Zehner und berechne beide Teile einzeln!'),
      };
    }

    case 'zahlenfolgen': {
      const ex = exercise as ZahlenfolgenExercise;
      const num = parseInt(cleanAns, 10);
      const isRight = !isNaN(num) && ex.correctAnswers.includes(num);
      return {
        isCorrect: isRight,
        expectedAnswer: ex.correctAnswers[0],
        feedback: isRight ? undefined : (ex.hint || '❌ Schau dir den Abstand zwischen den Zahlen genau an!'),
      };
    }

    default:
      if ('correctAnswer' in exercise) {
        const anyEx = exercise as any;
        const isRight = String(cleanAns).toLowerCase() === String(anyEx.correctAnswer).trim().toLowerCase();
        return {
          isCorrect: isRight,
          expectedAnswer: anyEx.correctAnswer,
          feedback: isRight ? undefined : anyEx.hint,
        };
      }
      return { isCorrect: false, feedback: 'Unbekannter Aufgabentyp.' };
  }
}

/**
 * Hard State Isolation QA Suite
 * Asserts that:
 * 1. 7 × 8 rejects 60 and accepts only 56
 * 2. 860 − 40 rejects 7 and accepts only 820
 * 3. 35 ÷ 5 rejects 820 and accepts only 7
 * 4. 48 ÷ 6 rejects 24 and accepts only 8
 * 5. Cross-task navigation prevents answer leakage
 */
export function runMathStateIsolationQA(): {
  allPassed: boolean;
  results: { testName: string; passed: boolean; message: string }[];
} {
  const results: { testName: string; passed: boolean; message: string }[] = [];

  const task7x8: StandardArithmeticExercise = {
    id: 'qa-mult-7x8',
    day: 'tuesday',
    type: 'multiplication_facts',
    title: 'Multiplikation',
    subtitle: '7 × 8',
    instruction: 'Berechne das Produkt:',
    skillName: 'Multiplikation',
    points: 4,
    equation: '7 × 8',
    blankPosition: 'result',
    correctAnswer: 56,
  };

  const task860minus40: StandardArithmeticExercise = {
    id: 'qa-sub-860-40',
    day: 'thursday',
    type: 'subtraction_1000',
    title: 'Subtraktion',
    subtitle: '860 − 40',
    instruction: 'Berechne die Differenz:',
    skillName: 'Subtraktion bis 1000',
    points: 4,
    equation: '860 − 40',
    blankPosition: 'result',
    correctAnswer: 820,
  };

  const task35div5: StandardArithmeticExercise = {
    id: 'qa-div-35-5',
    day: 'tuesday',
    type: 'division_facts',
    title: 'Division',
    subtitle: '35 ÷ 5',
    instruction: 'Berechne den Quotienten:',
    skillName: 'Division',
    points: 4,
    equation: '35 ÷ 5',
    blankPosition: 'result',
    correctAnswer: 7,
    hasRemainder: false,
  };

  const task48div6: StandardArithmeticExercise = {
    id: 'qa-div-48-6',
    day: 'thursday',
    type: 'division_facts',
    title: 'Division',
    subtitle: '48 ÷ 6',
    instruction: 'Berechne den Quotienten:',
    skillName: 'Division',
    points: 4,
    equation: '48 ÷ 6',
    blankPosition: 'result',
    correctAnswer: 8,
    hasRemainder: false,
  };

  const taskDouble250: DoublingHalvingExercise = {
    id: 'qa-double-250',
    day: 'monday',
    type: 'verdoppeln_halbieren',
    mode: 'verdoppeln',
    title: 'Verdoppeln',
    subtitle: 'Verdopple 250',
    instruction: 'Verdopple die Zahl:',
    skillName: 'Verdoppeln & Halbieren',
    points: 4,
    promptNumber: 250,
    correctAnswer: 500,
  };

  // Test 1: 7 × 8 -> 60 rejected, 56 accepted
  const res7x8_wrong = validateUserMathAnswer(task7x8, '60');
  const res7x8_right = validateUserMathAnswer(task7x8, '56');
  results.push({
    testName: '7 × 8: Rejects 60 and accepts only 56',
    passed: !res7x8_wrong.isCorrect && res7x8_right.isCorrect,
    message: !res7x8_wrong.isCorrect && res7x8_right.isCorrect
      ? 'OK: 60 correctly rejected, 56 correctly accepted'
      : `FAILED: 60 was ${res7x8_wrong.isCorrect ? 'accepted' : 'rejected'}, 56 was ${res7x8_right.isCorrect ? 'accepted' : 'rejected'}`,
  });

  // Test 2: 860 − 40 -> 7 rejected, 820 accepted
  const res860_wrong = validateUserMathAnswer(task860minus40, '7');
  const res860_right = validateUserMathAnswer(task860minus40, '820');
  results.push({
    testName: '860 − 40: Rejects 7 and accepts only 820',
    passed: !res860_wrong.isCorrect && res860_right.isCorrect,
    message: !res860_wrong.isCorrect && res860_right.isCorrect
      ? 'OK: 7 correctly rejected, 820 correctly accepted'
      : `FAILED: 7 was ${res860_wrong.isCorrect ? 'accepted' : 'rejected'}, 820 was ${res860_right.isCorrect ? 'accepted' : 'rejected'}`,
  });

  // Test 3: 35 ÷ 5 -> 820 rejected, 7 accepted
  const res35_wrong = validateUserMathAnswer(task35div5, '820');
  const res35_right = validateUserMathAnswer(task35div5, '7');
  results.push({
    testName: '35 ÷ 5: Rejects leaked answer 820 and accepts only 7',
    passed: !res35_wrong.isCorrect && res35_right.isCorrect,
    message: !res35_wrong.isCorrect && res35_right.isCorrect
      ? 'OK: 820 correctly rejected, 7 correctly accepted'
      : `FAILED: 820 was ${res35_wrong.isCorrect ? 'accepted' : 'rejected'}, 7 was ${res35_right.isCorrect ? 'accepted' : 'rejected'}`,
  });

  // Test 4: 48 ÷ 6 -> 24 rejected, 8 accepted
  const res48_wrong = validateUserMathAnswer(task48div6, '24');
  const res48_right = validateUserMathAnswer(task48div6, '8');
  results.push({
    testName: '48 ÷ 6: Rejects 24 and accepts only 8',
    passed: !res48_wrong.isCorrect && res48_right.isCorrect,
    message: !res48_wrong.isCorrect && res48_right.isCorrect
      ? 'OK: 24 correctly rejected, 8 correctly accepted'
      : `FAILED: 24 was ${res48_wrong.isCorrect ? 'accepted' : 'rejected'}, 8 was ${res48_right.isCorrect ? 'accepted' : 'rejected'}`,
  });

  // Test 5: Simulated cross-task navigation flow
  // 1. Solve 860 - 40 = 820
  const solveSub = validateUserMathAnswer(task860minus40, '820');
  // 2. Move to 35 ÷ 5 with leaked 820 -> MUST BE INCORRECT
  const leakDiv = validateUserMathAnswer(task35div5, '820');
  // 3. Enter 7 -> MUST BE CORRECT
  const correctDiv = validateUserMathAnswer(task35div5, '7');
  // 4. Move to Doubling 250 with leaked 7 -> MUST BE INCORRECT
  const leakDouble = validateUserMathAnswer(taskDouble250, '7');
  // 5. Enter 500 -> MUST BE CORRECT
  const correctDouble = validateUserMathAnswer(taskDouble250, '500');

  const navPassed =
    solveSub.isCorrect &&
    !leakDiv.isCorrect &&
    correctDiv.isCorrect &&
    !leakDouble.isCorrect &&
    correctDouble.isCorrect;

  results.push({
    testName: 'Navigation flow: Subtraktion (820) → Division (reject 820, accept 7) → Verdoppeln (reject 7, accept 500)',
    passed: navPassed,
    message: navPassed
      ? 'OK: Complete multi-step navigation sequence prevented all answer leakage'
      : 'FAILED: Leaked state was accepted during navigation sequence',
  });

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}
