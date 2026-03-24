import { ZoneId } from '@/lib/game/types/gameTypes';

export interface ZoneDef {
  id: ZoneId;
  name: string;
  summary: string;
  gimmicks: string[];
  hazardColor: number;
  lootBias: number;
}

export const ZONES: ZoneDef[] = [
  {
    id: 'chrome-marsh',
    name: 'Chrome Marsh',
    summary: 'Reflective reeds, conductive puddles, mild hazards.',
    gimmicks: ['shallow oil-water', 'junk mounds', 'hidden caches'],
    hazardColor: 0x2f6678,
    lootBias: 1
  },
  {
    id: 'cathedral-toasters',
    name: 'Cathedral of Toasters',
    summary: 'Conveyor altars, heat vents, and sealed salvage vaults.',
    gimmicks: ['conveyor belts', 'shrine devices', 'narrow side rooms'],
    hazardColor: 0x8f4f1f,
    lootBias: 1.25
  }
];
