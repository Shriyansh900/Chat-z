import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack is stable and default in Next.js 16 — config moved to top level
  turbopack: {},

  // React Compiler is stable in Next.js 16 (not enabled by default)
  // reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
};

export default nextConfig;
