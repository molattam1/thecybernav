import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.thecybernav.com",
        pathname: "/api/media/**",
      },
    ],
  },
};

export default nextConfig;
