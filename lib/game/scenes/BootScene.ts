import * as Phaser from 'phaser';
import { GameBridge, SessionConfig } from '@/lib/game/systems/gameBridge';

interface BootSceneData {
  bridge: GameBridge;
  session: SessionConfig;
}

export class BootScene extends Phaser.Scene {
  private dataPayload?: BootSceneData;

  constructor() {
    super('boot');
  }

  init(data: BootSceneData): void {
    this.dataPayload = data;
  }

  create(): void {
    if (!this.dataPayload) {
      throw new Error('BootScene started without required session payload.');
    }
    this.scene.start('run', this.dataPayload);
  }
}
