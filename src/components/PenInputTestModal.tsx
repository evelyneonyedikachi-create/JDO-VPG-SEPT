import React, { useState } from 'react';
import { HandwritingCanvas } from './HandwritingCanvas';
import { Stroke } from '../types/handwriting';
import {
  X,
  Activity,
  PenTool,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface PenInputTestModalProps {
  onClose: () => void;
}

export const PenInputTestModal: React.FC<PenInputTestModalProps> = ({ onClose }) => {
  const [lastPointerEvent, setLastPointerEvent] = useState<{
    pointerType: string;
    pressure: number;
    x: number;
    y: number;
    tiltX: number;
    tiltY: number;
    timestamp: number;
  }>({
    pointerType: 'None yet',
    pressure: 0,
    x: 0,
    y: 0,
    tiltX: 0,
    tiltY: 0,
    timestamp: 0,
  });

  const [testStrokes, setTestStrokes] = useState<Stroke[]>(() => {
    try {
      const saved = localStorage.getItem('jd_pen_test_strokes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handlePointerDiagnostics = (e: React.PointerEvent) => {
    setLastPointerEvent({
      pointerType: e.pointerType,
      pressure: Math.round(e.pressure * 100) / 100,
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      tiltX: e.tiltX,
      tiltY: e.tiltY,
      timestamp: Date.now(),
    });
  };

  const handleSaveStrokes = (strokes: Stroke[]) => {
    setTestStrokes(strokes);
    try {
      localStorage.setItem('jd_pen_test_strokes', JSON.stringify(strokes));
    } catch {}
  };

  const isPenDetected = lastPointerEvent.pointerType === 'pen';

  return (
    <div
      onPointerDown={handlePointerDiagnostics}
      onPointerMove={handlePointerDiagnostics}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-indigo-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center text-xl">
              ✍️
            </div>
            <div>
              <div className="text-xs font-black uppercase text-indigo-300">
                HUION H1161 & Stylus Pen-Input Diagnosetest
              </div>
              <h3 className="text-xl font-black">
                Stift-Testseite (Hardware-Unabhängig)
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="p-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Diagnostics Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-black uppercase text-slate-400">
              Hardware-Erkennung
            </div>
            <div className={`text-base font-black mt-0.5 flex items-center justify-center gap-1.5 ${
              isPenDetected ? 'text-emerald-600' : 'text-slate-600'
            }`}>
              {isPenDetected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>HUION / Stylus Pen ✓</span>
                </>
              ) : (
                <span>{lastPointerEvent.pointerType !== 'None yet' ? `${lastPointerEvent.pointerType} erkannt` : 'Warte auf Stift…'}</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Chrome/Edge W3C Pointer
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-black uppercase text-slate-400">
              Stiftdruck (Pressure)
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {lastPointerEvent.pressure > 0 ? `${Math.round(lastPointerEvent.pressure * 100)}%` : '0%'}
            </div>
            {/* Visual pressure bar gauge */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-75"
                style={{ width: `${Math.round(lastPointerEvent.pressure * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-black uppercase text-slate-400">
              Tablet-Koordinaten
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {lastPointerEvent.x > 0 ? `${lastPointerEvent.x}, ${lastPointerEvent.y}` : '–'}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Neigung: {lastPointerEvent.tiltX || 0}° / {lastPointerEvent.tiltY || 0}°
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-black uppercase text-slate-400">
              Erfasste Vektorstriche
            </div>
            <div className="text-base font-black text-indigo-700 mt-0.5">
              {testStrokes.length} Linien
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Auto-Save & Pause aktiv
            </div>
          </div>
        </div>

        {/* Test Canvas Area */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="font-black text-slate-900 text-sm">
                Zeichenbereich für Huion H1161 / Stylus Stift
              </h4>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Schreibe hier mit dem HUION Stift, der Maus oder dem Touchscreen. Überprüfe die Liniendicke, die Radiererfunktion und den Speichertest.
            </p>
          </div>

          <HandwritingCanvas
            initialStrokes={testStrokes}
            linesCount={3}
            height={280}
            placeholder="Schreibe hier einen Testsatz wie 'Ich schwimme gerne.'..."
            onStrokesChange={handleSaveStrokes}
          />

          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-xs text-indigo-900 space-y-2">
            <div className="font-black flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Diagnose-Checkliste für den H1161:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Zeichnet der Stift sofort flüssig ohne Verzögerung?</li>
              <li>Funktioniert das Radieren (🧽 Radieren) auf Strich-Ebene?</li>
              <li>Wird beim Schließen und erneuten Öffnen deine Handschrift wiederhergestellt? (Auto-Save aktiv)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md"
          >
            Fertig / Test schließen
          </button>
        </div>
      </div>
    </div>
  );
};
