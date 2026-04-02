import * as Phaser from 'phaser';
import { ASSETS } from '@/lib/game/assets/assetManifest';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    Object.values(ASSETS.images).forEach((asset) => {
      this.load.image(asset.key, asset.source);
    });

    Object.values(ASSETS.spritesheets).forEach((asset) => {
      this.load.spritesheet(asset.key, asset.source, asset.frameConfig);
    });
  }

  create(): void {
    this.scene.start('run');
  }
}
