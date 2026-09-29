import { Stroke, HandwritingRecognitionResult, HandwritingErrorCode } from '../types/handwriting';

export interface RenderedStrokesMetadata {
  dataUrl: string;
  canvasImageCreated: boolean;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
  totalPoints: number;
}

/**
 * Detects stroke bounding box, crops tightly around actual ink, normalizes contrast,
 * and upscales small words (e.g. single Lernwörter) so vision models receive crisp, legible letters.
 */
export function cropAndRenderStrokes(strokes: Stroke[]): RenderedStrokesMetadata {
  if (typeof document === 'undefined' || !strokes || strokes.length === 0) {
    return {
      dataUrl: '',
      canvasImageCreated: false,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
      totalPoints: 0,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let totalPoints = 0;

  strokes.forEach((stroke) => {
    totalPoints += stroke.points.length;
    stroke.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
  });

  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    return {
      dataUrl: '',
      canvasImageCreated: false,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
      totalPoints,
    };
  }

  const inkWidth = Math.max(1, maxX - minX);
  const inkHeight = Math.max(1, maxY - minY);
  const bounds = { minX, maxX, minY, maxY, width: inkWidth, height: inkHeight };

  // Small padding around ink (20px)
  const padding = 20;

  // Upscale if necessary so that letters are crisp, bold, and clear for OCR:
  // Target minimum height around 160-200px, with scale between 1.2x and 2.5x
  const targetScale = Math.min(2.5, Math.max(1.2, 180 / inkHeight));

  const canvasWidth = Math.max(160, Math.ceil((inkWidth + padding * 2) * targetScale));
  const canvasHeight = Math.max(90, Math.ceil((inkHeight + padding * 2) * targetScale));

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: '', canvasImageCreated: false, bounds, totalPoints };
  }

  // Normalized crisp contrast: pure solid white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Scaled stroke rendering
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const offsetX = padding - minX;
  const offsetY = padding - minY;

  ctx.save();
  ctx.scale(targetScale, targetScale);

  // Compute stroke width so letters with internal counters (e.g. m, w, e in "schwimmen") stay clear
  const scaledLineWidth = Math.max(2.0, Math.min(3.2, 3.0 / Math.sqrt(targetScale)));

  strokes.forEach((stroke) => {
    if (stroke.points.length === 0) return;
    const baseWidth = stroke.baseWidth || 3.2;
    const effectiveWidth = Math.max(1.8, Math.min(3.4, baseWidth / Math.sqrt(targetScale)));

    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      ctx.beginPath();
      ctx.arc(p.x + offsetX, p.y + offsetY, effectiveWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.lineWidth = effectiveWidth;
    ctx.strokeStyle = '#000000';
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const p1 = stroke.points[i];
      const p2 = stroke.points[i + 1];
      const midX = (p1.x + p2.x) / 2 + offsetX;
      const midY = (p1.y + p2.y) / 2 + offsetY;
      if (i === 0) {
        ctx.moveTo(p1.x + offsetX, p1.y + offsetY);
        ctx.lineTo(midX, midY);
      } else {
        ctx.quadraticCurveTo(p1.x + offsetX, p1.y + offsetY, midX, midY);
      }
    }
    const lastP = stroke.points[stroke.points.length - 1];
    ctx.lineTo(lastP.x + offsetX, lastP.y + offsetY);
    ctx.stroke();
  });

  ctx.restore();

  return {
    dataUrl: canvas.toDataURL('image/png'),
    canvasImageCreated: true,
    bounds,
    totalPoints,
  };
}

/**
 * Backward-compatible helper that exports a clean black-on-white PNG data URL.
 */
export function renderStrokesToPngDataUrl(strokes: Stroke[]): string {
  return cropAndRenderStrokes(strokes).dataUrl;
}

/**
 * RECOGNITION ARCHITECTURE (Stage A: Literal Transcription)
 *
 * CRITICAL ANTI-LEAK RULES:
 * 1. Recognition must do ONLY: handwritten strokes/image -> literal transcription.
 * 2. It must NOT:
 *    - rewrite
 *    - improve grammar
 *    - paraphrase
 *    - complete the sentence
 *    - infer from the Bildgeschichte image
 *    - use the model answer
 *    - use scene description as output
 * 3. The handwriting recogniser must NOT receive:
 *    - expected answer
 *    - model sentence
 *    - scene solution
 *    - target sentence template
 * 4. At most, for single-word tasks, it may receive allowed Lernwort list as candidate vocabulary.
 */
