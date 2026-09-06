import type { NextConfig } from "next";

/** Project-site base path on GitHub Pages */
const basePath = "/kaoyan-politics-current-affairs";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
