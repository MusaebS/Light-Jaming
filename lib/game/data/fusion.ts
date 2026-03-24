import { FusionRecipe } from '@/lib/game/types/gameTypes';

export const FUSION_RECIPES: FusionRecipe[] = [
  {
    id: 'magnet-bell',
    parts: ['magnet-pulse', 'shrine-bells'],
    resultUpgradeId: 'attracting-charm-field',
    flavor: 'The workshop hum turns magnetic and oddly gentle.'
  },
  {
    id: 'drill-echo',
    parts: ['drill-beak', 'echo-sensor'],
    resultUpgradeId: 'secret-hunter-rig',
    flavor: 'A whistling drill rig with sonar chirps.'
  }
];
