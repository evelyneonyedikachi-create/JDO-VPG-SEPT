import { Artikel, LernwortItem, PracticeSentence, Wortart } from '../types/lernwoerter';
import { CuratedWordEntry } from '../data/curatedSentenceBanks';

export interface LinguisticProfile {
  cleanWord: string;
  wordWithArticle: string;
  wortart: Wortart;
  artikel?: Artikel;
  plural?: string;
  infinitive?: string;
  emoji: string;
  primaryExampleSentence: string;
  alternateExampleSentences: string[];
  distractors: string[];
  missingLetterPattern: string;
  conjugationBank?: Array<{
    pronounOrSubject: string;
    sentenceWithBlank: string;
    correctForm: string;
    options: string[];
    explanation: string;
  }>;
  adjectiveBank?: Array<{
    sentenceWithBlank: string;
    correctForm: string;
    options: string[];
    explanation: string;
  }>;
  connectorExercises: Array<{
    firstClause: string;
    secondClause: string;
    correctConnector: 'weil' | 'aber' | 'und';
    options: ('weil' | 'aber' | 'und')[];
    combinedSentence: string;
    connectorType: 'causal' | 'contrast' | 'addition';
    explanation: string;
    hint: string;
  }>;
  practiceSentences: PracticeSentence[];
  validationStatus: 'approved' | 'needs_review' | 'rejected';
  validationIssues: string[];
}

/**
 * High-quality curated linguistic database for common primary school vocabulary.
 * Explicitly includes the required entries and common 4th-grade words.
 */
