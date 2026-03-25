import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.add.text(24, 24, 'Booting Scrap Pilgrim...', { color: '#d9f9ff', fontSize: '18px' });
  }
}
