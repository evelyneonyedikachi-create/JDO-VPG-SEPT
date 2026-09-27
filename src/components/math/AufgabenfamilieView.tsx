import React, { useState } from 'react';
import { AufgabenfamilieExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';

interface AufgabenfamilieViewProps {
  exercise: AufgabenfamilieExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const AufgabenfamilieView: React.FC<AufgabenfamilieViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [numA, numB, numProduct] = exercise.numbers;

  // 4 equations: op1 * op2 = res, op2 * op1 = res, res / op1 = op2, res / op2 = op1
  const [eq1, setEq1] = useState({ op1: '', op2: '', res: '' });
  const [eq2, setEq2] = useState({ op1: '', op2: '', res: '' });
  const [eq3, setEq3] = useState({ op1: '', op2: '', res: '' });
  const [eq4, setEq4] = useState({ op1: '', op2: '', res: '' });

  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    // Check multiplication 1: 4 * 5 = 20 or 5 * 4 = 20
    const m1_1 = parseInt(eq1.op1, 10);
    const m1_2 = parseInt(eq1.op2, 10);
    const m1_r = parseInt(eq1.res, 10);
    const isM1Valid =
      ((m1_1 === numA && m1_2 === numB) || (m1_1 === numB && m1_2 === numA)) &&
      m1_r === numProduct;

    // Check multiplication 2:
    const m2_1 = parseInt(eq2.op1, 10);
    const m2_2 = parseInt(eq2.op2, 10);
    const m2_r = parseInt(eq2.res, 10);
    const isM2Valid =
      ((m2_1 === numA && m2_2 === numB) || (m2_1 === numB && m2_2 === numA)) &&
      m2_r === numProduct &&
      !(m2_1 === m1_1 && m2_2 === m1_2); // should be the swapped task

    // Check division 1: 20 / 4 = 5 or 20 / 5 = 4
    const d1_1 = parseInt(eq3.op1, 10);
    const d1_2 = parseInt(eq3.op2, 10);
    const d1_r = parseInt(eq3.res, 10);
    const isD1Valid =
      d1_1 === numProduct &&
      ((d1_2 === numA && d1_r === numB) || (d1_2 === numB && d1_r === numA));

    // Check division 2:
    const d2_1 = parseInt(eq4.op1, 10);
    const d2_2 = parseInt(eq4.op2, 10);
    const d2_r = parseInt(eq4.res, 10);
    const isD2Valid =
      d2_1 === numProduct &&
      ((d2_2 === numA && d2_r === numB) || (d2_2 === numB && d2_r === numA)) &&
      !(d2_2 === d1_2); // should be the other division

    const allRight = isM1Valid && isM2Valid && isD1Valid && isD2Valid;

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
      {/* 3 Family Numbers House */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="w-56 p-4 rounded-3xl bg-gradient-to-b from-amber-200 via-orange-100 to-amber-50 border-3 border-amber-300 shadow-md text-center space-y-2">
          <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
            Zahlen-Familie
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-xl font-black text-amber-950 shadow-2xs">
              {numA}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-xl font-black text-amber-950 shadow-2xs">
              {numB}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xl font-black shadow-2xs">
              {numProduct}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Equation Rows */}
      <div className="max-w-md mx-auto space-y-3">
        {/* Mul 1 */}
        <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <input
            type="number"
            value={eq1.op1}
            onChange={(e) => setEq1({ ...eq1, op1: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-16 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
          <span className="text-xl font-black text-slate-700">×</span>
          <input
            type="number"
            value={eq1.op2}
            onChange={(e) => setEq1({ ...eq1, op2: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-16 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
          <span className="text-xl font-black text-slate-700">=</span>
          <input
            type="number"
            value={eq1.res}
            onChange={(e) => setEq1({ ...eq1, res: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-20 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
        </div>

        {/* Mul 2 */}
        <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <input
            type="number"
            value={eq2.op1}
            onChange={(e) => setEq2({ ...eq2, op1: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-16 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
          <span className="text-xl font-black text-slate-700">×</span>
          <input
            type="number"
            value={eq2.op2}
            onChange={(e) => setEq2({ ...eq2, op2: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-16 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
          <span className="text-xl font-black text-slate-700">=</span>
          <input
            type="number"
            value={eq2.res}
            onChange={(e) => setEq2({ ...eq2, res: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-20 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
        </div>

        {/* Div 1 */}
        <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <input
            type="number"
            value={eq3.op1}
            onChange={(e) => setEq3({ ...eq3, op1: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-20 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
          <span className="text-xl font-black text-slate-700">÷</span>
          <input
            type="number"
            value={eq3.op2}
            onChange={(e) => setEq3({ ...eq3, op2: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-16 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
          <span className="text-xl font-black text-slate-700">=</span>
          <input
            type="number"
            value={eq3.res}
            onChange={(e) => setEq3({ ...eq3, res: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-16 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
        </div>

        {/* Div 2 */}
        <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <input
            type="number"
            value={eq4.op1}
            onChange={(e) => setEq4({ ...eq4, op1: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-20 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
          <span className="text-xl font-black text-slate-700">÷</span>
          <input
            type="number"
            value={eq4.op2}
            onChange={(e) => setEq4({ ...eq4, op2: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-16 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
          <span className="text-xl font-black text-slate-700">=</span>
          <input
            type="number"
            value={eq4.res}
            onChange={(e) => setEq4({ ...eq4, res: e.target.value })}
            disabled={disabled || (hasChecked && isCorrect)}
            className="w-16 h-12 text-center text-xl font-black bg-slate-50 border border-slate-300 rounded-xl"
            placeholder="?"
          />
        </div>
      </div>

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
          <span>{hasChecked && isCorrect ? 'Aufgabenfamilie komplett! 🎉' : 'Familie prüfen'}</span>
        </button>
      </div>

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Es fehlen noch Aufgaben oder eine Tauschaufgabe wurde doppelt eingegeben. Prüfe die 2 Mal- und 2 Geteilt-Aufgaben!
        </div>
      )}
    </div>
  );
};
