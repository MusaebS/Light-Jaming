"""Loot table helpers for salvage, enemy drops, and part construction."""

from __future__ import annotations

import random
from typing import Dict, List, Tuple

from game.constants import PART_CATALOG, SCAVENGE_REWARDS
from game.models import Part, Robot
from game.utils import safe_choice, weighted_bool


def build_part(name: str) -> Part:
    data = PART_CATALOG[name]
    return Part(name=name, **data)


def random_part(rng: random.Random, bias: List[str] | None = None) -> Part:
    names = list(PART_CATALOG)
    if bias and weighted_bool(0.6, rng):
        return build_part(safe_choice(bias, rng))
    return build_part(safe_choice(names, rng))


def scavenge_tile(biome_key: str, rng: random.Random) -> Tuple[int, List[Part], List[str]]:
    rewards = SCAVENGE_REWARDS[biome_key]
    scrap = rng.randint(*rewards["scrap"])
    parts: List[Part] = []
    log = [f"Recovered {scrap} scrap from the {biome_key.replace('_', ' ')}."]
    if weighted_bool(rewards["part_chance"], rng):
        part = random_part(rng)
        parts.append(part)
        log.append(f"Found part: {part.name}.")
    return scrap, parts, log


def enemy_drops(enemy: Robot, rng: random.Random, bias: List[str] | None = None) -> Dict[str, object]:
    scrap = rng.randint(4, 10) + enemy.level
    parts = [random_part(rng, bias=bias)] if weighted_bool(0.7, rng) else []
    return {"scrap": scrap, "parts": parts}
