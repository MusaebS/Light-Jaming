"""Streamlit rendering for the Scrapcore MVP."""

from __future__ import annotations

import streamlit as st

from game.combat import combat_snapshot, perform_player_action
from game.loot import enemy_drops, scavenge_tile
from game.progression import UPGRADE_OPTIONS, apply_upgrade, equip_part, grant_xp, inventory_summary
from game.state import append_log, load_game, save_game
from game.world import enemy_bias, get_tile, maybe_spawn_enemy, move_position


CSS = """
<style>
.block-container {padding-top: 1rem; padding-bottom: 4rem; max-width: 900px;}
.scrap-panel {background:#221c18; border:1px solid #574235; border-radius:14px; padding:0.9rem; margin-bottom:0.75rem;}
.scrap-title {font-size:1.05rem; font-weight:700; color:#f0c28b;}
.scrap-note {color:#d6c4ae; font-size:0.92rem;}
.stButton>button {width:100%; min-height:3rem; border-radius:12px; font-weight:700;}
.small-button button {min-height:2.4rem;}
.log-box {background:#120f0d; border:1px solid #4a362b; border-radius:12px; padding:0.75rem;}
</style>
"""


def render_app() -> None:
    st.markdown(CSS, unsafe_allow_html=True)
    st.title("Scrapcore")
    st.caption("Brutal salvage survival on a dead mechanical surface.")

    _top_controls()
    player = st.session_state.player
    tile = get_tile(st.session_state.world, st.session_state.position)

    _player_panel(player)
    _world_panel(tile)

    if st.session_state.encounter:
        _combat_panel()
    else:
        _exploration_controls(tile)

    _inventory_panel()
    _upgrade_panel()
    _log_panel()


def _top_controls() -> None:
    cols = st.columns(3)
    if cols[0].button("Save"):
        save_game()
        append_log("Saved current run to scrapcore_save.json.")
    if cols[1].button("Load"):
        if load_game():
            append_log("Loaded saved run.")
        else:
            append_log("No save file found.")
    if cols[2].button("Reset Run"):
        from game.state import init_game
        init_game(force_reset=True)


def _player_panel(player) -> None:
    stats = player.effective_stats()
    st.markdown('<div class="scrap-panel">', unsafe_allow_html=True)
    st.markdown('<div class="scrap-title">Unit Status</div>', unsafe_allow_html=True)
    st.write(f"**Integrity:** {player.current_integrity}/{player.base_stats['integrity']}  ")
    st.write(f"**Core:** {player.internal_health['core']}/10 | **Scrap:** {player.scrap} | **Level:** {player.level} | **XP:** {player.xp}")
    st.write(
        f"**Power:** {stats['power']} | **Armor:** {stats['armor']} | **Mobility:** {stats['mobility']} | "
        f"**Mass:** {stats['mass']} | **Core Stability:** {stats['core_stability']}"
    )
    st.write(f"**Weapon:** {player.weapon().name if player.weapon() else 'None'}")
    systems = ", ".join(f"{name}:{value}" for name, value in player.internal_health.items())
    st.caption(f"Internal systems — {systems}")
    st.markdown('</div>', unsafe_allow_html=True)


def _world_panel(tile) -> None:
    pos = st.session_state.position
    st.markdown('<div class="scrap-panel">', unsafe_allow_html=True)
    st.markdown('<div class="scrap-title">Surface Tile</div>', unsafe_allow_html=True)
    st.write(f"**Location:** ({pos[0]}, {pos[1]}) — **{tile.biome_name}**")
    st.write(tile.description)
    st.caption(f"Danger {tile.danger} | Scavenge available: {'Yes' if tile.scavenge_available else 'No'}")
    st.markdown('</div>', unsafe_allow_html=True)


def _exploration_controls(tile) -> None:
    st.markdown('<div class="scrap-panel">', unsafe_allow_html=True)
    st.markdown('<div class="scrap-title">Movement & Actions</div>', unsafe_allow_html=True)
    row1 = st.columns(3)
    if row1[1].button("Move Up"):
        _move_and_check("up")
    row2 = st.columns(3)
    if row2[0].button("Move Left"):
        _move_and_check("left")
    if row2[1].button("Scavenge"):
        _scavenge(tile)
    if row2[2].button("Move Right"):
        _move_and_check("right")
    row3 = st.columns(3)
    if row3[1].button("Move Down"):
        _move_and_check("down")
    st.markdown('</div>', unsafe_allow_html=True)


