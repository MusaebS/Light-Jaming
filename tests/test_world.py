from game.world import generate_world, move_position


def test_world_generation_size():
    world = generate_world(42)
    assert len(world) == 25


def test_move_stays_in_bounds():
    assert move_position((0, 0), "left") == (0, 0)
    assert move_position((4, 4), "down") == (4, 4)
