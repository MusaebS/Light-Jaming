'use client';

import { GameBridge } from '@/lib/game/systems/gameBridge';

interface TouchControlsProps {
  bridge: GameBridge;
}

export function TouchControls({ bridge }: TouchControlsProps) {
  const emitControl = (control: 'up' | 'down' | 'left' | 'right', active: boolean): void => {
    bridge.emit('control', { control, active });
  };

  const bindHold = (control: 'up' | 'down' | 'left' | 'right') => ({
    onTouchStart: () => emitControl(control, true),
    onTouchEnd: () => emitControl(control, false),
    onTouchCancel: () => emitControl(control, false),
    onMouseDown: () => emitControl(control, true),
    onMouseUp: () => emitControl(control, false),
    onMouseLeave: () => emitControl(control, false)
  });

  const tap = (control: 'action' | 'dodge' | 'interact' | 'pause') => () => {
    bridge.emit('control', { control, active: true });
    setTimeout(() => bridge.emit('control', { control, active: false }), 40);
  };

  return (
    <div className="touch-wrap">
      <div className="touch-left">
        <button {...bindHold('up')} type="button">⬆ Move</button>
        <div>
          <button {...bindHold('left')} type="button">⬅ Move</button>
          <button {...bindHold('down')} type="button">⬇ Move</button>
          <button {...bindHold('right')} type="button">➡ Move</button>
        </div>
      </div>
      <div className="touch-right">
        <button onClick={tap('action')} type="button">⚔ Action</button>
        <button onClick={tap('dodge')} type="button">💨 Dodge</button>
        <button onClick={tap('interact')} type="button">✋ Interact</button>
        <button onClick={tap('pause')} type="button">⏸ Pause</button>
      </div>
    </div>
  );
}
