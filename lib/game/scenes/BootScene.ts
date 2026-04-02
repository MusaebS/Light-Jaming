import * as Phaser from 'phaser';
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

  create(): void {
    this.scene.start('title', { bridge: this.bridge, session: this.session });
  }
}
