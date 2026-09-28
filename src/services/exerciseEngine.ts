import {
  DayOfWeek,
  DifficultyLevel,
  LernwortItem,
  MiniExamQuestion,
  PracticeMistake,
  WeeklyCurriculum,
} from '../types/lernwoerter';
import {
  DEFAULT_BILDGESCHICHTE_SCENES,
  THURSDAY_SATZ_PROFI_EXERCISES,
  WEDNESDAY_SENTENCE_BUILDERS,
} from '../data/defaultWeeklyCurriculum';
import {
  CURATED_LERNWOERTER_BANKS,
  validateSentencePedagogically,
} from '../data/curatedSentenceBanks';

export interface GeneratedExercise {
  id: string;
  day: DayOfWeek;
  level: DifficultyLevel;
  type:
    | 'picture_match'
    | 'spelling_choice'
    | 'missing_letters'
    | 'type_word'
    | 'wortart_choice'
    | 'article_choice'
    | 'infinitive_choice'
    | 'verb_conjugation'
    | 'plural_choice'
    | 'adjective_form'
    | 'sentence_builder'
    | 'sentence_expand'
    | 'sentence_linking'
    | 'bildgeschichte_step';
  title: string; // Smaller secondary technical label (e.g. "SATZ BAUEN · 3–4 WÖRTER", "EINZAHL & MEHRZAHL")
  prompt: string; // Prominent large action instruction (e.g. "Bringe die Wort-Blöcke in die richtige Reihenfolge.")
  contextSentence?: string; // Optional contextual sentence or prompt detail
  avatarId: 'mia' | 'ben' | 'leo' | 'sophie';
  word?: LernwortItem;
  options?: string[];
  correctAnswer: string;
  solutionExplanation?: string;
  userHint1: string;
  userHint2: string;
  pluralRuleHint?: string; // Conceptual non-spoiler hint for Einzahl & Mehrzahl!
  missingPattern?: string;
  targetSentence?: string;
  wordBlocks?: string[];
  expandSuggestions?: string[];
  starterIdeas?: string[];
  sceneId?: number;
  sceneEmoji?: string;
  sceneImageSrc?: string;
  sceneTitle?: string;
  grammarCategory: 'Rechtschreibung' | 'Grammatik' | 'Artikel' | 'Satzbau';
}

export interface DailyExercisePlan {
  heuteEmpfohlen: GeneratedExercise[]; // Strictly capped at 4-5 mixed exercises!
  nochOffen: GeneratedExercise[]; // Additional exercises available in the week
  schwerpunktExtra: GeneratedExercise[]; // Targeted adaptive reinforcement tasks
  isSaturdayLightened?: boolean; // True if Saturday Master-Challenge was reduced to balance catch-up work
  skippedCount?: number;
}

/**
 * Non-answer conceptual hint for Einzahl und Mehrzahl.
 * Helps the child understand the rule through an analogy with a DIFFERENT word,
 * and never mentions the target word itself!
 */
export function getPluralConceptHint(nounClean: string): string {
  const lower = nounClean.toLowerCase();
  if (lower === 'nummer') {
    return 'Einige Wörter bekommen in der Mehrzahl ein -n oder -en. Denk an ein anderes Beispiel: die Blume → die Blumen oder die Puppe → die Puppen.';
  }
  if (lower === 'zimmer') {
    return 'Manche Nomen klingen in der Mehrzahl genauso wie in der Einzahl. Denk an ein anderes Beispiel: ein Teller → zwei Teller oder ein Fenster → viele Fenster.';
  }
  if (lower === 'messer') {
    return 'Manche Nomen behalten in der Mehrzahl ihre Grundform. Denk an ein anderes Beispiel: ein Löffel → zwei Löffel oder ein Fenster → zwei Fenster.';
  }
  if (lower === 'schloss') {
    return 'Bei manchen Wörtern verwandelt sich der Vokal in einen Umlaut (o → ö) und bekommt ein -er am Ende: das Haus → die Häuser oder das Buch → die Bücher.';
  }
  if (lower === 'kuss') {
    return 'Bei manchen Wörtern verwandelt sich der Vokal in einen Umlaut (u → ü) und bekommt ein -e am Ende: der Fluss → die Flüsse oder der Baum → die Bäume.';
  }
  return 'Stell dir vor, du siehst viele davon. Hör genau hin: Sagst du „eine ...“ oder „viele ...“? Wie klingt es flüssig?';
}

/**
 * Intelligent pedagogical hint generator based on student input and attempt count
 */
export function getSmartPedagogicalHint(
  exercise: GeneratedExercise,
  studentInput: string,
  attemptCount: number
): string {
  const trimmed = studentInput.trim();
  const correct = exercise.correctAnswer.trim();

  // Attempt 1: Gentle directional hint
  if (attemptCount <= 1) {
    if (exercise.pluralRuleHint && exercise.type === 'plural_choice') {
      return exercise.pluralRuleHint;
    }
    if (exercise.grammarCategory === 'Artikel') {
      return `Fast! Überlege noch einmal: Heißt es der, die oder das ${exercise.word?.cleanWord || ''}?`;
    }
    if (exercise.grammarCategory === 'Grammatik') {
      if (exercise.type === 'verb_conjugation') {
        return 'Fast! Schau noch einmal auf das Verb und wer die Handlung ausführt.';
      }
      return 'Fast! Schau noch einmal genau auf die Wortform.';
    }
    if (exercise.grammarCategory === 'Satzbau') {
      if (!trimmed.endsWith('.') && !trimmed.endsWith('!')) {
        return 'Vergiss nicht den Punkt am Satzende!';
      }
      if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase()) {
        return 'Beginnt dein Satz mit einem Großbuchstaben?';
      }
      return 'Wo gehört das Verb hin? Im Aussagesatz steht es meist an Position 2!';
    }
    // Rechtschreibung
    if (
      (exercise.word && exercise.word.word.includes('mm')) ||
      exercise.word?.word.includes('ss') ||
      exercise.word?.word.includes('nn')
    ) {
      return 'Achte auf den Doppelkonsonanten (wie mm, ss oder nn)!';
    }
    return exercise.userHint1 || 'Fast! Versuche es noch einmal in Ruhe.';
  }

  // Attempt 2: Stronger hint
  if (attemptCount === 2) {
    if (exercise.grammarCategory === 'Artikel') {
      return `Tipp: ${exercise.word?.cleanWord} ist ${exercise.word?.wortart}. Probier einen anderen Begleiter!`;
    }
    if (exercise.type === 'verb_conjugation') {
      return `Tipp: Bei "${exercise.contextSentence?.includes('Ich') || exercise.prompt.includes('Ich') ? 'ich' : exercise.contextSentence?.includes('Du') || exercise.prompt.includes('Du') ? 'du' : 'er'}" endet das Verb oft auf -e, -st oder -t!`;
    }
    if (exercise.type === 'sentence_builder') {
      return `Tipp: Das erste Wort ist "${exercise.wordBlocks?.[0] || correct.split(' ')[0]}".`;
    }
    return exercise.userHint2 || 'Du bist schon nah dran! Schau dir die Buchstaben genau an.';
  }

  // Attempt 3+: Reveal offer
  return `Brauchst du Hilfe? Die richtige Lösung lautet: "${correct}".`;
}

/**
 * Generates Monday daily tasks: Wörter entdecken (Mia - Wörter-Detektiv)
 */
