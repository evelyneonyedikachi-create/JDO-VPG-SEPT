import { Language, Viseme } from '../types';

export type VoiceState = 'idle' | 'listening' | 'speech_detected' | 'thinking' | 'speaking' | 'modeling';

export type VoiceListeningMode = 'continuous' | 'push_to_talk';

export interface VoiceEngineCallbacks {
  onStateChange: (state: VoiceState) => void;
  onInterimTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onVolumeChange: (volume: number) => void;
  onVisemeChange: (viseme: Viseme) => void;
  onCurrentWordIndex?: (wordIndex: number) => void;
  onError: (error: string) => void;
}

export class VoiceEngine {
  private recognition: any = null;
  private isListeningActive = false;
  private isSpeakingActive = false;
  private listeningMode: VoiceListeningMode = 'continuous';
  private pauseTimer: NodeJS.Timeout | null = null;
  private pauseToleranceMs = 3500; // Stammer-friendly extended listening tolerance
  private accumulatedTranscript = '';
  private currentLanguage: Language = 'de';
  private currentLocale: 'de-DE' | 'en-GB' | 'en-US' = 'de-DE';
  
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private visemeIntervalId: NodeJS.Timeout | null = null;
  private speechWatchdogTimer: NodeJS.Timeout | null = null;
  private thinkingWatchdogTimer: NodeJS.Timeout | null = null;

  // Persistent reference to active utterance to prevent Chrome Garbage Collection bugs
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  private isSupportedRecognition = false;
  private isSupportedSynthesis = false;

  private callbacks: VoiceEngineCallbacks;

  constructor(callbacks: VoiceEngineCallbacks) {
    this.callbacks = callbacks;
    this.checkSupport();
  }

  public setCallbacks(callbacks: VoiceEngineCallbacks) {
    this.callbacks = callbacks;
  }

