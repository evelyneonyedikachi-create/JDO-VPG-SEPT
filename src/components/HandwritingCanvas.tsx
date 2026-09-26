import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stroke, Point } from '../types/handwriting';
import {
  RotateCcw,
  RotateCw,
  Trash2,
  Eraser,
  PenTool,
  Check,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface HandwritingCanvasProps {
  initialStrokes?: Stroke[];
  linesCount?: number; // 1 for single word, 2-4 for sentences, 6+ for Bildgeschichte
  height?: number;
  placeholder?: string;
  onStrokesChange?: (strokes: Stroke[]) => void;
  onRecognizeRequest?: (strokes: Stroke[]) => void;
  isRecognizing?: boolean;
  disabled?: boolean;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  initialStrokes = [],
  linesCount = 2,
  height = 240,
  placeholder = 'Schreibe hier mit dem Stift...',
  onStrokesChange,
  onRecognizeRequest,
  isRecognizing = false,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const currentStrokeRef = useRef<Point[]>([]);

  // Subtle pen hover indicator position
  const [penHover, setPenHover] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Track initial strokes load and sync when initialStrokes changes from parent (e.g. Pause/Resume)
  const prevInitialStrokesRef = useRef<Stroke[]>(initialStrokes);
  useEffect(() => {
    if (prevInitialStrokesRef.current !== initialStrokes) {
      prevInitialStrokesRef.current = initialStrokes;
      setStrokes(initialStrokes || []);
    }
  }, [initialStrokes]);

  // Notify parent of stroke changes
  const updateStrokes = useCallback(
    (newStrokes: Stroke[], saveUndo = true) => {
      if (saveUndo) {
        setUndoStack((prev) => [...prev.slice(-25), strokes]);
        setRedoStack([]);
      }
      setStrokes(newStrokes);
      if (onStrokesChange) {
        onStrokesChange(newStrokes);
      }
    },
    [strokes, onStrokesChange]
  );

  // Redraw canvas content
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const canvasHeight = height;

    if (canvas.width !== width * dpr || canvas.height !== canvasHeight * dpr) {
      canvas.width = width * dpr;
      canvas.height = canvasHeight * dpr;
      ctx.scale(dpr, dpr);
    } else {
      ctx.clearRect(0, 0, width, canvasHeight);
    }

    // --- DRAW SCHOOL WRITING GUIDELINES ---
    // Warm clean white paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, canvasHeight);

    const lineGap = canvasHeight / (linesCount + 0.8);
    const startY = lineGap * 0.7;

    for (let i = 0; i < linesCount; i++) {
      const baselineY = startY + i * lineGap;

      // Base line (solid blue line)
      ctx.beginPath();
      ctx.strokeStyle = '#93c5fd'; // Soft primary school blue guideline
      ctx.lineWidth = 1.5;
      ctx.moveTo(16, baselineY);
      ctx.lineTo(width - 16, baselineY);
      ctx.stroke();

      // Middle dashed line (x-height guide for primary handwriting)
      const midLineY = baselineY - lineGap * 0.35;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#e2e8f0'; // Very faint slate line
      ctx.lineWidth = 1;
      ctx.moveTo(16, midLineY);
      ctx.lineTo(width - 16, midLineY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset
    }

    // --- DRAW VECTOR STROKES ---
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;
      ctx.strokeStyle = stroke.color || '#1e293b'; // Slate 800 dark ink
      const baseWidth = stroke.baseWidth || 3.2;

      if (stroke.points.length === 1) {
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, (baseWidth * (p.pressure || 0.5)) / 1.5, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color || '#1e293b';
        ctx.fill();
        return;
      }

      ctx.beginPath();
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];

        // Smooth quadratic bezier interpolation between midpoints
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        const pressureFactor = p2.pressure !== undefined ? 0.7 + p2.pressure * 0.6 : 1;
        ctx.lineWidth = Math.max(1.8, Math.min(6, baseWidth * pressureFactor));

        if (i === 0) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(midX, midY);
        } else {
          ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        }
      }
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    });

    // --- DRAW CURRENT LIVE STROKE ---
    if (isDrawing && currentStrokeRef.current.length > 0) {
      const livePoints = currentStrokeRef.current;
      ctx.strokeStyle = currentTool === 'eraser' ? '#f87171' : '#1e293b';
      ctx.lineWidth = currentTool === 'eraser' ? 14 : 3.2;

      if (livePoints.length === 1) {
        const p = livePoints[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(livePoints[0].x, livePoints[0].y);
        for (let i = 1; i < livePoints.length; i++) {
          ctx.lineTo(livePoints[i].x, livePoints[i].y);
        }
        ctx.stroke();
      }
    }
  }, [strokes, isDrawing, currentTool, height, linesCount]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => redraw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  // Pointer event coordinate extractor relative to canvas
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, time: Date.now() };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now(),
      pressure: e.pressure > 0 ? e.pressure : 0.5,
      tiltX: e.tiltX,
      tiltY: e.tiltY,
    };
  };

  // POINTER DOWN: Start stroke or erase
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer to prevent losing strokes when moving fast
    canvas.setPointerCapture(e.pointerId);

    const pt = getCanvasCoords(e);
    setIsDrawing(true);

    if (currentTool === 'eraser') {
      // Stroke-level eraser: remove any stroke within radius
      eraseNearPoint(pt.x, pt.y, 16);
    } else {
      currentStrokeRef.current = [pt];
    }
    redraw();
  };

  // POINTER MOVE: Append point or erase near point
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);

    // Subtle pen hover indicator
    setPenHover({ x: pt.x, y: pt.y, visible: true });

    if (!isDrawing || disabled) return;

    if (currentTool === 'eraser') {
      eraseNearPoint(pt.x, pt.y, 16);
    } else {
      currentStrokeRef.current.push(pt);
      redraw();
    }
  };

  // POINTER UP / CANCEL: Finalize stroke
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentTool === 'pen' && currentStrokeRef.current.length > 0) {
      const newStroke: Stroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        points: [...currentStrokeRef.current],
        color: '#1e293b',
        baseWidth: 3.2,
        timestamp: Date.now(),
      };
      currentStrokeRef.current = [];
      updateStrokes([...strokes, newStroke], true);
    }
  };

  const handlePointerLeave = () => {
    setPenHover((prev) => ({ ...prev, visible: false }));
  };

  // Stroke-level eraser (Requirement 7)
  const eraseNearPoint = (x: number, y: number, radius = 16) => {
    const filtered = strokes.filter((stroke) => {
      // Check if any point in stroke is within radius
      const hits = stroke.points.some((p) => {
        const dist = Math.hypot(p.x - x, p.y - y);
        return dist <= radius;
      });
      return !hits;
    });

    if (filtered.length !== strokes.length) {
      updateStrokes(filtered, true);
    }
  };

  // Undo (Requirement 6)
  const handleUndo = () => {
    playChime('click');
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, strokes]);
    setUndoStack((prev) => prev.slice(0, -1));
    setStrokes(previous);
    if (onStrokesChange) {
      onStrokesChange(previous);
    }
  };

  // Redo
  const handleRedo = () => {
    playChime('click');
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, strokes]);
    setRedoStack((prev) => prev.slice(0, -1));
    setStrokes(next);
    if (onStrokesChange) {
      onStrokesChange(next);
    }
  };

  // Clear (Requirement 6)
  const handleClear = () => {
    playChime('click');
    if (strokes.length === 0) return;
    updateStrokes([], true);
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-3xl border-2 border-slate-300 shadow-md overflow-hidden relative select-none"
    >
      {/* TOOLBAR */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
        {/* Left: Mode tools (Stift / Radierer) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              playChime('click');
              setCurrentTool('pen');
            }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              currentTool === 'pen'
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>✍️ Stift</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playChime('click');
              setCurrentTool('eraser');
            }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              currentTool === 'eraser'
                ? 'bg-rose-600 text-white shadow-xs font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
            title="Linien radieren"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>🧽 Radieren</span>
          </button>
        </div>

        {/* Middle / Right: Essential Controls (Undo, Redo, Clear, Recognize) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Rückgängig (↶)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Wiederholen (↷)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Alles löschen (🗑️)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onRecognizeRequest && strokes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                playChime('click');
                onRecognizeRequest(strokes);
              }}
              disabled={isRecognizing}
              className="ml-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs active:scale-95 flex items-center gap-1.5 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{isRecognizing ? 'Lese Schrift…' : 'Schrift erkennen'}</span>
            </button>
          )}
        </div>
      </div>

      {/* CANVAS WRITING SURFACE */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        {/* Placeholder hint when canvas is empty */}
        {strokes.length === 0 && !isDrawing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 font-semibold text-sm sm:text-base">
            <span>✍️ {placeholder}</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: `${height}px`,
            touchAction: 'none', // Crucial Requirement 4: Prevent page scroll during stylus stroke
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className={`cursor-crosshair w-full h-full block ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />

        {/* Subtle Pen Hover Cursor for active tablet orientation (Requirement 16) */}
        {penHover.visible && !disabled && (
          <div
            className="pointer-events-none absolute w-3 h-3 rounded-full border border-indigo-500 bg-indigo-500/20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{
              left: `${penHover.x}px`,
              top: `${penHover.y}px`,
            }}
          />
        )}
      </div>

      {/* FOOTER HELPER */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400">
        <span>HUION H1161 / Stylus Stift-Eingabe aktiv</span>
        <span>{strokes.length} Strich{strokes.length === 1 ? '' : 'e'} erfasst</span>
      </div>
    </div>
  );
};
