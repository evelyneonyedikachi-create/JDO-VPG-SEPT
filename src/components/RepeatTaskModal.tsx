import React from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface RepeatTaskModalProps {
  exerciseTitle: string;
  pointsEarned?: number;
  onCancel: () => void;
  onConfirmRepeat: () => void;
}

export const RepeatTaskModal: React.FC<RepeatTaskModalProps> = ({
  exerciseTitle,
  pointsEarned = 4,
  onCancel,
  onConfirmRepeat,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 border-2 border-emerald-300 space-y-5 text-center">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-3xl mx-auto shadow-sm">
          ✅
        </div>

        {/* Heading & Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Bereits erledigt</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {exerciseTitle}
          </h3>
        </div>

        {/* Message required by prompt */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed font-semibold">
          Diese Aufgabe hast du schon geschafft. Möchtest du sie freiwillig noch einmal üben?
        </div>

        {/* Points Protection Reminder */}
        <p className="text-xs text-slate-500 font-medium">
          💡 Deine Punkte (+{pointsEarned} Pkt) sind bereits sicher gespeichert. Ein erneuter Durchlauf dient rein dem freiwilligen Training.
        </p>

        {/* Buttons: Nein, zurück & Ja, nochmal üben */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              playChime('click');
              onCancel();
            }}
            className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm transition-colors active:scale-95"
          >
            Nein, zurück
          </button>

          <button
            onClick={() => {
              playChime('click');
              onConfirmRepeat();
            }}
            className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ja, nochmal üben</span>
          </button>
        </div>
      </div>
    </div>
  );
};
