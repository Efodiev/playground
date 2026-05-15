import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "21.0.4.70:3000",
    "21.0.4.70:81",
    "21.0.4.70",
  ],
};

export default nextConfig;
