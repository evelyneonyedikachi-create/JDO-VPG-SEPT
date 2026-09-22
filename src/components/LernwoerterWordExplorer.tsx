import React, { useState } from 'react';
import { LernwortItem } from '../types/lernwoerter';
import { Volume2, Sparkles, BookOpen, Layers, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { speakGerman } from '../services/speechSynthesisService';
import { playChime } from '../utils/soundEffects';

interface LernwoerterWordExplorerProps {
  words: LernwortItem[];
  onOpenWorksheet: () => void;
}

export const LernwoerterWordExplorer: React.FC<LernwoerterWordExplorerProps> = ({
  words,
  onOpenWorksheet,
}) => {
  const [activeGroup, setActiveGroup] = useState<1 | 2>(1);
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
  const [flashcardMode, setFlashcardMode] = useState<boolean>(false);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);

  const groupWords = words.filter((w) => w.group === activeGroup);

  const handleSpeak = (text: string, avatarId = 'mia') => {
    playChime('click');
    speakGerman(text, { avatarId });
  };

  const currentFlashcard = groupWords[flashcardIndex] || groupWords[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner matching user worksheet header */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-2 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Wochenplan 4. Klasse</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Meine Lernwörter – Sätze zum Üben
            </h2>
            <p className="text-sky-100 text-sm sm:text-base font-medium mt-1 max-w-xl">
              Lies die Sätze laut. Übe sie mehrmals. Du kannst auch eigene Sätze bilden!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                playChime('click');
                setFlashcardMode(!flashcardMode);
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                flashcardMode
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{flashcardMode ? 'Listenansicht' : 'Karteikarten-Modus'}</span>
            </button>

            <button
              onClick={() => {
                playChime('click');
                onOpenWorksheet();
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-indigo-900 font-black text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span>🖨️ Arbeitsblatt drucken</span>
            </button>
          </div>
        </div>

        {/* Group Tabs 1 & 2 */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => {
              playChime('click');
              setActiveGroup(1);
              setFlashcardIndex(0);
              setFlashcardFlipped(false);
            }}
            className={`px-5 py-2 rounded-2xl font-black text-sm sm:text-base transition-all ${
              activeGroup === 1
                ? 'bg-white text-indigo-900 shadow-lg scale-105'
                : 'bg-white/15 text-white/80 hover:bg-white/25'
            }`}
          >
            Lernwörter 1 (7 Wörter)
          </button>
          <button
            onClick={() => {
              playChime('click');
              setActiveGroup(2);
              setFlashcardIndex(0);
              setFlashcardFlipped(false);
            }}
            className={`px-5 py-2 rounded-2xl font-black text-sm sm:text-base transition-all ${
              activeGroup === 2
                ? 'bg-white text-indigo-900 shadow-lg scale-105'
                : 'bg-white/15 text-white/80 hover:bg-white/25'
            }`}
          >
            Lernwörter 2 (7 Wörter)
          </button>
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {flashcardMode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="text-xs font-black uppercase text-indigo-600 mb-2">
            Karte {flashcardIndex + 1} von {groupWords.length}
          </div>

          <div
            onClick={() => setFlashcardFlipped(!flashcardFlipped)}
            className="w-full min-h-[260px] cursor-pointer rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/40 border-2 border-dashed border-indigo-200 p-8 flex flex-col items-center justify-center transition-transform hover:scale-[1.01] active:scale-95 shadow-inner"
          >
            {!flashcardFlipped ? (
              <div className="space-y-4">
                <div className="text-6xl sm:text-7xl animate-bounce-subtle">{currentFlashcard.emoji}</div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900">
                  {currentFlashcard.word}
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                  {currentFlashcard.wortart} {currentFlashcard.plural ? `• Plural: ${currentFlashcard.plural}` : ''}
                </div>
                <div className="text-xs text-slate-500 font-medium">Tippe zum Umdrehen für Beispielsätze 🔄</div>
              </div>
            ) : (
              <div className="space-y-3 w-full text-left">
                <div className="text-xs font-bold text-slate-500 uppercase">Beispielsätze:</div>
                <div className="space-y-1.5">
                  {currentFlashcard.sentences.slice(0, 3).map((s, i) => (
                    <div key={i} className="text-sm font-semibold text-slate-800 bg-white p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                      <span>{s.text}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(s.text);
                        }}
                        className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between w-full mt-6">
            <button
              onClick={() => {
                setFlashcardIndex((prev) => Math.max(0, prev - 1));
                setFlashcardFlipped(false);
              }}
              disabled={flashcardIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-sm"
            >
              ⬅️ Vorheriges
            </button>

            <button
              onClick={() => handleSpeak(currentFlashcard.word)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
            >
              <Volume2 className="w-4 h-4" />
              <span>Anhören</span>
            </button>

            <button
              onClick={() => {
                setFlashcardIndex((prev) => Math.min(groupWords.length - 1, prev + 1));
                setFlashcardFlipped(false);
              }}
              disabled={flashcardIndex === groupWords.length - 1}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-sm"
            >
              Nächstes ➡️
            </button>
          </div>
        </div>
      ) : (
        /* TABLE LIST MODE (Exact authentic worksheet styling) */
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
          <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="text-sm font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Lernwörter-Tabelle & Satzmuster (Ich, Du, Er/Sie, Wir, Ihr, Sie)</span>
            </div>
            <div className="text-xs font-bold text-slate-500">
              Klicke auf eine Zeile für alle 6 Sätze
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {groupWords.map((item, idx) => {
              const isExpanded = expandedWordId === item.id;
              const wortartColor =
                item.wortart === 'Nomen'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : item.wortart === 'Verb'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200';

              return (
                <div key={item.id} className="transition-colors hover:bg-slate-50/60">
                  <div
                    onClick={() => {
                      playChime('click');
                      setExpandedWordId(isExpanded ? null : item.id);
                    }}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-4xl sm:text-5xl shadow-xs shrink-0">
                        {item.emoji}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl sm:text-2xl font-black text-slate-900">
                            {item.word}
                          </span>
                          <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${wortartColor}`}>
                            {item.wortart}
                          </span>
                          {item.plural && (
                            <span className="text-sm font-semibold text-slate-500 hidden sm:inline">
                              Plural: {item.plural}
                            </span>
                          )}
                        </div>
                        <div className="text-sm sm:text-base text-slate-600 mt-1 font-medium line-clamp-1">
                          {item.exampleSentence || item.sentences[0]?.text}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(item.word);
                        }}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Wort vorlesen"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Anhören</span>
                      </button>

                      <div className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded 6 Pronoun Sentence Table (Matching the authentic school worksheet) */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 bg-slate-50/90 border-t border-slate-100">
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-xs">
                        <div className="text-xs font-black uppercase tracking-wider text-indigo-900 mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Alle 6 Pronomen-Sätze zum lauten Üben:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {item.sentences.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/70 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center">
                                  {sIdx + 1}
                                </span>
                                <span className="text-sm font-bold text-slate-800">{s.text}</span>
                              </div>
                              <button
                                onClick={() => handleSpeak(s.text)}
                                className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                                title="Satz vorlesen"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
