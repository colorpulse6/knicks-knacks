/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Help prevent prerendering issues
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
  // Disable static generation for error pages to prevent SSR issues
  output: "standalone",
  trailingSlash: false,
  // Ensure proper handling of client-side code during build
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
