import React, { useState } from 'react';
import { StellenwertExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';

interface StellenwertHZEViewProps {
  exercise: StellenwertExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const StellenwertHZEView: React.FC<StellenwertHZEViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [typedTotal, setTypedTotal] = useState('');
  const [typedH, setTypedH] = useState('');
  const [typedZ, setTypedZ] = useState('');
  const [typedE, setTypedE] = useState('');

  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    const totalNum = parseInt(typedTotal.trim(), 10);
    const correct = totalNum === exercise.totalNumber;

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
      {/* Visual Dienes Representation */}
      <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-4">
        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Zahlendarstellung mit Hunderter-Platten, Zehner-Stangen & Einer-Würfeln:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Hunderter (Blue Platten) */}
          <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase text-sky-700">
              Hunderter (H): {exercise.hundreds}
            </span>
            <div className="flex flex-wrap justify-center gap-2 py-1">
              {Array.from({ length: exercise.hundreds }).map((_, i) => (
                <div
                  key={i}
                  className="w-14 h-14 bg-sky-400 border-2 border-sky-600 rounded-lg shadow-xs flex items-center justify-center text-white font-black text-xs"
                  title="100er-Platte"
                >
                  100
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-sky-900 font-mono">
              = {exercise.hundreds * 100}
            </span>
          </div>

          {/* Zehner (Green Stangen) */}
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase text-emerald-700">
              Zehner (Z): {exercise.tens}
            </span>
            <div className="flex flex-wrap justify-center gap-2 py-1">
              {Array.from({ length: exercise.tens }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-14 bg-emerald-500 border-2 border-emerald-700 rounded-md shadow-xs flex items-center justify-center text-[10px] text-white font-black"
                  title="10er-Stange"
                >
                  10
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-emerald-900 font-mono">
              = {exercise.tens * 10}
            </span>
          </div>

          {/* Einer (Yellow Würfel) */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase text-amber-700">
              Einer (E): {exercise.ones}
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 py-2 max-w-[130px]">
              {Array.from({ length: exercise.ones }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-amber-400 border border-amber-600 rounded-xs shadow-2xs"
                  title="1er-Würfel"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-amber-900 font-mono">
              = {exercise.ones}
            </span>
          </div>
        </div>
      </div>

      {/* Answer Field */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm sm:text-base font-bold text-slate-800">
            Welche Gesamtzahl ist das?
          </label>
          <input
            type="number"
            value={typedTotal}
            onChange={(e) => setTypedTotal(e.target.value)}
            disabled={disabled || (hasChecked && isCorrect)}
            placeholder="z. B. 359"
            className="w-36 px-4 py-2.5 text-center text-2xl font-black bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-xl outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !typedTotal.trim() || (hasChecked && isCorrect)}
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Richtig gebündelt! 🎉' : 'Überprüfen'}</span>
        </button>
      </div>

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Zähle noch einmal zusammen: {exercise.hundreds * 100} + {exercise.tens * 10} + {exercise.ones} = ?
        </div>
      )}
    </div>
  );
};
