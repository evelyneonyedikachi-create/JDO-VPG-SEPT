import React, { useState, useEffect } from 'react';
import { HalbschriftlichExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

interface HalbschriftlichViewProps {
  exercise: HalbschriftlichExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const HalbschriftlichView: React.FC<HalbschriftlichViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [step1Val, setStep1Val] = useState('');
  const [step2Val, setStep2Val] = useState('');
  const [finalVal, setFinalVal] = useState('');

  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setStep1Val('');
    setStep2Val('');
    setFinalVal('');
    setHasChecked(false);
    setIsCorrect(false);
  }, [exercise.id]);

  const handleStep1Change = (val: string) => {
    setStep1Val(val);
    if (hasChecked && !isCorrect) setHasChecked(false);
  };

  const handleStep2Change = (val: string) => {
    setStep2Val(val);
    if (hasChecked && !isCorrect) setHasChecked(false);
  };

  const handleFinalChange = (val: string) => {
    setFinalVal(val);
    if (hasChecked && !isCorrect) setHasChecked(false);
  };

  const handleCheck = () => {
    const s1 = parseInt(step1Val.trim(), 10);
    const s2 = parseInt(step2Val.trim(), 10);
    const f = parseInt(finalVal.trim(), 10);

    const s1Ok = s1 === exercise.step1.result;
    const s2Ok = s2 === exercise.step2.result;
    const fOk = f === exercise.finalResult;

    const allRight = s1Ok && s2Ok && fOk;

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
      {/* Target calculation banner */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="px-8 py-4 rounded-3xl bg-indigo-50 border-2 border-indigo-200 text-center space-y-1">
          <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
            Aufgabe:
          </span>
          <div className="text-3xl sm:text-4xl font-black text-indigo-950 font-mono">
            {exercise.problem} = ?
          </div>
        </div>
      </div>

      {/* 2 Intermediate Steps */}
      <div className="max-w-md mx-auto space-y-3 bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">
          Rechne schrittweise:
        </span>

        {/* Step 1: Zehner */}
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-black text-slate-800 font-mono">
            <span>1. Schritt (Zehner):</span>
            <span>{exercise.step1.expr} =</span>
          </div>
          <input
            type="number"
            value={step1Val}
            onChange={(e) => handleStep1Change(e.target.value)}
            disabled={disabled || (hasChecked && isCorrect)}
            placeholder="?"
            className="w-24 px-3 py-2 text-center text-xl font-black bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-xl outline-none"
          />
        </div>

        {/* Step 2: Einer */}
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-black text-slate-800 font-mono">
            <span>2. Schritt (Einer):</span>
            <span>{exercise.step2.expr} =</span>
          </div>
          <input
            type="number"
            value={step2Val}
            onChange={(e) => handleStep2Change(e.target.value)}
            disabled={disabled || (hasChecked && isCorrect)}
            placeholder="?"
            className="w-24 px-3 py-2 text-center text-xl font-black bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-xl outline-none"
          />
        </div>

        {/* Final Ergebnis */}
        <div className="flex items-center justify-between gap-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-black text-amber-950 font-mono">
            <span>Endergebnis:</span>
            <span>{exercise.problem} =</span>
          </div>
          <input
            type="number"
            value={finalVal}
            onChange={(e) => handleFinalChange(e.target.value)}
            disabled={disabled || (hasChecked && isCorrect)}
            placeholder="?"
            className="w-24 px-3 py-2 text-center text-xl font-black bg-white border-2 border-amber-400 focus:border-indigo-600 rounded-xl outline-none"
          />
        </div>
      </div>

      {/* Handwriting Scratchpad */}
      <MathScratchpad
        label="✍️ Dein handschriftlicher Rechenweg (optional)"
        placeholder="Schreibe hier mit dem Stift deine Zwischenschritte auf..."
        onApplyRecognizedText={(text) => {
          // If child wrote single number, auto-fill final result
          const matchNum = text.match(/\b\d+\b/);
          if (matchNum && !finalVal) {
            setFinalVal(matchNum[0]);
          }
        }}
      />

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={
            disabled ||
            !step1Val.trim() ||
            !step2Val.trim() ||
            !finalVal.trim() ||
            (hasChecked && isCorrect)
          }
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Schritte richtig! 🎉' : 'Rechnung prüfen'}</span>
        </button>
      </div>

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Überprüfe deine Zwischenrechnung. Tipp: Erst die Zehner addieren, dann das Zwischenergebnis mit den Einern verrechnen!
        </div>
      )}
    </div>
  );
};
