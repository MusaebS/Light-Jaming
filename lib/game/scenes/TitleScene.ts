import * as Phaser from 'phaser';
import { SessionConfig, GameBridge } from '@/lib/game/systems/gameBridge';
import { fadeInScene, startSceneWithFade } from '@/lib/game/scenes/utils/sceneTransition';

interface TitleSceneData {
  bridge: GameBridge;
  session: SessionConfig;
}

export class TitleScene extends Phaser.Scene {
  private bridge!: GameBridge;
  private session!: SessionConfig;

  constructor() {
    super('title');
  }

  init(data: TitleSceneData): void {
    this.bridge = data.bridge;
    this.session = data.session;
  }

  create(): void {
    fadeInScene(this);
    this.bridge.emit('sceneTransition', { from: 'boot', to: 'title', reason: 'boot' });
    this.bridge.emit('interactPrompt', { text: 'Press Enter / Tap to start your scavenging run.' });

    this.add.rectangle(500, 350, 920, 620, 0x111926, 0.98).setStrokeStyle(2, 0x63f7ff, 0.5);
    this.add.text(500, 250, 'SCRAP PILGRIM', { fontSize: '52px', color: '#d9f9ff' }).setOrigin(0.5);
    this.add.text(500, 330, `Zone: ${this.session.zone.replace('-', ' ')}`, { fontSize: '20px', color: '#9fd4e6' }).setOrigin(0.5);
    this.add.text(500, 400, 'Tap / Click or press Enter to begin', { fontSize: '22px', color: '#ffd166' }).setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', () => this.startRun());
    this.input.once('pointerdown', () => this.startRun());
  }

  private startRun(): void {
    this.bridge.emit('sceneTransition', { from: 'title', to: 'run', reason: 'start-run' });
    startSceneWithFade(this, 'run', { bridge: this.bridge, session: this.session });
  }
}
