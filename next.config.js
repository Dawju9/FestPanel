/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  trailingSlash: true,
  generateEtags: true,
  compress: true,
  // Ensure node-only deps used at runtime are traced into the standalone build.
  // Without this, the standalone server can't resolve them via `require` /
  // `-r dotenv/config` because only deps imported from server code are traced.
  outputFileTracingIncludes: {
    '**': [
      './node_modules/dotenv/**',
      './node_modules/bcryptjs/**',
    ],
  },
  // Some pages (e.g. crawler control panel) live under src/pages/js/auth/...
  // which is supported by Next's Pages Router, but we explicitly mark the
  // directory as a page source to avoid any ambiguity.
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },
};

export default nextConfig;