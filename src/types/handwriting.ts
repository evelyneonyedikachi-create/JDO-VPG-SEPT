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

export interface HandwritingRecognitionResult {
  text: string;
  confidence: number;
  candidates?: string[];
}
