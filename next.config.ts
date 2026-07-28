import type { NextConfig } from "next";

// R1 (stabilize fix-up): ignoreBuildErrors was previously `true`,
// silently shipping TS errors to production. Now flipped to `false`
// so `next build` enforces type safety at build time.
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "sonner",
    ],
  },
};

export default nextConfig;