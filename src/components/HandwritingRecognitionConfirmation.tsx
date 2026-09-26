import React, { useState } from 'react';
import { Check, Edit3, Sparkles, AlertCircle } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface HandwritingRecognitionConfirmationProps {
  recognizedText: string;
  confidence?: number;
  onConfirm: (confirmedText: string) => void;
  onRetry: () => void;
}

export const HandwritingRecognitionConfirmation: React.FC<HandwritingRecognitionConfirmationProps> = ({
  recognizedText,
  confidence = 0.9,
  onConfirm,
  onRetry,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(recognizedText);

  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 p-4 sm:p-5 rounded-2xl space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-black uppercase text-indigo-900 tracking-wider">
            Ich habe gelesen:
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playChime('click');
            setIsEditing(!isEditing);
          }}
          className="text-xs font-bold text-indigo-700 hover:text-indigo-950 flex items-center gap-1"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Fertig' : 'Korrigieren'}</span>
        </button>
      </div>

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-indigo-300 focus:border-indigo-600 focus:outline-hidden text-lg font-bold text-slate-900 bg-white"
          autoFocus
        />
      ) : (
        <div className="text-xl sm:text-2xl font-black text-slate-900 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
          „{editText || recognizedText}“
        </div>
      )}

      <p className="text-xs text-slate-500 font-medium">
        Stimmt das mit deiner Handschrift überein? Bestätige den Text, um deine Antwort abzugeben.
      </p>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => {
            playChime('click');
            onConfirm(editText || recognizedText);
          }}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xs active:scale-95 flex items-center gap-1.5 transition-transform"
        >
          <Check className="w-4 h-4" />
          <span>✓ Ja, das stimmt</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playChime('click');
            onRetry();
          }}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-sm"
        >
          ✏️ Nicht ganz (neu schreiben)
        </button>
      </div>
    </div>
  );
};
