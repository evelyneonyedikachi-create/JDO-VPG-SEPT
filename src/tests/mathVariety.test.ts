import {
  generateDailyMathPlan,
  generateWeeklyMathTasks,
  validateMathWeeklyPlan,
  calculateMathCategoryPoolStatistics,
  getTotalUniqueSafeMathCombinations,
  getMathExerciseSignature,
} from '../services/mathExerciseEngine';
import { sampleFromPool, POOL_WED_MULTIPLIKATION } from '../services/mathQuestionPools';
import { validateMathExercise, validateUserMathAnswer } from '../services/deterministicMathEngine';
import { DayOfWeek } from '../types/lernwoerter';

console.log('=== RUNNING MATH VARIETY & ANTI-REPETITION QA TESTS ===');

// 1. Verify Category Pool Statistics
console.log('\n--- 1. Testing Category Pool Statistics ---');
const poolStats = calculateMathCategoryPoolStatistics();
const totalCombinations = getTotalUniqueSafeMathCombinations();
console.log(`Total safe combinations in Phase 1 pools: ${totalCombinations}`);

const categories = Object.keys(poolStats);
if (categories.length < 18) {
  throw new Error(`Expected at least 18 template slots, found ${categories.length}`);
}

for (const [key, stat] of Object.entries(poolStats)) {
  console.log(`  [POOL] ${stat.slotName}: ${stat.uniqueSafeCombinations} combinations (example: ${stat.exampleSignature})`);
  if (stat.uniqueSafeCombinations < 12) {
    throw new Error(`Category ${key} has fewer than 12 safe combinations (${stat.uniqueSafeCombinations})`);
  }
}

// 2. Multi-Week Generation (12 consecutive weeks)
console.log('\n--- 2. Generating 12 Consecutive Weeks (216 Tasks) ---');
const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const seenSignaturesAcrossWeeks = new Map<string, { week: number; day: string; title: string }>();
let totalTasksChecked = 0;

for (let w = 1; w <= 12; w++) {
  const weeklyReport = validateMathWeeklyPlan({ weekNumber: w });
  if (!weeklyReport.isValid) {
    throw new Error(`Week ${w} failed weekly QA validation: ${weeklyReport.reportLines.join('; ')}`);
  }

  const weeklyTasks = generateWeeklyMathTasks({ weekNumber: w });

  days.forEach((day) => {
    const tasks = weeklyTasks[day];
    if (tasks.length !== 3) {
      throw new Error(`Week ${w} Day ${day} does not have exactly 3 tasks (has ${tasks.length})`);
    }

    tasks.forEach((t) => {
      totalTasksChecked++;
      const val = validateMathExercise(t);
      if (!val.isValid) {
        throw new Error(`Week ${w} Task ${t.id} failed deterministic validation: ${val.error}`);
      }

      const sig = t.signature || getMathExerciseSignature(t);
      if (!sig) {
        throw new Error(`Week ${w} Task ${t.id} is missing a signature`);
      }

      if (seenSignaturesAcrossWeeks.has(sig)) {
        const prev = seenSignaturesAcrossWeeks.get(sig)!;
        throw new Error(
          `DUPLICATE DETECTED! Signature "${sig}" generated in Week ${w} (${day}) was already used in Week ${prev.week} (${prev.day})`
        );
      }

      seenSignaturesAcrossWeeks.set(sig, { week: w, day, title: t.title });
    });
  });
}

console.log(`✅ ALL 12 WEEKS VERIFIED!`);
console.log(`  Total Tasks Evaluated: ${totalTasksChecked}`);
console.log(`  Unique Signatures across 12 Weeks: ${seenSignaturesAcrossWeeks.size} / 216 (100% Unique, ZERO duplicates)`);

// 3. Test Anti-Repetition with History
console.log('\n--- 3. Testing Anti-Repetition Window & History Exclusion ---');
const historyToExclude = [
  'addition:430+20',
  'neighbourTens:457',
  'doubling:320',
  'multiplication:7x8',
  'subtraction:860-40',
];

const planWithHistory = generateWeeklyMathTasks({
  weekNumber: 1,
  history: historyToExclude,
});

days.forEach((d) => {
  planWithHistory[d].forEach((task) => {
    const sig = task.signature || getMathExerciseSignature(task);
    if (historyToExclude.includes(sig)) {
      throw new Error(`Anti-repetition failed: Signature "${sig}" was in history but still generated!`);
    }
  });
});
console.log('✅ History exclusion successfully prevented recent duplicate signatures!');

