import {
  analyzeLernwortInput,
  validateLernwortProfile,
  sanitizeAndHealLernwortItem,
  isGenericSentence,
  CURATED_VOCABULARY_REGISTRY,
  KNOWN_GERMAN_ADJECTIVES,
} from '../services/vocabularyLinguisticService';
import {
  createWordExercise,
  generateDailyExercisePlan,
} from '../services/exerciseEngine';
import { LernwortItem } from '../types/lernwoerter';

console.log('=====================================================');
console.log('🧪 RUNNING COMPREHENSIVE GERMAN LINGUISTIC QUALITY AUDIT');
console.log('=====================================================\n');

let failedTests = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. ACCEPTANCE TESTS FOR THE 7 SPECIFIC REQUIRED LERNWÖRTER
// -----------------------------------------------------------------------------
console.log('\n--- 1. Acceptance Tests for Core Lernwörter ---');

// Case 1: das Schiff
const pSchiff = analyzeLernwortInput('das Schiff');
assert(pSchiff.wortart === 'Nomen', '„das Schiff“ is classified as Nomen');
assert(pSchiff.artikel === 'das', '„das Schiff“ has article „das“');
assert(pSchiff.plural === 'die Schiffe', '„das Schiff“ plural is „die Schiffe“');
assert(
  pSchiff.primaryExampleSentence === 'Das Schiff fährt über das Meer.',
  `„das Schiff“ example sentence is natural: "${pSchiff.primaryExampleSentence}"`
);
assert(
  !isGenericSentence(pSchiff.primaryExampleSentence, 'Schiff'),
  '„das Schiff“ example is NOT marked generic'
);

// Case 2: billig
const pBillig = analyzeLernwortInput('billig');
assert(pBillig.wortart === 'Adjektiv', '„billig“ MUST be Adjektiv (NEVER Verb!)');
assert(
  pBillig.primaryExampleSentence === 'Das Heft ist billig.',
  `„billig“ example sentence is natural: "${pBillig.primaryExampleSentence}"`
);
assert(
  !isGenericSentence(pBillig.primaryExampleSentence, 'billig'),
  '„billig“ example is NOT marked generic'
);

// Case 3: das Wetter
const pWetter = analyzeLernwortInput('das Wetter');
assert(pWetter.wortart === 'Nomen', '„das Wetter“ is classified as Nomen');
assert(pWetter.artikel === 'das', '„das Wetter“ has article „das“');
assert(
  pWetter.primaryExampleSentence === 'Heute ist das Wetter schön.',
  `„das Wetter“ example sentence is natural: "${pWetter.primaryExampleSentence}"`
);
assert(
  !isGenericSentence(pWetter.primaryExampleSentence, 'Wetter'),
  '„das Wetter“ example is NOT marked generic'
);

// Case 4: still
const pStill = analyzeLernwortInput('still');
assert(pStill.wortart === 'Adjektiv', '„still“ MUST be Adjektiv (NEVER Verb!)');
assert(
  pStill.primaryExampleSentence === 'Im Klassenzimmer ist es ganz still.',
  `„still“ example sentence is natural: "${pStill.primaryExampleSentence}"`
);
assert(
  !isGenericSentence(pStill.primaryExampleSentence, 'still'),
  '„still“ example is NOT marked generic'
);

// Case 5: der Unfall
const pUnfall = analyzeLernwortInput('der Unfall');
assert(pUnfall.wortart === 'Nomen', '„der Unfall“ is classified as Nomen');
assert(pUnfall.artikel === 'der', '„der Unfall“ has article „der“');
assert(pUnfall.plural === 'die Unfälle', '„der Unfall“ plural is „die Unfälle“');
assert(
  pUnfall.primaryExampleSentence === 'Auf der Straße ist ein Unfall passiert.',
  `„der Unfall“ example sentence is natural: "${pUnfall.primaryExampleSentence}"`
);
assert(
  !isGenericSentence(pUnfall.primaryExampleSentence, 'Unfall'),
  '„der Unfall“ example is NOT marked generic'
);

// Case 6: die Mitte
const pMitte = analyzeLernwortInput('die Mitte');
assert(pMitte.wortart === 'Nomen', '„die Mitte“ is classified as Nomen');
assert(pMitte.artikel === 'die', '„die Mitte“ has article „die“');
assert(
  pMitte.primaryExampleSentence === 'Der Ball liegt in der Mitte.',
  `„die Mitte“ example sentence is natural: "${pMitte.primaryExampleSentence}"`
);
assert(
  !isGenericSentence(pMitte.primaryExampleSentence, 'Mitte'),
  '„die Mitte“ example is NOT marked generic'
);

