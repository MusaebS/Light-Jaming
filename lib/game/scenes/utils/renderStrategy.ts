import * as Phaser from 'phaser';
import { ASSETS } from '@/lib/game/assets/assetManifest';

export const RENDER_MODE_ORDER = ['mode-a', 'mode-b', 'mode-c', 'mode-d'] as const;

export type RenderMode = (typeof RENDER_MODE_ORDER)[number];
export type RenderModeSetting = RenderMode | 'auto';

const MODE_A_REQUIRED_TEXTURES = [
  ASSETS.spritesheets.player.key,
  ASSETS.spritesheets.enemyCart.key,
  ASSETS.images.scrap.key,
  ASSETS.images.junk.key,
  ASSETS.images.beacon.key,
  ASSETS.images.arenaBackground.key,
  ASSETS.images.arenaTile.key,
  ASSETS.images.uiEnergy.key
];

const isGraphicsTextureAvailable = (scene: Phaser.Scene): boolean => {
  if (!scene.textures.exists('__WHITE')) {
    return false;
  }
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 8, 8);
  graphics.generateTexture('__render-mode-probe', 8, 8);
  graphics.destroy();
  const available = scene.textures.exists('__render-mode-probe');
  if (available) {
    scene.textures.remove('__render-mode-probe');
  }
  return available;
};

const canUseModeA = (scene: Phaser.Scene): boolean => MODE_A_REQUIRED_TEXTURES.every((key) => scene.textures.exists(key));
const canUseModeB = (scene: Phaser.Scene): boolean => isGraphicsTextureAvailable(scene);

export function pickRenderMode(scene: Phaser.Scene, forcedMode: RenderModeSetting = 'auto'): RenderMode {
  if (forcedMode !== 'auto') {
    return forcedMode;
  }
  if (canUseModeA(scene)) return 'mode-a';
  if (canUseModeB(scene)) return 'mode-b';
  return 'mode-c';
}

export const describeRenderMode = (mode: RenderMode): string => {
  if (mode === 'mode-a') return 'Asset textures';
  if (mode === 'mode-b') return 'Generated vector textures';
  if (mode === 'mode-c') return 'Primitive-only geometry';
  return 'High-contrast fallback';
};
