export interface PlayerTuning {
  moveSpeed: number;
  dashCost: number;
  dashImpulse: number;
  actionDamage: number;
  magnetRadius: number;
}

export function buildPlayerTuning(modules: string[]): PlayerTuning {
  const tuning: PlayerTuning = {
    moveSpeed: 150,
    dashCost: 18,
    dashImpulse: 260,
    actionDamage: 8,
    magnetRadius: 24
  };

  if (modules.includes('spider-legs')) {
    tuning.moveSpeed -= 12;
  }
  if (modules.includes('hover-fan')) {
    tuning.moveSpeed += 10;
  }
  if (modules.includes('scrap-compressor')) {
    tuning.moveSpeed -= 20;
  }
  if (modules.includes('arc-welder')) {
    tuning.actionDamage += 6;
  }
  if (modules.includes('magnet-pulse') || modules.includes('vacuum-funnel')) {
    tuning.magnetRadius += 48;
  }
  if (modules.includes('attracting-charm-field')) {
    tuning.magnetRadius += 70;
  }

  return tuning;
}