export function generateMondayExercises(words: LernwortItem[], level: DifficultyLevel): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];

  words.forEach((w) => {
    const clean = w.cleanWord.toLowerCase();

    // 1. Picture / Emoji match (Visual & Word Association)
    exercises.push({
      id: `mon_picture_match_${clean}`,
      day: 'monday',
      level,
      type: 'picture_match',
      title: 'Bild zuordnen',
      prompt: 'Welches Wort passt zu diesem Bild?',
      avatarId: 'mia',
      word: w,
      options: [w.word, ...w.distractors.slice(0, level === 'starter' ? 2 : 3)],
      correctAnswer: w.word,
      solutionExplanation: `${w.emoji} steht für „${w.word}“.`,
      userHint1: 'Schau dir das Bild genau an und lies die Auswahlwörter.',
      userHint2: `Es beginnt mit dem Buchstaben „${w.cleanWord[0]}“.`,
      grammarCategory: 'Rechtschreibung',
    });

    // 2. Missing letters (Phoneme & Spelling discrimination)
    exercises.push({
      id: `mon_missing_letters_${clean}`,
      day: 'monday',
      level,
      type: 'missing_letters',
      title: 'Fehlende Buchstaben',
      prompt: 'Ergänze die fehlenden Buchstaben.',
      contextSentence: w.missingLetterPattern,
      avatarId: 'mia',
      word: w,
      correctAnswer: w.word,
      missingPattern: w.missingLetterPattern,
      solutionExplanation: `Richtig geschrieben heißt es: „${w.word}“.`,
      userHint1: 'Achte auf die Lücken und den Doppelkonsonanten!',
      userHint2: `Das Wort beginnt mit: ${w.cleanWord.slice(0, 2)}...`,
      grammarCategory: 'Rechtschreibung',
    });

    // 3. Choose correct spelling
    exercises.push({
      id: `mon_spelling_choice_${clean}`,
      day: 'monday',
      level,
      type: 'spelling_choice',
      title: 'Richtige Schreibweise',
      prompt: 'Welche Schreibweise ist richtig?',
      avatarId: 'mia',
      word: w,
      options: [w.word, ...w.distractors],
      correctAnswer: w.word,
      solutionExplanation: `Die richtige Schreibweise ist „${w.word}“.`,
      userHint1: 'Pass genau auf Doppellaute auf (wie mm, ss oder nn)!',
      userHint2: 'Der Vokal vor dem Doppellaut wird kurz gesprochen.',
      grammarCategory: 'Rechtschreibung',
    });

    // 4. Identify Wortart: Nomen, Verb, Adjektiv
    exercises.push({
      id: `mon_wortart_choice_${clean}`,
      day: 'monday',
      level,
      type: 'wortart_choice',
      title: 'Wortart bestimmen',
      prompt: 'Welche Wortart ist dieses Wort?',
      contextSentence: `„${w.cleanWord}“`,
      avatarId: 'mia',
      word: w,
      options: ['Nomen', 'Verb', 'Adjektiv'],
      correctAnswer: w.wortart,
      solutionExplanation: `„${w.cleanWord}“ ist ein ${w.wortart}.`,
      userHint1:
        w.wortart === 'Nomen'
          ? 'Man kann einen Artikel (der/die/das) davor setzen!'
          : w.wortart === 'Verb'
          ? 'Es ist ein Tu-Wort (man kann es tun)!'
          : 'Es ist ein Wie-Wort (wie etwas ist)!',
      userHint2:
        w.wortart === 'Nomen'
          ? 'Nomen schreibt man groß!'
          : 'Verben und Adjektive schreibt man im Satz klein.',
      grammarCategory: 'Grammatik',
    });

    // 5. Type the entire word & Article/Infinitive
    if (w.wortart === 'Nomen') {
      exercises.push({
        id: `mon_article_choice_${clean}`,
        day: 'monday',
        level,
        type: 'article_choice',
        title: 'Richtigen Begleiter wählen',
        prompt: 'Welcher Begleiter (der, die oder das) gehört dazu?',
        contextSentence: `___ ${w.cleanWord}`,
        avatarId: 'mia',
        word: w,
        options: ['der', 'die', 'das'],
        correctAnswer: w.artikel || 'das',
        solutionExplanation: `Es heißt: ${w.artikel} ${w.cleanWord}.`,
        userHint1: 'Sprich das Nomen laut im Kopf: Klingt es männlich (der), weiblich (die) oder sächlich (das)?',
        userHint2: 'Denke an eine Eigenschaft: ein schönes ..., ein großer ... oder eine kleine ...?',
        grammarCategory: 'Artikel',
      });
    } else {
      exercises.push({
        id: `mon_type_word_${clean}`,
        day: 'monday',
        level,
        type: 'type_word',
        title: 'Lernwort schreiben',
        prompt: 'Schau dir das Bild an. Schreibe das gesuchte Wort fehlerfrei:',
        avatarId: 'mia',
        word: w,
        correctAnswer: w.word,
        solutionExplanation: `Super! „${w.word}“ ist fehlerfrei geschrieben!`,
        userHint1: 'Denke an Groß- und Kleinschreibung sowie Doppelkonsonanten.',
        userHint2: `Es fängt an mit: „${w.word.slice(0, 3)}“`,
        grammarCategory: 'Rechtschreibung',
      });
    }
  });

  return exercises;
}

/**
 * Generates Tuesday daily tasks: Wortformen & Grammatik (Ben - Grammatik-Coach)
 */
export function generateTuesdayExercises(words: LernwortItem[], level: DifficultyLevel): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];
  const verbs = words.filter((w) => w.wortart === 'Verb');
  const nouns = words.filter((w) => w.wortart === 'Nomen');
  const adjs = words.filter((w) => w.wortart === 'Adjektiv');

  // Curated conjugation tasks with meaningful context and non-spoiler hints
  verbs.forEach((v) => {
    const clean = v.cleanWord.toLowerCase();
    const bank = CURATED_LERNWOERTER_BANKS[v.cleanWord];
    const taskDu = bank?.conjugationBank?.find((c) => c.pronounOrSubject.toLowerCase().includes('du')) || bank?.conjugationBank?.[0];
    const taskEr = bank?.conjugationBank?.find((c) => !c.pronounOrSubject.toLowerCase().includes('du')) || bank?.conjugationBank?.[1] || taskDu;

    if (taskDu) {
      // Task 1: "Du" or primary form
      exercises.push({
        id: `tue_verb_conjugation_${clean}_du`,
        day: 'tuesday',
        level: 'starter',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Welche Verbform passt in den Satz?',
        contextSentence: taskDu.sentenceWithBlank,
        avatarId: 'ben',
        word: v,
        options: taskDu.options,
        correctAnswer: taskDu.correctForm,
        solutionExplanation: taskDu.explanation,
        userHint1: 'Achte auf das Subjekt (wer handelt?) und wähle die passende Verb-Endung im Präsens.',
        userHint2: 'Denke an die Personalendungen: ich -e, du -st, er/sie/es -t, wir -en.',
        grammarCategory: 'Grammatik',
      });
    }

    if (taskEr) {
      // Task 2: "Er/Sie/Es", "Wir", or plural form
      exercises.push({
        id: `tue_verb_conjugation_${clean}_er`,
        day: 'tuesday',
        level: 'profi',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Welche Verbform passt in den Satz?',
        contextSentence: taskEr.sentenceWithBlank,
        avatarId: 'ben',
        word: v,
        options: taskEr.options,
        correctAnswer: taskEr.correctForm,
        solutionExplanation: taskEr.explanation,
        userHint1: 'Schau genau auf das Subjekt des Satzes (Einzahl oder Mehrzahl?).',
        userHint2: 'Denke an die Endungen: er/sie/es endet meist auf -t, wir auf -en.',
        grammarCategory: 'Grammatik',
      });
    }
  });

  // Nouns plural with non-answer hint box!
  nouns.forEach((n) => {
    if (n.plural) {
      const clean = n.cleanWord.toLowerCase();
      exercises.push({
        id: `tue_plural_choice_${clean}`,
        day: 'tuesday',
        level: level,
        type: 'plural_choice',
        title: 'Einzahl & Mehrzahl',
        prompt: 'Welche Mehrzahl ist richtig?',
        contextSentence: `„${n.word}“ → viele ...?`,
        avatarId: 'ben',
        word: n,
        options: [
          n.plural,
          `die ${n.cleanWord}e`,
          `die ${n.cleanWord}en`,
          `die ${n.cleanWord}s`,
        ]
          .filter((val, i, arr) => arr.indexOf(val) === i)
          .slice(0, 3),
        correctAnswer: n.plural,
        pluralRuleHint: getPluralConceptHint(n.cleanWord),
        solutionExplanation: `Einzahl: ${n.word} → Mehrzahl: ${n.plural}.`,
        userHint1: 'Lies die gelbe Tipp-Box aufmerksam durch!',
        userHint2: 'Sprich den Satz leise: „Ich sehe drei ...“ Welche der Optionen klingt sprachlich ganz natürlich?',
        grammarCategory: 'Grammatik',
      });
    }
  });

  // Adjectives
  adjs.forEach((a) => {
    const clean = a.cleanWord.toLowerCase();
    exercises.push({
      id: `tue_adjective_form_${clean}`,
      day: 'tuesday',
      level: 'meister',
      type: 'adjective_form',
      title: 'Adjektiv im Satz anwenden',
      prompt: 'Welche Adjektiv-Form passt in den Satz?',
      contextSentence:
        a.cleanWord === 'bissig'
          ? 'Pass auf vor dem ___ Hund!'
          : a.cleanWord === 'dünn'
          ? 'Er schneidet eine ___ Scheibe Brot.'
          : 'Die Verletzung ist zum Glück nicht so ___.',
      avatarId: 'ben',
      word: a,
      options:
        a.cleanWord === 'bissig'
          ? ['bissigen', 'bissiger', 'bissige']
          : a.cleanWord === 'dünn'
          ? ['dünne', 'dünnen', 'dünnes']
          : ['schlimm', 'schlimme', 'schlimmer'],
      correctAnswer:
        a.cleanWord === 'bissig' ? 'bissigen' : a.cleanWord === 'dünn' ? 'dünne' : 'schlimm',
      solutionExplanation: `Im Satz lautet die passende Form: ${
        a.cleanWord === 'bissig' ? 'bissigen' : a.cleanWord === 'dünn' ? 'dünne' : 'schlimm'
      }.`,
      userHint1: 'Sprich den Satz laut und wähle die Form, die flüssig klingt.',
      userHint2: 'Achte auf den Fall und den Begleiter vor dem Adjektiv.',
      grammarCategory: 'Grammatik',
    });
  });

  return exercises;
}

