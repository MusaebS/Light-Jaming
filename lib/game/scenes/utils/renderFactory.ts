import * as Phaser from 'phaser';
import { ASSETS } from '@/lib/game/assets/assetManifest';
import { RenderMode } from '@/lib/game/scenes/utils/renderStrategy';

const GENERATED_TEXTURES = {
  player: 'rt-player',
  enemy: 'rt-enemy',
  scrap: 'rt-scrap',
  junk: 'rt-junk',
  beacon: 'rt-beacon',
  arenaBg: 'rt-arena-bg',
  arenaTile: 'rt-arena-tile',
  marker: 'rt-marker'
} as const;

export type WorldEntity = Phaser.GameObjects.GameObject & {
  x: number;
  y: number;
  setDepth?: (value: number) => void;
  play?: (key: string, ignoreIfPlaying?: boolean) => void;
  setPosition?: (x: number, y: number) => void;
  setRotation?: (radians: number) => void;
  setTint?: (value: number) => void;
  clearTint?: () => void;
};

const asBodyEntity = <T extends WorldEntity>(entity: T): T => entity;

export function ensureGeneratedTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(GENERATED_TEXTURES.player)) return;
  const g = scene.add.graphics({ x: 0, y: 0 });

  g.fillStyle(0x2ddfcf, 1).fillRoundedRect(0, 0, 28, 28, 6).lineStyle(2, 0xd8fffb, 1).strokeRoundedRect(0, 0, 28, 28, 6);
  g.generateTexture(GENERATED_TEXTURES.player, 28, 28);
  g.clear();

  g.fillStyle(0xf06773, 1).fillRoundedRect(0, 0, 28, 22, 4).lineStyle(2, 0xfff0f1, 1).strokeRoundedRect(0, 0, 28, 22, 4);
  g.generateTexture(GENERATED_TEXTURES.enemy, 28, 22);
  g.clear();

  g.fillStyle(0xf6d46e, 1).fillCircle(8, 8, 7).lineStyle(1, 0xffffff, 0.75).strokeCircle(8, 8, 7);
  g.generateTexture(GENERATED_TEXTURES.scrap, 16, 16);
  g.clear();

  g.fillStyle(0x8c9fb1, 1).fillRoundedRect(0, 0, 34, 24, 4);
  g.generateTexture(GENERATED_TEXTURES.junk, 34, 24);
  g.clear();

  g.fillStyle(0x73fbff, 0.7).fillCircle(8, 8, 7);
  g.generateTexture(GENERATED_TEXTURES.beacon, 16, 16);
  g.clear();

  g.fillStyle(0x101a27, 1).fillRect(0, 0, 64, 64);
  g.generateTexture(GENERATED_TEXTURES.arenaBg, 64, 64);
  g.clear();

  g.fillStyle(0x1a273a, 1).fillRect(0, 0, 64, 64).lineStyle(1, 0x294563, 0.4);
  for (let i = 0; i < 64; i += 16) {
    g.lineBetween(0, i, 64, i);
    g.lineBetween(i, 0, i, 64);
  }
  g.generateTexture(GENERATED_TEXTURES.arenaTile, 64, 64);
  g.clear();

  g.fillStyle(0x85d2ff, 1).fillTriangle(8, 0, 0, 16, 16, 16);
  g.generateTexture(GENERATED_TEXTURES.marker, 16, 16);
  g.destroy();
}

export function createPlayer(scene: Phaser.Scene, mode: RenderMode, x: number, y: number): WorldEntity {
  if (mode === 'mode-a') return asBodyEntity(scene.physics.add.sprite(x, y, ASSETS.spritesheets.player.key, 0));
  if (mode === 'mode-b') return asBodyEntity(scene.physics.add.sprite(x, y, GENERATED_TEXTURES.player));
  if (mode === 'mode-c') {
    const body = scene.add.rectangle(x, y, 24, 24, 0x4ee1cd, 1).setStrokeStyle(2, 0xe0fffb, 1);
    scene.physics.add.existing(body);
    return asBodyEntity(body);
  }
  const text = scene.add.text(x, y, 'P', { fontSize: '20px', color: '#000000', backgroundColor: '#00ffd0' }).setOrigin(0.5);
  scene.physics.add.existing(text);
  return asBodyEntity(text);
}

export function createFacingMarker(scene: Phaser.Scene, mode: RenderMode, x: number, y: number): WorldEntity {
  if (mode === 'mode-a') return scene.add.image(x, y, ASSETS.images.uiEnergy.key).setScale(0.9).setAlpha(0.8) as WorldEntity;
  if (mode === 'mode-b') return scene.add.image(x, y, GENERATED_TEXTURES.marker).setScale(1.1) as WorldEntity;
  if (mode === 'mode-c') return scene.add.line(x, y, 0, 0, 0, -12, 0x9edbff, 1).setLineWidth(2) as WorldEntity;
  return scene.add.text(x, y, '▲', { fontSize: '18px', color: '#ffffff', backgroundColor: '#000000' }).setOrigin(0.5) as WorldEntity;
}

