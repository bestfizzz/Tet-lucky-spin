import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  compiler: {
    removeConsole: {
      exclude: ['error'], // giữ lại console.error
    },
  },
};

export default nextConfig;