/**
 * Generates Wednesday tasks: Sätze bauen mit Wort-Blöcken (Leo - Satz-Baumeister)
 */
export function generateWednesdayExercises(level: DifficultyLevel): GeneratedExercise[] {
  const builders = WEDNESDAY_SENTENCE_BUILDERS.filter((b) => b.difficulty === level);

  return builders.map((b) => ({
    id: `wed_sentence_builder_${b.id}`,
    day: 'wednesday',
    level: b.difficulty,
    type: 'sentence_builder',
    title:
      level === 'starter'
        ? 'Satz bauen · 3–4 Wörter'
        : level === 'profi'
        ? 'Satz bauen · 5–6 Wörter'
        : 'Satz mit Bindewort bauen',
    prompt: 'Bringe die Wort-Blöcke in die richtige Reihenfolge.',
    avatarId: 'leo',
    correctAnswer: b.targetSentence,
    solutionExplanation: `Klasse gebaut! Der richtige Satz lautet: „${b.targetSentence}“`,
    userHint1: b.hint,
    userHint2: `Der Satz beginnt mit: „${b.targetSentence.split(' ')[0]}“.`,
    targetSentence: b.targetSentence,
    wordBlocks: b.words.map((w) => w.text).sort(() => Math.random() - 0.5),
    grammarCategory: 'Satzbau',
  }));
}

/**
 * Generates Thursday tasks: Satz-Profi & Satz-Verbinder (Sophie - Geschichten-Profi)
 */
export function generateThursdayExercises(level: DifficultyLevel): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];

  THURSDAY_SATZ_PROFI_EXERCISES.forEach((ex) => {
    if (level === 'starter') {
      exercises.push({
        id: `thu_sentence_expand_${ex.id}`,
        day: 'thursday',
        level: 'starter',
        type: 'sentence_expand',
        title: 'Satz schreiben',
        prompt: 'Schreibe einen vollständigen Satz mit dem Lernwort:',
        contextSentence: `Lernwort: „${ex.word}“`,
        avatarId: 'sophie',
        correctAnswer: ex.baseExample,
        solutionExplanation: `Ein eigener, vollständiger Satz mit dem Lernwort „${ex.word}“.`,
        userHint1: 'Denke an Subjekt (wer?), Verb (tut was?) und Großschreibung am Anfang.',
        userHint2: 'Formuliere nach dem Muster: „Wer tut was mit dem Lernwort?“',
        expandSuggestions: ex.expandSuggestions,
        grammarCategory: 'Satzbau',
      });
    } else if (level === 'profi') {
      exercises.push({
        id: `thu_sentence_expand_${ex.id}`,
        day: 'thursday',
        level: 'profi',
        type: 'sentence_expand',
        title: 'Satz länger machen',
        prompt: 'Mach den Satz spannender und länger! Nutze Vorschläge:',
        contextSentence: `Ausgangssatz: „${ex.baseExample}“`,
        avatarId: 'sophie',
        correctAnswer: ex.longExample,
        solutionExplanation: `Ein eigener, erweiterter Satz mit dem Lernwort „${ex.word}“.`,
        userHint1: 'Füge Zeit („heute“) oder Ort („im Schwimmbad“) hinzu!',
        userHint2: 'Nutze die Wörter aus der Ideen-Box, um den Satz mit Details anzureichern.',
        expandSuggestions: ex.expandSuggestions,
        grammarCategory: 'Satzbau',
      });
    }

    // Sentence-linking tasks (available across levels if linkedTask exists)
    if (ex.linkedTask) {
      exercises.push({
        id: `thu_sentence_linking_${ex.id}`,
        day: 'thursday',
        level,
        type: 'sentence_linking',
        title: 'Zwei Sätze verbinden',
        prompt: 'Verbinde diese zwei Sätze sinnvoll mit dem passenden Bindewort:',
        contextSentence: `1. ${ex.linkedTask.firstSentence}\n2. ${ex.linkedTask.secondSentence}`,
        avatarId: 'sophie',
        options: ex.linkedTask.options,
        correctAnswer: ex.linkedTask.correctConnector,
        solutionExplanation: `Richtig! ${ex.linkedTask.combinedSentence}`,
        userHint1:
          'Welches Bindewort passt am besten? „und“ reiht an, „aber“ zeigt einen Gegensatz, „weil“ erklärt den Grund!',
        userHint2: 'Überlege: Wird eine Ursache (Warum?) genannt oder ein gegensätzlicher Gedanke?',
        grammarCategory: 'Satzbau',
      });
    }
  });

  return exercises;
}

/**
 * Generates targeted reinforcement exercises for words the child often gets wrong
 */
