import React, { useState } from 'react';
import { RechentabelleExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';

interface RechentabelleViewProps {
  exercise: RechentabelleExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const RechentabelleView: React.FC<RechentabelleViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [gridValues, setGridValues] = useState<string[][]>(() =>
    exercise.rowHeaders.map(() => exercise.colHeaders.map(() => ''))
  );
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCellChange = (r: number, c: number, val: string) => {
    setGridValues((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  const handleCheck = () => {
    let allRight = true;
    for (let r = 0; r < exercise.rowHeaders.length; r++) {
      for (let c = 0; c < exercise.colHeaders.length; c++) {
        const userNum = parseInt(gridValues[r][c]?.trim() || '', 10);
        if (userNum !== exercise.grid[r][c]) {
          allRight = false;
        }
      }
    }

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
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-blue-900">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span>Rechne jede Zeilenzahl mit jeder Spaltenzahl zusammen!</span>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto py-2">
        <table className="mx-auto border-collapse bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-4 sm:p-5 text-2xl font-black text-center w-24 border-r border-b border-indigo-500">
                {exercise.operator}
              </th>
              {exercise.colHeaders.map((col, cIdx) => (
                <th
                  key={cIdx}
                  className="p-4 sm:p-5 text-xl font-black text-center w-28 sm:w-32 border-r border-b border-indigo-500 last:border-r-0"
                >
                  +{col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exercise.rowHeaders.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                <th className="p-4 sm:p-5 text-xl font-black text-center bg-indigo-50 text-indigo-950 border-r border-b border-slate-200">
                  {row}
                </th>
                {exercise.colHeaders.map((_, cIdx) => {
                  const val = gridValues[rIdx][cIdx];
                  const numVal = parseInt(val?.trim() || '', 10);
                  const isCellCorrect = hasChecked && numVal === exercise.grid[rIdx][cIdx];
                  const isCellWrong = hasChecked && numVal !== exercise.grid[rIdx][cIdx];

                  return (
                    <td
                      key={cIdx}
                      className="p-2 sm:p-3 text-center border-r border-b border-slate-200 last:border-r-0"
                    >
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        disabled={disabled || (hasChecked && isCorrect)}
                        placeholder="?"
                        className={`w-24 px-2 py-2.5 text-center text-xl font-black rounded-xl border-2 outline-none transition-all ${
                          isCellCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            : isCellWrong
                            ? 'bg-rose-50 border-rose-400 text-rose-950'
                            : 'bg-white border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={
            disabled ||
            gridValues.some((r) => r.some((c) => !c.trim())) ||
            (hasChecked && isCorrect)
          }
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Tabelle komplett gelöst! 🎉' : 'Tabelle prüfen'}</span>
        </button>
      </div>

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Einige Felder sind noch nicht korrekt berechnet. Überprüfe die rot markierten Zellen!
        </div>
      )}
    </div>
  );
};
