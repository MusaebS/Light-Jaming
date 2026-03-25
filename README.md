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

### If Vercel reports Phaser + JSX build errors

- Ensure Phaser imports use namespace form: `import * as Phaser from 'phaser'`.
- Avoid explicit `JSX.Element` return types in React 19 + Next 15; let TypeScript infer return types.
- Ensure `next` is upgraded to a patched release (`15.2.6` or newer) to avoid CVE-2025-66478 warnings.
- Re-run `npm run build` locally before redeploying to confirm CI parity.

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

- ✅ Fixed missing in-run visuals by rendering the player body/outline at full opacity and adding subtle animated arena beacons so action is clearly visible on mobile web.
- ✅ Reworked synthesized SFX to be created fully from WebAudio oscillators + generated noise (no external assets), with an explicit user-gesture audio unlock path for mobile browsers.
- ✅ Improved run presentation with richer arena graphics (grid, props, directional player marker, extraction marker) so gameplay is visible and readable on web/mobile.
- ✅ Fixed mobile touch controls by wiring buttons through `GameBridge` control events directly into Phaser input handling (instead of synthetic keyboard events that mobile browsers can ignore).
- ✅ Added lightweight synthesized SFX (pickup/action/dodge/event cues) that respect the in-game Sound setting.
- ✅ Updated `GameCanvas` to use a type-only Phaser import (`import type { Game }`) so the component avoids unnecessary runtime Phaser bindings while keeping build compatibility.
- ✅ Verified local production build passes (`npm run build`) after resolving the Vercel-reported Phaser import and JSX namespace issues.
- ✅ Added explicit TypeScript global types (`node`, `react`, `react-dom`) in `tsconfig.json` to prevent `Cannot find namespace 'JSX'` failures in strict CI/Vercel environments.
- ✅ Fixed strict TypeScript generic event-handler typing in `GameBridge.on/emit`, resolving Next.js production build failures during Vercel type-checking.
- ✅ Fixed Phaser `Set#each` callbacks in `RunScene` to return a boolean, resolving strict TypeScript build failures during Vercel deployment.
- ✅ Fixed Phaser imports to use namespace imports (`import * as Phaser`) for compatibility with Next.js production builds.
- ✅ Removed explicit `JSX.Element` return types to resolve React 19 TypeScript namespace issues during Vercel type-checking.
- ✅ Updated Next.js packages from `15.2.0` to `15.2.6` to address CVE-2025-66478 patched-version requirement.
- ✅ Migrated project from Streamlit/Python prototype to Next.js + TypeScript + Phaser browser architecture.
- ✅ Added modular game data, scene logic, workshop UI, and local persistence.
- ✅ Implemented MVP loop with short-run replay structure.