export const CURATED_VOCABULARY_REGISTRY: Record<string, Partial<LinguisticProfile>> = {
  // Required word: das Schiff
  Schiff: {
    cleanWord: 'Schiff',
    wordWithArticle: 'das Schiff',
    wortart: 'Nomen',
    artikel: 'das',
    plural: 'die Schiffe',
    emoji: '🚢',
    primaryExampleSentence: 'Das Schiff fährt über das Meer.',
    alternateExampleSentences: [
      'Im Hafen liegt ein großes Schiff vor Anker.',
      'Das Schiff trotzt den hohen Wellen auf dem Wasser.',
    ],
    distractors: ['das Schif', 'der Schiff', 'die Schiff'],
    missingLetterPattern: 'das Sch_ff',
    connectorExercises: [
      {
        firstClause: 'Das Schiff fährt heute besonders vorsichtig',
        secondClause: 'der Nebel auf dem Meer ist sehr dicht.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Das Schiff fährt heute besonders vorsichtig, weil der Nebel auf dem Meer sehr dicht ist.',
        connectorType: 'causal',
        explanation: '„weil“ begründet, warum das Schiff vorsichtig fährt.',
        hint: 'Frage: Warum fährt das Schiff vorsichtig? Wähle das Begründungswort.',
      },
    ],
    practiceSentences: [
      { pronoun: 'ich', text: 'Ich beobachte das weiße Schiff im Hafen.' },
      { pronoun: 'du', text: 'Du fährst gern mit dem großen Schiff.' },
      { pronoun: 'er', text: 'Er winkt den Passagieren auf dem Schiff zu.' },
      { pronoun: 'wir', text: 'Wir reisen mit dem Schiff über das Meer.' },
      { pronoun: 'ihr', text: 'Ihr seht das Schiff am Horizont fahren.' },
      { pronoun: 'sie', text: 'Sie steuert das Schiff sicher durch die Wellen.' },
    ],
    validationStatus: 'approved',
    validationIssues: [],
  },

  // Required word: billig (MUST be Adjektiv, NEVER Verb!)
  billig: {
    cleanWord: 'billig',
    wordWithArticle: 'billig',
    wortart: 'Adjektiv',
    emoji: '🏷️',
    primaryExampleSentence: 'Das Heft ist billig.',
    alternateExampleSentences: [
      'Im Supermarkt sind die roten Äpfel heute billig.',
      'Ein billiges Spielzeug geht manchmal schneller kaputt.',
    ],
    distractors: ['bilig', 'billich', 'billige'],
    missingLetterPattern: 'b_ll_g',
    adjectiveBank: [
      {
        sentenceWithBlank: 'Das neue Schreibheft ist wirklich ___ .',
        correctForm: 'billig',
        options: ['billig', 'billige', 'billigen'],
        explanation: 'Nach „ist“ steht das Adjektiv in seiner Grundform „billig“.',
      },
      {
        sentenceWithBlank: 'Er kauft ein ___ Spielzeug auf dem Flohmarkt.',
        correctForm: 'billiges',
        options: ['billiges', 'billig', 'billiger'],
        explanation: 'Vor einem sächlichen Nomen (das Spielzeug) heißt es: ein billiges Spielzeug.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Das neue Heft war ziemlich billig',
        secondClause: 'die Seiten sind trotzdem von guter Qualität.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Das neue Heft war ziemlich billig, aber die Seiten sind trotzdem von guter Qualität.',
        connectorType: 'contrast',
        explanation: '„aber“ drückt einen Gegensatz zur günstigen Eigenschaft aus.',
        hint: 'Achte auf den Gegensatz: Es war günstig, jedoch trotzdem gut.',
      },
    ],
    practiceSentences: [
      { pronoun: 'ich', text: 'Ich kaufe das Heft, weil es billig ist.' },
      { pronoun: 'du', text: 'Du findest diesen Stift erstaunlich billig.' },
      { pronoun: 'er', text: 'Er bezahlt für das Buch einen billigen Preis.' },
      { pronoun: 'wir', text: 'Wir freuen uns über den billigen Einkauf.' },
      { pronoun: 'ihr', text: 'Ihr findet die Schreibblöcke sehr billig.' },
      { pronoun: 'sie', text: 'Sie wählt die billige Packung Buntstifte.' },
    ],
    validationStatus: 'approved',
    validationIssues: [],
  },

  // Required word: das Wetter
  Wetter: {
    cleanWord: 'Wetter',
    wordWithArticle: 'das Wetter',
    wortart: 'Nomen',
    artikel: 'das',
    plural: 'das Wetter', // unzählbar im Deutschen
    emoji: '☀️',
    primaryExampleSentence: 'Heute ist das Wetter schön.',
    alternateExampleSentences: [
      'Bei schlechtem Wetter bleiben wir gemütlich drinnen.',
      'Der Wetterbericht verspricht viel Sonnenschein für das Wochenende.',
    ],
    distractors: ['das Weter', 'der Wetter', 'die Wetter'],
    missingLetterPattern: 'das W_tt_r',
    connectorExercises: [
      {
        firstClause: 'Wir spielen heute draußen im Garten',
        secondClause: 'das Wetter ist sonnig und warm.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Wir spielen heute draußen im Garten, weil das Wetter sonnig und warm ist.',
        connectorType: 'causal',
        explanation: '„weil“ begründet, warum draußen gespielt wird.',
        hint: 'Warum spielen die Kinder draußen? Nutze das Bindewort für den Grund.',
      },
    ],
    practiceSentences: [
      { pronoun: 'ich', text: 'Ich freue mich über das sonnige Wetter.' },
      { pronoun: 'du', text: 'Du gehst auch bei regnerischem Wetter spazieren.' },
      { pronoun: 'er', text: 'Er schaut aus dem Fenster und prüft das Wetter.' },
      { pronoun: 'wir', text: 'Wir genießen das warme Frühlingswetter.' },
      { pronoun: 'ihr', text: 'Ihr zieht euch dem kühlen Wetter passend an.' },
      { pronoun: 'sie', text: 'Sie liest den Bericht über das kommende Wetter.' },
    ],
    validationStatus: 'approved',
    validationIssues: [],
  },

  // Required word: still
  still: {
    cleanWord: 'still',
    wordWithArticle: 'still',
    wortart: 'Adjektiv',
    emoji: '🤫',
    primaryExampleSentence: 'Im Klassenzimmer ist es ganz still.',
    alternateExampleSentences: [
      'Die Kinder lauschen ganz still der spannenden Geschichte.',
      'Am späten Abend wird es draußen im Wald völlig still.',
    ],
    distractors: ['stil', 'stille', 'stiel'],
    missingLetterPattern: 'st_ll',
    adjectiveBank: [
      {
        sentenceWithBlank: 'Während der Klassenarbeit sind alle Schüler ___ .',
        correctForm: 'still',
        options: ['still', 'stille', 'stillen'],
        explanation: 'Nach dem Verb „sind“ steht das Adjektiv in der Grundform „still“.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Alle Kinder sind aufmerksam und still',
        secondClause: 'die Lehrerin liest ein spannendes Buch vor.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Alle Kinder sind aufmerksam und still, weil die Lehrerin ein spannendes Buch vorliest.',
        connectorType: 'causal',
        explanation: '„weil“ erklärt den Grund für die Stille im Klassenzimmer.',
        hint: 'Warum sind alle Kinder so still?',
      },
    ],
    practiceSentences: [
      { pronoun: 'ich', text: 'Ich bin beim Lesen ganz still.' },
      { pronoun: 'du', text: 'Du verhältst dich in der Bücherei sehr still.' },
      { pronoun: 'er', text: 'Er sitzt still auf seinem Platz und malt.' },
      { pronoun: 'wir', text: 'Wir hören ganz still der Musik zu.' },
      { pronoun: 'ihr', text: 'Ihr seid während der Geschichte mucksmäuschenstill.' },
      { pronoun: 'sie', text: 'Sie schleicht ganz still durch das Zimmer.' },
    ],
    validationStatus: 'approved',
    validationIssues: [],
  },

  // Required word: der Unfall
  Unfall: {
    cleanWord: 'Unfall',
    wordWithArticle: 'der Unfall',
    wortart: 'Nomen',
    artikel: 'der',
    plural: 'die Unfälle',
    emoji: '🚑',
    primaryExampleSentence: 'Auf der Straße ist ein Unfall passiert.',
    alternateExampleSentences: [
      'Zum Glück wurde bei dem Unfall niemand verletzt.',
      'Die Polizei sichert die Stelle nach dem Unfall ab.',
    ],
    distractors: ['der Unfal', 'das Unfall', 'die Unfall'],
    missingLetterPattern: 'der _nf_ll',
    connectorExercises: [
      {
        firstClause: 'Die Autos bremsen vorsichtig ab',
        secondClause: 'vor ihnen ist ein kleiner Unfall passiert.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Die Autos bremsen vorsichtig ab, weil vor ihnen ein kleiner Unfall passiert ist.',
        connectorType: 'causal',
        explanation: '„weil“ begründet, weshalb die Autos abbremsen.',
        hint: 'Warum bremsen die Autos ab? Suche das Kausal-Bindewort.',
      },
    ],
    practiceSentences: [
      { pronoun: 'ich', text: 'Ich passe im Straßenverkehr gut auf, um keinen Unfall zu haben.' },
      { pronoun: 'du', text: 'Du trägst einen Helm zum Schutz vor einem Unfall.' },
      { pronoun: 'er', text: 'Er sah den Unfall und holte sofort Hilfe.' },
      { pronoun: 'wir', text: 'Wir lernen Verkehrsregeln zur Vermeidung von Unfällen.' },
      { pronoun: 'ihr', text: 'Ihr fahrt vorsichtig mit dem Fahrrad nach dem Unfall.' },
      { pronoun: 'sie', text: 'Sie hilft der Polizei bei der Klärung des Unfalls.' },
    ],
    validationStatus: 'approved',
    validationIssues: [],
  },

  // Required word: die Mitte
  Mitte: {
    cleanWord: 'Mitte',
    wordWithArticle: 'die Mitte',
    wortart: 'Nomen',
    artikel: 'die',
    plural: 'die Mitten',
    emoji: '🎯',
    primaryExampleSentence: 'Der Ball liegt in der Mitte.',
    alternateExampleSentences: [
      'Wir setzen uns zusammen in die Mitte des Raumes.',
      'Genau in der Mitte des Kreises steht eine bunte Kerze.',
    ],
    distractors: ['die Mite', 'das Mitte', 'der Mitte'],
    missingLetterPattern: 'die M_tt_',
    connectorExercises: [
      {
        firstClause: 'Wir legen den Ball genau in die Mitte',
        secondClause: 'jeder Mitspieler soll die gleiche Chance haben.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Wir legen den Ball genau in die Mitte, weil jeder Mitspieler die gleiche Chance haben soll.',
        connectorType: 'causal',
        explanation: '„weil“ begründet die Platzierung in der Mitte.',
        hint: 'Warum legen wir den Ball in die Mitte?',
      },
    ],
    practiceSentences: [
      { pronoun: 'ich', text: 'Ich treffe mit dem Pfeil genau die Mitte der Scheibe.' },
      { pronoun: 'du', text: 'Du stellst dich in die Mitte des Sportfeldes.' },
      { pronoun: 'er', text: 'Er malt einen roten Punkt genau in die Mitte.' },
      { pronoun: 'wir', text: 'Wir versammeln uns alle in der Mitte der Turnhalle.' },
      { pronoun: 'ihr', text: 'Ihr teilt den Apfel genau in der Mitte durch.' },
      { pronoun: 'sie', text: 'Sie legt das Buch in die Mitte des Tisches.' },
    ],
    validationStatus: 'approved',
    validationIssues: [],
  },

  // Required word: retten (MUST be Verb, meaningful conjugated examples!)
  retten: {
    cleanWord: 'retten',
    wordWithArticle: 'retten',
    wortart: 'Verb',
    infinitive: 'retten',
    emoji: '🚒',
    primaryExampleSentence: 'Die Feuerwehr rettet den Mann.',
    alternateExampleSentences: [
      'Der mutige Hund rettet das kleine Kätzchen aus dem Wasser.',
      'Die Sanitäter retten verletzte Menschen nach einem Notfall.',
    ],
    distractors: ['reten', 'rettten', 'rette'],
    missingLetterPattern: 'r_tt_n',
    conjugationBank: [
      {
        pronounOrSubject: 'du',
        sentenceWithBlank: 'Du ___ das hilflose Vögelchen vor der Katze.',
        correctForm: 'rettest',
        options: ['rettest', 'rettet', 'retten'],
        explanation: 'Bei „du“ und Verben auf -t (rett-) wird ein e eingefügt: du rettest.',
      },
      {
        pronounOrSubject: 'Die Feuerwehr',
        sentenceWithBlank: 'Die Feuerwehr ___ den Hund aus dem tiefen Graben.',
        correctForm: 'rettet',
        options: ['rettet', 'rettest', 'retten'],
        explanation: '„Die Feuerwehr“ steht in der 3. Person Einzahl (sie): sie rettet.',
      },
      {
        pronounOrSubject: 'er',
        sentenceWithBlank: 'Er ___ das kleine Kätzchen vom Baum.',
        correctForm: 'rettet',
        options: ['rettet', 'rettest', 'rette'],
        explanation: 'Bei „er“ endet der Verbstamm mit -et: er rettet.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Die mutigen Helfer eilen schnell herbei',
        secondClause: 'sie möchten die Tiere im Wald vor dem Feuer retten.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Die mutigen Helfer eilen schnell herbei, weil sie die Tiere im Wald vor dem Feuer retten möchten.',
        connectorType: 'causal',
        explanation: '„weil“ begründet das schnelle Herbeieilen der Helfer.',
        hint: 'Warum eilen die Helfer herbei?',
      },
    ],
    practiceSentences: [
      { pronoun: 'ich', text: 'Ich rette die kleine Biene aus dem Wasserglas.' },
      { pronoun: 'du', text: 'Du rettest den Igel von der befahrenen Straße.' },
      { pronoun: 'er', text: 'Er rettet seinen Ball aus dem dornigen Gebüsch.' },
      { pronoun: 'wir', text: 'Wir retten alte Bücher vor dem Papiermüll.' },
      { pronoun: 'ihr', text: 'Ihr rettet das kleine Küken vor der Kälte.' },
      { pronoun: 'sie', text: 'Sie retten gemeinsam ein verirrtes Haustier.' },
    ],
    validationStatus: 'approved',
    validationIssues: [],
  },
};