export function generateReinforcementExercises(
  weakWords: string[],
  allWords: LernwortItem[],
  level: DifficultyLevel = 'profi'
): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];
  const targetWords = allWords.filter(
    (w) =>
      weakWords.includes(w.cleanWord.toLowerCase()) ||
      weakWords.includes(w.word.toLowerCase()) ||
      weakWords.includes(w.id)
  );

  targetWords.forEach((w) => {
    const clean = w.cleanWord.toLowerCase();
    // 1. Missing letters reinforcement
    exercises.push({
      id: `schwerpunkt_${clean}`,
      day: 'monday',
      level,
      type: 'missing_letters',
      title: `Schwerpunkt üben · ${w.cleanWord}`,
      prompt: 'Ergänze die fehlenden Buchstaben.',
      contextSentence: w.missingLetterPattern,
      avatarId: 'mia',
      word: w,
      correctAnswer: w.word,
      missingPattern: w.missingLetterPattern,
      solutionExplanation: `Sehr gut! Richtig heißt es: „${w.word}“.`,
      userHint1: 'Achte auf die Doppelkonsonanten (mm, ss, nn).',
      userHint2: 'Klopfe die Silben leise mit: Wo liegt der kurze Vokal und der Doppellaut?',
      grammarCategory: 'Rechtschreibung',
    });

    // 2. Sentence context reinforcement
    const sampleSent = w.sentences[0] || { text: `Das Wort heißt ${w.cleanWord}.` };
    const blankSent = sampleSent.text.replace(new RegExp(w.cleanWord, 'gi'), '_____');
    exercises.push({
      id: `schwerpunkt_satz_${clean}`,
      day: 'wednesday',
      level,
      type: 'spelling_choice',
      title: `Schwerpunkt im Satz · ${w.cleanWord}`,
      prompt: 'Welches Wort passt in die Lücke?',
      contextSentence: `„${blankSent}“`,
      avatarId: 'leo',
      word: w,
      options: [w.cleanWord, ...w.distractors.map((d) => d.replace(/^(der|die|das)\s+/i, ''))].sort(
        () => Math.random() - 0.5
      ),
      correctAnswer: w.cleanWord,
      solutionExplanation: `Super! Der ganze Satz lautet: „${sampleSent.text}“`,
      userHint1: 'Lies den Satz laut und wähle die richtige Schreibweise.',
      userHint2: 'Achte auf die Lautung vor dem Konsonanten: Ein kurzer Vokal verlangt einen doppelten Mitlaut.',
      grammarCategory: 'Satzbau',
    });
  });

  return exercises;
}

/**
 * Creates a Bildgeschichte scene exercise for the daily mix (Levels 1 to 3)
 */
function createBildgeschichteDailyExercise(
  sceneId: number,
  day: DayOfWeek,
  level: DifficultyLevel
): GeneratedExercise {
  const scene = DEFAULT_BILDGESCHICHTE_SCENES.find((s) => s.id === sceneId) || DEFAULT_BILDGESCHICHTE_SCENES[0];
  return {
    id: `bg_daily_${day}_scene_${scene.id}`,
    day,
    level,
    type: 'bildgeschichte_step',
    title: 'Bildgeschichte · Szene',
    prompt: 'Was passiert auf diesem Bild? Schreibe 1–2 Sätze.',
    contextSentence: scene.title,
    avatarId: 'sophie',
    correctAnswer: scene.description,
    solutionExplanation: `Musterbeispiel: „${scene.description}“`,
    userHint1: 'Schau genau auf das Bild: Wer tut was? Nutze die Satzanfänge!',
    userHint2: 'Wähle einen der passenden Satzanfänge und beschreibe die Handlung mit eigenen Worten.',
    expandSuggestions: scene.suggestedWords,
    starterIdeas: scene.starterIdeas,
    sceneId: scene.id,
    sceneEmoji: scene.emoji,
    sceneImageSrc: scene.imageSrc,
    sceneTitle: scene.title,
    grammarCategory: 'Satzbau',
  };
}

/**
 * Helper to generate a clean, canonical exercise for a specific word and type with deterministic ID
 */