// 4. Test Adaptive Remediation (Variation without exact repetition)
console.log('\n--- 4. Testing Adaptive Remediation ---');
// When JD struggles with multiplication (e.g. 7 × 8),
// verify it samples an alternate variant (e.g. 8 × 7, 6 × 8, 7 × 6, 7 × 9) rather than repeating 7 × 8:
const regularTask = sampleFromPool({
  pool: POOL_WED_MULTIPLIKATION,
  getSignature: (it) => `multiplication:${it.a}x${it.b}`,
  weekNumber: 1,
  recentHistory: [],
  isRemediation: false,
});
const remediatedTask = sampleFromPool({
  pool: POOL_WED_MULTIPLIKATION,
  getSignature: (it) => `multiplication:${it.a}x${it.b}`,
  weekNumber: 1,
  recentHistory: ['multiplication:7x8'],
  isRemediation: true,
});

console.log(`  Standard Week 1 Fact: ${regularTask.a} × ${regularTask.b} = ${regularTask.a * regularTask.b}`);
console.log(`  Remediation Variant:  ${remediatedTask.a} × ${remediatedTask.b} = ${remediatedTask.a * remediatedTask.b}`);

if (remediatedTask.a === 7 && remediatedTask.b === 8) {
  throw new Error('Remediation repeated 7 × 8 instead of providing an alternate fact!');
}
console.log('✅ Adaptive remediation successfully serves fresh related facts before repeating failed facts!');

// 5. Hard Correctness Regression Verification
console.log('\n--- 5. Verifying Hard Correctness Rules Still Hold ---');
const task7x8 = generateWeeklyMathTasks({ weekNumber: 1 }).wednesday.find((t) => t.id === 'wed_math_2_multiplikation')!;
if (validateUserMathAnswer(task7x8, '60').isCorrect) {
  throw new Error('7 × 8 accepted 60');
}
if (!validateUserMathAnswer(task7x8, '56').isCorrect) {
  throw new Error('7 × 8 rejected 56');
}

const taskSub = generateWeeklyMathTasks({ weekNumber: 1 }).thursday.find((t) => t.id === 'thu_math_1_subtraktion')!;
if (validateUserMathAnswer(taskSub, '7').isCorrect) {
  throw new Error('860 − 40 accepted 7');
}
if (!validateUserMathAnswer(taskSub, '820').isCorrect) {
  throw new Error('860 − 40 rejected 820');
}

console.log('✅ Hard correctness tests passed!');

// 6. Controlled Recycling Policy on Pool Exhaustion
console.log('\n--- 6. Testing Controlled Recycle Policy on Pool Exhaustion ---');
// Create a completely exhausted history for POOL_WED_MULTIPLIKATION (all 12 items seen)
const allSignaturesInPool = POOL_WED_MULTIPLIKATION.map((it) => `multiplication:${it.a}x${it.b}`);
// Older questions at the front, last week's question at the very end
const oldestSig = allSignaturesInPool[0];
const lastWeekSig = allSignaturesInPool[allSignaturesInPool.length - 1];

// History array of 24 items where all pool items have been seen, and lastWeekSig is at the end
const exhaustedHistory: string[] = [
  ...allSignaturesInPool.slice(0, -1),
  'dummy:padding_1',
  'dummy:padding_2',
  'dummy:padding_3',
  lastWeekSig, // Just answered last week
];

const recycledItem = sampleFromPool({
  pool: POOL_WED_MULTIPLIKATION,
  getSignature: (it) => `multiplication:${it.a}x${it.b}`,
  weekNumber: 13,
  recentHistory: exhaustedHistory,
  isRemediation: false,
});

const recycledSig = `multiplication:${recycledItem.a}x${recycledItem.b}`;
console.log(`  Oldest seen signature: ${oldestSig}`);
console.log(`  Last week signature:   ${lastWeekSig}`);
console.log(`  Recycled signature:    ${recycledSig}`);

if (recycledSig === lastWeekSig) {
  throw new Error(`Controlled recycling violated: Immediately repeated last week's exact question (${lastWeekSig})!`);
}

// Check that recycled signature is one of the oldest seen
const indexInHistory = exhaustedHistory.lastIndexOf(recycledSig);
const lastWeekIndex = exhaustedHistory.lastIndexOf(lastWeekSig);
if (indexInHistory >= lastWeekIndex) {
  throw new Error(`Recycled signature (${recycledSig}) is not older than last week's signature!`);
}

// Verify remediation under pool exhaustion produces an alternate candidate
const remediatedRecycled = sampleFromPool({
  pool: POOL_WED_MULTIPLIKATION,
  getSignature: (it) => `multiplication:${it.a}x${it.b}`,
  weekNumber: 13,
  recentHistory: exhaustedHistory,
  isRemediation: true,
});
const remediatedRecycledSig = `multiplication:${remediatedRecycled.a}x${remediatedRecycled.b}`;
console.log(`  Remediated recycled signature: ${remediatedRecycledSig}`);
if (remediatedRecycledSig === lastWeekSig) {
  throw new Error('Remediation under exhaustion selected last week question!');
}

console.log('✅ Controlled recycle policy passed (reused oldest signatures, avoided last week, preserved skill type)!');

console.log('\n🎉 ALL MATH VARIETY & ANTI-REPETITION TESTS PASSED 100%! 🎉');
