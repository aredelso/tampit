import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Dev-only: Next 16 blocks dev assets (JS, HMR) requested from origins not
  // listed here. Without 127.0.0.1 the page renders but never hydrates.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // Note: do not inline API_URL here. Next would copy the internal Docker URL
  // into the browser bundle. Server code reads process.env.API_URL at runtime.
  webpack(config) {
    config.resolve.alias['@shared'] = path.resolve(__dirname, '../shared');
    config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    return config;
  },
};

export default nextConfig;
