import React, { useState, useEffect } from 'react';
import { NumberPyramidExercise, PyramidBrick } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check } from 'lucide-react';
import { MathScratchpad } from './MathScratchpad';

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

  const getInitialBricks = () => {
    const init: Record<string, string> = {};
    [...exercise.bricks.bottom, ...exercise.bricks.middle, ...exercise.bricks.top].forEach((b) => {
      if (b.isGiven) {
        init[b.id] = String(b.value);
      } else {
        init[b.id] = '';
      }
    });
    return init;
  };

  // Track values of all bricks in a state map keyed by brick id
  const [brickInputs, setBrickInputs] = useState<Record<string, string>>(getInitialBricks);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setBrickInputs(getInitialBricks());
    setHasChecked(false);
    setIsCorrect(false);
  }, [exercise.id]);

  const handleInputChange = (id: string, val: string) => {
    setBrickInputs((prev) => ({ ...prev, [id]: val }));
    if (hasChecked && !isCorrect) {
      setHasChecked(false);
    }
  };

  const handleCheck = () => {
    // Check all non-given bricks
    let allRight = true;
    const allBricks: PyramidBrick[] = [...bottom, ...middle, ...top];

    for (const b of allBricks) {
      if (!b.isGiven) {
        const enteredVal = parseInt((brickInputs[b.id] || '').trim(), 10);
        if (enteredVal !== b.value) {
          allRight = false;
          break;
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

  const renderBrick = (
    b: PyramidBrick,
    label: string,
    widthClass: string,
    bgGradient: string,
    borderClass: string
  ) => {
    const isGiven = b.isGiven;
    const value = brickInputs[b.id] ?? '';

    return (
      <div
        key={b.id}
        className={`${widthClass} h-16 sm:h-20 rounded-2xl border-3 ${borderClass} ${bgGradient} shadow-md flex flex-col items-center justify-center p-2`}
      >
        <span className="text-[10px] font-black uppercase text-amber-900/70">{label}</span>
        {isGiven ? (
          <span className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
            {b.value}
          </span>
        ) : (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(b.id, e.target.value)}
            disabled={disabled || (hasChecked && isCorrect)}
            placeholder="?"
            className="w-24 text-center text-xl sm:text-2xl font-black bg-white rounded-xl border-2 border-amber-400 text-amber-950 focus:border-indigo-600 outline-none"
          />
        )}
      </div>
    );
  };

  // Are all required inputs filled?
  const allBricksFilled = [...bottom, ...middle, ...top].every((b) => {
    if (b.isGiven) return true;
    return (brickInputs[b.id] || '').trim() !== '';
  });

  return (
    <div className="space-y-6">
      {/* Rule banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-amber-900">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧱</span>
          <span>Regel: Jeder obere Stein ist genau die Summe der beiden Steine direkt darunter!</span>
        </div>
      </div>

      {/* Visual Pyramid */}
      <div className="flex flex-col items-center justify-center gap-2.5 py-4">
        {/* Level 3: TOP (1 brick) */}
        <div className="flex justify-center">
          {renderBrick(
            top[0],
            'Deckstein',
            'w-36 sm:w-44',
            'bg-gradient-to-b from-amber-100 to-amber-200',
            'border-amber-800/40'
          )}
        </div>

        {/* Level 2: MIDDLE (2 bricks) */}
        <div className="flex justify-center gap-2.5">
          {renderBrick(
            middle[0],
            'Mitte links',
            'w-36 sm:w-44',
            'bg-gradient-to-b from-amber-50 to-amber-100',
            'border-amber-700/40'
          )}
          {renderBrick(
            middle[1],
            'Mitte rechts',
            'w-36 sm:w-44',
            'bg-gradient-to-b from-amber-50 to-amber-100',
            'border-amber-700/40'
          )}
        </div>

        {/* Level 1: BOTTOM (3 bricks) */}
        <div className="flex justify-center gap-2.5">
          {bottom.map((b, idx) =>
            renderBrick(
              b,
              `Grundstein ${idx + 1}`,
              'w-28 sm:w-36',
              'bg-gradient-to-b from-amber-200 to-amber-300',
              'border-amber-900/30'
            )
          )}
        </div>
      </div>

      {/* Action check button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !allBricksFilled || (hasChecked && isCorrect)}
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

      {/* Guiding Hint without revealing answers */}
      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 text-center">
          {exercise.hint ||
            '💡 Tipp: Ein oder mehrere Steine stimmen noch nicht. Addiere die beiden unteren Steine, um den Stein darüber zu ermitteln!'}
        </div>
      )}

      {/* Scratchpad */}
      <MathScratchpad
        key={`scratchpad-${exercise.id}`}
        label="✍️ Stift-Rechenweg (HUION H1161)"
        placeholder="Rechne hier deine Zwischenschritte für die Mauer aus..."
      />
    </div>
  );
};
