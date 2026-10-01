import { describe, it, expect } from 'vitest';
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
import { DEFAULT_WEEK_1_WORDS } from '../data/defaultWeeklyCurriculum';

describe('German Linguistic Quality Audit & Acceptance Tests', () => {
  it('contains all 21 words in DEFAULT_WEEK_1_WORDS with Gruppe 3 (Lernwörter 3)', () => {
    expect(DEFAULT_WEEK_1_WORDS.length).toBe(21);

    const requiredGroup3 = [
      { word: 'das Schiff', cleanWord: 'Schiff', wortart: 'Nomen', artikel: 'das', example: 'Das Schiff fährt über das Meer.' },
      { word: 'billig', cleanWord: 'billig', wortart: 'Adjektiv', example: 'Das Heft ist billig.' },
      { word: 'das Wetter', cleanWord: 'Wetter', wortart: 'Nomen', artikel: 'das', example: 'Heute ist das Wetter schön.' },
      { word: 'still', cleanWord: 'still', wortart: 'Adjektiv', example: 'Im Klassenzimmer ist es ganz still.' },
      { word: 'der Unfall', cleanWord: 'Unfall', wortart: 'Nomen', artikel: 'der', example: 'Auf der Straße ist ein Unfall passiert.' },
      { word: 'die Mitte', cleanWord: 'Mitte', wortart: 'Nomen', artikel: 'die', example: 'Der Ball liegt in der Mitte.' },
      { word: 'retten', cleanWord: 'retten', wortart: 'Verb', example: 'Die Feuerwehr rettet den Mann.' },
    ];

    for (const req of requiredGroup3) {
      const found = DEFAULT_WEEK_1_WORDS.find(
        (w) => w.word.toLowerCase() === req.word.toLowerCase() || w.cleanWord.toLowerCase() === req.cleanWord.toLowerCase()
      );
      expect(found).toBeDefined();
      expect(found!.group).toBe(3);
      expect(found!.wortart).toBe(req.wortart);
      if (req.artikel) expect(found!.artikel).toBe(req.artikel);
      expect(found!.exampleSentence).toBe(req.example);
      expect(isGenericSentence(found!.exampleSentence, found!.cleanWord)).toBe(false);
    }
  });
  it('correctly classifies and provides natural examples for all 7 required Lernwörter', () => {
    // Case 1: das Schiff
    const pSchiff = analyzeLernwortInput('das Schiff');
    expect(pSchiff.wortart).toBe('Nomen');
    expect(pSchiff.artikel).toBe('das');
    expect(pSchiff.plural).toBe('die Schiffe');
    expect(pSchiff.primaryExampleSentence).toBe('Das Schiff fährt über das Meer.');
    expect(isGenericSentence(pSchiff.primaryExampleSentence, 'Schiff')).toBe(false);

    // Case 2: billig
    const pBillig = analyzeLernwortInput('billig');
    expect(pBillig.wortart).toBe('Adjektiv');
    expect(pBillig.primaryExampleSentence).toBe('Das Heft ist billig.');
    expect(isGenericSentence(pBillig.primaryExampleSentence, 'billig')).toBe(false);

    // Case 3: das Wetter
    const pWetter = analyzeLernwortInput('das Wetter');
    expect(pWetter.wortart).toBe('Nomen');
    expect(pWetter.artikel).toBe('das');
    expect(pWetter.primaryExampleSentence).toBe('Heute ist das Wetter schön.');
    expect(isGenericSentence(pWetter.primaryExampleSentence, 'Wetter')).toBe(false);

    // Case 4: still
    const pStill = analyzeLernwortInput('still');
    expect(pStill.wortart).toBe('Adjektiv');
    expect(pStill.primaryExampleSentence).toBe('Im Klassenzimmer ist es ganz still.');
    expect(isGenericSentence(pStill.primaryExampleSentence, 'still')).toBe(false);

    // Case 5: der Unfall
    const pUnfall = analyzeLernwortInput('der Unfall');
    expect(pUnfall.wortart).toBe('Nomen');
    expect(pUnfall.artikel).toBe('der');
    expect(pUnfall.plural).toBe('die Unfälle');
    expect(pUnfall.primaryExampleSentence).toBe('Auf der Straße ist ein Unfall passiert.');
    expect(isGenericSentence(pUnfall.primaryExampleSentence, 'Unfall')).toBe(false);

    // Case 6: die Mitte
    const pMitte = analyzeLernwortInput('die Mitte');
    expect(pMitte.wortart).toBe('Nomen');
    expect(pMitte.artikel).toBe('die');
    expect(pMitte.plural).toBe('die Mitten');
    expect(pMitte.primaryExampleSentence).toBe('Der Ball liegt in der Mitte.');
    expect(isGenericSentence(pMitte.primaryExampleSentence, 'Mitte')).toBe(false);

    // Case 7: retten
    const pRetten = analyzeLernwortInput('retten');
    expect(pRetten.wortart).toBe('Verb');
    expect(pRetten.infinitive).toBe('retten');
    expect(pRetten.primaryExampleSentence).toBe('Die Feuerwehr rettet den Mann.');
    expect(isGenericSentence(pRetten.primaryExampleSentence, 'retten')).toBe(false);
  });

  it('strictly rejects forbidden generic fillers like „Das ist [Lernwort].“', () => {
    expect(isGenericSentence('Das ist Schiff.', 'Schiff')).toBe(true);
    expect(isGenericSentence('Das ist Schiff.', 'das Schiff')).toBe(true);
    expect(isGenericSentence('Das ist Wetter.', 'Wetter')).toBe(true);
    expect(isGenericSentence('Das ist Unfall.', 'Unfall')).toBe(true);
    expect(isGenericSentence('Das ist Mitte.', 'Mitte')).toBe(true);
    expect(isGenericSentence('Das ist retten.', 'retten')).toBe(true);
    expect(isGenericSentence('Das ist billig.', 'billig')).toBe(true);
    expect(isGenericSentence('Das ist ein Schiff.', 'Schiff')).toBe(true);

    // Allowed idiom
    expect(isGenericSentence('Das ist halb so schlimm!', 'schlimm')).toBe(false);
  });

  it('heals corrupted items with quality gate and replaces generic sentences', () => {
    const corruptedBillig: LernwortItem = {
      id: 'corrupted_1',
      word: 'billig',
      cleanWord: 'billig',
      wortart: 'Verb',
      group: 2,
      emoji: '📝',
      distractors: ['bilig'],
      missingLetterPattern: 'b_ll_g',
      sentences: [{ pronoun: 'ich', text: 'Das ist billig.' }],
      exampleSentence: 'Das ist billig.',
    };

    const healedBillig = sanitizeAndHealLernwortItem(corruptedBillig);
    expect(healedBillig.wortart).toBe('Adjektiv');
    expect(healedBillig.exampleSentence).toBe('Das Heft ist billig.');
    expect(isGenericSentence(healedBillig.exampleSentence, 'billig')).toBe(false);

    const corruptedSchiff: LernwortItem = {
      id: 'corrupted_2',
      word: 'das Schiff',
      cleanWord: 'Schiff',
      wortart: 'Verb',
      group: 2,
      emoji: '📝',
      distractors: ['das Schif'],
      missingLetterPattern: 'das Sch_ff',
      sentences: [{ pronoun: 'ich', text: 'Das ist Schiff.' }],
      exampleSentence: 'Das ist Schiff.',
    };

    const healedSchiff = sanitizeAndHealLernwortItem(corruptedSchiff);
    expect(healedSchiff.wortart).toBe('Nomen');
    expect(healedSchiff.artikel).toBe('das');
    expect(healedSchiff.plural).toBe('die Schiffe');
    expect(healedSchiff.exampleSentence).toBe('Das Schiff fährt über das Meer.');
    expect(isGenericSentence(healedSchiff.exampleSentence, 'Schiff')).toBe(false);
  });

  it('validates quality gate for incomplete profiles', () => {
    const badProfile = {
      word: 'der Unfall',
      cleanWord: 'Unfall',
      wortart: 'Nomen' as const,
      exampleSentence: 'Das ist Unfall.',
    };
    const valBad = validateLernwortProfile(badProfile);
    expect(valBad.isValid).toBe(false);
    expect(valBad.issues.length).toBeGreaterThanOrEqual(2);

    const goodProfile = {
      word: 'der Unfall',
      cleanWord: 'Unfall',
      wortart: 'Nomen' as const,
      artikel: 'der' as const,
      plural: 'die Unfälle',
      exampleSentence: 'Auf der Straße ist ein Unfall passiert.',
    };
    const valGood = validateLernwortProfile(goodProfile);
    expect(valGood.isValid).toBe(true);
    expect(valGood.issues.length).toBe(0);
  });

  it('generates exercises respecting Wortart (billig is never conjugated, retten is, Schiff has plural)', () => {
    const rawWords = [
      'das Schiff',
      'billig',
      'das Wetter',
      'still',
      'der Unfall',
      'die Mitte',
      'retten',
    ];
    const week2Words: LernwortItem[] = rawWords.map((raw, idx) => {
      const p = analyzeLernwortInput(raw);
      return {
        id: `curated_week2_${idx + 1}`,
        word: p.wordWithArticle,
        cleanWord: p.cleanWord,
        wortart: p.wortart,
        artikel: p.artikel,
        plural: p.plural,
        infinitive: p.infinitive,
        group: 1,
        emoji: p.emoji,
        distractors: p.distractors,
        missingLetterPattern: p.missingLetterPattern,
        sentences: p.practiceSentences,
        exampleSentence: p.primaryExampleSentence,
        validationStatus: p.validationStatus,
      };
    });

    const tuesdayPlan = generateDailyExercisePlan({ day: 'tuesday', words: week2Words, level: 'profi' });
    const tuesdayExercises = tuesdayPlan.heuteEmpfohlen;

    const billigVerbConj = tuesdayExercises.find(
      (e) => e.word.cleanWord === 'billig' && e.type === 'verb_conjugation'
    );
    expect(billigVerbConj).toBeUndefined();

    const rettenVerbConj = tuesdayExercises.find(
      (e) => e.word.cleanWord === 'retten' && e.type === 'verb_conjugation'
    );
    expect(rettenVerbConj).toBeDefined();

    const schiffPlural = tuesdayExercises.find(
      (e) => e.word.cleanWord === 'Schiff' && e.type === 'plural_choice'
    );
    expect(schiffPlural).toBeDefined();
    expect(schiffPlural?.correctAnswer).toBe('die Schiffe');
  });

  it('never generates generic sentences across all days of the exercise generator', () => {
    const rawWords = [
      'das Schiff',
      'billig',
      'das Wetter',
      'still',
      'der Unfall',
      'die Mitte',
      'retten',
    ];
    const curatedList: LernwortItem[] = rawWords.map((raw, idx) => {
      const p = analyzeLernwortInput(raw);
      return {
        id: `curated_week2_${idx + 1}`,
        word: p.wordWithArticle,
        cleanWord: p.cleanWord,
        wortart: p.wortart,
        artikel: p.artikel,
        plural: p.plural,
        infinitive: p.infinitive,
        group: 1,
        emoji: p.emoji,
        distractors: p.distractors,
        missingLetterPattern: p.missingLetterPattern,
        sentences: p.practiceSentences,
        exampleSentence: p.primaryExampleSentence,
        validationStatus: p.validationStatus,
      };
    });

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    days.forEach((d) => {
      const plan = generateDailyExercisePlan({ day: d, words: curatedList, level: 'profi' });
      plan.heuteEmpfohlen.forEach((ex) => {
        const textToCheck = `${ex.prompt} ${ex.contextSentence || ''} ${ex.correctAnswer} ${ex.solutionExplanation}`;
        expect(/das\s+ist\s+(schiff|wetter|unfall|mitte|retten|billig)\.?/i.test(textToCheck)).toBe(false);
      });
    });
  });
});
