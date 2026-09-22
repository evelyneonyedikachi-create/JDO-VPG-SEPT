import React, { useState } from 'react';
import { BildgeschichteScene, DayOfWeek, LernwortItem } from '../types/lernwoerter';
import { Printer, X, CheckCircle, FileText } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface PrintWorksheetModalProps {
  day?: DayOfWeek;
  words: LernwortItem[];
  scenes: BildgeschichteScene[];
  onClose: () => void;
}

export const PrintWorksheetModal: React.FC<PrintWorksheetModalProps> = ({
  day = 'monday',
  words,
  scenes,
  onClose,
}) => {
  const [printMode, setPrintMode] = useState<'worksheet' | 'solution'>('worksheet');
  const [selectedSheetType, setSelectedSheetType] = useState<'saetze' | 'bildgeschichte' | 'tag'>(
    day === 'friday' || day === 'saturday' ? 'bildgeschichte' : 'saetze'
  );

  const handlePrint = () => {
    playChime('click');
    window.print();
  };

  const group1Words = words.filter((w) => w.group === 1);
  const group2Words = words.filter((w) => w.group === 2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* Top Floating Print Controls (Hidden in actual print output) */}
      <div className="fixed top-4 right-4 z-50 print:hidden flex items-center gap-2">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-xl flex items-center gap-2 transition-transform active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Jetzt drucken 🖨️</span>
        </button>

        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-black shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none">
        {/* Modal Controls Bar (Hidden when printing) */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Dokument-Typ:</span>
            <button
              onClick={() => setSelectedSheetType('saetze')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSheetType === 'saetze'
                  ? 'bg-white shadow-xs text-indigo-900 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lernwörter & Sätze
            </button>
            <button
              onClick={() => setSelectedSheetType('bildgeschichte')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSheetType === 'bildgeschichte'
                  ? 'bg-white shadow-xs text-indigo-900 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bild-Geschichte
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Ausgabe-Modus:</span>
            <button
              onClick={() => setPrintMode('worksheet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                printMode === 'worksheet'
                  ? 'bg-indigo-600 text-white font-black'
                  : 'bg-white text-slate-700'
              }`}
            >
              Arbeitsblatt (Schüler)
            </button>
            <button
              onClick={() => setPrintMode('solution')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                printMode === 'solution'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'bg-white text-slate-700'
              }`}
            >
              Lösungsblatt (Eltern/Lehrer)
            </button>
          </div>
        </div>

        {/* PRINTABLE SHEET CONTENT (Formatted identically to the authentic worksheet uploaded by user) */}
        <div className="p-8 sm:p-12 print:p-4 space-y-6 text-slate-900">
          {/* Header Area */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {selectedSheetType === 'saetze'
                  ? 'Meine Lernwörter – Sätze zum Üben'
                  : 'Bild-Geschichte – Eine spannende Woche'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                {selectedSheetType === 'saetze'
                  ? 'Lies die Sätze laut. Übe sie mehrmals. Du kannst auch eigene Sätze bilden! Du schaffst das! 😊'
                  : 'Schau dir die Bilder an. Benutze alle Lernwörter aus beiden Listen. Schreibe zu jedem Bild 1–2 Sätze.'}
              </p>
            </div>

            <div className="text-right space-y-1 shrink-0 text-xs sm:text-sm font-bold">
              <div>Name: <span className="inline-block w-28 border-b border-slate-800" /></div>
              <div>Datum: <span className="inline-block w-28 border-b border-slate-800" /></div>
              {printMode === 'solution' && (
                <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Lösungsblatt
                </div>
              )}
            </div>
          </div>

          {/* SHEET CONTENT 1: LERNWÖRTER & SÄTZE (Authentic 2-Column Table matching images) */}
          {selectedSheetType === 'saetze' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-6">
              {/* Left Column: Lernwörter 1 */}
              <div className="space-y-4">
                <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 font-black text-sm">
                  Lernwörter 1
                </div>

                <div className="space-y-4 divide-y divide-slate-200">
                  {group1Words.map((item, idx) => (
                    <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                        <span className="text-xl">{item.emoji}</span>
                        <span>{idx + 1}. {item.word}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          ({item.wortart})
                        </span>
                      </div>

                      <ol className="list-decimal list-inside text-xs space-y-0.5 pl-2 text-slate-700 font-medium">
                        {item.sentences.map((s, sIdx) => (
                          <li key={sIdx}>
                            {printMode === 'solution' ? (
                              <span>{s.text}</span>
                            ) : (
                              <span>
                                {s.text.replace(new RegExp(`\\b${item.cleanWord}\\b`, 'gi'), '__________')}
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Lernwörter 2 */}
              <div className="space-y-4">
                <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 font-black text-sm">
                  Lernwörter 2
                </div>

                <div className="space-y-4 divide-y divide-slate-200">
                  {group2Words.map((item, idx) => (
                    <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                        <span className="text-xl">{item.emoji}</span>
                        <span>{idx + 1}. {item.word}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          ({item.wortart})
                        </span>
                      </div>

                      <ol className="list-decimal list-inside text-xs space-y-0.5 pl-2 text-slate-700 font-medium">
                        {item.sentences.map((s, sIdx) => (
                          <li key={sIdx}>
                            {printMode === 'solution' ? (
                              <span>{s.text}</span>
                            ) : (
                              <span>
                                {s.text.replace(new RegExp(`\\b${item.cleanWord}\\b`, 'gi'), '__________')}
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SHEET CONTENT 2: BILDGESCHICHTE (Authentic 9-Scene Layout matching images) */}
          {selectedSheetType === 'bildgeschichte' && (
            <div className="space-y-6">
              {/* Word Bank & Sentence Starters Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-black text-slate-800 uppercase mb-1">
                    Wörterkasten:
                  </div>
                  <div className="text-slate-600 font-semibold leading-relaxed">
                    <strong>Liste 1:</strong> das Zimmer, schwimmen, das Messer, der Kuss, rennen, passen, dünn<br />
                    <strong>Liste 2:</strong> brennen, das Schloss, kennen, die Nummer, schlimm, beginnen, bissig
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-800 uppercase mb-1">
                    Satzanfänge (Hilfe):
                  </div>
                  <div className="text-slate-600 font-semibold leading-relaxed">
                    Zuerst … • Dann … • Danach … • Später … • Plötzlich … • Zum Glück … • Leider … • Schließlich … • Am Ende …
                  </div>
                </div>
              </div>

              {/* 9 Numbered Scenes Grid - IMAGES TWICE AS BIG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                {scenes.map((sc) => (
                  <div key={sc.id} className="border-2 border-slate-400 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-white print:border-slate-800">
                    <div className="flex items-center justify-between border-b-2 border-slate-300 pb-1.5">
                      <span className="text-base font-black text-slate-900">Bild {sc.id}</span>
                      <span className="text-sm font-bold text-slate-600">{sc.suggestedWords.join(', ')}</span>
                    </div>

                    {/* Image / Emoji - TWICE AS BIG (h-40 sm:h-48 print:h-36, text-6xl print:text-5xl) */}
                    <div className="h-40 sm:h-48 print:h-36 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-6xl print:text-5xl shadow-inner">
                      {sc.emoji}
                    </div>

                    {/* Generous handwriting lines for 4th graders */}
                    <div className="space-y-2 pt-2 text-base">
                      {printMode === 'solution' ? (
                        <div className="text-sm font-semibold text-slate-800 italic leading-relaxed">
                          {sc.starterIdeas[0]}
                        </div>
                      ) : (
                        <>
                          <div className="border-b-2 border-slate-400 h-6" />
                          <div className="border-b-2 border-slate-400 h-6" />
                          <div className="border-b-2 border-slate-400 h-6" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Title & Whole Story Writing Lines at bottom */}
              <div className="border-t-2 border-slate-400 pt-5 space-y-4">
                <div className="text-base font-black">
                  Mein Titel für die Geschichte: <span className="inline-block w-72 border-b-2 border-slate-800" />
                </div>
                <div className="text-sm font-bold text-slate-700">
                  Hier ist meine vollständige Geschichte:
                </div>
                <div className="space-y-4 pt-1">
                  <div className="border-b-2 border-slate-400 h-6" />
                  <div className="border-b-2 border-slate-400 h-6" />
                  <div className="border-b-2 border-slate-400 h-6" />
                  <div className="border-b-2 border-slate-400 h-6" />
                  <div className="border-b-2 border-slate-400 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Footer Encouragement Note */}
          <div className="border-t border-slate-200 pt-3 text-center text-xs font-bold text-slate-500">
            JD LernPlayground • Tolle Arbeit! Du bist ein echter Sprach-Meister! 😊⭐
          </div>
        </div>
      </div>
    </div>
  );
};
