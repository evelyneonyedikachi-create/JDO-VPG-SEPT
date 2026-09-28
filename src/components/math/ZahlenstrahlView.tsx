import React, { useState, useEffect } from 'react';
import { NumberLineExercise } from '../../types/math';
import { playChime } from '../../utils/soundEffects';
import { Check, HelpCircle } from 'lucide-react';

interface ZahlenstrahlViewProps {
  exercise: NumberLineExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const ZahlenstrahlView: React.FC<ZahlenstrahlViewProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  const [selectedTick, setSelectedTick] = useState<number | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setSelectedTick(null);
    setTypedValue('');
    setHasChecked(false);
    setIsCorrect(false);
  }, [exercise.id]);

  const missingTick = exercise.labeledTicks.find((t) => t.isMissing) || exercise.labeledTicks[3];

  const handleCheck = () => {
    const numericAns = parseInt(typedValue.trim(), 10);
    const correct =
      numericAns === exercise.targetNumber || selectedTick === exercise.targetNumber;

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
      {/* Target prompt */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-sky-700">
            Gesuchte Zahl:
          </span>
          <div className="text-2xl sm:text-3xl font-black text-sky-950">
            Wo liegt die <span className="text-indigo-600 underline decoration-indigo-300">{exercise.targetNumber}</span>?
          </div>
        </div>
        <div className="text-xs sm:text-sm font-bold text-sky-800 bg-white px-3 py-1.5 rounded-xl border border-sky-200 shadow-2xs">
          Schrittweite: +{exercise.stepSize}
        </div>
      </div>

      {/* SVG Interactive Number Line */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[680px] p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-inner">
          <svg viewBox="0 0 1000 130" className="w-full h-auto select-none">
            {/* Main axis line with arrows */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#475569" />
              </marker>
            </defs>
            <line
              x1="30"
              y1="60"
              x2="970"
              y2="60"
              stroke="#475569"
              strokeWidth="4"
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
            />

            {/* Minor intermediate ticks (50s) */}
            {Array.from({ length: 21 }).map((_, i) => {
              const val = i * 50;
              const x = 50 + (val / 1000) * 880;
              const isMajor = val % 100 === 0;
              if (isMajor) return null;
              return (
                <line
                  key={`minor_${val}`}
                  x1={x}
                  y1={52}
                  x2={x}
                  y2={68}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              );
            })}

            {/* Major ticks (100s) */}
            {exercise.labeledTicks.map((tick) => {
              const x = 50 + (tick.value / 1000) * 880;
              const isSelected = selectedTick === tick.value;
              const isMissing = tick.isMissing;

              return (
                <g
                  key={tick.value}
                  className="cursor-pointer group"
                  onClick={() => {
                    if (disabled) return;
                    playChime('click');
                    setSelectedTick(tick.value);
                    setTypedValue(String(tick.value));
                  }}
                >
                  {/* Tick line */}
                  <line
                    x1={x}
                    y1={44}
                    x2={x}
                    y2={76}
                    stroke={isSelected ? '#4f46e5' : '#1e293b'}
                    strokeWidth={isSelected ? '5' : '3.5'}
                    strokeLinecap="round"
                  />

                  {/* Tick circle button */}
                  <circle
                    cx={x}
                    cy={60}
                    r={isSelected ? 10 : 6}
                    fill={isSelected ? '#4f46e5' : isMissing ? '#f59e0b' : '#0ea5e9'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all group-hover:scale-125"
                  />

                  {/* Label */}
                  {isMissing ? (
                    <g transform={`translate(${x}, 102)`}>
                      <rect
                        x="-20"
                        y="-16"
                        width="40"
                        height="26"
                        rx="6"
                        fill={isSelected ? '#4f46e5' : '#fef3c7'}
                        stroke={isSelected ? '#4338ca' : '#f59e0b'}
                        strokeWidth="2"
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#b45309'}
                        fontSize="14"
                        fontWeight="900"
                        className="font-mono"
                      >
                        ?
                      </text>
                    </g>
                  ) : (
                    <text
                      x={x}
                      y={102}
                      textAnchor="middle"
                      fill={isSelected ? '#4f46e5' : '#475569'}
                      fontSize="14"
                      fontWeight="800"
                      className="font-mono transition-colors group-hover:fill-indigo-600"
                    >
                      {tick.value}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Answer Input and Confirmation */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-sm font-bold text-slate-700 shrink-0">
            Welche Zahl gehört an die Stelle ?:
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            step="10"
            value={typedValue}
            onChange={(e) => setTypedValue(e.target.value)}
            disabled={disabled || (hasChecked && isCorrect)}
            placeholder="z. B. 300"
            className="w-32 px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-lg font-black text-center text-slate-900 bg-white"
          />
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !typedValue.trim() || (hasChecked && isCorrect)}
          className={`px-6 py-3 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 ${
            hasChecked && isCorrect
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{hasChecked && isCorrect ? 'Richtig gelöst! 🎉' : 'Überprüfen'}</span>
        </button>
      </div>

      {hasChecked && !isCorrect && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-900 flex items-center gap-2">
          <span>❌ Noch nicht ganz richtig. Tipp: Zähle in 100er-Schritten von 0 aus: 0, 100, 200, ...</span>
        </div>
      )}
    </div>
  );
};