  private checkSupport() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.isSupportedRecognition = Boolean(SpeechRecognition);
      this.isSupportedSynthesis = 'speechSynthesis' in window;
    }
  }

  public getSupported() {
    return {
      recognition: this.isSupportedRecognition,
      synthesis: this.isSupportedSynthesis,
    };
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    this.currentLocale = lang === 'de' ? 'de-DE' : 'en-GB';
    if (this.recognition) {
      this.recognition.lang = this.currentLocale;
    }
  }

  public setLocale(locale: 'de-DE' | 'en-GB' | 'en-US') {
    this.currentLocale = locale;
    this.currentLanguage = locale.startsWith('de') ? 'de' : 'en';
    if (this.recognition) {
      this.recognition.lang = locale;
    }
  }

  public getLocale(): string {
    return this.currentLocale;
  }

  public setListeningMode(mode: VoiceListeningMode) {
    this.listeningMode = mode;
  }

  public getListeningMode(): VoiceListeningMode {
    return this.listeningMode;
  }

  public setPauseTolerance(ms: number) {
    this.pauseToleranceMs = Math.max(1800, ms);
  }

  public getPauseTolerance(): number {
    return this.pauseToleranceMs;
  }

  private notifyStateChange(state: VoiceState) {
    if (this.thinkingWatchdogTimer) {
      clearTimeout(this.thinkingWatchdogTimer);
      this.thinkingWatchdogTimer = null;
    }

    // Safety watchdog: if state becomes 'thinking', do not remain stuck longer than 25 seconds
    if (state === 'thinking') {
      this.thinkingWatchdogTimer = setTimeout(() => {
        console.warn('VoiceEngine: Thinking state exceeded 25s watchdog, recovering to idle');
        this.callbacks.onStateChange('idle');
      }, 25000);
    }

    this.callbacks.onStateChange(state);
  }

  public async startListening(options?: { mode?: VoiceListeningMode }) {
    if (options?.mode) {
      this.listeningMode = options.mode;
    }

    // 1. SAFETY: Never allow listening while the avatar TTS is actively speaking!
    if (this.isSpeakingActive) {
      this.stopSpeaking();
    }

    if (this.isListeningActive) return;

    // Start Audio Level visualizer
    await this.startAudioVolumeMonitor();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.callbacks.onError('Dein Browser unterstützt keine Spracherkennung. Du kannst auch tippen!');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      // Push-to-talk can be non-continuous or continuous with immediate finish on release
      this.recognition.continuous = this.listeningMode === 'continuous';
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLocale;
      this.recognition.maxAlternatives = 3;

      this.accumulatedTranscript = '';
      this.isListeningActive = true;
      this.notifyStateChange('listening');

      this.recognition.onstart = () => {
        this.notifyStateChange('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interimText = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalChunk += result[0].transcript + ' ';
          } else {
            interimText += result[0].transcript;
          }
        }

        if (finalChunk) {
          this.accumulatedTranscript += finalChunk;
        }

        const fullCurrentText = (this.accumulatedTranscript + ' ' + interimText).trim();
        this.callbacks.onInterimTranscript(fullCurrentText);
        this.notifyStateChange('speech_detected');

        // In continuous mode, reset the pause timer on any voice activity with adaptive pause detection
        if (this.listeningMode === 'continuous') {
          this.resetPauseTimer(fullCurrentText);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition event warning:', event.error);
        if (event.error === 'not-allowed') {
          this.callbacks.onError('Bitte erlaube den Mikrofon-Zugriff im Browser!');
          this.stopListening(false);
        } else if (event.error === 'no-speech') {
          // No speech detected yet, continue waiting patiently
        } else if (event.error === 'network') {
          // Network hiccup
        }
      };

      this.recognition.onend = () => {
        if (this.isListeningActive) {
          // In push-to-talk, onend finishes the turn
          if (this.listeningMode === 'push_to_talk') {
            this.concludeSpeech();
            return;
          }

          // If still marked active but recognition stopped automatically, conclude if text exists, or restart
          if (this.accumulatedTranscript.trim().length > 0) {
            this.concludeSpeech();
          } else {
            try {
              if (this.isListeningActive && this.recognition && !this.isSpeakingActive) {
                this.recognition.start();
              }
            } catch {
              this.stopListening(false);
            }
          }
        }
      };

      this.recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      this.stopListening(false);
    }
  }

  private resetPauseTimer(currentText = '') {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
    }
    
    // Adaptive silence detection:
    // If a full phrase/sentence (3+ words or ending with punctuation) has been spoken, trigger faster (1.5s)
    // If short (1-2 words) or ending with conjunction/filler ("und", "and", "weil"), give more patience (2.4s)
    const words = currentText.trim().split(/\s+/).filter(Boolean);
    const lastWord = words.length > 0 ? words[words.length - 1].toLowerCase() : '';
    const isConnector = ['und', 'and', 'oder', 'or', 'aber', 'but', 'weil', 'because', 'dann', 'then', 'also'].includes(lastWord);
    
    let effectiveDelay = this.pauseToleranceMs;
    if (words.length >= 3 && !isConnector) {
      // Perceived latency reduction: 1.5 seconds of silence after a clear sentence
      effectiveDelay = Math.min(1500, this.pauseToleranceMs);
    } else if (words.length >= 1 && !isConnector) {
      effectiveDelay = Math.min(2200, this.pauseToleranceMs);
    }

    this.pauseTimer = setTimeout(() => {
      if (this.isListeningActive && this.accumulatedTranscript.trim().length > 0) {
        this.concludeSpeech();
      }
    }, effectiveDelay);
  }

  private concludeSpeech() {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    const finalText = this.accumulatedTranscript.trim();
    this.stopListening(false);

    if (finalText.length > 0) {
      this.notifyStateChange('thinking');
      this.callbacks.onFinalTranscript(finalText);
    } else {
      this.notifyStateChange('idle');
    }
  }

  public stopListening(submit = true) {
    this.isListeningActive = false;
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }

    this.stopAudioVolumeMonitor();

    const finalText = this.accumulatedTranscript.trim();
    this.accumulatedTranscript = '';

    if (submit && finalText.length > 0) {
      this.notifyStateChange('thinking');
      this.callbacks.onFinalTranscript(finalText);
    } else {
      this.notifyStateChange('idle');
    }
  }

  private async startAudioVolumeMonitor() {
    try {
      if (!this.audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser || !this.isListeningActive) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        this.callbacks.onVolumeChange(normalized);
        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Audio monitor unavailable:', e);
    }
  }

  private stopAudioVolumeMonitor() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.callbacks.onVolumeChange(0);
  }

  /**
   * Speak playmate response using SpeechSynthesis with lip-sync visemes and anti-hang safety
   */
  public speak(
    text: string,
    options?: {
      pitch?: number;
      rate?: number;
      gender?: 'boy' | 'girl';
      characterId?: string;
      isSlow?: boolean;
      isModeling?: boolean;
      onEnd?: () => void;
    }
  ) {
    // 1. SAFETY: Stop microphone recognition immediately so the system NEVER hears or transcribes the avatar's own voice!
    this.stopListening(false);
    this.isSpeakingActive = true;

    if (!text || text.trim().length === 0) {
      this.isSpeakingActive = false;
      this.notifyStateChange('idle');
      options?.onEnd?.();
      return;
    }

    if (!this.isSupportedSynthesis) {
      // Browser does not support speech synthesis, simulate visual lip-sync and finish
      this.notifyStateChange(options?.isModeling ? 'modeling' : 'speaking');
      this.startLipSyncSimulation();
      const wordsCount = text.split(/\s+/).length;
      const fakeDuration = Math.min(6000, Math.max(1500, wordsCount * 300));
      setTimeout(() => {
        this.stopLipSync();
        this.isSpeakingActive = false;
        this.notifyStateChange('idle');
        options?.onEnd?.();
      }, fakeDuration);
      return;
    }

    this.stopSpeaking();
    this.isSpeakingActive = true;

    // Ensure audio subsystem is active in browser
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}

    const utterance = new SpeechSynthesisUtterance(text);
    this.activeUtterance = utterance; // Keep reference to prevent GC bug in Chromium
    utterance.lang = this.currentLocale;

    // Determine character-specific pitch, rate, and vocal personality
    const characterId = options?.characterId?.toLowerCase() || (options?.gender === 'girl' ? 'mia' : 'ben');
    const isGirl = options?.gender === 'girl' || characterId === 'mia' || characterId === 'sophie' || characterId === 'emma';
    const isModeling = options?.isModeling || options?.isSlow;

    let basePitch = options?.pitch;
    let baseRate = options?.rate;

    if (!basePitch || !baseRate) {
      switch (characterId) {
        case 'mia':
          // Mia: Warm + thoughtful + expressive female voice (10–12 yr old African girl)
          basePitch = isModeling ? 1.14 : 1.22;
          baseRate = isModeling ? 0.74 : 0.94;
          break;
        case 'sophie':
          // Sophie: Bright + playful + lively female voice (10–12 yr old girl)
          basePitch = isModeling ? 1.18 : 1.28;
          baseRate = isModeling ? 0.75 : 1.02;
          break;
        case 'emma':
          // Emma: Gentle, patient female voice
          basePitch = isModeling ? 1.12 : 1.20;
          baseRate = isModeling ? 0.72 : 0.90;
          break;
        case 'ben':
          // Ben: Energetic + sporty boy voice (10–12 yr old)
          basePitch = isModeling ? 1.02 : 1.06;
          baseRate = isModeling ? 0.73 : 1.04;
          break;
        case 'leo':
          // Leo: Calm + curious boy voice (10–12 yr old)
          basePitch = isModeling ? 1.00 : 1.02;
          baseRate = isModeling ? 0.74 : 0.95;
          break;
        default:
          basePitch = isGirl ? (isModeling ? 1.14 : 1.22) : (isModeling ? 1.00 : 1.04);
          baseRate = isModeling ? 0.74 : 0.96;
          break;
      }
    } else if (isModeling) {
      baseRate = Math.min(0.75, baseRate * 0.76);
      basePitch = Math.max(0.98, basePitch * 0.98);
    }

    // Pick consistent, high-quality character voice matching the gender, personality & language
    try {
      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = this.currentLanguage === 'de' ? 'de' : 'en';
      const matchingVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));
      const pool = matchingVoices.length > 0 ? matchingVoices : voices;

      const femaleNameKeywords = [
        'katja', 'hedda', 'marlene', 'anna', 'petra', 'helena', 'amala', 'luisa',
        'louisa', 'maja', 'gisela', 'klara', 'gudrun', 'viktoria', 'victoria',
        'samantha', 'karen', 'zira', 'jenny', 'aria', 'sonia', 'libby', 'maisie',
        'natasha', 'clara', 'neerja', 'ava', 'allison', 'susan', 'zoe', 'serena',
        'kate', 'audrey', 'veena', 'fiona', 'moira', 'tessa', 'sangeeta', 'stephanie',
        'emily', 'olivia', 'catherine', 'hazel', 'female', 'frau', 'girl', 'woman',
        'de-de-x-dea', 'de-de-x-deg', 'en-us-x-sfg', 'en-us-x-tpd'
      ];

      const maleNameKeywords = [
        'stefan', 'markus', 'yannick', 'daniel', 'hans', 'martin', 'florian',
        'jürgen', 'juergen', 'bernd', 'klaus', 'christoph', 'conrad', 'killian',
        'ralf', 'ralph', 'male', 'mann', 'boy', 'guy', 'david', 'alex', 'oliver',
        'george', 'fred', 'tom', 'bruce', 'junior', 'arthur', 'james', 'john',
        'en-us-x-iom', 'en-us-x-iob', 'de-de-x-deb'
      ];

      let preferredVoice: SpeechSynthesisVoice | undefined;

      if (isGirl) {
        // Strict female voice selection for Mia, Sophie, Emma
        if (characterId === 'mia') {
          // Mia prefers warm, expressive female voices
          preferredVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes('katja') ||
              name.includes('hedda') ||
              name.includes('anna') ||
              name.includes('amala') ||
              name.includes('luisa') ||
              name.includes('samantha') ||
              name.includes('karen') ||
              name.includes('victoria') ||
              name.includes('jenny') ||
              name.includes('ava')
            );
          });
        } else if (characterId === 'sophie') {
          // Sophie prefers bright, lively female voices
          preferredVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes('marlene') ||
              name.includes('anna') ||
              name.includes('maja') ||
              name.includes('katja') ||
              name.includes('aria') ||
              name.includes('victoria') ||
              name.includes('libby') ||
              name.includes('maisie') ||
              name.includes('samantha')
            );
          });
        }

        // Secondary search: Any voice with female identifiers
        if (!preferredVoice) {
          preferredVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return femaleNameKeywords.some((keyword) => name.includes(keyword));
          });
        }

        // Tertiary search: Any voice that does NOT contain male identifiers
        if (!preferredVoice) {
          preferredVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return !maleNameKeywords.some((keyword) => name.includes(keyword));
          });
        }

        // If fallback voice might be generic/male (like "Google Deutsch"), boost pitch to guarantee female child timbre
        if (!preferredVoice || maleNameKeywords.some((kw) => preferredVoice?.name.toLowerCase().includes(kw))) {
          basePitch = Math.max(1.28, basePitch * 1.12);
        }
      } else {
        // Boy voice selection for Ben, Leo, Max
        if (characterId === 'ben') {
          preferredVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes('stefan') ||
              name.includes('yannick') ||
              name.includes('markus') ||
              name.includes('alex') ||
              name.includes('oliver') ||
              name.includes('george')
            );
          });
        } else if (characterId === 'leo') {
          preferredVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes('markus') ||
              name.includes('martin') ||
              name.includes('daniel') ||
              name.includes('oliver') ||
              name.includes('alex')
            );
          });
        }

        if (!preferredVoice) {
          preferredVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return maleNameKeywords.some((keyword) => name.includes(keyword));
          });
        }

        if (!preferredVoice) {
          preferredVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return !femaleNameKeywords.some((keyword) => name.includes(keyword));
          });
        }
      }

      if (!preferredVoice) {
        preferredVoice = pool[0];
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    } catch {}

    utterance.pitch = basePitch;
    utterance.rate = baseRate;

    let wordIdx = 0;
    utterance.onboundary = (event: any) => {
      if (event.name === 'word') {
        if (this.callbacks.onCurrentWordIndex) {
          this.callbacks.onCurrentWordIndex(wordIdx);
        }
        wordIdx++;
      }
    };

    let hasEnded = false;
    const cleanupAndFinish = () => {
      if (hasEnded) return;
      hasEnded = true;
      this.isSpeakingActive = false;
      if (this.speechWatchdogTimer) {
        clearTimeout(this.speechWatchdogTimer);
        this.speechWatchdogTimer = null;
      }
      this.activeUtterance = null;
      this.stopLipSync();
      this.notifyStateChange('idle');
      try {
        options?.onEnd?.();
      } catch (err) {
        console.error('Error in onEnd callback:', err);
      }
    };

    utterance.onstart = () => {
      this.notifyStateChange(options?.isModeling ? 'modeling' : 'speaking');
      this.startLipSyncSimulation();
    };

    utterance.onend = () => {
      cleanupAndFinish();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error or cancelled:', e);
      cleanupAndFinish();
    };

    // Calculate maximum expected duration + 4s buffer to guarantee the avatar never hangs
    const wordsCount = text.split(/\s+/).length;
    const maxExpectedMs = Math.max(3500, Math.round((wordsCount / (baseRate * 2.2)) * 1000) + 4000);
    this.speechWatchdogTimer = setTimeout(() => {
      console.warn('Speech synthesis watchdog timeout reached, completing voice turn');
      cleanupAndFinish();
    }, maxExpectedMs);

    // Immediately trigger speaking state & lip sync in case onstart takes a moment
    this.notifyStateChange(options?.isModeling ? 'modeling' : 'speaking');
    this.startLipSyncSimulation();

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger window.speechSynthesis.speak:', err);
      cleanupAndFinish();
    }
  }

  private startLipSyncSimulation() {
    this.stopLipSync();
    const visemes: Viseme[] = ['open_small', 'open_medium', 'open_wide', 'round', 'smile', 'open_medium'];
    let idx = 0;

    this.visemeIntervalId = setInterval(() => {
      const viseme = visemes[idx % visemes.length];
      this.callbacks.onVisemeChange(viseme);
      idx++;
    }, 120);
  }

  private stopLipSync() {
    if (this.visemeIntervalId) {
      clearInterval(this.visemeIntervalId);
      this.visemeIntervalId = null;
    }
    this.callbacks.onVisemeChange('closed');
    if (this.callbacks.onCurrentWordIndex) {
      this.callbacks.onCurrentWordIndex(-1);
    }
  }

  public stopSpeaking() {
    this.isSpeakingActive = false;
    if (this.speechWatchdogTimer) {
      clearTimeout(this.speechWatchdogTimer);
      this.speechWatchdogTimer = null;
    }
    if (this.thinkingWatchdogTimer) {
      clearTimeout(this.thinkingWatchdogTimer);
      this.thinkingWatchdogTimer = null;
    }
    this.activeUtterance = null;
    if (this.isSupportedSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.stopLipSync();
    if (!this.isListeningActive) {
      this.notifyStateChange('idle');
    }
  }

  public destroy() {
    this.stopListening(false);
    this.stopSpeaking();
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}

