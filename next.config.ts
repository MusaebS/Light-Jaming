import type { NextConfig } from 'next';

type AssetMode = 'inline' | 'file' | 'auto';

const normalizeAssetMode = (value: string | undefined): AssetMode => {
  if (value === 'inline' || value === 'file' || value === 'auto') {
    return value;
  }

  return 'auto';
};

const resolveEffectiveAssetMode = (): AssetMode => {
  const configuredMode = normalizeAssetMode(process.env.NEXT_PUBLIC_ASSET_MODE);

  if (configuredMode !== 'auto') {
    return configuredMode;
  }

  return process.env.NODE_ENV === 'production' ? 'file' : 'inline';
};

const securityHeaders = () => {
  const effectiveAssetMode = resolveEffectiveAssetMode();
  const allowsInlineAssets = effectiveAssetMode === 'inline';

  const cspParts = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    allowsInlineAssets ? "img-src 'self' data: blob:" : "img-src 'self' blob:",
    allowsInlineAssets ? "media-src 'self' data: blob:" : "media-src 'self' blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return [
    {
      key: 'Content-Security-Policy',
      value: cspParts.join('; '),
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()'
    },
  ];
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders(),
      },
    ];
  },
};

export default nextConfig;
