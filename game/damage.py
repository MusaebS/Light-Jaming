"""Internal damage resolution and resulting dysfunction effects."""

from __future__ import annotations

import random
from typing import Dict, List

from game import balance
from game.models import Robot
from game.utils import clamp, safe_choice

SYSTEM_EFFECTS = {
    "locomotion": ("mobility_penalty", 1),
    "actuator": ("power_penalty", 1),
    "stabilizer": ("armor_penalty", 1),
    "weapon_mount": ("power_penalty", 1),
    "core": ("core_flux", 1),
}


def apply_hit(defender: Robot, attack_value: int, rng: random.Random, guarding: bool = False) -> Dict[str, object]:
    """Apply armor and possible internal system damage for one heavy hit."""
    stats = defender.effective_stats()
    reduction = balance.armor_reduction(stats.get("armor", 0), stats.get("core_stability", 0), guarding)
    shell_damage = max(1, attack_value - reduction)
    defender.current_integrity = clamp(defender.current_integrity - shell_damage, 0, defender.base_stats["integrity"])

    penetrated = rng.random() < balance.penetration_chance(attack_value, reduction)
    damaged_systems: List[str] = []
    shutdown = False
    if penetrated:
        candidates = [name for name, health in defender.internal_health.items() if health > 0]
        if candidates:
            system = safe_choice(candidates, rng)
            internal_damage = balance.internal_damage_value(attack_value, reduction)
            defender.internal_health[system] = clamp(defender.internal_health[system] - internal_damage, 0, 10)
            damaged_systems.append(system)
            effect_key, effect_value = SYSTEM_EFFECTS[system]
            defender.status_effects[effect_key] = defender.status_effects.get(effect_key, 0) + effect_value
            shutdown = system == "core" and defender.internal_health[system] <= 0

    return {
        "shell_damage": shell_damage,
        "penetrated": penetrated,
        "damaged_systems": damaged_systems,
        "shutdown": shutdown or defender.is_destroyed(),
    }
