'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { HelpJournalPanel } from '@/components/HelpJournalPanel';
import { HudOverlay } from '@/components/HudOverlay';
import { SettingsPanel } from '@/components/SettingsPanel';
import { TouchControls } from '@/components/TouchControls';
import { WorkshopPanel } from '@/components/WorkshopPanel';
import { FUSION_RECIPES } from '@/lib/game/data/fusion';
import { UPGRADE_DEFS } from '@/lib/game/data/upgrades';
import { GameBridge, HudPayload, SceneKey } from '@/lib/game/systems/gameBridge';
import { clearSave, defaultSave, loadSave, writeSave } from '@/lib/game/systems/saveSystem';
import { GameSave, ZoneId } from '@/lib/game/types/gameTypes';

const GameCanvas = dynamic(() => import('@/components/GameCanvas').then((m) => m.GameCanvas), { ssr: false });

type HomeView = 'home' | 'workshop' | 'settings';

const initialHud: HudPayload = {
  health: 100,
  energy: 100,
  scrap: 0,
  modules: [],
  hint: 'Move, scavenge, and retreat on your terms.',
  zone: 'chrome-marsh'
};

export default function HomePage() {
  const [save, setSave] = useState<GameSave>(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [running, setRunning] = useState(false);
  const [zone, setZone] = useState<ZoneId>('chrome-marsh');
  const [hud, setHud] = useState<HudPayload>(initialHud);
  const [prompt, setPrompt] = useState('');
  const [paused, setPaused] = useState(false);
  const [activeScene, setActiveScene] = useState<SceneKey>('title');
  const [homeView, setHomeView] = useState<HomeView>('home');
  const [saveHint, setSaveHint] = useState('');

  const bridge = useMemo(() => new GameBridge(), []);
  const session = useMemo(
    () => ({ zone, settings: save.settings, modules: save.meta.unlockedUpgrades }),
    [zone, save.settings, save.meta.unlockedUpgrades]
  );

  const persistSave = (nextSave: GameSave): void => {
    const didPersist = writeSave(nextSave);
    setSaveHint(
      didPersist
        ? ''
        : 'Save failed in this browser session. Progress will continue for now but may not be restored after refresh.'
    );
  };

  useEffect(() => {
    if (loaded) return;
    const restored = loadSave();
    setSave(restored);
    setLoaded(true);
  }, [loaded]);

  useEffect(() => {
    return bridge.on('hud', (payload) => {
      setHud(payload);
    });
  }, [bridge]);

  useEffect(() => {
    return bridge.on('interactPrompt', ({ text }) => {
      setPrompt(text);
    });
  }, [bridge]);

  useEffect(() => {
    return bridge.on('sceneTransition', ({ to, reason }) => {
      setActiveScene(to);
      if (reason === 'start-run') {
        setPrompt('Run started. Rival Vee is somewhere nearby...');
      }
    });
  }, [bridge]);

  useEffect(() => {
    return bridge.on('runEnd', ({ outcome, extractedScrap, blueprintFound, codexUnlock }) => {
      setPaused(false);
      setHomeView('home');
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
        persistSave(next);
        return next;
      });
      setPrompt(outcome === 'retreat' ? 'Clean retreat. Merchant Finch whistles approvingly.' : 'Shutdown, but you still hauled recoverable telemetry.');
    });
  }, [bridge]);

  useEffect(() => {
    return bridge.on('shellNavigation', ({ screen }) => {
      if (screen === 'workshop') {
        setRunning(false);
        setPaused(false);
        setActiveScene('title');
      }
    });
  }, [bridge]);

  useEffect(() => {
    return bridge.on('pauseState', ({ paused: next }) => {
      setPaused(next);
      setPrompt(next ? 'Paused. Take a breather; your run waits safely.' : 'Back online. Keep scavenging at your pace.');
    });
  }, [bridge]);

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
      persistSave(next);
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
      persistSave(next);
      return next;
    });
  };

  const startRun = (): void => {
    setPaused(false);
    setActiveScene('title');
    setRunning(true);
  };

  const homePanels = (
    <>
      <section className="panel action-grid">
        <button className="action-card action-play" onClick={startRun} type="button">
          <span aria-hidden="true" className="action-icon">▶</span>
          <strong>Play</strong>
          <em>Start a zone run instantly.</em>
        </button>
        <button className="action-card" onClick={() => setHomeView('workshop')} type="button">
          <span aria-hidden="true" className="action-icon">🛠</span>
          <strong>Workshop</strong>
          <em>Buy modules and trigger fusions.</em>
        </button>
        <button className="action-card" onClick={() => setHomeView('settings')} type="button">
          <span aria-hidden="true" className="action-icon">⚙</span>
          <strong>Settings</strong>
          <em>Audio, visual comfort, and controls.</em>
        </button>
      </section>

      <section className="panel panel-compact">
        <h3>Run Setup</h3>
        <div className="inline-tools">
          <label htmlFor="zone-select">Zone</label>
          <select id="zone-select" onChange={(event) => setZone(event.target.value as ZoneId)} value={zone}>
            <option value="chrome-marsh">Chrome Marsh</option>
            <option disabled={!save.meta.zoneShortcuts.includes('cathedral-toasters')} value="cathedral-toasters">
              Cathedral of Toasters
            </option>
          </select>
          <button onClick={() => { clearSave(); setSave(defaultSave); }} type="button">
            ♻ Reset Save
          </button>
        </div>
      </section>

      <HelpJournalPanel />
    </>
  );

  return (
    <main>
      <h1>SCRAP PILGRIM</h1>
      {saveHint && (
        <section className="panel panel-compact" role="status">
          <p className="muted">{saveHint}</p>
        </section>
      )}

      {!running && (
        <>
          {homeView === 'home' && homePanels}

          {homeView === 'workshop' && (
            <>
              <section className="panel panel-compact">
                <button onClick={() => setHomeView('home')} type="button">← Back</button>
              </section>
              <WorkshopPanel onBuy={buyUpgrade} onFuse={fuse} onStartRun={startRun} save={save} />
              <HelpJournalPanel />
            </>
          )}

          {homeView === 'settings' && (
            <>
              <section className="panel panel-compact">
                <button onClick={() => setHomeView('home')} type="button">← Back</button>
              </section>
              <SettingsPanel
                onChange={(next) => {
                  const updated = { ...save, settings: next };
                  setSave(updated);
                  persistSave(updated);
                }}
                settings={save.settings}
              />
              <HelpJournalPanel />
            </>
          )}
        </>
      )}

      {running && (
        <>
          {paused && activeScene === 'run' && (
            <section className="panel">
              <h3>Paused</h3>
              <p className="muted">No penalty for breaks. Resume whenever you are ready.</p>
              <button onClick={() => bridge.emit('control', { control: 'pause', active: true })} type="button">
                ▶ Resume Run
              </button>
            </section>
          )}
          {activeScene === 'run' && <HudOverlay hud={hud} prompt={prompt} />}
          {activeScene !== 'run' && prompt && (
            <section className="panel">
              <h3>Run Flow</h3>
              <p className="muted">{prompt}</p>
            </section>
          )}
          <GameCanvas bridge={bridge} session={session} />
          {activeScene === 'run' && <TouchControls bridge={bridge} />}
        </>
      )}
    </main>
  );
}
