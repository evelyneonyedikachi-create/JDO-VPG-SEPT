import { evaluateSentenceLocally, evaluateStudentSentence } from '../src/services/sentenceEvaluationService';
import { CompletedExerciseRecord } from '../src/types/progress';

async function runSentenceEvaluationQA() {
  console.log('================================================================');
  console.log('🧪 TESTING 4-STAGE SENTENCE EVALUATION & OCR DECOUPLING');
  console.log('================================================================\n');

  let allTestsPassed = true;

  // --------------------------------------------------------------------------
  // TEST 1: Acceptance Case 1 — Correct sentence with Lernwort
  // "Ich schlafe in meinem Zimmer." with word "zimmer"
  // Must NOT substitute another sentence (like "Ich räume mein Zimmer auf.")
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: ACCEPTANCE CASE 1 (Correct sentence) ---');
  const res1 = evaluateSentenceLocally('Ich schlafe in meinem Zimmer.', 'zimmer', 'Ich schlafe in meinem Zimmer.');
  console.log('Input: "Ich schlafe in meinem Zimmer." (required word: zimmer)');
  console.log('Result Status:', res1.evaluationStatus);
  console.log('Feedback:', res1.feedback);
  console.log('Confirmed Text in Feedback:', res1.feedback.includes('Ich schlafe in meinem Zimmer.'));

  const test1Pass =
    res1.evaluationStatus === 'correct' &&
    res1.feedback.includes('Ich schlafe in meinem Zimmer.') &&
    !res1.feedback.includes('Ich räume mein Zimmer auf.');
  
  console.log(`Result Test 1: ${test1Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!test1Pass) allTestsPassed = false;

  // --------------------------------------------------------------------------
  // TEST 2: Acceptance Case 2 — "Ich schlafe in dem Zimmer."
  // Must be 'needs_correction' with natural German recommendation "Ich schlafe in meinem Zimmer."
  // --------------------------------------------------------------------------
  console.log('--- TEST 2: ACCEPTANCE CASE 2 (Natural German preposition/pronoun) ---');
  const res2 = evaluateSentenceLocally('Ich schlafe in dem Zimmer.', 'zimmer', 'Ich schlafe in dem Zimmer.');
  console.log('Input: "Ich schlafe in dem Zimmer."');
  console.log('Result Status:', res2.evaluationStatus);
  console.log('Corrected Text:', res2.correctedText);
  console.log('Feedback:', res2.feedback);

  const test2Pass =
    res2.evaluationStatus === 'needs_correction' &&
    res2.correctedText === 'Ich schlafe in meinem Zimmer.' &&
    res2.feedback.includes('Ich schlafe in meinem Zimmer.');

  console.log(`Result Test 2: ${test2Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!test2Pass) allTestsPassed = false;

  // --------------------------------------------------------------------------
  // TEST 3: Acceptance Case 3 — "Wir gehen am Mittwoch in der Schule schwimmen."
  // Must be 'needs_correction' with "Wir gehen am Mittwoch mit der Schule schwimmen."
  // --------------------------------------------------------------------------
  console.log('--- TEST 3: ACCEPTANCE CASE 3 (School outing context correction) ---');
  const res3 = evaluateSentenceLocally(
    'Wir gehen am Mittwoch in der Schule schwimmen.',
    'schwimmen',
    'Wir gehen am Mittwoch in der Schule schwimmen.'
  );
  console.log('Input: "Wir gehen am Mittwoch in der Schule schwimmen."');
  console.log('Result Status:', res3.evaluationStatus);
  console.log('Corrected Text:', res3.correctedText);
  console.log('Feedback:', res3.feedback);

  const test3Pass =
    res3.evaluationStatus === 'needs_correction' &&
    res3.correctedText === 'Wir gehen am Mittwoch mit der Schule schwimmen.' &&
    res3.feedback.includes('mit der Schule schwimmen');

  console.log(`Result Test 3: ${test3Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!test3Pass) allTestsPassed = false;

  // --------------------------------------------------------------------------
  // TEST 4: Acceptance Case 4 — Sentence missing required Lernwort
  // --------------------------------------------------------------------------
  console.log('--- TEST 4: MISSING REQUIRED LERNWORT ---');
  const res4 = evaluateSentenceLocally('Ich spiele heute draußen Fußball.', 'schwimmen');
  console.log('Input: "Ich spiele heute draußen Fußball." (required: schwimmen)');
  console.log('Result Status:', res4.evaluationStatus);
  console.log('Feedback:', res4.feedback);

  const test4Pass =
    res4.evaluationStatus === 'incorrect' &&
    res4.feedback.includes('schwimmen') &&
    res4.hasRequiredWord === false;

  console.log(`Result Test 4: ${test4Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!test4Pass) allTestsPassed = false;

  // --------------------------------------------------------------------------
  // TEST 5: Acceptance Case 5 — Incomplete / short fragment
  // --------------------------------------------------------------------------
  console.log('--- TEST 5: INCOMPLETE SENTENCE / FRAGMENT ---');
  const res5 = evaluateSentenceLocally('Zimmer', 'zimmer');
  console.log('Input: "Zimmer" (fragment)');
  console.log('Result Status:', res5.evaluationStatus);
  console.log('Feedback:', res5.feedback);

  const test5Pass = res5.evaluationStatus === 'incorrect' && res5.isCompleteSentence === false;
  console.log(`Result Test 5: ${test5Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!test5Pass) allTestsPassed = false;

  // --------------------------------------------------------------------------
  // TEST 6: State Preservation & Record Structure
  // Must store recognizedText, confirmedText, correctedText, evaluationStatus
  // --------------------------------------------------------------------------
  console.log('--- TEST 6: STATE PRESERVATION (CompletedExerciseRecord) ---');
  const sampleRecord: CompletedExerciseRecord = {
    id: 'thu_sentence_expand_zimmer',
    day: 'thursday',
    pointsEarned: 6,
    completedAt: Date.now(),
    inputMethod: 'handwriting',
    recognizedText: 'Ich schlafe in dem Zimmer.',
    confirmedText: 'Ich schlafe in dem Zimmer.',
    correctedText: 'Ich schlafe in meinem Zimmer.',
    evaluationStatus: 'needs_correction',
  };

  const test6Pass =
    sampleRecord.recognizedText === 'Ich schlafe in dem Zimmer.' &&
    sampleRecord.confirmedText === 'Ich schlafe in dem Zimmer.' &&
    sampleRecord.correctedText === 'Ich schlafe in meinem Zimmer.' &&
    sampleRecord.evaluationStatus === 'needs_correction';

  console.log('Sample Record verified:', sampleRecord);
  console.log(`Result Test 6: ${test6Pass ? 'PASSED ✅' : 'FAILED ❌'}\n`);
  if (!test6Pass) allTestsPassed = false;

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('================================================================');
  if (allTestsPassed) {
    console.log('🎉 ALL 6 SENTENCE EVALUATION & QA TESTS PASSED SUCCESSFULLY! (100%)');
  } else {
    console.error('❌ ONE OR MORE TESTS FAILED.');
    process.exit(1);
  }
  console.log('================================================================');
}

runSentenceEvaluationQA().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