// Case 7: retten
const pRetten = analyzeLernwortInput('retten');
assert(pRetten.wortart === 'Verb', '„retten“ is classified as Verb');
assert(pRetten.infinitive === 'retten', '„retten“ infinitive is „retten“');
assert(
  pRetten.primaryExampleSentence === 'Die Feuerwehr rettet den Mann.',
  `„retten“ example sentence is natural: "${pRetten.primaryExampleSentence}"`
);
assert(
  !isGenericSentence(pRetten.primaryExampleSentence, 'retten'),
  '„retten“ example is NOT marked generic'
);
assert(
  pRetten.conjugationBank !== undefined && pRetten.conjugationBank.length >= 2,
  '„retten“ has full conjugation bank'
);
const feuerwehrTask = pRetten.conjugationBank?.find((c) =>
  c.sentenceWithBlank.includes('Feuerwehr')
);
assert(
  feuerwehrTask !== undefined && feuerwehrTask.correctForm === 'rettet',
  '„retten“ has Feuerwehr rettet task'
);

// -----------------------------------------------------------------------------
// 2. FORBIDDEN GENERIC FILLER DETECTION („Das ist ...“ MUST BE REJECTED)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Forbidden Generic Filler Detection ---');

assert(isGenericSentence('Das ist Schiff.', 'Schiff'), 'Rejects „Das ist Schiff.“');
assert(isGenericSentence('Das ist Schiff.', 'das Schiff'), 'Rejects „Das ist Schiff.“ for „das Schiff“');
assert(isGenericSentence('Das ist Wetter.', 'Wetter'), 'Rejects „Das ist Wetter.“');
assert(isGenericSentence('Das ist Unfall.', 'Unfall'), 'Rejects „Das ist Unfall.“');
assert(isGenericSentence('Das ist Mitte.', 'Mitte'), 'Rejects „Das ist Mitte.“');
assert(isGenericSentence('Das ist retten.', 'retten'), 'Rejects „Das ist retten.“');
assert(isGenericSentence('Das ist billig.', 'billig'), 'Rejects „Das ist billig.“');
assert(isGenericSentence('Das ist ein Schiff.', 'Schiff'), 'Rejects „Das ist ein Schiff.“');
assert(isGenericSentence('Hier ist Schiff.', 'Schiff'), 'Rejects „Hier ist Schiff.“');
assert(isGenericSentence('Das Wort heißt Wetter.', 'Wetter'), 'Rejects „Das Wort heißt Wetter.“');

// Valid pedagogical sentences must NOT be rejected
assert(
  !isGenericSentence('Das ist halb so schlimm!', 'schlimm'),
  'Allows established idiom „Das ist halb so schlimm!“'
);
assert(
  !isGenericSentence('Das Schiff fährt über das Meer.', 'Schiff'),
  'Allows natural sentence „Das Schiff fährt über das Meer.“'
);
assert(
  !isGenericSentence('Heute ist das Wetter schön.', 'Wetter'),
  'Allows natural sentence „Heute ist das Wetter schön.“'
);

// -----------------------------------------------------------------------------
// 3. SANITIZATION AND HEALING AUDIT ON CORRUPTED INPUTS
// -----------------------------------------------------------------------------
console.log('\n--- 3. Sanitizing Corrupted Data from Earlier Sessions ---');

// Simulated corrupted item where billig was marked as Verb with "Das ist billig."
const corruptedBillig: LernwortItem = {
  id: 'test_billig',
  word: 'billig',
  cleanWord: 'billig',
  wortart: 'Verb' as any, // ❌ previous bug
  group: 1,
  emoji: '🏷️',
  distractors: ['bilig'],
  missingLetterPattern: 'b_ll_g',
  sentences: [{ pronoun: 'ich', text: 'Das ist billig.' }],
  exampleSentence: 'Das ist billig.', // ❌ previous bug
};

