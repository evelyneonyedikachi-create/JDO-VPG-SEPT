import React, { useState, useMemo } from 'react';
import { BildgeschichteScene, LernwortItem } from '../types/lernwoerter';
import { Volume2, Sparkles, BookOpen, CheckCircle2, AlertCircle, Printer, Trophy, Wand2, RotateCcw, Lock } from 'lucide-react';
import { speakGerman } from '../services/speechSynthesisService';
import { playChime } from '../utils/soundEffects';
import { getModelSolutionUnlockStatus } from '../utils/textValidation';

interface BildgeschichteWorkshopProps {
  scenes: BildgeschichteScene[];
  words: LernwortItem[];
  mode?: 'scenes_step' | 'full_story';
  pointsToday?: number;
  pointsWeek?: number;
  onRewardStars: (count: number, reason: string) => void;
  onAwardPoints?: (points: number, reason: string) => void;
  onOpenWorksheet: () => void;
}

const SENTENCE_STARTERS = [
  'Zuerst …',
  'Dann …',
  'Danach …',
  'Später …',
  'Plötzlich …',
  'Zum Glück …',
  'Leider …',
  'Deshalb …',
  'Am Ende …',
  'Schließlich …',
];

const CONNECTORS = ['und', 'aber', 'weil', 'denn', 'obwohl', 'deshalb', 'dann', 'danach', 'schließlich'];

