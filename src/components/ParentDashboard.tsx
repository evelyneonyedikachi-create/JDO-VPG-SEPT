import React, { useState, useEffect, useRef } from 'react';
import { TOPICS } from '../data/topics';
import { CorrectionLevel, Language, ParentSettings, PersonalMemory, SessionStats } from '../types';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Sliders,
  Sparkles,
  Clock,
  BookOpen,
  Trophy,
  Trash2,
  Download,
  X,
  Check,
  User,
  Heart,
  Activity,
  Headphones,
} from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface ParentDashboardProps {
  language: Language;
  parentSettings: ParentSettings;
  sessionHistory: SessionStats[];
  onUpdateSettings: (newSettings: ParentSettings) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  language,
  parentSettings,
  sessionHistory,
  onUpdateSettings,
  onClearHistory,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'memory' | 'speech' | 'mic_test' | 'topics' | 'history' | 'privacy'>('memory');
  const [parentTestTesting, setParentTestTesting] = useState(false);
  const [parentTestVolume, setParentTestVolume] = useState(0);
  const [parentTestTranscript, setParentTestTranscript] = useState('');
  const [parentTestPhrase, setParentTestPhrase] = useState('Pass den Ball zu Mia.');
  const [parentTestMatch, setParentTestMatch] = useState<'match' | 'partial' | 'miss' | null>(null);
  const [detectedDevices, setDetectedDevices] = useState<string[]>([]);
  const [detectedBrowser, setDetectedBrowser] = useState<string>('');
  const parentTestEngineRef = useRef<any>(null);

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
      if (ua.includes('Chrome')) setDetectedBrowser('Google Chrome / Chromium Web Speech API');
      else if (ua.includes('Safari')) setDetectedBrowser('Apple Safari Speech API');
      else if (ua.includes('Firefox')) setDetectedBrowser('Mozilla Firefox Speech API');
      else setDetectedBrowser('Standard Web Speech API');
    }
  }, []);

  const handleStartParentMicTest = () => {
    setParentTestTesting(true);
    setParentTestTranscript('');
    setParentTestMatch(null);
    playChime('click');

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported in this browser.');
      setParentTestTesting(false);
      return;
    }

    const rec = new SpeechRec();
    rec.lang = language === 'de' ? 'de-DE' : 'en-GB';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    rec.onresult = (event: any) => {
      let finalStr = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          setParentTestTranscript(event.results[i][0].transcript);
        }
      }
      if (finalStr) {
        setParentTestTranscript(finalStr);
        const cleanTarget = parentTestPhrase.toLowerCase().replace(/[^a-zäöüß0-9]/gi, '');
        const cleanActual = finalStr.toLowerCase().replace(/[^a-zäöüß0-9]/gi, '');
        if (cleanActual === cleanTarget || cleanActual.includes(cleanTarget) || cleanTarget.includes(cleanActual)) {
          setParentTestMatch('match');
          playChime('success');
        } else if (cleanActual.length > 3) {
          setParentTestMatch('partial');
          playChime('score');
        } else {
          setParentTestMatch('miss');
          playChime('repeat_model');
        }
      }
    };

    rec.onerror = () => {
      setParentTestTesting(false);
    };

    rec.onend = () => {
      setParentTestTesting(false);
    };

    try {
      rec.start();
      parentTestEngineRef.current = rec;
    } catch (e) {
      console.warn(e);
      setParentTestTesting(false);
    }
  };

  const handleStopParentMicTest = () => {
    setParentTestTesting(false);
    if (parentTestEngineRef.current) {
      try {
        parentTestEngineRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const [tempSettings, setTempSettings] = useState<ParentSettings>({
    ...parentSettings,
    correctionLevel: parentSettings.correctionLevel || 'balanced',
    listeningBackEnabled: parentSettings.listeningBackEnabled ?? true,
    personalMemory: {
      favoriteFootballTeam: parentSettings.personalMemory?.favoriteFootballTeam || 'FC Bayern München',
      favoritePlayer: parentSettings.personalMemory?.favoritePlayer || 'Jamal Musiala & Mbappé',
      safeFriends: parentSettings.personalMemory?.safeFriends || ['Noah', 'David', 'Leo'],
      favoriteCartoon: parentSettings.personalMemory?.favoriteCartoon || 'Paw Patrol & Ninjago',
      recentBook: parentSettings.personalMemory?.recentBook || 'Die drei ??? Kids & David und Goliath',
      holidayMemory: parentSettings.personalMemory?.holidayMemory || 'Sommerurlaub am Meer & Bolzplatz',
      customNotes: parentSettings.personalMemory?.customNotes || 'Freut sich über Fußballtricks, Bibelgeschichten und Rätsel.',
    },
  });

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === tempSettings.pin || pinInput === '1234') {
      setIsUnlocked(true);
      setPinError(false);
      playChime('click');
    } else {
      setPinError(true);
    }
  };

  const handleSave = () => {
    onUpdateSettings(tempSettings);
    playChime('click');
    onClose();
  };

  const updateMemoryField = (field: keyof PersonalMemory, value: any) => {
    setTempSettings((prev) => ({
      ...prev,
      personalMemory: {
        ...(prev.personalMemory || {}),
        [field]: value,
      },
    }));
  };

  const toggleTopic = (topicId: string) => {
    setTempSettings((prev) => ({
      ...prev,
      enabledTopics: {
        ...prev.enabledTopics,
        [topicId]: !prev.enabledTopics[topicId],
      },
    }));
  };

  const setTopicPriority = (topicId: string, priority: 'high' | 'normal' | 'low') => {
    setTempSettings((prev) => ({
      ...prev,
      topicPriorities: {
        ...prev.topicPriorities,
        [topicId]: priority,
      },
    }));
  };

  const totalMinutesTalked = Math.round(
    sessionHistory.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
  );

  const totalTurns = sessionHistory.reduce(
    (sum, s) => sum + (s.jedidiahTurnCount ?? s.jdTurnCount ?? 0),
    0
  );

  return (
    <div
      id="parent-dashboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xl text-slate-900 my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            {isUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {language === 'de' ? 'Eltern-Bereich & Sicherheit' : 'Parent Dashboard & Safety'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'de'
                ? 'Privat geschützter Bereich für Interessen, Korrekturlevel, Pausen & Beobachtungen'
                : 'Protected controls for child interests, correction level, pacing & observations'}
            </p>
          </div>
        </div>

        {/* PIN Authentication Screen if Locked */}
        {!isUnlocked ? (
          <form onSubmit={handleVerifyPin} className="max-w-sm mx-auto py-8 text-center">
            <p className="text-sm text-slate-600 mb-4">
              {language === 'de'
                ? 'Bitte gib deine 4-stellige Eltern-PIN ein (Standard: 1234):'
                : 'Enter your 4-digit parent PIN (Default: 1234):'}
            </p>
            <div className="flex justify-center mb-4">
              <input
                id="input-parent-pin"
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="1234"
                className="w-40 text-center text-2xl tracking-widest py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            {pinError && (
              <p className="text-xs text-rose-500 font-semibold mb-3">
                {language === 'de' ? 'Falsche PIN. Bitte versuche 1234.' : 'Incorrect PIN. Try 1234.'}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white transition-all shadow-sm"
            >
              {language === 'de' ? 'Entsperren' : 'Unlock'}
            </button>
          </form>
        ) : (
          /* Unlocked Content Tabs */
          <div>
            {/* Nav Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 mb-6">
              {[
                { id: 'memory', labelDe: 'Persönliche Interessen 🌟', labelEn: 'Interests & Memory 🌟' },
                { id: 'speech', labelDe: 'Sprech-Pausen & Feedback 🎙️', labelEn: 'Pacing & Feedback 🎙️' },
                { id: 'mic_test', labelDe: 'Mikrofon testen 🎤', labelEn: 'Test Microphone 🎤' },
                { id: 'topics', labelDe: 'Themen-Steuerung ⚽', labelEn: 'Topic Controls ⚽' },
                { id: 'history', labelDe: 'Sitzungs-Verlauf 📊', labelEn: 'Session History 📊' },
                { id: 'privacy', labelDe: 'Datenschutz & DSGVO 🛡️', labelEn: 'Privacy & Data 🛡️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'de' ? tab.labelDe : tab.labelEn}
                </button>
              ))}
            </div>

            {/* TAB: Personal Memory & Child Profile */}
            {activeTab === 'memory' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800 flex items-start gap-2">
                  <Heart className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    {language === 'de'
                      ? 'Diese Angaben helfen den KI-Freunden, Jedidiahs Lieblings-Themen natürlich einzubringen. Sie werden niemals weitergegeben.'
                      : 'These details allow AI playmates to naturally connect with Jedidiah’s real-world interests. Kept 100% private.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lieblingsverein */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      ⚽ {language === 'de' ? 'Lieblings-Fußballverein' : 'Favorite Football Team'}
                    </label>
                    <input
                      type="text"
                      value={tempSettings.personalMemory?.favoriteFootballTeam || ''}
                      onChange={(e) => updateMemoryField('favoriteFootballTeam', e.target.value)}
                      placeholder="z.B. FC Bayern München"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Lieblingsspieler */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      🏃 {language === 'de' ? 'Lieblingsspieler / Vorbilder' : 'Favorite Players'}
                    </label>
                    <input
                      type="text"
                      value={tempSettings.personalMemory?.favoritePlayer || ''}
                      onChange={(e) => updateMemoryField('favoritePlayer', e.target.value)}
                      placeholder="z.B. Jamal Musiala, Kylian Mbappé"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Freunde */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      🧑‍🤝‍🧑 {language === 'de' ? 'Echte Freunde (Namen)' : 'Real-Life Friends'}
                    </label>
                    <input
                      type="text"
                      value={(tempSettings.personalMemory?.safeFriends || []).join(', ')}
                      onChange={(e) =>
                        updateMemoryField(
                          'safeFriends',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      placeholder="z.B. Noah, David, Leo"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Lieblingsserien / Cartoons */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      📺 {language === 'de' ? 'Lieblingsserien / Helden' : 'Favorite Shows'}
                    </label>
                    <input
                      type="text"
                      value={tempSettings.personalMemory?.favoriteCartoon || ''}
                      onChange={(e) => updateMemoryField('favoriteCartoon', e.target.value)}
                      placeholder="z.B. Ninjago, Paw Patrol"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Letztes Buch / Bibelgeschichte */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      📖 {language === 'de' ? 'Bücher & Geschichten' : 'Recent Books & Stories'}
                    </label>
                    <input
                      type="text"
                      value={tempSettings.personalMemory?.recentBook || ''}
                      onChange={(e) => updateMemoryField('recentBook', e.target.value)}
                      placeholder="z.B. Die drei ??? Kids, David und Goliath"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Besondere Notizen */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      📝 {language === 'de' ? 'Besondere Hinweise für die KI' : 'Special Notes for AI'}
                    </label>
                    <input
                      type="text"
                      value={tempSettings.personalMemory?.customNotes || ''}
                      onChange={(e) => updateMemoryField('customNotes', e.target.value)}
                      placeholder="z.B. Mag Witze, fragt gerne nach Tieren"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Speech & Pacing Settings */}
            {activeTab === 'speech' && (
              <div className="space-y-5">
                {/* Correction Level Selector */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <label className="text-sm font-bold text-slate-900 block mb-1">
                    🎯 {language === 'de' ? 'Korrektur & Modellierungs-Stil' : 'Correction & Modeling Style'}
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    {language === 'de'
                      ? 'Bestimmt, wie intensiv die KI bei verdrehten Sätzen sanft als Vorbild antwortet.'
                      : 'Controls how the AI models grammatically clear sentence structures.'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'none', labelDe: 'Keine (Nur Spaß)', labelEn: 'None (Pure Chat)' },
                      { id: 'gentle', labelDe: 'Sehr sanft (Selten)', labelEn: 'Gentle (Rare)' },
                      { id: 'balanced', labelDe: 'Ausgewogen ⭐', labelEn: 'Balanced ⭐' },
                      { id: 'focused', labelDe: 'Aktiv üben', labelEn: 'Active Practice' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() =>
                          setTempSettings((prev) => ({
                            ...prev,
                            correctionLevel: lvl.id as CorrectionLevel,
                          }))
                        }
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          (tempSettings.correctionLevel || 'balanced') === lvl.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {language === 'de' ? lvl.labelDe : lvl.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listening-Back Mode Toggle */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-purple-600" />
                      <span>{language === 'de' ? 'Listening-Back Modus (Eigene Stimme anhören)' : 'Listening-Back Mode'}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      {language === 'de'
                        ? 'Blendet im Gespräch einen Knopf ein, mit dem Jedidiah seinen letzten gesprochenen Satz selbst noch einmal anhören kann.'
                        : 'Enables an optional button for Jedidiah to play back his own voice.'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setTempSettings((prev) => ({
                        ...prev,
                        listeningBackEnabled: !prev.listeningBackEnabled,
                      }))
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      tempSettings.listeningBackEnabled
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tempSettings.listeningBackEnabled
                      ? language === 'de'
                        ? 'Aktiv'
                        : 'On'
                      : language === 'de'
                      ? 'Aus'
                      : 'Off'}
                  </button>
                </div>

                {/* Stammer-Friendly Pause Tolerance */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-slate-900">
                      {language === 'de'
                        ? 'Zuhör-Geduld / Pausen-Toleranz (Stotter-Sensitivität)'
                        : 'Listening Pause Tolerance (Stammer-Friendly)'}
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      {(tempSettings.pauseToleranceMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2000}
                    max={5000}
                    step={250}
                    value={tempSettings.pauseToleranceMs}
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        pauseToleranceMs: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Speech Rate Selection */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <label className="text-sm font-bold text-slate-900 block mb-2">
                    {language === 'de'
                      ? 'Sprechtempo der KI-Spielfreunde'
                      : 'AI Playmate Speech Speed'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'slow', labelDe: 'Ruhig (0.85x)', labelEn: 'Slow (0.85x)' },
                      { id: 'normal', labelDe: 'Normal (0.95x)', labelEn: 'Normal (0.95x)' },
                      { id: 'faster', labelDe: 'Flott (1.05x)', labelEn: 'Fast (1.05x)' },
                    ].map((rate) => (
                      <button
                        key={rate.id}
                        type="button"
                        onClick={() =>
                          setTempSettings((prev) => ({
                            ...prev,
                            speechRate: rate.id as any,
                          }))
                        }
                        className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                          tempSettings.speechRate === rate.id
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {language === 'de' ? rate.labelDe : rate.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Microphone Test & Calibration */}
            {activeTab === 'mic_test' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800">
                  {language === 'de'
                    ? 'Hier können Eltern die Erkennungsgenauigkeit des Mikrofons und der Web Speech API testen, ohne ein Spiel starten zu müssen.'
                    : 'Parents can test speech recognition accuracy and microphone fidelity directly here without starting a game.'}
                </div>

                {/* Test Phrases */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="text-xs font-black uppercase text-slate-700 block mb-2">
                    {language === 'de' ? '1. Wähle einen Test-Satz:' : '1. Select a Test Phrase:'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Pass den Ball zu Mia.',
                      'Fahr nach links.',
                      'Ich möchte aufs Tor schießen.',
                      'Brems vor der Kurve.',
                      'Pass zu Ben.',
                    ].map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          playChime('click');
                          setParentTestPhrase(phrase);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          parentTestPhrase === phrase
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        "{phrase}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mic Record Button */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-700">
                      {language === 'de' ? '2. Teste die Spracheingabe:' : '2. Test Speech Input:'}
                    </span>
                  </div>

                  {!parentTestTesting ? (
                    <button
                      type="button"
                      onClick={handleStartParentMicTest}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <span>🎙️ {language === 'de' ? 'Mikrofon-Test starten' : 'Start Mic Test'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopParentMicTest}
                      className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all animate-pulse"
                    >
                      <span>🛑 {language === 'de' ? 'Aufnahme stoppen' : 'Stop Recording'}</span>
                    </button>
                  )}

                  {/* Recognized text box */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <span className="text-[11px] font-bold uppercase text-slate-700 block mb-1">
                      {language === 'de' ? 'Du hast gesagt:' : 'You said:'}
                    </span>
                    <p className="text-base font-black text-slate-900 min-h-[1.75rem]">
                      {parentTestTranscript ? (
                        <span>"{parentTestTranscript}"</span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">
                          {parentTestTesting
                            ? language === 'de'
                              ? 'Höre zu... sprich jetzt!'
                              : 'Listening... speak now!'
                            : language === 'de'
                            ? 'Drücke auf den Start-Knopf oben und sprich...'
                            : 'Click Start above and speak...'}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Match indicator */}
                  {parentTestMatch && (
                    <div
                      className={`p-3 rounded-xl text-xs font-extrabold border ${
                        parentTestMatch === 'match'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : parentTestMatch === 'partial'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {parentTestMatch === 'match'
                        ? language === 'de'
                          ? '🟢 Perfekt verstanden! Der Test-Satz stimmt überein.'
                          : '🟢 Understood clearly! Matched test phrase.'
                        : parentTestMatch === 'partial'
                        ? language === 'de'
                          ? '🟡 Teilweise verstanden / sinnverwandter Befehl.'
                          : '🟡 Partially matched command.'
                        : language === 'de'
                        ? '🔴 Nicht verstanden / Stimme zu leise oder undeutlich.'
                        : '🔴 Unclear / microphone low volume or noise.'}
                    </div>
                  )}

                  {/* Device / browser hardware info */}
                  <div className="bg-slate-100/80 rounded-xl p-3 text-xs text-slate-600 flex flex-col gap-1.5 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">🎙️ {language === 'de' ? 'Erkanntes Eingabegerät:' : 'Audio Input:'}</span>
                      <span className="font-mono text-slate-800">{detectedDevices[0] || 'Standard Mikrofon'}</span>
                    </div>
                    {detectedBrowser && (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">🌐 {language === 'de' ? 'Spracherkennungs-Engine:' : 'Engine:'}</span>
                        <span className="font-mono text-slate-800">{detectedBrowser}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Topics Management */}
            {activeTab === 'topics' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800">
                  {language === 'de'
                    ? 'Hier können Sie Themen aktivieren, deaktivieren oder als Favorit hervorheben. Die KI bleibt streng innerhalb der gewählten Themen.'
                    : 'Enable, disable, or prioritize specific topic areas. The AI strictly respects family-configured boundaries.'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {TOPICS.map((t) => {
                    const isEnabled = tempSettings.enabledTopics[t.id] !== false;
                    const priority = tempSettings.topicPriorities[t.id] || 'normal';

                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{t.emoji}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {language === 'de' ? t.nameDe : t.nameEn}
                            </p>
                            <span className="text-[10px] text-slate-500">{t.badge}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setTopicPriority(
                                t.id,
                                priority === 'high' ? 'normal' : 'high'
                              )
                            }
                            className={`px-2 py-1 rounded text-[11px] font-bold ${
                              priority === 'high'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                            title="Als Favorit nach oben setzen"
                          >
                            ★ High
                          </button>
                          <button
                            onClick={() => toggleTopic(t.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isEnabled
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isEnabled
                              ? language === 'de'
                                ? 'Aktiv'
                                : 'Enabled'
                              : language === 'de'
                              ? 'Aus'
                              : 'Hidden'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: Session History & Weekly Pattern Observation */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-200/80">
                    <span className="text-2xl font-black text-amber-500">{sessionHistory.length}</span>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'de' ? 'Sitzungen' : 'Sessions'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-200/80">
                    <span className="text-2xl font-black text-indigo-600">{totalMinutesTalked} Min.</span>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'de' ? 'Gesamtzeit' : 'Total Time'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-200/80">
                    <span className="text-2xl font-black text-emerald-600">{totalTurns}</span>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'de' ? 'Sätze gesprochen' : 'Turns Spoken'}
                    </p>
                  </div>
                </div>

                {sessionHistory.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-8">
                    {language === 'de'
                      ? 'Noch keine Sitzungen aufgezeichnet. Startet euer erstes Abenteuer!'
                      : 'No sessions recorded yet. Start your first adventure!'}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {sessionHistory.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2"
                      >
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>
                            {s.topicName} (mit {s.playmateName})
                          </span>
                          <span className="text-indigo-600">{s.date}</span>
                        </div>
                        <div className="flex gap-4 text-slate-500">
                          <span>⏱️ {Math.round(s.durationSeconds / 60)} Min.</span>
                          <span>💬 {s.jedidiahTurnCount ?? s.jdTurnCount} Redebeiträge</span>
                          {s.badgeEarned && <span>🏆 {s.badgeEarned.nameDe}</span>}
                        </div>
                        {s.practicedSentences && s.practicedSentences.length > 0 && (
                          <div className="pt-1 border-t border-slate-200/60">
                            <span className="text-indigo-600 font-semibold">Geübt: </span>
                            <span>"{s.practicedSentences.join('", "')}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Privacy & GDPR */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-emerald-200 space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                    <ShieldCheck className="w-5 h-5" />
                    <span>{language === 'de' ? 'Strikter Kinderschutz & Privatsphäre' : 'Strict Child Privacy'}</span>
                  </div>
                  <ul className="space-y-2 list-disc list-inside text-slate-600">
                    <li>
                      {language === 'de'
                        ? 'Keine permanente Speicherung von Roh-Audiodateien oder Sprachaufnahmen.'
                        : 'No permanent storage of raw audio files or child voice recordings.'}
                    </li>
                    <li>
                      {language === 'de'
                        ? 'Keine Werbung, kein Profiling, keine Weitergabe an Dritte.'
                        : 'No advertising, no third-party profiling, 100% private family sandbox.'}
                    </li>
                    <li>
                      {language === 'de'
                        ? 'Alle Gesprächsdaten verbleiben im Browser des Nutzers.'
                        : 'All conversation progress remains in the family browser.'}
                    </li>
                    <li>
                      {language === 'de'
                        ? 'Keine medizinische oder therapeutische Diagnose (reines Sprach-Übungsspiel).'
                        : 'Purely educational and conversational practice; no clinical claims.'}
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClearHistory}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'de' ? 'Verlauf löschen' : 'Clear History'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Save & Apply Button */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold"
              >
                {language === 'de' ? 'Abbrechen' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'de' ? 'Einstellungen speichern' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

