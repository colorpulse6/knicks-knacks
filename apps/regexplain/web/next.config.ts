import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Help prevent prerendering issues
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
  // Skip 404 prerendering which is causing issues
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
