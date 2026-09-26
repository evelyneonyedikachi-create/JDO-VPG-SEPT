// Semi-realistic, emotionally expressive, child-friendly storybook illustrations for the 9 Bildgeschichte scenes.
// Recurring character: Jedidiah (warm, expressive faces, consistent features, clear gestures).
// Clean 4:3 aspect ratio (600x450).

import { SCENE_1_SVG, SCENE_1_IMAGE } from './illustrations/scene1';
import { SCENE_2_SVG, SCENE_2_IMAGE } from './illustrations/scene2';
import { SCENE_3_SVG, SCENE_3_IMAGE } from './illustrations/scene3';
import { SCENE_4_SVG, SCENE_4_IMAGE } from './illustrations/scene4';
import { SCENE_5_SVG, SCENE_5_IMAGE } from './illustrations/scene5';
import { SCENE_6_SVG, SCENE_6_IMAGE } from './illustrations/scene6';
import { SCENE_7_SVG, SCENE_7_IMAGE } from './illustrations/scene7';
import { SCENE_8_SVG, SCENE_8_IMAGE } from './illustrations/scene8';
import { SCENE_9_SVG, SCENE_9_IMAGE } from './illustrations/scene9';

export {
  SCENE_1_SVG,
  SCENE_2_SVG,
  SCENE_3_SVG,
  SCENE_4_SVG,
  SCENE_5_SVG,
  SCENE_6_SVG,
  SCENE_7_SVG,
  SCENE_8_SVG,
  SCENE_9_SVG,
};

export const SCENE_ILLUSTRATIONS: Record<number, string> = {
  1: SCENE_1_IMAGE,
  2: SCENE_2_IMAGE,
  3: SCENE_3_IMAGE,
  4: SCENE_4_IMAGE,
  5: SCENE_5_IMAGE,
  6: SCENE_6_IMAGE,
  7: SCENE_7_IMAGE,
  8: SCENE_8_IMAGE,
  9: SCENE_9_IMAGE,
};

export function getSceneImage(sceneId: number): string {
  return SCENE_ILLUSTRATIONS[sceneId] || SCENE_ILLUSTRATIONS[1];
}
