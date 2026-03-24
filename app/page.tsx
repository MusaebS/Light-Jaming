'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { HudOverlay } from '@/components/HudOverlay';
import { SettingsPanel } from '@/components/SettingsPanel';
import { TouchControls } from '@/components/TouchControls';
import { WorkshopPanel } from '@/components/WorkshopPanel';
import { FUSION_RECIPES } from '@/lib/game/data/fusion';
import { UPGRADE_DEFS } from '@/lib/game/data/upgrades';
import { GameBridge, HudPayload } from '@/lib/game/systems/gameBridge';
import { clearSave, defaultSave, loadSave, writeSave } from '@/lib/game/systems/saveSystem';
import { GameSave, ZoneId } from '@/lib/game/types/gameTypes';

const GameCanvas = dynamic(() => import('@/components/GameCanvas').then((m) => m.GameCanvas), { ssr: false });

const initialHud: HudPayload = {
  health: 100,
  energy: 100,
  scrap: 0,
  modules: [],
  hint: 'Move, scavenge, and retreat on your terms.',
  zone: 'chrome-marsh'
};

export default function HomePage(): JSX.Element {
  const [save, setSave] = useState<GameSave>(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [running, setRunning] = useState(false);
  const [zone, setZone] = useState<ZoneId>('chrome-marsh');
  const [hud, setHud] = useState<HudPayload>(initialHud);
  const [prompt, setPrompt] = useState('');

  const bridge = useMemo(() => new GameBridge(), []);

  useMemo(() => {
    if (loaded) return;
    const restored = loadSave();
    setSave(restored);
    setLoaded(true);
  }, [loaded]);

  useMemo(
    () =>
      bridge.on('hud', (payload) => {
        setHud(payload);
      }),
    [bridge]
  );

  useMemo(
    () =>
      bridge.on('interactPrompt', ({ text }) => {
        setPrompt(text);
      }),
    [bridge]
  );

  useMemo(
    () =>
      bridge.on('runEnd', ({ outcome, extractedScrap, blueprintFound, codexUnlock }) => {
        setRunning(false);
        setSave((prev) => {
          const unlocked = blueprintFound && !prev.meta.unlockedUpgrades.includes(blueprintFound)
            ? [...prev.meta.unlockedUpgrades, blueprintFound]
            : prev.meta.unlockedUpgrades;
          const codex = codexUnlock && !prev.meta.codexEntries.includes(codexUnlock)
            ? [...prev.meta.codexEntries, codexUnlock]
            : prev.meta.codexEntries;

          const next: GameSave = {
            ...prev,
            player: {
              ...prev.player,
              scrap: prev.player.scrap + extractedScrap,
              runScrap: 0,
              health: prev.player.maxHealth,
              energy: prev.player.maxEnergy
            },
            meta: {
              ...prev.meta,
              unlockedUpgrades: unlocked,
              codexEntries: codex,
              zoneShortcuts:
                extractedScrap > 40 && !prev.meta.zoneShortcuts.includes('cathedral-toasters')
                  ? [...prev.meta.zoneShortcuts, 'cathedral-toasters']
                  : prev.meta.zoneShortcuts
            }
          };
          writeSave(next);
          return next;
        });
        setPrompt(outcome === 'retreat' ? 'Clean retreat. Merchant Finch whistles approvingly.' : 'Shutdown, but you still hauled recoverable telemetry.');
      }),
    [bridge]
  );

  const buyUpgrade = (id: string): void => {
    const target = UPGRADE_DEFS.find((u) => u.id === id);
    if (!target || target.cost <= 0) return;
    setSave((prev) => {
      if (prev.player.scrap < target.cost || prev.meta.unlockedUpgrades.includes(id)) return prev;
      const next = {
        ...prev,
        player: { ...prev.player, scrap: prev.player.scrap - target.cost },
        meta: { ...prev.meta, unlockedUpgrades: [...prev.meta.unlockedUpgrades, id] }
      };
      writeSave(next);
      return next;
    });
  };

  const fuse = (recipeId: string): void => {
    const recipe = FUSION_RECIPES.find((item) => item.id === recipeId);
    if (!recipe) return;
    setSave((prev) => {
      if (prev.meta.knownRecipes.includes(recipe.id)) return prev;
      if (!recipe.parts.every((part) => prev.meta.unlockedUpgrades.includes(part))) return prev;
      const next = {
        ...prev,
        meta: {
          ...prev.meta,
          knownRecipes: [...prev.meta.knownRecipes, recipe.id],
          unlockedUpgrades: [...new Set([...prev.meta.unlockedUpgrades, recipe.resultUpgradeId])]
        }
      };
      writeSave(next);
      return next;
    });
  };

  const startRun = (): void => {
    setPrompt('Run started. Rival Vee is somewhere nearby...');
    setRunning(true);
  };

  return (
    <main>
      <h1>SCRAP PILGRIM</h1>
      <p>
        Leave workshop, scavenge weird machine ruins, choose when to push or retreat, then fuse strange modules into new builds.
      </p>

      <section className="panel">
        <h2>Design Summary</h2>
        <ul>
          <li>Core loop: workshop → run → risk decisions → retreat → upgrade/fusion → rerun.</li>
          <li>Motivation pillars: autonomy, competence, world connection, flow, and player respect.</li>
          <li>Controls: desktop (WASD/Arrows + Space/Shift/E/Esc), mobile touch pad + action buttons.</li>
          <li>Architecture: Next.js shell/UI, Phaser scene gameplay, event bridge, localStorage saves.</li>
          <li>MVP scope: 2 zones, 10 upgrades + 2 fusions, 6 enemies, merchant + rival flavor, compact meta-progression.</li>
        </ul>
      </section>

      <SettingsPanel
        onChange={(next) => {
          const updated = { ...save, settings: next };
          setSave(updated);
          writeSave(updated);
        }}
        settings={save.settings}
      />

      {!running && (
        <>
          <section className="panel">
            <h3>Zone Select</h3>
            <select onChange={(event) => setZone(event.target.value as ZoneId)} value={zone}>
              <option value="chrome-marsh">Chrome Marsh</option>
              <option disabled={!save.meta.zoneShortcuts.includes('cathedral-toasters')} value="cathedral-toasters">
                Cathedral of Toasters
              </option>
            </select>
            <button onClick={() => { clearSave(); setSave(defaultSave); }} style={{ marginLeft: 8 }} type="button">
              Reset Save
            </button>
          </section>
          <WorkshopPanel onBuy={buyUpgrade} onFuse={fuse} onStartRun={startRun} save={save} />
        </>
      )}

      {running && (
        <>
          <HudOverlay hud={hud} prompt={prompt} />
          <GameCanvas bridge={bridge} session={{ zone, settings: save.settings, modules: save.meta.unlockedUpgrades }} />
          <TouchControls />
        </>
      )}

      <section className="panel">
        <h3>Onboarding</h3>
        <ol>
          <li>Move immediately and collect glowing scrap.</li>
          <li>Use Action to fend off enemies and Dodge to escape pressure.</li>
          <li>Retreat any time (Esc on desktop, Interact near extraction corner).</li>
          <li>Spend scrap on modules and try a new build next run.</li>
        </ol>
      </section>
    </main>
  );
}