// Known common adjectives in primary school to prevent them from ever being classified as verbs
export const KNOWN_GERMAN_ADJECTIVES = new Set([
  'billig',
  'still',
  'schlimm',
  'dünn',
  'bissig',
  'dick',
  'klein',
  'groß',
  'schnell',
  'langsam',
  'laut',
  'leise',
  'hell',
  'dunkel',
  'warm',
  'kalt',
  'heiß',
  'schön',
  'hässlich',
  'bunt',
  'frisch',
  'alt',
  'neu',
  'jung',
  'klug',
  'faul',
  'fleißig',
  'mutig',
  'feige',
  'froh',
  'traurig',
  'müde',
  'wach',
  'rund',
  'spitz',
  'hart',
  'weich',
  'stark',
  'schwach',
  'gesund',
  'krank',
  'süß',
  'sauer',
  'bitter',
  'salzig',
  'sauber',
  'schmutzig',
  'nah',
  'fern',
  'reich',
  'arm',
  'voll',
  'leer',
  'eng',
  'weit',
  'kurz',
  'lang',
  'schwer',
  'leicht',
  'tief',
  'flach',
  'gemütlich',
  'vorsichtig',
  'freundlich',
  'lustig',
  'witzig',
  'geheim',
  'wichtig',
  'richtig',
  'falsch',
  'offen',
  'selten',
  'trocken',
  'nass',
]);

/**
 * Common noun genders registry for known nouns
 */
