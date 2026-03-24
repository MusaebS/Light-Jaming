export type ZoneId = 'chrome-marsh' | 'cathedral-toasters';

export type LootType =
  | 'common_scrap'
  | 'energy_cell'
  | 'uncommon_component'
  | 'rare_relic'
  | 'blueprint_fragment'
  | 'enemy_salvage';

export type UpgradeCategory =
  | 'movement'
  | 'tool'
  | 'core'
  | 'sensor'
  | 'utility'
  | 'cosmetic';

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  cost: number;
  effectText: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  health: number;
  speed: number;
  contactDamage: number;
  twist: string;
}

export interface FusionRecipe {
  id: string;
  parts: [string, string];
  resultUpgradeId: string;
  flavor: string;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  scrap: number;
  runScrap: number;
  modules: string[];
}

export interface MetaProgress {
  unlockedUpgrades: string[];
  knownRecipes: string[];
  zoneShortcuts: ZoneId[];
  codexEntries: string[];
  cosmeticTags: string[];
}

export interface GameSave {
  version: number;
  player: PlayerState;
  meta: MetaProgress;
  settings: GameSettings;
}

export interface GameSettings {
  soundOn: boolean;
  reducedMotion: boolean;
  reducedShake: boolean;
}

export type RunOutcome = 'retreat' | 'shutdown';