export const BildgeschichteWorkshop: React.FC<BildgeschichteWorkshopProps> = ({
  scenes,
  words,
  mode: initialMode = 'scenes_step',
  pointsToday = 0,
  pointsWeek = 0,
  onRewardStars,
  onAwardPoints,
  onOpenWorksheet,
}) => {
  const [activeTab, setActiveTab] = useState<'scenes_step' | 'full_story'>(initialMode);
  const [sceneTexts, setSceneTexts] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('jd_bildgeschichte_scenes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [storyTitle, setStoryTitle] = useState<string>('Eine spannende Woche');
  const [fullStoryText, setFullStoryText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('jd_bildgeschichte_full');
      return saved ? saved : '';
    } catch {
      return '';
    }
  });

  const [revealedWordHelp, setRevealedWordHelp] = useState<Record<number, boolean>>({});
  const [revealedSolution, setRevealedSolution] = useState<Record<number, boolean>>({});
  const [sceneLevel, setSceneLevel] = useState<1 | 2 | 3 | 4>(4);
  const [completedSaved, setCompletedSaved] = useState<boolean>(false);

  const toggleWordHelp = (sceneId: number) => {
    playChime('click');
    setRevealedWordHelp((prev) => ({ ...prev, [sceneId]: !prev[sceneId] }));
  };

  const toggleSolution = (sceneId: number) => {
    playChime('click');
    setRevealedSolution((prev) => ({ ...prev, [sceneId]: !prev[sceneId] }));
  };

  const visibleScenes = useMemo(() => {
    if (sceneLevel === 1) return scenes.slice(0, 1);
    if (sceneLevel === 2) return scenes.slice(0, 2);
    if (sceneLevel === 3) return scenes.slice(0, 3);
    return scenes;
  }, [scenes, sceneLevel]);

  // Save changes
  const handleSceneTextChange = (sceneId: number, text: string) => {
    const updated = { ...sceneTexts, [sceneId]: text };
    setSceneTexts(updated);
    try {
      localStorage.setItem('jd_bildgeschichte_scenes', JSON.stringify(updated));
    } catch {}

    // Check if new scene was just completed with at least 8 characters
    if (text.trim().length >= 8 && (!sceneTexts[sceneId] || sceneTexts[sceneId].length < 8)) {
      if (onAwardPoints) {
        onAwardPoints(15, `Bild ${sceneId} beschrieben!`);
      }
    }
  };

  const handleFullStoryChange = (text: string) => {
    setFullStoryText(text);
    try {
      localStorage.setItem('jd_bildgeschichte_full', text);
    } catch {}
  };

  const handleSpeak = (text: string) => {
    playChime('click');
    speakGerman(text, { avatarId: 'sophie' });
  };

  // Retake / Reset Bildgeschichte
  const handleResetStory = () => {
    if (window.confirm('Möchtest du diese Bildgeschichte wirklich von vorne beginnen und neu schreiben?')) {
      playChime('click');
      setSceneTexts({});
      setFullStoryText('');
      setCompletedSaved(false);
      try {
        localStorage.removeItem('jd_bildgeschichte_scenes');
        localStorage.removeItem('jd_bildgeschichte_full');
      } catch {}
    }
  };

  // Assemble full text from scenes if user clicks "Aus Einzelsätzen zusammenfügen"
  const handleAssembleFromScenes = () => {
    playChime('click');
    const assembled = scenes
      .map((s) => sceneTexts[s.id]?.trim())
      .filter(Boolean)
      .join(' ');
    setFullStoryText(assembled);
    try {
      localStorage.setItem('jd_bildgeschichte_full', assembled);
    } catch {}
  };

  // Checklist Analyzers
  const fullTextToAnalyze =
    activeTab === 'full_story' ? fullStoryText : Object.values(sceneTexts).join(' ');

  // Sentence count (ends with . ! or ?)
  const sentenceCount = useMemo(() => {
    if (!fullTextToAnalyze.trim()) return 0;
    const matches = fullTextToAnalyze.match(/[^.!?]+[.!?]+/g);
    return matches ? matches.length : 0;
  }, [fullTextToAnalyze]);

  // Detected Lernwörter in story
  const detectedWords = useMemo(() => {
    const lower = fullTextToAnalyze.toLowerCase();
    return words.filter((w) => {
      const clean = w.cleanWord.toLowerCase();
      const stem = clean.length > 4 ? clean.slice(0, 4) : clean;
      return lower.includes(clean) || lower.includes(stem);
    });
  }, [fullTextToAnalyze, words]);

  // Detected connectors
  const detectedConnectors = useMemo(() => {
    const lower = fullTextToAnalyze.toLowerCase();
    return CONNECTORS.filter((c) => lower.includes(c));
  }, [fullTextToAnalyze]);

  const punctuationCheck = sentenceCount >= 3;

  const isChallengeComplete =
    sentenceCount >= 6 && detectedWords.length >= 6 && detectedConnectors.length >= 2;

  const handleFinishStory = () => {
    playChime('cheer');
    setCompletedSaved(true);
    onRewardStars(5, 'Wochen-Challenge: Bildgeschichte erfolgreich geschrieben! 🏆');
    if (onAwardPoints) {
      onAwardPoints(100, 'Wochen-Challenge Bildgeschichte gemeistert! 🌟');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-black uppercase tracking-wider mb-2 border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Geschichten-Werkstatt mit Sophie</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Bild-Geschichte – Eine spannende Woche
            </h2>
            <p className="text-amber-100 text-base sm:text-lg font-medium mt-1 max-w-xl">
              Schau dir die großen Bilder an. Benutze alle Lernwörter aus beiden Listen und erzähle eine packende Geschichte!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                playChime('click');
                onOpenWorksheet();
              }}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-black text-base flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Printer className="w-5 h-5 text-amber-600" />
              <span>🖨️ Arbeitsblatt drucken</span>
            </button>

            {/* Retake / Reset Story */}
            <button
              onClick={handleResetStory}
              className="px-4 py-3 rounded-2xl bg-black/20 hover:bg-black/30 text-white font-bold text-sm flex items-center gap-2 transition-all"
              title="Geschichte neu beginnen"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Neu schreiben</span>
            </button>
          </div>
        </div>

        {/* Tab switcher: Freitag (Szene für Szene) vs Samstag (Ganze Geschichte Challenge) */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => {
              playChime('click');
              setActiveTab('scenes_step');
            }}
            className={`px-6 py-2.5 rounded-2xl font-black text-base sm:text-lg transition-all ${
              activeTab === 'scenes_step'
                ? 'bg-white text-orange-950 shadow-lg scale-105'
                : 'bg-white/15 text-white/80 hover:bg-white/25'
            }`}
          >
            Freitag: Bild für Bild (9 Szenen)
          </button>
          <button
            onClick={() => {
              playChime('click');
              setActiveTab('full_story');
            }}
            className={`px-6 py-2.5 rounded-2xl font-black text-base sm:text-lg transition-all ${
              activeTab === 'full_story'
                ? 'bg-white text-orange-950 shadow-lg scale-105'
                : 'bg-white/15 text-white/80 hover:bg-white/25'
            }`}
          >
            Samstag: Wochen-Challenge (Ganze Geschichte)
          </button>
        </div>
      </div>

      {/* FREITAG MODE: SCENE-BY-SCENE */}
      {activeTab === 'scenes_step' && (
        <div className="space-y-6">
          {/* Difficulty Level Selector (Section 15) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Schwierigkeitsstufe wählen:
              </div>
              <div className="text-sm font-bold text-slate-800">
                {sceneLevel === 1
                  ? 'Stufe 1: 1 Bild – schreibe 1 Satz'
                  : sceneLevel === 2
                  ? 'Stufe 2: 2 Bilder – schreibe je 1 Satz'
                  : sceneLevel === 3
                  ? 'Stufe 3: 3 Bilder – nutze zuerst, dann, am Ende'
                  : 'Stufe 4: Alle 9 Bilder – die vollständige Bildergeschichte'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[
                { lvl: 1 as const, label: '1 Bild' },
                { lvl: 2 as const, label: '2 Bilder' },
                { lvl: 3 as const, label: '3 Bilder' },
                { lvl: 4 as const, label: 'Alle 9 Bilder' },
              ].map((opt) => (
                <button
                  key={opt.lvl}
                  onClick={() => {
                    playChime('click');
                    setSceneLevel(opt.lvl);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                    sceneLevel === opt.lvl
                      ? 'bg-amber-500 text-white shadow-md scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sentence Starters Tool Box with LARGER FONT (Section 11) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
            <div className="text-sm font-black uppercase text-amber-900 mb-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>💡 Hilfreiche Satzanfänge (klicke zum Vorlesen):</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {SENTENCE_STARTERS.map((st, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => {
                    playChime('click');
                    handleSpeak(st.replace('…', ''));
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-base font-bold border border-amber-200 shadow-2xs transition-colors"
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* SCENES GRID - IMAGES FIRST, NO SPOILER TEXTS (Section 10 & 12) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleScenes.map((scene) => {
              const currentVal = sceneTexts[scene.id] || '';
              const isHelpOpen = !!revealedWordHelp[scene.id];
              const isSolutionOpen = !!revealedSolution[scene.id];

              return (
                <div
                  key={scene.id}
                  className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-200 flex flex-col justify-between space-y-5 hover:border-amber-300 transition-colors"
                >
                  <div className="space-y-4">
                    {/* Scene Image / Icon - TWICE AS BIG */}
                    <div className="w-full h-64 sm:h-72 rounded-3xl bg-gradient-to-tr from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-200 flex flex-col items-center justify-center text-8xl sm:text-9xl relative overflow-hidden shadow-inner group">
                      <span className="animate-bounce-subtle select-none">{scene.emoji}</span>
                      <span className="absolute top-3 left-3 text-sm font-black uppercase px-3 py-1 rounded-xl bg-white/95 text-amber-900 border border-amber-200 shadow-xs">
                        Bild {scene.id}
                      </span>
                    </div>

                    {/* PROMINENT TASK INSTRUCTION (No giveaway description!) */}
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {scene.title}
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-indigo-900 mt-1">
                        Was passiert auf diesem Bild?
                      </h4>
                      <p className="text-sm font-semibold text-slate-500 mt-0.5">
                        Schau dir das Bild genau an und schreibe 1–2 Sätze dazu.
                      </p>
                    </div>

                    {/* Clickable Sentence Starters for this scene */}
                    {scene.starterIdeas && scene.starterIdeas.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {scene.starterIdeas.map((st, stIdx) => (
                          <button
                            key={stIdx}
                            onClick={() => {
                              playChime('click');
                              const cleanSt = st.replace('…', '').trim();
                              handleSceneTextChange(
                                scene.id,
                                currentVal ? `${currentVal} ${cleanSt}` : `${cleanSt} `
                              );
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-bold border border-amber-200 shadow-2xs transition-colors"
                            title="Klicken zum Einfügen in deinen Text"
                          >
                            + {st}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* OPTIONAL WÖRTER-HILFE (Behind button, Section 12) */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleWordHelp(scene.id)}
                        className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{isHelpOpen ? 'Wörter-Hilfe verbergen' : '💡 Wörter-Hilfe anzeigen'}</span>
                      </button>

                      {isHelpOpen && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 animate-fade-in">
                          {scene.suggestedWords.map((sw, wIdx) => (
                            <span
                              key={wIdx}
                              className="px-3 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-bold shadow-2xs"
                            >
                              {sw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Sentence Input */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Deine Sätze:
                    </label>
                    <textarea
                      rows={3}
                      value={currentVal}
                      onChange={(e) => handleSceneTextChange(scene.id, e.target.value)}
                      placeholder="Schreibe hier deine Sätze zum Bild..."
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none text-base font-semibold text-slate-800 resize-none bg-slate-50 focus:bg-white shadow-inner"
                    />

                    {/* MODEL SENTENCE TOGGLE ONLY AFTER WRITING (Requires 2–3 meaningful words) */}
                    {(() => {
                      const unlockStatus = getModelSolutionUnlockStatus(currentVal, 2);
                      return unlockStatus.isUnlocked ? (
                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={() => toggleSolution(scene.id)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{isSolutionOpen ? 'Musterbeispiel verbergen' : 'Musterbeispiel ansehen'}</span>
                          </button>

                          {isSolutionOpen && (
                            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-bold leading-relaxed animate-fade-in">
                              Musterbeispiel: „{scene.description}“
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 py-1 select-none">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Musterbeispiel gesperrt ({unlockStatus.label})</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick jump to full story */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h4 className="font-black text-slate-900 text-lg">
                Fertig mit den Einzelsätzen?
              </h4>
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                Kopiere deine Sätze direkt in die große Samstags-Challenge!
              </p>
            </div>
            <button
              onClick={() => {
                handleAssembleFromScenes();
                setActiveTab('full_story');
              }}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-md active:scale-95 transition-all"
            >
              In Wochen-Challenge übernehmen ➡️
            </button>
          </div>
        </div>
      )}

      {/* SAMSTAG MODE: FULL STORY CHALLENGE */}
      {activeTab === 'full_story' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Story Editor (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase text-slate-500">
                  Titel deiner Bildgeschichte:
                </label>
                <input
                  type="text"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Mein Titel für die Geschichte..."
                  className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none text-xl font-black text-slate-900 bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black uppercase text-slate-500">
                    Deine ganze Geschichte:
                  </label>
                  <button
                    onClick={handleAssembleFromScenes}
                    className="text-sm font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Aus Freitags-Sätzen laden</span>
                  </button>
                </div>

                <textarea
                  rows={12}
                  value={fullStoryText}
                  onChange={(e) => handleFullStoryChange(e.target.value)}
                  placeholder="Zuerst ist der Junge in seinem Zimmer. Am Morgen wacht er auf..."
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none text-lg font-semibold text-slate-900 resize-y leading-relaxed bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-bold text-slate-500">
                  Wörter: {fullStoryText.trim() ? fullStoryText.trim().split(/\s+/).length : 0} | Sätze: {sentenceCount}
                </div>

                <button
                  onClick={() => handleSpeak(fullStoryText)}
                  disabled={!fullStoryText.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold flex items-center gap-2 disabled:opacity-40 transition-colors"
                >
                  <Volume2 className="w-5 h-5 text-indigo-600" />
                  <span>Geschichte vorlesen lassen</span>
                </button>
              </div>
            </div>

            {/* Checklist & Word Bank Assistant (1 Col) */}
            <div className="space-y-6">
              {/* Requirements Checklist */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <h4 className="font-black text-slate-900 text-lg">
                    Challenge-Kriterien
                  </h4>
                </div>

                <div className="space-y-3 text-sm font-bold">
                  {/* Criterion 1: Min 6 sentences */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                    sentenceCount >= 6 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span>Mindestens 6 Sätze</span>
                    <span>{sentenceCount} / 6 {sentenceCount >= 6 ? '✅' : '⏳'}</span>
                  </div>

                  {/* Criterion 2: Min 6 Lernwörter */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                    detectedWords.length >= 6 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span>Mindestens 6 Lernwörter</span>
                    <span>{detectedWords.length} / 6 {detectedWords.length >= 6 ? '✅' : '⏳'}</span>
                  </div>

                  {/* Criterion 3: Min 2 connectors */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                    detectedConnectors.length >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span>Mindestens 2 Bindewörter</span>
                    <span>{detectedConnectors.length} / 2 {detectedConnectors.length >= 2 ? '✅' : '⏳'}</span>
                  </div>

                  {/* Criterion 4: Punctuation */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                    punctuationCheck ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span>Großschreibung & Satzzeichen</span>
                    <span>{punctuationCheck ? '✅' : '⏳'}</span>
                  </div>
                </div>

                {/* Final Submit Button */}
                <button
                  disabled={!isChallengeComplete && !completedSaved}
                  onClick={handleFinishStory}
                  className={`w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                    completedSaved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : isChallengeComplete
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                  <span>
                    {completedSaved
                      ? 'Ausgezeichnet! +100 Punkte & 5 Sterne gesichert ⭐'
                      : isChallengeComplete
                      ? 'Wochen-Challenge abschließen (+100 Pkt) 🎉'
                      : 'Erfülle alle Kriterien'}
                  </span>
                </button>
              </div>

              {/* Live Lernwörter Tracker */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-3">
                <div className="text-sm font-black uppercase text-indigo-900">
                  Lernwörter-Tracker ({detectedWords.length}/{words.length}):
                </div>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
                  {words.map((w) => {
                    const isDetected = detectedWords.some((dw) => dw.id === w.id);
                    return (
                      <span
                        key={w.id}
                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                          isDetected
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-black'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        {isDetected ? '✓ ' : ''}{w.word}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
