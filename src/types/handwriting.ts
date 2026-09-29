export interface Point {
  x: number;
  y: number;
  time: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color?: string;
  baseWidth?: number;
  timestamp: number;
}

export interface HandwritingData {
  strokes: Stroke[];
  lastModified: number;
  canvasWidth?: number;
  canvasHeight?: number;
  recognizedText?: string;
  confirmedText?: string;
  inputMethod?: 'handwriting' | 'keyboard';
}

export type HandwritingErrorCode =
  | 'technical_error'
  | 'empty_response'
  | 'parse_error'
  | 'low_confidence'
  | 'unreadable';

export interface HandwritingRecognitionResult {
  text: string;
  confidence: number;
  candidates?: string[];
  errorCode?: HandwritingErrorCode;
  errorMessage?: string;
  diagnostics?: {
    canvasImageCreated: boolean;
    inkBounds?: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      width: number;
      height: number;
    };
    totalPoints: number;
    httpStatus?: number;
    rawResponseText?: string;
    parsedText?: string;
    durationMs?: number;
    errorDetail?: string;
  };
}
