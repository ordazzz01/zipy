import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Valores por defecto para entorno demo local
  // Sobrescribir con .env.local para desarrollo real
  env: {
    NEXT_PUBLIC_USE_DEMO: 'true',
    NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099',
    NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST: 'localhost:8080',
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],

  // eslint-disable-next-line @typescript-eslint/require-await
  redirects: async () => [],
};

export default nextConfig;
