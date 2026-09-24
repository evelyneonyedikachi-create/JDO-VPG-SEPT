import React, { useState } from 'react';
import {
  LernwortItem,
  MiniExamResult,
  PracticeMistake,
  WeeklyCurriculum,
  Wortart,
  Artikel,
} from '../types/lernwoerter';
import {
  REWARD_LADDER,
  getNextRewardMilestone,
  formatPoints,
} from '../data/rewardLadder';
import {
  Lock,
  Plus,
  Trash2,
  Edit3,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart2,
  BookOpen,
  RefreshCw,
  X,
  Trophy,
  Award,
  Gift,
  Target,
  Clock,
  Check,
} from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface ParentLernwoerterBackendProps {
  curriculum: WeeklyCurriculum;
  onSaveCurriculum: (newCurriculum: WeeklyCurriculum) => void;
  mistakes: PracticeMistake[];
  onClearResolvedMistakes: () => void;
  onClose: () => void;
  pointsWeek?: number;
  cumulativePoints?: number;
  claimedRewards?: number[];
  onToggleClaimReward?: (level: number) => void;
  skippedCount?: number;
  weakWords?: string[];
  strongWords?: string[];
  miniExamHistory?: MiniExamResult[];
}

export const ParentLernwoerterBackend: React.FC<ParentLernwoerterBackendProps> = ({
  curriculum,
  onSaveCurriculum,
  mistakes,
  onClearResolvedMistakes,
  onClose,
  pointsWeek = 0,
  cumulativePoints = 0,
  claimedRewards = [],
  onToggleClaimReward,
  skippedCount = 0,
  weakWords = [],
  strongWords = [],
  miniExamHistory = [],
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinError, setPinError] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'words' | 'dashboard' | 'spaced_repetition'>('words');

  // Edit curriculum state
  const [weekNumber, setWeekNumber] = useState<number>(curriculum.weekNumber);
  const [title, setTitle] = useState<string>(curriculum.title);
  const [words, setWords] = useState<LernwortItem[]>(curriculum.words);

  // New word draft state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newWordDraft, setNewWordDraft] = useState<{
    word: string;
    cleanWord: string;
    wortart: Wortart;
    artikel: Artikel;
    plural: string;
    infinitive: string;
    group: 1 | 2;
    emoji: string;
    exampleSentence: string;
  }>({
    word: '',
    cleanWord: '',
    wortart: 'Nomen',
    artikel: 'der',
    plural: '',
    infinitive: '',
    group: 1,
    emoji: '📝',
    exampleSentence: '',
  });

  const handleVerifyPin = () => {
    if (pinInput === '1234') {
      playChime('click');
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      playChime('whistle');
      setPinError(true);
    }
  };

  const handleAddNewWord = () => {
    if (!newWordDraft.word.trim()) return;

    playChime('click');
    const clean = newWordDraft.cleanWord || newWordDraft.word.replace(/^(der|die|das)\s+/i, '').trim();
    const formattedWord = newWordDraft.wortart === 'Nomen' && newWordDraft.artikel
      ? `${newWordDraft.artikel} ${clean}`
      : newWordDraft.word;

    const newWordItem: LernwortItem = {
      id: `custom_${Date.now()}`,
      word: formattedWord,
      cleanWord: clean,
      wortart: newWordDraft.wortart,
      artikel: newWordDraft.wortart === 'Nomen' ? newWordDraft.artikel : undefined,
      plural: newWordDraft.plural || undefined,
      infinitive: newWordDraft.wortart === 'Verb' ? (newWordDraft.infinitive || clean) : undefined,
      group: newWordDraft.group,
      emoji: newWordDraft.emoji || '📝',
      distractors: [`${clean}e`, `${clean}s`],
      missingLetterPattern: clean.replace(/[aeiouäöü]/gi, '_'),
      sentences: [
        { pronoun: 'ich', text: `Ich übe ${clean}.` },
        { pronoun: 'du', text: `Du übst ${clean}.` },
        { pronoun: 'er', text: `Er übt ${clean}.` },
        { pronoun: 'wir', text: `Wir üben ${clean}.` },
        { pronoun: 'ihr', text: `Ihr übt ${clean}.` },
        { pronoun: 'sie', text: `Sie üben ${clean}.` },
      ],
      exampleSentence: newWordDraft.exampleSentence || `Das ist ${clean}.`,
    };

    setWords([...words, newWordItem]);
    setShowAddModal(false);
    // Reset draft
    setNewWordDraft({
      word: '',
      cleanWord: '',
      wortart: 'Nomen',
      artikel: 'der',
      plural: '',
      infinitive: '',
      group: 1,
      emoji: '📝',
      exampleSentence: '',
    });
  };

  const handleDeleteWord = (id: string) => {
    playChime('click');
    setWords(words.filter((w) => w.id !== id));
  };

  const handleSaveCurriculum = () => {
    playChime('success');
    const updated: WeeklyCurriculum = {
      ...curriculum,
      weekNumber,
      title,
      words,
    };
    onSaveCurriculum(updated);
    alert('Woche & Lernwörter wurden erfolgreich gespeichert und die täglichen Übungen aktualisiert!');
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Eltern-Bereich
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Bitte PIN eingeben (Standard: <strong>1234</strong>)
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerifyPin();
              }}
              placeholder="••••"
              className="w-full text-center tracking-widest text-3xl font-black px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 outline-none"
              autoFocus
            />

            {pinError && (
              <div className="text-xs font-bold text-rose-600">
                Falscher PIN! Versuche es noch einmal.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
            >
              Abbrechen
            </button>
            <button
              onClick={handleVerifyPin}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md"
            >
              Entsperren 🔓
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-800 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                Eltern- & Lehrkraft-Backend
              </h3>
              <p className="text-xs text-indigo-200 font-medium">
                Wöchentliche Lernwörter verwalten & JD’s Lernfortschritt einsehen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('words')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'words'
                ? 'bg-white shadow-xs text-indigo-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Lernwörter verwalten ({words.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white shadow-xs text-indigo-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Wochen-Fortschritt</span>
          </button>

          <button
            onClick={() => setActiveTab('spaced_repetition')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'spaced_repetition'
                ? 'bg-white shadow-xs text-indigo-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>Noch üben ({mistakes.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: WORDS & CURRICULUM MANAGEMENT */}
          {activeTab === 'words' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500">Woche</label>
                  <input
                    type="number"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-black uppercase text-slate-500">Thema / Titel der Woche</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Neues Lernwort hinzufügen</span>
                </button>

                <button
                  onClick={handleSaveCurriculum}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Woche erstellen & Übungen generieren ✨</span>
                </button>
              </div>

              {/* Table of current words */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {words.map((w, idx) => (
                  <div key={w.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{w.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{w.word}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                            {w.wortart}
                          </span>
                          <span className="text-xs text-slate-400">Gruppe {w.group}</span>
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">{w.exampleSentence || w.sentences[0]?.text}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteWord(w.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PROGRESS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Key Parent Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-black text-indigo-800">
                    {pointsWeek} / 100
                  </div>
                  <div className="text-xs font-bold text-indigo-600 mt-1 uppercase">
                    Wochen-Punkte (max 100)
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-black text-amber-800">
                    {skippedCount}
                  </div>
                  <div className="text-xs font-bold text-amber-600 mt-1 uppercase">
                    Offene Übersprungene
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800">
                    {formatPoints(cumulativePoints)}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-1 uppercase">
                    Gesamt-Punkte (Lifetime)
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-black text-purple-800">
                    {miniExamHistory.length > 0
                      ? `${miniExamHistory[miniExamHistory.length - 1].score}/20`
                      : 'Bereit'}
                  </div>
                  <div className="text-xs font-bold text-purple-600 mt-1 uppercase">
                    Mini-Prüfung (Woche 1–4)
                  </div>
                </div>
              </div>

              {/* WEAK WORDS & STRONGEST WORDS OVERVIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Weak Words */}
                <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                    <Target className="w-4 h-4 text-rose-600" />
                    <span>Häufige Stolperwörter (Fokus)</span>
                  </div>
                  {weakWords.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      Keine wiederholten Fehler – alles stabil!
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {weakWords.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Strong Words */}
                <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sicher gemeisterte Wörter</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(strongWords.length > 0 ? strongWords : ['Zimmer', 'Messer', 'Kuss', 'Schloss']).map(
                      (w, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200"
                        >
                          {w}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Mini Exam History */}
              {miniExamHistory.length > 0 && (
                <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Ergebnisse der 4-Wochen Mini-Prüfungen</span>
                  </div>
                  <div className="divide-y divide-indigo-100 text-xs">
                    {miniExamHistory.map((res, rIdx) => (
                      <div key={rIdx} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{res.date}</span>
                          <span className="text-slate-500 ml-2">({res.percentage}% richtig)</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-black ${
                            res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {res.score} / {res.totalQuestions} Punkte
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REWARDS STATUS & PARENT CONFIRMATION */}
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>Familien-Belohnungs-Leiter ({formatPoints(cumulativePoints)} Punkte gesamt)</span>
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {REWARD_LADDER.filter((r) => cumulativePoints >= r.points).length} von 20 Stufen erreicht
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Punkte werden beim Einlösen <strong>nicht abgezogen</strong>. Bestätigen Sie hier oder im Erfolge-Bildschirm, wenn eine Belohnung an Jedidiah übergeben wurde.
                </p>
                <div className="divide-y divide-amber-100 text-xs max-h-48 overflow-y-auto pr-1">
                  {REWARD_LADDER.filter((r) => cumulativePoints >= r.points).length === 0 ? (
                    <div className="py-3 text-center text-slate-400 italic">
                      Noch keine Stufe erreicht (Erste Stufe bei 1.000 Punkten).
                    </div>
                  ) : (
                    REWARD_LADDER.filter((r) => cumulativePoints >= r.points).map((r) => {
                      const isClaimed = claimedRewards.includes(r.level);
                      return (
                        <div key={r.level} className="py-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span>{r.emoji}</span>
                            <span className="font-bold text-slate-900">{r.title}: {r.reward}</span>
                            <span className="text-slate-500 font-semibold">({formatPoints(r.points)} Pkt)</span>
                          </div>
                          {onToggleClaimReward ? (
                            <button
                              onClick={() => {
                                playChime('click');
                                onToggleClaimReward(r.level);
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                                isClaimed
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isClaimed ? 'Erhalten ✓' : 'Als erhalten markieren'}</span>
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold">Erreicht ✓</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 text-sm">Pädagogische Einschätzung:</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Jedidiah zeigt große Freude an den Wort-Blöcken am Mittwoch. Bei der Rechtschreibung von Doppelkonsonanten (wie <em>mm</em> in Zimmer/schwimmen und <em>ss</em> in Kuss/Messer/passen) ist er auf einem sehr guten Weg. Empfohlen: Am Dienstag noch einmal kurz die <em>du</em>-Formen (du schwimmst, du rennst) wiederholen.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SPACED REPETITION ("Noch üben") */}
          {activeTab === 'spaced_repetition' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    Intelligente Wiederholungs-Liste („Noch üben“)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Wörter und Grammatikregeln, bei denen JD mehr als einen Versuch gebraucht hat.
                  </p>
                </div>

                {mistakes.length > 0 && (
                  <button
                    onClick={onClearResolvedMistakes}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Als geübt markieren
                  </button>
                )}
              </div>

              {mistakes.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-black text-emerald-900 text-base">Alles super im Griff!</div>
                  <div className="text-xs text-emerald-700 font-medium">
                    Aktuell gibt es keine offenen Stolpersteine.
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {mistakes.map((m) => (
                    <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{m.word}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            {m.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Eingabe: <span className="line-through text-rose-500">{m.wrongAnswer}</span> → Richtig: <span className="font-bold text-emerald-600">{m.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL: ADD NEW WORD */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-lg">Neues Lernwort anlegen</h4>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-black uppercase text-slate-500">Wort</label>
                  <input
                    type="text"
                    value={newWordDraft.word}
                    onChange={(e) => setNewWordDraft({ ...newWordDraft, word: e.target.value })}
                    placeholder="z.B. das Zimmer oder schwimmen"
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-500">Wortart</label>
                  <select
                    value={newWordDraft.wortart}
                    onChange={(e) => setNewWordDraft({ ...newWordDraft, wortart: e.target.value as Wortart })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  >
                    <option value="Nomen">Nomen</option>
                    <option value="Verb">Verb</option>
                    <option value="Adjektiv">Adjektiv</option>
                  </select>
                </div>

                {newWordDraft.wortart === 'Nomen' && (
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">Artikel</label>
                    <select
                      value={newWordDraft.artikel}
                      onChange={(e) => setNewWordDraft({ ...newWordDraft, artikel: e.target.value as Artikel })}
                      className="w-full mt-1 p-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                    >
                      <option value="der">der</option>
                      <option value="die">die</option>
                      <option value="das">das</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-black uppercase text-slate-500">Gruppe</label>
                  <select
                    value={newWordDraft.group}
                    onChange={(e) => setNewWordDraft({ ...newWordDraft, group: parseInt(e.target.value, 10) as 1 | 2 })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  >
                    <option value={1}>Lernwörter 1</option>
                    <option value={2}>Lernwörter 2</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-500">Symbol / Emoji</label>
                  <input
                    type="text"
                    value={newWordDraft.emoji}
                    onChange={(e) => setNewWordDraft({ ...newWordDraft, emoji: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddNewWord}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
