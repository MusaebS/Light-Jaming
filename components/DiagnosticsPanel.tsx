'use client';

import { useMemo, useState } from 'react';

interface DiagnosticsPanelProps {
  lines: string[];
  onClear: () => void;
}

export function DiagnosticsPanel({ lines, onClear }: DiagnosticsPanelProps) {
  const [copyHint, setCopyHint] = useState('');
  const output = useMemo(() => lines.join('\n'), [lines]);

  const copyLogs = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(output);
      setCopyHint('Copied diagnostics to clipboard.');
    } catch {
      setCopyHint('Copy failed. Select the text and copy manually.');
    }
  };

  return (
    <section className="panel panel-compact">
      <h3>Diagnostics</h3>
      <p className="muted">Copy and paste this into chat so I can trace route/load failures exactly.</p>
      <textarea
        aria-label="Runtime diagnostics log"
        readOnly
        rows={10}
        value={output}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
      />
      <div className="inline-tools" style={{ marginTop: 8 }}>
        <button onClick={copyLogs} type="button">📋 Copy Logs</button>
        <button onClick={onClear} type="button">🧹 Clear</button>
      </div>
      {copyHint && <p className="muted">{copyHint}</p>}
    </section>
  );
}
