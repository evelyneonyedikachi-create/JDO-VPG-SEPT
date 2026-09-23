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

  words.forEach((w, idx) => {
    // 1. Picture / Emoji match (Visual & Word Association)
    exercises.push({
      id: `mon_pic_${w.id}_${idx}`,
      day: 'monday',
      level,
      type: 'picture_match',
      title: 'Bild zuordnen',
      prompt: 'Welches Wort passt zu diesem Bild?',
      avatarId: 'mia',
      word: w,
      options: [w.word, ...w.distractors.slice(0, level === 'starter' ? 2 : 3)].sort(() => Math.random() - 0.5),
      correctAnswer: w.word,
      solutionExplanation: `${w.emoji} steht für „${w.word}“.`,
      userHint1: 'Schau dir das Bild genau an und lies die Auswahlwörter.',
      userHint2: `Es beginnt mit dem Buchstaben „${w.cleanWord[0]}“.`,
      grammarCategory: 'Rechtschreibung',
    });

    // 2. Missing letters (Phoneme & Spelling discrimination)
    exercises.push({
      id: `mon_miss_${w.id}_${idx}`,
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
      id: `mon_spell_${w.id}_${idx}`,
      day: 'monday',
      level,
      type: 'spelling_choice',
      title: 'Richtige Schreibweise',
      prompt: 'Welche Schreibweise ist richtig?',
      avatarId: 'mia',
      word: w,
      options: [w.word, ...w.distractors].sort(() => Math.random() - 0.5),
      correctAnswer: w.word,
      solutionExplanation: `Die richtige Schreibweise ist „${w.word}“.`,
      userHint1: 'Pass genau auf Doppellaute auf (wie mm, ss oder nn)!',
      userHint2: 'Der Vokal vor dem Doppellaut wird kurz gesprochen.',
      grammarCategory: 'Rechtschreibung',
    });

    // 4. Identify Wortart: Nomen, Verb, Adjektiv
    exercises.push({
      id: `mon_wortart_${w.id}_${idx}`,
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
        id: `mon_art_${w.id}_${idx}`,
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
        id: `mon_type_${w.id}_${idx}`,
        day: 'monday',
        level,
        type: 'type_word',
        title: 'Lernwort tippen',
        prompt: 'Schau dir das Bild an. Tippe das gesuchte Wort fehlerfrei:',
        avatarId: 'mia',
        word: w,
        correctAnswer: w.word,
        solutionExplanation: `Super! „${w.word}“ ist fehlerfrei getippt!`,
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

  // Conjugation tasks with non-spoiler hints
  verbs.forEach((v) => {
    // Task 1: "Ich" or "Du"
    exercises.push({
      id: `tue_conj_${v.id}_1`,
      day: 'tuesday',
      level: 'starter',
      type: 'verb_conjugation',
      title: 'Verbform anpassen',
      prompt: 'Welche Verbform passt in den Satz?',
      contextSentence: v.cleanWord === 'schwimmen'
        ? 'Du ___ heute im See.'
        : v.cleanWord === 'rennen'
        ? 'Du ___ schnell zum Bus.'
        : v.cleanWord === 'passen'
        ? 'Die neue Hose ___ ihr gut.'
        : `Du ___ heute gerne.`,
      avatarId: 'ben',
      word: v,
      options: v.cleanWord === 'schwimmen'
        ? ['schwimmst', 'schwimme', 'schwimmt']
        : v.cleanWord === 'rennen'
        ? ['rennst', 'renne', 'rennt']
        : v.cleanWord === 'passen'
        ? ['passt', 'passe', 'passen']
        : [`${v.cleanWord.slice(0, -2)}st`, `${v.cleanWord.slice(0, -2)}e`, `${v.cleanWord.slice(0, -2)}t`],
      correctAnswer: v.cleanWord === 'passen' ? 'passt' : `${v.cleanWord.slice(0, -2)}st`,
      solutionExplanation: `Sehr gut erkannt! Die passende Verbform für diesen Satz wurde gewählt.`,
      userHint1: 'Achte auf das Pronomen (wer handelt?). Bei „du“ endet das Verb im Präsens meist auf -st (wie bei: du hörst, du spielst).',
      userHint2: 'Denke an die Personalendungen: ich -e, du -st, er/sie/es -t. Welche Endung passt hier?',
      grammarCategory: 'Grammatik',
    });

    // Task 2: "Er/Sie/Es" or "Wir"
    exercises.push({
      id: `tue_conj_${v.id}_2`,
      day: 'tuesday',
      level: 'profi',
      type: 'verb_conjugation',
      title: 'Verbform anpassen',
      prompt: 'Welche Verbform passt in den Satz?',
      contextSentence: v.cleanWord === 'schwimmen'
        ? 'Er ___ gerne eine Runde.'
        : v.cleanWord === 'rennen'
        ? 'Er ___ um die Wette.'
        : v.cleanWord === 'passen'
        ? 'Wir ___ gut zusammen.'
        : `Er ___ jeden Tag.`,
      avatarId: 'ben',
      word: v,
      options: v.cleanWord === 'passen'
        ? ['passen', 'passt', 'passe']
        : [`${v.cleanWord.slice(0, -2)}t`, `${v.cleanWord.slice(0, -2)}st`, v.cleanWord],
      correctAnswer: v.cleanWord === 'passen' ? 'passen' : `${v.cleanWord.slice(0, -2)}t`,
      solutionExplanation: `Klasse! Das Verb wurde grammatikalisch korrekt gebeugt.`,
      userHint1: v.cleanWord === 'passen'
        ? 'Bei „wir“ (Mehrzahl) bleibt das Verb in der Grundform auf -en (wie bei: wir lernen, wir spielen).'
        : 'Bei „er/sie/es“ endet das Verb in der Gegenwart meistens auf -t (wie bei: er lacht, er wohnt).',
      userHint2: 'Schau genau auf das Subjekt des Satzes und wähle die passende Verb-Endung.',
      grammarCategory: 'Grammatik',
    });
  });

  // Nouns plural with non-answer hint box!
  nouns.forEach((n, idx) => {
    if (n.plural) {
      exercises.push({
        id: `tue_noun_pl_${n.id}_${idx}`,
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
          .slice(0, 3)
          .sort(() => Math.random() - 0.5),
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
  adjs.forEach((a, idx) => {
    exercises.push({
      id: `tue_adj_${a.id}_${idx}`,
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
    id: b.id,
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
        id: `${ex.id}_starter`,
        day: 'thursday',
        level: 'starter',
        type: 'sentence_expand',
        title: 'Satz schreiben',
        prompt: 'Schreibe einen vollständigen Satz mit dem Lernwort:',
        contextSentence: `Lernwort: „${ex.word}“`,
        avatarId: 'sophie',
        correctAnswer: ex.baseExample,
        solutionExplanation: `Beispiel: „${ex.baseExample}“`,
        userHint1: 'Denke an Subjekt (wer?), Verb (tut was?) und Großschreibung am Anfang.',
        userHint2: 'Formuliere nach dem Muster: „Wer tut was mit dem Lernwort?“',
        expandSuggestions: ex.expandSuggestions,
        grammarCategory: 'Satzbau',
      });
    } else if (level === 'profi') {
      exercises.push({
        id: `${ex.id}_profi`,
        day: 'thursday',
        level: 'profi',
        type: 'sentence_expand',
        title: 'Satz länger machen',
        prompt: 'Mach den Satz spannender und länger! Nutze Vorschläge:',
        contextSentence: `Ausgangssatz: „${ex.baseExample}“`,
        avatarId: 'sophie',
        correctAnswer: ex.longExample,
        solutionExplanation: `Toller langer Satz: „${ex.longExample}“`,
        userHint1: 'Füge Zeit („heute“) oder Ort („im Schwimmbad“) hinzu!',
        userHint2: 'Nutze die Wörter aus der Ideen-Box, um den Satz mit Details anzureichern.',
        expandSuggestions: ex.expandSuggestions,
        grammarCategory: 'Satzbau',
      });
    }

    // Sentence-linking tasks (available across levels if linkedTask exists)
    if (ex.linkedTask) {
      exercises.push({
        id: `${ex.id}_linking_${level}`,
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

  targetWords.forEach((w, idx) => {
    // 1. Missing letters reinforcement
    exercises.push({
      id: `reinf_miss_${w.id}_${idx}`,
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
      id: `reinf_sent_${w.id}_${idx}`,
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
    grammarCategory: 'Satzbau',
  };
}

/**
 * MASTER DAILY EXERCISE PLAN GENERATOR
 * - Strictly guarantees MAXIMUM 5 exercises per day for the recommended plan.
 * - Progressive cognitive demand across the week:
 *   * Monday: Recognition & Spelling (Recall / Foundation)
 *   * Tuesday: Morphology & Grammar rules (Rule application)
 *   * Wednesday: Syntax & Sentence building (Structural synthesis)
 *   * Thursday: Sentence expansion & clause connectors (Creative transfer)
 *   * Friday: Evaluative review & story narrative (Integration & review)
 *   * Saturday: Championship, story assembly & mastery (Synthesis)
 * - NEVER repeats the same word within any single 5-task daily session.
 * - Balanced word coverage: all 10 words practiced across the active week.
 * - Adaptive weak-word injection strictly respects the 5-task cap and never injects a duplicate word.
 */
export function generateDailyExercisePlan(params: {
  day: DayOfWeek;
  words: LernwortItem[];
  level: DifficultyLevel;
  weakWords?: string[];
  mistakes?: PracticeMistake[];
  skippedCount?: number;
}): DailyExercisePlan {
  const { day, words, level, weakWords = [], mistakes = [], skippedCount = 0 } = params;

  // 1. Build rich base pools for each domain
  const monTasks = generateMondayExercises(words, level);
  const tueTasks = generateTuesdayExercises(words, level);
  const wedTasks = generateWednesdayExercises(level);
  const thuTasks = generateThursdayExercises(level);

  // Helper to pick a task for a specific word
  const findTaskForWord = (
    pool: GeneratedExercise[],
    type: GeneratedExercise['type'],
    wordClean: string
  ): GeneratedExercise | undefined => {
    return pool.find(
      (e) => e.type === type && e.word?.cleanWord?.toLowerCase() === wordClean.toLowerCase()
    );
  };

  // Divide words across days for balanced weekly coverage (Group 1 vs Group 2)
  // words: 0: Zimmer, 1: schwimmen, 2: Messer, 3: Kuss, 4: rennen, 5: Schloss, 6: Nummer, 7: passen, 8: beginnen, 9: bissig
  const w = words;
  const wordAt = (idx: number) => w[idx % w.length];

  let todayFive: GeneratedExercise[] = [];

  if (day === 'monday') {
    // MONDAY: Recognition, Spelling & Vocabulary Foundation
    // Cognitive load: Recall / Orthographic discrimination
    // 5 DISTINCT WORDS (e.g. Zimmer, schwimmen, Messer, Kuss, rennen)
    const task1 =
      findTaskForWord(monTasks, 'picture_match', wordAt(0).cleanWord) ||
      monTasks.find((t) => t.type === 'picture_match') ||
      monTasks[0];

    const task2 =
      findTaskForWord(monTasks, 'missing_letters', wordAt(1).cleanWord) ||
      monTasks.find((t) => t.type === 'missing_letters' && t.word?.cleanWord !== task1?.word?.cleanWord) ||
      monTasks[1];

    const task3 =
      findTaskForWord(monTasks, 'spelling_choice', wordAt(2).cleanWord) ||
      monTasks.find(
        (t) =>
          t.type === 'spelling_choice' &&
          t.word?.cleanWord !== task1?.word?.cleanWord &&
          t.word?.cleanWord !== task2?.word?.cleanWord
      ) ||
      monTasks[2];

    const task4 =
      findTaskForWord(monTasks, 'wortart_choice', wordAt(3).cleanWord) ||
      monTasks.find(
        (t) =>
          t.type === 'wortart_choice' &&
          t.word?.cleanWord !== task1?.word?.cleanWord &&
          t.word?.cleanWord !== task2?.word?.cleanWord &&
          t.word?.cleanWord !== task3?.word?.cleanWord
      ) ||
      monTasks[3];

    const task5 =
      findTaskForWord(monTasks, 'article_choice', wordAt(4).cleanWord) ||
      findTaskForWord(monTasks, 'type_word', wordAt(4).cleanWord) ||
      monTasks.find(
        (t) =>
          t.word?.cleanWord !== task1?.word?.cleanWord &&
          t.word?.cleanWord !== task2?.word?.cleanWord &&
          t.word?.cleanWord !== task3?.word?.cleanWord &&
          t.word?.cleanWord !== task4?.word?.cleanWord
      ) ||
      monTasks[4];

    todayFive = [task1, task2, task3, task4, task5].filter(Boolean);
  } else if (day === 'tuesday') {
    // TUESDAY: Morphology & Grammar (Verb conjugation, Noun plurals, Adjective declension)
    // Cognitive load: Rule application & inflection
    // 5 DISTINCT WORDS (e.g. schwimmen, Zimmer, rennen, Messer, bissig)
    const verbList = tueTasks.filter((t) => t.type === 'verb_conjugation');
    const pluralList = tueTasks.filter((t) => t.type === 'plural_choice');
    const adjList = tueTasks.filter((t) => t.type === 'adjective_form');

    const task1 = verbList[0] || tueTasks[0];
    const task2 =
      pluralList.find((p) => p.word?.cleanWord !== task1?.word?.cleanWord) || pluralList[0] || tueTasks[1];
    const task3 =
      verbList.find(
        (v) => v.word?.cleanWord !== task1?.word?.cleanWord && v.word?.cleanWord !== task2?.word?.cleanWord
      ) || verbList[1] || tueTasks[2];
    const task4 =
      pluralList.find(
        (p) =>
          p.word?.cleanWord !== task1?.word?.cleanWord &&
          p.word?.cleanWord !== task2?.word?.cleanWord &&
          p.word?.cleanWord !== task3?.word?.cleanWord
      ) || pluralList[1] || tueTasks[3];
    const task5 =
      adjList[0] ||
      pluralList.find(
        (p) =>
          p.word?.cleanWord !== task1?.word?.cleanWord &&
          p.word?.cleanWord !== task2?.word?.cleanWord &&
          p.word?.cleanWord !== task3?.word?.cleanWord &&
          p.word?.cleanWord !== task4?.word?.cleanWord
      ) ||
      verbList[2] ||
      tueTasks[4];

    todayFive = [task1, task2, task3, task4, task5].filter(Boolean);
  } else if (day === 'wednesday') {
    // WEDNESDAY: Syntax & Sentence Building (Leo - Satz-Baumeister)
    // Cognitive load: Structural synthesis (Word blocks, clause order, Scene 1)
    const sentenceBuilders = wedTasks.filter((t) => t.type === 'sentence_builder');
    const sentenceLinks = thuTasks.filter((t) => t.type === 'sentence_linking');
    const verbConj = tueTasks.filter((t) => t.type === 'verb_conjugation');

    const task1 = sentenceBuilders[0] || wedTasks[0];
    const task2 = sentenceBuilders[1] || sentenceBuilders[0];
    const task3 = verbConj[0] || tueTasks[0];
    const task4 = sentenceLinks[0] || sentenceBuilders[2] || wedTasks[2];
    const task5 = createBildgeschichteDailyExercise(1, 'wednesday', level);

    todayFive = [task1, task2, task3, task4, task5].filter(Boolean);
  } else if (day === 'thursday') {
    // THURSDAY: Expressive Sentence Expansion & Connectors (Sophie - Geschichten-Profi)
    // Cognitive load: Creative transfer & complex clauses
    const sentenceExpands = thuTasks.filter((t) => t.type === 'sentence_expand');
    const sentenceLinks = thuTasks.filter((t) => t.type === 'sentence_linking');
    const verbConj = tueTasks.filter((t) => t.type === 'verb_conjugation');
    const pluralChoices = tueTasks.filter((t) => t.type === 'plural_choice');

    const task1 = sentenceExpands[0] || thuTasks[0];
    const task2 = sentenceLinks[0] || sentenceExpands[1] || thuTasks[1];
    const task3 =
      verbConj.find((v) => v.word?.cleanWord !== task1?.word?.cleanWord) ||
      sentenceLinks[1] ||
      sentenceExpands[2] ||
      verbConj[1] ||
      tueTasks[0];
    const task4 =
      pluralChoices.find(
        (p) => p.word?.cleanWord !== task1?.word?.cleanWord && p.word?.cleanWord !== task3?.word?.cleanWord
      ) || pluralChoices[0] || tueTasks[1];
    const task5 = createBildgeschichteDailyExercise(2, 'thursday', level);

    todayFive = [task1, task2, task3, task4, task5].filter(Boolean);
  } else if (day === 'friday') {
    // FRIDAY: Integrated Review, Error Discrimination & Story Climax (Sophie & Mia)
    // Cognitive load: Integration, error spotting & narrative progression
    const spellingChoices = monTasks.filter((t) => t.type === 'spelling_choice');
    const missingLetters = monTasks.filter((t) => t.type === 'missing_letters');
    const verbConj = tueTasks.filter((t) => t.type === 'verb_conjugation');
    const sentenceBuilders = wedTasks.filter((t) => t.type === 'sentence_builder');

    // Pick 5 distinct learning words across the tasks
    const task1 = spellingChoices[spellingChoices.length - 1] || monTasks[0];
    const task2 =
      missingLetters.find((m) => m.word?.cleanWord !== task1?.word?.cleanWord) ||
      missingLetters[0] ||
      monTasks[1];
    const task3 =
      verbConj.find(
        (v) => v.word?.cleanWord !== task1?.word?.cleanWord && v.word?.cleanWord !== task2?.word?.cleanWord
      ) || verbConj[0] || tueTasks[0];
    const task4 = sentenceBuilders[sentenceBuilders.length - 1] || wedTasks[0];
    const task5 = createBildgeschichteDailyExercise(4, 'friday', level);

    todayFive = [task1, task2, task3, task4, task5].filter(Boolean);
  } else {
    // SATURDAY: Championship & Master Story Assembly (Samstags-Challenge)
    // Cognitive load: Autonomous synthesis & mastery
    const sentenceBuilders = wedTasks.filter((t) => t.type === 'sentence_builder');
    const sentenceLinks = thuTasks.filter((t) => t.type === 'sentence_linking');
    const spellingChoices = monTasks.filter((t) => t.type === 'spelling_choice');
    const pluralChoices = tueTasks.filter((t) => t.type === 'plural_choice');

    const task1 = sentenceBuilders[sentenceBuilders.length - 1] || sentenceBuilders[0];
    const task2 =
      sentenceLinks[0] ||
      sentenceBuilders[1] ||
      wedTasks[1] ||
      thuTasks[0];
    const task3 = pluralChoices[pluralChoices.length - 1] || tueTasks[0];
    const task4 =
      spellingChoices.find((s) => s.word?.cleanWord !== task3?.word?.cleanWord) ||
      spellingChoices[0] ||
      monTasks[0];
    const task5 = createBildgeschichteDailyExercise(6, 'saturday', level);

    // If JD has accumulated skipped tasks, automatically scale down the Master-Challenge
    // so total workload does not overwhelm him.
    if (skippedCount > 0) {
      if (skippedCount === 1) {
        // 4 challenge tasks + 1 catch-up = 5 total
        todayFive = [task1, task2, task3, task5].filter(Boolean);
      } else if (skippedCount === 2) {
        // 3 challenge tasks + 2 catch-up = 5 total
        todayFive = [task1, task2, task5].filter(Boolean);
      } else {
        // 3+ catch-up tasks: preserve core sentence synthesis & crowning Bildgeschichte (2 tasks)
        todayFive = [task1, task5].filter(Boolean);
      }
    } else {
      todayFive = [task1, task2, task3, task4, task5].filter(Boolean);
    }
  }

  // ADAPTIVE INJECTION (Strictly capping at 5, and NEVER duplicating a word in today's session):
  if (weakWords.length > 0 && todayFive.length === 5) {
    // 1. Identify which words are already practiced in today's session
    const featuredWordSet = new Set(
      todayFive.map((e) => e.word?.cleanWord?.toLowerCase()).filter(Boolean)
    );

    // 2. Find the first weak word that is NOT already in today's tasks
    const unpracticedWeakWord = weakWords.find(
      (ww) => !featuredWordSet.has(ww.toLowerCase())
    );

    // 3. Inject only if there is an unpracticed weak word, preventing duplicate spam
    if (unpracticedWeakWord) {
      const targetWordObj = words.find(
        (w) =>
          w.cleanWord.toLowerCase() === unpracticedWeakWord.toLowerCase() ||
          w.word.toLowerCase() === unpracticedWeakWord.toLowerCase()
      );

      if (targetWordObj) {
        const adaptiveTask: GeneratedExercise = {
          id: `adaptive_weak_${targetWordObj.id}_${Date.now()}`,
          day,
          level,
          type: 'missing_letters',
          title: `Schwerpunkt üben · ${targetWordObj.cleanWord}`,
          prompt: 'Ergänze die fehlenden Buchstaben.',
          contextSentence: targetWordObj.missingLetterPattern,
          avatarId: day === 'monday' ? 'mia' : day === 'tuesday' ? 'ben' : 'sophie',
          word: targetWordObj,
          correctAnswer: targetWordObj.word,
          missingPattern: targetWordObj.missingLetterPattern,
          solutionExplanation: `Sehr gut geübt! Richtig heißt es: „${targetWordObj.word}“.`,
          userHint1: 'Achte auf den Vokal vor dem Doppelkonsonanten (wie mm, ss oder nn)!',
          userHint2: 'Klopfe die Silben rhythmisch mit den Händen.',
          grammarCategory: 'Rechtschreibung',
        };
        // Replace a non-Bildgeschichte task so Bildgeschichte is never dropped
        const replaceIdx = todayFive.findIndex(
          (t, idx) => idx > 0 && t.type !== 'bildgeschichte_step'
        );
        if (replaceIdx !== -1) {
          todayFive[replaceIdx] = adaptiveTask;
        } else {
          todayFive[0] = adaptiveTask;
        }
      }
    }
  }

  // Ensure strict cap: maximum 5 exercises per day!
  const finalHeuteEmpfohlen = todayFive.slice(0, 5);

  // Compile remaining pool for "Noch offen" (excluding the 5 recommended tasks)
  const usedIds = new Set(finalHeuteEmpfohlen.map((e) => e.id));
  const fullWeeklyPool = [
    ...monTasks,
    ...tueTasks,
    ...wedTasks,
    ...thuTasks,
  ];
  const nochOffen = fullWeeklyPool.filter((e) => !usedIds.has(e.id)).slice(0, 15);

  // Adaptive extra tasks
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