const NOUN_GENDER_HINTS: Record<string, { artikel: Artikel; plural: string; emoji?: string }> = {
  Schiff: { artikel: 'das', plural: 'die Schiffe', emoji: '🚢' },
  Wetter: { artikel: 'das', plural: 'das Wetter', emoji: '☀️' },
  Unfall: { artikel: 'der', plural: 'die Unfälle', emoji: '🚑' },
  Mitte: { artikel: 'die', plural: 'die Mitten', emoji: '🎯' },
  Zimmer: { artikel: 'das', plural: 'die Zimmer', emoji: '🛏️' },
  Messer: { artikel: 'das', plural: 'die Messer', emoji: '🔪' },
  Kuss: { artikel: 'der', plural: 'die Küsse', emoji: '❤️' },
  Schloss: { artikel: 'das', plural: 'die Schlösser', emoji: '🏰' },
  Nummer: { artikel: 'die', plural: 'die Nummern', emoji: '🔢' },
  Schule: { artikel: 'die', plural: 'die Schulen', emoji: '🏫' },
  Klasse: { artikel: 'die', plural: 'die Klassen', emoji: '🎒' },
  Buch: { artikel: 'das', plural: 'die Bücher', emoji: '📖' },
  Heft: { artikel: 'das', plural: 'die Hefte', emoji: '📓' },
  Hund: { artikel: 'der', plural: 'die Hunde', emoji: '🐶' },
  Katze: { artikel: 'die', plural: 'die Katzen', emoji: '🐱' },
  Vogel: { artikel: 'der', plural: 'die Vögel', emoji: '🐦' },
  Baum: { artikel: 'der', plural: 'die Bäume', emoji: '🌳' },
  Blume: { artikel: 'die', plural: 'die Blumen', emoji: '🌸' },
  Freund: { artikel: 'der', plural: 'die Freunde', emoji: '🤝' },
  Kind: { artikel: 'das', plural: 'die Kinder', emoji: '🧒' },
  Haus: { artikel: 'das', plural: 'die Häuser', emoji: '🏠' },
  Wasser: { artikel: 'das', plural: 'das Wasser', emoji: '💧' },
  Sonne: { artikel: 'die', plural: 'die Sonnen', emoji: '☀️' },
  Tisch: { artikel: 'der', plural: 'die Tische', emoji: '🪑' },
  Stuhl: { artikel: 'der', plural: 'die Stühle', emoji: '🪑' },
  Spiel: { artikel: 'das', plural: 'die Spiele', emoji: '🎲' },
  Weg: { artikel: 'der', plural: 'die Wege', emoji: '🛤️' },
  Straße: { artikel: 'die', plural: 'die Straßen', emoji: '🛣️' },
  Stadt: { artikel: 'die', plural: 'die Städte', emoji: '🏙️' },
  Feuerwehr: { artikel: 'die', plural: 'die Feuerwehren', emoji: '🚒' },
  Polizei: { artikel: 'die', plural: 'die Polizeien', emoji: '🚓' },
};

/**
 * Checks whether a sentence is a forbidden generic filler like "Das ist {word}."
 */
export function isGenericSentence(sentence: string, cleanWord: string): boolean {
  if (!sentence || sentence.trim().length === 0) return true;
  const s = sentence.trim();
  const bareClean = cleanWord.replace(/^(der|die|das)\s+/i, '').trim();

  // Allow explicit non-generic idiom: "Das ist halb so schlimm!"
  if (/^das\s+ist\s+halb\s+so\s+schlimm!?$/i.test(s)) {
    return false;
  }

  // Any sentence of the form "Das ist [word]." or "Das ist ein/eine/der/die/das [word]." without rich context
  if (
    new RegExp(`^das\\s+ist\\s+(ein|eine|einen|einem|einer|der|die|das)?\\s*${bareClean}[.!?]?$`, 'i').test(s) ||
    new RegExp(`^das\\s+ist\\s+${bareClean}[.!?]?$`, 'i').test(s)
  ) {
    return true;
  }

  // Any short filler sentence starting with "Das ist" that lacks pedagogical context (< 5 words or simple filler)
  if (/^das\s+ist\s+/i.test(s) && (s.split(/\s+/).length <= 4 || !/weil|denn|als|wie|sehr|ganz|wirklich|schön|groß|klein/i.test(s))) {
    return true;
  }

  // Generic sentence stems that don't demonstrate real meaning:
  const genericPats = [
    new RegExp(`^das\\s+ist\\s+`, 'i'),
    new RegExp(`^das\\s+wort\\s+heißt\\s+`, 'i'),
    new RegExp(`^hier\\s+ist\\s+`, 'i'),
    new RegExp(`^ich\\s+sehe\\s+${bareClean}[.!?]?$`, 'i'),
    new RegExp(`^ich\\s+mag\\s+${bareClean}[.!?]?$`, 'i'),
    new RegExp(`^ich\\s+übe\\s+${bareClean}[.!?]?$`, 'i'),
    new RegExp(`^er\\s+mag\\s+${bareClean}[.!?]?$`, 'i'),
    new RegExp(`^wir\\s+lernen\\s+${bareClean}[.!?]?$`, 'i'),
  ];
  if (genericPats.some((pat) => pat.test(s))) return true;

  // Too short to be a meaningful sentence for 4th class (< 3 words)
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 3) return true;

  return false;
}

/**
 * Derives the plural form for German nouns according to regular morphological patterns.
 */
