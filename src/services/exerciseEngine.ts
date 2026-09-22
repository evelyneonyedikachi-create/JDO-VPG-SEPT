import {
  DayOfWeek,
  DifficultyLevel,
  LernwortItem,
  PracticeMistake,
  WeeklyCurriculum,
} from '../types/lernwoerter';
import {
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
  title: string;
  prompt: string;
  avatarId: 'mia' | 'ben' | 'leo' | 'sophie';
  word?: LernwortItem;
  options?: string[];
  correctAnswer: string;
  solutionExplanation?: string;
  userHint1: string;
  userHint2: string;
  missingPattern?: string;
  targetSentence?: string;
  wordBlocks?: string[];
  expandSuggestions?: string[];
  sceneId?: number;
  grammarCategory: 'Rechtschreibung' | 'Grammatik' | 'Artikel' | 'Satzbau';
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
    if (exercise.word && exercise.word.word.includes('mm') || exercise.word?.word.includes('ss') || exercise.word?.word.includes('nn')) {
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
      return `Tipp: Bei "${exercise.prompt.includes('Ich') ? 'ich' : exercise.prompt.includes('Du') ? 'du' : 'er'}" endet das Verb oft auf -e, -st oder -t!`;
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
  const subset = level === 'starter' ? words.slice(0, 5) : level === 'profi' ? words.slice(0, 9) : words;

  subset.forEach((w, idx) => {
    if (level === 'starter') {
      // 1. Picture / Emoji match
      exercises.push({
        id: `mon_pic_${w.id}_${idx}`,
        day: 'monday',
        level: 'starter',
        type: 'picture_match',
        title: 'Bild zuordnen',
        prompt: `Welches Wort passt zu diesem Bild? ${w.emoji}`,
        avatarId: 'mia',
        word: w,
        options: [w.word, ...w.distractors.slice(0, 2)].sort(() => Math.random() - 0.5),
        correctAnswer: w.word,
        solutionExplanation: `${w.emoji} steht für "${w.word}".`,
        userHint1: 'Schau dir das Bild genau an und lies die Wörter laut.',
        userHint2: `Es beginnt mit dem Buchstaben "${w.cleanWord[0]}".`,
        grammarCategory: 'Rechtschreibung',
      });

      // 2. Missing letters
      exercises.push({
        id: `mon_miss_${w.id}_${idx}`,
        day: 'monday',
        level: 'starter',
        type: 'missing_letters',
        title: 'Fehlende Buchstaben',
        prompt: `Ergänze die fehlenden Buchstaben: ${w.missingLetterPattern}`,
        avatarId: 'mia',
        word: w,
        correctAnswer: w.word,
        missingPattern: w.missingLetterPattern,
        solutionExplanation: `Richtig geschrieben heißt es: ${w.word}.`,
        userHint1: 'Achte auf die Lücken und den Doppelkonsonanten!',
        userHint2: `Das Wort heißt: ${w.word.slice(0, 3)}...`,
        grammarCategory: 'Rechtschreibung',
      });
    } else if (level === 'profi') {
      // 1. Choose correct spelling
      exercises.push({
        id: `mon_spell_${w.id}_${idx}`,
        day: 'monday',
        level: 'profi',
        type: 'spelling_choice',
        title: 'Richtige Schreibweise',
        prompt: `Wie schreibt man das Lernwort richtig?`,
        avatarId: 'mia',
        word: w,
        options: [w.word, ...w.distractors].sort(() => Math.random() - 0.5),
        correctAnswer: w.word,
        solutionExplanation: `Die richtige Schreibweise ist "${w.word}".`,
        userHint1: 'Pass genau auf Doppellaute auf (wie mm, ss oder nn)!',
        userHint2: `Der Vokal vor dem Doppellaut wird kurz gesprochen.`,
        grammarCategory: 'Rechtschreibung',
      });

      // 2. Identify Wortart: Nomen, Verb, Adjektiv
      exercises.push({
        id: `mon_wortart_${w.id}_${idx}`,
        day: 'monday',
        level: 'profi',
        type: 'wortart_choice',
        title: 'Wortart bestimmen',
        prompt: `Welche Wortart ist „${w.cleanWord}“?`,
        avatarId: 'mia',
        word: w,
        options: ['Nomen', 'Verb', 'Adjektiv'],
        correctAnswer: w.wortart,
        solutionExplanation: `„${w.cleanWord}“ ist ein ${w.wortart}.`,
        userHint1: w.wortart === 'Nomen' ? 'Man kann einen Artikel (der/die/das) davor setzen!' : w.wortart === 'Verb' ? 'Es ist ein Tu-Wort (man kann es tun)!' : 'Es ist ein Wie-Wort (wie etwas ist)!',
        userHint2: w.wortart === 'Nomen' ? 'Nomen schreibt man groß!' : 'Verben und Adjektive schreibt man im Satz klein.',
        grammarCategory: 'Grammatik',
      });
    } else {
      // Satz-Meister: Type the entire word & Article/Infinitive
      exercises.push({
        id: `mon_type_${w.id}_${idx}`,
        day: 'monday',
        level: 'meister',
        type: 'type_word',
        title: 'Lernwort tippen',
        prompt: `Tippe das Lernwort fehlerfrei ab: ${w.emoji} ${w.cleanWord}`,
        avatarId: 'mia',
        word: w,
        correctAnswer: w.word,
        solutionExplanation: `Super! "${w.word}" ist fehlerfrei getippt!`,
        userHint1: 'Denke an Groß- und Kleinschreibung sowie Doppelkonsonanten.',
        userHint2: `Es fängt an mit: "${w.word.slice(0, 4)}"`,
        grammarCategory: 'Rechtschreibung',
      });

      if (w.wortart === 'Nomen') {
        exercises.push({
          id: `mon_art_${w.id}_${idx}`,
          day: 'monday',
          level: 'meister',
          type: 'article_choice',
          title: 'Richtigen Begleiter wählen',
          prompt: `Welcher Begleiter gehört zu „${w.cleanWord}“?`,
          avatarId: 'mia',
          word: w,
          options: ['der', 'die', 'das'],
          correctAnswer: w.artikel || 'das',
          solutionExplanation: `Es heißt: ${w.artikel} ${w.cleanWord}.`,
          userHint1: 'Sprich es mit allen drei Artikeln im Kopf durch.',
          userHint2: `Der richtige Artikel lautet "${w.artikel}".`,
          grammarCategory: 'Artikel',
        });
      }
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

  // Conjugation tasks
  verbs.forEach((v, idx) => {
    // ich, du, er/sie, wir, ihr, sie
    if (v.cleanWord === 'schwimmen') {
      exercises.push({
        id: `tue_conj_${v.id}_1`,
        day: 'tuesday',
        level: 'starter',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Ich ___ im See.',
        avatarId: 'ben',
        word: v,
        options: ['schwimme', 'schwimmst', 'schwimmt'],
        correctAnswer: 'schwimme',
        solutionExplanation: 'Bei "Ich" endet das Verb auf -e: Ich schwimme.',
        userHint1: 'Achte auf das Personalpronomen "Ich".',
        userHint2: 'Ich schwimm... ? Es endet auf -e!',
        grammarCategory: 'Grammatik',
      });
      exercises.push({
        id: `tue_conj_${v.id}_2`,
        day: 'tuesday',
        level: 'profi',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Du ___ sehr gut.',
        avatarId: 'ben',
        word: v,
        options: ['schwimme', 'schwimmst', 'schwimmt'],
        correctAnswer: 'schwimmst',
        solutionExplanation: 'Bei "Du" endet das Verb auf -st: Du schwimmst.',
        userHint1: 'Bei "du" hörst du am Ende ein -st!',
        userHint2: 'Du schwimmst!',
        grammarCategory: 'Grammatik',
      });
    } else if (v.cleanWord === 'rennen') {
      exercises.push({
        id: `tue_conj_${v.id}_1`,
        day: 'tuesday',
        level: 'starter',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Du ___ schnell zum Bus.',
        avatarId: 'ben',
        word: v,
        options: ['renne', 'rennst', 'rennt'],
        correctAnswer: 'rennst',
        solutionExplanation: 'Bei "Du" heißt es: Du rennst.',
        userHint1: 'Schau auf "Du". Welche Endung passt?',
        userHint2: 'Du rennst!',
        grammarCategory: 'Grammatik',
      });
      exercises.push({
        id: `tue_conj_${v.id}_2`,
        day: 'tuesday',
        level: 'profi',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Er ___ im Park eine Runde.',
        avatarId: 'ben',
        word: v,
        options: ['renne', 'rennst', 'rennt'],
        correctAnswer: 'rennt',
        solutionExplanation: 'Bei "Er" heißt es: Er rennt.',
        userHint1: 'Er/Sie/Es bekommt meistens ein -t am Ende.',
        userHint2: 'Er rennt!',
        grammarCategory: 'Grammatik',
      });
    } else if (v.cleanWord === 'kennen') {
      exercises.push({
        id: `tue_conj_${v.id}_1`,
        day: 'tuesday',
        level: 'starter',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Wir ___ die richtige Antwort.',
        avatarId: 'ben',
        word: v,
        options: ['kennt', 'kennen', 'kennst'],
        correctAnswer: 'kennen',
        solutionExplanation: 'Bei "Wir" bleibt oft die Grundform: Wir kennen.',
        userHint1: 'Bei "Wir" endet das Verb fast immer auf -en.',
        userHint2: 'Wir kennen!',
        grammarCategory: 'Grammatik',
      });
      exercises.push({
        id: `tue_conj_${v.id}_2`,
        day: 'tuesday',
        level: 'meister',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Ihr ___ das alte Schloss.',
        avatarId: 'ben',
        word: v,
        options: ['kennt', 'kennen', 'kennst'],
        correctAnswer: 'kennt',
        solutionExplanation: 'Bei "Ihr" heißt es: Ihr kennt.',
        userHint1: 'Was passt zu "Ihr"? Ihr rennt, ihr schwimmt, ihr ...?',
        userHint2: 'Ihr kennt!',
        grammarCategory: 'Grammatik',
      });
    } else if (v.cleanWord === 'passen') {
      exercises.push({
        id: `tue_conj_${v.id}_1`,
        day: 'tuesday',
        level: 'starter',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Die neue Hose ___ ihr gut.',
        avatarId: 'ben',
        word: v,
        options: ['passt', 'passe', 'passen'],
        correctAnswer: 'passt',
        solutionExplanation: 'Die neue Hose (sie) passt ihr gut.',
        userHint1: 'Einzahl: Die Hose passt.',
        userHint2: 'Die Hose passt!',
        grammarCategory: 'Grammatik',
      });
      exercises.push({
        id: `tue_conj_${v.id}_2`,
        day: 'tuesday',
        level: 'profi',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Wir ___ gut zusammen.',
        avatarId: 'ben',
        word: v,
        options: ['passen', 'passt', 'passe'],
        correctAnswer: 'passen',
        solutionExplanation: 'Bei "Wir" heißt es: Wir passen.',
        userHint1: 'Bei "Wir" bleibt das Verb in der Grundform (-en).',
        userHint2: 'Wir passen!',
        grammarCategory: 'Grammatik',
      });
    } else if (v.cleanWord === 'beginnen') {
      exercises.push({
        id: `tue_conj_${v.id}_1`,
        day: 'tuesday',
        level: 'starter',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Sie ___ jetzt mit ihren Hausaufgaben.',
        avatarId: 'ben',
        word: v,
        options: ['beginnt', 'beginne', 'beginnen'],
        correctAnswer: 'beginnt',
        solutionExplanation: 'Sie (Einzahl) beginnt jetzt mit ihren Hausaufgaben.',
        userHint1: 'Achte auf Einzahl: Sie beginnt.',
        userHint2: 'Sie beginnt!',
        grammarCategory: 'Grammatik',
      });
      exercises.push({
        id: `tue_conj_${v.id}_2`,
        day: 'tuesday',
        level: 'profi',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Wir ___ jetzt gemeinsam mit der Aufgabe.',
        avatarId: 'ben',
        word: v,
        options: ['beginnen', 'beginnt', 'beginne'],
        correctAnswer: 'beginnen',
        solutionExplanation: 'Bei "Wir" heißt es: Wir beginnen jetzt gemeinsam mit der Aufgabe.',
        userHint1: 'Bei "Wir" bleibt die Form auf -en.',
        userHint2: 'Wir beginnen!',
        grammarCategory: 'Grammatik',
      });
    } else if (v.cleanWord === 'brennen') {
      exercises.push({
        id: `tue_conj_${v.id}_1`,
        day: 'tuesday',
        level: 'starter',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Das Holz ___ hell im Kamin.',
        avatarId: 'ben',
        word: v,
        options: ['brennt', 'brenne', 'brennst'],
        correctAnswer: 'brennt',
        solutionExplanation: 'Das Holz (es) brennt hell im Kamin.',
        userHint1: 'Achte auf die Einzahl: Das Holz brennt.',
        userHint2: 'Das Holz brennt!',
        grammarCategory: 'Grammatik',
      });
      exercises.push({
        id: `tue_conj_${v.id}_2`,
        day: 'tuesday',
        level: 'meister',
        type: 'verb_conjugation',
        title: 'Verbform anpassen',
        prompt: 'Die Kerzen ___ hell auf dem Tisch.',
        avatarId: 'ben',
        word: v,
        options: ['brennen', 'brennt', 'brennst'],
        correctAnswer: 'brennen',
        solutionExplanation: 'Die Kerzen (Mehrzahl) brennen hell auf dem Tisch.',
        userHint1: 'Achte auf die Mehrzahl: Viele Kerzen brennen.',
        userHint2: 'Die Kerzen brennen!',
        grammarCategory: 'Grammatik',
      });
    }
  });

  // Nouns plural / articles
  nouns.forEach((n, idx) => {
    if (n.plural) {
      exercises.push({
        id: `tue_noun_pl_${n.id}_${idx}`,
        day: 'tuesday',
        level: level,
        type: 'plural_choice',
        title: 'Einzahl und Mehrzahl',
        prompt: `Was ist die Mehrzahl von „${n.word}“?`,
        avatarId: 'ben',
        word: n,
        options: [n.plural, `die ${n.cleanWord}e`, `die ${n.cleanWord}en`, `die ${n.cleanWord}s`].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).sort(() => Math.random() - 0.5),
        correctAnswer: n.plural,
        solutionExplanation: `Einzahl: ${n.word} → Mehrzahl: ${n.plural}.`,
        userHint1: 'Denke an mehrere: Ein Schloss, zwei ...?',
        userHint2: `Es heißt: ${n.plural}.`,
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
      prompt: a.cleanWord === 'bissig'
        ? 'Pass auf vor dem ___ Hund!'
        : a.cleanWord === 'dünn'
        ? 'Er schneidet eine ___ Scheibe Brot.'
        : 'Die Verletzung ist zum Glück nicht so ___.',
      avatarId: 'ben',
      word: a,
      options: a.cleanWord === 'bissig'
        ? ['bissigen', 'bissiger', 'bissige']
        : a.cleanWord === 'dünn'
        ? ['dünne', 'dünnen', 'dünnes']
        : ['schlimm', 'schlimme', 'schlimmer'],
      correctAnswer: a.cleanWord === 'bissig' ? 'bissigen' : a.cleanWord === 'dünn' ? 'dünne' : 'schlimm',
      solutionExplanation: `Im Satz lautet die passende Form: ${a.cleanWord === 'bissig' ? 'bissigen' : a.cleanWord === 'dünn' ? 'dünne' : 'schlimm'}.`,
      userHint1: 'Sprich den Satz laut und wähle die Form, die flüssig klingt.',
      userHint2: `Achte auf den Fall und den Begleiter davor.`,
      grammarCategory: 'Grammatik',
    });
  });

  return exercises.filter((e) => e.level === level);
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
    title: level === 'starter' ? 'Satz bauen (3-4 Wörter)' : level === 'profi' ? 'Satz bauen (5-6 Wörter)' : 'Satz mit Bindewort bauen',
    prompt: 'Bringe die Wort-Blöcke in die richtige Reihenfolge:',
    avatarId: 'leo',
    correctAnswer: b.targetSentence,
    solutionExplanation: `Klasse gebaut! Der richtige Satz lautet: "${b.targetSentence}"`,
    userHint1: b.hint,
    userHint2: `Der Satz beginnt mit: "${b.targetSentence.split(' ')[0]}".`,
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

  THURSDAY_SATZ_PROFI_EXERCISES.forEach((ex, idx) => {
    if (level === 'starter') {
      exercises.push({
        id: `${ex.id}_starter`,
        day: 'thursday',
        level: 'starter',
        type: 'sentence_expand',
        title: 'Satz schreiben',
        prompt: `Schreibe einen vollständigen Satz mit dem Lernwort „${ex.word}“:`,
        avatarId: 'sophie',
        correctAnswer: ex.baseExample,
        solutionExplanation: `Beispiel: "${ex.baseExample}"`,
        userHint1: 'Denke an Subjekt (wer?), Verb (tut was?) und Großschreibung am Anfang.',
        userHint2: `Ein guter Satz wäre: "${ex.baseExample}"`,
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
        prompt: `Mach den Satz „${ex.baseExample}“ spannender und länger! Nutze Vorschläge:`,
        avatarId: 'sophie',
        correctAnswer: ex.longExample,
        solutionExplanation: `Toller langer Satz: "${ex.longExample}"`,
        userHint1: 'Füge Zeit ("heute") oder Ort ("im Schwimmbad") hinzu!',
        userHint2: `Nutze die Wortbausteine: ${ex.expandSuggestions.join(', ')}.`,
        expandSuggestions: ex.expandSuggestions,
        grammarCategory: 'Satzbau',
      });
    } else {
      // Satz-Meister: Link two ideas with und / aber / weil
      if (ex.linkedTask) {
        exercises.push({
          id: `${ex.id}_meister`,
          day: 'thursday',
          level: 'meister',
          type: 'sentence_linking',
          title: 'Zwei Sätze verbinden',
          prompt: `Verbinde diese zwei Sätze sinnvoll mit „${ex.linkedTask.options.join(' / ')}“:\n1. ${ex.linkedTask.firstSentence}\n2. ${ex.linkedTask.secondSentence}`,
          avatarId: 'sophie',
          options: ex.linkedTask.options,
          correctAnswer: ex.linkedTask.correctConnector,
          solutionExplanation: `Richtig! ${ex.linkedTask.combinedSentence}`,
          userHint1: 'Welches Bindewort passt am besten? "und" reiht an, "aber" zeigt einen Gegensatz, "weil" erklärt den Grund!',
          userHint2: `Hier passt am besten: "${ex.linkedTask.correctConnector}".`,
          grammarCategory: 'Satzbau',
        });
      }
    }
  });

  return exercises;
}
