import React, { useState } from 'react';
import { HandwritingCanvas } from '../HandwritingCanvas';
import { HandwritingRecognitionConfirmation } from '../HandwritingRecognitionConfirmation';
import { recognizeHandwritingStrokes } from '../../services/handwritingRecognitionService';
import { Stroke } from '../../types/handwriting';
import { Eraser, PenTool, Sparkles, Check } from 'lucide-react';
import { playChime } from '../../utils/soundEffects';

interface MathScratchpadProps {
  label?: string;
  placeholder?: string;
  onApplyRecognizedText?: (text: string) => void;
  height?: number;
}

export const MathScratchpad: React.FC<MathScratchpadProps> = ({
  label = '✍️ Rechenweg & Nebenrechnung (Stift)',
  placeholder = 'Rechne hier mit dem Stift (z. B. 72 + 20 = 92)...',
  onApplyRecognizedText,
  height = 160,
}) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedCandidate, setRecognizedCandidate] = useState<string | null>(null);

  const handleRecognize = async (currentStrokes: Stroke[]) => {
    if (!currentStrokes || currentStrokes.length === 0) return;
    setIsRecognizing(true);
    playChime('click');
    const result = await recognizeHandwritingStrokes(currentStrokes, {
      mode: 'math',
    });
    setIsRecognizing(false);
    if (result.text) {
      setRecognizedCandidate(result.text);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-3 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-black text-amber-900 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-amber-600" />
          <span>{label}</span>
        </span>
        <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
          HUION H1161 Stift
        </span>
      </div>

      <HandwritingCanvas
        initialStrokes={strokes}
        linesCount={2}
        height={height}
        placeholder={placeholder}
        onStrokesChange={setStrokes}
        isRecognizing={isRecognizing}
        onRecognizeRequest={handleRecognize}
      />

      {recognizedCandidate && (
        <HandwritingRecognitionConfirmation
          recognizedText={recognizedCandidate}
          onConfirm={(confirmed) => {
            playChime('success');
            if (onApplyRecognizedText) {
              onApplyRecognizedText(confirmed);
            }
            setRecognizedCandidate(null);
          }}
          onRetry={() => {
            setRecognizedCandidate(null);
          }}
        />
      )}
    </div>
  );
};
