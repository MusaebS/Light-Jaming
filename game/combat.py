"""Turn-based combat routines for the Streamlit-friendly MVP."""

from __future__ import annotations

import random
from typing import Dict, List

from game import balance
from game.damage import apply_hit
from game.models import Encounter, Robot


def _attack_value(attacker: Robot, fallback_bonus: int = 0) -> int:
    stats = attacker.effective_stats()
    weapon = attacker.weapon()
    weapon_bonus = weapon.attack_bonus if weapon else fallback_bonus
    return balance.attack_power(stats["power"], stats["mass"], weapon_bonus)


def perform_player_action(player: Robot, encounter: Encounter, action: str, rng: random.Random) -> List[str]:
    logs: List[str] = []
    enemy = encounter.enemy

    if action == "approach":
        encounter.distance = max(0, encounter.distance - max(1, player.effective_stats()["mobility"] // 3))
        logs.append(f"You grind forward. Distance is now {encounter.distance}.")
    elif action == "guard":
        encounter.guard_active = True
        logs.append("You brace the chassis and guard against impact.")
    elif action == "dodge":
        encounter.guard_active = False
        encounter.distance = min(3, encounter.distance + 1)
        logs.append("You skid sideways across the debris.")
    elif action == "attack":
        if encounter.distance > 0:
            logs.append("Target is out of reach. Close the distance first.")
        else:
            outcome = apply_hit(enemy, _attack_value(player), rng)
            logs.append(f"You strike for {outcome['shell_damage']} shell damage.")
            if outcome["damaged_systems"]:
                logs.append(f"Internal hit: {', '.join(outcome['damaged_systems'])}.")
            if outcome["shutdown"]:
                logs.append(f"{enemy.name} shuts down in the dust.")
    else:
        logs.append("Action failed: unknown combat input.")

    if not enemy.is_destroyed():
        logs.extend(enemy_turn(player, encounter, rng))
    return logs


def enemy_turn(player: Robot, encounter: Encounter, rng: random.Random) -> List[str]:
    logs: List[str] = []
    enemy = encounter.enemy
    if encounter.distance > 0:
        encounter.distance = max(0, encounter.distance - max(1, enemy.effective_stats()["mobility"] // 4))
        logs.append(f"{enemy.name} lurches closer. Distance is now {encounter.distance}.")
        return logs

    outcome = apply_hit(player, _attack_value(enemy, fallback_bonus=2), rng, guarding=encounter.guard_active)
    logs.append(f"{enemy.name} crashes into you for {outcome['shell_damage']} shell damage.")
    if outcome["damaged_systems"]:
        logs.append(f"Your {', '.join(outcome['damaged_systems'])} takes internal damage.")
    if outcome["shutdown"]:
        logs.append("Your core fails and the unit shuts down.")
    encounter.guard_active = False
    return logs


def combat_snapshot(player: Robot, enemy: Robot) -> Dict[str, int]:
    return {
        "player_integrity": player.current_integrity,
        "enemy_integrity": enemy.current_integrity,
        "player_core": player.internal_health["core"],
        "enemy_core": enemy.internal_health["core"],
    }
