"""Session-state orchestration and persistence helpers."""

from __future__ import annotations

import random
from typing import Dict, List

from game.constants import BASE_WEAPON, BASE_WEAPON_PROFILE, INTERNAL_SYSTEMS, MAX_LOG_LINES, PLAYER_NAME, SAVE_FILE, STARTING_SCRAP, STARTING_STATS, STARTING_TILE
from game.models import Part, Robot, Tile
from game.utils import load_json, save_json
from game.world import generate_world


def create_player() -> Robot:
    fists = Part(name=BASE_WEAPON, **BASE_WEAPON_PROFILE)
    return Robot(
        name=PLAYER_NAME,
        base_stats=dict(STARTING_STATS),
        current_integrity=STARTING_STATS["integrity"],
        internal_health=dict(INTERNAL_SYSTEMS),
        equipment={"weapon": fists, "armor": None, "chassis": None, "core": None, "legs": None},
        status_effects={},
        scrap=STARTING_SCRAP,
        inventory=[],
    )


def _session_state():
    import streamlit as st
    return st.session_state


def append_log(message: str) -> None:
    session = _session_state()
    log: List[str] = session.setdefault("log", [])
    log.append(message)
    session.log = log[-MAX_LOG_LINES:]


def init_game(force_reset: bool = False) -> None:
    session = _session_state()
    if session.get("game_initialized") and not force_reset:
        return
    seed = random.randint(1, 999999)
    session.game_initialized = True
    session.seed = seed
    session.rng = random.Random(seed)
    session.player = create_player()
    session.world = generate_world(seed)
    session.position = STARTING_TILE
    session.encounter = None
    session.log = ["Scrapcore boot sequence complete."]
    session.screen = "explore"


def serialize_world(world: Dict[str, Tile]) -> Dict[str, dict]:
    return {key: tile.to_dict() for key, tile in world.items()}


def deserialize_part(payload: dict | None) -> Part | None:
    if not payload:
        return None
    return Part(**payload)


def deserialize_robot(payload: dict) -> Robot:
    equipment = {slot: deserialize_part(part) for slot, part in payload["equipment"].items()}
    inventory = [Part(**part) for part in payload["inventory"]]
    return Robot(
        name=payload["name"],
        base_stats=payload["base_stats"],
        current_integrity=payload["current_integrity"],
        internal_health=payload["internal_health"],
        equipment=equipment,
        status_effects=payload["status_effects"],
        scrap=payload["scrap"],
        inventory=inventory,
        xp=payload.get("xp", 0),
        level=payload.get("level", 1),
    )


def save_game(path: str = SAVE_FILE) -> None:
    session = _session_state()
    payload = {
        "seed": session.seed,
        "player": session.player.to_dict(),
        "world": serialize_world(session.world),
        "position": session.position,
        "log": session.log,
        "screen": session.screen,
    }
    save_json(path, payload)


def load_game(path: str = SAVE_FILE) -> bool:
    try:
        payload = load_json(path)
    except FileNotFoundError:
        return False
    session = _session_state()
    session.game_initialized = True
    session.seed = payload["seed"]
    session.rng = random.Random(payload["seed"])
    session.player = deserialize_robot(payload["player"])
    session.world = {key: Tile(**tile) for key, tile in payload["world"].items()}
    session.position = tuple(payload["position"])
    session.log = payload["log"]
    session.screen = payload.get("screen", "explore")
    session.encounter = None
    return True
