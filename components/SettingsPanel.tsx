'use client';

import { GameSettings } from '@/lib/game/types/gameTypes';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const toggleOptions = [
    {
      key: 'soundOn',
      label: 'Sound',
      checked: settings.soundOn
    },
    {
      key: 'reducedMotion',
      label: 'Reduced motion',
      checked: settings.reducedMotion
    },
    {
      key: 'reducedShake',
      label: 'Reduced screen shake',
      checked: settings.reducedShake
    }
  ] as const;

  return (
    <section className="panel">
      <h3>Comfort Settings</h3>
      <div className="settings-list">
        {toggleOptions.map((option) => (
          <label className="settings-option" key={option.key}>
            <input
              checked={option.checked}
              onChange={(event) => onChange({ ...settings, [option.key]: event.target.checked })}
              type="checkbox"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
