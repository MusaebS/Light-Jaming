import { EnemyDef } from '@/lib/game/types/gameTypes';

export const ENEMIES: EnemyDef[] = [
  {
    id: 'vacuum-wolf',
    name: 'Vacuum Wolf',
    health: 20,
    speed: 90,
    contactDamage: 0.22,
    twist: 'Rushes toward dropped scrap piles first.'
  },
  {
    id: 'cutlery-spider',
    name: 'Cutlery Spider',
    health: 14,
    speed: 120,
    contactDamage: 0.22,
    twist: 'Zig-zags and pokes rapidly.'
  },
  {
    id: 'jealous-cart',
    name: 'Jealous Shopping Cart',
    health: 18,
    speed: 105,
    contactDamage: 0.22,
    twist: 'Snatches loot then flees.'
  },
  {
    id: 'repair-saint',
    name: 'Saintly Repair Drone',
    health: 16,
    speed: 70,
    contactDamage: 0.22,
    twist: 'Heals nearby enemies unless interrupted.'
  },
  {
    id: 'fridge-mimic',
    name: 'Fridge Mimic',
    health: 28,
    speed: 55,
    contactDamage: 0.22,
    twist: 'Disguises as container until approached.'
  },
  {
    id: 'cable-eel',
    name: 'Cable Eel',
    health: 15,
    speed: 125,
    contactDamage: 0.22,
    twist: 'Darts through powered surfaces.'
  }
];
