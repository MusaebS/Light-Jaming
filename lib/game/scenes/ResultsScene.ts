import * as Phaser from 'phaser';
import { fadeInScene, startSceneWithFade } from '@/lib/game/scenes/utils/sceneTransition';
import { GameBridge, RunResultPayload, SessionConfig } from '@/lib/game/systems/gameBridge';

interface ResultsSceneData {
  bridge: GameBridge;
  session: SessionConfig;
  result: RunResultPayload;
}

export class ResultsScene extends Phaser.Scene {
  private bridge!: GameBridge;
  private session!: SessionConfig;
  private result!: RunResultPayload;

  constructor() {
    super('results');
  }

  init(data: ResultsSceneData): void {
    this.bridge = data.bridge;
    this.session = data.session;
    this.result = data.result;
  }

  create(): void {
    fadeInScene(this);
    const title = this.result.outcome === 'retreat' ? 'Run Complete' : 'Run Failed';
    const subtitle = this.result.outcome === 'retreat'
      ? 'Clean retreat. Salvage secured.'
      : 'Shutdown recovered. Telemetry still useful.';

    this.add.rectangle(500, 350, 900, 580, 0x10161f, 0.98).setStrokeStyle(2, 0xffd166, 0.4);
    this.add.text(500, 230, title, { fontSize: '48px', color: '#f4f7ff' }).setOrigin(0.5);
    this.add.text(500, 300, subtitle, { fontSize: '22px', color: '#b4d4e7' }).setOrigin(0.5);
    this.add.text(500, 370, `Scrap recovered: ${this.result.extractedScrap}`, { fontSize: '24px', color: '#ffd166' }).setOrigin(0.5);

    if (this.result.blueprintFound) {
      this.add.text(500, 420, `Blueprint recovered: ${this.result.blueprintFound}`, { fontSize: '18px', color: '#72ffe7' }).setOrigin(0.5);
    }

    const button = this.add.rectangle(500, 510, 320, 52, 0x63f7ff, 0.24).setStrokeStyle(2, 0x63f7ff, 0.8).setInteractive();
    this.add.text(500, 510, 'Return to Workshop', { fontSize: '20px', color: '#d9f9ff' }).setOrigin(0.5);

    button.on('pointerdown', () => this.returnToWorkshop());
    this.input.keyboard?.once('keydown-ENTER', () => this.returnToWorkshop());
  }

  private returnToWorkshop(): void {
    this.bridge.emit('runEnd', this.result);
    this.bridge.emit('sceneTransition', { from: 'results', to: 'title', reason: 'return-to-workshop' });
    this.bridge.emit('shellNavigation', { screen: 'workshop' });
    startSceneWithFade(this, 'title', { bridge: this.bridge, session: this.session });
  }
}
