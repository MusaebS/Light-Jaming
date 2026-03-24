import * as Phaser from 'phaser';
import { ENEMIES } from '@/lib/game/data/enemies';
import { RUN_EVENTS } from '@/lib/game/data/events';
import { ZONES } from '@/lib/game/data/zones';
import { buildPlayerTuning } from '@/lib/game/entities/playerLogic';
import { GameBridge, SessionConfig } from '@/lib/game/systems/gameBridge';
import { LootType } from '@/lib/game/types/gameTypes';

interface RunSceneData {
  bridge: GameBridge;
  session: SessionConfig;
}

export class RunScene extends Phaser.Scene {
  private bridge!: GameBridge;
  private session!: SessionConfig;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private player!: Phaser.GameObjects.Arc;
  private enemies!: Phaser.Physics.Arcade.Group;
  private scrapGroup!: Phaser.Physics.Arcade.Group;
  private hp = 100;
  private energy = 100;
  private scrap = 0;
  private actionCooldown = 0;
  private selectedEvent = RUN_EVENTS[0];

  init(data: RunSceneData): void {
    this.bridge = data.bridge;
    this.session = data.session;
  }

  create(): void {
    const zone = ZONES.find((entry) => entry.id === this.session.zone) ?? ZONES[0];
    this.selectedEvent = Phaser.Utils.Array.GetRandom(RUN_EVENTS);
    this.cameras.main.setBackgroundColor(zone.hazardColor);

    const worldRect = new Phaser.Geom.Rectangle(40, 40, 920, 620);
    this.add.rectangle(500, 350, worldRect.width, worldRect.height, 0x101418, 0.8).setStrokeStyle(2, 0x5fd4ff, 0.4);
    this.add.text(56, 50, `${zone.name} · ${this.selectedEvent.name}`, { color: '#d9f9ff', fontSize: '16px' });

    this.player = this.add.circle(140, 120, 14, 0x72ffe7);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBoundsRectangle(worldRect);

    this.enemies = this.physics.add.group();
    this.scrapGroup = this.physics.add.group();
    this.spawnScrap(30);
    this.spawnEnemies(8);

    this.physics.add.overlap(this.player, this.scrapGroup, (_, pickup) => {
      pickup.destroy();
      this.collectScrap('common_scrap', 1);
    });

    this.physics.add.overlap(this.player, this.enemies, () => {
      this.hp = Math.max(0, this.hp - 0.22);
      if (this.hp <= 0) {
        this.endRun('shutdown');
      }
    });

    const keyboard = this.input.keyboard;
    this.cursors = keyboard!.createCursorKeys();
    this.wasd = keyboard!.addKeys('W,S,A,D,E,SPACE,SHIFT,ESC') as Record<string, Phaser.Input.Keyboard.Key>;

    this.input.keyboard?.on('keydown-E', () => this.tryInteract());
    this.input.keyboard?.on('keydown-SPACE', () => this.actionBurst());
    this.input.keyboard?.on('keydown-SHIFT', () => this.dodgeBurst());
    this.input.keyboard?.on('keydown-ESC', () => this.endRun('retreat'));

    this.time.addEvent({
      delay: 20000,
      loop: true,
      callback: () => {
        if (this.session.modules.includes('echo-sensor') || this.session.modules.includes('secret-hunter-rig')) {
          this.spawnScrap(4);
          this.bridge.emit('interactPrompt', { text: 'Echo pulse found hidden caches nearby.' });
        }
      }
    });

    this.time.addEvent({ delay: 7000, loop: true, callback: () => this.spawnEnemies(2) });
    this.sendHud('Collect scrap, test action, then decide when to retreat.');
  }

