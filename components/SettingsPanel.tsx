'use client';

import { GameSettings } from '@/lib/game/types/gameTypes';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
}

const SHOW_DEV_RENDER_MODE = process.env.NODE_ENV !== 'production';

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

      {SHOW_DEV_RENDER_MODE && (
        <div className="settings-list" style={{ marginTop: 12 }}>
          <label className="settings-option" htmlFor="render-mode-select">
            <span>Render mode (dev)</span>
          </label>
          <select
            id="render-mode-select"
            onChange={(event) => onChange({ ...settings, renderMode: event.target.value as GameSettings['renderMode'] })}
            value={settings.renderMode}
          >
            <option value="auto">Auto (highest viable)</option>
            <option value="mode-a">Mode A · Asset textures</option>
            <option value="mode-b">Mode B · Generated textures</option>
            <option value="mode-c">Mode C · Primitive-only</option>
            <option value="mode-d">Mode D · High-contrast fallback</option>
          </select>
        </div>
      )}
    </section>
  );
}
