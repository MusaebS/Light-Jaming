import * as Phaser from 'phaser';
import { BootScene } from '@/lib/game/scenes/BootScene';
import { RunScene } from '@/lib/game/scenes/RunScene';
import { GameBridge, SessionConfig } from '@/lib/game/systems/gameBridge';

export function createPhaserGame(
  container: HTMLDivElement,
  bridge: GameBridge,
  session: SessionConfig
): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 1000,
    height: 700,
    parent: container,
    backgroundColor: '#0f1318',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, RunScene],
    callbacks: {
      postBoot: (game) => {
        game.scene.start('run', { bridge, session });
      }
    }
  });
}
