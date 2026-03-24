'use client';

import { GameSettings } from '@/lib/game/types/gameTypes';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps): JSX.Element {
  return (
    <section className="panel">
      <h3>Comfort Settings</h3>
      <label>
        <input
          checked={settings.soundOn}
          onChange={(event) => onChange({ ...settings, soundOn: event.target.checked })}
          type="checkbox"
        />
        Sound
      </label>
      <label>
        <input
          checked={settings.reducedMotion}
          onChange={(event) => onChange({ ...settings, reducedMotion: event.target.checked })}
          type="checkbox"
        />
        Reduced motion
      </label>
      <label>
        <input
          checked={settings.reducedShake}
          onChange={(event) => onChange({ ...settings, reducedShake: event.target.checked })}
          type="checkbox"
        />
        Reduced screen shake
      </label>
    </section>
  );
}
