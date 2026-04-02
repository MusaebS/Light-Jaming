'use client';

import { FUSION_RECIPES } from '@/lib/game/data/fusion';
import { UPGRADE_DEFS } from '@/lib/game/data/upgrades';
import { GameSave, UpgradeCategory } from '@/lib/game/types/gameTypes';

interface WorkshopProps {
  save: GameSave;
  onBuy: (id: string) => void;
  onFuse: (id: string) => void;
  onStartRun: () => void;
}

const CATEGORY_ICON: Record<UpgradeCategory, string> = {
  movement: '🦿',
  tool: '🧰',
  utility: '✨',
  core: '🔋',
  sensor: '📡',
  cosmetic: '🎨'
};

export function WorkshopPanel({ save, onBuy, onFuse, onStartRun }: WorkshopProps) {
  const ownedCount = save.meta.unlockedUpgrades.length;
  const unlockCount = save.meta.zoneShortcuts.length;

  return (
    <section className="panel">
      <h2>🛠 Workshop Hub</h2>

      <div className="stats-row">
        <article className="stat-block" title="Spend this in the workshop.">
          <span>💠 Scrap</span>
          <strong>{save.player.scrap}</strong>
        </article>
        <article className="stat-block" title="Total installed modules and fused outcomes.">
          <span>🧩 Modules</span>
          <strong>{ownedCount}</strong>
        </article>
        <article className="stat-block" title="Unlocked route shortcuts and late-zone access.">
          <span>🗺 Unlocks</span>
          <strong>{unlockCount}</strong>
        </article>
      </div>

      <div className="grid">
        {UPGRADE_DEFS.filter((u) => u.cost > 0).map((upgrade) => {
          const owned = save.meta.unlockedUpgrades.includes(upgrade.id);
          const afford = save.player.scrap >= upgrade.cost;
          return (
            <button
              className="card icon-card"
              key={upgrade.id}
              disabled={owned || !afford}
              onClick={() => onBuy(upgrade.id)}
              title={upgrade.effectText}
              type="button"
            >
              <div className="card-head">
                <span aria-hidden="true" className="card-icon">{CATEGORY_ICON[upgrade.category]}</span>
                <strong>{upgrade.name}</strong>
              </div>
              <small>{upgrade.category}</small>
              <em>{owned ? '✅ Installed' : `💠 ${upgrade.cost}`}</em>
            </button>
          );
        })}
      </div>

      <h3>Fusion Bench</h3>
      <div className="grid">
        {FUSION_RECIPES.map((recipe) => {
          const known = save.meta.knownRecipes.includes(recipe.id);
          const canFuse = recipe.parts.every((part) => save.meta.unlockedUpgrades.includes(part));
          return (
            <button
              className="card icon-card"
              disabled={!canFuse || known}
              key={recipe.id}
              onClick={() => onFuse(recipe.id)}
              title={recipe.flavor}
              type="button"
            >
              <div className="card-head">
                <span aria-hidden="true" className="card-icon">⚗</span>
                <strong>{recipe.id}</strong>
              </div>
              <small>{recipe.parts.join(' + ')}</small>
              <em>{known ? '✅ Known' : canFuse ? '⚡ Fuse' : '🔒 Parts needed'}</em>
            </button>
          );
        })}
      </div>

      <button className="start" onClick={onStartRun} type="button">
        ▶ Start Run
      </button>
    </section>
  );
}
