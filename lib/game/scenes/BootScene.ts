import * as Phaser from 'phaser';
import { ASSETS, getAssetSource } from '@/lib/game/assets/assetManifest';
import { GameBridge, SessionConfig } from '@/lib/game/systems/gameBridge';

interface BootSceneData {
  bridge: GameBridge;
  session: SessionConfig;
}

export class BootScene extends Phaser.Scene {
  private bridge!: GameBridge;
  private session!: SessionConfig;

  constructor() {
    super('boot');
  }

  init(data: BootSceneData): void {
    this.bridge = data.bridge;
    this.session = data.session;
  }

  preload(): void {
    this.registerLoaderDiagnostics();
    this.preloadSpritesheets();
    this.preloadImages();
  }

  create(): void {
    this.scene.start('title', { bridge: this.bridge, session: this.session });
  }

  private preloadSpritesheets(): void {
    Object.values(ASSETS.spritesheets).forEach((asset) => {
      this.load.spritesheet(asset.key, getAssetSource(asset), asset.frameConfig);
    });
  }

  private preloadImages(): void {
    Object.values(ASSETS.images).forEach((asset) => {
      this.load.image(asset.key, getAssetSource(asset));
    });
  }

  private registerLoaderDiagnostics(): void {
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      const source = file.src || file.url || 'unknown-source';
      console.error(`[BootScene] Failed to load asset key="${file.key}" source="${source}"`);
    });

    this.load.on(Phaser.Loader.Events.COMPLETE, (totalComplete: number, totalFailed: number) => {
      const totalToLoad = totalComplete + totalFailed;
      this.bridge.emit('assetLoadComplete', { totalComplete, totalFailed, totalToLoad });
    });
  }
}
