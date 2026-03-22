"""Small utility helpers for safe randomization and serialization."""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any, Iterable, Sequence, TypeVar

T = TypeVar("T")


def clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(value, upper))


def safe_choice(items: Sequence[T], rng: random.Random) -> T:
    if not items:
        raise ValueError("Cannot choose from an empty sequence.")
    return rng.choice(list(items))


def weighted_bool(chance: float, rng: random.Random) -> bool:
    return rng.random() < max(0.0, min(1.0, chance))


def save_json(path: str | Path, payload: Any) -> None:
    Path(path).write_text(json.dumps(payload, indent=2), encoding="utf-8")


def load_json(path: str | Path) -> Any:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def lines(items: Iterable[str]) -> str:
    return "\n".join(str(item) for item in items)