export function createWordExercise(
  w: LernwortItem,
  type: GeneratedExercise['type'],
  day: DayOfWeek,
  level: DifficultyLevel = 'profi',
  customVariant?: string
): GeneratedExercise {
  const clean = w.cleanWord.toLowerCase();
  const dayPrefix = day.slice(0, 3); // 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
  const variantSuffix = customVariant ? `_${customVariant}` : '';
  const id = `${dayPrefix}_${type}_${clean}${variantSuffix}`;

  // Avatar matching the day's focus
  const avatarId =
    day === 'monday'
      ? 'mia'
      : day === 'tuesday'
      ? 'ben'
      : day === 'wednesday'
      ? 'leo'
      : 'sophie';

  if (type === 'picture_match') {
    const distractors = w.distractors.map((d) => d.replace(/^(der|die|das)\s+/i, ''));
    const options = [w.cleanWord, ...distractors.slice(0, 2)];
    return {
      id,
      day,
      level,
      type: 'picture_match',
      title: 'Bild zuordnen',
      prompt: 'Welches Wort passt zu diesem Bild?',
      avatarId,
      word: w,
      options,
      correctAnswer: w.cleanWord,
      solutionExplanation: `Richtig! Das gesuchte Wort ist „${w.cleanWord}“.`,
      userHint1: 'Schau genau auf das Symbol und lies die Optionen leise mit.',
      userHint2: `Das Wort beginnt mit dem Buchstaben „${w.cleanWord[0]}“.`,
      grammarCategory: 'Rechtschreibung',
    };
  }

  if (type === 'missing_letters') {
    return {
      id,
      day,
      level,
      type: 'missing_letters',
      title: 'Fehlende Buchstaben',
      prompt: 'Ergänze die fehlenden Buchstaben.',
      contextSentence: w.missingLetterPattern,
      avatarId,
      word: w,
      correctAnswer: w.word,
      missingPattern: w.missingLetterPattern,
      solutionExplanation: `Sehr gut! Richtig geschrieben heißt es: „${w.word}“.`,
      userHint1: 'Pass genau auf Doppelkonsonanten auf (mm, ss, nn).',
      userHint2: 'Der Vokal vor dem Doppellaut wird kurz gesprochen.',
      grammarCategory: 'Rechtschreibung',
    };
  }

  if (type === 'spelling_choice') {
    return {
      id,
      day,
      level,
      type: 'spelling_choice',
      title: 'Richtige Schreibweise',
      prompt: 'Welche Schreibweise ist richtig?',
      avatarId,
      word: w,
      options: [w.word, ...w.distractors].slice(0, 3),
      correctAnswer: w.word,
      solutionExplanation: `Die richtige Schreibweise ist „${w.word}“.`,
      userHint1: 'Achte auf den kurzen Vokal und die Doppelkonsonanten!',
      userHint2: 'Sprich das Wort leise in Silben: Wo stoppt der Laut?',
      grammarCategory: 'Rechtschreibung',
    };
  }

  if (type === 'article_choice') {
    return {
      id,
      day,
      level,
      type: 'article_choice',
      title: 'Richtigen Begleiter wählen',
      prompt: 'Welcher Begleiter (der, die oder das) gehört dazu?',
      contextSentence: `___ ${w.cleanWord}`,
      avatarId,
      word: w,
      options: ['der', 'die', 'das'],
      correctAnswer: w.artikel || 'das',
      solutionExplanation: `Es heißt: ${w.artikel || 'das'} ${w.cleanWord}.`,
      userHint1: 'Klingt es männlich (der), weiblich (die) oder sächlich (das)?',
      userHint2: 'Denke an ein Beispiel: ein schönes ..., ein großer ... oder eine kleine ...?',
      grammarCategory: 'Artikel',
    };
  }

  if (type === 'wortart_choice') {
    return {
      id,
      day,
      level,
      type: 'wortart_choice',
      title: 'Wortart bestimmen',
      prompt: 'Welche Wortart ist dieses Wort?',
      contextSentence: `„${w.cleanWord}“`,
      avatarId,
      word: w,
      options: ['Nomen', 'Verb', 'Adjektiv'],
      correctAnswer: w.wortart,
      solutionExplanation: `„${w.cleanWord}“ ist ein ${w.wortart}.`,
      userHint1:
        w.wortart === 'Nomen'
          ? 'Man kann der, die oder das davor setzen!'
          : w.wortart === 'Verb'
          ? 'Es ist ein Tu-Wort (Handlung)!'
          : 'Es beschreibt, wie etwas ist!',
      userHint2: w.wortart === 'Nomen' ? 'Nomen werden großgeschrieben.' : 'Wird im Satz kleingeschrieben.',
      grammarCategory: 'Grammatik',
    };
  }

  if (type === 'plural_choice') {
    const pluralForm = w.plural || `die ${w.cleanWord}e`;
    const alt1 = pluralForm.endsWith('er') ? `die ${w.cleanWord}e` : `die ${w.cleanWord}er`;
    const alt2 = `die ${w.cleanWord}en`;
    const options = [pluralForm, alt1, alt2].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
    return {
      id,
      day,
      level,
      type: 'plural_choice',
      title: 'Einzahl & Mehrzahl',
      prompt: 'Welche Mehrzahl ist richtig?',
      contextSentence: `„${w.word}“ → viele ...?`,
      avatarId,
      word: w,
      options,
      correctAnswer: pluralForm,
      pluralRuleHint: getPluralConceptHint(w.cleanWord),
      solutionExplanation: `Einzahl: ${w.word} → Mehrzahl: ${pluralForm}.`,
      userHint1: 'Lies die gelbe Tipp-Box aufmerksam durch!',
      userHint2: 'Sprich den Satz leise: „Ich sehe drei ...“ Welche Form klingt natürlich?',
      grammarCategory: 'Grammatik',
    };
  }

  if (type === 'verb_conjugation') {
    const isDu = customVariant === 'du' || !customVariant;
    const bank = CURATED_LERNWOERTER_BANKS[w.cleanWord];
    const task = isDu
      ? bank?.conjugationBank?.find((c) => c.pronounOrSubject.toLowerCase().includes('du')) || bank?.conjugationBank?.[0]
      : bank?.conjugationBank?.find((c) => !c.pronounOrSubject.toLowerCase().includes('du')) || bank?.conjugationBank?.[1] || bank?.conjugationBank?.[0];

    const sentenceWithBlank = task?.sentenceWithBlank || (isDu ? `Du ___ die richtige Antwort.` : `Er ___ den Weg zur Schule.`);
    const correctForm = task?.correctForm || (isDu ? `${w.cleanWord.slice(0, -2)}st` : `${w.cleanWord.slice(0, -2)}t`);
    const options = task?.options || [correctForm, `${w.cleanWord.slice(0, -2)}e`, `${w.cleanWord.slice(0, -2)}en`];
    const explanation = task?.explanation || `Richtig! Die passende Form heißt „${correctForm}“.`;

    return {
      id,
      day,
      level,
      type: 'verb_conjugation',
      title: 'Verbform anpassen',
      prompt: 'Welche Verbform passt in den Satz?',
      contextSentence: sentenceWithBlank,
      avatarId,
      word: w,
      options,
      correctAnswer: correctForm,
      solutionExplanation: explanation,
      userHint1: isDu ? 'Bei „du“ endet das Verb im Präsens auf -st.' : 'Bei „er/sie/es“ endet das Verb auf -t.',
      userHint2: 'Denke an die Endungen: ich -e, du -st, er/sie -t, wir -en.',
      grammarCategory: 'Grammatik',
    };
  }

  if (type === 'adjective_form') {
    const bank = CURATED_LERNWOERTER_BANKS[w.cleanWord];
    const adjTask = bank?.adjectiveBank?.[0];
    const formCorrect = adjTask?.correctForm || w.cleanWord;
    const sentence = adjTask?.sentenceWithBlank || `Das ist ganz schön ${w.cleanWord}.`;
    const options = adjTask?.options || [w.cleanWord, `${w.cleanWord}e`, `${w.cleanWord}en`];
    const explanation = adjTask?.explanation || `Im Satz heißt es: „${formCorrect}“.`;

    return {
      id,
      day,
      level,
      type: 'adjective_form',
      title: 'Adjektiv im Satz anwenden',
      prompt: 'Welche Adjektiv-Form passt in den Satz?',
      contextSentence: sentence,
      avatarId,
      word: w,
      options,
      correctAnswer: formCorrect,
      solutionExplanation: explanation,
      userHint1: 'Sprich den Satz laut und wähle die Form, die flüssig klingt.',
      userHint2: 'Achte auf den Begleiter vor dem Adjektiv.',
      grammarCategory: 'Grammatik',
    };
  }

  if (type === 'sentence_builder') {
    const bank = CURATED_LERNWOERTER_BANKS[w.cleanWord];
    const rawTarget =
      bank?.naturalSentences?.[0] ||
      w.exampleSentence ||
      (w.sentences && w.sentences[0] ? w.sentences[0].text : `Er lernt das Wort ${w.cleanWord}.`);
    const cleanSentence = rawTarget.trim();
    const blocks = cleanSentence
      .split(' ')
      .map((b) => b.trim())
      .filter(Boolean);

    return {
      id,
      day,
      level,
      type: 'sentence_builder',
      title: 'Satz bauen · Wort-Blöcke',
      prompt: 'Bringe die Wort-Blöcke in die richtige Reihenfolge.',
      avatarId,
      word: w,
      correctAnswer: cleanSentence,
      solutionExplanation: `Klasse! Der vollständige Satz lautet: „${cleanSentence}“`,
      userHint1: 'Achte auf den Satzanfang (Großschreibung) und den Punkt am Ende.',
      userHint2: `Der Satz beginnt mit: „${blocks[0]}“.`,
      targetSentence: cleanSentence,
      wordBlocks: [...blocks].sort(() => Math.random() - 0.5),
      grammarCategory: 'Satzbau',
    };
  }

  if (type === 'sentence_expand') {
    const bank = CURATED_LERNWOERTER_BANKS[w.cleanWord];
    const baseEx = bank?.naturalSentences?.[0] || w.exampleSentence || `Er mag ${w.cleanWord}.`;
    return {
      id,
      day,
      level,
      type: 'sentence_expand',
      title: 'Satz mit Lernwort schreiben',
      prompt: bank?.writingPrompt || 'Schreibe einen vollständigen Satz mit dem Lernwort:',
      contextSentence: `Lernwort: „${w.cleanWord}“`,
      avatarId,
      word: w,
      correctAnswer: baseEx,
      solutionExplanation: `Ein eigener, vollständiger Satz mit dem Lernwort „${w.cleanWord}“.`,
      userHint1: 'Denke an Subjekt (wer?), Verb (tut was?) und Großschreibung.',
      userHint2: 'Nutze Zeit („heute“) oder Ort („im Zimmer“, „am See“).',
      expandSuggestions: ['heute', 'gemeinsam', 'sehr vorsichtig', 'mit Freude'],
      grammarCategory: 'Satzbau',
    };
  }

  if (type === 'sentence_linking') {
    const bank = CURATED_LERNWOERTER_BANKS[w.cleanWord];
    const connTask = bank?.connectorExercises?.[0] || {
      firstClause: `Er kennt das Wort „${w.cleanWord}“`,
      secondClause: 'er schreibt es manchmal noch falsch.',
      correctConnector: 'aber' as const,
      options: ['weil', 'aber', 'und'] as ('weil' | 'aber' | 'und')[],
      combinedSentence: `Er kennt das Wort „${w.cleanWord}“, aber er schreibt es manchmal noch falsch.`,
      connectorType: 'contrast' as const,
      explanation: '„aber“ drückt einen klaren Gegensatz aus.',
      hint: 'Achte auf den Gegensatz zwischen den beiden Satzteilen.',
    };

    const firstSentence = connTask.firstClause.trim().replace(/\.*$/, '.');
    const secondSentenceCap =
      connTask.secondClause.trim().charAt(0).toUpperCase() +
      connTask.secondClause.trim().slice(1).replace(/\.*$/, '.');

    return {
      id,
      day,
      level,
      type: 'sentence_linking',
      title: 'Zwei Sätze verbinden',
      prompt: 'Verbinde diese zwei Sätze sinnvoll mit dem passenden Bindewort:',
      contextSentence: `1. ${firstSentence}\n2. ${secondSentenceCap}`,
      avatarId,
      word: w,
      options: connTask.options,
      correctAnswer: connTask.correctConnector,
      solutionExplanation: `Richtig! ${connTask.combinedSentence}`,
      userHint1: connTask.hint,
      userHint2: connTask.explanation,
      grammarCategory: 'Satzbau',
    };
  }

  // Default fallback: spelling choice
  return {
    id,
    day,
    level,
    type: 'type_word',
    title: 'Lernwort schreiben',
    prompt: 'Schreibe das gesuchte Wort fehlerfrei:',
    avatarId,
    word: w,
    correctAnswer: w.word,
    solutionExplanation: `Sehr gut! „${w.word}“ ist richtig!`,
    userHint1: 'Denke an Groß- und Kleinschreibung sowie Doppelkonsonanten.',
    userHint2: `Es fängt an mit: „${w.word.slice(0, 3)}“`,
    grammarCategory: 'Rechtschreibung',
  };
}

