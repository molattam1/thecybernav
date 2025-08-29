import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/api/media/**", // 👈 match what Payload actually returns
      },
    ],
  },
};

export default nextConfig;