const healedBillig = sanitizeAndHealLernwortItem(corruptedBillig);
assert(healedBillig.wortart === 'Adjektiv', 'Heals corrupted billig from Verb to Adjektiv');
assert(
  healedBillig.exampleSentence === 'Das Heft ist billig.',
  `Heals corrupted billig sentence to "${healedBillig.exampleSentence}"`
);
assert(healedBillig.validationStatus === 'approved', 'Healed billig is validated as approved');

// Simulated corrupted item where das Schiff had "Das ist Schiff."
const corruptedSchiff: LernwortItem = {
  id: 'test_schiff',
  word: 'das Schiff',
  cleanWord: 'Schiff',
  wortart: 'Nomen',
  artikel: 'das',
  group: 1,
  emoji: '🚢',
  distractors: ['das Schif'],
  missingLetterPattern: 'das Sch_ff',
  sentences: [{ pronoun: 'ich', text: 'Das ist Schiff.' }],
  exampleSentence: 'Das ist Schiff.', // ❌ previous bug
};

const healedSchiff = sanitizeAndHealLernwortItem(corruptedSchiff);
assert(healedSchiff.wortart === 'Nomen', 'Retains Nomen for das Schiff');
assert(healedSchiff.plural === 'die Schiffe', 'Assigns correct plural die Schiffe');
assert(
  healedSchiff.exampleSentence === 'Das Schiff fährt über das Meer.',
  `Heals generic example to "${healedSchiff.exampleSentence}"`
);

// -----------------------------------------------------------------------------
// 4. EXERCISE GENERATOR RESPECTS WORTART
// -----------------------------------------------------------------------------
console.log('\n--- 4. Exercise Generator Wortart Compliance ---');

// Week 2 words
const week2Words: LernwortItem[] = [
  sanitizeAndHealLernwortItem({
    id: 'w2_schiff',
    word: 'das Schiff',
    cleanWord: 'Schiff',
    wortart: 'Nomen',
    artikel: 'das',
    plural: 'die Schiffe',
    group: 1,
    emoji: '🚢',
    distractors: ['das Schif'],
    missingLetterPattern: 'das Sch_ff',
    sentences: [{ pronoun: 'ich', text: 'Das Schiff fährt über das Meer.' }],
    exampleSentence: 'Das Schiff fährt über das Meer.',
    validationStatus: 'approved',
  }),
  sanitizeAndHealLernwortItem({
    id: 'w2_billig',
    word: 'billig',
    cleanWord: 'billig',
    wortart: 'Adjektiv',
    group: 1,
    emoji: '🏷️',
    distractors: ['bilig'],
    missingLetterPattern: 'b_ll_g',
    sentences: [{ pronoun: 'ich', text: 'Das Heft ist billig.' }],
    exampleSentence: 'Das Heft ist billig.',
    validationStatus: 'approved',
  }),
  sanitizeAndHealLernwortItem({
    id: 'w2_wetter',
    word: 'das Wetter',
    cleanWord: 'Wetter',
    wortart: 'Nomen',
    artikel: 'das',
    plural: 'das Wetter',
    group: 1,
    emoji: '☀️',
    distractors: ['das Weter'],
    missingLetterPattern: 'das W_tt_r',
    sentences: [{ pronoun: 'ich', text: 'Heute ist das Wetter schön.' }],
    exampleSentence: 'Heute ist das Wetter schön.',
    validationStatus: 'approved',
  }),
  sanitizeAndHealLernwortItem({
    id: 'w2_still',
    word: 'still',
    cleanWord: 'still',
    wortart: 'Adjektiv',
    group: 2,
    emoji: '🤫',
    distractors: ['stil'],
    missingLetterPattern: 'st_ll',
    sentences: [{ pronoun: 'ich', text: 'Im Klassenzimmer ist es ganz still.' }],
    exampleSentence: 'Im Klassenzimmer ist es ganz still.',
    validationStatus: 'approved',
  }),
  sanitizeAndHealLernwortItem({
    id: 'w2_unfall',
    word: 'der Unfall',
    cleanWord: 'Unfall',
    wortart: 'Nomen',
    artikel: 'der',
    plural: 'die Unfälle',
    group: 2,
    emoji: '🚑',
    distractors: ['der Unfal'],
    missingLetterPattern: 'der _nf_ll',
    sentences: [{ pronoun: 'ich', text: 'Auf der Straße ist ein Unfall passiert.' }],
    exampleSentence: 'Auf der Straße ist ein Unfall passiert.',
    validationStatus: 'approved',
  }),
  sanitizeAndHealLernwortItem({
    id: 'w2_mitte',
    word: 'die Mitte',
    cleanWord: 'Mitte',
    wortart: 'Nomen',
    artikel: 'die',
    plural: 'die Mitten',
    group: 2,
    emoji: '🎯',
    distractors: ['die Mite'],
    missingLetterPattern: 'die M_tt_',
    sentences: [{ pronoun: 'ich', text: 'Der Ball liegt in der Mitte.' }],
    exampleSentence: 'Der Ball liegt in der Mitte.',
    validationStatus: 'approved',
  }),
  sanitizeAndHealLernwortItem({
    id: 'w2_retten',
    word: 'retten',
    cleanWord: 'retten',
    wortart: 'Verb',
    infinitive: 'retten',
    group: 2,
    emoji: '🚒',
    distractors: ['reten'],
    missingLetterPattern: 'r_tt_n',
    sentences: [{ pronoun: 'ich', text: 'Die Feuerwehr rettet den Mann.' }],
    exampleSentence: 'Die Feuerwehr rettet den Mann.',
    validationStatus: 'approved',
  }),
];