export interface WeeklyCoverageReport {
  weeklyWords: string[];
  counts: Record<string, number>;
  sufficientCoverage: boolean; // all words >= 2
  reportString: string;
}

/**
 * Validates that every active Lernwort appears in AT LEAST 2 exercises across the week.
 * Logs a QA report for inspection.
 */
export function validateWeeklyPlanCoverage(
  words: LernwortItem[],
  level: DifficultyLevel = 'profi'
): WeeklyCoverageReport {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const counts: Record<string, number> = {};

  words.forEach((w) => {
    counts[w.cleanWord.toLowerCase()] = 0;
  });

  days.forEach((d) => {
    const plan = generateDailyExercisePlan({ day: d, words, level });
    plan.heuteEmpfohlen.forEach((ex) => {
      if (ex.word?.cleanWord) {
        const key = ex.word.cleanWord.toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      }
    });
  });

  const weeklyWords = words.map((w) => w.cleanWord);
  let allSufficient = true;
  const reportLines: string[] = [];

  weeklyWords.forEach((wordName) => {
    const c = counts[wordName.toLowerCase()] || 0;
    if (c < 2) allSufficient = false;
    reportLines.push(`- ${wordName}: ${c} Aufgabe${c === 1 ? '' : 'n'}`);
  });

  const reportString = `Wochen-Abdeckung (Alle Wörter mind. 2 Aufgaben):\n${reportLines.join('\n')}\nStatus: ${
    allSufficient ? '✅ Alle 14 Wörter ausreichend abgedeckt' : '⚠️ Unzureichende Abdeckung'
  }`;

  return {
    weeklyWords,
    counts,
    sufficientCoverage: allSufficient,
    reportString,
  };
}

/**
 * MASTER DAILY EXERCISE PLAN GENERATOR
 * - Strictly guarantees MAXIMUM 5 exercises per day for the recommended plan (30 tasks/week).
 * - Full coverage rule: Every active Lernwort appears at least 2 times per week.
 * - One recognition/spelling task + One application/grammar/sentence task per word.
 * - Stable, deterministic task IDs used consistently for overview, runner, and completion.
 * - Adaptive Schwerpunkt tasks are kept strictly separate in plan.schwerpunktExtra.
 */
export function generateDailyExercisePlan(params: {
  day: DayOfWeek;
  words: LernwortItem[];
  level: DifficultyLevel;
  weakWords?: string[];
  mistakes?: PracticeMistake[];
  skippedCount?: number;
}): DailyExercisePlan {
  const { day, words, level, weakWords = [], skippedCount = 0 } = params;

  // Helper to find a word by clean name (case-insensitive)
  const getWord = (name: string): LernwortItem => {
    const found = words.find((w) => w.cleanWord.toLowerCase() === name.toLowerCase());
    return found || words[0];
  };

  let todayFive: GeneratedExercise[] = [];

  // =========================================================================
  // CANONICAL 6-DAY PLAN WITH 100% BALANCED COVERAGE
  // Every word from Group 1 & Group 2 appears in AT LEAST 2 tasks!
  // =========================================================================
  if (day === 'monday') {
    // MONDAY: Recognition & Spelling Foundation (5 tasks)
    // 1. Zimmer (picture_match)
    // 2. schwimmen (missing_letters)
    // 3. Messer (spelling_choice)
    // 4. brennen (missing_letters)
    // 5. Schloss (article_choice)
    todayFive = [
      createWordExercise(getWord('Zimmer'), 'picture_match', 'monday', level),
      createWordExercise(getWord('schwimmen'), 'missing_letters', 'monday', level),
      createWordExercise(getWord('Messer'), 'spelling_choice', 'monday', level),
      createWordExercise(getWord('brennen'), 'missing_letters', 'monday', level),
      createWordExercise(getWord('Schloss'), 'article_choice', 'monday', level),
    ];
  } else if (day === 'tuesday') {
    // TUESDAY: Morphology & Grammar Rules (5 tasks)
    // 1. kennen (verb_conjugation - du)
    // 2. Nummer (plural_choice)
    // 3. beginnen (verb_conjugation - er)
    // 4. schlimm (adjective_form)
    // 5. bissig (adjective_form)
    todayFive = [
      createWordExercise(getWord('kennen'), 'verb_conjugation', 'tuesday', level, 'du'),
      createWordExercise(getWord('Nummer'), 'plural_choice', 'tuesday', level),
      createWordExercise(getWord('beginnen'), 'verb_conjugation', 'tuesday', level, 'er'),
      createWordExercise(getWord('schlimm'), 'adjective_form', 'tuesday', level),
      createWordExercise(getWord('bissig'), 'adjective_form', 'tuesday', level),
    ];
  } else if (day === 'wednesday') {
    // WEDNESDAY: Syntax & Sentence Building (5 tasks)
    // 1. Kuss (sentence_builder)
    // 2. rennen (sentence_builder)
    // 3. passen (sentence_builder)
    // 4. dünn (sentence_builder)
    // 5. Bildgeschichte Szene 1
    todayFive = [
      createWordExercise(getWord('Kuss'), 'sentence_builder', 'wednesday', level),
      createWordExercise(getWord('rennen'), 'sentence_builder', 'wednesday', level),
      createWordExercise(getWord('passen'), 'sentence_builder', 'wednesday', level),
      createWordExercise(getWord('dünn'), 'sentence_builder', 'wednesday', level),
      createBildgeschichteDailyExercise(1, 'wednesday', level),
    ];
  } else if (day === 'thursday') {
    // THURSDAY: Sentence Expansion & Connectors (5 tasks)
    // 1. Zimmer (sentence_expand) -> 2nd task for Zimmer
    // 2. schwimmen (sentence_expand) -> 2nd task for schwimmen
    // 3. Messer (sentence_linking) -> 2nd task for Messer
    // 4. brennen (sentence_expand) -> 2nd task for brennen
    // 5. Schloss (plural_choice) -> 2nd task for Schloss
    todayFive = [
      createWordExercise(getWord('Zimmer'), 'sentence_expand', 'thursday', level),
      createWordExercise(getWord('schwimmen'), 'sentence_expand', 'thursday', level),
      createWordExercise(getWord('Messer'), 'sentence_linking', 'thursday', level),
      createWordExercise(getWord('brennen'), 'sentence_expand', 'thursday', level),
      createWordExercise(getWord('Schloss'), 'plural_choice', 'thursday', level),
    ];
  } else if (day === 'friday') {
    // FRIDAY: Review & Narrative Climax (5 tasks)
    // 1. kennen (sentence_linking) -> 2nd task for kennen
    // 2. Nummer (missing_letters) -> 2nd task for Nummer
    // 3. beginnen (sentence_expand) -> 2nd task for beginnen
    // 4. schlimm (spelling_choice) -> 2nd task for schlimm
    // 5. Bildgeschichte Szene 4
    todayFive = [
      createWordExercise(getWord('kennen'), 'sentence_linking', 'friday', level),
      createWordExercise(getWord('Nummer'), 'missing_letters', 'friday', level),
      createWordExercise(getWord('beginnen'), 'sentence_expand', 'friday', level),
      createWordExercise(getWord('schlimm'), 'spelling_choice', 'friday', level),
      createBildgeschichteDailyExercise(4, 'friday', level),
    ];
  } else {
    // SATURDAY: Championship & Mastery Synthesis (5 tasks)
    // 1. Kuss (plural_choice) -> 2nd task for Kuss
    // 2. rennen (verb_conjugation) -> 2nd task for rennen
    // 3. passen (sentence_linking) -> 2nd task for passen
    // 4. dünn (spelling_choice) -> 2nd task for dünn
    // 5. bissig (spelling_choice) -> 2nd task for bissig
    const task1 = createWordExercise(getWord('Kuss'), 'plural_choice', 'saturday', level);
    const task2 = createWordExercise(getWord('rennen'), 'verb_conjugation', 'saturday', level, 'er');
    const task3 = createWordExercise(getWord('passen'), 'sentence_linking', 'saturday', level);
    const task4 = createWordExercise(getWord('dünn'), 'spelling_choice', 'saturday', level);
    const task5 = createWordExercise(getWord('bissig'), 'spelling_choice', 'saturday', level);

    if (skippedCount > 0) {
      if (skippedCount === 1) {
        todayFive = [task1, task2, task3, task5];
      } else if (skippedCount === 2) {
        todayFive = [task1, task2, task5];
      } else {
        todayFive = [task1, task5];
      }
    } else {
      todayFive = [task1, task2, task3, task4, task5];
    }
  }

  // Ensure strict cap: exactly 5 required daily tasks
  const finalHeuteEmpfohlen = todayFive.slice(0, 5);

  // Generate a broad pool of remaining available tasks for the week
  const usedIds = new Set(finalHeuteEmpfohlen.map((e) => e.id));
  const fullWeeklyPool = words.flatMap((w) => [
    createWordExercise(w, 'missing_letters', day, level),
    createWordExercise(w, 'spelling_choice', day, level),
    createWordExercise(w, 'sentence_builder', day, level),
  ]);
  const nochOffen = fullWeeklyPool.filter((e) => !usedIds.has(e.id)).slice(0, 15);

  // Adaptive Schwerpunkt tasks are kept separate and NEVER overwrite required daily tasks!
  const schwerpunktExtra = generateReinforcementExercises(weakWords, words, level);

  return {
    heuteEmpfohlen: finalHeuteEmpfohlen,
    nochOffen,
    schwerpunktExtra,
    isSaturdayLightened: day === 'saturday' && skippedCount > 0,
    skippedCount,
  };
}


