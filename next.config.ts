import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // For GitHub Pages, enable trailingSlash so files are served under repo path
  trailingSlash: true,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