export function createEnemy(scene: Phaser.Scene, mode: RenderMode, x: number, y: number): WorldEntity {
  if (mode === 'mode-a') return asBodyEntity(scene.physics.add.sprite(x, y, ASSETS.spritesheets.enemyCart.key, 0));
  if (mode === 'mode-b') return asBodyEntity(scene.physics.add.sprite(x, y, GENERATED_TEXTURES.enemy));
  if (mode === 'mode-c') {
    const enemy = scene.add.rectangle(x, y, 24, 18, 0xff5d67, 1).setStrokeStyle(2, 0xffffff, 0.8);
    scene.physics.add.existing(enemy);
    return asBodyEntity(enemy);
  }
  const enemy = scene.add.text(x, y, '!', { fontSize: '16px', color: '#000000', backgroundColor: '#ff6d6d' }).setOrigin(0.5);
  scene.physics.add.existing(enemy);
  return asBodyEntity(enemy);
}

export function createScrap(scene: Phaser.Scene, mode: RenderMode, x: number, y: number): WorldEntity {
  if (mode === 'mode-a') return asBodyEntity(scene.physics.add.sprite(x, y, ASSETS.images.scrap.key));
  if (mode === 'mode-b') return asBodyEntity(scene.physics.add.sprite(x, y, GENERATED_TEXTURES.scrap));
  if (mode === 'mode-c') {
    const scrap = scene.add.circle(x, y, 7, 0xffd166, 1).setStrokeStyle(2, 0xfff3be, 1);
    scene.physics.add.existing(scrap);
    return asBodyEntity(scrap);
  }
  const scrap = scene.add.text(x, y, '$', { fontSize: '14px', color: '#000000', backgroundColor: '#fff157' }).setOrigin(0.5);
  scene.physics.add.existing(scrap);
  return asBodyEntity(scrap);
}

export function createJunk(scene: Phaser.Scene, mode: RenderMode, x: number, y: number): WorldEntity {
  if (mode === 'mode-a') return asBodyEntity(scene.physics.add.staticSprite(x, y, ASSETS.images.junk.key));
  if (mode === 'mode-b') return asBodyEntity(scene.physics.add.staticSprite(x, y, GENERATED_TEXTURES.junk));
  if (mode === 'mode-c') {
    const junk = scene.add.rectangle(x, y, 28, 20, 0x7f92a3, 1).setStrokeStyle(2, 0xd9ecff, 0.7);
    scene.physics.add.existing(junk, true);
    return asBodyEntity(junk);
  }
  const junk = scene.add.text(x, y, '#', { fontSize: '18px', color: '#ffffff', backgroundColor: '#203245' }).setOrigin(0.5);
  scene.physics.add.existing(junk, true);
  return asBodyEntity(junk);
}

export function drawArena(scene: Phaser.Scene, mode: RenderMode, worldRect: Phaser.Geom.Rectangle, zoneName: string, eventName: string): void {
  if (mode === 'mode-a' || mode === 'mode-b') {
    const bgKey = mode === 'mode-a' ? ASSETS.images.arenaBackground.key : GENERATED_TEXTURES.arenaBg;
    const tileKey = mode === 'mode-a' ? ASSETS.images.arenaTile.key : GENERATED_TEXTURES.arenaTile;
    scene.add.tileSprite(500, 350, worldRect.width, worldRect.height, bgKey).setAlpha(0.96).setDepth(0);
    scene.add.tileSprite(500, 350, worldRect.width, worldRect.height, tileKey).setAlpha(0.3).setDepth(1);
  } else {
    scene.add.rectangle(500, 350, worldRect.width, worldRect.height, 0x101928, 1).setDepth(0).setStrokeStyle(3, 0x80b8d6, 0.9);
    scene.add.line(500, 350, -460, 0, 460, 0, 0x2d4f66, 0.6).setDepth(1);
  }

  scene.add.text(56, 50, `${zoneName} · ${eventName}`, { color: '#d9f9ff', fontSize: '16px' }).setDepth(5);
  const extractStyle = mode === 'mode-d'
    ? { color: '#000000', fontSize: '14px', backgroundColor: '#fff200' }
    : { color: '#ffd166', fontSize: '14px' };
  scene.add.text(838, 612, 'EXTRACT', extractStyle).setDepth(5);
}