// Test Tuesday plan (Grammatik-Tag)
const tuesdayPlan = generateDailyExercisePlan({
  day: 'tuesday',
  words: week2Words,
  level: 'profi',
});

console.log(`Generated ${tuesdayPlan.heuteEmpfohlen.length} Tuesday exercises:`);
tuesdayPlan.heuteEmpfohlen.forEach((ex, idx) => {
  console.log(`  [${idx + 1}] ${ex.word?.cleanWord} (${ex.word?.wortart}) -> ${ex.title} [${ex.type}]`);
});

// Check that billig NEVER receives verb_conjugation
const billigExercises = tuesdayPlan.heuteEmpfohlen.filter(
  (e) => e.word?.cleanWord.toLowerCase() === 'billig'
);
billigExercises.forEach((ex) => {
  assert(
    ex.type !== 'verb_conjugation',
    `billig must NOT receive verb_conjugation (received: ${ex.type})`
  );
  assert(
    ex.title !== 'Verbform anpassen',
    `billig must NOT have title 'Verbform anpassen' (received: ${ex.title})`
  );
});

// Check that retten receives verb_conjugation
const rettenConjugation = tuesdayPlan.heuteEmpfohlen.find(
  (e) => e.word?.cleanWord.toLowerCase() === 'retten' && e.type === 'verb_conjugation'
);
assert(
  rettenConjugation !== undefined,
  'retten receives verb_conjugation on Tuesday'
);
if (rettenConjugation) {
  assert(
    rettenConjugation.correctAnswer === 'rettest' || rettenConjugation.correctAnswer === 'rettet',
    `retten correct form is conjugated (${rettenConjugation.correctAnswer})`
  );
}

// Check that das Schiff receives plural_choice
const schiffPlural = tuesdayPlan.heuteEmpfohlen.find(
  (e) => e.word?.cleanWord.toLowerCase() === 'schiff' && e.type === 'plural_choice'
);
assert(
  schiffPlural !== undefined,
  'das Schiff receives plural_choice on Tuesday'
);
if (schiffPlural) {
  assert(
    schiffPlural.correctAnswer === 'die Schiffe',
    `Schiff plural is „die Schiffe“ (received: ${schiffPlural.correctAnswer})`
  );
}

// Check ALL exercises generated across the whole week for forbidden generic fillers
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
days.forEach((d) => {
  const plan = generateDailyExercisePlan({ day: d, words: week2Words, level: 'profi' });
  plan.heuteEmpfohlen.forEach((ex) => {
    const textToCheck = `${ex.prompt} ${ex.contextSentence || ''} ${ex.correctAnswer} ${ex.solutionExplanation}`;
    assert(
      !/das\s+ist\s+(schiff|wetter|unfall|mitte|retten|billig)\.?/i.test(textToCheck),
      `Day ${d}, task ${ex.id} contains NO generic „Das ist [Lernwort].“`
    );
  });
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=====================================================');
if (failedTests === 0) {
  console.log('🎉 ALL LINGUISTIC QUALITY TESTS PASSED WITH 100% SUCCESS!');
} else {
  console.error(`⚠️ FAILED: ${failedTests} test(s) failed!`);
  process.exit(1);
}
console.log('=====================================================\n');
