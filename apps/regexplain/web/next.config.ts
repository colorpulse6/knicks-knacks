import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Help prevent prerendering issues
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
