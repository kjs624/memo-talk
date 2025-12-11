import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable Turbopack to avoid UTF-8 bug with Korean characters in path
    turbo: undefined,
  },
};

export default nextConfig;
