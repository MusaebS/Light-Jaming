import { GameSave } from '@/lib/game/types/gameTypes';

const STORAGE_KEY = 'scrap-pilgrim-save-v1';

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

export function loadSave(): GameSave {
  if (typeof window === 'undefined') {
    return defaultSave;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSave;
    }
    const parsed = JSON.parse(raw) as GameSave;
    return {
      ...defaultSave,
      ...parsed,
      player: { ...defaultSave.player, ...parsed.player },
      meta: { ...defaultSave.meta, ...parsed.meta },
      settings: { ...defaultSave.settings, ...parsed.settings }
    };
  } catch {
    return defaultSave;
  }
}

export function writeSave(save: GameSave): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function clearSave(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
