/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",  // For static export to GitHub Pages
  images: {
    unoptimized: true,  // For static export compatibility
  },
  basePath: process.env.NODE_ENV === "production" ? "/meliem.github.io" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/meliem.github.io/" : "",
};

module.exports = nextConfig;
