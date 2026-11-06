import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // A self-contained server build for Docker — see Dockerfile and
  // docs/deployment.md. Deliberately leaves .next/static and public/
  // out of the bundle; the Dockerfile copies both in explicitly.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
