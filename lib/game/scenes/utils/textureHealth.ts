import * as Phaser from 'phaser';

const readImageDimension = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return 0;
};

export const hasRenderableTexture = (scene: Phaser.Scene, key: string): boolean => {
  if (!scene.textures.exists(key)) return false;
  const frame = scene.textures.getFrame(key);
  if (!frame) return false;

  const sourceImage = frame.source?.image as
    | { width?: number; height?: number; videoWidth?: number; videoHeight?: number }
    | undefined;
  if (!sourceImage) return false;

  const width = readImageDimension(sourceImage.width) || readImageDimension(sourceImage.videoWidth);
  const height = readImageDimension(sourceImage.height) || readImageDimension(sourceImage.videoHeight);
  return width > 0 && height > 0;
};
