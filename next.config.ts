import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compression
  compress: true,
  // Image optimization
  images: {
    unoptimized: true, // Fast on Raspberry Pi
  },
  // Experimental optimizations
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Production settings
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  allowedDevOrigins: ["*"],
};

export default nextConfig;
