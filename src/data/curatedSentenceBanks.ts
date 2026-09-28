export interface CuratedConjugationTask {
  pronounOrSubject: string;
  sentenceWithBlank: string;
  correctForm: string;
  options: string[];
  explanation: string;
}

export interface CuratedConnectorTask {
  firstClause: string;
  secondClause: string;
  correctConnector: 'weil' | 'aber' | 'und';
  options: ('weil' | 'aber' | 'und')[];
  combinedSentence: string;
  connectorType: 'causal' | 'contrast' | 'addition';
  explanation: string;
  hint: string;
}

export interface CuratedWordEntry {
  cleanWord: string;
  wordWithArticle: string;
  wordType: 'noun' | 'verb' | 'adjective';
  naturalSentences: string[];
  writingPrompt: string;
  conjugationBank?: CuratedConjugationTask[];
  adjectiveBank?: Array<{
    sentenceWithBlank: string;
    correctForm: string;
    options: string[];
    explanation: string;
  }>;
  connectorExercises: CuratedConnectorTask[];
}

export const CURATED_LERNWOERTER_BANKS: Record<string, CuratedWordEntry> = {
  Zimmer: {
    cleanWord: 'Zimmer',
    wordWithArticle: 'das Zimmer',
    wordType: 'noun',
    naturalSentences: [
      'Ich räume mein Zimmer auf.',
      'Mein Bruder spielt gern in seinem Zimmer.',
      'Das Zimmer ist hell und gemütlich.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Wort „Zimmer“.',
    connectorExercises: [
      {
        firstClause: 'Ich gehe in mein Zimmer',
        secondClause: 'ich möchte in Ruhe ein Buch lesen.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Ich gehe in mein Zimmer, weil ich in Ruhe ein Buch lesen möchte.',
        connectorType: 'causal',
        explanation: '„weil“ begründet, warum er in sein Zimmer geht (Begründung/Ursache).',
        hint: 'Frage: Warum geht er in sein Zimmer? Nutze das Bindewort, das einen Grund nennt.',
      },
      {
        firstClause: 'Mein Zimmer ist ziemlich klein',
        secondClause: 'es ist sehr gemütlich eingerichtet.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Mein Zimmer ist ziemlich klein, aber es ist sehr gemütlich eingerichtet.',
        connectorType: 'contrast',
        explanation: '„aber“ drückt einen Gegensatz aus: Das Zimmer ist klein, doch trotzdem gemütlich.',
        hint: 'Hier gibt es einen Gegensatz: klein, aber trotzdem schön.',
      },
    ],
  },

  schwimmen: {
    cleanWord: 'schwimmen',
    wordWithArticle: 'schwimmen',
    wordType: 'verb',
    naturalSentences: [
      'Ich schwimme gern im Schwimmbad.',
      'Wir schwimmen im tiefen Wasser.',
      'Die Kinder schwimmen im Sommer im See.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Verb „schwimmen“.',
    conjugationBank: [
      {
        pronounOrSubject: 'Du',
        sentenceWithBlank: 'Du ___ heute bis zur Boje.',
        correctForm: 'schwimmst',
        options: ['schwimmst', 'schwimmt', 'schwimme'],
        explanation: 'Bei „du“ lautet die Endung im Präsens -st: du schwimmst.',
      },
      {
        pronounOrSubject: 'Wir',
        sentenceWithBlank: 'Wir ___ im tiefen Wasser.',
        correctForm: 'schwimmen',
        options: ['schwimmen', 'schwimmt', 'schwimmst'],
        explanation: 'Bei „wir“ lautet die Endung im Präsens -en: wir schwimmen.',
      },
      {
        pronounOrSubject: 'Er',
        sentenceWithBlank: 'Er ___ gern eine Bahn im Schwimmbad.',
        correctForm: 'schwimmt',
        options: ['schwimmt', 'schwimmst', 'schwimme'],
        explanation: 'Bei „er/sie/es“ lautet die Endung im Präsens -t: er schwimmt.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Wir gehen ins Schwimmbad',
        secondClause: 'wir möchten schwimmen lernen.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Wir gehen ins Schwimmbad, weil wir schwimmen lernen möchten.',
        connectorType: 'causal',
        explanation: '„weil“ erklärt den Grund für den Schwimmbadbesuch.',
        hint: 'Warum gehen sie ins Schwimmbad? Suche das Kausal-Bindewort.',
      },
      {
        firstClause: 'Das Wasser im See ist noch sehr kalt',
        secondClause: 'die Kinder schwimmen trotzdem eine Runde.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Das Wasser im See ist noch sehr kalt, aber die Kinder schwimmen trotzdem eine Runde.',
        connectorType: 'contrast',
        explanation: '„aber“ zeigt den Gegensatz zwischen dem kalten Wasser und dem Schwimmen.',
        hint: 'Hier steht ein Widerspruch: Es ist kalt, trotzdem gehen sie schwimmen.',
      },
    ],
  },

  Messer: {
    cleanWord: 'Messer',
    wordWithArticle: 'das Messer',
    wordType: 'noun',
    naturalSentences: [
      'Das Messer schneidet das Brot sehr gut.',
      'Er legt das Besteck und das Messer auf den Tisch.',
      'Sei vorsichtig mit dem scharfen Messer!',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Wort „Messer“.',
    connectorExercises: [
      {
        firstClause: 'Er nimmt das Messer sehr vorsichtig in die Hand',
        secondClause: 'es ist frisch geschliffen.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er nimmt das Messer sehr vorsichtig in die Hand, weil es frisch geschliffen ist.',
        connectorType: 'causal',
        explanation: '„weil“ begründet die vorsichtige Haltung.',
        hint: 'Warum nimmt er das Messer vorsichtig? Das Bindewort nennt die Ursache.',
      },
      {
        firstClause: 'Er holt das Brot aus der Küche',
        secondClause: 'er schneidet es mit dem Messer in Scheiben.',
        correctConnector: 'und',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er holt das Brot aus der Küche und er schneidet es mit dem Messer in Scheiben.',
        connectorType: 'addition',
        explanation: '„und“ reiht zwei aufeinanderfolgende Handlungen logisch aneinander.',
        hint: 'Hier geschieht erst das eine, dann das andere: eine Aneinanderreihung.',
      },
    ],
  },

  Kuss: {
    cleanWord: 'Kuss',
    wordWithArticle: 'der Kuss',
    wordType: 'noun',
    naturalSentences: [
      'Die Mutter gibt ihrem Kind einen Kuss zum Abschied.',
      'Er bekommt vor dem Schlafengehen einen lieben Kuss.',
      'Ein herzlicher Kuss zaubert ihr ein Lächeln ins Gesicht.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Wort „Kuss“.',
    connectorExercises: [
      {
        firstClause: 'Der kleine Junge lächelt glücklich',
        secondClause: 'seine Mama hat ihm einen lieben Kuss gegeben.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Der kleine Junge lächelt glücklich, weil seine Mama ihm einen lieben Kuss gegeben hat.',
        connectorType: 'causal',
        explanation: '„weil“ nennt die Ursache für das glückliche Lächeln.',
        hint: 'Warum lächelt er? Das Bindewort erklärt den Grund.',
      },
      {
        firstClause: 'Die Mutter winkt am Schultor',
        secondClause: 'sie wirft ihrem Sohn noch einen Kuss zu.',
        correctConnector: 'und',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Die Mutter winkt am Schultor und sie wirft ihrem Sohn noch einen Kuss zu.',
        connectorType: 'addition',
        explanation: '„und“ verbindet die beiden Handlungen am Schultor.',
        hint: 'Beide Handlungen gehören zusammen und finden gemeinsam statt.',
      },
    ],
  },

  rennen: {
    cleanWord: 'rennen',
    wordWithArticle: 'rennen',
    wordType: 'verb',
    naturalSentences: [
      'Der Junge rennt schnell zum Bus.',
      'Die Kinder rennen über den Schulhof.',
      'Wir rennen um die Wette bis zum großen Baum.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Verb „rennen“.',
    conjugationBank: [
      {
        pronounOrSubject: 'Du',
        sentenceWithBlank: 'Du ___ schnell zum Bus.',
        correctForm: 'rennst',
        options: ['rennst', 'rennt', 'renne'],
        explanation: 'Bei „du“ lautet die Form im Präsens: du rennst.',
      },
      {
        pronounOrSubject: 'Der Junge',
        sentenceWithBlank: 'Der Junge ___ schnell zum Bus.',
        correctForm: 'rennt',
        options: ['rennt', 'rennst', 'rennen'],
        explanation: 'Bei „der Junge“ (er) lautet die Form: rennt.',
      },
      {
        pronounOrSubject: 'Die Kinder',
        sentenceWithBlank: 'Die Kinder ___ über den Schulhof.',
        correctForm: 'rennen',
        options: ['rennen', 'rennt', 'rennst'],
        explanation: 'Bei Mehrzahl (die Kinder) bleibt die Endung auf -en: rennen.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Der Junge rennt so schnell er kann',
        secondClause: 'er möchte den Bus nicht verpassen.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Der Junge rennt so schnell er kann, weil er den Bus nicht verpassen möchte.',
        connectorType: 'causal',
        explanation: '„weil“ liefert die Begründung für das schnelle Rennen.',
        hint: 'Warum beeilt sich der Junge so? Nutze ein Begründungswort.',
      },
      {
        firstClause: 'Er ist ziemlich müde vom Schultag',
        secondClause: 'er rennt die letzte Runde beim Training trotzdem zu Ende.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er ist ziemlich müde vom Schultag, aber er rennt die letzte Runde beim Training trotzdem zu Ende.',
        connectorType: 'contrast',
        explanation: '„aber“ markiert den Gegensatz trotz der Müdigkeit.',
        hint: 'Müde sein, aber trotzdem rennen – das ist ein klarer Gegensatz.',
      },
    ],
  },

  passen: {
    cleanWord: 'passen',
    wordWithArticle: 'passen',
    wordType: 'verb',
    naturalSentences: [
      'Die Hose passt mir gut.',
      'Die Schuhe passen genau.',
      'Wir passen gut in einem Team zusammen.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Verb „passen“.',
    conjugationBank: [
      {
        pronounOrSubject: 'Die Hose',
        sentenceWithBlank: 'Die Hose ___ mir gut.',
        correctForm: 'passt',
        options: ['passt', 'passen', 'passe'],
        explanation: 'Bei Einzahl („die Hose“) heißt es: passt.',
      },
      {
        pronounOrSubject: 'Die Schuhe',
        sentenceWithBlank: 'Die Schuhe ___ genau.',
        correctForm: 'passen',
        options: ['passen', 'passt', 'passte'],
        explanation: 'Bei Mehrzahl („die Schuhe“) heißt es: passen.',
      },
      {
        pronounOrSubject: 'Du',
        sentenceWithBlank: 'Du ___ den Ball genau zu deinem Mitspieler.',
        correctForm: 'passt',
        options: ['passt', 'passe', 'passen'],
        explanation: 'Bei „du“ heißt es: du passt.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Er kauft die neue Jacke sofort',
        secondClause: 'sie passt ihm wie angegossen.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er kauft die neue Jacke sofort, weil sie ihm wie angegossen passt.',
        connectorType: 'causal',
        explanation: '„weil“ begründet die Kaufentscheidung.',
        hint: 'Warum kauft er die Jacke? Das Bindewort nennt den Grund.',
      },
      {
        firstClause: 'Die Schuhe sehen wunderschön aus',
        secondClause: 'sie passen leider überhaupt nicht.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Die Schuhe sehen wunderschön aus, aber sie passen leider überhaupt nicht.',
        connectorType: 'contrast',
        explanation: '„aber“ betont den Gegensatz zwischen Aussehen und Passform.',
        hint: 'Schön aussehen, aber nicht passen – ein deutlicher Gegensatz.',
      },
    ],
  },

  dünn: {
    cleanWord: 'dünn',
    wordWithArticle: 'dünn',
    wordType: 'adjective',
    naturalSentences: [
      'Er schneidet eine dünne Scheibe Brot ab.',
      'Das Eis auf dem See ist noch viel zu dünn.',
      'Das Heft ist recht dünn und hat wenige Seiten.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Adjektiv „dünn“.',
    adjectiveBank: [
      {
        sentenceWithBlank: 'Er schneidet eine ___ Scheibe Brot.',
        correctForm: 'dünne',
        options: ['dünne', 'dünnen', 'dünnes'],
        explanation: 'Vor „Scheibe“ (weiblich) heißt es: eine dünne Scheibe.',
      },
      {
        sentenceWithBlank: 'Das Eis auf dem See ist gefährlich ___.',
        correctForm: 'dünn',
        options: ['dünn', 'dünne', 'dünnes'],
        explanation: 'Am Satzende nach „ist“ bleibt das Adjektiv in der Grundform: dünn.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Wir dürfen nicht auf den See gehen',
        secondClause: 'die Eisschicht ist noch viel zu dünn.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Wir dürfen nicht auf den See gehen, weil die Eisschicht noch viel zu dünn ist.',
        connectorType: 'causal',
        explanation: '„weil“ erklärt das Betretungsverbot.',
        hint: 'Warum darf niemand auf den See? Ein Begründungssatz.',
      },
      {
        firstClause: 'Die Jacke ist sehr dünn',
        secondClause: 'sie hält den kalten Wind erstaunlich gut ab.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Die Jacke ist sehr dünn, aber sie hält den kalten Wind erstaunlich gut ab.',
        connectorType: 'contrast',
        explanation: '„aber“ zeigt den Kontrast zwischen dünnem Stoff und guter Wärmewirkung.',
        hint: 'Dünn, aber trotzdem warm – ein klarer Gegensatz.',
      },
    ],
  },

  brennen: {
    cleanWord: 'brennen',
    wordWithArticle: 'brennen',
    wordType: 'verb',
    naturalSentences: [
      'Das Holz brennt im Kamin.',
      'Die Kerzen brennen auf dem Tisch.',
      'Das Lagerfeuer brennt hell in der Nacht.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Verb „brennen“.',
    conjugationBank: [
      {
        pronounOrSubject: 'Das Holz',
        sentenceWithBlank: 'Das Holz ___ im Kamin.',
        correctForm: 'brennt',
        options: ['brennt', 'brennen', 'brenne'],
        explanation: 'Bei Einzahl („das Holz“) heißt es: brennt.',
      },
      {
        pronounOrSubject: 'Die Kerzen',
        sentenceWithBlank: 'Die Kerzen ___ auf dem Tisch.',
        correctForm: 'brennen',
        options: ['brennen', 'brennt', 'brennte'],
        explanation: 'Bei Mehrzahl („die Kerzen“) heißt es: brennen.',
      },
      {
        pronounOrSubject: 'Das Lagerfeuer',
        sentenceWithBlank: 'Das Lagerfeuer ___ hell in der Nacht.',
        correctForm: 'brennt',
        options: ['brennt', 'brennst', 'brennen'],
        explanation: 'Bei Einzahl („das Lagerfeuer“) heißt es: brennt.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Im Wohnzimmer wird es angenehm warm',
        secondClause: 'das Holz im Kamin brennt.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Im Wohnzimmer wird es angenehm warm, weil das Holz im Kamin brennt.',
        connectorType: 'causal',
        explanation: '„weil“ begründet die angenehme Wärme im Raum.',
        hint: 'Warum wird es warm? Suche das Begründungswort.',
      },
      {
        firstClause: 'Es regnet draußen in Strömen',
        secondClause: 'das geschützte Lagerfeuer brennt trotzdem weiter.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Es regnet draußen in Strömen, aber das geschützte Lagerfeuer brennt trotzdem weiter.',
        connectorType: 'contrast',
        explanation: '„aber“ drückt den starken Kontrast zum Regen aus.',
        hint: 'Regen, aber das Feuer brennt trotzdem – ein Gegensatz.',
      },
    ],
  },

  Schloss: {
    cleanWord: 'Schloss',
    wordWithArticle: 'das Schloss',
    wordType: 'noun',
    naturalSentences: [
      'Auf dem hohen Berg steht ein altes Schloss.',
      'Der Schlüssel passt genau in das Schloss.',
      'Die Besucher bewundern das prächtige Schloss.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Wort „Schloss“.',
    connectorExercises: [
      {
        firstClause: 'Viele Wanderer steigen den Berg hinauf',
        secondClause: 'sie wollen das berühmte Schloss besichtigen.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Viele Wanderer steigen den Berg hinauf, weil sie das berühmte Schloss besichtigen wollen.',
        connectorType: 'causal',
        explanation: '„weil“ nennt das Ziel und den Grund der Wanderung.',
        hint: 'Warum wandern die Leute hinauf? Das Bindewort gibt den Grund an.',
      },
      {
        firstClause: 'Wir stehen vor der schweren Haustür',
        secondClause: 'der Schlüssel passt leider nicht in das Schloss.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Wir stehen vor der schweren Haustür, aber der Schlüssel passt leider nicht in das Schloss.',
        connectorType: 'contrast',
        explanation: '„aber“ zeigt das unerwartete Problem am Eingang.',
        hint: 'Vor der Tür stehen, aber nicht hineinkönnen – ein Gegensatz.',
      },
    ],
  },

  kennen: {
    cleanWord: 'kennen',
    wordWithArticle: 'kennen',
    wordType: 'verb',
    naturalSentences: [
      'Du kennst die richtige Antwort.',
      'Er kennt den Weg zur Schule.',
      'Ich kenne dieses Spiel schon.',
      'Wir kennen unsere Nachbarn gut.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Verb „kennen“.',
    conjugationBank: [
      {
        pronounOrSubject: 'Du',
        sentenceWithBlank: 'Du ___ die richtige Antwort.',
        correctForm: 'kennst',
        options: ['kennst', 'kennt', 'kenne'],
        explanation: 'Bei „du“ heißt es: du kennst.',
      },
      {
        pronounOrSubject: 'Er',
        sentenceWithBlank: 'Er ___ den Weg zur Schule.',
        correctForm: 'kennt',
        options: ['kennt', 'kennst', 'kennen'],
        explanation: 'Bei „er/sie/es“ heißt es: er kennt.',
      },
      {
        pronounOrSubject: 'Ich',
        sentenceWithBlank: 'Ich ___ dieses Spiel schon.',
        correctForm: 'kenne',
        options: ['kenne', 'kennst', 'kennt'],
        explanation: 'Bei „ich“ heißt es: ich kenne.',
      },
      {
        pronounOrSubject: 'Wir',
        sentenceWithBlank: 'Wir ___ unsere Nachbarn gut.',
        correctForm: 'kennen',
        options: ['kennen', 'kennt', 'kennst'],
        explanation: 'Bei „wir“ heißt es: wir kennen.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Er findet sofort zum Sportplatz',
        secondClause: 'er kennt den Weg ganz genau.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er findet sofort zum Sportplatz, weil er den Weg ganz genau kennt.',
        connectorType: 'causal',
        explanation: '„weil“ begründet, warum er den Weg sofort findet.',
        hint: 'Warum findet er den Weg so schnell? Ursache suchen.',
      },
      {
        firstClause: 'Er kennt das Lernwort ganz genau',
        secondClause: 'er schreibt es manchmal noch falsch.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er kennt das Lernwort ganz genau, aber er schreibt es manchmal noch falsch.',
        connectorType: 'contrast',
        explanation: '„aber“ stellt das Kennen dem gelegentlichen Fehler gegenüber.',
        hint: 'Wort kennen, aber trotzdem Fehler machen – das ist ein klarer Kontrast.',
      },
      {
        firstClause: 'Er lernt das Wort fleißig',
        secondClause: 'er schreibt dazu einen vollständigen Satz.',
        correctConnector: 'und',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er lernt das Wort fleißig und er schreibt dazu einen vollständigen Satz.',
        connectorType: 'addition',
        explanation: '„und“ verbindet die beiden Übungsschritte sinnvoll.',
        hint: 'Hier werden zwei Tätigkeiten nacheinander aufgezählt.',
      },
    ],
  },

  Nummer: {
    cleanWord: 'Nummer',
    wordWithArticle: 'die Nummer',
    wordType: 'noun',
    naturalSentences: [
      'Er wählt die Nummer auf dem Telefon.',
      'Unsere Hausnummer ist die Vierundzwanzig.',
      'Welche Nummer steht auf deinem Trikot?',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Wort „Nummer“.',
    connectorExercises: [
      {
        firstClause: 'Er kann seine Großmutter schnell anrufen',
        secondClause: 'er kennt ihre Telefonnummer auswendig.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er kann seine Großmutter schnell anrufen, weil er ihre Telefonnummer auswendig kennt.',
        connectorType: 'causal',
        explanation: '„weil“ gibt an, warum er sofort anrufen kann.',
        hint: 'Warum klappt der Anruf so schnell? Begründung wählen.',
      },
      {
        firstClause: 'Er sucht das richtige Haus in der Straße',
        secondClause: 'die Nummer am Gartentor ist kaum zu lesen.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er sucht das richtige Haus in der Straße, aber die Nummer am Gartentor ist kaum zu lesen.',
        connectorType: 'contrast',
        explanation: '„aber“ drückt das Hindernis bei der Suche aus.',
        hint: 'Ein Haus suchen, aber die Nummer nicht sehen – ein Hindernis/Gegensatz.',
      },
    ],
  },

  schlimm: {
    cleanWord: 'schlimm',
    wordWithArticle: 'schlimm',
    wordType: 'adjective',
    naturalSentences: [
      'Die kleine Schramme ist nicht schlimm.',
      'Keine Sorge, der Fehler ist halb so schlimm!',
      'Das Unwetter war zum Glück nicht so schlimm.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Adjektiv „schlimm“.',
    adjectiveBank: [
      {
        sentenceWithBlank: 'Die kleine Schramme am Knie ist nicht ___.',
        correctForm: 'schlimm',
        options: ['schlimm', 'schlimme', 'schlimmer'],
        explanation: 'Nach „ist nicht“ steht das Adjektiv in der Grundform: schlimm.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Das Kind weint nach dem kleinen Sturz nicht',
        secondClause: 'die Schramme am Knie ist überhaupt nicht schlimm.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Das Kind weint nach dem kleinen Sturz nicht, weil die Schramme am Knie überhaupt nicht schlimm ist.',
        connectorType: 'causal',
        explanation: '„weil“ liefert die beruhigende Begründung.',
        hint: 'Warum weint das Kind nicht? Ursache auswählen.',
      },
      {
        firstClause: 'Er hat das Trinkglas versehentlich umgestoßen',
        secondClause: 'das Missgeschick ist zum Glück gar nicht schlimm.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Er hat das Trinkglas versehentlich umgestoßen, aber das Missgeschick ist zum Glück gar nicht schlimm.',
        connectorType: 'contrast',
        explanation: '„aber“ schwächt den Vorfall beruhigend ab.',
        hint: 'Ein Glas fällt um, aber es ist nicht schlimm – ein Gegensatz.',
      },
    ],
  },

  beginnen: {
    cleanWord: 'beginnen',
    wordWithArticle: 'beginnen',
    wordType: 'verb',
    naturalSentences: [
      'Du beginnst mit der ersten Aufgabe.',
      'Er beginnt heute mit den Hausaufgaben.',
      'Wir beginnen jetzt mit dem Unterricht.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Verb „beginnen“.',
    conjugationBank: [
      {
        pronounOrSubject: 'Du',
        sentenceWithBlank: 'Du ___ mit der ersten Aufgabe.',
        correctForm: 'beginnst',
        options: ['beginnst', 'beginnt', 'beginne'],
        explanation: 'Bei „du“ heißt es: du beginnst.',
      },
      {
        pronounOrSubject: 'Er',
        sentenceWithBlank: 'Er ___ heute mit den Hausaufgaben.',
        correctForm: 'beginnt',
        options: ['beginnt', 'beginnst', 'beginnen'],
        explanation: 'Bei „er/sie/es“ heißt es: er beginnt.',
      },
      {
        pronounOrSubject: 'Wir',
        sentenceWithBlank: 'Wir ___ jetzt mit dem Unterricht.',
        correctForm: 'beginnen',
        options: ['beginnen', 'beginnt', 'beginnst'],
        explanation: 'Bei „wir“ heißt es: wir beginnen.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Die Schüler setzen sich leise an ihre Tische',
        secondClause: 'die Lehrerin beginnt mit der spannenden Geschichte.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Die Schüler setzen sich leise an ihre Tische, weil die Lehrerin mit der spannenden Geschichte beginnt.',
        connectorType: 'causal',
        explanation: '„weil“ begründet, warum die Schüler leise werden.',
        hint: 'Warum setzen sich die Schüler leise hin? Das Bindewort begründet es.',
      },
      {
        firstClause: 'Es ist schon ziemlich spät am Nachmittag',
        secondClause: 'er beginnt heute trotzdem mit dem Training.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Es ist schon ziemlich spät am Nachmittag, aber er beginnt heute trotzdem mit dem Training.',
        connectorType: 'contrast',
        explanation: '„aber“ hebt den Kontrast zur späten Uhrzeit hervor.',
        hint: 'Spät am Nachmittag, aber trotzdem beginnen – das ist ein Gegensatz.',
      },
    ],
  },

  bissig: {
    cleanWord: 'bissig',
    wordWithArticle: 'bissig',
    wordType: 'adjective',
    naturalSentences: [
      'Pass gut auf vor dem bissigen Hund!',
      'Die Schuhe passen genau.',
      'Der kleine Hund wedelt fröhlich und ist gar nicht bissig.',
    ],
    writingPrompt: 'Schreibe einen vollständigen Satz mit dem Adjektiv „bissig“.',
    adjectiveBank: [
      {
        sentenceWithBlank: 'Pass gut auf vor dem ___ Hund!',
        correctForm: 'bissigen',
        options: ['bissigen', 'bissiger', 'bissige'],
        explanation: 'Nach „vor dem“ (Dativ männlich) heißt es: bissigen Hund.',
      },
      {
        sentenceWithBlank: 'Der Hund bellt laut, ist aber gar nicht ___.',
        correctForm: 'bissig',
        options: ['bissig', 'bissigen', 'bissiger'],
        explanation: 'Nach „ist nicht“ steht das Adjektiv unverändert: bissig.',
      },
    ],
    connectorExercises: [
      {
        firstClause: 'Der Postbote bleibt vorsichtig am Zaun stehen',
        secondClause: 'der fremde Hund wirkt sehr bissig.',
        correctConnector: 'weil',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Der Postbote bleibt vorsichtig am Zaun stehen, weil der fremde Hund sehr bissig wirkt.',
        connectorType: 'causal',
        explanation: '„weil“ begründet das vorsichtige Stehenbleiben.',
        hint: 'Warum bleibt der Postbote stehen? Begründung wählen.',
      },
      {
        firstClause: 'Der Hofhund bellt jeden Besucher laut an',
        secondClause: 'er ist eigentlich gar nicht bissig.',
        correctConnector: 'aber',
        options: ['weil', 'aber', 'und'],
        combinedSentence: 'Der Hofhund bellt jeden Besucher laut an, aber er ist eigentlich gar nicht bissig.',
        connectorType: 'contrast',
        explanation: '„aber“ stellt das laute Bellen der Friedfertigkeit gegenüber.',
        hint: 'Laut bellen, aber gar nicht beißen – ein beruhigender Gegensatz.',
      },
    ],
  },
};

/**
 * Validates a German sentence semantically and pedagogically for Grade 4:
 * 1. Must NOT contain generic frames like "Du ___ heute." or empty "Er ___ heute."
 * 2. Must be a complete thought with meaningful context.
 * 3. Must have a valid Grade-4 appropriate context.
 */
export function validateSentencePedagogically(sentence: string): {
  isValid: boolean;
  rejectionReason?: string;
} {
  const s = sentence.trim();

  // Reject generic templates with no meaningful predicate/object
  if (/^(Du|Er|Sie|Es|Wir|Ihr)\s+(___|\.\.\.)\s+heute\.?$/i.test(s)) {
    return {
      isValid: false,
      rejectionReason: `Generic template without predicate: "${s}"`,
    };
  }

  if (/^(Du|Er|Sie|Es|Wir|Ihr)\s+[a-zäöüß]+\s+heute\.?$/i.test(s)) {
    return {
      isValid: false,
      rejectionReason: `Incomplete generic sentence: "${s}"`,
    };
  }

  // Check for bare "Du ___ heute gerne." or "Er ___ jeden Tag."
  if (/(___|\.\.\.)\s+(heute gerne|jeden Tag)\.?$/i.test(s)) {
    return {
      isValid: false,
      rejectionReason: `Loose placeholder frame: "${s}"`,
    };
  }

  // Sentences must have at least 3 words
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return {
      isValid: false,
      rejectionReason: `Sentence is too short (< 3 words): "${s}"`,
    };
  }

  return { isValid: true };
}

/**
 * Retrieves the curated bank entry for a given clean word, or provides a safe fallback.
 */
export function getCuratedWordEntry(cleanWord: string): CuratedWordEntry | undefined {
  return CURATED_LERNWOERTER_BANKS[cleanWord];
}