export function inferNounPlural(cleanWord: string, artikel: Artikel): string {
  if (NOUN_GENDER_HINTS[cleanWord]?.plural) {
    return NOUN_GENDER_HINTS[cleanWord].plural;
  }

  const cw = cleanWord;
  const lastChar = cw.slice(-1);
  const lastTwo = cw.slice(-2);

  // Feminine nouns ending in -e -> -n (die Mitte -> die Mitten, die Blume -> die Blumen)
  if (artikel === 'die' && lastChar === 'e') {
    return `die ${cw}n`;
  }

  // Feminine nouns ending in -ung, -heit, -keit, -schaft -> -en
  if (
    artikel === 'die' &&
    (cw.endsWith('ung') || cw.endsWith('heit') || cw.endsWith('keit') || cw.endsWith('schaft'))
  ) {
    return `die ${cw}en`;
  }

  // Feminine ending in consonant -> usually -en
  if (artikel === 'die') {
    return `die ${cw}en`;
  }

  // Neuter/Masculine ending in -er, -el, -en -> usually no ending change (das Zimmer -> die Zimmer, das Messer -> die Messer)
  if (lastTwo === 'er' || lastTwo === 'el' || lastTwo === 'en') {
    return `die ${cw}`;
  }

  // Neuter ending in consonant -> usually -e (das Schiff -> die Schiffe, das Boot -> die Boote)
  if (artikel === 'das') {
    return `die ${cw}e`;
  }

  // Masculine ending in consonant -> usually umlaut + -e or -e (der Hund -> die Hunde, der Unfall -> die Unfälle)
  if (artikel === 'der') {
    return `die ${cw}e`;
  }

  return `die ${cw}e`;
}

/**
 * Infers the grammatical gender (article) for German nouns.
 */
export function inferNounArticle(cleanWord: string): Artikel {
  if (NOUN_GENDER_HINTS[cleanWord]?.artikel) {
    return NOUN_GENDER_HINTS[cleanWord].artikel;
  }

  const cw = cleanWord;

  // Suffix rules for feminine nouns
  if (
    cw.endsWith('ung') ||
    cw.endsWith('heit') ||
    cw.endsWith('keit') ||
    cw.endsWith('schaft') ||
    cw.endsWith('tät') ||
    cw.endsWith('ion') ||
    cw.endsWith('ie')
  ) {
    return 'die';
  }

  // Suffix rules for neuter nouns
  if (cw.endsWith('chen') || cw.endsWith('lein') || cw.endsWith('ment') || cw.endsWith('um')) {
    return 'das';
  }

  // Suffix rules for masculine nouns
  if (cw.endsWith('ling') || cw.endsWith('or') || cw.endsWith('ismus')) {
    return 'der';
  }

  // Default fallback for unknown noun: check if ends in -e -> usually feminine
  if (cw.endsWith('e')) {
    return 'die';
  }

  return 'das';
}

/**
 * Conjugates a regular or weak German verb for present tense (Präsens).
 * Implements euphonic -e- insertion for stems ending in -t, -d, -m, -n (e.g. retten -> du rettest, er rettet).
 */
export function conjugateGermanVerb(infinitive: string): {
  ich: string;
  du: string;
  er: string;
  wir: string;
  ihr: string;
  sie: string;
  stem: string;
} {
  const clean = infinitive.toLowerCase().trim();
  let stem = clean;

  if (clean.endsWith('en')) {
    stem = clean.slice(0, -2);
  } else if (clean.endsWith('n')) {
    stem = clean.slice(0, -1);
  }

  const stemEndsInTOrD = stem.endsWith('t') || stem.endsWith('d');
  const stemEndsInSibilant =
    stem.endsWith('s') || stem.endsWith('ss') || stem.endsWith('ß') || stem.endsWith('z') || stem.endsWith('x');

  // Euphonic e for du and er/ihr forms
  const duEnding = stemEndsInTOrD ? 'est' : stemEndsInSibilant ? 't' : 'st';
  const erEnding = stemEndsInTOrD ? 'et' : 't';
  const ihrEnding = stemEndsInTOrD ? 'et' : 't';

  return {
    stem,
    ich: `${stem}e`,
    du: `${stem}${duEnding}`,
    er: `${stem}${erEnding}`,
    wir: clean,
    ihr: `${stem}${ihrEnding}`,
    sie: clean,
  };
}

/**
 * Generates rich, grammatically valid, natural German practice sentences
 * for any given vocabulary profile (NEVER generic filler like "Das ist X").
 */
