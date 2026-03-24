export interface RunEvent {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export const RUN_EVENTS: RunEvent[] = [
  {
    id: 'scrap-storm',
    name: 'Scrap Storm',
    description: 'Valuable debris rains down while enemies get bolder.',
    effect: '+pickup spawns, +enemy speed'
  },
  {
    id: 'glitch-bloom',
    name: 'Glitch Bloom',
    description: 'Duplicate pickups appear; fake ones dissolve on contact.',
    effect: 'extra pickups, minor duds'
  },
  {
    id: 'vending-oracle',
    name: 'Vending Oracle',
    description: 'One transparent trade appears: pay energy for relic odds.',
    effect: 'optional risk/reward offer'
  },
  {
    id: 'false-exit-door',
    name: 'False Exit Door',
    description: 'Leads either to a side cache or a short ambush room.',
    effect: 'branch choice'
  }
];
