# Scrapcore

Scrapcore is a modular Streamlit game prototype about surviving as a salvaged robot in a brutal post-apocalyptic scrapyard. The MVP focuses on a stable, mobile-friendly loop of **explore → scavenge → fight → loot → upgrade → survive**.

## Implementation plan

1. Build a clean multi-module Python architecture with separated game logic, world generation, combat, loot, upgrades, and UI.
2. Ship a fully playable Streamlit MVP that works reliably in a turn-based format suitable for phones and Streamlit reruns.
3. Add lightweight automated tests, JSON save/load, and developer notes so the prototype is easy to extend.

## Project structure

```text
app.py
game/
  balance.py
  combat.py
  constants.py
  damage.py
  loot.py
  models.py
  progression.py
  state.py
  ui.py
  utils.py
  world.py
tests/
requirements.txt
.streamlit/config.toml
```

## Features included

- **Mobile-first Streamlit layout** with large buttons, stacked panels, and minimal clutter.
- **Turn-based top-down exploration loop** on a generated 5x5 ruined surface map.
- **Scavenging nodes** that provide scrap and modular robot parts.
- **Primitive robot melee combat** with approach, attack, guard, and dodge actions.
- **Internal damage model** affecting core, locomotion, actuator, weapon mount, and stabilizer systems.
- **Enemy archetypes** including light scavenger, heavy bruiser, fast striker, and armored defender.
- **Inventory and equipment system** for modular parts and industrial melee tools.
- **Workshop upgrades** fueled by scavenged scrap.
- **Session-state persistence** plus optional JSON save/load.
- **Automated tests** covering combat, progression, and world generation basics.

## Run locally

### 1) Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

### 3) Launch the game

```bash
streamlit run app.py
```

Then open the local Streamlit URL in your browser. For phone testing, use a narrow responsive viewport or load the local URL from a device on the same network if your environment allows it.

## How to play

1. Start in the center tile as a weak salvage robot with only **Reinforced Fists**.
2. Use the movement buttons to travel across the ruined surface.
3. Tap **Scavenge** to strip a tile for scrap and possible equipment.
4. When an enemy appears, use:
   - **Approach** to close melee distance.
   - **Attack** to strike once in range.
   - **Guard** to reduce incoming damage.
   - **Dodge** to create space.
5. Loot destroyed enemies for scrap and parts.
6. Equip found parts from inventory and buy workshop upgrades.
7. Survive as long as possible while preserving your internal systems, especially the **Core**.

## Internal damage design

Scrapcore does not treat damage as only a flat HP bar:

- **Shell / integrity damage** always happens when a heavy blow lands.
- **Penetration** can occur when impact overcomes armor and stability.
- Penetrating hits damage a random internal system:
  - **Core**: if reduced to zero, the robot shuts down.
  - **Locomotion**: lowers mobility.
  - **Actuator**: lowers attack power.
  - **Weapon mount**: lowers attack performance.
  - **Stabilizer**: lowers effective armor and steadiness.

This keeps combat brutal and mechanical without requiring fragile real-time rendering.

## Developer notes: extending the prototype

### Add new enemy types

Edit `game/constants.py` and add a new entry to `ENEMY_ARCHETYPES` with:

- display name
- base stats
- weapon / armor bonuses
- loot bias

`game/world.py` already selects from this catalog, so new archetypes become available automatically.

### Add new loot or robot parts

Edit `game/constants.py` and add a new entry in `PART_CATALOG`.
Each part is data-driven and can define:

- `slot`
- `stat_bonuses`
- `attack_bonus`
- `armor_bonus`
- `scrap_value`
- `description`

The scavenge and enemy drop systems use this catalog directly.

### Add more maps or hazards later

Recommended path:

- move tile templates into dedicated data files or additional constants modules
- extend `Tile` in `game/models.py`
- add hazard resolution to `game/world.py`
- render new state panels in `game/ui.py`

### Keep future changes maintainable

- Keep formulas in `game/balance.py`
- Keep effect resolution in `game/damage.py`
- Keep Streamlit rendering in `game/ui.py`
- Keep session and persistence logic in `game/state.py`

That separation is the main foundation for later additions like crafting, factions, environmental hazards, and larger world generation.

## Testing

Run:

```bash
pytest
```

## Notes on design decisions

- The MVP uses a **turn-based combat model** instead of fragile real-time browser rendering so it remains stable on Streamlit and Streamlit Cloud.
- The presentation is intentionally **functional, brutal, and minimal** rather than asset-heavy.
- Dependencies are intentionally minimal for easier deployment.
