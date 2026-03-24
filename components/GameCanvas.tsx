'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { createPhaserGame } from '@/lib/game/config/phaserConfig';
import { GameBridge, SessionConfig } from '@/lib/game/systems/gameBridge';

interface GameCanvasProps {
  bridge: GameBridge;
  session: SessionConfig;
}

export function GameCanvas({ bridge, session }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }
    gameRef.current = createPhaserGame(containerRef.current, bridge, session);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [bridge, session]);

  return <div ref={containerRef} style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }} />;
}
