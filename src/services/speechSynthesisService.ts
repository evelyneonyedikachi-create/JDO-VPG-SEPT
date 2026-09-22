/**
 * Responsive, zero-latency Web Speech Synthesis for German TTS.
 * Reads instructions, words, and sentences aloud with playmate persona pitch/rate.
 */

let synth: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  if (!synth && 'speechSynthesis' in window) {
    synth = window.speechSynthesis;
  }
  return synth;
}

export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  avatarId?: 'mia' | 'ben' | 'leo' | 'sophie' | string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function stopSpeaking() {
  const s = getSynth();
  if (s) {
    s.cancel();
  }
  currentUtterance = null;
}

export function isCurrentlySpeaking(): boolean {
  const s = getSynth();
  return !!s && s.speaking;
}

export function speakGerman(text: string, options: SpeakOptions = {}) {
  const s = getSynth();
  if (!s || !text.trim()) {
    options.onEnd?.();
    return;
  }

  // Cancel any existing speech
  s.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';

  // Find German voice if available
  const voices = s.getVoices();
  const germanVoices = voices.filter((v) => v.lang.startsWith('de'));
  
  if (germanVoices.length > 0) {
    // Pick female for Mia / Sophie, male for Ben / Leo if available
    const isGirl = options.avatarId === 'mia' || options.avatarId === 'sophie';
    const preferredVoice = germanVoices.find((v) => {
      const name = v.name.toLowerCase();
      if (isGirl) {
        return name.includes('hedda') || name.includes('katja') || name.includes('marlene') || name.includes('female') || name.includes('girl');
      }
      return name.includes('stefan') || name.includes('conrad') || name.includes('male') || name.includes('boy');
    }) || germanVoices[0];

    utterance.voice = preferredVoice;
  }

  // Set avatar specific cadence
  if (options.avatarId === 'mia') {
    utterance.pitch = options.pitch ?? 1.15;
    utterance.rate = options.rate ?? 0.95;
  } else if (options.avatarId === 'ben') {
    utterance.pitch = options.pitch ?? 1.05;
    utterance.rate = options.rate ?? 1.02;
  } else if (options.avatarId === 'leo') {
    utterance.pitch = options.pitch ?? 1.02;
    utterance.rate = options.rate ?? 0.94;
  } else if (options.avatarId === 'sophie') {
    utterance.pitch = options.pitch ?? 1.22;
    utterance.rate = options.rate ?? 1.02;
  } else {
    utterance.pitch = options.pitch ?? 1.05;
    utterance.rate = options.rate ?? 0.98;
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    currentUtterance = null;
    options.onEnd?.();
  };

  currentUtterance = utterance;
  s.speak(utterance);
}
