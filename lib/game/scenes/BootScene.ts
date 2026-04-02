import * as Phaser from 'phaser';
import { ASSETS, getAssetSource } from '@/lib/game/assets/assetManifest';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    Object.values(ASSETS.images).forEach((asset) => {
      this.load.image(asset.key, getAssetSource(asset));
    });

    Object.values(ASSETS.spritesheets).forEach((asset) => {
      this.load.spritesheet(asset.key, getAssetSource(asset), asset.frameConfig);
    });
  }

  create(): void {
    this.scene.start('run');
  }
}
