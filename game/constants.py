"""Static configuration values for Scrapcore."""

from __future__ import annotations

WORLD_WIDTH = 5
WORLD_HEIGHT = 5
MAX_LOG_LINES = 14
SAVE_FILE = "scrapcore_save.json"

PLAYER_NAME = "Scrap Unit"
STARTING_TILE = (2, 2)
STARTING_SCRAP = 8
STARTING_INTEGRITY = 28
STARTING_STATS = {
    "integrity": STARTING_INTEGRITY,
    "mass": 4,
    "mobility": 4,
    "power": 4,
    "armor": 2,
    "core_stability": 5,
}

INTERNAL_SYSTEMS = {
    "core": 10,
    "locomotion": 10,
    "actuator": 10,
    "weapon_mount": 10,
    "stabilizer": 10,
}

BASE_WEAPON = "Reinforced Fists"
BASE_WEAPON_PROFILE = {
    "slot": "weapon",
    "stat_bonuses": {"power": 0},
    "attack_bonus": 0,
    "armor_bonus": 0,
    "scrap_value": 0,
    "description": "Blunt, brutal, and always available.",
}

SCAVENGE_REWARDS = {
    "scrap_field": {"scrap": (3, 7), "part_chance": 0.35},
    "wreck_zone": {"scrap": (2, 5), "part_chance": 0.55},
    "dead_factory": {"scrap": (4, 8), "part_chance": 0.45},
    "ash_dunes": {"scrap": (1, 4), "part_chance": 0.20},
}

PART_CATALOG = {
    "Patch Armor": {
        "slot": "armor",
        "stat_bonuses": {"armor": 2, "mass": 1},
        "attack_bonus": 0,
        "armor_bonus": 1,
        "scrap_value": 7,
        "description": "Layered plate salvaged from collapsed loaders.",
    },
    "Servo Braces": {
        "slot": "chassis",
        "stat_bonuses": {"mobility": 1, "core_stability": 1},
        "attack_bonus": 0,
        "armor_bonus": 0,
        "scrap_value": 6,
        "description": "Helps legs stay aligned on broken ground.",
    },
    "Hammer Arm": {
        "slot": "weapon",
        "stat_bonuses": {"power": 2, "mass": 1},
        "attack_bonus": 4,
        "armor_bonus": 0,
        "scrap_value": 10,
        "description": "A piston hammer built for crushing shells.",
    },
    "Rotary Cleaver": {
        "slot": "weapon",
        "stat_bonuses": {"power": 1, "mobility": 1},
        "attack_bonus": 3,
        "armor_bonus": 0,
        "scrap_value": 9,
        "description": "Jagged industrial blade with ugly torque.",
    },
    "Core Baffle": {
        "slot": "core",
        "stat_bonuses": {"core_stability": 2, "armor": 1},
        "attack_bonus": 0,
        "armor_bonus": 1,
        "scrap_value": 8,
        "description": "Crude shielding that keeps the core from rattling apart.",
    },
    "Tracked Greaves": {
        "slot": "legs",
        "stat_bonuses": {"mobility": 2, "mass": 1},
        "attack_bonus": 0,
        "armor_bonus": 0,
        "scrap_value": 8,
        "description": "Repurposed haul-track segments for rough mobility.",
    },
}

ENEMY_ARCHETYPES = {
    "light_scavenger": {
        "name": "Light Scavenger",
        "stats": {"integrity": 16, "mass": 3, "mobility": 6, "power": 3, "armor": 1, "core_stability": 3},
        "weapon": "Hook Claw",
        "weapon_bonus": 2,
        "armor_bonus": 0,
        "loot_bias": ["Servo Braces", "Tracked Greaves"],
    },
    "heavy_bruiser": {
        "name": "Heavy Bruiser",
        "stats": {"integrity": 24, "mass": 7, "mobility": 2, "power": 6, "armor": 3, "core_stability": 4},
        "weapon": "Crusher Ram",
        "weapon_bonus": 4,
        "armor_bonus": 1,
        "loot_bias": ["Patch Armor", "Hammer Arm"],
    },
    "fast_striker": {
        "name": "Fast Striker",
        "stats": {"integrity": 18, "mass": 3, "mobility": 7, "power": 4, "armor": 1, "core_stability": 3},
        "weapon": "Chain Lash",
        "weapon_bonus": 3,
        "armor_bonus": 0,
        "loot_bias": ["Rotary Cleaver", "Servo Braces"],
    },
    "armored_defender": {
        "name": "Armored Defender",
        "stats": {"integrity": 22, "mass": 6, "mobility": 3, "power": 4, "armor": 5, "core_stability": 5},
        "weapon": "Tower Hook",
        "weapon_bonus": 2,
        "armor_bonus": 2,
        "loot_bias": ["Core Baffle", "Patch Armor"],
    },
}

WORLD_TILES = [
    ("scrap_field", "Scrap Field", "Shredded plating and exposed conduits litter the dust."),
    ("wreck_zone", "Wreck Zone", "Stacked carcasses of failed machines form razor alleys."),
    ("dead_factory", "Dead Factory", "A silent industrial skeleton with jammed cranes and cold furnaces."),
    ("ash_dunes", "Ash Dunes", "Powdery soot hides buried scrap and unstable footing."),
]
