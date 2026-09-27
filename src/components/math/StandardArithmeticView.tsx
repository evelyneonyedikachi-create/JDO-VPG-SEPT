import React, { useState } from 'react';
import { StandardArithmeticExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check, Sparkles } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

interface StandardArithmeticViewProps {
  exercise: StandardArithmeticExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const StandardArithmeticView: React.FC<StandardArithmeticViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [typedRemainder, setTypedRemainder] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    let correct = false;

    if (exercise.hasRemainder) {
      // Division with remainder: e.g. 40 / 7 -> 5 Rest 5
      const ansPart = typedAnswer.trim();
      const remPart = typedRemainder.trim();
      const combined = `${ansPart} Rest ${remPart}`.toLowerCase();
      const expected = String(exercise.correctAnswer).toLowerCase();

      correct =
        combined === expected ||
        (ansPart === '5' && remPart === String(exercise.remainder));
    } else {
      const cleanTyped = typedAnswer.trim().toLowerCase();
      const cleanExpected = String(exercise.correctAnswer).toLowerCase();
      correct = cleanTyped === cleanExpected;
    }

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
      {/* Visual Dot Array (for Multiplication) */}
      {exercise.dotArray && (
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex flex-col items-center gap-2">
          <span className="text-xs font-black uppercase text-indigo-700">
            Punktefeld ({exercise.dotArray.rows} Zeilen mit je {exercise.dotArray.cols} Punkten):
          </span>
          <div className="flex flex-col gap-2 py-1">
            {Array.from({ length: exercise.dotArray.rows }).map((_, r) => (
              <div key={r} className="flex gap-2">
                {Array.from({ length: exercise.dotArray!.cols }).map((_, c) => (
                  <div
                    key={c}
                    className="w-4 h-4 rounded-full bg-indigo-500 shadow-2xs"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Neighbour Strategy Hint (for Multiplication) */}
      {exercise.neighbourStrategy && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-semibold text-amber-900 flex items-center justify-around">
          <span className="text-slate-500 line-through">{exercise.neighbourStrategy.prev}</span>
          <span className="font-black text-indigo-600 bg-white px-3 py-1 rounded-xl shadow-2xs border border-indigo-200">
            🎯 {exercise.neighbourStrategy.target}
          </span>
          <span className="text-slate-500">{exercise.neighbourStrategy.next}</span>
        </div>
      )}

      {/* Equation Banner & Input */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center gap-6">
        <div className="text-3xl sm:text-5xl font-black text-slate-900 font-mono tracking-wide flex items-center gap-3">
          <span>{exercise.equation}</span>
          {!exercise.equation.includes('=') && <span>=</span>}
        </div>

        {exercise.hasRemainder ? (
          /* Division with remainder inputs */
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={disabled || (hasChecked && isCorrect)}
              placeholder="Ergebnis"
              className="w-28 px-3 py-3 text-center text-2xl font-black bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-2xl outline-none"
            />
            <span className="text-xl font-black text-slate-600">Rest</span>
            <input
              type="number"
              value={typedRemainder}
              onChange={(e) => setTypedRemainder(e.target.value)}
              disabled={disabled || (hasChecked && isCorrect)}
              placeholder="Rest"
              className="w-24 px-3 py-3 text-center text-2xl font-black bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-2xl outline-none"
            />
          </div>
        ) : (
          /* Standard single input */
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={disabled || (hasChecked && isCorrect)}
              placeholder="?"
              className="w-40 px-4 py-3 text-center text-3xl font-black bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-2xl outline-none"
            />
          </div>
        )}

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
          <span>{hasChecked && isCorrect ? 'Richtig gerechnet! 🎉' : 'Ergebnis prüfen'}</span>
        </button>
      </div>

      {/* Handwriting Scratchpad */}
      <MathScratchpad
        label="✍️ Stift-Rechenweg (HUION H1161)"
        placeholder="Schreibe hier mit dem Stift deine Zwischenschritte oder das Ergebnis..."
        onApplyRecognizedText={(text) => {
          const match = text.match(/\b\d+\b/);
          if (match && !typedAnswer) {
            setTypedAnswer(match[0]);
          }
        }}
      />

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Das Ergebnis stimmt noch nicht. Versuche es noch einmal in Einzelschritten!
        </div>
      )}
    </div>
  );
};
