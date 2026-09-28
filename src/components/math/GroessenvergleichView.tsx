import React, { useState, useEffect } from 'react';
import { GroessenvergleichExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';

interface GroessenvergleichViewProps {
  exercise: GroessenvergleichExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const GroessenvergleichView: React.FC<GroessenvergleichViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [selectedOps, setSelectedOps] = useState<('<' | '>' | '=' | null)[]>(
    () => exercise.items.map(() => null)
  );

  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setSelectedOps(exercise.items.map(() => null));
    setHasChecked(false);
    setIsCorrect(false);
  }, [exercise.id]);

  const handleSelectOp = (idx: number, op: '<' | '>' | '=') => {
    setSelectedOps((prev) => {
      const copy = [...prev];
      copy[idx] = op;
      return copy;
    });
    if (hasChecked && !isCorrect) {
      setHasChecked(false);
    }
  };

  const handleCheck = () => {
    let allRight = true;
    exercise.items.forEach((item, idx) => {
      if (selectedOps[idx] !== item.correctOp) {
        allRight = false;
      }
    });

    setHasChecked(true);
    setIsCorrect(allRight);

    if (allRight) {
      playChime('success');
      onSolve(true);
    } else {
      playChime('error');
      onSolve(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs sm:text-sm font-semibold text-sky-900 text-center">
        Wähle das passende Zeichen: <strong>&lt; (kleiner)</strong>, <strong>&gt; (größer)</strong> oder <strong>= (gleich)</strong>.
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {exercise.items.map((item, idx) => {
          const selected = selectedOps[idx];
          const isItemCorrect = hasChecked && selected === item.correctOp;
          const isItemWrong = hasChecked && selected !== item.correctOp;

          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs ${
                isItemCorrect
                  ? 'bg-emerald-50 border-emerald-300'
                  : isItemWrong
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-3 text-xl sm:text-2xl font-black text-slate-800 font-mono">
                <span className="w-28 text-right">{item.leftExpr}</span>
                <span className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 text-2xl font-black">
                  {selected || '?'}
                </span>
                <span className="w-28 text-left">{item.rightExpr}</span>
              </div>

              {/* Op selector buttons */}
              <div className="flex items-center gap-2">
                {(['<', '=', '>'] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      playChime('click');
                      handleSelectOp(idx, op);
                    }}
                    disabled={disabled || (hasChecked && isCorrect)}
                    className={`w-12 h-12 rounded-xl font-black text-xl transition-all shadow-2xs active:scale-95 flex items-center justify-center ${
                      selected === op
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || selectedOps.some((op) => op === null) || (hasChecked && isCorrect)}
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Vergleich stimmt! 🎉' : 'Vergleich prüfen'}</span>
        </button>
      </div>

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Tipp: Rechne erst beide Seiten aus (z. B. 300 + 200 = 500) und vergleiche dann mit der anderen Zahl!
        </div>
      )}
    </div>
  );
};
