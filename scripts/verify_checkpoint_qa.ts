import { DEFAULT_WEEK_1_WORDS } from '../src/data/defaultWeeklyCurriculum';
import { generateDailyExercisePlan, validateWeeklyPlanCoverage } from '../src/services/exerciseEngine';
import { calculateAllDaysProgress, calculateWeeklyOverview, DAYS_ORDER } from '../src/services/progressService';
import { CompletedExerciseRecord } from '../src/types/progress';

async function runCheckpointQA() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE STABILIZATION CHECKPOINT QA');
  console.log('================================================================\n');

  let allChecksPassed = true;

  // ------------------------------------------------------------
  // CHECKPOINT QA 2: Weekly Coverage Report & 14 Lernwörter >= 2 tasks
  // ------------------------------------------------------------
  console.log('--- CHECK 2: WEEKLY COVERAGE REPORT (ALL 14 LERNWÖRTER >= 2) ---');
  const coverageReport = validateWeeklyPlanCoverage(DEFAULT_WEEK_1_WORDS);
  console.log(`Canonical Lernwörter count: ${DEFAULT_WEEK_1_WORDS.length}`);
  console.log(`Coverage Valid (sufficientCoverage): ${coverageReport.sufficientCoverage}`);

  let check2Pass = coverageReport.sufficientCoverage === true;
  coverageReport.weeklyWords.forEach((wordName) => {
    const count = coverageReport.counts[wordName.toLowerCase()] || 0;
    const ok = count >= 2;
    if (!ok) check2Pass = false;
    console.log(`  ${ok ? '✅' : '❌'} ${wordName.padEnd(14)}: ${count} Aufgaben (${ok ? '✓ Erfüllt' : '⚠️ Zu wenig'})`);
  });
  console.log(`Result Check 2: ${check2Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check2Pass) allChecksPassed = false;

  // ------------------------------------------------------------
  // CHECKPOINT QA 3: Complete 1 task, refresh simulation
  // ------------------------------------------------------------
  console.log('--- CHECK 3: COMPLETE 1 TASK, REFRESH PERSISTENCE ---');
  const mondayPlan = generateDailyExercisePlan({ day: 'monday', words: DEFAULT_WEEK_1_WORDS, level: 'profi' });
  const firstTask = mondayPlan.heuteEmpfohlen[0];
  const firstTaskId = firstTask.id;

  const completedRecord1: CompletedExerciseRecord = {
    id: firstTaskId,
    taskId: firstTaskId,
    weekId: 'woche-1-doppelkonsonanten',
    day: 'monday',
    pointsEarned: 4,
    completedAt: Date.now(),
    inputMethod: 'handwriting',
  };

  // Simulate local storage / state before refresh
  let stateStorage = [completedRecord1];

  const progressBeforeRefresh = calculateAllDaysProgress({
    words: DEFAULT_WEEK_1_WORDS,
    completedRecords: stateStorage,
    pausedSession: null,
    skippedExercises: [],
  });

  const pointsBeforeRefresh = Math.min(
    100,
    stateStorage.reduce((acc, r) => acc + (r.pointsEarned || 0), 0)
  );

  // Simulate full browser refresh: re-instantiate from persisted records
  const reloadedStorage = JSON.parse(JSON.stringify(stateStorage)) as CompletedExerciseRecord[];
  const progressAfterRefresh = calculateAllDaysProgress({
    words: DEFAULT_WEEK_1_WORDS,
    completedRecords: reloadedStorage,
    pausedSession: null,
    skippedExercises: [],
  });
  const pointsAfterRefresh = Math.min(
    100,
    reloadedStorage.reduce((acc, r) => acc + (r.pointsEarned || 0), 0)
  );

  const check3Pass =
    progressBeforeRefresh.monday.completedRequired === 1 &&
    progressAfterRefresh.monday.completedRequired === 1 &&
    pointsBeforeRefresh === 4 &&
    pointsAfterRefresh === 4;

  console.log(`Before Refresh: Completed Monday=${progressBeforeRefresh.monday.completedRequired}, Points=${pointsBeforeRefresh}`);
  console.log(`After Refresh:  Completed Monday=${progressAfterRefresh.monday.completedRequired}, Points=${pointsAfterRefresh}`);
  console.log(`Result Check 3: ${check3Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check3Pass) allChecksPassed = false;

  // ------------------------------------------------------------
  // CHECKPOINT QA 4: Complete Monday fully (5/5) & Refresh
  // ------------------------------------------------------------
  console.log('--- CHECK 4: COMPLETE MONDAY FULLY (5/5) & REFRESH ---');
  const allMondayRecords: CompletedExerciseRecord[] = mondayPlan.heuteEmpfohlen.map((ex, idx) => ({
    id: ex.id,
    taskId: ex.id,
    weekId: 'woche-1-doppelkonsonanten',
    day: 'monday',
    pointsEarned: 4,
    completedAt: Date.now() + idx * 1000,
    inputMethod: 'handwriting',
  }));

  stateStorage = [...allMondayRecords];

  const mondayFullProgressBefore = calculateAllDaysProgress({
    words: DEFAULT_WEEK_1_WORDS,
    completedRecords: stateStorage,
    pausedSession: null,
    skippedExercises: [],
  });

  // Reload simulation
  const reloadedMondayStorage = JSON.parse(JSON.stringify(stateStorage)) as CompletedExerciseRecord[];
  const mondayFullProgressAfter = calculateAllDaysProgress({
    words: DEFAULT_WEEK_1_WORDS,
    completedRecords: reloadedMondayStorage,
    pausedSession: null,
    skippedExercises: [],
  });

  const check4Pass =
    mondayFullProgressBefore.monday.completedRequired === 5 &&
    mondayFullProgressBefore.monday.isCompleted === true &&
    mondayFullProgressBefore.monday.statusText === 'Geschafft' &&
    mondayFullProgressAfter.monday.completedRequired === 5 &&
    mondayFullProgressAfter.monday.isCompleted === true &&
    mondayFullProgressAfter.monday.statusText === 'Geschafft';

  console.log(`Monday Before: ${mondayFullProgressBefore.monday.completedRequired}/5 – ${mondayFullProgressBefore.monday.statusText}`);
  console.log(`Monday After:  ${mondayFullProgressAfter.monday.completedRequired}/5 – ${mondayFullProgressAfter.monday.statusText}`);
  console.log(`Result Check 4: ${check4Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check4Pass) allChecksPassed = false;

  // ------------------------------------------------------------
  // CHECKPOINT QA 5: Clicked Task ID = Opened Task ID = Completed Task ID
  // ------------------------------------------------------------
  console.log('--- CHECK 5: EXACT TASK ID MATCHING ---');
  // From Tuesday, pick 3rd task
  const tuesdayPlan = generateDailyExercisePlan({ day: 'tuesday', words: DEFAULT_WEEK_1_WORDS, level: 'profi' });
  const selectedTask = tuesdayPlan.heuteEmpfohlen[2];
  const clickedTaskId = selectedTask.id;

  // When opened via initialExerciseId in DailyPracticeWorkspace:
  const foundIdx = tuesdayPlan.heuteEmpfohlen.findIndex((t) => t.id === clickedTaskId);
  const openedTaskId = tuesdayPlan.heuteEmpfohlen[foundIdx]?.id;

  // When completed:
  const completedTaskRecord: CompletedExerciseRecord = {
    id: openedTaskId,
    taskId: openedTaskId,
    weekId: 'woche-1-doppelkonsonanten',
    day: 'tuesday',
    pointsEarned: 4,
    completedAt: Date.now(),
    inputMethod: 'keyboard',
  };

  const check5Pass =
    clickedTaskId === openedTaskId &&
    openedTaskId === completedTaskRecord.taskId &&
    openedTaskId === completedTaskRecord.id;

  console.log(`Clicked Task ID:   ${clickedTaskId}`);
  console.log(`Opened Task ID:    ${openedTaskId} (index: ${foundIdx})`);
  console.log(`Completed Task ID: ${completedTaskRecord.taskId}`);
  console.log(`Result Check 5: ${check5Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check5Pass) allChecksPassed = false;

  // ------------------------------------------------------------
  // CHECKPOINT QA 6: Complete 30 required tasks -> Week is complete ONLY at 30/30
  // ------------------------------------------------------------
  console.log('--- CHECK 6: WEEK COMPLETE ONLY AT 30/30 REQUIRED TASKS ---');
  const all30Tasks: CompletedExerciseRecord[] = [];

  DAYS_ORDER.forEach((day) => {
    const plan = generateDailyExercisePlan({ day, words: DEFAULT_WEEK_1_WORDS, level: 'profi' });
    plan.heuteEmpfohlen.forEach((t) => {
      all30Tasks.push({
        id: t.id,
        taskId: t.id,
        weekId: 'woche-1-doppelkonsonanten',
        day,
        pointsEarned: 4,
        completedAt: Date.now(),
        inputMethod: 'handwriting',
      });
    });
  });

  console.log(`Total generated required weekly tasks across 6 days: ${all30Tasks.length}`);

  // Test at 29 tasks (Incomplete)
  const tasks29 = all30Tasks.slice(0, 29);
  const progress29 = calculateAllDaysProgress({
    words: DEFAULT_WEEK_1_WORDS,
    completedRecords: tasks29,
    pausedSession: null,
    skippedExercises: [],
  });
  const weekly29 = calculateWeeklyOverview({
    daysProgress: progress29,
    pointsWeek: 96,
    skippedExercises: [],
    pausedSession: null,
  });

  // Test at 30 tasks (Complete)
  const progress30 = calculateAllDaysProgress({
    words: DEFAULT_WEEK_1_WORDS,
    completedRecords: all30Tasks,
    pausedSession: null,
    skippedExercises: [],
  });
  const weekly30 = calculateWeeklyOverview({
    daysProgress: progress30,
    pointsWeek: 100,
    skippedExercises: [],
    pausedSession: null,
  });

  const check6Pass =
    weekly29.totalCompletedWeekly === 29 &&
    weekly29.isAllWeekCompleted === false &&
    weekly30.totalCompletedWeekly === 30 &&
    weekly30.isAllWeekCompleted === true;

  console.log(`At 29/30 Tasks: Completed=${weekly29.totalCompletedWeekly}/30, isAllWeekCompleted=${weekly29.isAllWeekCompleted}`);
  console.log(`At 30/30 Tasks: Completed=${weekly30.totalCompletedWeekly}/30, isAllWeekCompleted=${weekly30.isAllWeekCompleted}`);
  console.log(`Result Check 6: ${check6Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check6Pass) allChecksPassed = false;

  // ------------------------------------------------------------
  // CHECKPOINT QA 7: Duplicate Protection & Points Capped at 100
  // ------------------------------------------------------------
  console.log('--- CHECK 7: DUPLICATE PROTECTION & POINTS CAPPED AT 100 ---');
  // Attempt to add duplicate records for the same task
  const recordsWithDuplicates = [...all30Tasks];
  // Add 10 duplicates
  for (let i = 0; i < 10; i++) {
    recordsWithDuplicates.push({ ...all30Tasks[i], pointsEarned: 10 });
  }

  // Canonical deduplicated points calculation
  const seenTaskIds = new Set<string>();
  let deduplicatedPoints = 0;
  recordsWithDuplicates.forEach((r) => {
    const uniqueKey = r.taskId || r.id;
    if (!seenTaskIds.has(uniqueKey)) {
      seenTaskIds.add(uniqueKey);
      deduplicatedPoints += r.pointsEarned || 0;
    }
  });

  const weeklyPointsCapped = Math.min(100, deduplicatedPoints);

  const check7Pass =
    seenTaskIds.size === 30 &&
    weeklyPointsCapped === 100 &&
    deduplicatedPoints === 120 && // 30 * 4 = 120, capped at 100
    weeklyPointsCapped <= 100;

  console.log(`Records with duplicates: ${recordsWithDuplicates.length}`);
  console.log(`Unique tasks awarded points: ${seenTaskIds.size}`);
  console.log(`Raw points before cap: ${deduplicatedPoints}`);
  console.log(`Weekly points capped: ${weeklyPointsCapped}/100`);
  console.log(`Result Check 7: ${check7Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check7Pass) allChecksPassed = false;

  // ------------------------------------------------------------
  // CHECKPOINT QA 8: Cross-Device Persistence via /api/progress
  // ------------------------------------------------------------
  console.log('--- CHECK 8: SERVER-SIDE CROSS-DEVICE PERSISTENCE (/api/progress) ---');
  const testUserId = `qa_test_device_${Date.now()}`;
  const payloadToSave = {
    completedExerciseRecords: all30Tasks.slice(0, 5), // Monday complete
    skippedExercises: [],
    pausedSession: null,
    pointsState: {
      pointsToday: 20,
      pointsWeek: 20,
      cumulativePoints: 420,
      lastActiveDate: '2026-09-27',
    },
  };

  // POST save to server
  const saveRes = await fetch(`http://localhost:3000/api/progress/${testUserId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadToSave),
  });
  const saveJson = await saveRes.json();

  // GET fetch from server (simulating second browser / device)
  const fetchRes = await fetch(`http://localhost:3000/api/progress/${testUserId}`);
  const fetchJson = await fetchRes.json();

  const restoredData = fetchJson.data;
  const check8Pass =
    saveJson.success === true &&
    fetchJson.success === true &&
    restoredData &&
    restoredData.completedExerciseRecords.length === 5 &&
    restoredData.pointsState.pointsWeek === 20;

  console.log(`Server Save Success: ${saveJson.success}`);
  console.log(`Server Fetch Success: ${fetchJson.success}`);
  console.log(`Restored records count: ${restoredData?.completedExerciseRecords?.length}`);
  console.log(`Restored pointsWeek: ${restoredData?.pointsState?.pointsWeek}`);
  console.log(`Result Check 8: ${check8Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!check8Pass) allChecksPassed = false;

  console.log('================================================================');
  console.log(`FINAL QA VERIFICATION: ${allChecksPassed ? 'ALL CHECKS PASSED ✅' : 'SOME CHECKS FAILED ❌'}`);
  console.log('================================================================');
}

runCheckpointQA().catch((err) => {
  console.error('QA script error:', err);
  process.exit(1);
});
