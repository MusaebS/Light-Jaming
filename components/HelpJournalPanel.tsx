'use client';

export function HelpJournalPanel() {
  return (
    <section className="panel help-journal">
      <details>
        <summary>📔 Help / Journal</summary>
        <div className="help-body">
          <h3>Design Summary</h3>
          <ul>
            <li>Core loop: workshop → run → risk decisions → retreat → upgrade/fusion → rerun.</li>
            <li>Motivation pillars: autonomy, competence, world connection, flow, and player respect.</li>
            <li>Controls: desktop (WASD/Arrows + Space/Shift/E/Esc), mobile touch pad + action buttons.</li>
            <li>Architecture: Next.js shell/UI, Phaser scene gameplay, event bridge, localStorage saves.</li>
            <li>MVP scope: 2 zones, 10 upgrades + 2 fusions, 6 enemies, merchant + rival flavor, compact meta-progression.</li>
          </ul>

          <h3>Onboarding</h3>
          <ol>
            <li>Move immediately and collect glowing scrap.</li>
            <li>Use Action to fend off enemies and Dodge to escape pressure.</li>
            <li>Retreat any time (Esc on desktop, Interact near extraction corner).</li>
            <li>Spend scrap on modules and try a new build next run.</li>
          </ol>

          <h3>Zone Notes</h3>
          <p className="muted">Chrome Marsh: gentle hazards, destructible junk mounds, and beginner-friendly routes.</p>
          <p className="muted">Cathedral of Toasters: tighter routes, hotter vents, and richer salvage if you can handle pressure.</p>
        </div>
      </details>
    </section>
  );
}
