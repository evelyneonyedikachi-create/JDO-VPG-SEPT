import React, { useState, useEffect } from 'react';
import { DoublingHalvingExercise } from '../../types/math';
import { validateUserMathAnswer } from '../../services/deterministicMathEngine';
import { getTaskDraft, saveTaskDraft, clearTaskDraft } from '../../services/mathDraftService';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

interface DoublingHalvingViewProps {
  exercise: DoublingHalvingExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const DoublingHalvingView: React.FC<DoublingHalvingViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const initialDraft = getTaskDraft(exercise.id);
  const [typedAnswer, setTypedAnswer] = useState(initialDraft?.typedAnswer || '');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fresh local state on task change
  useEffect(() => {
    const draft = getTaskDraft(exercise.id);
    setTypedAnswer(draft?.typedAnswer || '');
    setHasChecked(false);
    setIsCorrect(null);
    setFeedback(null);
  }, [exercise.id]);

  const handleAnswerChange = (val: string) => {
    setTypedAnswer(val);
    saveTaskDraft(exercise.id, { typedAnswer: val });
    if (hasChecked && isCorrect === false) {
      setHasChecked(false);
      setIsCorrect(null);
      setFeedback(null);
    }
  };

  const handleCheck = () => {
    const result = validateUserMathAnswer(exercise, typedAnswer);

    setHasChecked(true);
    setIsCorrect(result.isCorrect);
    setFeedback(result.feedback || null);

    if (result.isCorrect) {
      clearTaskDraft(exercise.id);
      playChime('success');
      onSolve(true);
    } else {
      playChime('error');
      onSolve(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center gap-6">
        {exercise.riddleText ? (
          <div className="text-xl sm:text-2xl font-black text-center text-indigo-950 max-w-md bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
            „{exercise.riddleText}“
          </div>
        ) : (
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {exercise.mode === 'verdoppeln' ? 'Verdopple die Zahl:' : 'Halbiere die Zahl:'}
            </span>
            <div className="text-4xl sm:text-5xl font-black text-indigo-950 font-mono">
              {exercise.promptNumber}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="text-base font-bold text-slate-700">Dein Ergebnis:</label>
          <input
            type="number"
            value={typedAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={disabled || (hasChecked && isCorrect === true)}
            placeholder="?"
            className="w-36 px-4 py-3 text-center text-3xl font-black bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-2xl outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !typedAnswer.trim() || (hasChecked && isCorrect === true)}
          className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect === true
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasChecked && isCorrect === true ? 'Ergebnis stimmt! 🎉' : 'Ergebnis prüfen'}</span>
        </button>
      </div>

      <MathScratchpad
        key={`scratchpad-${exercise.id}`}
        label="✍️ Stift-Rechenweg (HUION H1161)"
        placeholder="Rechne z. B.: 300 verdoppeln = 600, 20 verdoppeln = 40..."
        onApplyRecognizedText={(text) => {
          const match = text.match(/\b\d+\b/);
          if (match) {
            handleAnswerChange(match[0]);
          }
        }}
      />

      {hasChecked && isCorrect === false && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center animate-shake">
          {feedback || exercise.hint || '❌ Tipp: Zerlege die Zahl erst in Hunderter und Zehner und berechne beide Teile einzeln!'}
        </div>
      )}
    </div>
  );
};
