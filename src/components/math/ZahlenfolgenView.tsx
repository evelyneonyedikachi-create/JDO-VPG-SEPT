import React, { useState, useEffect } from 'react';
import { ZahlenfolgenExercise } from '../../types/math';
import { validateUserMathAnswer } from '../../services/deterministicMathEngine';
import { getTaskDraft, saveTaskDraft, clearTaskDraft } from '../../services/mathDraftService';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

interface ZahlenfolgenViewProps {
  exercise: ZahlenfolgenExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const ZahlenfolgenView: React.FC<ZahlenfolgenViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const initialDraft = getTaskDraft(exercise.id);
  const [typedAnswer, setTypedAnswer] = useState(initialDraft?.typedAnswer || '');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

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
      {/* Sequence Cards */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center gap-6">
        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Finde die Regel und setze die Zahlenfolge fort:
        </span>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {exercise.sequence.map((item, idx) => (
            <React.Fragment key={idx}>
              {item !== null ? (
                <div className="w-20 sm:w-24 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-xl sm:text-2xl font-black text-indigo-950 font-mono shadow-2xs">
                  {item}
                </div>
              ) : (
                <div className="w-24 sm:w-28 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center shadow-sm">
                  <input
                    type="number"
                    value={typedAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    disabled={disabled || (hasChecked && isCorrect === true)}
                    placeholder="?"
                    className="w-full h-full text-center text-2xl font-black bg-transparent outline-none font-mono text-indigo-950"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
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
          <span>{hasChecked && isCorrect === true ? 'Zahlenfolge gelöst! 🎉' : 'Ergebnis prüfen'}</span>
        </button>
      </div>

      <MathScratchpad
        key={`scratchpad-${exercise.id}`}
        label="✍️ Stift-Rechenweg (HUION H1161)"
        placeholder="Schreibe hier die Abstände auf (z. B. immer +7 oder immer -12)..."
        onApplyRecognizedText={(text) => {
          const match = text.match(/\b\d+\b/);
          if (match) {
            handleAnswerChange(match[0]);
          }
        }}
      />

      {hasChecked && isCorrect === false && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center animate-shake">
          {feedback || exercise.hint || '❌ Schau dir den Abstand zwischen den Zahlen genau an!'}
        </div>
      )}
    </div>
  );
};
