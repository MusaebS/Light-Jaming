"""Combat and progression formulas kept separate for easy tuning."""

from __future__ import annotations

from game.utils import clamp


def attack_power(power: int, mass: int, weapon_bonus: int) -> int:
    return max(1, power * 2 + mass + weapon_bonus)


def armor_reduction(armor: int, stability: int, guarding: bool = False) -> int:
    bonus = 2 if guarding else 0
    return max(0, armor + stability // 2 + bonus)


def penetration_chance(attack_value: int, reduction: int) -> float:
    raw = 0.25 + (attack_value - reduction) * 0.04
    return clamp(int(raw * 100), 10, 80) / 100


def internal_damage_value(attack_value: int, reduction: int) -> int:
    return max(1, (attack_value - reduction) // 3 + 1)


def xp_to_next_level(level: int) -> int:
    return 12 + level * 5
