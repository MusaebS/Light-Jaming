import * as Phaser from 'phaser';
import { ASSETS } from '@/lib/game/assets/assetManifest';
import { ENEMIES } from '@/lib/game/data/enemies';
import { RUN_EVENTS } from '@/lib/game/data/events';
import { ZONES } from '@/lib/game/data/zones';
import { buildPlayerTuning } from '@/lib/game/entities/playerLogic';
import { fadeInScene, startSceneWithFade } from '@/lib/game/scenes/utils/sceneTransition';
import { GameBridge, SessionConfig } from '@/lib/game/systems/gameBridge';
import { LootType, ZoneId } from '@/lib/game/types/gameTypes';

interface RunSceneData {
  bridge: GameBridge;
  session: SessionConfig;
}

type TouchControl = 'up' | 'down' | 'left' | 'right' | 'action' | 'dodge' | 'interact' | 'pause';

const SHOW_DEV_DEBUG = process.env.NODE_ENV !== 'production' && false;

export class RunScene extends Phaser.Scene {
  private bridge!: GameBridge;
  private session!: SessionConfig;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerFacing!: Phaser.GameObjects.Image;
  private enemies!: Phaser.Physics.Arcade.Group;
  private scrapGroup!: Phaser.Physics.Arcade.Group;
  private junkGroup!: Phaser.Physics.Arcade.StaticGroup;
  private hp = 100;
  private energy = 100;
  private scrap = 0;
  private hudDirty = false;
  private hudHint = 'Collect scrap, test action, then decide when to retreat.';
  private actionCooldown = 0;
  private selectedEvent = RUN_EVENTS[0];
  private lastMoveDirection = new Phaser.Math.Vector2(1, 0);
  private controlUnsubscribe?: () => void;
  private audioUnlocked = false;
  private paused = false;
  private touchState: Record<TouchControl, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
    dodge: false,
    interact: false,
    pause: false
  };

  init(data: RunSceneData): void {
    this.bridge = data.bridge;
    this.session = data.session;
  }

  create(): void {
    fadeInScene(this);
    const zone = ZONES.find((entry) => entry.id === this.session.zone) ?? ZONES[0];
    this.selectedEvent = Phaser.Utils.Array.GetRandom(RUN_EVENTS);
    this.cameras.main.setBackgroundColor(zone.hazardColor);

    const worldRect = new Phaser.Geom.Rectangle(40, 40, 920, 620);
    this.drawArena(worldRect, zone.name);
    this.createAnimations();

    this.player = this.physics.add.sprite(140, 120, ASSETS.spritesheets.player.key, 0);
    this.player.setDepth(20);
    this.player.play(ASSETS.anims.playerIdle);

    this.playerFacing = this.add.image(140, 120, ASSETS.images.uiEnergy.key).setScale(0.9).setAlpha(0.8).setDepth(21);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBoundsRectangle(worldRect);
    body.setSize(18, 22);
    body.setOffset(7, 6);

    this.enemies = this.physics.add.group();
    this.scrapGroup = this.physics.add.group();
    this.junkGroup = this.physics.add.staticGroup();

    this.spawnScrap(30);
    this.spawnEnemies(8);
    this.spawnJunk(zone.id === 'cathedral-toasters' ? 14 : 10);

    this.physics.add.overlap(this.player, this.scrapGroup, (_, pickup) => {
      pickup.destroy();
      this.collectScrap('common_scrap', 1);
      this.playSfx('pickup');
    });

    this.physics.add.overlap(this.player, this.enemies, () => {
      this.hp = Math.max(0, this.hp - 0.22);
      this.markHudDirty();
      if (!this.session.settings.reducedShake) {
        this.cameras.main.shake(60, 0.0014, true);
      }
      if (this.hp <= 0) {
        this.endRun('shutdown');
      }
    });

    this.physics.add.overlap(this.player, this.junkGroup, (_, junkNode) => {
      const node = junkNode as Phaser.Physics.Arcade.Sprite;
      this.bridge.emit('interactPrompt', { text: `Break junk mound (${node.getData('hp')} durability) for salvage.` });
    });

    const keyboard = this.input.keyboard;
    this.cursors = keyboard!.createCursorKeys();
    this.wasd = keyboard!.addKeys('W,S,A,D,E,SPACE,SHIFT,ESC') as Record<string, Phaser.Input.Keyboard.Key>;

    this.input.keyboard?.on('keydown-E', () => this.tryInteract());
    this.input.keyboard?.on('keydown-SPACE', () => this.actionBurst());
    this.input.keyboard?.on('keydown-SHIFT', () => this.dodgeBurst());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown', () => this.unlockAudio(), this);
    this.input.on('pointerdown', () => this.unlockAudio(), this);

    this.controlUnsubscribe = this.bridge.on('control', ({ control, active }) => {
      this.touchState[control] = active;
      if (active && control === 'action') this.actionBurst();
      if (active && control === 'dodge') this.dodgeBurst();
      if (active && control === 'interact') this.tryInteract();
      if (active && control === 'pause') this.togglePause();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.controlUnsubscribe?.();
      this.controlUnsubscribe = undefined;
    });

    this.time.addEvent({
      delay: 20000,
      loop: true,
      callback: () => {
        if (this.session.modules.includes('echo-sensor') || this.session.modules.includes('secret-hunter-rig')) {
          this.spawnScrap(4);
          this.bridge.emit('interactPrompt', { text: 'Echo pulse found hidden caches nearby.' });
          this.playSfx('cache');
        }
      }
    });

    this.time.addEvent({ delay: 7000, loop: true, callback: () => this.spawnEnemies(2) });
    this.time.addEvent({
      delay: zone.id === 'cathedral-toasters' ? 2200 : 2600,
      loop: true,
      callback: () => this.applyZoneHazard(zone.id)
    });
    this.markHudDirty('Collect scrap, test action, then decide when to retreat.');
    this.flushHud();
  }

  update(time: number, delta: number): void {
    if (this.paused) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      this.flushHud();
      return;
    }

    const tuning = buildPlayerTuning(this.session.modules);
    const velocity = new Phaser.Math.Vector2(0, 0);
    if (this.cursors.left.isDown || this.wasd.A.isDown || this.touchState.left) velocity.x = -1;
    if (this.cursors.right.isDown || this.wasd.D.isDown || this.touchState.right) velocity.x = 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown || this.touchState.up) velocity.y = -1;
    if (this.cursors.down.isDown || this.wasd.S.isDown || this.touchState.down) velocity.y = 1;

    velocity.normalize().scale(tuning.moveSpeed);
    if (velocity.lengthSq() > 0) this.lastMoveDirection.copy(velocity).normalize();

    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(velocity.x, velocity.y);
    this.playerFacing.setPosition(this.player.x, this.player.y);
    this.playerFacing.setRotation(this.lastMoveDirection.angle() + Math.PI / 2);

    const nextEnergy = Math.min(100, this.energy + delta * 0.005);
    if (nextEnergy !== this.energy) {
      this.energy = nextEnergy;
      this.markHudDirty();
    }
    this.actionCooldown = Math.max(0, this.actionCooldown - delta);

    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
      const enemyId = enemy.getData('id') as string;
      if (enemyId === 'jealous-cart' && this.scrap > 12) {
        this.physics.moveTo(enemy, 920, 620, enemy.getData('speed'));
      } else if (enemyId === 'fridge-mimic') {
        const nearPlayer = Phaser.Math.Distance.BetweenPoints(enemy, this.player) < 140;
        enemy.setTint(nearPlayer ? 0xff9c9c : 0x9eb0bc);
        if (nearPlayer) {
          this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
        } else {
          enemyBody.setVelocity(0, 0);
        }
      } else {
        this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
      }

      if (enemyId === 'jealous-cart' || enemyId === 'vacuum-wolf') {
        enemy.play(ASSETS.anims.enemyWalk, true);
      }

      if (enemyId === 'repair-saint' && Math.random() < 0.004) {
        this.healNearestEnemy(enemy, 2);
      }
      if (this.selectedEvent.id === 'scrap-storm') enemyBody.velocity.scale(1.03);
      return true;
    });

    if (time % 650 < 16 && this.session.modules.includes('magnet-pulse')) {
      this.pullPickups(tuning.magnetRadius);
    }

    if (this.scrap >= 34 && this.session.zone === 'chrome-marsh') {
      this.markHudDirty('You can retreat now, or push deeper for rare salvage.');
    }
    this.flushHud();
  }

  private drawArena(worldRect: Phaser.Geom.Rectangle, zoneName: string): void {
    this.add.tileSprite(500, 350, worldRect.width, worldRect.height, ASSETS.images.arenaBackground.key).setAlpha(0.96).setDepth(0);
    this.add.tileSprite(500, 350, worldRect.width, worldRect.height, ASSETS.images.arenaTile.key).setAlpha(0.3).setDepth(1);

    for (let i = 0; i < 12; i += 1) {
      this.add
        .image(Phaser.Math.Between(100, 890), Phaser.Math.Between(120, 590), ASSETS.images.junk.key)
        .setScale(Phaser.Math.FloatBetween(0.85, 1.25))
        .setRotation(Phaser.Math.FloatBetween(-0.25, 0.25))
        .setAlpha(0.3)
        .setDepth(2);
    }

    for (let i = 0; i < 15; i += 1) {
      const beacon = this.add
        .image(Phaser.Math.Between(80, 920), Phaser.Math.Between(90, 640), ASSETS.images.beacon.key)
        .setScale(Phaser.Math.FloatBetween(0.7, 1.2))
        .setAlpha(0.35)
        .setDepth(3);

      if (!this.session.settings.reducedMotion) {
        this.tweens.add({
          targets: beacon,
          alpha: { from: 0.2, to: 0.65 },
          yoyo: true,
          repeat: -1,
          duration: Phaser.Math.Between(900, 1800),
          delay: Phaser.Math.Between(0, 700)
        });
      }
    }

    this.add.text(56, 50, `${zoneName} · ${this.selectedEvent.name}`, { color: '#d9f9ff', fontSize: '16px' }).setDepth(5);
    this.add.text(838, 612, 'EXTRACT', { color: '#ffd166', fontSize: '14px' }).setDepth(5);
  }

  private createAnimations(): void {
    if (!this.anims.exists(ASSETS.anims.playerIdle)) {
      this.anims.create({ key: ASSETS.anims.playerIdle, frames: [{ key: ASSETS.spritesheets.player.key, frame: 0 }], frameRate: 3, repeat: -1 });
    }
    if (!this.anims.exists(ASSETS.anims.playerWalk)) {
      this.anims.create({
        key: ASSETS.anims.playerWalk,
        frames: this.anims.generateFrameNumbers(ASSETS.spritesheets.player.key, { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists(ASSETS.anims.playerAction)) {
      this.anims.create({
        key: ASSETS.anims.playerAction,
        frames: this.anims.generateFrameNumbers(ASSETS.spritesheets.player.key, { frames: [3, 1, 3] }),
        frameRate: 14,
        repeat: 0
      });
    }
    if (!this.anims.exists(ASSETS.anims.enemyWalk)) {
      this.anims.create({
        key: ASSETS.anims.enemyWalk,
        frames: this.anims.generateFrameNumbers(ASSETS.spritesheets.enemyCart.key, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  private actionBurst(): void {
    if (this.actionCooldown > 0) return;
    const tuning = buildPlayerTuning(this.session.modules);
    this.actionCooldown = this.session.modules.includes('arc-welder') ? 520 : 300;
    this.player.play(ASSETS.anims.playerAction, true);

    const strikeFx = this.add
      .image(this.player.x, this.player.y, ASSETS.images.beacon.key)
      .setScale(2.5)
      .setTint(0xf9da74)
      .setAlpha(0.25)
      .setDepth(19);
    this.time.delayedCall(120, () => strikeFx.destroy());
    this.playSfx('action');

    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (Phaser.Math.Distance.BetweenPoints(this.player, enemy) < 52) {
        const hp = (enemy.getData('hp') as number) - tuning.actionDamage;
        enemy.setData('hp', hp);
        enemy.setTint(0xffa3a3);
        this.time.delayedCall(90, () => enemy.setTint(0xff7373));
        if (hp <= 0) {
          enemy.destroy();
          this.collectScrap('enemy_salvage', 2);
          this.playSfx('defeat');
        }
      }
      return true;
    });

    this.junkGroup.children.each((child) => {
      const junk = child as Phaser.Physics.Arcade.Sprite;
      if (Phaser.Math.Distance.BetweenPoints(this.player, junk) >= 56) return true;
      const hp = (junk.getData('hp') as number) - 1;
      junk.setData('hp', hp);
      junk.setTint(0xc9d4dd);
      this.time.delayedCall(90, () => junk.setTint(0xffffff));
      if (hp <= 0) {
        junk.destroy();
        this.collectScrap('uncommon_component', 3);
        this.spawnScrap(2);
        this.bridge.emit('interactPrompt', { text: 'Junk mound cracked open. Salvage spilled out.' });
      }
      return true;
    });
  }

  private dodgeBurst(): void {
    const tuning = buildPlayerTuning(this.session.modules);
    if (this.energy < tuning.dashCost) return;

    this.energy -= tuning.dashCost;
    this.markHudDirty();
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.velocity.scale(1.7);
    if (body.velocity.lengthSq() < 1) body.setVelocity(tuning.dashImpulse, 0);
    this.playSfx('dodge');
  }

  private unlockAudio(): void {
    if (this.audioUnlocked) return;
    if (!(this.sound instanceof Phaser.Sound.WebAudioSoundManager)) return;
    this.sound.context.resume();
    this.audioUnlocked = true;
  }

  private playSfx(kind: 'pickup' | 'action' | 'dodge' | 'cache' | 'defeat'): void {
    if (!this.session.settings.soundOn) return;
    if (!(this.sound instanceof Phaser.Sound.WebAudioSoundManager)) return;
    const { context } = this.sound;
    if (context.state !== 'running') return;

    const now = context.currentTime;
    const master = context.createGain();
    master.gain.value = 0.06;
    master.connect(context.destination);

    const beep = (from: number, to: number, duration: number, type: OscillatorType): void => {
      const osc = context.createOscillator();
      const amp = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, now);
      osc.frequency.exponentialRampToValueAtTime(to, now + duration);
      amp.gain.setValueAtTime(1, now);
      amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(amp);
      amp.connect(master);
      osc.start(now);
      osc.stop(now + duration);
    };

    const noise = (duration: number): void => {
      const sampleCount = Math.floor(context.sampleRate * duration);
      const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      const src = context.createBufferSource();
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      const amp = context.createGain();
      amp.gain.setValueAtTime(0.45, now);
      amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
      src.buffer = buffer;
      src.connect(filter);
      filter.connect(amp);
      amp.connect(master);
      src.start(now);
      src.stop(now + duration);
    };

    if (kind === 'pickup') beep(840, 1020, 0.06, 'square');
    if (kind === 'action') {
      beep(260, 160, 0.12, 'sawtooth');
      noise(0.08);
    }
    if (kind === 'dodge') beep(510, 740, 0.05, 'triangle');
    if (kind === 'cache') beep(420, 620, 0.14, 'triangle');
    if (kind === 'defeat') beep(170, 120, 0.16, 'sawtooth');
  }

  private collectScrap(type: LootType, amount: number): void {
    const multiplier = this.session.modules.includes('scrap-compressor') ? 1.4 : 1;
    const gain = Math.round(amount * multiplier);
    this.scrap += gain;
    this.bridge.emit('pickup', { type, amount: gain });
    this.markHudDirty('Scavenge more or retreat with your haul.');
  }

  private pullPickups(radius: number): void {
    this.scrapGroup.children.each((child) => {
      const pickup = child as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.BetweenPoints(this.player, pickup);
      if (distance <= radius) {
        const vec = new Phaser.Math.Vector2(this.player.x - pickup.x, this.player.y - pickup.y).normalize();
        pickup.x += vec.x * 1.8;
        pickup.y += vec.y * 1.8;
      }
      return true;
    });
  }

  private spawnScrap(count: number): void {
    for (let i = 0; i < count; i += 1) {
      const scrap = this.physics.add.sprite(Phaser.Math.Between(70, 930), Phaser.Math.Between(90, 640), ASSETS.images.scrap.key);
      scrap.setScale(Phaser.Math.FloatBetween(0.8, 1.05));
      scrap.setDepth(14);
      (scrap.body as Phaser.Physics.Arcade.Body).setSize(10, 10).setOffset(3, 3);
      this.scrapGroup.add(scrap);
    }
  }

  private spawnEnemies(count: number): void {
    for (let i = 0; i < count; i += 1) {
      const def = Phaser.Utils.Array.GetRandom(ENEMIES);
      const enemy = this.physics.add.sprite(Phaser.Math.Between(120, 900), Phaser.Math.Between(140, 620), ASSETS.spritesheets.enemyCart.key, 0);
      enemy.setDepth(15);
      enemy.setTint(def.id === 'repair-saint' ? 0x89ffab : 0xff7373);
      enemy.setData('id', def.id);
      enemy.setData('hp', def.health);
      enemy.setData('speed', def.speed);
      (enemy.body as Phaser.Physics.Arcade.Body).setSize(18, 16).setOffset(7, 8);
      this.enemies.add(enemy);
    }
  }

  private spawnJunk(count: number): void {
    for (let i = 0; i < count; i += 1) {
      const junk = this.physics.add.staticSprite(Phaser.Math.Between(110, 900), Phaser.Math.Between(110, 620), ASSETS.images.junk.key);
      junk.setScale(Phaser.Math.FloatBetween(0.85, 1.2));
      junk.setDepth(11);
      junk.setData('hp', Phaser.Math.Between(2, 4));
      const body = junk.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(24, 18).setOffset(8, 10);
      this.junkGroup.add(junk);
    }
  }

  private healNearestEnemy(source: Phaser.Physics.Arcade.Sprite, amount: number): void {
    let nearest: Phaser.Physics.Arcade.Sprite | undefined;
    let shortest = Number.POSITIVE_INFINITY;

    this.enemies.children.each((child) => {
      const candidate = child as Phaser.Physics.Arcade.Sprite;
      if (candidate === source) return true;
      const distance = Phaser.Math.Distance.BetweenPoints(source, candidate);
      if (distance < shortest) {
        shortest = distance;
        nearest = candidate;
      }
      return true;
    });

    if (!nearest || shortest > 180) return;
    const maxHp = ENEMIES.find((enemy) => enemy.id === nearest?.getData('id'))?.health ?? 20;
    nearest.setData('hp', Math.min(maxHp, (nearest.getData('hp') as number) + amount));
    nearest.setTint(0x9dffb8);
    this.time.delayedCall(100, () => nearest?.setTint(0xff7373));
  }

  private applyZoneHazard(zoneId: ZoneId): void {
    if (this.paused) return;
    const inHotspot = this.player.x > 300 && this.player.x < 690 && this.player.y > 220 && this.player.y < 500;
    if (!inHotspot) return;

    if (zoneId === 'chrome-marsh') {
      this.energy = Math.max(0, this.energy - 4);
      this.markHudDirty();
      this.bridge.emit('interactPrompt', { text: 'Conductive puddle drained energy. Route around it next pass.' });
    } else {
      this.hp = Math.max(0, this.hp - 4);
      this.markHudDirty();
      this.bridge.emit('interactPrompt', { text: 'Heat vent blast! Cathedral routes are tighter but richer.' });
      if (!this.session.settings.reducedShake) this.cameras.main.shake(90, 0.0018, true);
    }
  }

  private togglePause(): void {
    this.paused = !this.paused;
    this.physics.world.isPaused = this.paused;
    this.bridge.emit('pauseState', { paused: this.paused });
    this.markHudDirty(this.paused ? 'Paused · Take your time. Resume when ready.' : 'Back in action. Route safely.');
    this.flushHud();
  }

  private tryInteract(): void {
    if (this.player.x > 860 && this.player.y > 580) {
      this.endRun('retreat');
      return;
    }

    this.bridge.emit('interactPrompt', { text: 'Rival Vee marked a side route nearby. Break junk mounds or retreat.' });
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

  private markHudDirty(hint?: string): void {
    if (hint) this.hudHint = hint;
    this.hudDirty = true;
  }

  private flushHud(): void {
    if (!this.hudDirty) return;
    this.sendHud(this.hudHint);
    this.hudDirty = false;
  }

  private endRun(outcome: 'retreat' | 'shutdown'): void {
    const result = {
      outcome,
      extractedScrap: this.scrap,
      blueprintFound: this.scrap > 30 ? 'echo-sensor' : undefined,
      codexUnlock: this.selectedEvent.name
    };
    this.bridge.emit('sceneTransition', { from: 'run', to: 'results', reason: 'run-complete' });
    startSceneWithFade(this, 'results', { bridge: this.bridge, session: this.session, result });
  }
}
