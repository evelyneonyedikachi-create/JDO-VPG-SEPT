import React, { useState, useEffect } from 'react';
import { NachbarzahlenExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

interface NachbarzahlenViewProps {
  exercise: NachbarzahlenExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const NachbarzahlenView: React.FC<NachbarzahlenViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [lowerZ, setLowerZ] = useState('');
  const [upperZ, setUpperZ] = useState('');
  const [lowerH, setLowerH] = useState('');
  const [upperH, setUpperH] = useState('');

  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setLowerZ('');
    setUpperZ('');
    setLowerH('');
    setUpperH('');
    setHasChecked(false);
    setIsCorrect(false);
  }, [exercise.id]);

  const isZehnerNeeded = exercise.kind === 'zehner' || exercise.kind === 'both';
  const isHunderterNeeded = (exercise.kind === 'hunderter' || exercise.kind === 'both') && exercise.lowerHunderter !== undefined;

  const handleCheck = () => {
    const lZ = parseInt(lowerZ.trim(), 10);
    const uZ = parseInt(upperZ.trim(), 10);
    const lH = parseInt(lowerH.trim(), 10);
    const uH = parseInt(upperH.trim(), 10);

    const isZOk = !isZehnerNeeded || (lZ === exercise.lowerZehner && uZ === exercise.upperZehner);
    const isHOk = !isHunderterNeeded || (lH === exercise.lowerHunderter && uH === exercise.upperHunderter);

    const allRight = isZOk && isHOk;

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

  const isFormFilled =
    (!isZehnerNeeded || (lowerZ.trim() !== '' && upperZ.trim() !== '')) &&
    (!isHunderterNeeded || (lowerH.trim() !== '' && upperH.trim() !== ''));

  return (
    <div className="space-y-6">
      {/* Target Number Banner */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="px-8 py-3 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-center">
          <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
            Gegebene Zahl
          </span>
          <div className="text-4xl font-black text-indigo-950 font-mono">
            {exercise.number}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {/* Nachbarzehner (NZ) */}
        {isZehnerNeeded && (
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider block text-center">
              Nachbarzehner (NZ)
            </span>
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                value={lowerZ}
                onChange={(e) => setLowerZ(e.target.value)}
                disabled={disabled || (hasChecked && isCorrect)}
                placeholder="Vorgänger"
                className="w-24 px-2 py-2 text-center text-lg font-black bg-slate-50 border border-slate-300 rounded-xl"
              />
              <span className="text-xl font-black text-slate-400">&lt; {exercise.number} &lt;</span>
              <input
                type="number"
                value={upperZ}
                onChange={(e) => setUpperZ(e.target.value)}
                disabled={disabled || (hasChecked && isCorrect)}
                placeholder="Nachfolger"
                className="w-24 px-2 py-2 text-center text-lg font-black bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Nachbarhunderter (NH) */}
        {isHunderterNeeded && (
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider block text-center">
              Nachbarhunderter (NH)
            </span>
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                value={lowerH}
                onChange={(e) => setLowerH(e.target.value)}
                disabled={disabled || (hasChecked && isCorrect)}
                placeholder="Vorgänger"
                className="w-24 px-2 py-2 text-center text-lg font-black bg-slate-50 border border-slate-300 rounded-xl"
              />
              <span className="text-xl font-black text-slate-400">&lt; {exercise.number} &lt;</span>
              <input
                type="number"
                value={upperH}
                onChange={(e) => setUpperH(e.target.value)}
                disabled={disabled || (hasChecked && isCorrect)}
                placeholder="Nachfolger"
                className="w-24 px-2 py-2 text-center text-lg font-black bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !isFormFilled || (hasChecked && isCorrect)}
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Nachbarzahlen richtig! 🎉' : 'Überprüfen'}</span>
        </button>
      </div>

      {/* Guiding hint: does NOT reveal numbers */}
      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          {exercise.hint ||
            '💡 Tipp: Schaue auf die Zehner- bzw. Hunderterstelle. Welche vollen Zehner- oder Hunderterzahlen schließen diese Zahl genau ein?'}
        </div>
      )}

      {/* Scratchpad */}
      <MathScratchpad
        key={`scratchpad-${exercise.id}`}
        label="✍️ Stift-Rechenweg (HUION H1161)"
        placeholder="Notizen oder Zahlenstrahl aufzeichnen..."
      />
    </div>
  );
};
