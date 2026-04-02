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

## Asset source mode + CSP

Asset entries now carry both inline and file-backed sources. Source selection is controlled by `NEXT_PUBLIC_ASSET_MODE`:

- `inline`: always use `data:` URIs (`inlineSource`) first.
- `file`: always use static files from `public/assets` (`fileSource`) first.
- `auto` (default):
  - `NODE_ENV=development` → prefer inline source.
  - `NODE_ENV=test` → prefer inline source (deterministic test behavior).
  - `NODE_ENV=production` → prefer file source (better CSP compatibility).

Recommended CSP when running inline mode:

```http
Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:;
```

If your production CSP blocks `data:` URIs, use either:

- `NEXT_PUBLIC_ASSET_MODE=file`, or
- `NEXT_PUBLIC_ASSET_MODE=auto` with `NODE_ENV=production` (auto-fallback prefers `fileSource` and falls back to `inlineSource` if needed).

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

- ✅ Added a small Phaser-clock prompt cooldown helper in `RunScene` for high-frequency junk-overlap and zone-hazard prompt emissions to prevent UI spam while keeping interactions responsive.
- ✅ Prevented Phaser re-creation on shell HUD/prompt updates by memoizing run session props in `app/page.tsx`, splitting `GameCanvas` init vs. runtime session updates, and wiring `RunScene` to apply `sessionUpdate` changes in-place.
- ✅ Updated all `app/page.tsx` bridge event subscriptions (`hud`, `interactPrompt`, `sceneTransition`, `runEnd`, `shellNavigation`, `pauseState`) so each React effect directly returns `bridge.on(...)` unsubscribe callbacks, preventing dangling listeners on unmount.
- ✅ Added an active-enemy cap in `RunScene.spawnEnemies(...)` using `countActive(true)` room checks, plus periodic stale/out-of-bounds enemy cleanup to stabilize long-run mobile performance.
- ✅ Removed the unused `RunScene.drawArena(...)` implementation and kept arena rendering centralized through `lib/game/scenes/utils/renderFactory.ts` to prevent duplicated scene-render logic from diverging.
- ✅ Hardened save loading with `sanitizeSave(...)` to copy only known fields, reject invalid enum/array values, and fall back to defaults for malformed save data.
- ✅ Resolved render-strategy merge conflicts by tightening auto mode selection checks (A→B→C→D) and keeping Mode D as an explicit guaranteed fallback when primitive rendering is unavailable.
- ✅ Added a four-tier run-scene render strategy (asset textures, generated textures, primitive-only, and high-contrast fallback), plus a dev-only settings override and shared entity factory helpers to keep gameplay readable when textures are unavailable.
- ✅ Added deterministic RunScene texture fallbacks (player/enemy/tile/scrap + shared props), plus a dev/test in-scene warning banner when fallback visuals are active due to missing assets.
- ✅ Centralized Phaser asset loading in `BootScene.preload()` using manifest keys and `getAssetSource(...)`, added loader diagnostics (`loaderror` + completion bridge event), and kept title-scene transition in `create()` so scene flow starts only after preloading completes.
- ✅ Added dual asset-source manifest support (`inlineSource` + `fileSource`) with `NEXT_PUBLIC_ASSET_MODE` (`inline|file|auto`) resolution plus CSP guidance/fallback documentation for dev/test/prod behavior.
- ✅ Added asset manifest compatibility fields/helpers (`source` + legacy `path`) to reduce merge conflicts with scene code during ongoing asset-loader updates across branches.
- ✅ Swapped committed binary image assets for manifest-managed inline SVG data URIs so diffs stay text-only and reviewable in environments that do not support binary patches.
- ✅ Replaced primitive run-scene placeholders with manifest-driven preloaded sprites, background tiles, and basic player/enemy animations (with body size/offset tuning and dev-only debug placeholder guard).
- ✅ Refactored the home screen into game-first action panels (Play/Workshop/Settings), moved long-form guidance into a collapsible Help/Journal component, refreshed workshop/touch controls to icon+label UI, and tightened mobile layout spacing to prioritize gameplay canvas.
- ✅ Improved HUD responsiveness and readability by adding HP/EN icon bars, and fixed run HUD synchronization with a dirty-flag emit flow that updates on health/energy/scrap changes and pause state changes.
- ✅ Added Phaser title/results scene flow with fade transitions, moved run completion handling into scene-to-scene transitions, and narrowed React orchestration to high-level bridge navigation/state sync.
- ✅ Fixed mobile HUD and comfort-setting layout bugs by stacking comfort toggles cleanly and switching HUD stats to a responsive two-column layout on small screens.
- ✅ Added an in-run pause/resume flow (Esc on desktop, Pause on touch) with explicit player-respecting messaging and no penalty for taking breaks.
- ✅ Added zone-specific periodic hazards (Chrome Marsh conductive drain, Cathedral heat vents) to make both zones play differently while staying readable.
- ✅ Added destructible junk mounds that can be broken for salvage, improving tactile scavenging and short-session route decisions.
- ✅ Improved enemy behavior readability with Jealous Cart flee logic, Fridge Mimic disguise/reveal behavior, and Repair Saint ally-heal support behavior.
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
