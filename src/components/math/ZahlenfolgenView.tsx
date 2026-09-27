import React, { useState } from 'react';
import { ZahlenfolgenExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

interface ZahlenfolgenViewProps {
  exercise: ZahlenfolgenExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const ZahlenfolgenView: React.FC<ZahlenfolgenViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    const num = parseInt(typedAnswer.trim(), 10);
    const correct = exercise.correctAnswers.includes(num);

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
      {/* Sequence Cards */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center gap-6">
        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Finde die Regel und setze die Zahlenfolge fort:
        </span>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {exercise.sequence.map((item, idx) => (
            <React.Fragment key={idx}>
              {item !== null ? (
                <div className="w-20 sm:w-24 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-xl sm:text-2xl font-black text-indigo-950 font-mono shadow-2xs">
                  {item}
                </div>
              ) : (
                <div className="w-24 sm:w-28 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center shadow-sm">
                  <input
                    type="number"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    disabled={disabled || (hasChecked && isCorrect)}
                    placeholder="?"
                    className="w-full h-full text-center text-2xl font-black text-amber-950 bg-transparent outline-none font-mono"
                  />
                </div>
              )}
              {idx < exercise.sequence.length - 1 && (
                <span className="text-2xl font-black text-slate-300">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !typedAnswer.trim() || (hasChecked && isCorrect)}
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Zahlenfolge gelöst! 🎉' : 'Muster prüfen'}</span>
        </button>
      </div>

      <MathScratchpad
        label="✍️ Stift-Notizen zum Muster"
        placeholder="Finde den Unterschied zwischen den Zahlen (z. B. +300)..."
        onApplyRecognizedText={(text) => {
          const match = text.match(/\b\d+\b/);
          if (match && !typedAnswer) {
            setTypedAnswer(match[0]);
          }
        }}
      />

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Schau dir den Schritt zwischen der 1. und 2. Zahl an: Wie viel kommt jedes Mal dazu?
        </div>
      )}
    </div>
  );
};
