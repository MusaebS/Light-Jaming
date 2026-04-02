'use client';

import { HudPayload } from '@/lib/game/systems/gameBridge';

interface HudOverlayProps {
  hud: HudPayload;
  prompt: string;
}

export function HudOverlay({ hud, prompt }: HudOverlayProps) {
  const hpPercent = Math.max(0, Math.min(100, hud.health));
  const energyPercent = Math.max(0, Math.min(100, hud.energy));

  return (
    <div className="hud">
      <div className="hud-stat">
        <div className="hud-stat-head">
          <span className="hud-icon" aria-hidden>
            ❤️
          </span>
          <span>HP</span>
          <strong>{hud.health}</strong>
        </div>
        <div className="hud-bar">
          <span className="hud-fill hp" style={{ width: `${hpPercent}%` }} />
        </div>
      </div>
      <div className="hud-stat">
        <div className="hud-stat-head">
          <span className="hud-icon" aria-hidden>
            ⚡
          </span>
          <span>EN</span>
          <strong>{hud.energy}</strong>
        </div>
        <div className="hud-bar">
          <span className="hud-fill en" style={{ width: `${energyPercent}%` }} />
        </div>
      </div>
      <div>🧰 Scrap {hud.scrap}</div>
      <div>🧩 Modules {hud.modules.length ? hud.modules.join(', ') : 'none'}</div>
      <div>🌐 Event {hud.eventName ?? 'none'}</div>
      <p>{prompt || hud.hint}</p>
    </div>
  );
}
