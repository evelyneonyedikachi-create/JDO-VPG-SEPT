import { Stroke, HandwritingRecognitionResult } from '../types/handwriting';

/**
 * Renders stroke array to an offscreen canvas and exports a clean black-on-white PNG data URL.
 */
export function renderStrokesToPngDataUrl(strokes: Stroke[]): string {
  if (typeof document === 'undefined' || !strokes || strokes.length === 0) {
    return '';
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  strokes.forEach((stroke) => {
    stroke.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
  });

  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    return '';
  }

  const padding = 20;
  const width = Math.max(160, Math.ceil(maxX - minX + padding * 2));
  const height = Math.max(80, Math.ceil(maxY - minY + padding * 2));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean white paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000000';

  const offsetX = padding - minX;
  const offsetY = padding - minY;

  strokes.forEach((stroke) => {
    if (stroke.points.length === 0) return;
    const baseWidth = stroke.baseWidth || 3.5;

    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      ctx.beginPath();
      ctx.arc(p.x + offsetX, p.y + offsetY, baseWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.lineWidth = Math.max(2, baseWidth);
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

  return canvas.toDataURL('image/png');
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
 * 4. At most, for single-word tasks, it may receive allowed Lernwort list as vocabulary context.
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
  if (!strokes || strokes.length === 0) {
    return { text: '', confidence: 0 };
  }

  const totalPoints = strokes.reduce((acc, s) => acc + s.points.length, 0);
  if (totalPoints < 3) {
    return { text: '', confidence: 0 };
  }

  const dataUrl = renderStrokesToPngDataUrl(strokes);
  if (!dataUrl) {
    return { text: '', confidence: 0 };
  }

  try {
    const vocabList = context?.allowedWords || context?.vocabularyContext || [];
    const response = await fetch('/api/recognize-handwriting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: dataUrl,
        vocabularyList: vocabList.slice(0, 15),
        mode: context?.mode || 'text',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof data.text === 'string' && data.text.trim()) {
        const text = data.text.trim();
        return {
          text,
          confidence: data.confidence || 0.9,
          candidates: [text],
        };
      }
    }
  } catch (err) {
    console.warn('Recognition API network error:', err);
  }

  // Fallback: If offline or cannot recognize, return empty string so child can edit/confirm.
  // NEVER return the expected model answer or scene description!
  return {
    text: '',
    confidence: 0,
  };
}
