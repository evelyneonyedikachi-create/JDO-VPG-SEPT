import React, { useRef, useEffect } from 'react';
import { Stroke } from '../types/handwriting';

interface HandwritingViewerModalProps {
  title: string;
  strokes: Stroke[];
  recognizedText?: string;
  onClose: () => void;
}

export const HandwritingViewerModal: React.FC<HandwritingViewerModalProps> = ({
  title,
  strokes,
  recognizedText,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxY = strokes.reduce((max, s) => {
      const sMax = s.points.reduce((pMax, p) => Math.max(pMax, p.y), 0);
      return Math.max(max, sMax);
    }, 0);
    const height = Math.max(220, Math.min(600, Math.ceil(maxY + 40)));
    const lineCount = Math.max(2, Math.round(height / 70));

    const width = 500;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // School guidelines background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const lineGap = height / lineCount;
    for (let i = 1; i <= lineCount; i++) {
      const y = i * lineGap - 10;
      ctx.beginPath();
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1.5;
      ctx.moveTo(16, y);
      ctx.lineTo(width - 16, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.moveTo(16, y - lineGap * 0.35);
      ctx.lineTo(width - 16, y - lineGap * 0.35);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Render strokes
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';

    strokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;
      const baseWidth = stroke.baseWidth || 3.2;

      if (stroke.points.length === 1) {
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, baseWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.lineWidth = baseWidth * (p2.pressure ? 0.7 + p2.pressure * 0.6 : 1);
        if (i === 0) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(midX, midY);
        } else {
          ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        }
      }
      ctx.stroke();
    });
  }, [strokes]);

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <h4 className="font-black text-slate-900 text-base">{title}</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div>
          <div className="text-xs font-black uppercase text-slate-400 mb-1.5">
            Original Handschrift (Vektorstriche)
          </div>
          <div className="rounded-2xl border-2 border-slate-200 overflow-y-auto max-h-[360px] shadow-inner flex items-center justify-center bg-white">
            <canvas ref={canvasRef} className="w-full block" />
          </div>
        </div>

        {recognizedText && (
          <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200 space-y-1">
            <div className="text-[11px] font-black uppercase text-indigo-700 tracking-wider">
              Erkannter & bestätigter Text:
            </div>
            <div className="text-base font-black text-slate-900">
              „{recognizedText}“
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
