'use client';

import { HudPayload } from '@/lib/game/systems/gameBridge';

interface HudOverlayProps {
  hud: HudPayload;
  prompt: string;
}

export function HudOverlay({ hud, prompt }: HudOverlayProps) {
  return (
    <div className="hud">
      <div>HP {hud.health}</div>
      <div>EN {hud.energy}</div>
      <div>Scrap {hud.scrap}</div>
      <div>Modules {hud.modules.length ? hud.modules.join(', ') : 'none'}</div>
      <div>Events {hud.eventName ?? 'none'}</div>
      <p>{prompt || hud.hint}</p>
    </div>
  );
}
