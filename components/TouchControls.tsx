'use client';

function holdKey(code: string, active: boolean): void {
  window.dispatchEvent(new KeyboardEvent(active ? 'keydown' : 'keyup', { code, bubbles: true }));
}

export function TouchControls(): JSX.Element {
  const bindHold = (code: string) => ({
    onTouchStart: () => holdKey(code, true),
    onTouchEnd: () => holdKey(code, false),
    onMouseDown: () => holdKey(code, true),
    onMouseUp: () => holdKey(code, false)
  });

  const tap = (code: string) => () => {
    holdKey(code, true);
    setTimeout(() => holdKey(code, false), 40);
  };

  return (
    <div className="touch-wrap">
      <div className="touch-left">
        <button {...bindHold('ArrowUp')} type="button">↑</button>
        <div>
          <button {...bindHold('ArrowLeft')} type="button">←</button>
          <button {...bindHold('ArrowDown')} type="button">↓</button>
          <button {...bindHold('ArrowRight')} type="button">→</button>
        </div>
      </div>
      <div className="touch-right">
        <button onClick={tap('Space')} type="button">Action</button>
        <button onClick={tap('ShiftLeft')} type="button">Dodge</button>
        <button onClick={tap('KeyE')} type="button">Interact</button>
      </div>
    </div>
  );
}
