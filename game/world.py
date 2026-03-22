"""World generation and exploration systems."""

from __future__ import annotations

import random
from typing import Dict, List, Tuple

from game.constants import ENEMY_ARCHETYPES, INTERNAL_SYSTEMS, WORLD_HEIGHT, WORLD_TILES, WORLD_WIDTH
from game.models import Robot, Tile
from game.utils import safe_choice, weighted_bool


def generate_world(seed: int) -> Dict[str, Tile]:
    rng = random.Random(seed)
    world: Dict[str, Tile] = {}
    for y in range(WORLD_HEIGHT):
        for x in range(WORLD_WIDTH):
            biome_key, biome_name, description = safe_choice(WORLD_TILES, rng)
            world[f"{x},{y}"] = Tile(
                x=x,
                y=y,
                biome_key=biome_key,
                biome_name=biome_name,
                description=description,
                scavenge_available=weighted_bool(0.9, rng),
                danger=1 + (abs(x - 2) + abs(y - 2)) // 2,
            )
    return world


def move_position(position: Tuple[int, int], direction: str) -> Tuple[int, int]:
    x, y = position
    deltas = {"up": (0, -1), "down": (0, 1), "left": (-1, 0), "right": (1, 0)}
    dx, dy = deltas.get(direction, (0, 0))
    nx = max(0, min(WORLD_WIDTH - 1, x + dx))
    ny = max(0, min(WORLD_HEIGHT - 1, y + dy))
    return nx, ny


def get_tile(world: Dict[str, Tile], position: Tuple[int, int]) -> Tile:
    key = f"{position[0]},{position[1]}"
    return world[key]


def maybe_spawn_enemy(tile: Tile, rng: random.Random) -> Robot | None:
    encounter_chance = min(0.75, 0.2 + tile.danger * 0.12)
    if not weighted_bool(encounter_chance, rng):
        return None
    archetype_key = safe_choice(list(ENEMY_ARCHETYPES), rng)
    data = ENEMY_ARCHETYPES[archetype_key]
    return Robot(
        name=data["name"],
        base_stats=dict(data["stats"]),
        current_integrity=data["stats"]["integrity"],
        internal_health=dict(INTERNAL_SYSTEMS),
        equipment={},
        status_effects={},
        level=max(1, tile.danger),
        xp=0,
        scrap=0,
        inventory=[],
    )


def enemy_bias(enemy_name: str) -> List[str]:
    for data in ENEMY_ARCHETYPES.values():
        if data["name"] == enemy_name:
            return list(data["loot_bias"])
    return []
