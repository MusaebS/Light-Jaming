const svgDataUri = (svg: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const playerSheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" viewBox="0 0 128 32">
  <rect width="128" height="32" fill="#0e1622"/>
  <rect x="2" y="2" width="28" height="28" rx="7" fill="#4ee1cd" stroke="#d7fffa"/>
  <rect x="34" y="2" width="28" height="28" rx="7" fill="#5ffff0" stroke="#d7fffa"/>
  <rect x="66" y="2" width="28" height="28" rx="7" fill="#3cc0ab" stroke="#d7fffa"/>
  <rect x="98" y="2" width="28" height="28" rx="7" fill="#52d6c4" stroke="#d7fffa"/>
</svg>`;

const enemySheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" viewBox="0 0 128 32">
  <rect width="128" height="32" fill="#0f0f17"/>
  <rect x="2" y="4" width="28" height="24" rx="4" fill="#f0646e" stroke="#fff1f1"/>
  <rect x="34" y="4" width="28" height="24" rx="4" fill="#ff828c" stroke="#fff1f1"/>
  <rect x="66" y="4" width="28" height="24" rx="4" fill="#e65a64" stroke="#fff1f1"/>
  <rect x="98" y="4" width="28" height="24" rx="4" fill="#ff959d" stroke="#fff1f1"/>
</svg>`;

export const ASSETS = {
  spritesheets: {
    player: {
      key: 'player-sheet',
      source: svgDataUri(playerSheetSvg),
      frameConfig: { frameWidth: 32, frameHeight: 32 }
    },
    enemyCart: {
      key: 'enemy-cart-sheet',
      source: svgDataUri(enemySheetSvg),
      frameConfig: { frameWidth: 32, frameHeight: 32 }
    }
  },
  images: {
    arenaTile: {
      key: 'arena-tile',
      source: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#1a2435"/><path d="M0 16h64M0 32h64M0 48h64M16 0v64M32 0v64M48 0v64" stroke="#294563" stroke-opacity="0.45"/></svg>')
    },
    arenaBackground: {
      key: 'arena-bg',
      source: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="#111926"/><circle cx="8" cy="8" r="1.2" fill="#213349"/><circle cx="24" cy="24" r="1.2" fill="#213349"/></pattern></defs><rect width="256" height="256" fill="url(#p)"/></svg>')
    },
    scrap: {
      key: 'pickup-scrap',
      source: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="6" fill="#ffd166" stroke="#fff0c2"/></svg>')
    },
    junk: {
      key: 'prop-junk',
      source: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="32"><rect x="3" y="4" width="34" height="24" rx="4" fill="#8396a8" stroke="#d8ecff" stroke-opacity="0.5"/></svg>')
    },
    beacon: {
      key: 'prop-beacon',
      source: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28"><rect x="8" y="12" width="4" height="14" fill="#4f667f"/><circle cx="10" cy="9" r="5" fill="#63f7ff" fill-opacity="0.7"/></svg>')
    },
    uiHealth: {
      key: 'ui-health-icon',
      source: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M8 14s-6-3.7-6-7.9A3.4 3.4 0 0 1 8 4.5a3.4 3.4 0 0 1 6 1.6C14 10.3 8 14 8 14Z" fill="#f55"/></svg>')
    },
    uiEnergy: {
      key: 'ui-energy-icon',
      source: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M9 1 4 9h3l-1 6 6-8H9Z" fill="#6bc3ff"/></svg>')
    }
  },
  anims: {
    playerIdle: 'player-idle',
    playerWalk: 'player-walk',
    playerAction: 'player-action',
    enemyWalk: 'enemy-cart-walk'
  }
} as const;
