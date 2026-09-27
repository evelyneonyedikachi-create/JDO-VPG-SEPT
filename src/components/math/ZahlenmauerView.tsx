import React, { useState } from 'react';
import { NumberPyramidExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check, Sparkles } from 'lucide-react';

interface ZahlenmauerViewProps {
  exercise: NumberPyramidExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const ZahlenmauerView: React.FC<ZahlenmauerViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const { bottom, middle, top } = exercise.bricks;

  const [mid0, setMid0] = useState(middle[0].isGiven ? String(middle[0].value) : '');
  const [mid1, setMid1] = useState(middle[1].isGiven ? String(middle[1].value) : '');
  const [top0, setTop0] = useState(top[0].isGiven ? String(top[0].value) : '');

  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    const valM0 = parseInt(mid0.trim(), 10);
    const valM1 = parseInt(mid1.trim(), 10);
    const valT0 = parseInt(top0.trim(), 10);

    const m0Correct = valM0 === middle[0].value;
    const m1Correct = valM1 === middle[1].value;
    const t0Correct = valT0 === top[0].value;

    const allCorrect = m0Correct && m1Correct && t0Correct;

    setHasChecked(true);
    setIsCorrect(allCorrect);

    if (allCorrect) {
      playChime('success');
      onSolve(true);
    } else {
      playChime('error');
      onSolve(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-amber-900">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧱</span>
          <span>Regel: Jeder obere Stein ist die Summe der beiden darunterliegenden Steine!</span>
        </div>
      </div>

      {/* Visual Pyramid */}
      <div className="flex flex-col items-center justify-center gap-2.5 py-4">
        {/* Level 3: TOP (1 brick) */}
        <div className="flex justify-center">
          <div className="w-36 sm:w-44 h-16 sm:h-20 rounded-2xl border-3 border-amber-800/40 bg-gradient-to-b from-amber-100 to-amber-200 shadow-md flex flex-col items-center justify-center p-2">
            <span className="text-[10px] font-black uppercase text-amber-800/80">Spitze</span>
            {top[0].isGiven ? (
              <span className="text-2xl sm:text-3xl font-black text-amber-950">{top[0].value}</span>
            ) : (
              <input
                type="number"
                value={top0}
                onChange={(e) => setTop0(e.target.value)}
                disabled={disabled || (hasChecked && isCorrect)}
                placeholder="?"
                className="w-24 text-center text-xl sm:text-2xl font-black bg-white rounded-xl border-2 border-amber-400 text-amber-950 focus:border-indigo-600 outline-none"
              />
            )}
          </div>
        </div>

        {/* Level 2: MIDDLE (2 bricks) */}
        <div className="flex justify-center gap-2.5">
          {/* Middle Left */}
          <div className="w-36 sm:w-44 h-16 sm:h-20 rounded-2xl border-3 border-amber-700/40 bg-gradient-to-b from-amber-50 to-amber-100 shadow-md flex flex-col items-center justify-center p-2">
            <span className="text-[10px] font-black uppercase text-amber-700/80">Mitte links</span>
            {middle[0].isGiven ? (
              <span className="text-xl sm:text-2xl font-black text-amber-950">{middle[0].value}</span>
            ) : (
              <input
                type="number"
                value={mid0}
                onChange={(e) => setMid0(e.target.value)}
                disabled={disabled || (hasChecked && isCorrect)}
                placeholder="?"
                className="w-24 text-center text-xl sm:text-2xl font-black bg-white rounded-xl border-2 border-amber-400 text-amber-950 focus:border-indigo-600 outline-none"
              />
            )}
          </div>

          {/* Middle Right */}
          <div className="w-36 sm:w-44 h-16 sm:h-20 rounded-2xl border-3 border-amber-700/40 bg-gradient-to-b from-amber-50 to-amber-100 shadow-md flex flex-col items-center justify-center p-2">
            <span className="text-[10px] font-black uppercase text-amber-700/80">Mitte rechts</span>
            {middle[1].isGiven ? (
              <span className="text-xl sm:text-2xl font-black text-amber-950">{middle[1].value}</span>
            ) : (
              <input
                type="number"
                value={mid1}
                onChange={(e) => setMid1(e.target.value)}
                disabled={disabled || (hasChecked && isCorrect)}
                placeholder="?"
                className="w-24 text-center text-xl sm:text-2xl font-black bg-white rounded-xl border-2 border-amber-400 text-amber-950 focus:border-indigo-600 outline-none"
              />
            )}
          </div>
        </div>

        {/* Level 1: BOTTOM (3 bricks) */}
        <div className="flex justify-center gap-2.5">
          {bottom.map((b, idx) => (
            <div
              key={b.id}
              className="w-28 sm:w-36 h-16 sm:h-18 rounded-2xl border-3 border-amber-900/30 bg-gradient-to-b from-amber-200 to-amber-300 shadow-md flex flex-col items-center justify-center p-2"
            >
              <span className="text-[10px] font-black uppercase text-amber-900/70">
                Grundstein {idx + 1}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-950">{b.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action check button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || (hasChecked && isCorrect)}
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Zahlenmauer fertig! 🎉' : 'Mauer überprüfen'}</span>
        </button>
      </div>

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Ein oder mehrere Steine stimmen noch nicht. Rechne noch einmal: Grundstein 1 + Grundstein 2 = Mitte links!
        </div>
      )}
    </div>
  );
};
