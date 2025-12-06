import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly use webpack instead of Turbopack for production build
  bundler: 'webpack',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
