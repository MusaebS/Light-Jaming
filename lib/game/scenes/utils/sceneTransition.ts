import * as Phaser from 'phaser';

export function startSceneWithFade(scene: Phaser.Scene, nextScene: string, data?: object, duration = 220): void {
  const camera = scene.cameras.main;
  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(nextScene, data);
  });
  camera.fadeOut(duration, 8, 12, 18);
}

export function fadeInScene(scene: Phaser.Scene, duration = 220): void {
  scene.cameras.main.fadeIn(duration, 8, 12, 18);
}
