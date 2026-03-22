"""Player progression, equipping, and upgrade actions."""

from __future__ import annotations

from typing import List, Tuple

from game import balance
from game.models import Part, Robot


UPGRADE_OPTIONS = {
    "Reinforced Plating": (8, {"armor": 1, "integrity": 3}),
    "Servo Tuning": (8, {"mobility": 1}),
    "Power Routing": (10, {"power": 1, "core_stability": 1}),
}


def grant_xp(player: Robot, amount: int) -> List[str]:
    logs = [f"Gained {amount} XP."]
    player.xp += amount
    while player.xp >= balance.xp_to_next_level(player.level):
        player.xp -= balance.xp_to_next_level(player.level)
        player.level += 1
        player.base_stats["integrity"] += 2
        player.current_integrity = min(player.current_integrity + 4, player.base_stats["integrity"])
        player.base_stats["core_stability"] += 1
        logs.append(f"Level up! Reached level {player.level}.")
    return logs


def equip_part(player: Robot, part_index: int) -> str:
    if part_index < 0 or part_index >= len(player.inventory):
        raise IndexError("Part index out of bounds.")
    part = player.inventory.pop(part_index)
    old = player.equipment.get(part.slot)
    player.equipment[part.slot] = part
    if old:
        player.inventory.append(old)
        return f"Equipped {part.name}. Stored {old.name} in inventory."
    return f"Equipped {part.name}."


def apply_upgrade(player: Robot, upgrade_name: str) -> Tuple[bool, str]:
    if upgrade_name not in UPGRADE_OPTIONS:
        return False, "Unknown upgrade."
    cost, bonuses = UPGRADE_OPTIONS[upgrade_name]
    if player.scrap < cost:
        return False, f"Need {cost} scrap for {upgrade_name}."
    player.scrap -= cost
    for stat, amount in bonuses.items():
        player.base_stats[stat] = player.base_stats.get(stat, 0) + amount
        if stat == "integrity":
            player.current_integrity += amount
    return True, f"Installed {upgrade_name}."


def inventory_summary(parts: List[Part]) -> List[str]:
    return [f"{part.name} ({part.slot})" for part in parts]
