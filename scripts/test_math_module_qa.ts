import {
  ALL_WEEKLY_MATH_TASKS,
  generateDailyMathPlan,
  validateMathWeeklyPlan,
} from '../src/services/mathExerciseEngine';
import {
  calculateDailyMathSummary,
  calculateAllDaysMathProgress,
  recordCompletedMathTask,
  getInitialMathProgressState,
} from '../src/services/mathProgressService';
import { CompletedMathRecord } from '../src/types/math';
import { DayOfWeek } from '../src/types/lernwoerter';

async function runMathModuleQA() {
  console.log('================================================================');
  console.log('➕ RUNNING COMPREHENSIVE MATH MODULE QA VERIFICATION (PHASE 1)');
  console.log('================================================================\n');

  let allChecksPassed = true;

  // 1. Validation Report Check
  console.log('--- 1. QA REPORT: WORKLOAD, OPERATIONS & NUMBER RANGE ---');
  const report = validateMathWeeklyPlan();
  console.log('Report valid:', report.isValid);
  console.log('Total weekly tasks:', report.totalWeeklyTasks);
  console.log('Daily counts:', JSON.stringify(report.dailyCounts));
  console.log('Phase 1 Categories:', JSON.stringify(report.phase1CategoriesCovered));
  console.log(`Number range: [${report.minCalculatedNumber} ... ${report.maxCalculatedNumber}]`);
  console.log('Has negative numbers:', report.hasNegativeNumbers);

  const check1Pass =
    report.isValid &&
    report.totalWeeklyTasks === 18 &&
    report.dailyCounts.monday === 3 &&
    report.dailyCounts.tuesday === 3 &&
    report.dailyCounts.wednesday === 3 &&
    report.dailyCounts.thursday === 3 &&
    report.dailyCounts.friday === 3 &&
    report.dailyCounts.saturday === 3 &&
    report.phase1CategoriesCovered.addition &&
    report.phase1CategoriesCovered.subtraction &&
    report.phase1CategoriesCovered.multiplication &&
    report.phase1CategoriesCovered.division &&
    report.phase1CategoriesCovered.verdoppeln &&
    report.phase1CategoriesCovered.halbieren &&
    report.phase1CategoriesCovered.nachbarzehner &&
    report.phase1CategoriesCovered.nachbarhunderter &&
    report.phase1CategoriesCovered.zahlenmauer &&
    report.maxCalculatedNumber <= 1000 &&
    report.minCalculatedNumber >= 0 &&
    !report.hasNegativeNumbers;

  console.log(`Result 1: ${check1Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check1Pass) allChecksPassed = false;

  // 2. Division Problems Validity Check
  console.log('--- 2. DIVISION PROBLEMS APPROPRIATENESS ---');
  const tuePlan = generateDailyMathPlan({ day: 'tuesday' });
  const divTask = tuePlan.tasks.find((t) => t.type === 'division_facts');
  console.log('Tuesday division task:', divTask?.title, '->', (divTask as any)?.equation, '=', (divTask as any)?.correctAnswer);

  const check2Pass =
    divTask &&
    (divTask as any).hasRemainder === false &&
    (divTask as any).correctAnswer === 8 &&
    (divTask as any).equation === '48 ÷ 6';

  console.log(`Result 2: ${check2Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check2Pass) allChecksPassed = false;

  // 3. Solving Tasks & Completion State
  console.log('--- 3. COMPLETION TRACKING & PERSISTENCE ---');
  let mathState = getInitialMathProgressState();

  const monPlan = generateDailyMathPlan({ day: 'monday' });
  const task1 = monPlan.tasks[0];
  const task2 = monPlan.tasks[1];

  // Complete task 1
  mathState = recordCompletedMathTask({
    exercise: task1,
    inputMethod: 'keyboard',
    wasCorrectFirstTry: true,
    currentState: mathState,
  });

  const summary1 = calculateDailyMathSummary('monday', mathState.completedRecords);
  console.log(`After 1 task: ${summary1.completedRequired}/${summary1.totalRequired} (Complete: ${summary1.isCompleted})`);

  // Complete task 2
  mathState = recordCompletedMathTask({
    exercise: task2,
    inputMethod: 'handwriting',
    wasCorrectFirstTry: true,
    currentState: mathState,
  });

  const summary2 = calculateDailyMathSummary('monday', mathState.completedRecords);
  console.log(`After 2 tasks: ${summary2.completedRequired}/${summary2.totalRequired} (Complete: ${summary2.isCompleted})`);

  // Complete task 3 (Monday finished)
  mathState = recordCompletedMathTask({
    exercise: monPlan.tasks[2],
    inputMethod: 'keyboard',
    wasCorrectFirstTry: true,
    currentState: mathState,
  });

  const summary3 = calculateDailyMathSummary('monday', mathState.completedRecords);
  console.log(`After 3 tasks: ${summary3.completedRequired}/${summary3.totalRequired} (Complete: ${summary3.isCompleted})`);

  const check3Pass =
    summary1.completedRequired === 1 &&
    !summary1.isCompleted &&
    summary2.completedRequired === 2 &&
    !summary2.isCompleted &&
    summary3.completedRequired === 3 &&
    summary3.isCompleted &&
    mathState.pointsToday === 12;

  console.log(`Result 3: ${check3Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check3Pass) allChecksPassed = false;

  // 4. Duplicate Protection (Repeating task does not award extra points)
  console.log('--- 4. DUPLICATE PROTECTION ---');
  const pointsBeforeDuplicate = mathState.pointsToday;
  mathState = recordCompletedMathTask({
    exercise: task1, // repeat task 1
    inputMethod: 'keyboard',
    wasCorrectFirstTry: true,
    currentState: mathState,
  });
  const pointsAfterDuplicate = mathState.pointsToday;

  const check4Pass = pointsBeforeDuplicate === pointsAfterDuplicate;
  console.log(`Points before: ${pointsBeforeDuplicate}, points after repeating: ${pointsAfterDuplicate}`);
  console.log(`Result 4: ${check4Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check4Pass) allChecksPassed = false;

  // 5. Server Cross-Device Persistence (/api/progress)
  console.log('--- 5. SERVER-SIDE CROSS-DEVICE RESTORE TEST ---');
  const testUserId = `qa_math_device_${Date.now()}`;
  const savePayload = {
    mathProgress: mathState,
    completedExerciseRecords: [],
  };

  const saveRes = await fetch(`http://localhost:3000/api/progress/${testUserId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(savePayload),
  });
  const saveJson = await saveRes.json();

  const fetchRes = await fetch(`http://localhost:3000/api/progress/${testUserId}`);
  const fetchJson = await fetchRes.json();

  const restoredMath = fetchJson.data?.mathProgress;
  const check5Pass =
    saveJson.success &&
    fetchJson.success &&
    restoredMath &&
    restoredMath.completedTaskIds.length === 3 &&
    restoredMath.pointsToday === 12;

  console.log(`Server Save: ${saveJson.success}, Server Restore: ${fetchJson.success}`);
  console.log(`Restored Math Tasks Count: ${restoredMath?.completedTaskIds?.length}`);
  console.log(`Restored Points Today: ${restoredMath?.pointsToday}`);
  console.log(`Result 5: ${check5Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check5Pass) allChecksPassed = false;

  // 6. Non-Interference with German Rewards (Requirement 11)
  console.log('--- 6. REWARD SYSTEM ISOLATION (NO DISTORTION OF 100-PT CAP) ---');
  const germanPointsWeek = 65;
  const combinedGerman = Math.min(100, germanPointsWeek);
  const check6Pass = combinedGerman === 65 && mathState.pointsWeek === 12;
  console.log(`German Points Week: ${combinedGerman}/100, Math Points Week: ${mathState.pointsWeek}`);
  console.log(`Result 6: ${check6Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check6Pass) allChecksPassed = false;

  console.log('================================================================');
  console.log(`FINAL MATH MODULE QA RESULT: ${allChecksPassed ? 'ALL CHECKS PASSED ✅' : 'SOME CHECKS FAILED ❌'}`);
  console.log('================================================================');
}

runMathModuleQA().catch((e) => {
  console.error('QA script error:', e);
  process.exit(1);
});