  update(time: number, delta: number): void {
    const tuning = buildPlayerTuning(this.session.modules);
    const velocity = new Phaser.Math.Vector2(0, 0);
    if (this.cursors.left.isDown || this.wasd.A.isDown) velocity.x = -1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) velocity.x = 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) velocity.y = -1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) velocity.y = 1;

    velocity.normalize().scale(tuning.moveSpeed);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocity.x, velocity.y);

    this.energy = Math.min(100, this.energy + delta * 0.005);
    this.actionCooldown = Math.max(0, this.actionCooldown - delta);

    this.enemies.children.each((child) => {
      const enemy = child as Phaser.GameObjects.Rectangle;
      const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
      this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
      if (enemy.getData('id') === 'repair-saint' && Math.random() < 0.004) {
        this.hp = Math.min(100, this.hp + 0.3);
      }
      if (this.selectedEvent.id === 'scrap-storm') {
        enemyBody.velocity.scale(1.03);
      }
    });

    if (time % 650 < 16 && this.session.modules.includes('magnet-pulse')) {
      this.pullPickups(tuning.magnetRadius);
    }

    if (this.scrap >= 34 && this.session.zone === 'chrome-marsh') {
      this.sendHud('You can retreat now, or push deeper for rare salvage.');
    }
  }

  private actionBurst(): void {
    if (this.actionCooldown > 0) return;
    const tuning = buildPlayerTuning(this.session.modules);
    this.actionCooldown = this.session.modules.includes('arc-welder') ? 520 : 300;

    const strikeRadius = this.add.circle(this.player.x, this.player.y, 45, 0xf9da74, 0.18);
    this.time.delayedCall(120, () => strikeRadius.destroy());

    this.enemies.children.each((child) => {
      const enemy = child as Phaser.GameObjects.Rectangle;
      if (Phaser.Math.Distance.BetweenPoints(this.player, enemy) < 52) {
        const hp = (enemy.getData('hp') as number) - tuning.actionDamage;
        enemy.setData('hp', hp);
        enemy.setFillStyle(0xffa3a3);
        this.time.delayedCall(90, () => enemy.setFillStyle(0xff7373));
        if (hp <= 0) {
          enemy.destroy();
          this.collectScrap('enemy_salvage', 2);
        }
      }
    });
  }

  private dodgeBurst(): void {
    const tuning = buildPlayerTuning(this.session.modules);
    if (this.energy < tuning.dashCost) return;

    this.energy -= tuning.dashCost;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.velocity.scale(1.7);
    if (body.velocity.lengthSq() < 1) {
      body.setVelocity(tuning.dashImpulse, 0);
    }
  }

  private collectScrap(type: LootType, amount: number): void {
    const multiplier = this.session.modules.includes('scrap-compressor') ? 1.4 : 1;
    const gain = Math.round(amount * multiplier);
    this.scrap += gain;
    this.bridge.emit('pickup', { type, amount: gain });
    this.sendHud('Scavenge more or retreat with your haul.');
  }

  private pullPickups(radius: number): void {
    this.scrapGroup.children.each((child) => {
      const pickup = child as Phaser.GameObjects.Arc;
      const distance = Phaser.Math.Distance.BetweenPoints(this.player, pickup);
      if (distance <= radius) {
        const vec = new Phaser.Math.Vector2(this.player.x - pickup.x, this.player.y - pickup.y).normalize();
        pickup.x += vec.x * 1.8;
        pickup.y += vec.y * 1.8;
      }
    });
  }

  private spawnScrap(count: number): void {
    for (let i = 0; i < count; i += 1) {
      const x = Phaser.Math.Between(70, 930);
      const y = Phaser.Math.Between(90, 640);
      const scrap = this.add.circle(x, y, Phaser.Math.Between(5, 8), 0xffd166, 0.95);
      this.physics.add.existing(scrap);
      this.scrapGroup.add(scrap);
    }
  }

  private spawnEnemies(count: number): void {
    for (let i = 0; i < count; i += 1) {
      const def = Phaser.Utils.Array.GetRandom(ENEMIES);
      const enemy = this.add.rectangle(Phaser.Math.Between(120, 900), Phaser.Math.Between(140, 620), 24, 20, 0xff7373);
      this.physics.add.existing(enemy);
      enemy.setData('id', def.id);
      enemy.setData('hp', def.health);
      enemy.setData('speed', def.speed);
      this.enemies.add(enemy);
    }
  }

  private tryInteract(): void {
    if (this.player.x > 860 && this.player.y > 580) {
      this.endRun('retreat');
      return;
    }

    this.bridge.emit('interactPrompt', { text: 'Nothing to interface here yet. Hunt for caches or retreat.' });
  }

  private sendHud(hint: string): void {
    this.bridge.emit('hud', {
      health: Math.round(this.hp),
      energy: Math.round(this.energy),
      scrap: this.scrap,
      modules: this.session.modules,
      hint,
      zone: this.session.zone,
      eventName: this.selectedEvent.name
    });
  }

  private endRun(outcome: 'retreat' | 'shutdown'): void {
    this.bridge.emit('runEnd', {
      outcome,
      extractedScrap: this.scrap,
      blueprintFound: this.scrap > 30 ? 'echo-sensor' : undefined,
      codexUnlock: this.selectedEvent.name
    });
    this.scene.stop();
  }
}