export async function recognizeHandwritingStrokes(
  strokes: Stroke[],
  context?: {
    allowedWords?: string[];
    vocabularyContext?: string[];
    language?: string;
    mode?: 'text' | 'math';
  }
): Promise<HandwritingRecognitionResult> {
  const startTime = Date.now();

  if (!strokes || strokes.length === 0) {
    console.log('[OCR Diagnostics] Recognition skipped: 0 strokes provided.');
    return {
      text: '',
      confidence: 0,
      errorCode: 'empty_response',
      errorMessage: 'Bitte schreibe zuerst mit dem Stift auf die Linien.',
      diagnostics: {
        canvasImageCreated: false,
        totalPoints: 0,
      },
    };
  }

  const rendered = cropAndRenderStrokes(strokes);

  console.log('[OCR Diagnostics] Stroke Bounds & Canvas Details:', {
    canvasImageCreated: rendered.canvasImageCreated,
    inkBounds: rendered.bounds,
    totalPoints: rendered.totalPoints,
  });

  if (rendered.totalPoints < 3 || !rendered.dataUrl) {
    console.log('[OCR Diagnostics] Too few points or empty canvas rendered.');
    return {
      text: '',
      confidence: 0,
      errorCode: 'unreadable',
      errorMessage: 'Bitte schreibe etwas deutlicher.',
      diagnostics: {
        canvasImageCreated: rendered.canvasImageCreated,
        inkBounds: rendered.bounds,
        totalPoints: rendered.totalPoints,
      },
    };
  }

  const vocabList = context?.allowedWords || context?.vocabularyContext || [];

  try {
    console.log('[OCR Diagnostics] Sending API request to /api/recognize-handwriting...', {
      candidateCount: vocabList.length,
      mode: context?.mode || 'text',
    });

    const response = await fetch('/api/recognize-handwriting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: rendered.dataUrl,
        vocabularyList: vocabList.slice(0, 25),
        mode: context?.mode || 'text',
      }),
    });

    const durationMs = Date.now() - startTime;
    const httpStatus = response.status;
    const rawResponseText = await response.text();

    console.log('[OCR Diagnostics] Server Response Received:', {
      httpStatus,
      durationMs: `${durationMs}ms`,
      rawResponseLength: rawResponseText.length,
    });

    let data: any = {};
    try {
      data = JSON.parse(rawResponseText);
    } catch (parseErr: any) {
      console.error('[OCR Diagnostics] JSON Parse Error:', parseErr, rawResponseText);
      return {
        text: '',
        confidence: 0,
        errorCode: 'parse_error',
        errorMessage: 'Die Schrifterkennung hat gerade nicht funktioniert. Versuch es bitte noch einmal.',
        diagnostics: {
          canvasImageCreated: true,
          inkBounds: rendered.bounds,
          totalPoints: rendered.totalPoints,
          httpStatus,
          rawResponseText,
          durationMs,
          errorDetail: parseErr?.message,
        },
      };
    }

    if (!response.ok) {
      console.warn('[OCR Diagnostics] HTTP Non-OK response:', httpStatus, data);
      return {
        text: '',
        confidence: 0,
        errorCode: 'technical_error',
        errorMessage: 'Die Schrifterkennung hat gerade nicht funktioniert. Versuch es bitte noch einmal.',
        diagnostics: {
          canvasImageCreated: true,
          inkBounds: rendered.bounds,
          totalPoints: rendered.totalPoints,
          httpStatus,
          rawResponseText,
          durationMs,
          errorDetail: data?.error || `HTTP ${httpStatus}`,
        },
      };
    }

    // Check specific error code returned from backend
    if (data.errorCode === 'technical_error') {
      return {
        text: '',
        confidence: 0,
        errorCode: 'technical_error',
        errorMessage: 'Die Schrifterkennung hat gerade nicht funktioniert. Versuch es bitte noch einmal.',
        diagnostics: {
          canvasImageCreated: true,
          inkBounds: rendered.bounds,
          totalPoints: rendered.totalPoints,
          httpStatus,
          rawResponseText,
          durationMs,
          errorDetail: data.error,
        },
      };
    }

    if (data.errorCode === 'unreadable') {
      return {
        text: '',
        confidence: 0,
        errorCode: 'unreadable',
        errorMessage: 'Bitte schreibe etwas deutlicher.',
        diagnostics: {
          canvasImageCreated: true,
          inkBounds: rendered.bounds,
          totalPoints: rendered.totalPoints,
          httpStatus,
          rawResponseText,
          durationMs,
        },
      };
    }

    const recognizedText = typeof data.text === 'string' ? data.text.trim() : '';

    if (!recognizedText) {
      console.log('[OCR Diagnostics] Empty text returned from model (empty_response).');
      return {
        text: '',
        confidence: 0,
        errorCode: 'empty_response',
        errorMessage: 'Die Schrifterkennung hat gerade nicht funktioniert. Versuch es bitte noch einmal.',
        diagnostics: {
          canvasImageCreated: true,
          inkBounds: rendered.bounds,
          totalPoints: rendered.totalPoints,
          httpStatus,
          rawResponseText,
          durationMs,
        },
      };
    }

    console.log('[OCR Diagnostics] Recognition SUCCESS:', {
      parsedText: recognizedText,
      confidence: data.confidence || 0.94,
      durationMs,
    });

    return {
      text: recognizedText,
      confidence: data.confidence || 0.94,
      candidates: [recognizedText],
      diagnostics: {
        canvasImageCreated: true,
        inkBounds: rendered.bounds,
        totalPoints: rendered.totalPoints,
        httpStatus,
        parsedText: recognizedText,
        durationMs,
      },
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error('[OCR Diagnostics] Network or connection error:', err);
    return {
      text: '',
      confidence: 0,
      errorCode: 'technical_error',
      errorMessage: 'Die Schrifterkennung hat gerade nicht funktioniert. Versuch es bitte noch einmal.',
      diagnostics: {
        canvasImageCreated: rendered.canvasImageCreated,
        inkBounds: rendered.bounds,
        totalPoints: rendered.totalPoints,
        durationMs,
        errorDetail: err?.message || 'Network fetch failure',
      },
    };
  }
}
