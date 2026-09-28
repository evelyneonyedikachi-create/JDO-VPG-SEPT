import React, { useState, useEffect } from 'react';
import { GeldbetragExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check, Coins } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

interface GeldbetragViewProps {
  exercise: GeldbetragExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const GeldbetragView: React.FC<GeldbetragViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [typedAmount, setTypedAmount] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setTypedAmount('');
    setHasChecked(false);
    setIsCorrect(false);
  }, [exercise.id]);

  const handleAmountChange = (val: string) => {
    setTypedAmount(val);
    if (hasChecked && !isCorrect) setHasChecked(false);
  };

  const handleCheck = () => {
    // Normalize: replace comma with dot, remove euro signs and spaces
    const clean = typedAmount
      .replace('€', '')
      .replace('Euro', '')
      .replace(/\s+/g, '')
      .replace(',', '.');

    const parsedNum = parseFloat(clean);
    const parsedCent = Math.round(parsedNum * 100);

    const correct = parsedCent === exercise.correctTotalCent;

    setHasChecked(true);
    setIsCorrect(correct);

    if (correct) {
      playChime('success');
      onSolve(true);
    } else {
      playChime('error');
      onSolve(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Catalog */}
      <div className="p-5 rounded-3xl bg-amber-50/60 border-2 border-amber-200 space-y-4">
        <span className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-amber-600" />
          <span>Preisliste im Schreibwaren-Laden:</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {exercise.items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{item.icon || '🛍️'}</span>
                <span className="text-sm font-bold text-slate-800">{item.name}</span>
              </div>
              <span className="text-base font-black text-amber-950 font-mono bg-amber-100/70 px-2.5 py-1 rounded-xl">
                {item.priceEuro.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-300">
          <span className="text-xs font-black uppercase text-amber-800 block mb-1">Aufgabe:</span>
          <p className="text-base sm:text-lg font-black text-indigo-950">
            {exercise.question}
          </p>
        </div>
      </div>

      {/* Answer Field */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-sm sm:text-base font-bold text-slate-800 shrink-0">
            Gesamtbetrag:
          </label>
          <div className="relative">
            <input
              type="text"
              value={typedAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={disabled || (hasChecked && isCorrect)}
              placeholder="z. B. 24,70 €"
              className="w-44 px-4 py-2.5 text-center text-xl font-black bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-xl outline-none pr-8"
            />
            <span className="absolute right-3 top-3 text-slate-400 font-black">€</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !typedAmount.trim() || (hasChecked && isCorrect)}
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Betrag stimmt genau! 🎉' : 'Preis überprüfen'}</span>
        </button>
      </div>

      {/* Scratchpad */}
      <MathScratchpad
        key={`scratchpad-${exercise.id}`}
        label="✍️ Rechenweg für die Preise"
        placeholder="Rechne z. B.: 19,50 + 2,60 = 22,10 ..."
        onApplyRecognizedText={(text) => {
          if (!typedAmount) {
            handleAmountChange(text);
          }
        }}
      />

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Rechne schrittweise: Rucksack (19,50 €) + 1. Heft (2,60 €) = 22,10 €. Jetzt noch das 2. Heft dazuzählen!
        </div>
      )}
    </div>
  );
};
