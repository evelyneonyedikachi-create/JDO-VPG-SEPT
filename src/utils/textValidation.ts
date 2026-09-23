/**
 * Validation helpers for student sentence attempts.
 * Prevents unlocking model solutions with random single-key spam or nonsense characters.
 */

/**
 * Extracts and counts meaningful German/English words from input text.
 * A meaningful word consists of at least 2 alphabetic characters (including German umlauts).
 */
export function extractMeaningfulWords(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  // Match tokens with at least 2 letters, including German umlauts (ä, ö, ü, ß)
  const matches = text.match(/[a-zA-ZäöüÄÖÜß]{2,}/g);
  return matches || [];
}

export function countMeaningfulWords(text: string): number {
  return extractMeaningfulWords(text).length;
}

/**
 * Checks if the student has provided a genuine attempt (at least minWords, e.g. 2–3 words).
 */
export function hasMeaningfulSentenceAttempt(text: string, minWords: number = 2): boolean {
  if (!text || text.trim().length < 6) return false;
  return countMeaningfulWords(text) >= minWords;
}

/**
 * Provides child-friendly guidance and progress feedback on unlocking the model solution.
 */
export function getModelSolutionUnlockStatus(text: string, minWords: number = 2): {
  isUnlocked: boolean;
  wordCount: number;
  requiredWords: number;
  label: string;
} {
  const wordCount = countMeaningfulWords(text);
  const isUnlocked = wordCount >= minWords && text.trim().length >= 6;

  if (isUnlocked) {
    return {
      isUnlocked: true,
      wordCount,
      requiredWords: minWords,
      label: 'Musterbeispiel freigeschaltet',
    };
  }

  if (wordCount === 0) {
    return {
      isUnlocked: false,
      wordCount: 0,
      requiredWords: minWords,
      label: `Schreibe mind. ${minWords} sinnvolle Wörter (0/${minWords})`,
    };
  }

  return {
    isUnlocked: false,
    wordCount,
    requiredWords: minWords,
    label: `Noch 1 weiteres Wort benötigt (${wordCount}/${minWords})`,
  };
}
