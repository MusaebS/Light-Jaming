import { GameSave, RenderModeSetting, ZoneId } from '@/lib/game/types/gameTypes';

const STORAGE_KEY = 'scrap-pilgrim-save-v1';

const VALID_ZONE_IDS: ReadonlySet<ZoneId> = new Set(['chrome-marsh', 'cathedral-toasters']);
const VALID_RENDER_MODES: ReadonlySet<RenderModeSetting> = new Set([
  'auto',
  'mode-a',
  'mode-b',
  'mode-c',
  'mode-d'
]);

export const defaultSave: GameSave = {
  version: 1,
  player: {
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    scrap: 0,
    runScrap: 0,
    modules: []
  },
  meta: {
    unlockedUpgrades: [],
    knownRecipes: [],
    zoneShortcuts: ['chrome-marsh'],
    codexEntries: [],
    cosmeticTags: ['patchwork-shell']
  },
  settings: {
    soundOn: true,
    reducedMotion: false,
    reducedShake: false,
    renderMode: 'auto'
  }
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizeStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
    ? [...value]
    : [...fallback];
}

function sanitizeZoneArray(value: unknown, fallback: ZoneId[]): ZoneId[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const zones: ZoneId[] = [];
  for (const zone of value) {
    if (typeof zone !== 'string' || !VALID_ZONE_IDS.has(zone as ZoneId)) {
      return [...fallback];
    }
    zones.push(zone as ZoneId);
  }
  return zones;
}

function sanitizeRenderMode(value: unknown, fallback: RenderModeSetting): RenderModeSetting {
  return typeof value === 'string' && VALID_RENDER_MODES.has(value as RenderModeSetting)
    ? (value as RenderModeSetting)
    : fallback;
}

export function sanitizeSave(parsed: unknown): GameSave {
  if (!isObject(parsed)) {
    return { ...defaultSave };
  }

  const player = isObject(parsed.player) ? parsed.player : {};
  const meta = isObject(parsed.meta) ? parsed.meta : {};
  const settings = isObject(parsed.settings) ? parsed.settings : {};

  return {
    version: sanitizeNumber(parsed.version, defaultSave.version),
    player: {
      health: sanitizeNumber(player.health, defaultSave.player.health),
      maxHealth: sanitizeNumber(player.maxHealth, defaultSave.player.maxHealth),
      energy: sanitizeNumber(player.energy, defaultSave.player.energy),
      maxEnergy: sanitizeNumber(player.maxEnergy, defaultSave.player.maxEnergy),
      scrap: sanitizeNumber(player.scrap, defaultSave.player.scrap),
      runScrap: sanitizeNumber(player.runScrap, defaultSave.player.runScrap),
      modules: sanitizeStringArray(player.modules, defaultSave.player.modules)
    },
    meta: {
      unlockedUpgrades: sanitizeStringArray(meta.unlockedUpgrades, defaultSave.meta.unlockedUpgrades),
      knownRecipes: sanitizeStringArray(meta.knownRecipes, defaultSave.meta.knownRecipes),
      zoneShortcuts: sanitizeZoneArray(meta.zoneShortcuts, defaultSave.meta.zoneShortcuts),
      codexEntries: sanitizeStringArray(meta.codexEntries, defaultSave.meta.codexEntries),
      cosmeticTags: sanitizeStringArray(meta.cosmeticTags, defaultSave.meta.cosmeticTags)
    },
    settings: {
      soundOn: sanitizeBoolean(settings.soundOn, defaultSave.settings.soundOn),
      reducedMotion: sanitizeBoolean(settings.reducedMotion, defaultSave.settings.reducedMotion),
      reducedShake: sanitizeBoolean(settings.reducedShake, defaultSave.settings.reducedShake),
      renderMode: sanitizeRenderMode(settings.renderMode, defaultSave.settings.renderMode)
    }
  };
}

export function loadSave(): GameSave {
  if (typeof window === 'undefined') {
    return defaultSave;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSave;
    }

    return sanitizeSave(JSON.parse(raw));
  } catch {
    return defaultSave;
  }
}

export function writeSave(save: GameSave): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
