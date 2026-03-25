'use client';

import { FUSION_RECIPES } from '@/lib/game/data/fusion';
import { UPGRADE_DEFS } from '@/lib/game/data/upgrades';
import { GameSave } from '@/lib/game/types/gameTypes';

interface WorkshopProps {
  save: GameSave;
  onBuy: (id: string) => void;
  onFuse: (id: string) => void;
  onStartRun: () => void;
}

export function WorkshopPanel({ save, onBuy, onFuse, onStartRun }: WorkshopProps) {
  const merchantLine = save.player.scrap < 20
    ? 'Merchant Finch: “Bring me odd bolts, I’ll find a use.”'
    : 'Merchant Finch: “Your chassis is humming louder. Good sign.”';
  const rivalLine = save.meta.zoneShortcuts.includes('cathedral-toasters')
    ? 'Rival Vee: “Cathedral is open. Try not to get toasted first.”'
    : 'Rival Vee: “Chrome Marsh first. Learn the puddles, then race me.”';

  return (
    <section className="panel">
      <h2>Workshop Hub</h2>
      <p className="muted">{merchantLine}</p>
      <p className="muted">{rivalLine}</p>
      <p>Scrap Bank: {save.player.scrap}</p>
      <div className="grid">
        {UPGRADE_DEFS.filter((u) => u.cost > 0).map((upgrade) => {
          const owned = save.meta.unlockedUpgrades.includes(upgrade.id);
          const afford = save.player.scrap >= upgrade.cost;
          return (
            <button
              className="card"
              key={upgrade.id}
              disabled={owned || !afford}
              onClick={() => onBuy(upgrade.id)}
              type="button"
            >
              <strong>{upgrade.name}</strong>
              <span>{upgrade.effectText}</span>
              <em>{owned ? 'Installed' : `Cost ${upgrade.cost}`}</em>
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
            <button className="card" disabled={!canFuse || known} key={recipe.id} onClick={() => onFuse(recipe.id)} type="button">
              <strong>{recipe.id}</strong>
              <span>{recipe.parts.join(' + ')}</span>
              <em>{known ? 'Known' : canFuse ? 'Fuse' : 'Missing parts'}</em>
            </button>
          );
        })}
      </div>

      <button className="start" onClick={onStartRun} type="button">
        Leave Workshop → Start Run
      </button>
    </section>
  );
}
