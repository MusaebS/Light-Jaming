import random

from game.combat import perform_player_action
from game.constants import INTERNAL_SYSTEMS, STARTING_STATS
from game.models import Encounter, Robot
from game.state import create_player


def enemy_robot() -> Robot:
    return Robot(
        name="Test Enemy",
        base_stats={"integrity": 10, "mass": 2, "mobility": 2, "power": 2, "armor": 0, "core_stability": 1},
        current_integrity=10,
        internal_health=dict(INTERNAL_SYSTEMS),
        equipment={},
        status_effects={},
    )


def test_attack_requires_range():
    player = create_player()
    encounter = Encounter(enemy=enemy_robot(), distance=2)
    logs = perform_player_action(player, encounter, "attack", random.Random(1))
    assert any("out of reach" in line for line in logs)


def test_attack_deals_damage_at_zero_distance():
    player = create_player()
    encounter = Encounter(enemy=enemy_robot(), distance=0)
    perform_player_action(player, encounter, "attack", random.Random(2))
    assert encounter.enemy.current_integrity < encounter.enemy.base_stats["integrity"]
