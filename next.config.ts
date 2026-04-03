import type { NextConfig } from 'next';

const assetMode = process.env.NEXT_PUBLIC_ASSET_MODE ?? 'auto';
const nodeEnv = process.env.NODE_ENV ?? 'development';

const usesInlineAssets =
  assetMode === 'inline' || (assetMode === 'auto' && nodeEnv !== 'production');

const buildCsp = (): string => {
  const imgAndMediaSrc = usesInlineAssets
    ? "'self' data: blob:"
    : "'self' blob:";

  const connectSrc =
    nodeEnv === 'development'
      ? "'self' ws: wss:"
      : "'self'";

  const scriptSrc =
    nodeEnv === 'development'
      ? "'self' 'unsafe-inline' 'unsafe-eval'"
      : "'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `connect-src ${connectSrc}`,
    `img-src ${imgAndMediaSrc}`,
    `media-src ${imgAndMediaSrc}`,
  ].join('; ');
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: buildCsp(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
