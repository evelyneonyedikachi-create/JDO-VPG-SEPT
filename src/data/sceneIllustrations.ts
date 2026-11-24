// Polished 2D Bildergeschichte assets.
// Served from public/bildgeschichte for fast loading and simple replacement.
export const SCENE_ILLUSTRATIONS: Record<number, string> = {
  1: '/bildgeschichte/bild_1.webp',
  2: '/bildgeschichte/bild_2.webp',
  3: '/bildgeschichte/bild_3.webp',
  4: '/bildgeschichte/bild_4.webp',
  5: '/bildgeschichte/bild_5.webp',
  6: '/bildgeschichte/bild_6.webp',
  7: '/bildgeschichte/bild_7.webp',
  8: '/bildgeschichte/bild_8.webp',
  9: '/bildgeschichte/bild_9.webp',
};

export function getSceneImage(sceneId: number): string {
  return SCENE_ILLUSTRATIONS[sceneId] || SCENE_ILLUSTRATIONS[1];
}
