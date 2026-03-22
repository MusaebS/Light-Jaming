from game.loot import build_part
from game.progression import apply_upgrade, equip_part
from game.state import create_player


def test_equip_part_swaps_into_slot():
    player = create_player()
    player.inventory.append(build_part("Hammer Arm"))
    message = equip_part(player, 0)
    assert "Equipped Hammer Arm" in message
    assert player.equipment["weapon"].name == "Hammer Arm"


def test_upgrade_consumes_scrap():
    player = create_player()
    player.scrap = 10
    ok, _ = apply_upgrade(player, "Servo Tuning")
    assert ok is True
    assert player.scrap == 2
    assert player.base_stats["mobility"] == 5
