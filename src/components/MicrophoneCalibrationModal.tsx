import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { VoiceEngine, VoiceListeningMode } from '../services/voiceEngine';
import { X, Mic, Volume2, Sparkles, CheckCircle2, AlertCircle, Play, Settings2, Sliders, RefreshCw } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface MicrophoneCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  voiceEngine?: VoiceEngine;
  onSaveSettings?: (settings: {
    listeningMode: VoiceListeningMode;
    locale: 'de-DE' | 'en-GB' | 'en-US';
    pauseToleranceMs: number;
  }) => void;
}

export const MicrophoneCalibrationModal: React.FC<MicrophoneCalibrationModalProps> = ({
  isOpen,
  onClose,
  language,
  voiceEngine,
  onSaveSettings,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testVolume, setTestVolume] = useState(0);
  const [testTranscript, setTestTranscript] = useState('');
  const [testResultConfidence, setTestResultConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  
  // Calibration preferences
  const [listeningMode, setListeningMode] = useState<VoiceListeningMode>(
    voiceEngine?.getListeningMode() || 'push_to_talk'
  );
  const [currentLocale, setCurrentLocale] = useState<'de-DE' | 'en-GB' | 'en-US'>(
    (voiceEngine?.getLocale() as any) || (language === 'de' ? 'de-DE' : 'en-GB')
  );
  const [pauseTolerance, setPauseTolerance] = useState<number>(
    voiceEngine?.getPauseTolerance() || 3200
  );
  const [detectedDevices, setDetectedDevices] = useState<string[]>([]);
  const [browserInfo, setBrowserInfo] = useState<string>('');

  const [selectedPracticePhrase, setSelectedPracticePhrase] = useState(
    language === 'de' ? 'Pass den Ball zu Mia.' : 'Pass the ball to Mia.'
  );

  const practicePhrases =
    language === 'de'
      ? [
          'Pass den Ball zu Mia.',
          'Fahr nach links.',
          'Ich möchte aufs Tor schießen.',
          'Brems vor der Kurve.',
          'Pass zu Ben.',
          'Wurf auf den Korb.',
          'Zwei Schritte nach vorne.',
        ]
      : [
          'Pass the ball to Mia.',
          'Drive to the left.',
          'Shoot at the goal.',
          'Brake before the curve.',
          'Pass to Ben.',
          'Shoot at the hoop.',
          'Two steps forward.',
        ];

  const localEngineRef = useRef<VoiceEngine | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const audioInputs = devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => d.label || 'Standard Mikrofon');
        setDetectedDevices(audioInputs.length > 0 ? audioInputs : ['Standard Mikrofon']);
      }).catch(() => {
        setDetectedDevices(['Standard Mikrofon']);
      });

      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) setBrowserInfo('Google Chrome / Chromium Web Speech API');
      else if (ua.includes('Safari')) setBrowserInfo('Apple Safari Speech API');
      else if (ua.includes('Firefox')) setBrowserInfo('Mozilla Firefox Speech API');
      else setBrowserInfo('Standard Browser Speech API');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (localEngineRef.current) {
        localEngineRef.current.stopListening(false);
        localEngineRef.current.stopSpeaking();
      }
      setIsTesting(false);
      setTestVolume(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startMicTest = () => {
    setIsTesting(true);
    setTestTranscript('');
    setTestResultConfidence(null);
    playChime('click');

    const engine = voiceEngine || localEngineRef.current || new VoiceEngine({
      onStateChange: () => {},
      onInterimTranscript: (text) => setTestTranscript(text),
      onFinalTranscript: (text) => {
        setTestTranscript(text);
        evaluateConfidence(text);
      },
      onVolumeChange: (vol) => setTestVolume(vol),
      onVisemeChange: () => {},
      onError: () => setIsTesting(false),
    });

    localEngineRef.current = engine;
    engine.setLocale(currentLocale);
    engine.setListeningMode(listeningMode);
    engine.setPauseTolerance(pauseTolerance);

    engine.startListening({ mode: listeningMode });
  };

  const stopMicTest = () => {
    setIsTesting(false);
    if (localEngineRef.current) {
      localEngineRef.current.stopListening(true);
    }
  };

  const evaluateConfidence = (text: string) => {
    if (!text.trim()) {
      setTestResultConfidence('low');
      return;
    }
    const cleanTarget = selectedPracticePhrase.toLowerCase().replace(/[^a-zäöüß0-9]/gi, '');
    const cleanActual = text.toLowerCase().replace(/[^a-zäöüß0-9]/gi, '');

    if (cleanActual === cleanTarget || cleanActual.includes(cleanTarget) || cleanTarget.includes(cleanActual)) {
      setTestResultConfidence('high');
      playChime('success');
    } else if (cleanActual.length > 2) {
      setTestResultConfidence('medium');
      playChime('score');
    } else {
      setTestResultConfidence('low');
      playChime('repeat_model');
    }
  };

  const testSpeakerVoice = () => {
    playChime('click');
    const engine = voiceEngine || localEngineRef.current || new VoiceEngine({
      onStateChange: () => {},
      onInterimTranscript: () => {},
      onFinalTranscript: () => {},
      onVolumeChange: () => {},
      onVisemeChange: () => {},
      onError: () => {},
    });
    localEngineRef.current = engine;
    const testText =
      language === 'de'
        ? 'Hallo JD! Dein Mikrofon und mein Lautsprecher sind bereit für das Spiel!'
        : 'Hello JD! Your microphone and speaker are calibrated and ready to play!';
    engine.speak(testText, {
      gender: 'boy',
      characterId: 'ben',
      rate: 1.0,
    });
  };

  const handleApply = () => {
    playChime('success');
    if (voiceEngine) {
      voiceEngine.setLocale(currentLocale);
      voiceEngine.setListeningMode(listeningMode);
      voiceEngine.setPauseTolerance(pauseTolerance);
    }
    onSaveSettings?.({
      listeningMode,
      locale: currentLocale,
      pauseToleranceMs: pauseTolerance,
    });
    onClose();
  };

  return (
    <div
      id="mic-calibration-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border-4 border-indigo-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col p-5 sm:p-6 gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {language === 'de' ? '🎙️ Mikrofon & Spracherkennung kalibrieren' : '🎙️ Mic & Voice Calibration'}
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                {language === 'de' ? 'Prüfe Lautstärke, Pausenzeiten und Worterkennung' : 'Check volume, pause tolerance & speech accuracy'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Live Volume & Audio Activity */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              {language === 'de' ? '1. Mikrofon-Pegel & Aktivität' : '1. Microphone Level & Activity'}
            </span>
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {testVolume}% {language === 'de' ? 'Pegel' : 'Level'}
            </span>
          </div>

          {/* Meter Bar */}
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                testVolume > 65
                  ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500'
                  : testVolume > 20
                  ? 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                  : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(testVolume, isTesting ? 15 : 0))}%` }}
            />
          </div>

          {/* Test Trigger Button */}
          <div className="flex flex-wrap gap-2 pt-1">
            {!isTesting ? (
              <button
                onClick={startMicTest}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>{language === 'de' ? 'Mikrofon-Test starten' : 'Start Mic Test'}</span>
              </button>
            ) : (
              <button
                onClick={stopMicTest}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all animate-pulse"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'de' ? 'Test beenden' : 'Stop Test'}</span>
              </button>
            )}

            <button
              onClick={testSpeakerVoice}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Volume2 className="w-4 h-4 text-indigo-600" />
              <span>{language === 'de' ? 'Lautsprecher testen' : 'Test Speaker'}</span>
            </button>
          </div>
        </div>

        {/* 2. Practice Phrases & Live Recognition Feedback */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              {language === 'de' ? '2. Testsatz sprechen' : '2. Practice Test Phrase'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {practicePhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playChime('click');
                  setSelectedPracticePhrase(phrase);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                  selectedPracticePhrase === phrase
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                "{phrase}"
              </button>
            ))}
          </div>

          {/* Spoken Feedback Box */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase text-slate-700">
              {language === 'de' ? 'Du hast gesagt:' : 'You said:'}
            </span>
            <p className="text-base font-black text-slate-900 min-h-[1.75rem]">
              {testTranscript ? (
                <span>"{testTranscript}"</span>
              ) : (
                <span className="text-slate-400 italic font-normal">
                  {language === 'de' ? 'Drücke oben auf den Test-Knopf und sprich...' : 'Tap Start Test above and speak...'}
                </span>
              )}
            </p>
          </div>

          {/* Hardware & Browser Info */}
          <div className="bg-slate-100/80 rounded-xl p-2.5 text-[11px] text-slate-600 flex flex-col gap-1 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">🎙️ {language === 'de' ? 'Eingabegerät:' : 'Input Device:'}</span>
              <span className="font-mono text-slate-800">{detectedDevices[0] || 'Standard Mikrofon'}</span>
            </div>
            {browserInfo && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">🌐 {language === 'de' ? 'Sprach-Engine:' : 'Engine:'}</span>
                <span className="font-mono text-slate-800">{browserInfo}</span>
              </div>
            )}
          </div>

          {/* Confidence Indicator */}
          {testResultConfidence && (
            <div
              className={`p-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border ${
                testResultConfidence === 'high'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : testResultConfidence === 'medium'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testResultConfidence === 'high' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'de' ? '🟢 Perfekt verstanden!' : '🟢 Understood clearly!'}</span>
                </>
              ) : testResultConfidence === 'medium' ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{language === 'de' ? '🟡 Fast verstanden (Befehl erkannt)' : '🟡 Partially matched'}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{language === 'de' ? '🔴 Nicht ganz klar verstanden — bitte noch einmal' : '🔴 Unclear — please repeat'}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. Speech Mode & Tolerance Settings */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            {language === 'de' ? '3. Modus & Erkennungseinstellungen' : '3. Mode & Detection Settings'}
          </span>

          {/* Mode Switch: Continuous vs Push-To-Talk */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                playChime('click');
                setListeningMode('continuous');
              }}
              className={`p-3 rounded-xl text-left border flex flex-col gap-1 transition-all ${
                listeningMode === 'continuous'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-200 font-black'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                🎙️ {language === 'de' ? 'Automatisch zuhören' : 'Continuous Listening'}
              </span>
              <span className="text-[10px] text-slate-600 font-medium">
                {language === 'de' ? 'Mikrofon bleibt offen und erkennt Pausen' : 'Mic stays open and detects pauses'}
              </span>
            </button>

            <button
              onClick={() => {
                playChime('click');
                setListeningMode('push_to_talk');
              }}
              className={`p-3 rounded-xl text-left border flex flex-col gap-1 transition-all ${
                listeningMode === 'push_to_talk'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-200 font-black'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                🔘 {language === 'de' ? 'Drücken & Sprechen (Push-to-Talk)' : 'Push-to-Talk'}
              </span>
              <span className="text-[10px] text-slate-600 font-medium">
                {language === 'de' ? 'Taste gedrückt halten zum Sprechen' : 'Hold button while speaking'}
              </span>
            </button>
          </div>

          {/* Pause Tolerance Slider (Stammer Friendly) */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-800">
                {language === 'de' ? 'Pausen-Geduld (für entspanntes Sprechen):' : 'Pause Tolerance:'}
              </span>
              <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {(pauseTolerance / 1000).toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="4500"
              step="250"
              value={pauseTolerance}
              onChange={(e) => setPauseTolerance(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
              <span>{language === 'de' ? 'Schneller (2.0s)' : 'Faster (2.0s)'}</span>
              <span>{language === 'de' ? 'Sehr geduldig bei Pausen (4.5s)' : 'Patient with pauses (4.5s)'}</span>
            </div>
          </div>

          {/* Speech Locale Selection */}
          <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200">
            <span className="text-xs font-extrabold text-slate-800">
              {language === 'de' ? 'Sprach-Akzent / Region:' : 'Speech Locale:'}
            </span>
            <select
              value={currentLocale}
              onChange={(e) => setCurrentLocale(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg text-xs font-black border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="de-DE">Deutsch (Deutschland / de-DE)</option>
              <option value="en-GB">English (UK / en-GB)</option>
              <option value="en-US">English (US / en-US)</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t pt-4 border-slate-100">
          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold text-sm transition-all"
          >
            {language === 'de' ? 'Abbrechen' : 'Cancel'}
          </button>

          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'de' ? 'Einstellungen speichern' : 'Save & Apply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
