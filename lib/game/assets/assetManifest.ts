const svgDataUri = (svg: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

type AssetMode = 'inline' | 'file' | 'auto';

type AssetEntry = {
  key: string;
  inlineSource?: string;
  fileSource?: string;
  // Legacy compatibility fields consumed by older scene/loader code.
  source: string;
  path: string;
};

type AssetResolveOptions = {
  mode?: AssetMode;
  nodeEnv?: string;
};

const normalizeAssetMode = (value?: string): AssetMode => {
  if (value === 'inline' || value === 'file' || value === 'auto') {
    return value;
  }
  return 'auto';
};

export const resolveAssetSource = (
  asset: Pick<AssetEntry, 'inlineSource' | 'fileSource'>,
  options?: AssetResolveOptions
): string => {
  const mode = normalizeAssetMode(options?.mode ?? process.env.NEXT_PUBLIC_ASSET_MODE);

  if (mode === 'inline') {
    return asset.inlineSource ?? asset.fileSource ?? '';
  }

  if (mode === 'file') {
    return asset.fileSource ?? asset.inlineSource ?? '';
  }

  const nodeEnv = options?.nodeEnv ?? process.env.NODE_ENV;
  const preferFile = nodeEnv === 'production';

  if (preferFile) {
    return asset.fileSource ?? asset.inlineSource ?? '';
  }

  // Development and test both prefer inline for convenience + deterministic test behavior.
  return asset.inlineSource ?? asset.fileSource ?? '';
};

const withResolvedSource = <T extends { key: string; inlineSource?: string; fileSource?: string }>(asset: T): T & AssetEntry => {
  const source = resolveAssetSource(asset);
  return {
    ...asset,
    source,
    path: source
  };
};

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
    player: withResolvedSource({
      key: 'player-sheet',
      inlineSource: svgDataUri(playerSheetSvg),
      fileSource: '/assets/player-sheet.svg',
    }),
    enemyCart: withResolvedSource({
      key: 'enemy-cart-sheet',
      inlineSource: svgDataUri(enemySheetSvg),
      fileSource: '/assets/enemy-cart-sheet.svg',
    })
  },
  images: {
    arenaTile: withResolvedSource({
      key: 'arena-tile',
      inlineSource: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#1a2435"/><path d="M0 16h64M0 32h64M0 48h64M16 0v64M32 0v64M48 0v64" stroke="#294563" stroke-opacity="0.45"/></svg>'),
      fileSource: '/assets/arena-tile.svg',
    }),
    arenaBackground: withResolvedSource({
      key: 'arena-bg',
      inlineSource: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="#111926"/><circle cx="8" cy="8" r="1.2" fill="#213349"/><circle cx="24" cy="24" r="1.2" fill="#213349"/></pattern></defs><rect width="256" height="256" fill="url(#p)"/></svg>'),
      fileSource: '/assets/arena-bg.svg',
    }),
    scrap: withResolvedSource({
      key: 'pickup-scrap',
      inlineSource: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="6" fill="#ffd166" stroke="#fff0c2"/></svg>'),
      fileSource: '/assets/pickup-scrap.svg',
    }),
    junk: withResolvedSource({
      key: 'prop-junk',
      inlineSource: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="32"><rect x="3" y="4" width="34" height="24" rx="4" fill="#8396a8" stroke="#d8ecff" stroke-opacity="0.5"/></svg>'),
      fileSource: '/assets/prop-junk.svg',
    }),
    beacon: withResolvedSource({
      key: 'prop-beacon',
      inlineSource: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28"><rect x="8" y="12" width="4" height="14" fill="#4f667f"/><circle cx="10" cy="9" r="5" fill="#63f7ff" fill-opacity="0.7"/></svg>'),
      fileSource: '/assets/prop-beacon.svg',
    }),
    uiHealth: withResolvedSource({
      key: 'ui-health-icon',
      inlineSource: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M8 14s-6-3.7-6-7.9A3.4 3.4 0 0 1 8 4.5a3.4 3.4 0 0 1 6 1.6C14 10.3 8 14 8 14Z" fill="#f55"/></svg>'),
      fileSource: '/assets/ui-health-icon.svg',
    }),
    uiEnergy: withResolvedSource({
      key: 'ui-energy-icon',
      inlineSource: svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M9 1 4 9h3l-1 6 6-8H9Z" fill="#6bc3ff"/></svg>'),
      fileSource: '/assets/ui-energy-icon.svg',
    })
  },
  anims: {
    playerIdle: 'player-idle',
    playerWalk: 'player-walk',
    playerAction: 'player-action',
    enemyWalk: 'enemy-cart-walk'
  }
} as const;

export const getAssetSource = (asset: Pick<AssetEntry, 'inlineSource' | 'fileSource' | 'source' | 'path'>): string => {
  const resolved = resolveAssetSource(asset);
  return resolved || asset.source || asset.path || '';
};