export function generateNaturalGermanSentences(
  cleanWord: string,
  wortart: Wortart,
  artikel?: Artikel,
  infinitive?: string
): {
  primary: string;
  alternates: string[];
  practiceSentences: PracticeSentence[];
} {
  if (wortart === 'Nomen') {
    const art = artikel || inferNounArticle(cleanWord);
    const artCap = art.charAt(0).toUpperCase() + art.slice(1);
    const akkArt = art === 'der' ? 'den' : art;
    const datArt = art === 'die' ? 'der' : 'dem';

    const primary =
      art === 'das'
        ? `${artCap} ${cleanWord} ist für alle gut zu sehen.`
        : art === 'die'
        ? `In der Pause betrachten die Kinder die ${cleanWord}.`
        : `Auf dem Schulweg sehen wir einen ${cleanWord}.`;

    const alternates = [
      `Im Buch lesen wir eine interessante Geschichte über ${akkArt} ${cleanWord}.`,
      `Wir achten heute besonders auf die richtige Schreibweise von „${art} ${cleanWord}“.`,
      `Auf dem bunten Bild ist ${art} ${cleanWord} deutlich zu erkennen.`,
    ];

    const practiceSentences: PracticeSentence[] = [
      { pronoun: 'ich', text: `Ich zeichne ${akkArt} ${cleanWord} sorgfältig in mein Heft.` },
      { pronoun: 'du', text: `Du schaust dir ${akkArt} ${cleanWord} ganz genau an.` },
      { pronoun: 'er', text: `Er spricht über ${akkArt} ${cleanWord} vor der ganzen Klasse.` },
      { pronoun: 'wir', text: `Wir schreiben einen schönen Satz mit „${art} ${cleanWord}“.` },
      { pronoun: 'ihr', text: `Ihr findet ${akkArt} ${cleanWord} auf der nächsten Seite.` },
      { pronoun: 'sie', text: `Sie erklärt die Bedeutung von „${art} ${cleanWord}“.` },
    ];

    return { primary, alternates, practiceSentences };
  }

  if (wortart === 'Adjektiv') {
    const primary = `Das neue Schreibheft ist wirklich ${cleanWord}.`;
    const alternates = [
      `In der Schule arbeiten alle Kinder heute besonders ${cleanWord}.`,
      `Diese spannende Aufgabe ist gar nicht so ${cleanWord}, wie man denkt.`,
      `Am Nachmittag fühlt sich der Unterricht ganz ${cleanWord} an.`,
    ];

    const practiceSentences: PracticeSentence[] = [
      { pronoun: 'ich', text: `Ich finde diese Geschichte sehr ${cleanWord}.` },
      { pronoun: 'du', text: `Du bleibst bei der Arbeit erstaunlich ${cleanWord}.` },
      { pronoun: 'er', text: `Er beschreibt das Bild auf eine ${cleanWord}e Art.` },
      { pronoun: 'wir', text: `Wir sind während der Erklärung ganz ${cleanWord}.` },
      { pronoun: 'ihr', text: `Ihr arbeitet heute besonders ${cleanWord} zusammen.` },
      { pronoun: 'sie', text: `Sie gestaltet das Plakat schön und ${cleanWord}.` },
    ];

    return { primary, alternates, practiceSentences };
  }

  // Verb
  const inf = infinitive || cleanWord.toLowerCase();
  const conj = conjugateGermanVerb(inf);

  const primary = `Die Kinder ${inf} gern gemeinsam nach der Schule.`;
  const alternates = [
    `Heute ${conj.er} er aufmerksam und mit großer Freude mit.`,
    `Wir möchten morgen alle zusammen im Unterricht ${inf}.`,
    `Wenn die Glocke läutet, ${inf} alle Schüler nach draußen.`,
  ];

  const practiceSentences: PracticeSentence[] = [
    { pronoun: 'ich', text: `Ich ${conj.ich} heute mit viel Konzentration.` },
    { pronoun: 'du', text: `Du ${conj.du} jeden Tag ein Stückchen besser.` },
    { pronoun: 'er', text: `Er ${conj.er} gern und ohne jede Mühe.` },
    { pronoun: 'wir', text: `Wir ${conj.wir} die Aufgabe in der Gruppe.` },
    { pronoun: 'ihr', text: `Ihr ${conj.ihr} gemeinsam mit euren Freunden.` },
    { pronoun: 'sie', text: `Sie ${conj.sie} die Übung bis zum Schluss durch.` },
  ];

  return { primary, alternates, practiceSentences };
}

/**
 * Analyzes any incoming raw string (e.g. "das Schiff", "billig", "Wetter", "retten")
 * and extracts/generates a full linguistic vocabulary profile.
 */
