import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack is stable and default in Next.js 16 — config moved to top level
  turbopack: {},

  // React Compiler is stable in Next.js 16 (not enabled by default)
  // reactCompiler: true,

  images: {
    // Use remotePatterns instead of deprecated images.domains
    remotePatterns: [],
  },
};

export default nextConfig;
