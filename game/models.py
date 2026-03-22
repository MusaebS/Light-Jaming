"""Data models used by the Scrapcore game logic."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Dict, List, Optional, Tuple


@dataclass
class Part:
    """A modular robot part or heavy tool."""

    name: str
    slot: str
    stat_bonuses: Dict[str, int]
    attack_bonus: int = 0
    armor_bonus: int = 0
    scrap_value: int = 0
    description: str = ""

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class Robot:
    """Runtime representation of a robot unit."""

    name: str
    base_stats: Dict[str, int]
    current_integrity: int
    internal_health: Dict[str, int]
    equipment: Dict[str, Optional[Part]] = field(default_factory=dict)
    status_effects: Dict[str, int] = field(default_factory=dict)
    scrap: int = 0
    inventory: List[Part] = field(default_factory=list)
    xp: int = 0
    level: int = 1

    def effective_stats(self) -> Dict[str, int]:
        stats = dict(self.base_stats)
        for part in self.equipment.values():
            if not part:
                continue
            for key, value in part.stat_bonuses.items():
                stats[key] = stats.get(key, 0) + value
        stats["mobility"] = max(1, stats.get("mobility", 1) - self.status_effects.get("mobility_penalty", 0))
        stats["power"] = max(1, stats.get("power", 1) - self.status_effects.get("power_penalty", 0))
        stats["armor"] = max(0, stats.get("armor", 0) - self.status_effects.get("armor_penalty", 0))
        return stats

    def weapon(self) -> Optional[Part]:
        return self.equipment.get("weapon")

    def is_destroyed(self) -> bool:
        return self.current_integrity <= 0 or self.internal_health.get("core", 1) <= 0

    def to_dict(self) -> Dict[str, object]:
        return {
            "name": self.name,
            "base_stats": self.base_stats,
            "current_integrity": self.current_integrity,
            "internal_health": self.internal_health,
            "equipment": {slot: part.to_dict() if part else None for slot, part in self.equipment.items()},
            "status_effects": self.status_effects,
            "scrap": self.scrap,
            "inventory": [part.to_dict() for part in self.inventory],
            "xp": self.xp,
            "level": self.level,
        }


@dataclass
class Tile:
    """A world tile that can be explored and scavenged."""

    x: int
    y: int
    biome_key: str
    biome_name: str
    description: str
    scavenge_available: bool = True
    danger: int = 1
    visited: bool = False

    def coord(self) -> Tuple[int, int]:
        return (self.x, self.y)

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class Encounter:
    """Transient encounter state."""

    enemy: Robot
    distance: int = 2
    guard_active: bool = False
    last_action: str = "Enemy detected."
