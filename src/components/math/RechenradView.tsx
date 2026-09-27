import React, { useState } from 'react';
import { RechenradExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';

interface RechenradViewProps {
  exercise: RechenradExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const RechenradView: React.FC<RechenradViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [answers, setAnswers] = useState<string[]>(
    () => exercise.spokes.map(() => '')
  );
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleInputChange = (idx: number, val: string) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleCheck = () => {
    let allRight = true;
    exercise.spokes.forEach((spoke, idx) => {
      const num = parseInt(answers[idx]?.trim() || '', 10);
      if (num !== spoke.result) {
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
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-purple-900">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎡</span>
          <span>Rechne von der Mitte (<strong>{exercise.centerNumber}</strong>) nach außen in jedes Feld!</span>
        </div>
      </div>

      {/* Wheel Representation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto py-2">
        {exercise.spokes.map((spoke, idx) => {
          const userVal = parseInt(answers[idx]?.trim() || '', 10);
          const isSpokeCorrect = hasChecked && userVal === spoke.result;
          const isSpokeWrong = hasChecked && userVal !== spoke.result;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 shadow-2xs ${
                isSpokeCorrect
                  ? 'bg-emerald-50 border-emerald-300'
                  : isSpokeWrong
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-12 h-12 rounded-xl bg-purple-100 text-purple-950 font-black text-lg flex items-center justify-center shrink-0">
                  {exercise.centerNumber}
                </span>
                <span className="text-lg font-black text-purple-600">
                  {spoke.operation} {spoke.operand} =
                </span>
              </div>

              <input
                type="number"
                value={answers[idx] || ''}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                disabled={disabled || (hasChecked && isCorrect)}
                placeholder="?"
                className="w-24 px-3 py-2 text-center text-xl font-black bg-slate-50 focus:bg-white rounded-xl border-2 border-slate-300 focus:border-purple-600 outline-none"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || answers.some((a) => !a.trim()) || (hasChecked && isCorrect)}
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Rechenrad gelöst! 🎉' : 'Ergebnisse prüfen'}</span>
        </button>
      </div>

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Einige Felder sind noch nicht ganz richtig. Überprüfe die rot markierten Rechnungen!
        </div>
      )}
    </div>
  );
};
