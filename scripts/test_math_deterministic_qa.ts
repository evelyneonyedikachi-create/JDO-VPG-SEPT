import {
  calculateNeighbours,
  calculateDouble,
  calculateHalf,
  calculateNumberWall,
  isNumberWallValid,
  calculateAddition,
  calculateSubtraction,
  calculateMultiplication,
  calculateDivision,
  generateExactDivision,
  validateMathExercise,
} from '../src/services/deterministicMathEngine';
import {
  ALL_WEEKLY_MATH_TASKS,
  generateDailyMathPlan,
  validateMathWeeklyPlan,
} from '../src/services/mathExerciseEngine';
import { DayOfWeek } from '../src/types/lernwoerter';

async function runDeterministicMathQA() {
  console.log('================================================================');
  console.log('📐 DETERMINISTIC MATH ENGINE: UNIT TESTS & ACCEPTANCE GATE');
  console.log('================================================================\n');

  let allPassed = true;
  let totalTestsRun = 0;
  let totalTestsPassed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTestsRun++;
    if (condition) {
      totalTestsPassed++;
      console.log(`  ✅ PASS: ${testName}`);
    } else {
      allPassed = false;
      console.error(`  ❌ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
    }
  }

  // -------------------------------------------------------------
  // SECTION 1: SPECIFIED UNIT TESTS (Section 14)
  // -------------------------------------------------------------
  console.log('--- SECTION 1: SPECIFIED CORE UNIT TESTS ---');

  // 1. neighbours(457) -> tens: 450, 460; hundreds: 400, 500
  const n457 = calculateNeighbours(457);
  assert(
    n457.lowerTen === 450 &&
      n457.upperTen === 460 &&
      n457.lowerHundred === 400 &&
      n457.upperHundred === 500,
    'neighbours(457) → tens: 450, 460; hundreds: 400, 500',
    `got tens: ${n457.lowerTen}, ${n457.upperTen}; hundreds: ${n457.lowerHundred}, ${n457.upperHundred}`
  );

  // 2. Exact multiples handling (460, 500)
  const n460 = calculateNeighbours(460);
  assert(
    n460.lowerTen === 450 && n460.upperTen === 470,
    'neighbours(460) exact multiple of 10 → previous 450, next 470',
    `got ${n460.lowerTen}, ${n460.upperTen}`
  );

  const n500 = calculateNeighbours(500);
  assert(
    n500.lowerHundred === 400 && n500.upperHundred === 600,
    'neighbours(500) exact multiple of 100 → previous 400, next 600',
    `got ${n500.lowerHundred}, ${n500.upperHundred}`
  );

  // 3. double(320) -> 640
  const d320 = calculateDouble(320);
  assert(d320 === 640, 'double(320) → 640', `got ${d320}`);

  // 4. half(860) -> 430
  const h860 = calculateHalf(860);
  assert(h860 === 430, 'half(860) → 430', `got ${h860}`);

  // 5. numberWall(120, 80, 150) -> middle=[200, 230], top=[430] (and NEVER 420)
  const wall = calculateNumberWall(120, 80, 150);
  assert(
    wall.middle[0] === 200 &&
      wall.middle[1] === 230 &&
      wall.top[0] === 430 &&
      (wall.top[0] as number) !== 420 &&
      isNumberWallValid(wall),
    'numberWall(120, 80, 150) → middle 200, 230 and top 430 (never 420)',
    `got middle: [${wall.middle}], top: ${wall.top[0]}`
  );

  // 6. divide(48, 6) -> 8
  const div48_6 = calculateDivision(48, 6);
  assert(div48_6 === 8, 'divide(48, 6) → 8', `got ${div48_6}`);

  // 7. multiply(7, 8) -> 56
  const mul7_8 = calculateMultiplication(7, 8);
  assert(mul7_8 === 56, 'multiply(7, 8) → 56', `got ${mul7_8}`);

  console.log();

  // -------------------------------------------------------------
  // SECTION 2: ACCEPTANCE GATE
  // -------------------------------------------------------------
  console.log('--- SECTION 2: ACCEPTANCE GATE SUITE ---');

  // Gate 1: 25 Addition Problems
  console.log('▶ Gate 1: 25 Addition Problems (results <= 1000, non-negative)');
  let additionCount = 0;
  const additionSamples = [
    [430, 20], [340, 60], [560, 70], [120, 350], [240, 180],
    [500, 500], [0, 450], [720, 80], [610, 90], [150, 250],
    [320, 40], [810, 70], [450, 450], [130, 270], [640, 160],
    [220, 330], [550, 250], [700, 150], [480, 120], [390, 210],
    [110, 90], [670, 130], [280, 420], [750, 250], [890, 110],
  ];
  for (const [a, b] of additionSamples) {
    const sum = calculateAddition(a, b);
    if (sum === a + b && sum <= 1000 && sum >= 0) {
      additionCount++;
    }
  }
  assert(additionCount === 25, `Tested 25/25 addition problems with 100% correctness (${additionCount}/25)`);

  // Gate 2: 25 Subtraction Problems
  console.log('▶ Gate 2: 25 Subtraction Problems (a >= b, results >= 0 and <= 1000)');
  let subtractionCount = 0;
  const subtractionSamples = [
    [860, 40], [300, 70], [500, 200], [1000, 450], [750, 250],
    [430, 30], [920, 120], [600, 60], [400, 150], [820, 820],
    [670, 70], [540, 140], [800, 300], [950, 50], [310, 110],
    [770, 170], [630, 230], [490, 90], [880, 80], [350, 200],
    [520, 60], [710, 110], [990, 90], [460, 160], [250, 50],
  ];
  for (const [a, b] of subtractionSamples) {
    const diff = calculateSubtraction(a, b);
    if (diff === a - b && diff >= 0 && diff <= 1000) {
      subtractionCount++;
    }
  }
  assert(subtractionCount === 25, `Tested 25/25 subtraction problems with 100% correctness (${subtractionCount}/25)`);

  // Gate 3: All Multiplication Facts 1×1 through 10×10 (100 facts)
  console.log('▶ Gate 3: 100 Multiplication Facts (1×1 to 10×10)');
  let multiCount = 0;
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      const prod = calculateMultiplication(i, j);
      if (prod === i * j) {
        multiCount++;
      }
    }
  }
  assert(multiCount === 100, `Tested all 100 multiplication facts (1×1 to 10×10) with 100% correctness (${multiCount}/100)`);

  // Gate 4: 25 Exact Division Problems (backwards generated)
  console.log('▶ Gate 4: 25 Exact Division Problems');
  let divCount = 0;
  const divisionPairs = [
    [6, 8], [5, 7], [6, 9], [4, 6], [3, 9],
    [7, 7], [8, 8], [9, 9], [2, 10], [10, 5],
    [4, 8], [5, 6], [7, 6], [8, 4], [9, 3],
    [6, 6], [3, 7], [4, 9], [5, 9], [8, 7],
    [7, 9], [6, 7], [8, 6], [9, 8], [10, 10],
  ];
  for (const [divisor, quotient] of divisionPairs) {
    const { dividend } = generateExactDivision(divisor, quotient);
    const result = calculateDivision(dividend, divisor);
    if (result === quotient && dividend % divisor === 0) {
      divCount++;
    }
  }
  assert(divCount === 25, `Tested 25/25 exact division problems with 100% correctness (${divCount}/25)`);

  // Gate 5: 20 Doubling & Halving Problems
  console.log('▶ Gate 5: 20 Doubling & Halving Problems');
  let doubleHalfCount = 0;
  const doubleList = [50, 120, 150, 200, 240, 300, 320, 350, 400, 420];
  const halfList = [100, 160, 240, 300, 480, 500, 640, 700, 840, 860];

  for (const n of doubleList) {
    if (calculateDouble(n) === n * 2) doubleHalfCount++;
  }
  for (const n of halfList) {
    if (calculateHalf(n) === n / 2) doubleHalfCount++;
  }
  assert(doubleHalfCount === 20, `Tested 20/20 doubling & halving problems (${doubleHalfCount}/20)`);

  // Gate 6: 20 Nachbarzehner / Nachbarhunderter Problems
  console.log('▶ Gate 6: 20 Nachbarzehner / Nachbarhunderter Problems');
  let neighboursCount = 0;
  const testNumbers = [
    457, 123, 89, 674, 912, 345, 567, 781, 239, 411, // non-multiples
    460, 500, 100, 250, 700, 820, 990, 300, 650, 400, // exact multiples
  ];

  for (const num of testNumbers) {
    const res = calculateNeighbours(num);
    const validTens = res.lowerTen < num && num < res.upperTen;
    const validDiffTen = res.upperTen - res.lowerTen === 20 || (num % 10 !== 0 && res.upperTen - res.lowerTen === 10);
    const validHundreds = res.lowerHundred < num && num < res.upperHundred;
    const validDiffHundred = res.upperHundred - res.lowerHundred === 200 || (num % 100 !== 0 && res.upperHundred - res.lowerHundred === 100);

    if (validTens && validHundreds && validDiffTen && validDiffHundred) {
      neighboursCount++;
    }
  }
  assert(neighboursCount === 20, `Tested 20/20 Nachbarzehner/Hunderter problems (${neighboursCount}/20)`);

  // Gate 7: 20 Zahlenmauern (Consistency & Derivation)
  console.log('▶ Gate 7: 20 Zahlenmauern');
  let wallCount = 0;
  const wallBases = [
    [120, 80, 150], [70, 50, 90], [100, 100, 100], [50, 150, 50], [200, 50, 100],
    [30, 40, 50], [80, 120, 60], [110, 90, 70], [60, 80, 100], [140, 60, 120],
    [90, 70, 80], [40, 60, 80], [150, 50, 100], [75, 25, 50], [100, 50, 150],
    [85, 35, 60], [120, 40, 90], [95, 45, 55], [110, 50, 70], [130, 70, 50],
  ];

  for (const [b0, b1, b2] of wallBases) {
    const w = calculateNumberWall(b0, b1, b2);
    if (
      w.middle[0] === b0 + b1 &&
      w.middle[1] === b1 + b2 &&
      w.top[0] === w.middle[0] + w.middle[1] &&
      isNumberWallValid(w)
    ) {
      wallCount++;
    }
  }
  assert(wallCount === 20, `Tested 20/20 Zahlenmauern with 100% consistency (${wallCount}/20)`);

  console.log();

  // -------------------------------------------------------------
  // SECTION 3: WEEKLY CURRICULUM INTEGRITY (PHASE 1)
  // -------------------------------------------------------------
  console.log('--- SECTION 3: WEEKLY CURRICULUM INTEGRITY (PHASE 1) ---');
  const report = validateMathWeeklyPlan();
  console.log('Validation report isValid:', report.isValid);
  console.log('Report Lines:');
  report.reportLines.forEach((l) => console.log('  •', l));

  assert(report.isValid, 'Weekly plan validation report is 100% valid');
  assert(report.totalWeeklyTasks === 18, `Total weekly tasks = 18 (got ${report.totalWeeklyTasks})`);
  assert(
    report.dailyCounts.monday === 3 &&
      report.dailyCounts.tuesday === 3 &&
      report.dailyCounts.wednesday === 3 &&
      report.dailyCounts.thursday === 3 &&
      report.dailyCounts.friday === 3 &&
      report.dailyCounts.saturday === 3,
    'Each day Mon-Sat has exactly 3 tasks'
  );

  // Validate every single task object individually with validateMathExercise
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  let tasksValidated = 0;
  for (const d of days) {
    const plan = generateDailyMathPlan({ day: d });
    for (const task of plan.tasks) {
      const val = validateMathExercise(task);
      if (val.isValid) {
        tasksValidated++;
      } else {
        console.error(`Task ${task.id} failed validation: ${val.error}`);
      }
    }
  }
  assert(tasksValidated === 18, `All 18 generated weekly tasks passed pre-display validation (${tasksValidated}/18)`);

  console.log('\n================================================================');
  console.log(`SUMMARY: ${totalTestsPassed} / ${totalTestsRun} TESTS PASSED`);
  console.log(`MATHEMATICAL CORRECTNESS: ${allPassed ? '100% ✅' : 'FAILURES DETECTED ❌'}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runDeterministicMathQA().catch((err) => {
  console.error('Fatal QA error:', err);
  process.exit(1);
});
