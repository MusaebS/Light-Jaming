# SCRAP PILGRIM (Next.js + Phaser MVP)

A polished browser-first indie prototype where a small scavenger robot explores weird machine wastelands, gathers scrap, fights readable enemies, and returns to a workshop for upgrades and fusion builds.

## Design summary

- **Core loop:** workshop → zone run → collect + survive → push or retreat → install upgrades/fusions → rerun.
- **Motivation pillars:** autonomy, competence, world connection, flow, respect-for-time.
- **Input:** desktop keyboard + mobile touch controls.
- **Architecture:** Next.js shell/UI, Phaser gameplay scene, event bridge, localStorage save system.
- **MVP scope delivered:**
  - 1 workshop hub
  - 2 zones (Chrome Marsh + Cathedral of Toasters unlock)
  - 10 upgrades + 2 fusion outcomes
  - 6 enemy types
  - merchant + rival flavor text
  - random run events
  - meta progression (blueprints/codex/zone shortcut unlock)
  - save/load, settings toggles, reduced motion and shake settings

## Project file tree

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  GameCanvas.tsx
  HudOverlay.tsx
  SettingsPanel.tsx
  TouchControls.tsx
  WorkshopPanel.tsx
lib/game/
  config/phaserConfig.ts
  data/enemies.ts
  data/events.ts
  data/fusion.ts
  data/upgrades.ts
  data/zones.ts
  entities/playerLogic.ts
  scenes/BootScene.ts
  scenes/RunScene.ts
  systems/gameBridge.ts
  systems/saveSystem.ts
  types/gameTypes.ts
next.config.ts
package.json
tsconfig.json
```

## Install

```bash
npm install
```

## Run in development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Vercel deploy notes

- Framework preset: **Next.js**.
- Build command: `npm run build`.
- Output handled by Next.js automatically.
- No server secrets required for this MVP.
- Saves are local to each device/browser via `localStorage`.

## Systems explained

### Upgrades
- Movement, tool, core, sensor, utility modules with tradeoffs and playstyle shifts.
- Notable examples: Magnet Pulse, Hover Fan, Drill Beak, Arc Welder, Luck Engine.

### Enemies
- Six readable archetypes: Vacuum Wolves, Cutlery Spiders, Jealous Carts, Repair Saints, Fridge Mimics, Cable Eels.
- Each has one tactical twist for learnable mastery.

### Fusion system
- Compact recipe list with understandable outcomes.
- Current fusions:
  - magnet-pulse + shrine-bells → attracting-charm-field
  - drill-beak + echo-sensor → secret-hunter-rig

### Lightweight random events
- Scrap Storm, Glitch Bloom, Vending Oracle, False Exit Door.
- Events are transparent and fun (not deceptive, not punitive).

### Save system
- Persisted in `localStorage`.
- Stores player scrap, unlocked modules, known recipes, codex entries, zone unlocks, and settings.

### Future expansion points
- Add more zones by extending `lib/game/data/zones.ts`.
- Add more enemies via `lib/game/data/enemies.ts`.
- Add recipes via `lib/game/data/fusion.ts`.
- Add event modifiers in `lib/game/data/events.ts` and `RunScene.ts`.

## Progress log

- ✅ Migrated project from Streamlit/Python prototype to Next.js + TypeScript + Phaser browser architecture.
- ✅ Added modular game data, scene logic, workshop UI, and local persistence.
- ✅ Implemented MVP loop with short-run replay structure.
