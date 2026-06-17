import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone to download JS bundles on local network
  // @ts-ignore - Next.js config types might not reflect this new dev option yet
  allowedDevOrigins: [
    "192.168.0.153", // The IP logged by your server
    "192.168.1.153",
    "localhost"
  ],
};

export default nextConfig;
