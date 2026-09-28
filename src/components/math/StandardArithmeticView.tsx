import React, { useState, useEffect } from 'react';
import { StandardArithmeticExercise } from '../../types/math';
import { validateUserMathAnswer } from '../../services/deterministicMathEngine';
import { getTaskDraft, saveTaskDraft, clearTaskDraft } from '../../services/mathDraftService';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';
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
  // Restore draft ONLY if JD previously started this exact task ID and paused it
  const initialDraft = getTaskDraft(exercise.id);
  const [typedAnswer, setTypedAnswer] = useState(initialDraft?.typedAnswer || '');
  const [typedRemainder, setTypedRemainder] = useState(initialDraft?.typedRemainder || '');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // CRITICAL: Fresh local answer state on task change
  useEffect(() => {
    const draft = getTaskDraft(exercise.id);
    setTypedAnswer(draft?.typedAnswer || '');
    setTypedRemainder(draft?.typedRemainder || '');
    setHasChecked(false);
    setIsCorrect(null);
    setFeedback(null);
  }, [exercise.id]);

  const handleAnswerChange = (val: string) => {
    setTypedAnswer(val);
    saveTaskDraft(exercise.id, { typedAnswer: val, typedRemainder });
    // If previously marked incorrect, immediately restore editable neutral check state
    if (hasChecked && isCorrect === false) {
      setHasChecked(false);
      setIsCorrect(null);
      setFeedback(null);
    }
  };

  const handleRemainderChange = (val: string) => {
    setTypedRemainder(val);
    saveTaskDraft(exercise.id, { typedAnswer, typedRemainder: val });
    if (hasChecked && isCorrect === false) {
      setHasChecked(false);
      setIsCorrect(null);
      setFeedback(null);
    }
  };

  const handleCheck = () => {
    // Validate strictly against the current active exercise
    const result = validateUserMathAnswer(exercise, typedAnswer, {
      remainder: typedRemainder,
    });

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
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={disabled || (hasChecked && isCorrect === true)}
              placeholder="Ergebnis"
              className="w-28 px-3 py-3 text-center text-2xl font-black bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-2xl outline-none"
            />
            <span className="text-xl font-black text-slate-600">Rest</span>
            <input
              type="number"
              value={typedRemainder}
              onChange={(e) => handleRemainderChange(e.target.value)}
              disabled={disabled || (hasChecked && isCorrect === true)}
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
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={disabled || (hasChecked && isCorrect === true)}
              placeholder="?"
              className="w-40 px-4 py-3 text-center text-3xl font-black bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-2xl outline-none"
            />
          </div>
        )}

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
          <span>{hasChecked && isCorrect === true ? 'Richtig gerechnet! 🎉' : 'Ergebnis prüfen'}</span>
        </button>
      </div>

      {/* Handwriting Scratchpad - separated by unique key per exercise */}
      <MathScratchpad
        key={`scratchpad-${exercise.id}`}
        label="✍️ Stift-Rechenweg (HUION H1161)"
        placeholder="Schreibe hier mit dem Stift deine Zwischenschritte oder das Ergebnis..."
        onApplyRecognizedText={(text) => {
          const match = text.match(/\b\d+\b/);
          if (match) {
            handleAnswerChange(match[0]);
          }
        }}
      />

      {/* Incorrect Feedback Banner */}
      {hasChecked && isCorrect === false && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center animate-shake">
          {feedback || exercise.hint || '❌ Das Ergebnis stimmt noch nicht. Versuche es noch einmal in Einzelschritten!'}
        </div>
      )}
    </div>
  );
};