def _move_and_check(direction: str) -> None:
    st.session_state.position = move_position(st.session_state.position, direction)
    tile = get_tile(st.session_state.world, st.session_state.position)
    tile.visited = True
    append_log(f"Moved {direction} into {tile.biome_name}.")
    enemy = maybe_spawn_enemy(tile, st.session_state.rng)
    if enemy:
        from game.models import Encounter
        st.session_state.encounter = Encounter(enemy=enemy)
        append_log(f"Hostile contact: {enemy.name} emerges from the wreckage.")


def _scavenge(tile) -> None:
    if not tile.scavenge_available:
        append_log("This tile has already been stripped clean.")
        return
    scrap, parts, logs = scavenge_tile(tile.biome_key, st.session_state.rng)
    st.session_state.player.scrap += scrap
    st.session_state.player.inventory.extend(parts)
    tile.scavenge_available = False
    for message in logs:
        append_log(message)
    enemy = maybe_spawn_enemy(tile, st.session_state.rng)
    if enemy:
        from game.models import Encounter
        st.session_state.encounter = Encounter(enemy=enemy)
        append_log(f"Noise draws in a {enemy.name}.")


def _combat_panel() -> None:
    encounter = st.session_state.encounter
    enemy = encounter.enemy
    snap = combat_snapshot(st.session_state.player, enemy)
    st.markdown('<div class="scrap-panel">', unsafe_allow_html=True)
    st.markdown('<div class="scrap-title">Combat</div>', unsafe_allow_html=True)
    st.write(f"**Enemy:** {enemy.name} | **Distance:** {encounter.distance}")
    st.write(f"Your integrity {snap['player_integrity']} | Enemy integrity {snap['enemy_integrity']}")
    st.write(f"Your core {snap['player_core']}/10 | Enemy core {snap['enemy_core']}/10")
    c1, c2 = st.columns(2)
    if c1.button("Approach"):
        _combat_action("approach")
    if c2.button("Attack"):
        _combat_action("attack")
    c3, c4 = st.columns(2)
    if c3.button("Guard"):
        _combat_action("guard")
    if c4.button("Dodge"):
        _combat_action("dodge")
    st.markdown('</div>', unsafe_allow_html=True)


def _combat_action(action: str) -> None:
    encounter = st.session_state.encounter
    logs = perform_player_action(st.session_state.player, encounter, action, st.session_state.rng)
    for line in logs:
        append_log(line)
    if encounter.enemy.is_destroyed():
        drops = enemy_drops(encounter.enemy, st.session_state.rng, bias=enemy_bias(encounter.enemy.name))
        st.session_state.player.scrap += drops["scrap"]
        st.session_state.player.inventory.extend(drops["parts"])
        for line in grant_xp(st.session_state.player, 6 + encounter.enemy.level * 2):
            append_log(line)
        append_log(f"Salvaged {drops['scrap']} scrap from the wreck.")
        for part in drops["parts"]:
            append_log(f"Recovered enemy part: {part.name}.")
        st.session_state.encounter = None
    elif st.session_state.player.is_destroyed():
        append_log("Run terminated. Reset to deploy again.")


def _inventory_panel() -> None:
    player = st.session_state.player
    st.markdown('<div class="scrap-panel">', unsafe_allow_html=True)
    st.markdown('<div class="scrap-title">Inventory & Equipment</div>', unsafe_allow_html=True)
    equipped = {slot: part.name if part else '-' for slot, part in player.equipment.items()}
    st.write(" | ".join(f"**{slot}:** {name}" for slot, name in equipped.items()))
    if not player.inventory:
        st.caption("No spare parts in inventory.")
    else:
        labels = inventory_summary(player.inventory)
        selected = st.selectbox("Inventory parts", range(len(labels)), format_func=lambda idx: labels[idx])
        if st.button("Equip Selected Part"):
            try:
                append_log(equip_part(player, selected))
            except (IndexError, ValueError) as exc:
                append_log(f"Equip failed: {exc}")
    st.markdown('</div>', unsafe_allow_html=True)


def _upgrade_panel() -> None:
    player = st.session_state.player
    st.markdown('<div class="scrap-panel">', unsafe_allow_html=True)
    st.markdown('<div class="scrap-title">Workshop Upgrades</div>', unsafe_allow_html=True)
    for name, (cost, bonus) in UPGRADE_OPTIONS.items():
        st.write(f"**{name}** — cost {cost} scrap — bonuses {bonus}")
        if st.button(f"Install {name}"):
            ok, msg = apply_upgrade(player, name)
            append_log(msg)
    st.markdown('</div>', unsafe_allow_html=True)


def _log_panel() -> None:
    st.markdown('<div class="scrap-panel log-box">', unsafe_allow_html=True)
    st.markdown('<div class="scrap-title">Combat Log</div>', unsafe_allow_html=True)
    st.text("\n".join(st.session_state.log))
    st.markdown('</div>', unsafe_allow_html=True)