export function analyzeLernwortInput(input: string): LinguisticProfile {
  const trimmed = input.trim();
  const words = trimmed.split(/\s+/);

  let detectedArticle: Artikel | undefined = undefined;
  let rawClean = trimmed;

  // Check if article is explicitly provided at the front
  if (words.length > 1 && /^(der|die|das)$/i.test(words[0])) {
    detectedArticle = words[0].toLowerCase() as Artikel;
    rawClean = words.slice(1).join(' ').trim();
  }

  // Normalize clean word: capitalize if noun, lower if verb/adjective
  let cleanWord = rawClean.replace(/[^a-zA-ZäöüÄÖÜß-]/g, '');

  // Check curated registry first
  const registryEntry =
    CURATED_VOCABULARY_REGISTRY[cleanWord] ||
    CURATED_VOCABULARY_REGISTRY[cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()] ||
    CURATED_VOCABULARY_REGISTRY[cleanWord.toLowerCase()];

  if (registryEntry) {
    const art = detectedArticle || registryEntry.artikel;
    const wordWithArt = registryEntry.wortart === 'Nomen' && art ? `${art} ${cleanWord}` : registryEntry.cleanWord!;

    return {
      cleanWord: registryEntry.cleanWord || cleanWord,
      wordWithArticle: wordWithArt,
      wortart: registryEntry.wortart || 'Nomen',
      artikel: art,
      plural: registryEntry.plural,
      infinitive: registryEntry.infinitive,
      emoji: registryEntry.emoji || '📝',
      primaryExampleSentence: registryEntry.primaryExampleSentence || '',
      alternateExampleSentences: registryEntry.alternateExampleSentences || [],
      distractors: registryEntry.distractors || [`${cleanWord}e`, `${cleanWord}s`],
      missingLetterPattern: registryEntry.missingLetterPattern || cleanWord.replace(/[aeiouäöü]/gi, '_'),
      conjugationBank: registryEntry.conjugationBank,
      adjectiveBank: registryEntry.adjectiveBank,
      connectorExercises: registryEntry.connectorExercises || [],
      practiceSentences: registryEntry.practiceSentences || [],
      validationStatus: 'approved',
      validationIssues: [],
    };
  }

  // --- AUTOMATIC CLASSIFICATION FOR NEW WORDS ---
  let detectedWortart: Wortart;
  const isCapitalized = /^[A-ZÄÖÜ]/.test(cleanWord);
  const lowerClean = cleanWord.toLowerCase();

  // 1. Explicit article or capital letter -> Nomen
  if (detectedArticle || isCapitalized) {
    detectedWortart = 'Nomen';
    cleanWord = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
  }
  // 2. Known adjectives list
  else if (KNOWN_GERMAN_ADJECTIVES.has(lowerClean)) {
    detectedWortart = 'Adjektiv';
    cleanWord = lowerClean;
  }
  // 3. Adjective suffixes
  else if (
    lowerClean.endsWith('ig') ||
    lowerClean.endsWith('lich') ||
    lowerClean.endsWith('isch') ||
    lowerClean.endsWith('bar') ||
    lowerClean.endsWith('sam') ||
    lowerClean.endsWith('haft') ||
    lowerClean.endsWith('los') ||
    lowerClean.endsWith('voll')
  ) {
    detectedWortart = 'Adjektiv';
    cleanWord = lowerClean;
  }
  // 4. Verb endings (-en, -eln, -ern)
  else if (lowerClean.endsWith('en') || lowerClean.endsWith('eln') || lowerClean.endsWith('ern')) {
    detectedWortart = 'Verb';
    cleanWord = lowerClean;
  }
  // 5. Default fallback for lowercase word without verb/adjective markers:
  // If not recognized, treat as Adjektiv or Nomen based on capitalization
  else {
    detectedWortart = isCapitalized ? 'Nomen' : 'Adjektiv';
    cleanWord = isCapitalized ? cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1) : lowerClean;
  }

  // Gender & Plural for Nouns
  let artikel: Artikel | undefined = undefined;
  let plural: string | undefined = undefined;
  let infinitive: string | undefined = undefined;
  let wordWithArticle = cleanWord;

  if (detectedWortart === 'Nomen') {
    artikel = detectedArticle || inferNounArticle(cleanWord);
    plural = inferNounPlural(cleanWord, artikel);
    wordWithArticle = `${artikel} ${cleanWord}`;
  } else if (detectedWortart === 'Verb') {
    infinitive = cleanWord.toLowerCase();
    wordWithArticle = cleanWord.toLowerCase();
  }

  // Generate natural sentences
  const generated = generateNaturalGermanSentences(cleanWord, detectedWortart, artikel, infinitive);

  // Generate spelling distractors
  const distractors: string[] = [];
  if (detectedWortart === 'Nomen') {
    const wrongArt1 = artikel === 'der' ? 'die' : artikel === 'die' ? 'das' : 'der';
    const wrongArt2 = artikel === 'der' ? 'das' : artikel === 'die' ? 'der' : 'die';
    distractors.push(`${wrongArt1} ${cleanWord}`, `${wrongArt2} ${cleanWord}`);
  } else {
    distractors.push(`${cleanWord}e`, `${cleanWord}s`);
  }

  // Build conjugation bank for verbs
  let conjugationBank: LinguisticProfile['conjugationBank'] = undefined;
  if (detectedWortart === 'Verb') {
    const conj = conjugateGermanVerb(infinitive || cleanWord);
    conjugationBank = [
      {
        pronounOrSubject: 'du',
        sentenceWithBlank: `Du ___ heute besonders fleißig mit.`,
        correctForm: conj.du,
        options: [conj.du, conj.er, cleanWord],
        explanation: `Bei „du“ lautet die Präsens-Form: „${conj.du}“.`,
      },
      {
        pronounOrSubject: 'er',
        sentenceWithBlank: `Er ___ die Aufgabe aufmerksam bis zum Ende.`,
        correctForm: conj.er,
        options: [conj.er, conj.du, cleanWord],
        explanation: `Bei „er/sie/es“ lautet die passende Verbform: „${conj.er}“.`,
      },
    ];
  }

  // Build adjective bank for adjectives
  let adjectiveBank: LinguisticProfile['adjectiveBank'] = undefined;
  if (detectedWortart === 'Adjektiv') {
    adjectiveBank = [
      {
        sentenceWithBlank: `Das neue Buch ist wirklich ___ .`,
        correctForm: cleanWord,
        options: [cleanWord, `${cleanWord}e`, `${cleanWord}en`],
        explanation: `Nach dem Hilfsverb „ist“ bleibt das Adjektiv in der Grundform „${cleanWord}“.`,
      },
    ];
  }

  const emoji = NOUN_GENDER_HINTS[cleanWord]?.emoji || (detectedWortart === 'Verb' ? '⚡' : detectedWortart === 'Adjektiv' ? '✨' : '📝');

  return {
    cleanWord,
    wordWithArticle,
    wortart: detectedWortart,
    artikel,
    plural,
    infinitive,
    emoji,
    primaryExampleSentence: generated.primary,
    alternateExampleSentences: generated.alternates,
    distractors,
    missingLetterPattern: cleanWord.replace(/[aeiouäöü]/gi, '_'),
    conjugationBank,
    adjectiveBank,
    connectorExercises: [
      {
        firstClause: `Wir beschäftigen uns ausführlich mit „${wordWithArticle}“`,
        secondClause: `wir möchten fehlerfrei und sicher schreiben lernen.`,
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: `Wir beschäftigen uns ausführlich mit „${wordWithArticle}“, weil wir fehlerfrei und sicher schreiben lernen möchten.`,
        connectorType: 'causal',
        explanation: '„weil“ begründet, weshalb wir das Wort üben.',
        hint: 'Achte auf den Grund: Warum üben wir das Wort?',
      },
    ],
    practiceSentences: generated.practiceSentences,
    validationStatus: 'approved',
    validationIssues: [],
  };
}

/**
 * Validates a Lernwort item or profile against strict quality criteria:
 * - Wortart must be valid (Nomen, Verb, Adjektiv)
 * - Nouns must have an article and plural
 * - Verbs must have an infinitive
 * - Example sentence must NOT be generic ("Das ist X")
 * - Example sentence must have at least 3 words and end in punctuation
 */
