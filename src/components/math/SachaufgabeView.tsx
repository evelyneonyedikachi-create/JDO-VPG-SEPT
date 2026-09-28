import React, { useState, useEffect } from 'react';
import { SachaufgabeExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check, HelpCircle, AlertCircle } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

interface SachaufgabeViewProps {
  exercise: SachaufgabeExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const SachaufgabeView: React.FC<SachaufgabeViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<'yes_solvable' | 'no_missing_info' | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setSelectedDecision(null);
    setTypedAnswer('');
    setHasChecked(false);
    setIsCorrect(false);
  }, [exercise.id]);

  const handleDecisionSelect = (decision: 'yes_solvable' | 'no_missing_info') => {
    setSelectedDecision(decision);
    if (hasChecked && !isCorrect) setHasChecked(false);
  };

  const handleAnswerChange = (val: string) => {
    setTypedAnswer(val);
    if (hasChecked && !isCorrect) setHasChecked(false);
  };

  const handleCheck = () => {
    let correct = false;
    if (exercise.isMissingInformation) {
      // Must have selected "no_missing_info"
      correct = selectedDecision === 'no_missing_info';
    } else {
      // Must have selected "yes_solvable" and provided correct answer
      correct =
        selectedDecision === 'yes_solvable' &&
        typedAnswer.trim().toLowerCase() === String(exercise.correctAnswer).toLowerCase();
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
      {/* Story Box */}
      <div className="p-6 rounded-3xl bg-amber-50/60 border-2 border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚲</span>
          <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
            Sach-Geschichte & Aufgabe
          </span>
        </div>
        <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
          {exercise.story}
        </p>
        <div className="p-4 bg-white rounded-2xl border border-amber-300">
          <span className="text-xs font-black uppercase text-amber-900 block mb-1">Frage:</span>
          <p className="text-base sm:text-lg font-black text-indigo-950">
            {exercise.question}
          </p>
        </div>
      </div>

      {/* Decision Buttons: Can this be solved? */}
      <div className="space-y-3">
        <span className="text-xs sm:text-sm font-black text-slate-700 block text-center">
          Kannst du diese Aufgabe mit den Angaben im Text lösen?
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => {
              playChime('click');
              handleDecisionSelect('yes_solvable');
            }}
            disabled={disabled || (hasChecked && isCorrect)}
            className={`p-4 rounded-2xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              selectedDecision === 'yes_solvable'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <span>Ja, die Aufgabe ist lösbar.</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playChime('click');
              handleDecisionSelect('no_missing_info');
            }}
            disabled={disabled || (hasChecked && isCorrect)}
            className={`p-4 rounded-2xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              selectedDecision === 'no_missing_info'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <span>❌ Nein, es fehlen Informationen.</span>
          </button>
        </div>
      </div>

      {/* If "yes_solvable" selected and not missing info, allow input */}
      {selectedDecision === 'yes_solvable' && !exercise.isMissingInformation && (
        <div className="max-w-md mx-auto p-4 bg-white rounded-2xl border-2 border-slate-200 flex items-center gap-3">
          <label className="text-sm font-bold text-slate-700">Dein Ergebnis:</label>
          <input
            type="text"
            value={typedAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={disabled || (hasChecked && isCorrect)}
            placeholder="Ergebnis eingeben..."
            className="flex-1 px-4 py-2 text-lg font-black bg-slate-50 border border-slate-300 rounded-xl"
          />
        </div>
      )}

      {/* Scratchpad */}
      <MathScratchpad
        key={`scratchpad-${exercise.id}`}
        label="✍️ Rechenweg & Überlegungen"
        placeholder="Schreibe deine Überlegungen oder Notizen hier mit dem Stift auf..."
      />

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={
            disabled ||
            !selectedDecision ||
            (selectedDecision === 'yes_solvable' && !exercise.isMissingInformation && !typedAnswer.trim()) ||
            (hasChecked && isCorrect)
          }
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect ? 'Detektiv-Aufgabe gelöst! 🎉' : 'Antwort überprüfen'}</span>
        </button>
      </div>

      {hasChecked && isCorrect && exercise.isMissingInformation && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm font-bold text-emerald-950 text-center space-y-1">
          <div>🎯 Genau richtig erkannt!</div>
          <div className="font-normal text-emerald-800">{exercise.missingReason}</div>
        </div>
      )}

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          ❌ Lies die Geschichte noch einmal ganz aufmerksam: Wissen wir wirklich, wie viel nach der Pause gefahren wurde?
        </div>
      )}
    </div>
  );
};