/**
 * Helper to get today's 5 recommended exercises directly
 */
export function generateDailyPlanForDay(
  day: DayOfWeek,
  words: LernwortItem[],
  level: DifficultyLevel,
  weakWords: string[] = [],
  mistakes: PracticeMistake[] = []
): GeneratedExercise[] {
  const plan = generateDailyExercisePlan({ day, words, level, weakWords, mistakes });
  return plan.heuteEmpfohlen;
}

/**
 * 20-Question 4-Week Cycle Mini Exam
 * Tests all 14 Lernwörter across spelling, sentence completion, verb forms, and grammar in context
 */
export function generateMiniExam(words: LernwortItem[]): MiniExamQuestion[] {
  return [
    {
      id: 'exam_1',
      wordId: 'w1_zimmer',
      wordClean: 'Zimmer',
      type: 'sentence_missing_word',
      prompt: 'Ergänze das fehlende Lernwort im Satz:',
      sentenceWithBlank: 'Ich räume heute mein _____ gründlich auf.',
      options: ['Zimmer', 'Zimer', 'Zimmmer'],
      correctAnswer: 'Zimmer',
      explanation: '„Zimmer“ wird mit kurzem i und Doppel-m geschrieben: Zimmer.',
      emoji: '🛏️',
      hint: 'Achte auf den Doppelkonsonanten mm.',
    },
    {
      id: 'exam_2',
      wordId: 'w1_schwimmen',
      wordClean: 'schwimmen',
      type: 'verb_in_sentence',
      prompt: 'Welche Verbform passt in den Satz?',
      sentenceWithBlank: 'Wir _____ im Sommer gerne im großen See.',
      options: ['schwimmen', 'schwimmt', 'schwimme'],
      correctAnswer: 'schwimmen',
      explanation: 'Bei „Wir“ steht das Verb in der Grundform auf -en: Wir schwimmen.',
      emoji: '🏊',
      hint: 'Bei „Wir“ endet das Verb auf -en.',
    },
    {
      id: 'exam_3',
      wordId: 'w1_messer',
      wordClean: 'Messer',
      type: 'spelling_context',
      prompt: 'Welche Schreibweise passt in die Lücke?',
      sentenceWithBlank: 'Du legst das scharfe _____ vorsichtig auf den Tisch.',
      options: ['Messer', 'Meser', 'Messser'],
      correctAnswer: 'Messer',
      explanation: '„Messer“ hat kurzes e und Doppel-s: das Messer.',
      emoji: '🔪',
      hint: 'Kurzes e verlangt Doppel-s (ss).',
    },
    {
      id: 'exam_4',
      wordId: 'w1_kuss',
      wordClean: 'Kuss',
      type: 'sentence_missing_word',
      prompt: 'Welches Wort passt in den Satz?',
      sentenceWithBlank: 'Er gibt seiner Mama einen lieben _____ auf die Wange.',
      options: ['Kuss', 'Kus', 'Kusse'],
      correctAnswer: 'Kuss',
      explanation: '„Kuss“ wird mit Doppel-s geschrieben: der Kuss.',
      emoji: '💋',
      hint: 'Kurzes u verlangt Doppel-s.',
    },
    {
      id: 'exam_5',
      wordId: 'w1_rennen',
      wordClean: 'rennen',
      type: 'verb_in_sentence',
      prompt: 'Welche Verbform gehört hier hin?',
      sentenceWithBlank: 'Er _____ schnell zum Bus, damit er pünktlich ankommt.',
      options: ['rennt', 'rennet', 'rennen'],
      correctAnswer: 'rennt',
      explanation: 'Bei „Er“ endet das Verb auf -t: Er rennt.',
      emoji: '🏃',
      hint: 'Er tut was? Er rennt.',
    },
    {
      id: 'exam_6',
      wordId: 'w1_passen',
      wordClean: 'passen',
      type: 'verb_in_sentence',
      prompt: 'Welches Verb vervollständigt den Satz?',
      sentenceWithBlank: 'Die neue Hose _____ ihr richtig gut.',
      options: ['passt', 'passen', 'passe'],
      correctAnswer: 'passt',
      explanation: 'Die neue Hose (sie) passt ihr gut.',
      emoji: '👖',
      hint: 'Einzahl: Die Hose passt.',
    },
    {
      id: 'exam_7',
      wordId: 'w1_duenn',
      wordClean: 'dünn',
      type: 'grammar_choice',
      prompt: 'Welche Adjektiv-Form ist richtig?',
      sentenceWithBlank: 'Er schneidet eine _____ Scheibe Brot ab.',
      options: ['dünne', 'dünnen', 'dünner'],
      correctAnswer: 'dünne',
      explanation: 'Eine dünne Scheibe (weiblich, Einzahl).',
      emoji: '🥪',
      hint: 'Die Scheibe ist weiblich: eine dünne Scheibe.',
    },
    {
      id: 'exam_8',
      wordId: 'w1_brennen',
      wordClean: 'brennen',
      type: 'verb_in_sentence',
      prompt: 'Welche Verbform passt in die Lücke?',
      sentenceWithBlank: 'Das trockene Holz _____ hell im Kamin.',
      options: ['brennt', 'brennen', 'brennst'],
      correctAnswer: 'brennt',
      explanation: 'Das Holz (es) brennt hell im Kamin.',
      emoji: '🔥',
      hint: 'Einzahl: Das Holz brennt.',
    },
    {
      id: 'exam_9',
      wordId: 'w1_nummer',
      wordClean: 'Nummer',
      type: 'grammar_choice',
      prompt: 'Was ist die richtige Mehrzahl von „die Nummer“?',
      sentenceWithBlank: 'Eine Nummer – viele _____?',
      options: ['die Nummern', 'die Numme', 'die Nümmer'],
      correctAnswer: 'die Nummern',
      explanation: 'Die Mehrzahl von „die Nummer“ heißt „die Nummern“ (mit -n).',
      emoji: '🔢',
      hint: 'Viele Nomen auf -er bilden die Mehrzahl mit -n.',
    },
    {
      id: 'exam_10',
      wordId: 'w1_schloss',
      wordClean: 'Schloss',
      type: 'grammar_choice',
      prompt: 'Was ist die richtige Mehrzahl von „das Schloss“?',
      sentenceWithBlank: 'Ein Schloss – zwei _____?',
      options: ['die Schlösser', 'die Schlosse', 'die Schloss'],
      correctAnswer: 'die Schlösser',
      explanation: '„das Schloss“ bildet die Mehrzahl mit Umlaut ö und -er: die Schlösser.',
      emoji: '🏰',
      hint: 'Aus o wird ö und hinten kommt -er.',
    },
    {
      id: 'exam_11',
      wordId: 'w1_kennen',
      wordClean: 'kennen',
      type: 'verb_in_sentence',
      prompt: 'Welche Verbform passt in den Satz?',
      sentenceWithBlank: 'Wir _____ den Weg zum Sportplatz ganz genau.',
      options: ['kennen', 'kennt', 'kennst'],
      correctAnswer: 'kennen',
      explanation: 'Bei „Wir“ heißt es: Wir kennen.',
      emoji: '🧠',
      hint: 'Bei „Wir“ bleibt die Form auf -en.',
    },
    {
      id: 'exam_12',
      wordId: 'w1_schlimm',
      wordClean: 'schlimm',
      type: 'spelling_context',
      prompt: 'Welches Adjektiv passt in den Trostsatz?',
      sentenceWithBlank: 'Keine Sorge, dieser kleine Fehler ist halb so _____!',
      options: ['schlimm', 'schlim', 'schlimmer'],
      correctAnswer: 'schlimm',
      explanation: 'Die Redewendung lautet: „halb so schlimm“ (mit Doppel-m).',
      emoji: '🩹',
      hint: 'Kurzes i verlangt Doppel-m: schlimm.',
    },
    {
      id: 'exam_13',
      wordId: 'w1_beginnen',
      wordClean: 'beginnen',
      type: 'verb_in_sentence',
      prompt: 'Welche Verbform gehört in diesen Satz?',
      sentenceWithBlank: 'Sie _____ jetzt gemeinsam mit ihren Hausaufgaben.',
      options: ['beginnt', 'beginnen', 'beginne'],
      correctAnswer: 'beginnt',
      explanation: 'Sie (Einzahl) beginnt jetzt mit ihren Hausaufgaben.',
      emoji: '⏰',
      hint: 'Sie (Einzahl): sie beginnt.',
    },
    {
      id: 'exam_14',
      wordId: 'w1_bissig',
      wordClean: 'bissig',
      type: 'spelling_context',
      prompt: 'Welche Schreibweise des Adjektivs ist korrekt?',
      sentenceWithBlank: 'Der kleine Hund ist lieb und gar nicht _____.',
      options: ['bissig', 'bisig', 'bissich'],
      correctAnswer: 'bissig',
      explanation: '„bissig“ schreibt man mit Doppel-s und Endung -ig.',
      emoji: '🐕',
      hint: 'Achte auf ss und die Endung -ig.',
    },
    {
      id: 'exam_15',
      wordId: 'w1_zimmer',
      wordClean: 'Zimmer',
      type: 'grammar_choice',
      prompt: 'Welches Wort hat den Doppelkonsonanten „mm“?',
      sentenceWithBlank: 'In welchem Wort versteckt sich der Laut mm?',
      options: ['das Zimmer', 'das Schloss', 'die Wand'],
      correctAnswer: 'das Zimmer',
      explanation: '„Zimmer“ und „schwimmen“ haben Doppel-m (mm).',
      emoji: '🔍',
      hint: 'Sprich Zim-mer in zwei Silben.',
    },
    {
      id: 'exam_16',
      wordId: 'w1_kuss',
      wordClean: 'Kuss',
      type: 'grammar_choice',
      prompt: 'Welcher Begleiter (Artikel) gehört zu „Kuss“?',
      sentenceWithBlank: '_____ Kuss war sehr herzlich.',
      options: ['Der', 'Die', 'Das'],
      correctAnswer: 'Der',
      explanation: 'Es heißt: der Kuss (männlich).',
      emoji: '💋',
      hint: 'Männliches Nomen: Der Kuss.',
    },
    {
      id: 'exam_17',
      wordId: 'w1_rennen',
      wordClean: 'rennen',
      type: 'sentence_missing_word',
      prompt: 'Welches Verb passt sinnvoll in den Satz?',
      sentenceWithBlank: 'Die Kinder _____ schnell über den Sportplatz ins Ziel.',
      options: ['rennen', 'brennen', 'kennen'],
      correctAnswer: 'rennen',
      explanation: 'Über den Sportplatz laufen = rennen!',
      emoji: '🏃',
      hint: 'Wer schnell läuft, rennt!',
    },
    {
      id: 'exam_18',
      wordId: 'w1_schloss',
      wordClean: 'Schloss',
      type: 'grammar_choice',
      prompt: 'Welche Wortart ist „das Schloss“?',
      sentenceWithBlank: '„das Schloss“ hat einen Artikel (das) und wird großgeschrieben. Es ist ein...',
      options: ['Nomen', 'Verb', 'Adjektiv'],
      correctAnswer: 'Nomen',
      explanation: 'Wörter mit Begleiter (der/die/das) sind Nomen (Namenwörter).',
      emoji: '🏰',
      hint: 'Man kann "das" davor setzen -> Nomen.',
    },
    {
      id: 'exam_19',
      wordId: 'w1_satzbau',
      wordClean: 'weil',
      type: 'sentence_completion',
      prompt: 'Welches Bindewort begründet den Satz?',
      sentenceWithBlank: 'Ben lacht fröhlich, _____ er das spannende Spiel gewonnen hat.',
      options: ['weil', 'aber', 'oder'],
      correctAnswer: 'weil',
      explanation: '„weil“ nennt den Grund, warum Ben lacht.',
      emoji: '🔗',
      hint: '„weil“ erklärt den Grund.',
    },
    {
      id: 'exam_20',
      wordId: 'w1_beginnen',
      wordClean: 'beginnen',
      type: 'sentence_completion',
      prompt: 'Letzte Frage: Welcher Satz ist fehlerfrei gebaut?',
      sentenceWithBlank: 'Wähle den vollständig richtigen deutschen Satz:',
      options: [
        'Wir beginnen jetzt gemeinsam mit der Aufgabe.',
        'Wir beginnt jetzt gemeinsam mit der Aufgabe.',
        'Wir beginnen jetzt gemeinsam mit der aufgabe.',
      ],
      correctAnswer: 'Wir beginnen jetzt gemeinsam mit der Aufgabe.',
      explanation: '„Wir beginnen“ (Form auf -en) und „Aufgabe“ ist ein Nomen (groß)!',
      emoji: '🏆',
      hint: 'Achte auf „Wir beginnen“ und das große Nomen „Aufgabe“.',
    },
  ];
}