export function validateLernwortProfile(item: Partial<LernwortItem>): {
  isValid: boolean;
  issues: string[];
  status: 'approved' | 'needs_review' | 'rejected';
} {
  const issues: string[] = [];

  if (!item.cleanWord || item.cleanWord.trim().length === 0) {
    issues.push('Wort fehlt.');
  }

  const clean = (item.cleanWord || '').trim();

  // Check Wortart
  if (!item.wortart || !['Nomen', 'Verb', 'Adjektiv'].includes(item.wortart)) {
    issues.push('Gültige Wortart fehlt (Nomen, Verb oder Adjektiv erforderlich).');
  }

  // Nouns require article
  if (item.wortart === 'Nomen') {
    if (!item.artikel || !['der', 'die', 'das'].includes(item.artikel)) {
      issues.push(`Nomen „${clean}“ benötigt einen Begleiter (der, die oder das).`);
    }
    if (!item.plural || item.plural.trim().length === 0) {
      issues.push(`Nomen „${clean}“ benötigt eine Mehrzahlform (Plural).`);
    }
  }

  // Example sentence check
  const example = item.exampleSentence || (item.sentences && item.sentences[0] ? item.sentences[0].text : '');
  if (!example || example.trim().length === 0) {
    issues.push(`Beispielsatz für „${clean}“ fehlt.`);
  } else if (isGenericSentence(example, clean)) {
    issues.push(`Beispielsatz „${example}“ ist eine unzulässige generische Vorlage („Das ist ...“).`);
  }

  // Prevent adjectives from being marked as verbs
  if (KNOWN_GERMAN_ADJECTIVES.has(clean.toLowerCase()) && item.wortart !== 'Adjektiv') {
    issues.push(`„${clean}“ ist ein bekanntes Adjektiv, wurde aber fälschlicherweise als ${item.wortart} eingestuft!`);
  }

  const isValid = issues.length === 0;
  const status = isValid ? 'approved' : 'needs_review';

  return {
    isValid,
    issues,
    status,
  };
}

/**
 * Sanitizes and heals an existing word item, fixing missing articles,
 * incorrect Wortart (e.g. billig as Verb), generic example sentences, etc.
 */
export function sanitizeAndHealLernwortItem(item: LernwortItem): LernwortItem {
  const rawWord = (item.word || '').trim();
  const rawClean = (item.cleanWord || '').trim();
  const detectedArticle = /^(der|die|das)\s+/i.test(rawWord)
    ? (rawWord.match(/^(der|die|das)\s+/i)![1].toLowerCase() as Artikel)
    : undefined;
  const bareClean = (rawClean || rawWord)
    .replace(/^(der|die|das)\s+/i, '')
    .trim();

  // If word is in known registry, apply perfect curated metadata
  const profile = analyzeLernwortInput(rawWord || bareClean);

  const isCurated = !!(
    CURATED_VOCABULARY_REGISTRY[bareClean] ||
    CURATED_VOCABULARY_REGISTRY[bareClean.charAt(0).toUpperCase() + bareClean.slice(1).toLowerCase()] ||
    CURATED_VOCABULARY_REGISTRY[bareClean.toLowerCase()]
  );

  // Correct Wortart: curated registry and known adjectives/nouns strictly override stale or erroneous data
  let correctedWortart: Wortart;
  if (isCurated) {
    correctedWortart = profile.wortart;
  } else if (KNOWN_GERMAN_ADJECTIVES.has(bareClean.toLowerCase())) {
    correctedWortart = 'Adjektiv';
  } else if (detectedArticle || /^[A-ZÄÖÜ]/.test(bareClean)) {
    correctedWortart = 'Nomen';
  } else if (bareClean.toLowerCase().endsWith('ig') || bareClean.toLowerCase().endsWith('lich') || bareClean.toLowerCase().endsWith('isch')) {
    correctedWortart = 'Adjektiv';
  } else if (bareClean.toLowerCase().endsWith('en') || bareClean.toLowerCase().endsWith('eln') || bareClean.toLowerCase().endsWith('ern')) {
    correctedWortart = 'Verb';
  } else {
    correctedWortart = item.wortart || profile.wortart;
  }

  const cleanFormatted =
    correctedWortart === 'Nomen'
      ? bareClean.charAt(0).toUpperCase() + bareClean.slice(1)
      : bareClean.toLowerCase();

  const correctedArtikel =
    correctedWortart === 'Nomen'
      ? detectedArticle || profile.artikel || item.artikel || inferNounArticle(cleanFormatted)
      : undefined;

  const correctedPlural =
    correctedWortart === 'Nomen'
      ? (isCurated ? profile.plural : item.plural) || profile.plural || inferNounPlural(cleanFormatted, correctedArtikel || 'das')
      : undefined;

  const correctedInfinitive =
    correctedWortart === 'Verb'
      ? (isCurated ? profile.infinitive : item.infinitive) || profile.infinitive || cleanFormatted.toLowerCase()
      : undefined;

  // Fix generic example sentence (NEVER allow "Das ist {word}.")
  let exampleSentence = item.exampleSentence;
  if (!exampleSentence || isGenericSentence(exampleSentence, cleanFormatted) || isCurated) {
    exampleSentence = profile.primaryExampleSentence;
  }

  // Fix generic practice sentences
  let sentences = item.sentences;
  if (
    !sentences ||
    sentences.length === 0 ||
    sentences.some((s) => isGenericSentence(s.text, cleanFormatted)) ||
    isCurated
  ) {
    sentences = profile.practiceSentences;
  }

  const formattedWord =
    correctedWortart === 'Nomen' && correctedArtikel
      ? `${correctedArtikel} ${cleanFormatted}`
      : cleanFormatted;

  const validation = validateLernwortProfile({
    cleanWord: cleanFormatted,
    wortart: correctedWortart,
    artikel: correctedArtikel,
    plural: correctedPlural,
    exampleSentence,
    sentences,
  });

  return {
    ...item,
    word: formattedWord,
    cleanWord: cleanFormatted,
    wortart: correctedWortart,
    artikel: correctedArtikel,
    plural: correctedPlural,
    infinitive: correctedInfinitive,
    exampleSentence,
    sentences,
    emoji: item.emoji && item.emoji !== '📝' ? item.emoji : profile.emoji,
    distractors: item.distractors && item.distractors.length > 0 ? item.distractors : profile.distractors,
    missingLetterPattern: item.missingLetterPattern || profile.missingLetterPattern,
    validationStatus: validation.status,
    validationIssues: validation.issues,
  } as LernwortItem;
}

/**
 * Sanitizes an entire array of curriculum words on load/import.
 */
export function sanitizeCurriculumWords(words: LernwortItem[]): LernwortItem[] {
  return words.map(sanitizeAndHealLernwortItem);
}
