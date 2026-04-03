import * as Phaser from 'phaser';
import { BootScene } from '@/lib/game/scenes/BootScene';
import { ResultsScene } from '@/lib/game/scenes/ResultsScene';
import { RunScene } from '@/lib/game/scenes/RunScene';
import { TitleScene } from '@/lib/game/scenes/TitleScene';
import { GameBridge, SessionConfig } from '@/lib/game/systems/gameBridge';

export function createPhaserGame(
  container: HTMLDivElement,
  bridge: GameBridge,
  session: SessionConfig
): Phaser.Game {
  const buildConfig = (rendererType: number): Phaser.Types.Core.GameConfig => ({
    type: rendererType,
    width: 1000,
    height: 700,
    parent: container,
    backgroundColor: '#0f1318',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, TitleScene, RunScene, ResultsScene],
    callbacks: {
      postBoot: (game) => {
        game.scene.start('boot', { bridge, session });
      }
    }
  });

  try {
    return new Phaser.Game(buildConfig(Phaser.AUTO));
  } catch (error) {
    console.error('[PhaserConfig] AUTO renderer failed; retrying with CANVAS renderer.', error);
    return new Phaser.Game(buildConfig(Phaser.CANVAS));
  }
}
