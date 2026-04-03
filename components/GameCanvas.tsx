'use client';

import { useEffect, useRef, useState } from 'react';
import type { Game } from 'phaser';
import { createPhaserGame } from '@/lib/game/config/phaserConfig';
import { GameBridge, SessionConfig } from '@/lib/game/systems/gameBridge';

interface GameCanvasProps {
  bridge: GameBridge;
  session: SessionConfig;
}

export function GameCanvas({ bridge, session }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const initialSessionRef = useRef(session);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }
    try {
      gameRef.current = createPhaserGame(containerRef.current, bridge, initialSessionRef.current);
      setInitError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown canvas initialization failure.';
      console.error('[GameCanvas] Failed to initialize Phaser game', error);
      setInitError(message);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [bridge]);

  useEffect(() => {
    if (initError) return;
    bridge.emit('sessionUpdate', session);
  }, [bridge, session, initError]);

  if (initError) {
    return (
      <section className="panel panel-compact game-canvas-error" role="status">
        <h3>Renderer failed to start</h3>
        <p className="muted">
          Browser blocked game renderer startup. Open Settings and switch Render Mode from Auto to Mode C or Mode D, then start again.
        </p>
        <p className="muted">Details: {initError}</p>
      </section>
    );
  }

  return <div className="game-canvas" ref={containerRef} style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }} />;
}
