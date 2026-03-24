import { UpgradeDef } from '@/lib/game/types/gameTypes';

export const UPGRADE_DEFS: UpgradeDef[] = [
  {
    id: 'magnet-pulse',
    name: 'Magnet Pulse',
    description: 'Pulls nearby loose scrap and tiny salvage.',
    category: 'utility',
    cost: 26,
    effectText: 'Auto-attracts pickups, but may drag hazards.'
  },
  {
    id: 'hover-fan',
    name: 'Hover Fan',
    description: 'Skims over sludge and conveyor belts briefly.',
    category: 'movement',
    cost: 30,
    effectText: 'Hold dodge to glide at the cost of energy.'
  },
  {
    id: 'drill-beak',
    name: 'Drill Beak',
    description: 'Cracks sealed caches and brittle walls.',
    category: 'tool',
    cost: 28,
    effectText: 'Unlocks sealed salvage points, adds noise.'
  },
  {
    id: 'shrine-bells',
    name: 'Shrine Bells',
    description: 'Resonant bells alter machine-creature behavior.',
    category: 'utility',
    cost: 22,
    effectText: 'Some enemies hesitate; drones become agitated.'
  },
  {
    id: 'echo-sensor',
    name: 'Echo Sensor',
    description: 'Pings hidden caches and side passages.',
    category: 'sensor',
    cost: 25,
    effectText: 'Highlights hidden loot pockets every 20s.'
  },
  {
    id: 'scrap-compressor',
    name: 'Scrap Compressor',
    description: 'Compacts haul for higher carry efficiency.',
    category: 'core',
    cost: 24,
    effectText: '+40% scrap value, reduced top speed.'
  },
  {
    id: 'spider-legs',
    name: 'Spider Legs',
    description: 'Stable movement through uneven cable gardens.',
    category: 'movement',
    cost: 29,
    effectText: 'Better terrain handling, lower dash length.'
  },
  {
    id: 'luck-engine',
    name: 'Luck Engine',
    description: 'Skews finds toward odd rarities.',
    category: 'core',
    cost: 34,
    effectText: 'More rare drops with harmless glitch flickers.'
  },
  {
    id: 'arc-welder',
    name: 'Arc Welder',
    description: 'High burst damage tool with overheat windows.',
    category: 'tool',
    cost: 31,
    effectText: 'Action hits harder; rapid use causes brief lockout.'
  },
  {
    id: 'vacuum-funnel',
    name: 'Vacuum Funnel',
    description: 'Excels at vacuuming loose debris.',
    category: 'utility',
    cost: 20,
    effectText: 'Large pickup radius, weak on heavy salvage nodes.'
  },
  {
    id: 'attracting-charm-field',
    name: 'Attracting Charm Field',
    description: 'Fusion module: magnetic hymn aura.',
    category: 'utility',
    cost: 0,
    effectText: 'Charm pulse that gathers loot and slows wolves.'
  },
  {
    id: 'secret-hunter-rig',
    name: 'Secret Hunter Rig',
    description: 'Fusion module: drilling sonar package.',
    category: 'sensor',
    cost: 0,
    effectText: 'Reveals hidden walls and opens them quickly.'
  }
];
